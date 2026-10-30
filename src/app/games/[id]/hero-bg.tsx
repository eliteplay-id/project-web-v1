"use client";

import { useState } from "react";
import Image from "next/image";

/** Full-bleed hero art with graceful fallback chain + slow cinematic zoom. */
export function HeroBg({ sources, alt }: { sources: string[]; alt: string }) {
  const [i, setI] = useState(0);
  const src = sources[Math.min(i, sources.length - 1)];
  return (
    <div className="hero-drift absolute inset-0">
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes="100vw"
        onError={() => setI((p) => (p < sources.length - 1 ? p + 1 : p))}
        className="object-cover object-center"
      />
    </div>
  );
}
