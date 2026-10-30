"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2, X, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatIDR } from "@/lib/format";
import { coverOf } from "@/data/games";

export function CartSheet() {
  const { items, total, open, setOpen, remove, clear } = useCart();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <button
        type="button"
        aria-label="Close cart"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-black/70"
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-line bg-panel" style={{ overscrollBehavior: "contain" }}>
        <div className="flex items-center justify-between border-b border-line p-4">
          <h2 className="font-display text-lg font-black uppercase italic">
            Your Cart <span className="text-elite-cyan tabular">({items.reduce((s, i) => s + i.qty, 0)})</span>
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close cart"
            className="rounded-lg p-2 hover:bg-panel-2 focus-visible:ring-2 focus-visible:ring-elite-blue"
            style={{ touchAction: "manipulation" }}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <ShoppingBag className="h-10 w-10 text-muted" aria-hidden="true" />
              <p className="font-semibold">Cart is empty.</p>
              <p className="text-sm text-muted">Add a game and it shows up here.</p>
              <Link
                href="/games"
                onClick={() => setOpen(false)}
                className="btn-elite mt-2 rounded-lg px-4 py-2 text-sm font-bold uppercase italic text-white"
              >
                Browse Games
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {items.map((item) => (
                <li key={`${item.game.id}__${item.edition}`} className="flex gap-3 rounded-xl border border-line bg-panel-2 p-3">
                  <Image
                    src={coverOf(item.game)}
                    alt=""
                    width={120}
                    height={56}
                    loading="lazy"
                    className="h-14 w-[120px] shrink-0 rounded-md object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{item.game.title}</p>
                    <p className="text-xs text-muted">
                      {item.edition} · Qty {item.qty}
                    </p>
                    <p className="mt-1 text-sm font-bold text-elite-cyan tabular">{formatIDR(item.price * item.qty)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(item.game.id, item.edition)}
                    aria-label={`Remove ${item.game.title}`}
                    className="self-start rounded-lg p-1.5 text-muted hover:text-elite-red focus-visible:ring-2 focus-visible:ring-elite-red"
                    style={{ touchAction: "manipulation" }}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-line p-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <button type="button" onClick={clear} className="text-muted hover:text-elite-red">
                Clear all
              </button>
              <p className="font-display text-lg font-black italic tabular">
                Total: <span className="text-elite-cyan">{formatIDR(total)}</span>
              </p>
            </div>
            <Link
              href="/checkout"
              onClick={() => setOpen(false)}
              className="btn-elite block rounded-lg py-3 text-center font-display text-sm font-black uppercase italic text-white hover:brightness-110"
            >
              Checkout
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
