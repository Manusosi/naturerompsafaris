import Link from 'next/link';
import type { Metadata } from 'next';

import '@/styles/globals.css';

export const metadata: Metadata = { title: 'Page not found', robots: { index: false } };

export default function GlobalNotFound() {
  return (
    <html lang='en'>
      <body>
        <main className='mx-auto max-w-xl p-12'>
          <h1>Page not found</h1>
          <Link href='/'>Back to home</Link>
        </main>
      </body>
    </html>
  );
}
