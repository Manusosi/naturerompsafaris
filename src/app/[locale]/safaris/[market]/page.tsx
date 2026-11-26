import Link from 'next/link';
import { notFound } from 'next/navigation';
import { publicLabel } from '@/lib/i18n/public-label';
import { getPublicTourCatalog } from '@/lib/public/site-data';
import { safariMarkets, isSafariMarket } from '@/lib/public/safari-markets';
import { buildMetadata } from '@/lib/seo/metadata';
import { buildStaticLanguageAlternates } from '@/lib/seo/alternates';

type Props = { params: Promise<{ locale: string; market: string }> };

export const revalidate = 300;

export function generateStaticParams() {
  return Object.keys(safariMarkets).map((market) => ({ market }));
}

export async function generateMetadata({ params }: Props) {
  const { locale, market } = await params;
  if (!isSafariMarket(market)) notFound();
  const copy = safariMarkets[market];
  return buildMetadata({
    canonicalPath: `/${locale}/safaris/${market}`,
    languages: buildStaticLanguageAlternates(`/safaris/${market}`),
    title: publicLabel(locale, copy.title),
    description: publicLabel(locale, copy.description)
  });
}

export default async function SafariMarketPage({ params }: Props) {
  const { locale, market } = await params;
  if (!isSafariMarket(market)) notFound();
  const { tours } = await getPublicTourCatalog(
    locale,
    market === 'kenya-tanzania' ? { collection: 'combined' } : { country: market }
  );
  const copy = safariMarkets[market];
  return (
    <section className='brand-section brand-container'>
      <h1 className='brand-heading font-display text-4xl'>{publicLabel(locale, copy.title)}</h1>
      <p className='brand-body mt-4 max-w-3xl'>{publicLabel(locale, copy.description)}</p>
      <ul className='mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {tours.map((tour) => (
          <li className='rounded-lg border p-5' key={tour.id}>
            <h2 className='brand-heading text-xl'>
              <Link href={tour.href}>{tour.title}</Link>
            </h2>
            {tour.excerpt && <p className='brand-body mt-2'>{tour.excerpt}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
