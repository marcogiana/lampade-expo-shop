import type { Metadata } from 'next';
// Font self-hosted tramite pacchetti npm (@fontsource): niente richieste a Google
// Fonts durante la build, che possono fallire e bloccare il deploy.
import '@fontsource-variable/fraunces/wght.css';
import '@fontsource-variable/fraunces/wght-italic.css';
import '@fontsource-variable/inter/wght.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import './globals.css';
import { CartProvider } from '@/components/CartContext';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import CartDrawer from '@/components/CartDrawer';

export const metadata: Metadata = {
  title: 'Studio Luce',
  description:
    'Lampade di design FLOS, Artemide, Catellani&Smith, Foscarini e altri grandi marchi, provenienti da magazzino e showroom, con prezzo promozionale.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="font-body antialiased">
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
