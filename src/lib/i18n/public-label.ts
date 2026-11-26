import labels from './public-interface.json';

const translations: Record<string, Record<string, string>> = labels;

export function publicLabel(locale: string, label: string) {
  return translations[label]?.[locale] ?? label;
}
