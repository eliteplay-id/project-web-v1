import Image from "next/image";
import Link from "next/link";
import { BadgeIndianRupee, Crown, Flame, Sparkles, type LucideIcon } from "lucide-react";
import type { Game } from "@/data/games";
import { portraitCoverOf } from "@/data/games";
import { formatIDR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { AddToCartButton } from "./add-to-cart";

/**
 * Badge promo toko (Best Seller / Flash Sale / Cheapest / New).
 * TIAP badge punya IKON + WARNA SENDIRI (tidak ada yang kembar):
 *   Best Seller = Crown emas, Flash Sale = Flame merah, Cheapest =
 *   BadgeIndianRupee hijau, New = Sparkles cyan.
 */
const badgeConfig: Record<string, { className: string; Icon: LucideIcon }> = {
  "Best Seller": { className: "bg-amber-400 text-black", Icon: Crown },
  "Flash Sale": { className: "btn-danger text-white", Icon: Flame },
  Cheapest: { className: "bg-emerald-500 text-black", Icon: BadgeIndianRupee },
  New: { className: "btn-elite text-white", Icon: Sparkles },
};

export function Badge({ label }: { label: string }) {
  const config = badgeConfig[label];
  const Icon = config?.Icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide",
        config?.className ?? "bg-white/10 text-white",
      )}
    >
      {Icon && <Icon className="h-3 w-3" aria-hidden="true" />}
      {label}
    </span>
  );
}

/**
 * Portrait card, Steam-library style (2:3 = rasio ASLI capsule Steam
 * 600x900 via library_600x900_2x.jpg). Info overlays the bottom of the
 * art like a library capsule. Minimal: judul + harga final saja.
 */
export function GameCard({ game }: { game: Game }) {
  return (
    <article className="card-hover group relative flex flex-col overflow-hidden rounded-xl border border-line bg-panel">
      <Link
        href={`/games/${game.id}`}
        aria-label={game.title}
        className="relative block aspect-[2/3] w-full overflow-hidden"
      >
        <Image
          src={portraitCoverOf(game)}
          alt={`${game.title} cover`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          loading="lazy"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Badge promo toko (Best Seller / Flash Sale / ...) — tiap badge
            ikon + warna sendiri, pojok kiri atas cover. */}
        {game.badge && (
          <div className="absolute left-3 top-3 z-10">
            <Badge label={game.badge} />
          </div>
        )}
        {/* bottom info gradient */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-2/3"
          style={{ background: "linear-gradient(to top, rgb(8 8 12 / 0.96) 0%, rgb(8 8 12 / 0.55) 55%, transparent 100%)" }}
        />
        <div className="absolute inset-x-0 bottom-0 px-6 pb-7 pt-4">
          <h3 className="text-sm font-semibold leading-relaxed tracking-[-0.01em] line-clamp-2 min-h-[2.6em] group-hover:text-elite-cyan">
            {game.title}
          </h3>
          <p className="mt-4 text-base font-semibold tracking-[-0.01em] text-elite-cyan tabular">
            {formatIDR(game.price)}
          </p>
        </div>
      </Link>
      <div className="p-5 pt-3">
        <AddToCartButton game={game} full />
      </div>
    </article>
  );
}
