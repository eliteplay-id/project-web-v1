"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Game } from "@/data/games";
import { portraitCoverOf } from "@/data/games";
import { cn } from "@/lib/utils";

/**
 * Best sellers ala referensi 2game: carousel horizontal di bawah hero.
 * Judul "Best sellers" kiri atas, kartu portrait (cover Steam 600x900)
 * dijejer ke kanan dengan ANGKA PERINGKAT RAKSASA (outline) di belakang
 * tiap kartu, panah < > di kiri-kanan. Background wallpaper blur dari
 * cover game #1. KODE + ASSET SENDIRI (ElitePlay) — hanya layout yang
 * ditiru, bukan copy-paste dari web referensi.
 *
 * Data = badge "Best Seller" dulu, sisanya top review Steam.
 *
 * NOTE perilaku scroll: track overflow-x-auto (drag/swipe + panah bisa
 * geser), tapi wheel VERTIKAL (mouse) SENGAJA tidak dibajak — dibiarkan
 * bubble agar scroll halaman tidak kejebak di section ini. Hanya gesture
 * HORIZONTAL (tilt-wheel/trackpad) yang digeser manual via listener
 * non-passive. TIDAK looping: mentok kiri/kanan = berhenti, panah ujung
 * otomatis sembunyi. Hover kartu naik (-translate-y) diberi ruang via
 * pt track supaya tidak kepotong.
 */

function rankGames(catalog: Game[], count = 12): Game[] {
  const best = catalog.filter((g) => g.badge === "Best Seller");
  const rest = [...catalog]
    .filter((g) => g.badge !== "Best Seller")
    .sort((a, b) => (b.steamReviews ?? 0) - (a.steamReviews ?? 0));
  return [...best, ...rest].slice(0, count);
}

export function BestSellers({ catalog }: { catalog: Game[] }) {
  const games = rankGames(catalog);
  const trackRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    // State panah di-refresh setelah gambar cover selesai load
    // (lebar scroll berubah saat image resolve).
    window.addEventListener("load", updateArrows);
    // Wheel HORIZONTAL (tilt-wheel / trackpad geser samping) → geser
    // carousel. Wheel VERTIKAL (mouse biasa) SENGAJA dibiarkan bubble
    // supaya scroll halaman tidak kejebak di section ini. Listener
    // non-passive agar preventDefault horizontal diizinkan browser.
    const el = trackRef.current;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      if (!el) return;
      e.preventDefault();
      el.scrollBy({ left: e.deltaX * 2, behavior: "auto" });
    };
    el?.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("resize", updateArrows);
      window.removeEventListener("load", updateArrows);
      el?.removeEventListener("wheel", onWheel);
    };
  }, [updateArrows]);

  if (games.length === 0) return null;
  const bg = games[0];

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    // Geser 1 KARTU PENUH (termasuk gap) biar berhenti pas per item.
    // TIDAK looping: mentok = clamp (berhenti), panah ujung sembunyi
    // via updateArrows setelah animasi selesai.
    const first = el.querySelector<HTMLElement>("[data-card]");
    const step = first ? first.offsetWidth + 12 : 640;
    const max = el.scrollWidth - el.clientWidth;
    const next = Math.min(Math.max(el.scrollLeft + dir * step, 0), Math.max(max, 0));
    el.scrollTo({ left: next, behavior: "smooth" });
    window.setTimeout(updateArrows, 450);
  };

  return (
    // Section SENGAJA overflow-visible: panah di space kosong tepi
    // section (sesuai tanda merah user). Background blur di-clip oleh
    // wrapper-nya sendiri (absolute inset-0 overflow-hidden), bukan section.
    <section aria-labelledby="best-sellers-title" className="relative -mt-px">
      {/* Wallpaper blur dari cover rank #1 — di-clip sendiri */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <Image
          src={portraitCoverOf(bg)}
          alt=""
          fill
          sizes="100vw"
          className="scale-110 object-cover opacity-40 blur-2xl"
        />
        {/* Overlay MULAI SOLID (from-abyss) biar nyambung mulus dengan
            ujung bawah hero yang solid, tengah semi-transparan supaya
            wallpaper kelihatan, bawah solid lagi ke section berikut. */}
        <div className="absolute inset-0 bg-gradient-to-b from-abyss via-abyss/55 to-abyss" />
      </div>

      {/* Judul tetap di wadah 7xl (sejajar konten lain) */}
      <div className="relative mx-auto max-w-7xl px-4 pt-10 md:px-6 md:pt-14">
        <h2 id="best-sellers-title" className="text-xl font-bold tracking-[-0.02em] text-white md:text-2xl">
          Best sellers
        </h2>
      </div>

        {/* Carousel FULL-BLEED selebar viewport (di luar wadah judul).
            Panah absolute di SPACE KOSONG tepi viewport — di luar kartu
            pertama/terakhir (sesuai tanda merah user). Track padding
            disamakan dengan tepi judul (max-w-7xl) supaya kartu #1
            sejajar judul saat posisi awal (tidak terlalu ke kanan). */}
        <div className="relative mt-6 pb-10 md:pb-14">
          {/* Panah kiri — space kosong tepi viewport, luar kartu #1 */}
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            disabled={!canLeft}
            aria-label="Scroll best sellers left"
            className={cn(
              "absolute top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white shadow-[0_8px_24px_rgb(0_0_0/0.5)] backdrop-blur transition hover:bg-black/85",
              "left-[max(0.5rem,calc((100vw_-_80rem)/2_-_3.75rem))]",
              !canLeft && "invisible",
            )}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          {/* Panah kanan — space kosong tepi viewport, luar kartu terakhir */}
          <button
            type="button"
            onClick={() => scrollBy(1)}
            disabled={!canRight}
            aria-label="Scroll best sellers right"
            className={cn(
              "absolute top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white shadow-[0_8px_24px_rgb(0_0_0/0.5)] backdrop-blur transition hover:bg-black/85",
              "right-[max(0.5rem,calc((100vw_-_80rem)/2_-_3.75rem))]",
              !canRight && "invisible",
            )}
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Track: padding kiri-kanan = tepi judul (max-w-7xl) supaya
              posisi awal kartu #1 sejajar judul. TANPA loop — mentok =
              berhenti. pt-2 = ruang hover lift. Wheel vertikal bubble. */}
          <div
            ref={trackRef}
            onScroll={updateArrows}
            className="scrollbar-none flex gap-3 overflow-x-auto scroll-smooth px-[max(1rem,calc((100vw_-_80rem)/2_+_1rem))] pb-2 pt-2 md:px-[max(1.5rem,calc((100vw_-_80rem)/2_+_1.5rem))]"
          >
            {games.map((g, i) => (
              <Link
                key={g.id}
                href={`/games/${g.id}`}
                aria-label={`${i + 1}. ${g.title}`}
                data-card
                className="group relative block w-[248px] shrink-0 sm:w-[272px] lg:w-[300px]"
              >
                {/* Angka raksasa outline — ABSOLUTE di belakang kartu.
                    Offset kartu FIX (ml) sehingga ukuran poster SERAGAM
                    untuk 1 digit maupun 2 digit ("10"). */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "font-display pointer-events-none absolute -left-1 bottom-0 select-none font-black italic leading-[0.75] text-transparent",
                    i + 1 >= 10
                      ? "text-[6.5rem] sm:text-[7rem] lg:text-[8rem]"
                      : "text-[9rem] sm:text-[10rem] lg:text-[11rem]",
                  )}
                  style={{ WebkitTextStroke: "2px rgb(255 255 255 / 0.28)" }}
                >
                  {i + 1}
                </span>
                {/* Kartu portrait — RASIO ASLI capsule Steam 2:3
                    (600x900 via library_600x900_2x.jpg). Poster bersih
                    tanpa judul/harga (plek referensi) — info tetap ada
                    di aria-label link untuk screen reader. */}
                <span className="relative z-10 ml-[64px] block aspect-[2/3] overflow-hidden rounded-lg border border-white/10 bg-panel shadow-[0_18px_50px_-16px_rgb(0_0_0/0.8)] transition-transform duration-300 group-hover:-translate-y-1.5 sm:ml-[70px] lg:ml-[78px]">
                  <Image
                    src={portraitCoverOf(g)}
                    alt={`${g.title} cover`}
                    fill
                    sizes="300px"
                    loading={i < 6 ? "eager" : "lazy"}
                    className="object-cover"
                  />
                </span>
              </Link>
            ))}
          </div>
        </div>
    </section>
  );
}
