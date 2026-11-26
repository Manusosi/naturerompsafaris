'use client';
import { usePublicLocale } from '@/lib/i18n/use-public-locale';

import { publicLabel } from '@/lib/i18n/public-label';
import { useState } from 'react';

import { Icons } from '@/components/icons';
import { BRAND_WHATSAPP } from '@/config/brand';
import { whatsAppHref } from '@/lib/public/whatsapp';
import { cn } from '@/lib/utils';

type PricingMarket = 'usd' | 'local';

type SafariPricingMarketTabsProps = {
  international: React.ReactNode;
  local?: React.ReactNode;
  safariName: string;
};

function localRatesWhatsAppHref(safariName: string) {
  const trip = safariName.trim() || 'this safari';
  return whatsAppHref(
    BRAND_WHATSAPP.phone,
    `Hello Nature Romp Safaris! I'm looking at "${trip}" and would like the resident Kenya Shilling (KES) rates for this safari. Please share the local price when you can.`
  );
}

function LocalRatesUnavailable({ safariName }: { safariName: string }) {
  const locale = usePublicLocale();
  const trip = safariName.trim() || 'this safari';

  return (
    <div className='brand-contact-credentials-box'>
      <p className='text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand-gold)]'>
        {publicLabel(locale, 'Resident rates · KES')}
      </p>
      <h3 className='brand-heading font-display mt-2 text-xl'>
        {publicLabel(locale, 'Please check back later')}
      </h3>
      <p className='brand-body mt-3 text-sm leading-7'>
        {publicLabel(locale, 'Resident Kenya Shilling prices for')}{' '}
        <strong className='text-[var(--brand-heading)]'>{trip}</strong>{' '}
        {publicLabel(
          locale,
          'are not published yet. Non-resident USD rates are on the other tab. WhatsApp us if you need a resident quote for this safari in the meantime.'
        )}
      </p>
      <a
        className='mt-5 inline-flex items-center gap-2 rounded-[var(--brand-button-radius)] bg-[#25D366] px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-[#1ebe5d]'
        href={localRatesWhatsAppHref(trip)}
        rel='noopener noreferrer'
        target='_blank'
      >
        <Icons.whatsapp className='h-4 w-4' />
        {publicLabel(locale, 'WhatsApp for KES rates')}
      </a>
    </div>
  );
}

export function SafariPricingMarketTabs({
  international,
  local,
  safariName
}: SafariPricingMarketTabsProps) {
  const locale = usePublicLocale();
  const [market, setMarket] = useState<PricingMarket>('usd');

  return (
    <div>
      <div
        aria-label={publicLabel(locale, 'Rate type')}
        className='brand-pricing-market'
        role='tablist'
      >
        <button
          aria-selected={market === 'usd'}
          className={cn('brand-pricing-market__tab', market === 'usd' && 'is-active')}
          onClick={() => setMarket('usd')}
          role='tab'
          type='button'
        >
          {publicLabel(locale, 'Non-Resident Rates (USD)')}
        </button>
        <button
          aria-selected={market === 'local'}
          className={cn('brand-pricing-market__tab', market === 'local' && 'is-active')}
          onClick={() => setMarket('local')}
          role='tab'
          type='button'
        >
          {publicLabel(locale, 'Resident Rates (KES)')}
        </button>
      </div>

      <div className='mt-5' role='tabpanel'>
        {market === 'usd'
          ? international
          : (local ?? <LocalRatesUnavailable safariName={safariName} />)}
      </div>
    </div>
  );
}
