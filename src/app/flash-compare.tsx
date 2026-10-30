import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Flame, Timer, Trophy, Grid2x2, Rows3 } from "lucide-react";
import { Countdown } from "@/components/countdown";
import { GameCard } from "@/components/game-card";
import { coverOf, portraitCoverOf, type Game } from "@/data/games";
import { discountPct, formatIDR } from "@/lib/format";

/**
 * SEMENTARA — 5 MODEL Flash Sale pembanding (struktur beda, bukan cuma warna).
 * Referensi: Steam capsule sale, esports promo banner, gaming UI kit.
 * Setelah pilih 1, hapus file ini + CSS tak terpakai, kembalikan 1 final ke page.tsx.
 */

function Label({ id, name, source }: { id: string; name: string; source: string }) {
  return (
    <p className="relative mb-3 text-xs font-bold uppercase tracking-widest text-muted">
      {id} — {name} <span className="font-normal normal-case">· ref: {source}</span>
    </p>
  );
}

function AllDeals() {
  return (
    <Link
      href="/games?sort=discount"
      className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/40 text-white hover:bg-white/10"
    >
      <span className="text-lg font-bold tracking-[-0.02em]">All deals</span>
      <ArrowRight className="h-5 w-5" aria-hidden="true" />
    </Link>
  );
}

/* M1 — Steam Sale Grid: header strip + grid capsule portrait (model sekarang, baseline). */
function M1({ games }: { games: Game[] }) {
  return (
    <section aria-label="Flash sale M1 Steam grid" className="relative mx-auto max-w-7xl scroll-mt-20 px-4 py-8">
      <Label id="M1" name="Steam Sale Grid" source="Steam seasonal sale page (baseline sekarang)" />
      <div className="relative rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-[0_24px_60px_-20px_rgb(255_30_45/0.35)] backdrop-blur-xl md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/80">Limited time</p>
            <h2 className="text-2xl font-bold tracking-[-0.025em] text-white md:text-3xl">Flash Sale</h2>
          </div>
          <Countdown />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {games.map((g) => (
            <div key={g.id} className="overflow-hidden rounded-xl border border-white/10">
              <GameCard game={g} />
            </div>
          ))}
          <AllDeals />
        </div>
      </div>
    </section>
  );
}

/* M2 — Hero Deal Banner: 1 banner landscape gede (capsule 616x353 ala Steam main capsule)
   + countdown, sisa game jadi strip kecil. */
function M2({ games }: { games: Game[] }) {
  const [hero, ...rest] = games;
  if (!hero) return null;
  const pct = discountPct(hero.original, hero.price);
  return (
    <section aria-label="Flash sale M2 hero banner" className="relative mx-auto max-w-7xl scroll-mt-20 px-4 py-8">
      <Label id="M2" name="Hero Deal Banner" source="Steam main capsule 616x353 featured sale" />
      <div className="relative overflow-hidden rounded-2xl border border-white/10">
        <div className="relative aspect-[21/9] w-full sm:aspect-[3/1]">
          <Image src={coverOf(hero)} alt={`${hero.title} deal banner`} fill sizes="100vw" className="object-cover" />
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{ background: "linear-gradient(to right, rgb(8 8 12 / 0.92) 0%, rgb(8 8 12 / 0.45) 45%, transparent 75%)" }}
          />
        </div>
        <div className="absolute inset-0 flex flex-col justify-center gap-3 p-6 md:p-10">
          <p className="inline-flex w-fit items-center gap-1.5 rounded-md bg-elite-red px-2 py-0.5 text-xs font-black uppercase italic text-white">
            <Flame className="h-3.5 w-3.5" aria-hidden="true" /> Flash deal -{pct}%
          </p>
          <h2 className="font-display max-w-md text-3xl font-black uppercase italic leading-none text-white md:text-5xl">
            {hero.title}
          </h2>
          <p className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-elite-cyan tabular">{formatIDR(hero.price)}</span>
            <s className="text-sm text-white/60 tabular">{formatIDR(hero.original)}</s>
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <Link href={`/games/${hero.id}`} className="btn-danger rounded-full px-6 py-2.5 text-sm font-bold text-white">
              Grab it now
            </Link>
            <Countdown />
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {rest.map((g) => (
          <GameCard key={g.id} game={g} />
        ))}
      </div>
    </section>
  );
}

/* M3 — Countdown Split: kolom kiri sticky (judul + countdown gede + CTA),
   kanan grid deal. Ala esports promo banner. */
function M3({ games }: { games: Game[] }) {
  return (
    <section aria-label="Flash sale M3 countdown split" className="relative mx-auto max-w-7xl scroll-mt-20 px-4 py-8">
      <Label id="M3" name="Countdown Split" source="esports promo banner split layout" />
      <div className="relative overflow-hidden rounded-2xl border border-elite-red/30 bg-gradient-to-br from-elite-dark-red/40 via-panel to-panel p-6 md:p-8">
        <Timer className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 text-elite-red/10" aria-hidden="true" />
        <div className="relative grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="flex flex-col items-start justify-center">
            <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-elite-red">
              <Flame className="h-4 w-4" aria-hidden="true" /> Limited time
            </p>
            <h2 className="font-display mt-2 text-4xl font-black uppercase italic leading-none text-white md:text-5xl">
              Flash<br />Sale
            </h2>
            <div className="mt-4"><Countdown /></div>
            <Link href="/games?sort=discount" className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-elite-cyan hover:underline">
              All deals <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {games.slice(0, 3).map((g) => (
              <GameCard key={g.id} game={g} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* M4 — Deal Leaderboard: list horizontal ala Steam top-seller (rank + capsule
   kecil + diskon + harga). Bukan grid kartu. */
function M4({ games }: { games: Game[] }) {
  return (
    <section aria-label="Flash sale M4 leaderboard" className="relative mx-auto max-w-7xl scroll-mt-20 px-4 py-8">
      <Label id="M4" name="Deal Leaderboard" source="Steam top-seller list rows" />
      <div className="relative rounded-2xl border border-line bg-panel p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="inline-flex items-center gap-2 text-2xl font-bold tracking-[-0.025em] text-white md:text-3xl">
            <Trophy className="h-6 w-6 text-amber-400" aria-hidden="true" /> Top flash deals
          </h2>
          <Countdown />
        </div>
        <ol className="mt-6 flex flex-col divide-y divide-white/5">
          {games.map((g, i) => {
            const pct = discountPct(g.original, g.price);
            return (
              <li key={g.id}>
                <Link href={`/games/${g.id}`} className="group flex items-center gap-4 py-3">
                  <span className="font-display w-8 shrink-0 text-2xl font-black italic text-white/25 tabular group-hover:text-elite-red">
                    {i + 1}
                  </span>
                  <span className="relative hidden h-14 w-32 shrink-0 overflow-hidden rounded-md sm:block">
                    <Image src={coverOf(g)} alt="" fill sizes="128px" loading="lazy" className="object-cover" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-bold group-hover:text-elite-cyan">{g.title}</span>
                  <span className="shrink-0 rounded bg-elite-red px-1.5 py-0.5 text-xs font-black text-white tabular">-{pct}%</span>
                  <span className="hidden shrink-0 text-xs text-muted tabular sm:block"><s>{formatIDR(g.original)}</s></span>
                  <span className="shrink-0 text-sm font-black text-elite-cyan tabular">{formatIDR(g.price)}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/* M5 — Bento Grid: 1 kartu gede (span 2) + kartu kecil, ala gaming dashboard. */
function M5({ games }: { games: Game[] }) {
  const [first, ...rest] = games;
  if (!first) return null;
  return (
    <section aria-label="Flash sale M5 bento" className="relative mx-auto max-w-7xl scroll-mt-20 px-4 py-8">
      <Label id="M5" name="Bento Grid" source="gaming dashboard bento layout" />
      <div className="relative rounded-2xl border border-line bg-panel/50 p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="inline-flex items-center gap-2 text-2xl font-bold tracking-[-0.025em] text-white md:text-3xl">
            <Grid2x2 className="h-6 w-6 text-elite-cyan" aria-hidden="true" /> Flash Sale
          </h2>
          <Countdown />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Link
            href={`/games/${first.id}`}
            className="group relative col-span-2 row-span-2 min-h-72 overflow-hidden rounded-xl border border-white/10"
          >
            <Image
              src={portraitCoverOf(first)}
              alt={`${first.title} featured deal`}
              fill
              sizes="50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgb(8 8 12 / 0.95) 0%, rgb(8 8 12 / 0.3) 50%, transparent 80%)" }}
            />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
              <div>
                <p className="inline-flex items-center gap-1 rounded bg-elite-red px-1.5 py-0.5 text-[11px] font-black uppercase text-white">
                  <Flame className="h-3 w-3" aria-hidden="true" /> -{discountPct(first.original, first.price)}%
                </p>
                <p className="mt-1.5 text-xl font-black leading-tight text-white">{first.title}</p>
                <p className="mt-0.5 text-lg font-black text-elite-cyan tabular">{formatIDR(first.price)}</p>
              </div>
              <span className="btn-danger hidden rounded-full px-5 py-2 text-sm font-bold text-white sm:block">Buy</span>
            </div>
          </Link>
          {rest.slice(0, 4).map((g) => (
            <GameCard key={g.id} game={g} />
          ))}
        </div>
        <p className="mt-4 text-center">
          <Link href="/games?sort=discount" className="inline-flex items-center gap-1 text-sm font-bold text-elite-cyan hover:underline">
            <Rows3 className="h-4 w-4" aria-hidden="true" /> View all deals
          </Link>
        </p>
      </div>
    </section>
  );
}

export function FlashCompare({ games }: { games: Game[] }) {
  return (
    <>
      <M1 games={games} />
      <M2 games={games} />
      <M3 games={games} />
      <M4 games={games} />
      <M5 games={games} />
    </>
  );
}

