import { translateStringList, translateText } from '@/lib/i18n/google-translate';
import { normalizeDirectAnswers, type DirectAnswer } from '@/lib/seo/direct-answers';

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? (value as string[]).filter(Boolean) : [];
}

export function parseRichTextHtml(value: unknown): string {
  const record = (value && typeof value === 'object' ? value : null) as {
    html?: string;
    text?: string;
  } | null;

  if (!record) return '';
  if (record.html) return record.html;
  if (record.text) return record.text;
  return '';
}

export async function translateDirectAnswers(
  value: unknown,
  targetLocale: string
): Promise<DirectAnswer[]> {
  const items = normalizeDirectAnswers(value);
  if (!items.length) return [];

  const translated = await Promise.all(
    items.map(async (item) => ({
      question: await translateText(item.question, targetLocale),
      answer: await translateText(item.answer, targetLocale)
    }))
  );

  return translated;
}

export async function translateKeywords(value: unknown, targetLocale: string): Promise<string[]> {
  const keywords = toStringArray(value);
  if (!keywords.length) return [];
  return translateStringList(keywords, targetLocale);
}

export async function translateTourDetails(tour: Record<string, unknown>, locale: string) {
  const itinerary = Array.isArray(tour.itinerary_days) ? tour.itinerary_days : [];
  const days = [];
  for (const day of itinerary) {
    if (!day || typeof day !== 'object') continue;
    const fields = ['title', 'description', 'mealPlan', 'meal_plan'].filter(
      (field) => typeof day[field] === 'string' && day[field].trim()
    );
    const values = await translateStringList(
      fields.map((field) => day[field]),
      locale
    );
    days.push({ ...day, ...Object.fromEntries(fields.map((field, i) => [field, values[i]])) });
  }

  return {
    itinerary_days: days,
    inclusions: await translateKeywords(tour.inclusions, locale),
    exclusions: await translateKeywords(tour.exclusions, locale),
    important_notice:
      typeof tour.important_notice === 'string'
        ? await translateText(tour.important_notice, locale)
        : null
  };
}
