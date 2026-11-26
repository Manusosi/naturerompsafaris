'use client';
import { usePublicLocale } from '@/lib/i18n/use-public-locale';

import { publicLabel } from '@/lib/i18n/public-label';
import { parseAsStringEnum, useQueryState } from 'nuqs';

import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

export type AccommodationViewMode = 'grid' | 'list';

const viewParser = parseAsStringEnum<AccommodationViewMode>(['grid', 'list']).withDefault('grid');

export function useAccommodationView() {
  return useQueryState('view', viewParser);
}

type AccommodationViewToggleProps = {
  className?: string;
};

export function AccommodationViewToggle({ className }: AccommodationViewToggleProps) {
  const locale = usePublicLocale();
  const [view, setView] = useAccommodationView();

  return (
    <div
      className={cn(
        'flex rounded-[var(--brand-radius)] border border-[var(--brand-line)] bg-white',
        className
      )}
      role='group'
      aria-label={publicLabel(locale, 'Accommodation view mode')}
    >
      <button
        type='button'
        aria-label={publicLabel(locale, 'Grid view')}
        aria-pressed={view === 'grid'}
        className={cn(
          'inline-flex items-center justify-center px-2.5 py-1.5 transition-colors',
          view === 'grid'
            ? 'bg-[var(--brand-primary)] text-white'
            : 'text-[var(--brand-muted)] hover:text-[var(--brand-ink)]'
        )}
        onClick={() => void setView('grid')}
      >
        <Icons.dashboard className='size-4' />
      </button>
      <button
        type='button'
        aria-label={publicLabel(locale, 'List view')}
        aria-pressed={view === 'list'}
        className={cn(
          'inline-flex items-center justify-center border-l border-[var(--brand-line)] px-2.5 py-1.5 transition-colors',
          view === 'list'
            ? 'bg-[var(--brand-primary)] text-white'
            : 'text-[var(--brand-muted)] hover:text-[var(--brand-ink)]'
        )}
        onClick={() => void setView('list')}
      >
        <Icons.listBullet className='size-4' />
      </button>
    </div>
  );
}
