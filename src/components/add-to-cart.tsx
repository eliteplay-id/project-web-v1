"use client";

import { ShoppingCart } from "lucide-react";
import type { Game } from "@/data/games";
import { useCart } from "@/lib/cart";

export function AddToCartButton({ game, edition, full }: { game: Game; edition?: string; full?: boolean }) {
  const { add } = useCart();
  return (
    <button
      type="button"
      onClick={() => add(game, edition)}
      aria-label={`Add ${game.title} to cart`}
      className={`btn-elite inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold tracking-wide text-white transition hover:brightness-110 focus-visible:ring-2 focus-visible:ring-elite-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-abyss ${full ? "w-full" : "shrink-0"}`}
      style={{ touchAction: "manipulation" }}
    >
      <ShoppingCart className="h-3.5 w-3.5" aria-hidden="true" />
      Buy
    </button>
  );
}
