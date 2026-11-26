'use client';

import { useParams } from 'next/navigation';

export function usePublicLocale(): string {
  return useParams<{ locale?: string }>()?.locale ?? 'en';
}
