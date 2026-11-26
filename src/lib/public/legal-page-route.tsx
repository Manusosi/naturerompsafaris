import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { buildMetadata } from '@/lib/seo/metadata';
import { buildStaticLanguageAlternates } from '@/lib/seo/alternates';
import { LegalDocument } from '@/components/public/legal/legal-document';
import { getLegalPage } from '@/lib/public/legal-content';

type LegalPageRouteProps = {
  params: Promise<{ locale: string }>;
};

async function localizedLegalPage(slug: string, locale: string) {
  const page = getLegalPage(slug);
  if (!page || !['fr', 'de', 'es', 'it', 'sw', 'zh'].includes(locale)) return page;
  const dictionary: Record<string, string> = (
    await import(`../i18n/legal-translations/${locale}.json`)
  ).default;
  const translate = (text: string) => dictionary[text] ?? text;
  return {
    ...page,
    title: translate(page.title),
    description: translate(page.description),
    eyebrow: page.eyebrow && translate(page.eyebrow),
    intro: Array.isArray(page.intro)
      ? page.intro.map(translate)
      : page.intro && translate(page.intro),
    sections: page.sections.map((section) => ({
      ...section,
      title: translate(section.title),
      paragraphs: section.paragraphs.map(translate),
      listItems: section.listItems?.map(translate)
    }))
  };
}

export function createLegalPageRoute(slug: string) {
  async function LegalPage({ params }: LegalPageRouteProps) {
    const { locale } = await params;
    const page = await localizedLegalPage(slug, locale);
    if (!page) notFound();

    return <LegalDocument locale={locale} page={page} />;
  }

  return LegalPage;
}

export function createLegalPageMetadata(slug: string) {
  return async function generateMetadata({ params }: LegalPageRouteProps): Promise<Metadata> {
    const { locale } = await params;
    const page = await localizedLegalPage(slug, locale);
    if (!page) return {};

    return buildMetadata({
      canonicalPath: `/${locale}/${slug}`,
      languages: buildStaticLanguageAlternates(`/${slug}`),
      title: page.title,
      description: page.description
    });
  };
}
