import { publicLabel } from '@/lib/i18n/public-label';
import { BRAND_MAP_QUERY } from '@/config/brand';
import { Icons } from '@/components/icons';

type ContactSidebarMapProps = {
  locale: string;
  mapQuery?: string;
};

export function ContactSidebarMap({ locale, mapQuery = BRAND_MAP_QUERY }: ContactSidebarMapProps) {
  const encodedQuery = encodeURIComponent(mapQuery);
  const mapSrc = `https://maps.google.com/maps?q=${encodedQuery}&output=embed`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;

  return (
    <div className='brand-contact-sidebar-map'>
      <iframe
        allowFullScreen
        className='brand-contact-sidebar-map-frame'
        loading='lazy'
        referrerPolicy='no-referrer-when-downgrade'
        sandbox='allow-scripts allow-same-origin allow-popups'
        src={mapSrc}
        title={publicLabel(locale, 'Nature Romp Safaris office location map')}
      />
      <a
        className='brand-contact-sidebar-map-link'
        href={mapsUrl}
        rel='noopener noreferrer'
        target='_blank'
      >
        {publicLabel(locale, 'Open in Google Maps')}
        <Icons.externalLink className='h-3.5 w-3.5' />
      </a>
    </div>
  );
}
