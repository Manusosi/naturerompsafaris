import paths from './catalog-image-paths.json';

const thumbnails: Record<string, string> = paths;

export function catalogImageUrl(original: string) {
  const marker = '/storage/v1/object/public/media/';
  const index = original.indexOf(marker);
  if (index < 0) return original;
  const filename = thumbnails[original.slice(index + marker.length)];
  return filename ? `/images/catalog/${filename}` : original;
}
