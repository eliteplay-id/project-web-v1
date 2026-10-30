"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { catalogGenres } from "@/lib/catalog";
import type { Game } from "@/data/games";
import { discountPct } from "@/lib/format";
import { GameCard } from "@/components/game-card";
import { cn } from "@/lib/utils";

const sorts = [
  { id: "popular", label: "Most popular" },
  { id: "cheap", label: "Cheapest" },
  { id: "reviews", label: "Most reviewed" },
  { id: "discount", label: "Biggest discount" },
] as const;

export default function CatalogClient({ games }: { games: Game[] }) {
  const params = useSearchParams();
  const q = (params.get("q") ?? "").toLowerCase();
  const genre = params.get("genre") ?? "";
  const sort = params.get("sort") ?? "popular";
  const allGenres = catalogGenres(games);

  const filtered = useMemo(() => {
    let list = [...games];
    if (q) list = list.filter((g) => g.title.toLowerCase().includes(q) || g.genres.some((x) => x.toLowerCase().includes(q)));
    if (genre) list = list.filter((g) => g.genres.includes(genre));
    switch (sort) {
      case "cheap":
        list.sort((a, b) => a.price - b.price);
        break;
      case "reviews":
        list.sort((a, b) => (b.steamReviews ?? 0) - (a.steamReviews ?? 0));
        break;
      case "discount":
        list.sort((a, b) => discountPct(b.original, b.price) - discountPct(a.original, a.price));
        break;
      default:
        list.sort((a, b) => (b.steamReviews ?? 0) - (a.steamReviews ?? 0));
    }
    return list;
  }, [games, q, genre, sort]);

  const href = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    const s = next.toString();
    return s ? `/games?${s}` : "/games";
  };

  return (
    <main className="mx-auto max-w-7xl flex-1 px-4 py-10">
      <p className="text-xs font-bold uppercase tracking-widest text-elite-red">Catalog</p>
      <h1 className="font-display mt-1 text-3xl font-black uppercase italic md:text-4xl">
        All games <span className="text-elite-cyan tabular">({filtered.length})</span>
      </h1>

      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by genre">
          <Link
            href={href({ genre: "" })}
            aria-current={!genre ? "true" : undefined}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-bold",
              !genre ? "btn-elite border-transparent text-white" : "border-line bg-panel hover:border-elite-blue",
            )}
          >
            All
          </Link>
          {allGenres.map((g) => (
            <Link
              key={g}
              href={href({ genre: g })}
              aria-current={genre === g ? "true" : undefined}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-bold",
                genre === g ? "btn-elite border-transparent text-white" : "border-line bg-panel hover:border-elite-blue",
              )}
            >
              {g}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Sort games">
          {sorts.map((s) => (
            <Link
              key={s.id}
              href={href({ sort: s.id })}
              aria-current={sort === s.id ? "true" : undefined}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-bold uppercase",
                sort === s.id ? "border-elite-blue bg-panel-2 text-elite-cyan" : "border-line bg-panel text-muted hover:text-elite-silver",
              )}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <SearchX className="h-10 w-10 text-muted" aria-hidden="true" />
          <p className="font-display text-xl font-bold uppercase italic">No games found</p>
          <p className="text-sm text-muted">Try another title or clear the genre filter.</p>
          <Link href="/games" className="btn-elite mt-2 rounded-lg px-5 py-2.5 text-sm font-bold uppercase italic text-white">
            Reset filters
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((g) => (
            <GameCard key={g.id} game={g} />
          ))}
        </div>
      )}
    </main>
  );
}
