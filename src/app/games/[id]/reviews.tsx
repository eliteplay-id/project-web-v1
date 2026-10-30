import { MessageSquareText, Star, ThumbsDown, ThumbsUp } from "lucide-react";
import { buyerReviewsFor } from "@/data/reviews";
import { formatCompact } from "@/lib/format";
import type { SteamReview } from "@/lib/steam";

function Stars({ value, className = "h-4 w-4" }: { value: number; className?: string }) {
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={`${className} ${i < value ? "fill-amber-400 text-amber-400" : "text-white/20"}`}
        />
      ))}
    </span>
  );
}

/**
 * Section review Steam ala storepage: label + bar + angka asli.
 * Data RESMI dari IUserReviewsService/GetAppReviews (pakai STEAM_API_KEY
 * server-side): label sentimen + total pos/neg + sampel 4 review publik.
 * Bar = proporsi positif vs negatif (bukan full). Fallback: kalau Steam
 * gagal, tampilkan angka count saja / sembunyikan section (return null).
 * Mode `bare`: tanpa kartu — dipakai di section Reviews halaman detail.
 */
export function SteamVerdict({
  count,
  label,
  pos,
  neg,
  sample,
  bare,
}: {
  count: number | null;
  label?: string | null;
  pos?: number | null;
  neg?: number | null;
  sample?: SteamReview[];
  bare?: boolean;
}) {
  if (count == null) return null;
  const hasSplit = pos != null && neg != null && pos + neg > 0;
  const posPct = hasSplit ? Math.round((pos / (pos + neg)) * 100) : 100;
  const list = sample ?? [];
  const body = (
    <>
      <div className="mt-0 flex items-baseline gap-3">
        <p className="text-3xl font-bold tracking-[-0.02em] text-elite-silver tabular">
          {formatCompact(count)}
        </p>
        <p className="text-sm text-muted">reviews on Steam</p>
      </div>
      {label ? (
        <p className="mt-1 text-sm font-bold text-elite-cyan">{label}</p>
      ) : (
        <p className="mt-1 text-xs text-muted">
          Sentiment breakdown unlocks automatically once Steam opens review access for this server.
        </p>
      )}
      <div
        className="mt-7 h-2 overflow-hidden rounded-full bg-white/10"
        role="img"
        aria-label={
          hasSplit
            ? `${posPct}% positive of ${formatCompact(count)} Steam reviews`
            : `${formatCompact(count)} Steam reviews`
        }
      >
        {/* Hijau = porsi positif, merah tipis = porsi negatif (plek Steam). */}
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
          style={{ width: `${posPct}%` }}
          aria-hidden="true"
        />
      </div>
      {hasSplit && (
        <p className="mt-2 text-xs text-muted tabular">
          {formatCompact(pos)} positive · {formatCompact(neg)} negative
        </p>
      )}
      {/* Sampel review publik Steam (otomatis per AppID). */}
      {list.length > 0 && (
        <ul className="mt-8 grid gap-6 md:grid-cols-2">
          {list.map((r, i) => (
            <li key={`${r.votesUp}-${r.playtimeHours}-${i}`} className="rounded-xl border border-line bg-black/30 p-6">
              <p className="inline-flex items-center gap-1.5 text-xs font-bold">
                {r.votedUp ? (
                  <ThumbsUp className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                ) : (
                  <ThumbsDown className="h-3.5 w-3.5 text-elite-red" aria-hidden="true" />
                )}
                <span className={r.votedUp ? "text-emerald-400" : "text-elite-red"}>
                  {r.votedUp ? "Recommended" : "Not Recommended"}
                </span>
              </p>
              <blockquote className="mt-3 line-clamp-4 text-sm leading-7 text-elite-silver/90">
                “{r.text}”
              </blockquote>
              <p className="mt-3 text-[11px] text-muted tabular">
                {r.playtimeHours.toLocaleString("en-US")} hrs played · {r.votesUp.toLocaleString("en-US")} helpful
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
  if (bare) return <div>{body}</div>;
  return (
    <section aria-labelledby="steam-reviews" className="rounded-xl border border-line bg-panel p-6 md:p-10">
      <h2 id="steam-reviews" className="inline-flex items-center gap-2.5 text-lg font-bold tracking-[-0.02em]">
        <ThumbsUp className="h-5 w-5 text-elite-cyan" aria-hidden="true" />
        Steam reviews
      </h2>
      <div className="mt-7">{body}</div>
    </section>
  );
}

/**
 * Rating toko di atas BuyBox (hero). Fake terstruktur dulu dari
 * buyerReviewsFor() dummy — nanti otomatis ngikut data pelanggan
 * beneran begitu buyerReviewsFor() diganti query database.
 * Tidak perlu sentuh halaman, cukup ganti sumber datanya.
 */
export function StoreRating({ gameId }: { gameId: string }) {
  const list = buyerReviewsFor(gameId);
  if (list.length === 0) return null;
  const avg = list.reduce((s, r) => s + r.stars, 0) / list.length;

  return (
    <p className="inline-flex items-center gap-2 text-sm text-elite-silver/80">
      <Stars value={Math.round(avg)} />
      <span className="font-bold text-elite-silver tabular">{avg.toFixed(1)}</span>
      <span className="text-muted">
        ({list.length} verified {list.length === 1 ? "buyer" : "buyers"})
      </span>
    </p>
  );
}

/**
 * Review pembeli Eliteplay. Data dummy lokal dulu (src/data/reviews.ts),
 * nanti diganti database setelah toko jalan.
 * Mode `bare`: tanpa kartu — dipakai di section Reviews halaman detail.
 */
export function BuyerReviews({ gameId, title, bare }: { gameId: string; title: string; bare?: boolean }) {
  const list = buyerReviewsFor(gameId);
  if (list.length === 0) return null;
  const avg = list.reduce((s, r) => s + r.stars, 0) / list.length;

  const body = (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2.5 text-sm text-muted">
            <Stars value={Math.round(avg)} />
            <span className="font-bold text-elite-silver tabular">{avg.toFixed(1)}</span>
            from {list.length} verified {list.length === 1 ? "buyer" : "buyers"} of {title}
          </p>
        </div>
      </div>
      <ul className="mt-8 grid gap-6 md:grid-cols-2">
        {list.map((r) => (
          <li key={`${r.name}-${r.date}`} className="rounded-xl border border-line bg-panel p-6">
            <div className="flex items-center justify-between gap-3">
              <Stars value={r.stars} className="h-3.5 w-3.5" />
              <time className="text-[11px] text-muted">{r.date}</time>
            </div>
            <blockquote className="mt-4 text-sm leading-8 text-elite-silver/90">“{r.text}”</blockquote>
            <p className="mt-4 text-xs text-muted">
              <span className="font-bold text-elite-silver">{r.name}</span> · Verified buyer
            </p>
          </li>
        ))}
      </ul>
    </>
  );
  if (bare) return <div>{body}</div>;
  return (
    <section aria-labelledby="buyer-reviews" className="rounded-xl border border-line bg-panel p-6 md:p-10">
      <h2 id="buyer-reviews" className="inline-flex items-center gap-2.5 text-lg font-bold tracking-[-0.02em]">
        <MessageSquareText className="h-5 w-5 text-elite-cyan" aria-hidden="true" />
        Buyer reviews
      </h2>
      <div className="mt-4">{body}</div>
    </section>
  );
}
