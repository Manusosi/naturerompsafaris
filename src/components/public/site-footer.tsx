import { publicLabel } from '@/lib/i18n/public-label';
import Image from 'next/image';
import Link from 'next/link';

import { Icons } from '@/components/icons';
import { FooterNewsletter } from '@/components/public/footer-newsletter';
import { PublicSocialLinks } from '@/components/public/public-social-links';
import {
  BRAND_FOOTER_DESCRIPTION,
  BRAND_LOGO_PATH,
  BRAND_PHONE,
  BRAND_WHATSAPP
} from '@/config/brand';
import { localePath } from '@/lib/public/locale-path';
import { phoneHref, publicCallPhones } from '@/lib/public/phones';
import type { PublicFooterColumn, PublicSiteSettings } from '@/lib/public/types';
import { whatsAppHref } from '@/lib/public/whatsapp';

type SiteFooterProps = {
  footerColumns: PublicFooterColumn[];
  locale: string;
  siteSettings: PublicSiteSettings;
};

function FooterLinkColumn({ column, locale }: { column: PublicFooterColumn; locale: string }) {
  return (
    <nav aria-label={publicLabel(locale, column.title)}>
      <h3>{publicLabel(locale, column.title)}</h3>
      {column.links.map((link) => (
        <Link href={link.href} key={`${column.title}-${link.href}`}>
          {publicLabel(locale, link.label)}
        </Link>
      ))}
    </nav>
  );
}

export function SiteFooter({ footerColumns, locale, siteSettings }: SiteFooterProps) {
  const homeHref = localePath(locale);
  const logoSrc = siteSettings.logoUrl || BRAND_LOGO_PATH;
  const quickLinks = footerColumns.find((column) => column.title === 'Quick Links');
  const safariLinks = footerColumns.find((column) => column.title === 'Our Safaris');
  const policyColumn = footerColumns.find((column) => column.title === 'Help & Policies');
  const phone = siteSettings.phonePrimary || BRAND_PHONE;
  const phones = publicCallPhones(siteSettings);
  const whatsappLink = whatsAppHref(
    BRAND_WHATSAPP.phone || phone,
    siteSettings.whatsappMessage || BRAND_WHATSAPP.message
  );
  const description = siteSettings.description || BRAND_FOOTER_DESCRIPTION;

  return (
    <footer className='nr-footer'>
      <div className='nr-footer__grid'>
        <div className='nr-footer__brand'>
          <Link className='nr-footer__logo' href={homeHref}>
            <Image
              alt={siteSettings.companyName}
              height={45}
              src={logoSrc}
              style={{ height: 45, width: 'auto' }}
              width={132}
            />
          </Link>
          <p className='nr-footer__about'>{publicLabel(locale, description)}</p>
          <Link className='nr-footer__quote' href={localePath(locale, '/contact')}>
            {publicLabel(locale, 'Request a custom quote')}
            <Icons.arrowRight />
          </Link>
          <PublicSocialLinks className='nr-footer__social' socialLinks={siteSettings.socialLinks} />
        </div>
        {quickLinks ? <FooterLinkColumn locale={locale} column={quickLinks} /> : null}
        {safariLinks ? <FooterLinkColumn locale={locale} column={safariLinks} /> : null}
        <div className='nr-footer__contact-col'>
          <h3>{publicLabel(locale, 'Contact Us')}</h3>
          <dl className='nr-footer__details'>
            <div className='nr-footer__detail'>
              <dt>{publicLabel(locale, 'Mobile & WhatsApp:')}</dt>
              <dd>
                <div className='nr-footer__actions'>
                  <span className='nr-footer__phones'>
                    {phones.map((number, index) => (
                      <span className='nr-footer__phones-item' key={number}>
                        {index > 0 ? (
                          <span aria-hidden className='nr-footer__phones-sep'>
                            /
                          </span>
                        ) : null}
                        <a
                          className='nr-footer__action nr-footer__action--call'
                          href={`tel:${phoneHref(number)}`}
                        >
                          {index === 0 ? <Icons.phone aria-hidden /> : null}
                          {number}
                        </a>
                      </span>
                    ))}
                  </span>
                  <span aria-hidden className='nr-footer__action-sep' />
                  <a
                    className='nr-footer__action nr-footer__action--whatsapp'
                    href={whatsappLink}
                    rel='noopener noreferrer'
                    target='_blank'
                  >
                    <Icons.whatsapp aria-hidden />
                    {publicLabel(locale, 'WhatsApp chat')}
                  </a>
                </div>
              </dd>
            </div>
            <div className='nr-footer__detail'>
              <dt>{publicLabel(locale, 'Email:')}</dt>
              <dd>
                <a
                  className='nr-footer__action nr-footer__action--email'
                  href={`mailto:${siteSettings.email}`}
                >
                  {siteSettings.email}
                </a>
              </dd>
            </div>
          </dl>
          <FooterNewsletter compact locale={locale} />
        </div>
      </div>
      <div className='nr-footer__bottom'>
        <div className='nr-footer__bottom-inner'>
          <div className='nr-footer__copyright'>
            Copyright &copy; {new Date().getFullYear()} {siteSettings.companyName}.{' '}
            {siteSettings.siteName}.
          </div>
          {policyColumn ? (
            <nav aria-label={publicLabel(locale, 'Legal policies')} className='nr-footer__legal'>
              {policyColumn.links.map((link) => (
                <Link href={link.href} key={link.href} prefetch>
                  {publicLabel(locale, link.label)}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
