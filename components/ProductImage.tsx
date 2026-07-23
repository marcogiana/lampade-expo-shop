'use client';

import { useState } from 'react';

export default function ProductImage({ src, alt }: { src: string | null | undefined; alt: string }) {
  const [error, setError] = useState(false);
  const showImage = src && !error;

  return (
    <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-surface">
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} loading="lazy" onError={() => setError(true)} className="h-full w-full object-cover" />
      ) : (
        <span className="glow-dot h-3 w-3 rounded-full bg-brass/50" />
      )}
    </div>
  );
}
