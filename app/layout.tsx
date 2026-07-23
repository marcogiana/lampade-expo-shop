import type { Metadata } from 'next';
import { Fraunces, Inter, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/components/CartContext';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import CartDrawer from '@/components/CartDrawer';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600'],
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'Studio Luce',
  description:
    'Lampade di design FLOS, Artemide, Catellani&Smith, Foscarini e altri grandi marchi, provenienti da magazzino e showroom, con prezzo promozionale.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className={`${fraunces.variable} ${inter.variable} ${plexMono.variable} font-body antialiased`}>
        <CartProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
