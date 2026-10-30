"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Game } from "@/data/games";

export interface CartItem {
  game: Game;
  edition: string;
  price: number;
  qty: number;
}

interface CartCtx {
  items: CartItem[];
  count: number;
  total: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (game: Game, edition?: string) => void;
  remove: (id: string, edition: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartCtx | null>(null);
const KEY = "eliteplay-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Baca cart tersimpan sekali saat mount (lazy init, tanpa cascading render).
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      if (typeof window === "undefined") return [];
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  const add = useCallback((game: Game, edition = "Standard") => {
    const ed = game.editions.find((e) => e.name === edition) ?? game.editions[0];
    const price = game.price + ed.priceDelta;
    const key = `${game.id}__${ed.name}`;
    setItems((prev) => {
      const found = prev.find((i) => `${i.game.id}__${i.edition}` === key);
      if (found) {
        return prev.map((i) =>
          `${i.game.id}__${i.edition}` === key ? { ...i, qty: i.qty + 1 } : i,
        );
      }
      return [...prev, { game, edition: ed.name, price, qty: 1 }];
    });
    setOpen(true);
  }, []);

  const remove = useCallback((id: string, edition: string) => {
    setItems((prev) => prev.filter((i) => !(i.game.id === id && i.edition === edition)));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const { count, total } = useMemo(() => {
    return {
      count: items.reduce((s, i) => s + i.qty, 0),
      total: items.reduce((s, i) => s + i.price * i.qty, 0),
    };
  }, [items]);

  const value = useMemo(
    () => ({ items, count, total, open, setOpen, add, remove, clear }),
    [items, count, total, open, add, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartCtx {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
