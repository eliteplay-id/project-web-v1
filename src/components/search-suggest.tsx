"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, TrendingUp } from "lucide-react";
import { discountPct, formatIDR } from "@/lib/format";
import { cn } from "@/lib/utils";

interface SuggestItem {
  id: string;
  title: string;
  price: number;
  original: number;
  cover: string;
  genres: string[];
}

let cache: SuggestItem[] | null = null;

async function loadSuggest(): Promise<SuggestItem[]> {
  if (cache) return cache;
  const res = await fetch("/api/suggest");
  if (!res.ok) return [];
  const json = (await res.json()) as { items: SuggestItem[] };
  cache = json.items ?? [];
  return cache;
}

function Highlight({ text, q }: { text: string; q: string }) {
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (!q || i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-transparent font-bold text-elite-cyan">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

export function SearchSuggest({
  query,
  onPick,
}: {
  query: string;
  onPick: () => void;
}) {
  const [items, setItems] = useState<SuggestItem[]>(cache ?? []);
  const [active, setActive] = useState(-1);
  const [pos, setPos] = useState<{ left: number; top: number; width: number } | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    loadSuggest().then(setItems).catch(() => {});
  }, []);

  // Posisi dropdown FIXED tepat di bawah pil navbar (id="nav-pill").
  // Di luar alur layout — header & konten halaman tidak ikut melar.
  useEffect(() => {
    const place = () => {
      const pill = document.getElementById("nav-pill");
      if (!pill) return;
      const r = pill.getBoundingClientRect();
      setPos({ left: r.left, top: r.bottom + 8, width: r.width });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, { passive: true });
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place);
    };
  }, []);

  const q = useDeferredValue(query.trim().toLowerCase());

  const results = useMemo(() => {
    if (!q) return items.slice(0, 5);
    return items
      .filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.genres.some((x) => x.toLowerCase().includes(q)),
      )
      .slice(0, 6);
  }, [items, q]);

  // Reset highlight tiap query berubah — pola "adjust state during render"
  // (React docs): tanpa effect, tanpa cascading render.
  const [prevQ, setPrevQ] = useState(q);
  if (prevQ !== q) {
    setPrevQ(q);
    if (active !== -1) setActive(-1);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (results.length === 0) return;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => {
          const next =
            e.key === "ArrowDown"
              ? (a + 1) % results.length
              : (a - 1 + results.length) % results.length;
          listRef.current
            ?.querySelector<HTMLElement>(`[data-i="${next}"]`)
            ?.scrollIntoView({ block: "nearest" });
          return next;
        });
      } else if (e.key === "Enter" && active >= 0 && results[active]) {
        router.push(`/games/${results[active].id}`);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [results, active, router]);

  if (items.length === 0 || !pos) return null;

  return (
    <div
      className="suggest-drop fixed z-50 overflow-hidden rounded-2xl border border-white/10 bg-[#101018]/95 shadow-[0_24px_60px_-12px_rgb(0_0_0/0.85)] backdrop-blur-[60px]"
      style={{ left: pos.left, top: pos.top, width: pos.width }}
    >
      <div
        ref={listRef}
        role="listbox"
        aria-label="Game suggestions"
        className="max-h-[340px] overflow-y-auto p-2"
      >
        {!q && (
          <p className="flex items-center gap-1.5 px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-widest text-white/50">
            <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" /> Popular
          </p>
        )}
        {/* Kosong tapi ada hasil (belum ngetik): daftar + footer Advanced search. */}
        {results.length === 0 && q ? (
          /* Ngetik tapi tidak cocok: No result + Recently viewed (kayak referensi). */
          <>
            <div className="flex flex-col items-center gap-1 px-4 py-6 text-center">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-elite-red/15">
                <Search className="h-5 w-5 text-elite-red" aria-hidden="true" />
              </span>
              <p className="mt-2 text-base font-bold text-white">No result found</p>
              <p className="text-xs text-white/50">No products match your search</p>
            </div>
            <div className="border-t border-white/10 px-3 pb-2 pt-3">
              <p className="px-1 text-sm font-semibold text-white/85">Recently viewed</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {items.slice(0, 3).map((g) => (
                  <Link key={g.id} href={`/games/${g.id}`} onClick={onPick} className="group min-w-0">
                    <span className="relative block aspect-video overflow-hidden rounded-lg">
                      <Image src={g.cover} alt="" fill sizes="160px" loading="lazy" className="object-cover" />
                    </span>
                    <span className="mt-1 block truncate text-[11px] text-white/70 group-hover:text-elite-cyan">
                      {g.title}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </>
        ) : (
          results.map((g, i) => {
            const pct = discountPct(g.original, g.price);
            return (
              <Link
                key={g.id}
                data-i={i}
                href={`/games/${g.id}`}
                role="option"
                aria-selected={active === i}
                onClick={onPick}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-2 py-2 transition-colors",
                  active === i ? "bg-white/10" : "hover:bg-white/[0.07]",
                )}
              >
                <span className="relative h-11 w-24 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={g.cover}
                    alt=""
                    fill
                    sizes="96px"
                    loading="lazy"
                    className="object-cover"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-white">
                    <Highlight text={g.title} q={q} />
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] text-white/50">
                    {g.genres.join(" · ")}
                  </span>
                </span>
                {pct > 0 && (
                  <span className="shrink-0 rounded bg-elite-red px-1.5 py-0.5 text-[11px] font-black text-white tabular">
                    -{pct}%
                  </span>
                )}
                <span className="shrink-0 text-sm font-black text-elite-cyan tabular">
                  {formatIDR(g.price)}
                </span>
              </Link>
            );
          })
        )}
      </div>
      {(q ? results.length > 0 : true) && (
        <Link
          href={q ? `/games?q=${encodeURIComponent(q)}` : "/games"}
          onClick={onPick}
          className="block border-t border-white/10 px-4 py-2.5 text-center text-xs font-semibold text-white/70 transition-colors hover:bg-white/5 hover:text-white"
        >
          Advanced search
        </Link>
      )}
    </div>
  );
}
