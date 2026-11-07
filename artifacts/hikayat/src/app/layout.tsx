import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import '../index.css';

const title = 'HIKAYAT — Every Scent Tells a Story';
const description = 'Discover your signature scent. HIKAYAT is a fragrance house of oud, Taif rose, amber and musk, composed as short stories for men, women and everyone in between.';

export const metadata: Metadata = {
  title,
  description,
  icons: { icon: '/favicon.svg' },
  openGraph: { title, description, type: 'website', siteName: 'HIKAYAT' },
  twitter: { card: 'summary_large_image', title, description },
};

export const viewport: Viewport = { themeColor: '#263A32' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
