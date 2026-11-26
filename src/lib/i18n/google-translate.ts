import { toGoogleTargetLocale } from '@/lib/i18n/auto-translate-config';

const GOOGLE_TRANSLATE_URL = 'https://translation.googleapis.com/language/translate/v2';
const MAX_SEGMENT_CHARS = 28_000;

type TranslateFormat = 'text' | 'html';

interface GoogleTranslateResponse {
  data?: {
    translations?: Array<{ translatedText?: string }>;
  };
  error?: {
    message?: string;
  };
}

function getApiKey(): string {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('GOOGLE_TRANSLATE_API_KEY is not configured.');
  }
  return apiKey;
}

async function callGoogleTranslate(
  segments: string[],
  targetLocale: string,
  format: TranslateFormat
): Promise<string[]> {
  if (!segments.length) return [];

  const apiKey = getApiKey();

  const response = await fetch(GOOGLE_TRANSLATE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': apiKey },
    body: JSON.stringify({
      q: segments,
      source: 'en',
      target: toGoogleTargetLocale(targetLocale),
      format
    })
  });

  const payload = (await response.json()) as GoogleTranslateResponse;
  if (!response.ok) {
    throw new Error(payload.error?.message || `Google Translate failed (${response.status}).`);
  }

  const translations = payload.data?.translations ?? [];
  if (translations.length !== segments.length) {
    throw new Error('Google Translate returned an incomplete response.');
  }
  return translations.map(({ translatedText }) => {
    if (!translatedText?.trim()) throw new Error('Google Translate returned an empty translation.');
    return translatedText;
  });
}

function splitHtmlSegments(html: string): string[] {
  const trimmed = html.trim();
  if (!trimmed) return [];
  if (trimmed.length <= MAX_SEGMENT_CHARS) return [trimmed];

  const segments: string[] = [];
  let buffer = '';

  for (const part of trimmed.split(/(?<=<\/(?:p|h[1-6]|li|blockquote|div)>)/i)) {
    if (!part) continue;

    if ((buffer + part).length > MAX_SEGMENT_CHARS && buffer) {
      segments.push(buffer);
      buffer = part;
      continue;
    }

    buffer += part;
  }

  if (buffer) segments.push(buffer);
  return segments.length ? segments : [trimmed];
}

export async function translateText(text: string, targetLocale: string): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return text;

  const [translated] = await callGoogleTranslate([trimmed], targetLocale, 'text');
  return translated ?? text;
}

export async function translateHtml(html: string, targetLocale: string): Promise<string> {
  const trimmed = html.trim();
  if (!trimmed) return html;

  const segments = splitHtmlSegments(trimmed);
  const translated = await callGoogleTranslate(segments, targetLocale, 'html');
  return translated.join('');
}

export async function translateStringList(
  values: string[],
  targetLocale: string
): Promise<string[]> {
  const trimmed = values.map((value) => value.trim()).filter(Boolean);
  if (!trimmed.length) return values;

  const translated = await callGoogleTranslate(trimmed, targetLocale, 'text');
  let index = 0;

  return values.map((value) => {
    if (!value.trim()) return value;
    const next = translated[index] ?? value;
    index += 1;
    return next;
  });
}
