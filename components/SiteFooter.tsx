import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-white/10">
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="filament mb-8" />
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/studio-luce-logo.png" alt="Studio Luce" className="h-6 w-auto" />
            <p className="mt-3 max-w-sm text-sm text-muted">
              Pezzi di design provenienti dal nostro magazzino e showroom, venduti a prezzo scontato.
              Disponibilità limitata: un pezzo, una sola vendita.
            </p>
          </div>
          <div className="flex gap-10 text-sm">
            <div>
              <p className="mb-3 font-mono text-xs uppercase tracking-widest text-brass">Catalogo</p>
              <ul className="space-y-2 text-muted">
                <li><Link className="hover:text-paper" href="/catalogo/sospensioni-e-plafoniere">Sospensioni</Link></li>
                <li><Link className="hover:text-paper" href="/catalogo/applique">Applique</Link></li>
                <li><Link className="hover:text-paper" href="/catalogo/lampade-da-tavolo">Da tavolo</Link></li>
                <li><Link className="hover:text-paper" href="/catalogo/lampade-da-terra">Da terra</Link></li>
              </ul>
            </div>
            <div>
              <p className="mb-3 font-mono text-xs uppercase tracking-widest text-brass">Assistenza</p>
              <ul className="space-y-2 text-muted">
                <li><Link className="hover:text-paper" href="/contatti">Contattaci</Link></li>
                <li><a className="hover:text-paper" href="https://eleluci.it" target="_blank" rel="noreferrer">eleluci.it</a></li>
              </ul>
            </div>
          </div>
        </div>
        <p className="mt-10 text-xs text-muted">© {new Date().getFullYear()} Studio Luce. Prezzi IVA inclusa, salvo diversa indicazione.</p>
      </div>
    </footer>
  );
}
