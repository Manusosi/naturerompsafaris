import { unstable_cache } from 'next/cache';
import { safariMarkets } from '@/lib/public/safari-markets';
import type { SupabaseClient } from '@supabase/supabase-js';

import { isPublicLocale, PUBLIC_LOCALES } from '@/lib/i18n';
import { createEnquiryPublicClient } from '@/lib/supabase/service-role';

export type SitemapUrlEntry = {
  lastModified?: Date;
  path: string;
};

export type SitemapFileEntry = {
  lastModified?: Date;
  name: string;
};

type TranslationRow = {
  locale: string;
  published_at: string | null;
  slug: string;
  updated_at: string | null;
};

/** Content sections; each name is both the public URL prefix and the sitemap file name. */
export const SITEMAP_SECTIONS = [
  'tours',
  'safari-packages',
  'destinations',
  'national-parks',
  'experiences',
  'accommodations',
  'our-fleet',
  'blog'
] as const;

export type SitemapSection = (typeof SITEMAP_SECTIONS)[number];

export const PAGES_SITEMAP = 'pages';

const ALWAYS_LISTED_PATHS = [
  '',
  'our-fleet',
  ...Object.keys(safariMarkets).map((market) => `safaris/${market}`),
  'about',
  'contact',
  'privacy-policy',
  'cookie-policy',
  'terms-conditions',
  'payment-terms',
  'service-level-agreement'
];

export function sitemapFilePath(name: string) {
  return `/sitemap-${name}.xml`;
}

export function isSitemapSection(name: string): name is SitemapSection {
  return (SITEMAP_SECTIONS as readonly string[]).includes(name);
}

function sitemapClient() {
  return createEnquiryPublicClient() as unknown as SupabaseClient;
}

function parseDate(value: string | null | undefined): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function mapRows(data: unknown): TranslationRow[] {
  if (!Array.isArray(data)) return [];
  return data.map((row) => {
    const record = row as Record<string, unknown>;
    return {
      locale: record.locale as string,
      published_at: record.published_at as string | null,
      slug: record.slug as string,
      updated_at: record.updated_at as string | null
    };
  });
}

async function readRows(
  makeQuery: () => {
    range(
      from: number,
      to: number
    ): PromiseLike<{ data: unknown; error: { message?: string } | null }>;
  }
): Promise<TranslationRow[]> {
  const rows: TranslationRow[] = [];
  const pageSize = 500;
  for (;;) {
    const { data, error } = await makeQuery().range(rows.length, rows.length + pageSize - 1);
    if (error) throw new Error(error.message || 'Unable to read sitemap content');
    const page = mapRows(data);
    rows.push(...page);
    if (page.length < pageSize) return rows;
  }
}

function translationQuery(table: string, parentSelect: string) {
  const dateFields = ['package_translations', 'fleet_vehicle_translations'].includes(table)
    ? 'published_at'
    : 'published_at, updated_at';
  return sitemapClient()
    .from(table)
    .select(`locale, slug, ${dateFields}, ${parentSelect}`)
    .in('locale', PUBLIC_LOCALES)
    .not('published_at', 'is', null)
    .order('locale')
    .order('slug');
}

const SECTION_FETCHERS: Record<SitemapSection, () => Promise<TranslationRow[]>> = {
  tours: () =>
    readRows(() =>
      translationQuery('tour_translations', 'tour:tours!inner(status)').eq(
        'tour.status',
        'published'
      )
    ),
  'safari-packages': () =>
    readRows(() =>
      translationQuery('package_translations', 'package:packages!inner(status)').eq(
        'package.status',
        'published'
      )
    ),
  destinations: () =>
    readRows(() =>
      translationQuery(
        'destination_translations',
        'destination:destinations!inner(status, deleted_at)'
      )
        .eq('destination.status', 'published')
        .is('destination.deleted_at', null)
    ),
  'national-parks': () =>
    readRows(() =>
      translationQuery('national_park_translations', 'park:national_parks!inner(status)').eq(
        'park.status',
        'published'
      )
    ),
  experiences: () =>
    readRows(() =>
      translationQuery(
        'experience_translations',
        'experience:experiences!inner(status, deleted_at)'
      )
        .eq('experience.status', 'published')
        .is('experience.deleted_at', null)
    ),
  accommodations: () =>
    readRows(() =>
      translationQuery(
        'accommodation_translations',
        'accommodation:accommodations!inner(status, deleted_at)'
      )
        .eq('accommodation.status', 'published')
        .is('accommodation.deleted_at', null)
    ),
  'our-fleet': () =>
    readRows(() =>
      translationQuery('fleet_vehicle_translations', 'vehicle:fleet_vehicles!inner(status)').eq(
        'vehicle.status',
        'published'
      )
    ),
  blog: () =>
    readRows(() =>
      translationQuery('blog_translations', 'post:blog_posts!inner(status, deleted_at)')
        .eq('post.status', 'published')
        .is('post.deleted_at', null)
    )
};

function rowsToEntries(rows: TranslationRow[], section: SitemapSection): SitemapUrlEntry[] {
  const seen = new Set<string>();
  return rows.flatMap((row) => {
    if (!isPublicLocale(row.locale) || !row.slug) return [];
    const path = `/${row.locale}/${section}/${row.slug}`;
    if (seen.has(path)) return [];
    seen.add(path);
    return [{ lastModified: parseDate(row.updated_at) ?? parseDate(row.published_at), path }];
  });
}

function latest(entries: SitemapUrlEntry[]) {
  let result: Date | undefined;
  for (const entry of entries) {
    if (entry.lastModified && (!result || entry.lastModified > result)) {
      result = entry.lastModified;
    }
  }
  return result;
}

export async function getSectionSitemapUrls(section: SitemapSection) {
  return unstable_cache(
    async () =>
      rowsToEntries(await SECTION_FETCHERS[section](), section).map((row) => ({
        path: row.path,
        modified: row.lastModified?.toISOString()
      })),
    ['sitemap-section-v2', section, PUBLIC_LOCALES.join(',')],
    { tags: [`sitemap-${section}`], revalidate: 3600 }
  )().then((rows) =>
    rows.map((row) => ({
      path: row.path,
      lastModified: row.modified ? new Date(row.modified) : undefined
    }))
  );
}

async function getAllSectionUrls() {
  const results = await Promise.all(
    SITEMAP_SECTIONS.map(
      async (section) => [section, await getSectionSitemapUrls(section)] as const
    )
  );
  return new Map<SitemapSection, SitemapUrlEntry[]>(results);
}

function staticPageUrls(sections: Map<SitemapSection, SitemapUrlEntry[]>): SitemapUrlEntry[] {
  return PUBLIC_LOCALES.flatMap((locale) => {
    const paths = new Set(ALWAYS_LISTED_PATHS);
    const modified = new Map<string, Date | undefined>();
    for (const section of SITEMAP_SECTIONS) {
      const prefix = `/${locale}/${section}/`;
      const entries = (sections.get(section) ?? []).filter((entry) =>
        entry.path.startsWith(prefix)
      );
      if (entries.length) {
        paths.add(section);
        modified.set(section, latest(entries));
      }
    }
    return Array.from(paths, (path) => ({
      lastModified: modified.get(path),
      path: path ? `/${locale}/${path}` : `/${locale}`
    }));
  });
}

export async function getPagesSitemapUrls() {
  return staticPageUrls(await getAllSectionUrls());
}

/** Sitemap files for the index: pages first, then only sections with published URLs. */
export async function getSitemapFiles(): Promise<SitemapFileEntry[]> {
  const sections = await getAllSectionUrls();
  const files: SitemapFileEntry[] = [
    { lastModified: latest([...sections.values()].flat()), name: PAGES_SITEMAP }
  ];

  for (const section of SITEMAP_SECTIONS) {
    const entries = sections.get(section) ?? [];
    if (entries.length) files.push({ lastModified: latest(entries), name: section });
  }

  return files;
}
