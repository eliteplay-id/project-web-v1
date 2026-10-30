"use client";

import { useState } from "react";
import { Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ReqGroup {
  label: string;
  value: string;
}

/**
 * Steam-style system requirements: Minimum / Recommended.
 * Mode `twoCol` plek IG Configurations: dua kolom berdampingan,
 * tiap kolom judul kecil + baris "Label:" + nilai. Mode `bare`:
 * tanpa kartu — dipakai di section Configurations halaman detail.
 */
export function Requirements({
  minimum,
  recommended,
  bare,
  twoCol,
}: {
  minimum: ReqGroup[];
  recommended: ReqGroup[];
  bare?: boolean;
  twoCol?: boolean;
}) {
  const [tab, setTab] = useState<"min" | "rec">("min");
  const rows = tab === "min" ? minimum : recommended;

  // Steam tidak kasih spek (atau hanya kasih satu sisi) — jangan tampil kosong diam-diam.
  if (minimum.length === 0 && recommended.length === 0) {
    const empty = (
      <p className="mt-5 text-sm leading-8 text-muted">
        PC specs are loading from Steam. As a rule of thumb: Windows 10/11 64-bit, 8 GB RAM,
        and a GTX 1060-class GPU run most modern titles — confirm on the Steam page before buying.
      </p>
    );
    if (bare) return <div>{empty}</div>;
    return (
      <section aria-labelledby="req" className="rounded-xl border border-line bg-panel p-6">
        <h2 id="req" className="flex items-center gap-2 text-lg font-bold tracking-[-0.02em]">
          <Cpu className="h-5 w-5 text-elite-cyan" aria-hidden="true" /> System Requirements
        </h2>
        {empty}
      </section>
    );
  }

  // Mode IG: dua kolom berdampingan, tanpa tab.
  if (twoCol) {
    const col = (label: string, rows: ReqGroup[]) => (
      <div className="min-w-0">
        <h3 className="text-sm font-bold tracking-[-0.01em] text-elite-silver">{label}*</h3>
        {rows.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Not published by the developer.</p>
        ) : (
          <dl className="mt-4 space-y-3 text-[13px] leading-7">
            {rows.map((r) => (
              <div key={r.label}>
                <dt className="font-bold text-elite-silver">{r.label}:</dt>
                <dd className="text-elite-silver/80">{r.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    );
    return (
      <div className="grid gap-10 md:grid-cols-2">
        {col("minimum", minimum)}
        {col("recommended", recommended.length > 0 ? recommended : minimum)}
      </div>
    );
  }

  return (
    <section aria-labelledby="req" className="rounded-xl border border-line bg-panel p-6">
      <h2 id="req" className="flex items-center gap-2 text-lg font-bold tracking-[-0.02em]">
        <Cpu className="h-5 w-5 text-elite-cyan" aria-hidden="true" /> System Requirements
      </h2>

      <div className="mt-4 inline-flex rounded-lg border border-line bg-panel-2 p-1" role="tablist" aria-label="Requirement type">
        {(
          [
            ["min", "Minimum"],
            ["rec", "Recommended"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              "rounded-md px-4 py-1.5 text-xs font-bold uppercase",
              tab === id ? "btn-elite text-white" : "text-muted hover:text-elite-silver",
            )}
            style={{ touchAction: "manipulation" }}
          >
            {label}
          </button>
        ))}
      </div>

      <dl className="mt-4">
        {rows.map((r) => (
          <div key={r.label} className="grid grid-cols-[110px_1fr] gap-3 border-t border-line py-2.5 text-sm first:border-t-0 sm:grid-cols-[140px_1fr]">
            <dt className="font-bold uppercase text-muted text-xs tracking-wide pt-0.5">{r.label}</dt>
            <dd className="text-elite-silver/90">{r.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-[11px] text-muted">
        Laptop versions of these cards may work but are not officially supported. Windows-compatible keyboard, mouse and headset required.
      </p>
    </section>
  );
}
