/**
 * Media library data access (browser side).
 *
 * Uploads, lists, edits, and permanently deletes assets in the public `media`
 * Storage bucket and the `media_assets` table. Runs through the browser
 * Supabase client so uploads stream directly from the user's session — RLS
 * (public read, staff-only write) enforces permissions server-side.
 */
import { createClient } from '@/lib/supabase/browser';
import type { Tables } from '@/types/database.types';
import {
  MEDIA_BUCKET,
  MEDIA_PAGE_SIZE,
  type MediaAsset,
  type MediaListParams,
  type MediaListResult
} from './types';

type MediaRow = Tables<'media_assets'>;

function toAsset(row: MediaRow): MediaAsset {
  return {
    id: row.id,
    bucket: row.bucket,
    path: row.path,
    url: row.url,
    title: row.title,
    alt: row.alt,
    caption: row.caption,
    createdAt: row.created_at
  };
}

/** Builds a stable, collision-resistant object path: `YYYY/MM/<uuid>.<ext>`. */
function buildPath(file: File): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const ext = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : 'bin';
  const id = crypto.randomUUID();
  return `${year}/${month}/${id}.${ext}`;
}

/** Default alt text derived from the original file name (sans extension). */
function altFromName(file: File): string {
  return file.name
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function listMedia(params: MediaListParams = {}): Promise<MediaListResult> {
  const supabase = createClient();
  const page = Math.max(1, params.page ?? 1);
  const pageSize = params.pageSize ?? MEDIA_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('media_assets')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  const search = params.search?.trim();
  if (search) {
    query = query.or(
      `title.ilike.%${search}%,alt.ilike.%${search}%,caption.ilike.%${search}%,path.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  return {
    items: (data ?? []).map(toAsset),
    total: count ?? 0
  };
}

export async function getMediaByIds(ids: string[]): Promise<MediaAsset[]> {
  if (ids.length === 0) return [];
  const supabase = createClient();
  const { data, error } = await supabase.from('media_assets').select('*').in('id', ids);
  if (error) throw new Error(error.message);

  const byId = new Map((data ?? []).map((row) => [row.id, toAsset(row)]));
  // Preserve the caller's ordering.
  return ids.map((id) => byId.get(id)).filter((asset): asset is MediaAsset => Boolean(asset));
}

async function optimizePhoto(original: File): Promise<File> {
  if (original.type !== 'image/jpeg' || typeof createImageBitmap !== 'function') return original;
  let bitmap: ImageBitmap | undefined;
  try {
    bitmap = await createImageBitmap(original);
    const scale = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    if (!context) return original;
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', 0.83)
    );
    if (!blob || blob.type !== 'image/webp' || blob.size >= original.size) return original;
    return new File([blob], original.name.replace(/\.[^.]+$/, '') + '.webp', { type: blob.type });
  } catch {
    return original;
  } finally {
    bitmap?.close();
  }
}

async function mediaIdForFile(file: File): Promise<string> {
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', await file.arrayBuffer()));
  // A UUIDv8 derived from the original bytes makes retries and concurrent uploads converge.
  digest[6] = (digest[6] & 0x0f) | 0x80;
  digest[8] = (digest[8] & 0x3f) | 0x80;
  const hex = Array.from(digest.slice(0, 16), (byte) => byte.toString(16).padStart(2, '0')).join(
    ''
  );
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20)
  ].join('-');
}

export async function uploadMediaFile(original: File): Promise<MediaAsset> {
  const supabase = createClient();
  const id = await mediaIdForFile(original);
  const existingAsset = () => supabase.from('media_assets').select('*').eq('id', id).maybeSingle();
  const existing = await existingAsset();
  if (existing.error) throw new Error(existing.error.message);
  if (existing.data) return toAsset(existing.data);
  const file = await optimizePhoto(original);
  const path = buildPath(file);

  const { error: uploadError } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { cacheControl: '31536000', upsert: false, contentType: file.type });
  if (uploadError) throw new Error(uploadError.message);

  const { data: publicUrl } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  const { data: auth } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('media_assets')
    .insert({
      id,
      bucket: MEDIA_BUCKET,
      path,
      url: publicUrl.publicUrl,
      title: altFromName(file),
      alt: altFromName(file),
      created_by: auth.user?.id ?? null
    })
    .select('*')
    .single();

  if (error) {
    // Resolve an ambiguous insert response before removing the newly uploaded object.
    const winner = await existingAsset();
    if (winner.error) throw new Error(winner.error.message);
    if (winner.data?.path !== path) {
      const cleanup = await supabase.storage.from(MEDIA_BUCKET).remove([path]);
      if (cleanup.error) throw new Error(cleanup.error.message);
    }
    if (winner.data) return toAsset(winner.data);
    throw new Error(error.message);
  }

  return toAsset(data);
}

export async function updateMediaAsset(
  id: string,
  patch: { title?: string; alt?: string; caption?: string }
): Promise<MediaAsset> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('media_assets')
    .update({ title: patch.title ?? null, alt: patch.alt ?? null, caption: patch.caption ?? null })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return toAsset(data);
}

/** Permanently removes the row and its Storage object. Irreversible. */
export async function deleteMediaAsset(asset: Pick<MediaAsset, 'id' | 'path'>): Promise<void> {
  const supabase = createClient();

  // Delete the row first: any OG-image references are cleared via ON DELETE SET
  // NULL. Removing the object first would orphan the row (and break its URL) if
  // the row delete failed for any reason.
  const { error } = await supabase.from('media_assets').delete().eq('id', asset.id);
  if (error) throw new Error(error.message);

  const { error: storageError } = await supabase.storage.from(MEDIA_BUCKET).remove([asset.path]);
  if (storageError) throw new Error(storageError.message);
}
