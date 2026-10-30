"use client";

import { useState } from "react";
import type { Game } from "@/data/games";
import { discountPct, formatIDR } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";
import { ChevronDown, Heart, ShoppingCart, Zap } from "lucide-react";

/**
 * BuyBox dua mode:
 * - default: pilih edisi (radio) + Add to cart / Buy now (dipakai halaman lain).
 * - ig: dropdown edisi + blok harga ala Instant Gaming
 *   (retail coret · -diskon% · total) + Add to cart + wishlist.
 * - editionOnly: tombol Add to cart untuk satu edisi (kartu Editions).
 */
export function BuyBox({
  game,
  compact,
  ig,
  editionOnly,
}: {
  game: Game;
  compact?: boolean;
  ig?: boolean;
  editionOnly?: string;
}) {
  const { add } = useCart();
  const initial = editionOnly ?? game.editions[0]?.name ?? "Standard";
  const [edition, setEdition] = useState(initial);
  const [open, setOpen] = useState(false);
  const ed = game.editions.find((e) => e.name === edition) ?? game.editions[0];
  const price = game.price + (ed?.priceDelta ?? 0);
  const retail = game.original + (ed?.priceDelta ?? 0);
  const pct = discountPct(retail, price);

  if (editionOnly) {
    return (
      <button
        type="button"
        onClick={() => add(game, editionOnly)}
        className="btn-elite inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-bold text-white hover:brightness-110 focus-visible:ring-2 focus-visible:ring-elite-cyan"
        style={{ touchAction: "manipulation" }}
      >
        <ShoppingCart className="h-4 w-4" aria-hidden="true" />
        Add to cart
      </button>
    );
  }

  if (ig) {
    return (
      <div>
        {/* Pilih edisi ala IG (dropdown) */}
        {game.editions.length > 1 ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-haspopup="listbox"
              className="flex w-full items-center justify-between gap-2 rounded-lg border border-line bg-panel-2 px-4 py-2.5 text-sm font-bold hover:border-elite-blue"
              style={{ touchAction: "manipulation" }}
            >
              {ed?.name ?? "Standard"}
              <ChevronDown className={cn("h-4 w-4 text-muted transition-transform", open && "rotate-180")} aria-hidden="true" />
            </button>
            {open && (
              <ul role="listbox" aria-label="Game edition" className="absolute inset-x-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-lg border border-line bg-panel-2 shadow-xl">
                {game.editions.map((e) => (
                  <li key={e.name}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={edition === e.name}
                      onClick={() => { setEdition(e.name); setOpen(false); }}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm hover:bg-white/5",
                        edition === e.name ? "font-bold text-elite-cyan" : "text-elite-silver/85",
                      )}
                    >
                      {e.name}
                      <span className="text-xs tabular text-muted">
                        {formatIDR(game.price + e.priceDelta)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <p className="text-sm font-bold">{ed?.name ?? "Standard"}</p>
        )}

        {/* Blok harga ala IG: retail coret · -diskon% · total */}
        <div className="mt-3 flex flex-wrap items-end gap-x-3 gap-y-1">
          {pct > 0 && (
            <>
              <s className="text-sm text-muted tabular">{formatIDR(retail)}</s>
              <span className="rounded bg-elite-red px-1.5 py-0.5 text-xs font-black text-white tabular">
                -{pct}%
              </span>
            </>
          )}
          <span className="text-3xl font-black tracking-[-0.02em] text-elite-cyan tabular">
            {formatIDR(price)}
          </span>
        </div>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            aria-label="Add to wishlist"
            title="Add to wishlist"
            className="grid w-12 shrink-0 place-items-center rounded-lg border border-line bg-panel-2 hover:border-elite-blue"
            style={{ touchAction: "manipulation" }}
          >
            <Heart className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => add(game, edition)}
            className="btn-elite inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-bold text-white hover:brightness-110 focus-visible:ring-2 focus-visible:ring-elite-cyan"
            style={{ touchAction: "manipulation" }}
          >
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            Add to cart
          </button>
        </div>
        <button
          type="button"
          onClick={() => add(game, edition)}
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-elite-blue/50 px-3 py-2.5 text-[13px] font-bold text-elite-cyan hover:bg-elite-blue/10"
          style={{ touchAction: "manipulation" }}
        >
          <Zap className="h-4 w-4" aria-hidden="true" />
          Buy now — instant key by email
        </button>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border border-line bg-panel", compact ? "p-4" : "p-5")}>
      <p className="text-xs font-bold uppercase tracking-widest text-muted">Choose edition</p>
      <div className="mt-2.5 flex flex-wrap gap-2" role="radiogroup" aria-label="Game edition">
        {game.editions.map((e) => (
          <button
            key={e.name}
            type="button"
            role="radio"
            aria-checked={edition === e.name}
            onClick={() => setEdition(e.name)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-[13px] font-semibold",
              edition === e.name
                ? "border-elite-blue bg-panel-2 text-elite-cyan"
                : "border-line hover:border-elite-blue",
            )}
            style={{ touchAction: "manipulation" }}
          >
            {e.name}
            {e.priceDelta > 0 && <span className="tabular"> +{formatIDR(e.priceDelta)}</span>}
          </button>
        ))}
      </div>

      <div className="mt-3.5 flex items-end justify-between border-t border-line pt-3.5">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">You pay</p>
          <p className="text-2xl font-bold tracking-[-0.02em] text-elite-cyan tabular">{formatIDR(price)}</p>
        </div>
        <p className="text-right text-xs text-muted">
          Instant key
          <br />
          by email
        </p>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => add(game, edition)}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-line bg-panel-2 px-3 py-2.5 text-[13px] font-semibold hover:border-elite-blue focus-visible:ring-2 focus-visible:ring-elite-blue"
          style={{ touchAction: "manipulation" }}
        >
          <ShoppingCart className="h-4 w-4" aria-hidden="true" />
          Add to cart
        </button>
        <button
          type="button"
          onClick={() => add(game, edition)}
          className="btn-elite inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-bold text-white hover:brightness-110 focus-visible:ring-2 focus-visible:ring-elite-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-abyss"
          style={{ touchAction: "manipulation" }}
        >
          <Zap className="h-4 w-4" aria-hidden="true" />
          Buy now
        </button>
      </div>
    </div>
  );
}
