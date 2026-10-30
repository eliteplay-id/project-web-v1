import type { SteamReview } from "@/lib/steam";

export type Badge = "Best Seller" | "Flash Sale" | "Cheapest" | "New" | null;

export interface Game {
  id: string;
  title: string;
  appId: number;
  genres: string[];
  /** Rating toko (bintang pembeli Eliteplay). Null = belum ada. */
  rating: number | null;
  /** Jumlah review ASLI Steam. Null = Steam tidak kasih data. */
  steamReviews: number | null;
  /** Pemain online real-time dari Steam. Null = sembunyikan badge. */
  playerCount: number | null;
  /** Skor review resmi Steam 0–10 (8 = Very Positive). Null = pakai proksi jumlah. */
  reviewScore: number | null;
  /** Label sentimen resmi Steam, mis. "Very Positive". Null = sembunyikan. */
  reviewLabel: string | null;
  /** Total review positif / negatif resmi (untuk bar proporsi). Null = Steam down. */
  reviewPos: number | null;
  reviewNeg: number | null;
  /** Sampel 4 review publik Steam (campur positif + negatif). Kosong = fallback. */
  reviewSample: SteamReview[];
  /** User tags plek Steam (genre + Single-player/Multi-player/Co-op/...). */
  tags: string[];
  /** Game features plek Steam (Achievements/Controller/Cloud/...). */
  gameFeatures: string[];
  /** Info DRM plek Steam (ext_user_account_notice). Null = tanpa DRM. */
  drm: string | null;
  price: number;
  original: number;
  badge: Badge;
  tagline: string;
  description: string;
  about: string[];
  /** HTML About plek Steam (tersanitasi). Kosong = pakai `about` teks. */
  aboutHtml: string;
  /** Kolom specifics ala IG (developer, publisher, tanggal, fitur). */
  developers: string[];
  publishers: string[];
  releaseDate: string;
  features: string[];
  minReq: { label: string; value: string }[];
  recReq: { label: string; value: string }[];
  editions: { name: string; priceDelta: number }[];
}

/**
 * Daftar toko — cukup AppID + harga. Judul, genre, gambar, deskripsi,
 * about, dan system requirement otomatis dari Steam API (lihat catalog.ts).
 * Field display lain (rating/sold/badge/dll) opsional untuk sentuhan toko.
 */
export interface StoreEntry {
  /** Slug URL, mis. "gta-v". Dibuat otomatis dari nama Steam bila admin tidak isi. */
  id: string;
  /** Steam AppID, mis. 271590 — SATU-SATUNYA input wajib admin selain harga. */
  appId: number;
  /** Harga jual toko (IDR) — MILIK TOKO, tidak pernah dari Steam. */
  price: number;
  /** Harga coret pembanding (IDR) — MILIK TOKO, tidak pernah dari Steam. */
  original: number;
  badge?: Badge;
  tagline?: string;
  editions?: { name: string; priceDelta: number }[];
  /** Override manual kalau Steam down / data Steam kurang pas. */
  override?: Partial<Pick<Game, "title" | "genres" | "description" | "about" | "aboutHtml" | "minReq" | "recReq" | "developers" | "publishers" | "releaseDate" | "features">>;
}

export const store: StoreEntry[] = [
  { id: "gta-v", appId: 271590, price: 149000, original: 579000, badge: "Best Seller", editions: [{ name: "Standard", priceDelta: 0 }, { name: "Premium Online", priceDelta: 60000 }] },
  { id: "elden-ring", appId: 1245620, price: 399000, original: 599000, badge: "Best Seller", editions: [{ name: "Standard", priceDelta: 0 }, { name: "Deluxe", priceDelta: 120000 }] },
  { id: "baldurs-gate-3", appId: 1086940, price: 379000, original: 699000, badge: "Cheapest" },
  { id: "rdr-2", appId: 1174180, price: 199000, original: 640000, badge: "Flash Sale", editions: [{ name: "Standard", priceDelta: 0 }, { name: "Ultimate", priceDelta: 90000 }] },
  { id: "cyberpunk-2077", appId: 1091500, price: 249000, original: 699000, badge: "Flash Sale", editions: [{ name: "Standard", priceDelta: 0 }, { name: "Ultimate", priceDelta: 150000 }] },
  { id: "stardew-valley", appId: 413150, price: 89000, original: 159000, badge: "Cheapest" },
  { id: "hogwarts-legacy", appId: 990080, price: 279000, original: 799000, editions: [{ name: "Standard", priceDelta: 0 }, { name: "Deluxe", priceDelta: 100000 }] },
  { id: "palworld", appId: 1623730, price: 139000, original: 249000, badge: "New" },
  { id: "fc-25", appId: 2669320, price: 299000, original: 899000, badge: "New", editions: [{ name: "Standard", priceDelta: 0 }, { name: "Ultimate", priceDelta: 250000 }] },
  { id: "black-myth-wukong", appId: 2358720, price: 459000, original: 699000, badge: "Best Seller", editions: [{ name: "Standard", priceDelta: 0 }, { name: "Deluxe", priceDelta: 140000 }] },
  { id: "ets-2", appId: 227300, price: 79000, original: 249000, badge: "Cheapest" },
  { id: "hades", appId: 1145360, price: 109000, original: 219000 },
  { id: "tekken-8", appId: 1778820, price: 329000, original: 699000, badge: "New" },
];

/**
 * ADMIN-PANEL READY — tambah game baru = cukup 1 baris id + AppID + harga.
 * Nanti form admin tinggal insert baris ini ke tabel `products`
 * (slug, appid, price, original, badge, editions): judul, genre, cover,
 * screenshot, about, spek, jumlah review → otomatis dari Steam.
 *
 * Portrait = `library_600x900_2x.jpg` (600x900 ASLI, ~200KB — terbukti
 * di GTA V/Elden Ring/Cyberpunk/RDR2/Stardew/Palworld). File tanpa `_2x`
 * cuma 300x450 (setengah resolusi). Tidak ada varian 2x untuk
 * hero/header — hanya capsule yang punya (lihat best-sellers).
 */

const cover = (appId: number) =>
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`;

export const portraitOf = (appId: number) =>
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/library_600x900_2x.jpg`;

export const coverOf = (game: { appId: number }) => cover(game.appId);

export const portraitCoverOf = (game: { appId: number }) => portraitOf(game.appId);
