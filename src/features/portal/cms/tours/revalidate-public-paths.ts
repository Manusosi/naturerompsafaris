import { revalidatePath, revalidateTag } from 'next/cache';

import { safariMarkets } from '@/lib/public/safari-markets';
import { SUPPORTED_LOCALES } from '@/lib/i18n';

export function revalidateTourPublicPaths() {
  revalidateTag('tours', 'max');
  revalidateTag('sitemap-tours', 'max');
  for (const locale of SUPPORTED_LOCALES) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/tours`);
    for (const market of Object.keys(safariMarkets)) {
      revalidatePath(`/${locale}/safaris/${market}`);
    }
    revalidatePath(`/${locale}/safari-packages`);
  }
}
