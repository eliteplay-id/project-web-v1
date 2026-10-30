import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Check,
  Download,
  Flame,
} from "lucide-react";
import { formatIDR, formatCompact, reviewRing } from "@/lib/format";
import { heroFallbacks, coverFallbacks, getShots } from "@/lib/steam";
import { catalogIds, findRelated, getCatalog, getGame } from "@/lib/catalog";
import { GameCard } from "@/components/game-card";
import { HeroBg } from "./hero-bg";
import { ShotGallery } from "./shot-gallery";
import { About } from "./about";
import { Requirements } from "./requirements";
import { FeaturesDrm } from "./features-drm";
import { DetailBuyPanel } from "./detail-buy-panel";
import { RatingRing } from "./rating-ring";

export function generateStaticParams() {
  return catalogIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const game = await getGame(id);
  if (!game) return { title: "Game not found — ELITEPLAY" };
  return {
    title: `${game.title} from ${formatIDR(game.price)} — ELITEPLAY`,
    description: game.tagline,
  };
}

/**
 * Halaman detail game: hero wallpaper miring + cover/panel overlap,
 * About 2 kolom, Visuals, requirements. Navbar TIDAK disentuh.
 *
 * NOTE Next.js 16 (cacheComponents): TIDAK pakai `export const dynamic`
 * (incompatible). Data live Steam (pemain online) fresh via fetch
 * `revalidate: 600` di getPlayerCount, review count via cache 24 jam.
 */
export default async function GameDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const game = await getGame(id);
  if (!game) notFound();

  const shots = await getShots(game.appId, 5);
  const catalog = await getCatalog();
  const related = findRelated(catalog, game, 4);
  // Pemain live dari API resmi Steam (GetNumberOfCurrentPlayers).
  // Fallback dummy lama hanya kalau Steam gagal — jangan tampilkan 0.
  const usersOnPage = game.playerCount ?? (game.steamReviews
    ? Math.max(12, Math.min(90, Math.round(game.steamReviews / 20000)))
    : 42);
  const livePlayers = game.playerCount != null;

  return (
    <main className="flex-1">
      {/* HERO plek IG: wallpaper full sampai ke atas (di bawah navbar
          overlay), tinggi fix supaya cover + panel OVERLAP (nongol di
          bawah wallpaper). Potongan miring agak curam + TURUN dikit:
          kiri naik, kanan turun (kiri pendek, kanan panjang). */}
      <section aria-labelledby="game-title" className="relative -mt-24 lg:-mt-[104px]">
        <div
          className="absolute inset-x-0 top-0 h-[33rem] overflow-hidden pt-24 sm:h-[37rem] lg:h-[41rem] lg:pt-[104px]"
          aria-hidden="true"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 calc(100% - 7vw))" }}
        >
          <HeroBg sources={heroFallbacks(game.appId, shots)} alt="" />
          {/* Bayangan sisi ala IG */}
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#08080c] to-transparent md:w-48" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#08080c] to-transparent md:w-48" />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to bottom, rgb(8 8 12 / 0.45) 0%, transparent 40%)" }}
          />
        </div>

        {/* Cover + panel OVERLAP: start di tengah wallpaper.
            Cover SELEBAR kolom About (max-w-7xl, gap-14) — pantat cover
            SEJAJAR tombol Add to cart via panel stretch + spacer.
            Panel kanan: judul + subinfos + users + dropdown + harga
            + tombol (tinggi konsisten via slot fix → tombol sejajar). */}
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid items-stretch gap-10 pt-[22rem] sm:pt-[25rem] lg:grid-cols-2 lg:gap-14 lg:pt-[25rem]">
            {/* Cover landscape 616x353 — ikut data Steam apa adanya,
                SELALU selebar kolom kiri About (grid 2 kolom sama). */}
            <div className="overflow-hidden self-start rounded-xl shadow-[0_24px_70px_-20px_rgb(0_0_0/0.9)]">
              <div className="relative aspect-[616/353]">
                <Image
                  src={coverFallbacks(game.appId)[0]}
                  alt={`${game.title} cover`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>

            {/* Panel beli kanan plek IG: judul + subinfos + users +
                edisi + harga sebaris + wishlist + Add to cart.
                Fade lumer di LAPISAN BACKGROUND (::before) — konten
                TIDAK ikut tergradasi. */}
            <div className="panel-fade relative flex flex-col rounded-xl px-6 py-5 text-center md:px-8">
              <div className="relative flex flex-1 flex-col">
                {/* Judul FIX 2 baris: tinggi konsisten walau judul pendek/panjang */}
                <div className="flex min-h-[3.5rem] items-start justify-center">
                  <h1 id="game-title" className="line-clamp-2 text-balance text-xl font-bold leading-snug md:text-2xl">
                    {game.title} - PC (Steam)
                  </h1>
                </div>

                {/* Subinfos dalam pil gelap plek IG */}
                <div className="mt-3 flex justify-center">
                  <div className="inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 rounded-full border border-white/10 bg-black/45 px-5 py-2 text-xs font-semibold">
                    <span className="text-white/85">Steam</span>
                    <span className="inline-flex items-center gap-1 text-emerald-400">
                      <Check className="h-3.5 w-3.5" aria-hidden="true" /> In stock
                    </span>
                    <span className="inline-flex items-center gap-1 text-emerald-400">
                      <Download className="h-3.5 w-3.5" aria-hidden="true" /> Digital download
                    </span>
                  </div>
                </div>

                <p className="mt-2 inline-flex items-center justify-center gap-1.5 text-xs text-muted">
                  <Flame className="h-3.5 w-3.5 text-elite-red" aria-hidden="true" />
                  <span className="tabular">
                    {livePlayers
                      ? `${formatCompact(usersOnPage)} playing now on Steam`
                      : `${usersOnPage} users on this page`}
                  </span>
                </p>

                <DetailBuyPanel game={game} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT: 2 kolom simetris — kiri teks clamp + Read more + tags,
          kanan specifics. Header pakai grid 2 kolom yang SAMA dengan
          grid konten di bawahnya: kiri judul "About", kanan ikon rating
          + "Based on" NEMPEL KIRI (awal kolom kanan, sejajar specifics).
          Tanpa kartu, spacing lega. */}
      <div className="mx-auto max-w-7xl space-y-14 px-4 pb-14 pt-12 md:px-6">
        <section aria-labelledby="about-ig">
          <div className="grid items-center gap-4 lg:grid-cols-2 lg:gap-14">
            <h2 id="about-ig" className="text-2xl font-bold tracking-[-0.02em]">About</h2>
            {/* Rating ring OTOMATIS dari Steam: angka = skor resmi 0–10
                (8 = Very Positive, 9 = Overwhelmingly Positive), fallback
                proksi jumlah kalau Steam gagal. Caption = jumlah asli. */}
            {game.steamReviews != null && (
              <div className="flex items-center justify-self-start gap-4">
                <RatingRing value={game.reviewScore ?? reviewRing(game.steamReviews)} />
                <div className="text-xs leading-5 text-muted">
                  Based on<br />
                  <span className="font-bold text-white">{formatCompact(game.steamReviews)} reviews</span>
                </div>
              </div>
            )}
          </div>
          <div className="mt-7 grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="min-w-0">
              <About paragraphs={game.about} html={game.aboutHtml} title={game.title} bare clamp />
              {/* User tags plek Steam (genre + Single/Multi/Co-op/...).
                  Klik = filter katalog per genre bila ada, sonst teks. */}
              {game.tags.length > 0 && (
                <div className="mt-8">
                  <p className="text-xs leading-8 text-muted">
                    User tags*:{" "}
                    {game.tags.map((g) => (
                      <Link
                        key={g}
                        href={`/games?genre=${encodeURIComponent(g)}`}
                        className="mb-1.5 mr-1.5 inline-block rounded-md border border-white/20 px-2.5 py-1 text-[11px] font-semibold text-white/80 transition-colors hover:border-elite-cyan hover:text-elite-cyan"
                      >
                        {g}
                      </Link>
                    ))}
                  </p>
                </div>
              )}
            </div>

            {/* Specifics polos (tanpa kotak) — baris pertamanya
                (lingkaran rating) DICABUT dari sini, sekarang nempel di
                header sejajar "About". Sisa specifics tetap jalan. */}
            <dl className="m-0 h-fit min-w-0 p-0 text-[13px] leading-7">
              <div className="space-y-3">
                <div className="grid grid-cols-[170px_1fr] gap-3">
                  <dt className="text-muted">Country Compatibility:</dt>
                  <dd className="font-semibold text-elite-cyan">See the list</dd>
                </div>
                <div className="grid grid-cols-[170px_1fr] gap-3">
                  <dt className="text-muted">Languages:</dt>
                  <dd className="font-semibold text-elite-cyan">See the supported languages</dd>
                </div>
                <div className="grid grid-cols-[170px_1fr] gap-3">
                  <dt className="text-muted">Installation:</dt>
                  <dd className="font-semibold text-elite-cyan">How to activate your game</dd>
                </div>
                {game.developers.length > 0 && (
                  <div className="grid grid-cols-[170px_1fr] gap-3">
                    <dt className="text-muted">Developer:</dt>
                    <dd className="font-semibold text-elite-cyan">{game.developers.slice(0, 6).join(", ")}</dd>
                  </div>
                )}
                {game.publishers.length > 0 && (
                  <div className="grid grid-cols-[170px_1fr] gap-3">
                    <dt className="text-muted">Publisher:</dt>
                    <dd className="font-semibold text-elite-cyan">{game.publishers.join(", ")}</dd>
                  </div>
                )}
                {game.releaseDate && (
                  <div className="grid grid-cols-[170px_1fr] gap-3">
                    <dt className="text-muted">Release date:</dt>
                    <dd>{game.releaseDate}</dd>
                  </div>
                )}
                {game.genres.length > 0 && (
                  <div className="grid grid-cols-[170px_1fr] gap-3">
                    <dt className="text-muted">Genre:</dt>
                    <dd className="font-semibold text-elite-cyan">{game.genres.join(", ")}</dd>
                  </div>
                )}
                <div className="grid grid-cols-[170px_1fr] gap-3">
                  <dt className="text-muted">Recent Steam reviews:</dt>
                  <dd>{game.reviewLabel ?? (game.steamReviews ? `${(game.steamReviews / 1000).toFixed(1)}K reviews` : "No user reviews")}</dd>
                </div>
                <div className="grid grid-cols-[170px_1fr] gap-3">
                  <dt className="text-muted">All Steam reviews:</dt>
                  <dd>
                    <span className="font-semibold text-elite-cyan">{game.reviewLabel ?? "Mostly positive"}</span>
                    {game.steamReviews ? <span className="text-muted"> ({game.steamReviews.toLocaleString("en-US")})</span> : null}
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </section>

        {/* Visuals = screenshot gallery (1 trailer + 5 screenshot) */}
        <section aria-labelledby="visuals">
          <h2 id="visuals" className="text-2xl font-bold tracking-[-0.02em]">Visuals</h2>
          <div className="mt-7">
            <ShotGallery shots={shots} title={game.title} />
          </div>
        </section>

        {/* Features + DRM plek Steam: 1 baris ikon di bawah Visuals */}
        <FeaturesDrm features={game.gameFeatures} drm={game.drm} />

        {/* System requirements */}
        <div className="flex flex-col gap-8">
          <Requirements minimum={game.minReq} recommended={game.recReq} />
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related" className="mx-auto max-w-7xl px-4 pb-14 md:px-6">
          <h2 id="related" className="text-2xl font-bold tracking-[-0.025em]">More like this</h2>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.map((g) => (
              <GameCard key={g.id} game={g} />
            ))}
          </div>
        </section>
      )}

    </main>
  );
}
