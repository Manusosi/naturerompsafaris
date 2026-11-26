import { publicLabel } from '@/lib/i18n/public-label';
import type { Metadata } from 'next';

import { NationalParkFilters } from '@/components/public/national-parks/national-park-filters';
import { NationalParksResults } from '@/components/public/national-parks/national-parks-results';
import { ListingShell } from '@/components/public/page-shell';
import { PublicPageHero } from '@/components/public/public-page-hero';
import { BRAND_PUBLIC_HERO_IMAGES } from '@/config/brand';
import { localePath } from '@/lib/public/locale-path';
import { getParkFilterFacets, listPublishedParks } from '@/lib/public/national-parks';
import { getPageHero } from '@/lib/public/site-data';
import { buildListingPageMetadata, hasSearchParams } from '@/lib/seo/listing-metadata';
import { getSectionSitemapUrls } from '@/lib/seo/sitemap-data';

type NationalParksPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    activity?: string;
    country?: string;
    region?: string;
    wildlife?: string;
  }>;
};

const nationalParksDescription =
  'Compare safari parks and reserves across East Africa. Filter by wildlife, season, and region, then jump to bookable tours for each park.';

function parseFilterList(value?: string) {
  if (!value?.trim()) return [];
  return value
    .split(',')
    .map((item) => decodeURIComponent(item.trim()))
    .filter(Boolean);
}

export async function generateMetadata({
  params,
  searchParams
}: NationalParksPageProps): Promise<Metadata> {
  const { locale } = await params;
  const [query, pages] = await Promise.all([searchParams, getSectionSitemapUrls('national-parks')]);

  return buildListingPageMetadata({
    canonicalPath: `/${locale}/national-parks`,
    defaultDescription: nationalParksDescription,
    defaultTitle: 'National Parks & Safari Reserves',
    hasFilters:
      hasSearchParams(query) || !pages.some((page) => page.path.startsWith(`/${locale}/`)),
    locale
  });
}

export default async function NationalParksPage({ params, searchParams }: NationalParksPageProps) {
  const { locale } = await params;
  const query = await searchParams;

  const activeFilters = {
    activities: parseFilterList(query.activity),
    countries: parseFilterList(query.country),
    regions: parseFilterList(query.region),
    wildlife: parseFilterList(query.wildlife)
  };

  const [parks, facets, pageHero] = await Promise.all([
    listPublishedParks({
      activities: activeFilters.activities,
      countries: activeFilters.countries,
      locale,
      regions: activeFilters.regions,
      wildlife: activeFilters.wildlife
    }),
    getParkFilterFacets(locale),
    getPageHero('national-parks')
  ]);
  const hero = BRAND_PUBLIC_HERO_IMAGES.destinations;

  return (
    <>
      <PublicPageHero
        breadcrumbs={[{ href: localePath(locale), label: 'Home' }, { label: 'National Parks' }]}
        description={nationalParksDescription}
        eyebrow={publicLabel(locale, 'Safari Parks')}
        hero={pageHero}
        imageAlt={hero.imageAlt}
        imageUrl={hero.imageUrl}
        overlayTone='black'
        title='National Parks & Reserves'
      />

      <ListingShell
        filters={<NationalParkFilters active={activeFilters} facets={facets} locale={locale} />}
      >
        <NationalParksResults
          hasFilters={Object.values(query).some((value) => Boolean(value?.trim()))}
          locale={locale}
          parks={parks}
        />
      </ListingShell>
    </>
  );
}
