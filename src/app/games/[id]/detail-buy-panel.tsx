"use client";

import { useState } from "react";
import { ChevronDown, Heart, ShoppingCart, Tag } from "lucide-react";
import type { Game } from "@/data/games";
import { discountPct, formatIDR } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

/**
 * Panel beli plek screenshot referensi: dropdown edisi sempit-tengah,
 * harga sebaris tengah (coret + badge % + total), tombol wishlist BULAT
 * + Add to cart gradasi orange full. Tinggi FIX via slot reserved:
 * judul 2 baris + slot dropdown SELALU ada (placeholder kalau 1 edisi)
 * → tombol Add to cart SEJAJAR pantat cover di SEMUA game.
 */
export function DetailBuyPanel({ game }: { game: Game }) {
  const { add } = useCart();
  const [edition, setEdition] = useState(game.editions[0]?.name ?? "Standard");
  const [open, setOpen] = useState(false);
  const [wished, setWished] = useState(false);
  const ed = game.editions.find((e) => e.name === edition) ?? game.editions[0];
  const price = game.price + (ed?.priceDelta ?? 0);
  const retail = game.original + (ed?.priceDelta ?? 0);
  const pct = discountPct(retail, price);

  return (
    <div className="mt-4 flex flex-1 flex-col">
      {/* Slot dropdown edisi: SELALU setinggi tombol dropdown (≈46px).
          Game 1 edisi → placeholder tak terlihat, tombol tetap sejajar. */}
      <div className="mx-auto w-full max-w-[16rem]">
        {game.editions.length > 1 ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-haspopup="listbox"
              className="flex w-full items-center justify-between gap-2 rounded-lg border border-white/20 bg-black/40 px-4 py-2.5 text-sm font-semibold hover:border-white/50"
              style={{ touchAction: "manipulation" }}
            >
              {ed?.name ?? "Standard"}
              <ChevronDown
                className={cn("h-4 w-4 text-white/60 transition-transform", open && "rotate-180")}
                aria-hidden="true"
              />
            </button>
            {open && (
              <ul
                role="listbox"
                aria-label="Game edition"
                className="absolute inset-x-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-lg border border-white/15 bg-[#232329] text-left shadow-xl"
              >
                {game.editions.map((e) => (
                  <li key={e.name}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={edition === e.name}
                      onClick={() => {
                        setEdition(e.name);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 px-4 py-2.5 text-sm hover:bg-white/5",
                        edition === e.name ? "font-bold text-elite-cyan" : "text-white/80",
                      )}
                    >
                      {e.name}
                      <span className="text-xs tabular text-white/50">
                        {formatIDR(game.price + e.priceDelta)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <p aria-hidden="true" className="select-none px-4 py-2.5 text-sm font-semibold opacity-0">
            {ed?.name ?? "Standard"}
          </p>
        )}
      </div>

      {/* Harga sebaris tengah: ikon tag + coret + % orange + total */}
      <p className="mt-4 flex min-h-[3rem] flex-wrap items-baseline justify-center gap-x-4 gap-y-2">
        {pct > 0 ? (
          <>
            <Tag className="h-4 w-4 self-center text-white/70" aria-hidden="true" />
            <s className="text-sm text-white/70 tabular">{formatIDR(retail)}</s>
            <span className="text-sm font-bold text-[#ff7a1a] tabular">-{pct}%</span>
          </>
        ) : (
          <span className="text-sm text-transparent tabular" aria-hidden="true">.</span>
        )}
        <span className="text-4xl font-black tracking-tight text-white tabular">
          {formatIDR(price)}
        </span>
      </p>

      {/* Spacer: dorong tombol ke bawah panel = sejajar pantat cover */}
      <div className="flex-1" aria-hidden="true" />

      {/* Wishlist bulat + Add to cart pil gradasi orange full */}
      <div className="mt-5 flex items-center gap-5">
        <button
          type="button"
          onClick={() => setWished((v) => !v)}
          aria-pressed={wished}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          title="Add to wishlist"
          className={cn(
            "grid h-12 w-12 shrink-0 place-items-center rounded-full border transition-colors",
            wished
              ? "border-elite-red bg-elite-red/15 text-elite-red"
              : "border-white/25 bg-black/30 text-white/80 hover:border-white/60 hover:text-white",
          )}
          style={{ touchAction: "manipulation" }}
        >
          <Heart className={cn("h-5 w-5", wished && "fill-current")} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => add(game, edition)}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff6a00] to-[#ff2d2d] px-3 py-3.5 text-sm font-bold text-white shadow-[0_8px_24px_-8px_rgb(255_106_0/0.7)] transition hover:brightness-110 focus-visible:ring-2 focus-visible:ring-white/70"
          style={{ touchAction: "manipulation" }}
        >
          <ShoppingCart className="h-4 w-4" aria-hidden="true" />
          Add to cart
        </button>
      </div>
    </div>
  );
}
