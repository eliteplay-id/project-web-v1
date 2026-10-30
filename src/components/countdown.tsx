"use client";

import { useEffect, useState } from "react";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function Countdown() {
  const [left, setLeft] = useState({ h: 11, m: 24, s: 36 });

  useEffect(() => {
    const t = setInterval(() => {
      setLeft((p) => {
        const total = p.h * 3600 + p.m * 60 + p.s - 1;
        const safe = total < 0 ? 12 * 3600 : total;
        return { h: Math.floor(safe / 3600), m: Math.floor((safe % 3600) / 60), s: safe % 60 };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex items-center gap-2 tabular" aria-label="Flash sale countdown" role="timer">
      {[
        [pad(left.h), "hrs"],
        [pad(left.m), "min"],
        [pad(left.s), "sec"],
      ].map(([v, label]) => (
        <div key={label} className="min-w-14 rounded-lg border border-white/25 bg-white/10 px-2 py-1.5 text-center shadow-[inset_0_1px_0_rgb(255_255_255/0.25)] backdrop-blur-md">
          <p className="font-display text-xl font-black italic text-white">{v}</p>
          <p className="text-[10px] uppercase tracking-widest text-white/70">{label}</p>
        </div>
      ))}
    </div>
  );
}
