'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from './CartContext';

const NAV = [
  { label: 'Sospensioni', href: '/catalogo/sospensioni-e-plafoniere' },
  { label: 'Applique', href: '/catalogo/applique' },
  { label: 'Da tavolo', href: '/catalogo/lampade-da-tavolo' },
  { label: 'Da terra', href: '/catalogo/lampade-da-terra' },
];

export default function SiteHeader() {
  const { count, open } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/studio-luce-logo.png" alt="Studio Luce" className="h-6 w-auto sm:h-7" />
        </Link>

        <nav className="hidden gap-7 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="font-body text-sm text-muted transition hover:text-paper"
            >
              {n.label}
            </Link>
          ))}
          <Link href="/contatti" className="font-body text-sm text-muted transition hover:text-paper">
            Contatti
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={open}
            className="group relative flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-sm text-paper transition hover:border-brass"
            aria-label="Apri carrello"
          >
            <span className="glow-dot inline-block h-1.5 w-1.5 rounded-full bg-brass/70" />
            Carrello
            {count > 0 && <span className="font-mono text-brass">{count}</span>}
          </button>
          <button
            className="text-paper md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Apri menu"
          >
            ☰
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="flex flex-col gap-1 border-t border-white/10 px-5 py-3 md:hidden">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="py-2 text-sm text-muted hover:text-paper"
              onClick={() => setMobileOpen(false)}
            >
              {n.label}
            </Link>
          ))}
          <Link href="/contatti" className="py-2 text-sm text-muted hover:text-paper" onClick={() => setMobileOpen(false)}>
            Contatti
          </Link>
        </nav>
      )}
    </header>
  );
}
