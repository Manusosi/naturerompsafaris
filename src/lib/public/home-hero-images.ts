import mobile0 from '@/assets/home-hero/e3cede2c-6c2e-4013-a495-1cb28020a92a-mobile.webp';
import desktop0 from '@/assets/home-hero/e3cede2c-6c2e-4013-a495-1cb28020a92a-desktop.webp';
import mobile1 from '@/assets/home-hero/c4a9ecb8-e6e1-4e14-b524-8ba57539f08b-mobile.webp';
import desktop1 from '@/assets/home-hero/c4a9ecb8-e6e1-4e14-b524-8ba57539f08b-desktop.webp';
import mobile2 from '@/assets/home-hero/40a93f5d-fd56-4138-8b03-4a777b268200-mobile.webp';
import desktop2 from '@/assets/home-hero/40a93f5d-fd56-4138-8b03-4a777b268200-desktop.webp';
import mobile3 from '@/assets/home-hero/96ee775a-560a-4bc1-84ce-5d81664cf384-mobile.webp';
import desktop3 from '@/assets/home-hero/96ee775a-560a-4bc1-84ce-5d81664cf384-desktop.webp';
import mobile4 from '@/assets/home-hero/1607b3e4-502d-42ce-9637-d564ab65b867-mobile.webp';
import desktop4 from '@/assets/home-hero/1607b3e4-502d-42ce-9637-d564ab65b867-desktop.webp';
import mobile5 from '@/assets/home-hero/e79e506a-9f45-4bef-b445-a0bb530ede8c-mobile.webp';
import desktop5 from '@/assets/home-hero/e79e506a-9f45-4bef-b445-a0bb530ede8c-desktop.webp';
import mobile6 from '@/assets/home-hero/86631b27-6a36-4b7e-8733-375c596d9637-mobile.webp';
import desktop6 from '@/assets/home-hero/86631b27-6a36-4b7e-8733-375c596d9637-desktop.webp';
import mobile7 from '@/assets/home-hero/9c1fac28-5b53-4220-8364-32529a10422d-mobile.webp';
import desktop7 from '@/assets/home-hero/9c1fac28-5b53-4220-8364-32529a10422d-desktop.webp';
import mobile8 from '@/assets/home-hero/a5141761-48d1-4288-b04b-dc359676619c-mobile.webp';
import desktop8 from '@/assets/home-hero/a5141761-48d1-4288-b04b-dc359676619c-desktop.webp';
import type { StaticImageData } from 'next/image';

const images: Record<string, { mobile: StaticImageData; desktop: StaticImageData }> = {
  '2026/09/e3cede2c-6c2e-4013-a495-1cb28020a92a.jpg': { mobile: mobile0, desktop: desktop0 },
  '2026/09/c4a9ecb8-e6e1-4e14-b524-8ba57539f08b.jpeg': { mobile: mobile1, desktop: desktop1 },
  '2026/09/40a93f5d-fd56-4138-8b03-4a777b268200.jpeg': { mobile: mobile2, desktop: desktop2 },
  '2026/09/96ee775a-560a-4bc1-84ce-5d81664cf384.jpeg': { mobile: mobile3, desktop: desktop3 },
  '2026/09/1607b3e4-502d-42ce-9637-d564ab65b867.jpg': { mobile: mobile4, desktop: desktop4 },
  '2026/09/e79e506a-9f45-4bef-b445-a0bb530ede8c.jpg': { mobile: mobile5, desktop: desktop5 },
  'migrated/2026/09/86631b27-6a36-4b7e-8733-375c596d9637.webp': {
    mobile: mobile6,
    desktop: desktop6
  },
  '2026/09/9c1fac28-5b53-4220-8364-32529a10422d.webp': { mobile: mobile7, desktop: desktop7 },
  '2026/09/a5141761-48d1-4288-b04b-dc359676619c.jpg': { mobile: mobile8, desktop: desktop8 }
};

export function getHomeHeroImage(url: string) {
  return images[url.split('/storage/v1/object/public/media/')[1]];
}
