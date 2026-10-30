import { store, type Game, type StoreEntry } from "@/data/games";
import { getSteamDetails, getSteamGame, getPlayerCount, getReviewCount, getSteamReviews, getSteamName, type SteamGame } from "@/lib/steam";

/**
 * Katalog AppID-only — ADMIN-PANEL READY.
 *
 * Kontrak: toko cukup simpan SATU baris per game:
 *   { id (slug), appId (Steam), price, original, badge?, editions? }
 * Semua display (judul, genre, tagline, about, requirements, screenshots,
 * review count) OTOMATIS dari Steam Store API (gratis, tanpa key, cache 24 jam).
 * Harga TIDAK PERNAH dari Steam — selalu milik toko (price/original).
 *
 * Migrasi ke admin panel + database nanti:
 *   1. Ganti `store` (src/data/games.ts) dengan query tabel `products`
 *      (kolom: slug, appid, price, original, badge, editions JSON).
 *   2. Fungsi di file ini (getCatalog/getGame/catalogIds/...) TIDAK BERUBAH
 *      — signature input/output tetap: entry in → Game out.
 *   3. Halaman (home/katalog/detail/suggest) TIDAK PERLU disentuh.
 *
 * Kalau Steam unreachable, game tetap render dengan judul fallback
 * dari slug + cover dari pola CDN — halaman tidak pernah hang.
 */

const titleFromId = (id: string) =>
  id
    .split("-")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");

function baseGame(entry: StoreEntry, steam: SteamGame | null): Game {
  const o = entry.override ?? {};
  return {
    id: entry.id,
    title: o.title ?? steam?.name ?? titleFromId(entry.id),
    appId: entry.appId,
    genres: o.genres ?? (steam && steam.genres.length > 0 ? steam.genres : ["Games"]),
    rating: null,
    steamReviews: steam?.reviewCount ?? null,
    playerCount: steam?.playerCount ?? null,
    reviewScore: null,
    reviewLabel: steam?.reviewLabel ?? null,
    reviewPos: null,
    reviewNeg: null,
    reviewSample: [],
    tags: steam?.tags ?? [],
    gameFeatures: steam?.gameFeatures ?? [],
    drm: steam?.drm ?? null,
    price: entry.price,
    original: entry.original,
    badge: entry.badge ?? null,
    tagline: entry.tagline ?? steam?.tagline ?? "",
    description: o.description ?? steam?.description ?? "",
    about: o.about ?? [],
    aboutHtml: o.aboutHtml ?? "",
    developers: o.developers ?? steam?.developers ?? [],
    publishers: o.publishers ?? steam?.publishers ?? [],
    releaseDate: o.releaseDate ?? steam?.releaseDate ?? "",
    features: o.features ?? steam?.features ?? [],
    minReq: o.minReq ?? [],
    recReq: o.recReq ?? [],
    editions: entry.editions ?? [{ name: "Standard", priceDelta: 0 }],
  };
}

/** Seluruh katalog untuk home & catalog. 1 request Steam per game, paralel, ter-cache. */
export async function getCatalog(): Promise<Game[]> {
  return Promise.all(store.map(async (entry) => baseGame(entry, await getSteamGame(entry.appId))));
}

/** Satu game lengkap (info + about + requirements) untuk halaman detail. Null kalau slug tidak ada. */
export async function getGame(id: string): Promise<Game | null> {
  const entry = store.find((s) => s.id === id);
  if (!entry) return null;
  const [steam, details, playerCount, reviewCount, reviews, officialName] = await Promise.all([
    getSteamGame(entry.appId),
    getSteamDetails(entry.appId),
    getPlayerCount(entry.appId),
    getReviewCount(entry.appId),
    getSteamReviews(entry.appId),
    getSteamName(entry.appId),
  ]);
  const game = baseGame(entry, steam);
  // Nama RESMI via API key MENANG atas appdetails (mis. "Grand Theft Auto V
  // Legacy" — nama store terkini, bukan judul lama). Override manual tetap
  // paling tinggi (tidak ditimpa di sini karena baseGame sudah pakai o.title).
  if (officialName && !entry.override?.title) game.title = officialName;
  // Data live/ringan MENANG atas cache 24 jam: pemain online + review count
  // selalu fresh (10 mnt / 1 jam), tidak terkunci data lama.
  if (playerCount != null) game.playerCount = playerCount;
  if (reviewCount != null) game.steamReviews = reviewCount;
  // Ringkasan review resmi (skor + sentimen + total pos/neg + sampel) —
  // total resmi MENANG atas recommendations.total bila keduanya ada.
  if (reviews) {
    game.reviewScore = reviews.score;
    game.reviewLabel = reviews.label || game.reviewLabel;
    game.reviewPos = reviews.totalPositive;
    game.reviewNeg = reviews.totalNegative;
    game.steamReviews = reviews.total;
    game.reviewSample = reviews.sample;
  }
  const o = entry.override ?? {};
  game.about =
    o.about ?? (details && details.about.length > 0 ? details.about : game.description ? [game.description] : []);
  game.aboutHtml = o.aboutHtml ?? details?.aboutHtml ?? "";
  game.minReq = o.minReq ?? details?.req?.minimum ?? [];
  game.recReq = o.recReq ?? details?.req?.recommended ?? [];
  return game;
}

/** Slug untuk generateStaticParams — sync, tanpa network. */
export function catalogIds(): string[] {
  return store.map((s) => s.id);
}

/**
 * Preview 1 AppID langsung dari Steam — dipakai tombol [Preview] di admin
 * panel nanti: admin ketik AppID → fungsi ini yang dipanggil → tampil judul
 * + cover + about persis yang bakal live. Harga TIDAK ikut (diisi manual).
 * Return null kalau AppID tidak dikenal Steam / Steam unreachable.
 */
export async function previewSteamApp(appId: number): Promise<Game | null> {
  if (!Number.isInteger(appId) || appId <= 0) return null;
  const [steam, details] = await Promise.all([
    getSteamGame(appId),
    getSteamDetails(appId),
  ]);
  if (!steam && !details) return null;
  // Harga 0 = placeholder preview; admin WAJIB isi harga sendiri sebelum simpan.
  const game = baseGame({ id: `preview-${appId}`, appId, price: 0, original: 0 }, steam);
  game.about =
    details && details.about.length > 0 ? details.about : game.description ? [game.description] : [];
  game.aboutHtml = details?.aboutHtml ?? "";
  game.minReq = details?.req?.minimum ?? [];
  game.recReq = details?.req?.recommended ?? [];
  return game;
}

export function catalogGenres(catalog: Game[]): string[] {
  return Array.from(new Set(catalog.flatMap((g) => g.genres))).sort();
}

export function catalogFlashSale(catalog: Game[]): Game[] {
  return catalog.filter((g) => g.badge === "Flash Sale");
}

export function catalogPopular(catalog: Game[]): Game[] {
  return [...catalog].sort((a, b) => (b.steamReviews ?? 0) - (a.steamReviews ?? 0)).slice(0, 8);
}

export function findRelated(catalog: Game[], game: Game, count = 4): Game[] {
  return catalog
    .filter((g) => g.id !== game.id && g.genres.some((x) => game.genres.includes(x)))
    .slice(0, count);
}
