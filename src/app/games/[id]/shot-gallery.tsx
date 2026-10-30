"use client";

import { useState } from "react";
import Image from "next/image";
import { Expand, Play } from "lucide-react";
import type { Shot } from "@/lib/steam";
import { cn } from "@/lib/utils";

/**
 * Visuals plek referensi: 1 viewer GEDE di atas (trailer pertama,
 * klik = play inline MP4 resmi Steam) + mozaik 5 screenshot high-res
 * (path_full 1920x1080) di bawah: 1 portrait GEDE kiri + 2x2 kecil kanan.
 * Klik thumbnail = ganti viewer. Semua asset dari Steam Store API.
 * Video inline pakai <video> + poster + preload="none" (panduan Next.js
 * videos.md) — hemat bandwidth, tidak autoplay.
 */
export function ShotGallery({ shots, title }: { shots: Shot[]; title: string; compact?: boolean }) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const shot = shots[Math.min(active, shots.length - 1)];
  const isVideo = shot?.kind === "video";
  // 5 screenshot (tanpa trailer) untuk mozaik bawah.
  const images = shots.filter((s) => s.kind === "image").slice(0, 5);
  const [big, ...smalls] = images;

  const select = (index: number) => {
    setPlaying(false);
    setActive(index);
  };

  const viewerLabel = (s: Shot, i: number) =>
    s.kind === "video" ? `Play trailer: ${s.title ?? title}` : `Show screenshot ${i + 1}`;

  return (
    <div>
      {/* Viewer gede: trailer / screenshot aktif */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/15 bg-black/60">
        {shot ? (
          isVideo && playing && shot.video480 ? (
            <video
              key={shot.full}
              className="h-full w-full object-cover"
              controls
              autoPlay
              muted
              playsInline
              preload="metadata"
              poster={shot.thumb}
            >
              <source src={shot.videoMax ?? shot.video480} type="video/mp4" />
              <source src={shot.video480} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : isVideo ? (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="group/play relative block h-full w-full"
              aria-label={viewerLabel(shot, active)}
            >
              <Image
                src={shot.full}
                alt={`${title} trailer`}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                loading="lazy"
                className="object-cover"
              />
              <span className="absolute inset-0 grid place-items-center bg-black/30 transition group-hover/play:bg-black/10">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-black/70 ring-1 ring-white/30 transition group-hover/play:scale-105 group-hover/play:bg-elite-cyan/90">
                  <Play className="h-7 w-7 fill-white text-white" aria-hidden="true" />
                </span>
              </span>
              <span className="absolute left-2 top-2 rounded-md bg-black/70 px-2 py-1 text-[11px] font-bold uppercase text-white">
                Trailer
              </span>
            </button>
          ) : (
            <a href={shot.full} target="_blank" rel="noopener noreferrer" aria-label={`Open full screenshot of ${title}`}>
              <Image
                src={shot.full}
                alt={`${title} screenshot ${active + 1}`}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                loading="lazy"
                className="object-cover"
              />
              <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-[11px] font-bold uppercase text-white">
                <Expand className="h-3 w-3" aria-hidden="true" /> Full
              </span>
            </a>
          )
        ) : (
          <p className="flex h-full items-center justify-center text-sm text-muted">No screenshots yet.</p>
        )}
      </div>

      {/* Mozaik 5: 1 gede kiri + 4 kecil 2x2 kanan (plek referensi) */}
      {images.length > 1 && (
        <div className="mt-2 grid grid-cols-2 gap-2">
          {big && (
            <button
              type="button"
              onClick={() => select(shots.indexOf(big))}
              aria-label={viewerLabel(big, shots.indexOf(big))}
              className={cn(
                "relative aspect-[3/4] overflow-hidden rounded-lg border transition sm:aspect-auto sm:min-h-[320px]",
                shots.indexOf(big) === active
                  ? "border-elite-cyan ring-2 ring-elite-cyan/50"
                  : "border-white/10 opacity-80 hover:opacity-100",
              )}
            >
              <Image
                src={big.thumb}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, 30vw"
                loading="lazy"
                className="object-cover"
              />
            </button>
          )}
          <div className="grid grid-cols-2 gap-2">
            {smalls.map((s) => {
              const i = shots.indexOf(s);
              return (
                <button
                  key={`${s.thumb}-${i}`}
                  type="button"
                  onClick={() => select(i)}
                  aria-label={viewerLabel(s, i)}
                  className={cn(
                    "relative aspect-[3/4] overflow-hidden rounded-lg border transition sm:aspect-auto sm:min-h-[156px]",
                    i === active
                      ? "border-elite-cyan ring-2 ring-elite-cyan/50"
                      : "border-white/10 opacity-80 hover:opacity-100",
                  )}
                >
                  <Image
                    src={s.thumb}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 25vw, 15vw"
                    loading="lazy"
                    className="object-cover"
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Strip trailer (kalau viewer lagi di screenshot): balik ke video */}
      {shots[0]?.kind === "video" && active !== 0 && (
        <button
          type="button"
          onClick={() => select(0)}
          className="mt-2 flex w-full items-center gap-3 overflow-hidden rounded-lg border border-white/10 p-2 text-left transition hover:border-elite-cyan/60"
        >
          <span className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md">
            <Image src={shots[0].thumb} alt="" fill sizes="80px" loading="lazy" className="object-cover" />
            <span className="absolute inset-0 grid place-items-center bg-black/40" aria-hidden="true">
              <Play className="h-4 w-4 fill-white text-white" aria-hidden="true" />
            </span>
          </span>
          <span className="min-w-0">
            <span className="block truncate text-xs font-bold text-white">{shots[0].title ?? "Trailer"}</span>
            <span className="text-[11px] text-muted">Watch trailer</span>
          </span>
        </button>
      )}
    </div>
  );
}
