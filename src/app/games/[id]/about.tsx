"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * About plek Steam: HTML about_the_game Steam dirender penuh 1:1
 * (paragraf, gambar, video, list) — tanpa clamp/potongan.
 * HTML sudah disanitasi di server (allowlist tag, hanya host Steam).
 * Mode `clamp`: teks dipotong ala referensi IG ("... Read more")
 * dengan tombol expand — dipakai di section About halaman detail.
 */
export function About({
  paragraphs,
  html,
  title,
  bare,
  clamp,
}: {
  paragraphs: string[];
  html?: string;
  title: string;
  /** bare: tanpa kartu — dipakai di dalam section About ala IG. */
  bare?: boolean;
  /** clamp: potong teks + tombol "... Read more" ala IG. */
  clamp?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const collapsed = clamp && !open;

  const toggle = (
    <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      aria-expanded={open}
      className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-elite-cyan hover:underline"
      style={{ touchAction: "manipulation" }}
    >
      {clamp ? (
        open ? "Show less" : "... Read more"
      ) : (
        <>
          {open ? "Show less" : "Read more"}
          <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} aria-hidden="true" />
        </>
      )}
    </button>
  );

  const body = html ? (
    <>
      <div className="relative m-0 p-0">
        <div
          className={cn(
            "steam-about m-0 p-0 text-sm leading-9 text-elite-silver/90",
            collapsed && "max-h-[19rem] overflow-hidden",
          )}
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {collapsed && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#08080c] to-transparent"
          />
        )}
      </div>
      {clamp ? toggle : null}
    </>
  ) : paragraphs.length === 0 ? (
    <p className="text-sm leading-9 text-muted">
      Full description is loading from Steam. Check back soon or view the{" "}
      <span className="font-bold text-elite-silver">screenshots above</span> for a first look.
    </p>
  ) : (
    <>
      <div className="relative">
        <div
          className={cn(
            "space-y-8 text-sm leading-9 text-elite-silver/90",
            collapsed && "max-h-[19rem] overflow-hidden",
          )}
        >
          <p>{paragraphs[0]}</p>
          <div className={cn("space-y-8", !open && paragraphs.length > 1 && "hidden")}>
            {paragraphs.slice(1).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
        {collapsed && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#08080c] to-transparent"
          />
        )}
      </div>
      {clamp || paragraphs.length > 1 ? toggle : null}
    </>
  );

  if (bare) return <div className="m-0 p-0">{body}</div>;

  return (
    <section aria-labelledby="about" className="rounded-xl border border-line bg-panel p-6">
      <h2 id="about" className="text-lg font-bold tracking-[-0.02em]">
        About {title}
      </h2>
      {body}
    </section>
  );
}
