const CDN = "https://cdn.cloudflare.steamstatic.com/steam/apps";

export interface Shot {
  thumb: string;
  full: string;
  /** 'video' = trailer Steam (ada tombol play), 'image' = screenshot. */
  kind: "video" | "image";
  /** Judul trailer (khusus video). */
  title?: string;
  /** MP4 480p untuk preview cepat + max untuk full (pola resmi Steam). */
  video480?: string;
  videoMax?: string;
}

export interface SteamReq {
  minimum: { label: string; value: string }[];
  recommended: { label: string; value: string }[];
}

export interface SteamGame {
  appId: number;
  name: string;
  /** Genre resmi Steam (max 3, untuk kartu + filter). */
  genres: string[];
  /** User tags plek Steam = SEMUA genre + categories gameplay
   * (Single-player/Multi-player/Co-op/...). Untuk pil tags di About. */
  tags: string[];
  /** Game features plek Steam = categories NON-gameplay
   * (Steam Achievements/Full controller support/Cloud/...). */
  gameFeatures: string[];
  /** Info DRM plek Steam: drm_notice + ext_user_account_notice
   * (mis. "Rockstar Games (Supports Linking to Steam Account)").
   * Null = Steam tidak kasih info (game tanpa DRM). */
  drm: string | null;
  tagline: string;
  description: string;
  header: string;
  background: string;
  /** Jumlah review asli dari Steam (recommendations.total). Null kalau tak ada. */
  reviewCount: number | null;
  /** Jumlah pemain online real-time (ISteamUserStats, tanpa key, cache 10 mnt). Null kalau gagal. */
  playerCount: number | null;
  /** Label sentimen Steam bila tersedia (mis. "Overwhelmingly Positive"). */
  reviewLabel: string | null;
  /** Developer / publisher / tanggal rilis (categories) ala IG specifics. */
  developers: string[];
  publishers: string[];
  releaseDate: string;
  features: string[];
}

/** Review pelanggan toko (dummy dulu, nanti dari database). */
export interface BuyerReview {
  name: string;
  gameId: string;
  stars: 1 | 2 | 3 | 4 | 5;
  text: string;
  date: string;
}

/** 1 review publik Steam dari IUserReviewsService/GetAppReviews (resmi). */
export interface SteamReview {
  /** true = positif (jempol atas), false = negatif. */
  votedUp: boolean;
  /** Isi review (dipotong 300 karakter di server). */
  text: string;
  /** Jam main penulis saat review ditulis. */
  playtimeHours: number;
  /** Jumlah vote "helpful". */
  votesUp: number;
}

/** Ringkasan review resmi: skor + sentimen + total + sampel review. */
export interface SteamReviewSummary {
  /** Skor 0–10 Steam (8 = Very Positive, 9 = Overwhelmingly Positive). */
  score: number;
  /** Label sentimen resmi, mis. "Very Positive". */
  label: string;
  totalPositive: number;
  totalNegative: number;
  total: number;
  /** Sampel 4 review teratas (campur positif + negatif). */
  sample: SteamReview[];
}

const TIMEOUT = 5000;

/**
 * Steam kadang membalas request ber-`filters=` dengan `"data":[]`
 * (array kosong = filter diblokir, bukan data tidak ada). Karena itu
 * setiap request ber-filter otomatis dicoba ulang TANPA filter
 * (full response) sebelum menyerah — halaman tidak pernah kosong
 * hanya karena Steam pilih-pilih filter.
 */
async function fetchAppDetails<T>(appId: number, filters: string, revalidate = 86400): Promise<T | null> {
  const url = (f: string) =>
    `https://store.steampowered.com/api/appdetails?appids=${appId}${f ? `&filters=${f}` : ""}&cc=id&l=english`;
  const attempts = filters ? [filters, ""] : [""];
  for (const f of attempts) {
    try {
      const res = await fetch(url(f), {
        next: { revalidate },
        signal: AbortSignal.timeout(TIMEOUT),
      });
      if (!res.ok) continue;
      const json = (await res.json()) as Record<string, { success?: boolean; data?: T }>;
      const entry = json?.[String(appId)];
      if (!entry?.success || !entry.data || Array.isArray(entry.data)) continue;
      return entry.data;
    } catch {
      continue;
    }
  }
  return null;
}

/**
 * Sanitasi HTML About Steam ke subset aman (allowlist) agar bisa dirender
 * plek Steam (paragraf + gambar + video + list) tanpa risiko XSS.
 * Tag yang dipertahankan: p, br, ul, ol, li, strong/b, em/i, u,
 * h2/h3/h4, img (steamstatic), video/source (steamstatic), a (https).
 * Wrapper span/div dibuang tapi isinya dipertahankan.
 */
function sanitizeAboutHtml(html: string): string {
  const s = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<style[\s\S]*?<\/style\s*>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe\s*>/gi, "");

  const steamUrl = (u: string | undefined): string | null => {
    if (!u) return null;
    const v = u.trim().replace(/&amp;/g, "&");
    if (!/^https:\/\//i.test(v)) return null;
    try {
      const host = new URL(v).hostname.toLowerCase();
      if (
        host.endsWith("steamstatic.com") ||
        host.endsWith("steampowered.com") ||
        host.endsWith("steamcommunity.com")
      )
        return v;
    } catch {
      return null;
    }
    return null;
  };

  const attr = (tag: string, name: string): string | undefined => {
    const re = new RegExp(name + "\\s*=\\s*(\"([^\"]*)\"|'([^']*)'|([^\\s>]+))", "i");
    const m = re.exec(tag);
    if (!m) return undefined;
    return m[2] ?? m[3] ?? m[4];
  };

  const allowedPair = new Set(["p", "ul", "ol", "li", "strong", "b", "em", "i", "u", "h2", "h3", "h4", "video", "a"]);

  return s.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g, (full, rawName: string) => {
    const name = String(rawName).toLowerCase();
    const isClose = full.startsWith("</");

    if (name === "br") return isClose ? "" : "<br>";
    if (name === "img") {
      if (isClose) return "";
      const src = steamUrl(attr(full, "src"));
      if (!src) return "";
      return `<img src="${src}" alt="" loading="lazy" />`;
    }
    if (name === "video") {
      if (isClose) return "</video>";
      const poster = steamUrl(attr(full, "poster"));
      return `<video autoplay muted loop playsinline preload="metadata"${poster ? ` poster="${poster}"` : ""}>`;
    }
    if (name === "source") {
      const src = steamUrl(attr(full, "src"));
      if (!src) return "";
      const type = attr(full, "type") ?? "";
      const safeType = /^[a-z]+\/[a-z0-9.+-]+(;\s*codecs=[a-z0-9.+-]+)?$/i.test(type.trim()) ? type.trim() : "";
      return `<source src="${src}"${safeType ? ` type="${safeType}"` : ""}>`;
    }
    if (name === "a") {
      if (isClose) return "</a>";
      const href = steamUrl(attr(full, "href"));
      if (!href) return "";
      return `<a href="${href}" target="_blank" rel="noopener noreferrer">`;
    }
    // Wrapper layout Steam — buang tagnya, pertahankan isi.
    if (name === "span" || name === "div") return "";
    if (allowedPair.has(name)) {
      if (name === "h2") return isClose ? "</h3>" : "<h3>";
      return isClose ? `</${name}>` : `<${name}>`;
    }
    // Tag lain (font, table, dsb) — buang tagnya, pertahankan teks.
    return "";
  })
    // Sederhanakan <br> beruntun 3+ jadi 2 agar tidak ada gap raksasa.
    .replace(/(<br\s*\/?>\s*){3,}/gi, "<br><br>")
    .trim();
}

/** Teks polos dari HTML Steam (untuk tagline/deskripsi pendek). */
function stripHtml(html: string): string[] {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 4);
}

/**
 * Info dasar game dari Steam Store API: nama, genre, tags, features, DRM.
 * PETA FILTER (terbukti di GTA V 271590 — Steam pilih-pilih filter):
 *   - `basic` → name + description + header + about + requirements + DRM
 *     (ext_user_account_notice) + legal. SELALU lolos.
 *   - `genres,categories,developers,publishers,release_date` → genre +
 *     categories + dev/pub + tanggal. SELALU lolos.
 *   - `recommendations` HARUS SENDIRI (gabung filter lain = diblokir).
 *   - `drm_notice`/`package_groups` SELALU diblokir (data:[]) — DRM hanya
 *     dari ext_user_account_notice di `basic`.
 * Categories dipecah plek tampilan Steam:
 *   - gameplay (Single/Multi/Co-op/PvP/...) + semua genre → `tags`
 *   - sisanya (Achievements/Controller/Cloud/...) → `gameFeatures`
 * Return null kalau Steam unreachable — pemanggil pakai fallback manual.
 *
 * ADMIN NOTE: fungsi ini HANYA baca display (judul/genre/gambar/deskripsi).
 * Harga tidak pernah diambil dari Steam — harga selalu dari tabel toko.
 */
const GAMEPLAY_CATS =
  /single-player|multi-player|online co-op|co-op|pvp|online pvp|cross-platform|shared\/split|remote play together/i;

export async function getSteamGame(appId: number): Promise<SteamGame | null> {
  const [basic, extra] = await Promise.all([
    fetchAppDetails<{
      name?: string;
      short_description?: string;
      detailed_description?: string;
      header_image?: string;
      background_raw?: string;
      ext_user_account_notice?: string;
    }>(appId, "basic"),
    fetchAppDetails<{
      genres?: { description?: string }[];
      categories?: { description?: string }[];
      developers?: string[];
      publishers?: string[];
      release_date?: { date?: string };
    }>(appId, "genres,categories,developers,publishers,release_date"),
  ]);
  const data = { ...(extra ?? {}), ...(basic ?? {}) };
  if (!data?.name) return null;
  const about = data.detailed_description ? stripHtml(data.detailed_description) : [];
  const cats = (data.categories ?? []).map((c) => c.description ?? "").filter(Boolean);
  const genreList = (data.genres ?? []).map((g) => g.description ?? "").filter(Boolean);
  // User tags plek storepage Steam: genre + categories gameplay.
  const tags = Array.from(
    new Set([
      ...genreList,
      ...cats.filter((c) => GAMEPLAY_CATS.test(c)),
    ]),
  ).slice(0, 10);
  // Game features plek Steam: categories non-gameplay, SEMUA (tanpa slice —
  // kalau banyak ditangani tombol "Selengkapnya" di FeaturesDrm).
  // Dedup karena Steam kadang dobel (mis. Cyberpunk DualSense 2x).
  const gameFeatures = Array.from(new Set(cats.filter((c) => !GAMEPLAY_CATS.test(c))));
  const rec = data as { recommendations?: { total?: number } };
  const drmNotice = (data as { ext_user_account_notice?: string }).ext_user_account_notice?.trim();
  return {
    appId,
    name: data.name,
    genres: genreList.slice(0, 3),
    tags,
    gameFeatures,
    drm: drmNotice ? drmNotice : null,
    tagline: data.short_description ?? "",
    description: about[0] ?? data.short_description ?? "",
    header: data.header_image ?? "",
    background: data.background_raw ?? "",
    reviewCount: typeof rec.recommendations?.total === "number" ? rec.recommendations.total : null,
    playerCount: await getPlayerCount(appId),
    reviewLabel: null,
    developers: (data.developers ?? []).filter(Boolean).slice(0, 9),
    publishers: (data.publishers ?? []).filter(Boolean).slice(0, 3),
    releaseDate: data.release_date?.date ?? "",
    features: cats.slice(0, 6),
  };
}

/**
 * Jumlah pemain online real-time dari API RESMI Steam
 * (ISteamUserStats/GetNumberOfCurrentPlayers — publik, tanpa key).
 * Cache 10 menit (data live, jangan 24 jam). Null kalau gagal —
 * pemanggil sembunyikan badge, jangan tampilkan angka 0.
 */
export async function getPlayerCount(appId: number): Promise<number | null> {
  try {
    const res = await fetch(
      `https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${appId}`,
      { next: { revalidate: 600 }, signal: AbortSignal.timeout(TIMEOUT) },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { response?: { player_count?: number; result?: number } };
    const n = json?.response?.player_count;
    return typeof n === "number" && json?.response?.result === 1 ? n : null;
  } catch {
    return null;
  }
}

/**
 * Jumlah review ASLI Steam (recommendations.total) — fetch RINGAN sendiri
 * (1 field, cache 1 jam) supaya angka review di halaman SELALU fresh dan
 * tidak terkunci cache 24 jam milik getSteamGame. Null kalau gagal.
 */
export async function getReviewCount(appId: number): Promise<number | null> {
  const data = await fetchAppDetails<{ recommendations?: { total?: number } }>(
    appId,
    "recommendations",
    3600,
  );
  const n = data?.recommendations?.total;
  return typeof n === "number" ? n : null;
}

/**
 * Review resmi Steam via IUserReviewsService/GetAppReviews
 * (pengganti appreviews yang deprecated — docs:
 * https://partner.steamgames.com/doc/webapi/IUserReviewsService).
 *
 * PAKAI KEY dari STEAM_API_KEY (.env.local, server-side) supaya dapat
 * rate limit TINGGI — tanpa key ikut kuota anonim yang gampang 429
 * (halaman gagal load). Key tidak wajib, tapi jauh lebih aman.
 *
 * Ambil 4 review helpful EN + 2 review negatif terbaru → sampel campur
 * 4 (positif dulu, negatif sisipan). Cache 1 jam. Null kalau gagal —
 * pemanggil pakai fallback (angka count doang / sembunyikan section).
 */
export async function getSteamReviews(appId: number): Promise<SteamReviewSummary | null> {
  const key = process.env.STEAM_API_KEY?.trim();
  const base = "https://api.steampowered.com/IUserReviewsService/GetAppReviews/v1/";
  const clean = (v: string) =>
    v
      .replace(/\[.+?\]/g, " ")
      .replace(/&quot;/g, '"')
      .replace(/&#0?39;|&apos;/g, "'")
      .replace(/&amp;/g, "&")
      .replace(/&[a-z]+;/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
  const map = (r: {
    voted_up?: boolean;
    review?: string;
    votes_up?: number;
    author?: { playtime_at_review?: number };
  }): SteamReview | null => {
    const text = clean(String(r?.review ?? "")).slice(0, 300);
    if (!text) return null;
    return {
      votedUp: r?.voted_up !== false,
      text,
      playtimeHours: Math.max(0, Math.round((r?.author?.playtime_at_review ?? 0) / 60)),
      votesUp: typeof r?.votes_up === "number" ? r.votes_up : 0,
    };
  };
  try {
    const params = (extra: string) =>
      `${base}?${key ? `key=${encodeURIComponent(key)}&` : ""}` +
      `appid=${appId}&filter=0&review_type=0&purchase_type=1&day_range=365${extra}`;
    const [posRes, negRes] = await Promise.all([
      fetch(params(`&languages[0]=english&num_per_page=4`), {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(TIMEOUT),
      }),
      fetch(params(`&languages[0]=english&num_per_page=2&filter=1&review_type=2`), {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(TIMEOUT),
      }),
    ]);
    if (!posRes.ok) return null;
    const posJson = (await posRes.json()) as {
      response?: {
        query_summary?: {
          review_score?: number;
          review_score_desc?: string;
          total_positive?: number;
          total_negative?: number;
          total_reviews?: number;
        };
        reviews?: Parameters<typeof map>[0][];
      };
    };
    const q = posJson?.response?.query_summary;
    if (!q || typeof q.total_reviews !== "number") return null;
    const pos = (posJson.response?.reviews ?? []).map(map).filter((r): r is SteamReview => r != null);
    let neg: SteamReview[] = [];
    if (negRes.ok) {
      const negJson = (await negRes.json()) as { response?: { reviews?: Parameters<typeof map>[0][] } };
      neg = (negJson?.response?.reviews ?? []).map(map).filter((r): r is SteamReview => r != null);
    }
    // Campur: 2 positif + 1 negatif + 1 positif (negatif jadi sisipan).
    const sample = [...pos.slice(0, 2), ...neg.slice(0, 1), ...pos.slice(2, 3)].slice(0, 4);
    return {
      score: typeof q.review_score === "number" ? q.review_score : 0,
      label: String(q.review_score_desc ?? ""),
      totalPositive: q.total_positive ?? 0,
      totalNegative: q.total_negative ?? 0,
      total: q.total_reviews,
      sample,
    };
  } catch {
    return null;
  }
}

/**
 * Real "About" + system requirements from the official Steam Store API.
 * About dikembalikan sebagai HTML tersanitasi (plek Steam: paragraf,
 * gambar, video, list) + versi teks polos sebagai fallback.
 * NOTE: filter `about_the_game` DIBLOKIR Steam bila digabung filter lain
 * (balikin `"data":[]` — terbukti di GTA V), jadi pakai filter `basic`
 * (about_the_game + pc_requirements ikut di dalamnya). Cached 24h.
 * Fails fast (5s timeout) and falls back to null when offline
 * so a slow Steam API can never hang page render.
 *
 * ADMIN NOTE: fungsi ini HANYA baca konten (about/requirements).
 * Harga tidak pernah diambil dari Steam — harga selalu dari tabel toko.
 */
export async function getSteamDetails(appId: number): Promise<{
  about: string[];
  aboutHtml: string;
  req: SteamReq | null;
} | null> {
  const data = await fetchAppDetails<{
    about_the_game?: string;
    pc_requirements?: { minimum?: string; recommended?: string } | [];
  }>(appId, "basic");
  if (!data?.about_the_game) return null;

  const about = stripHtml(data.about_the_game);
  const aboutHtml = sanitizeAboutHtml(data.about_the_game);

  // Parser spek: tangani <li> (pola Steam asli), <br>, dan <strong>.
  // Nilai dibersihkan dari tag sisa + entitas, baris "header" dilewati.
  const parseReq = (html?: string) => {
    if (!html) return [];
    const clean = (v: string) =>
      v
        .replace(/<[^>]+>/g, " ")
        .replace(/&quot;/g, '"')
        .replace(/&#039;|&apos;/g, "'")
        .replace(/&amp;/g, "&")
        .replace(/\s+/g, " ")
        .trim();
    const out: { label: string; value: string }[] = [];
    const push = (label: string, value: string) => {
      const l = clean(label).replace(/:$/, "");
      const val = clean(value);
      if (!l || !val || out.length >= 8) return;
      if (/^(minimum|recommended)$/i.test(l)) return;
      // Steam suka selipkan kalimat "Requires a 64-bit processor..." sebagai
      // item spek — itu header, bukan spek. Buang supaya tabel bersih ala IG.
      if (/requires a 64-bit processor/i.test(`${l} ${val}`)) return;
      if (out.some((r) => r.label.toLowerCase() === l.toLowerCase())) return;
      out.push({ label: l, value: val });
    };
    const liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi;
    let li: RegExpExecArray | null;
    let foundLi = false;
    while ((li = liRe.exec(html))) {
      foundLi = true;
      const text = li[1];
      const strong = /<strong>([^<]+)<\/strong>\s*([\s\S]*)/i.exec(text);
      if (strong) push(strong[1], strong[2]);
      else if (clean(text)) push(clean(text).split(":")[0] ?? "Info", clean(text));
    }
    if (!foundLi) {
      const parts = html.split(/<br\s*\/?>/i).map(clean).filter(Boolean);
      for (const part of parts) {
        const strong = /^([^:]+):\s*(.+)$/.exec(part);
        if (strong) push(strong[1], strong[2]);
      }
    }
    const strongRe = /<strong>([^<]+)<\/strong>\s*([^<]*)/gi;
    let m: RegExpExecArray | null;
    if (out.length === 0) {
      while ((m = strongRe.exec(html)) && out.length < 8) push(m[1], m[2]);
    }
    return out;
  };

  const pc = Array.isArray(data.pc_requirements) ? undefined : data.pc_requirements;
  const minimum = parseReq(pc?.minimum);
  const recommended = parseReq(pc?.recommended);
  return { about, aboutHtml, req: minimum.length ? { minimum, recommended } : null };
}

/** Nama resmi game via API KEY (IStoreService/GetAppList) — cache 24 jam.
 * GetAppList cuma bisa paging maju (last_appid), jadi binary-search window
 * kecil di sekitar AppID target. Return null kalau tidak ketemu — pemanggil
 * pakai nama dari appdetails seperti biasa.
 * Dipakai saat admin input AppID baru (preview) / validasi nama katalog.
 */
export async function getSteamName(appId: number): Promise<string | null> {
  const key = process.env.STEAM_API_KEY?.trim();
  if (!key || !Number.isInteger(appId) || appId <= 0) return null;
  const qs = (o: Record<string, string | number>) =>
    Object.entries(o)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
  try {
    // Window kecil tepat sebelum AppID target (paging maju dari last_appid).
    const res = await fetch(
      `https://api.steampowered.com/IStoreService/GetAppList/v1/?key=${encodeURIComponent(key)}&` +
        qs({ last_appid: Math.max(0, appId - 120), max_results: 120 }),
      { next: { revalidate: 86400 }, signal: AbortSignal.timeout(TIMEOUT) },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { response?: { apps?: { appid?: number; name?: string }[] } };
    const hit = json?.response?.apps?.find((a) => a?.appid === appId);
    const name = hit?.name?.trim();
    return name ? name : null;
  } catch {
    return null;
  }
}

/** Wide banner for the full-bleed hero. Falls back at render via HeroBg. */
export const heroOf = (appId: number) => `${CDN}/${appId}/library_hero_2x.jpg`;

/**
 * Hero UTAMA = `library_hero_2x.jpg` — key art resmi Steam sesuai docs
 * https://partner.steamgames.com/doc/store/assets/libraryassets (Library
 * Hero 3840x1240 + half-size 1920x620 auto-generated). Terbukti di GTA V:
 * 2x = 923KB vs 1x cuma 330KB — jauh lebih jernih full-bleed. Varian 2x
 * TIDAK ada untuk capsule/header/page_bg (404), jadi cuma hero yang pakai.
 * Urutan: 2x dulu → 1x (game lama tanpa 2x) → screenshot 1920 → pattern.
 * Dipakai di HeroBg dengan fallback berurutan.
 */
export const heroFallbacks = (appId: number, shots?: Shot[]) => {
  const firstFull = shots?.find((s) => s.kind === "image" && s.full.includes("1920x1080"))?.full;
  const list = [
    `${CDN}/${appId}/library_hero_2x.jpg`,
    `${CDN}/${appId}/library_hero.jpg`,
    ...(firstFull ? [firstFull] : []),
    `${CDN}/${appId}/page_bg_generated_v6b.jpg`,
    `${CDN}/${appId}/header.jpg`,
  ];
  return Array.from(new Set(list));
};

/** Cover landscape 616x353 ala IG (presentation banner) + fallback. */
export const coverFallbacks = (appId: number) => [
  `${CDN}/${appId}/capsule_616x353.jpg`,
  `${CDN}/${appId}/header.jpg`,
  `${CDN}/${appId}/library_hero.jpg`,
];

function fallbackShots(appId: number): Shot[] {
  const urls = [
    `${CDN}/${appId}/header.jpg`,
    `${CDN}/${appId}/capsule_616x353.jpg`,
    `${CDN}/${appId}/library_hero.jpg`,
  ];
  return urls.map((u) => ({ thumb: u, full: u, kind: "image" as const }));
}

/**
 * Screenshot + TRAILER resmi plek Steam Store API (1 request: screenshots+movies).
 * Layout Visuals = 1 TRAILER + 5 screenshot high-res (path_full 1920x1080).
 * Trailer ditaruh PALING DEPAN (kayak storepage Steam: video dulu baru
 * screenshot) dengan MP4 resmi pola `movie480.mp4`/`movie_max.mp4`
 * + thumbnail — klik = play inline di galeri (sesuai panduan Next.js
 * videos.md: <video> + poster + preload="none"). Hemat bandwidth, tidak autoplay.
 * Fallback ke capsule art kalau API unreachable. Fails fast (5s).
 */
export async function getShots(appId: number, count = 5): Promise<Shot[]> {
  const data = await fetchAppDetails<{
    screenshots?: { path_thumbnail: string; path_full: string }[];
    movies?: { id?: number; name?: string; thumbnail?: string }[];
  }>(appId, "screenshots,movies");
  const out: Shot[] = [];
  // Cukup 1 trailer teratas (highlight) — hemat bandwidth, plek referensi.
  const m = (data?.movies ?? [])[0];
  if (typeof m?.id === "number") {
    const asset = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${m.id}`;
    out.push({
      thumb: m.thumbnail ?? `${asset}/movie.293x165.jpg`,
      full: m.thumbnail ?? `${asset}/movie.293x165.jpg`,
      kind: "video",
      title: m.name ?? "Trailer",
      video480: `${asset}/movie480.mp4`,
      videoMax: `${asset}/movie_max.mp4`,
    });
  }
  for (const s of (data?.screenshots ?? []).slice(0, count)) {
    if (!s?.path_full) continue;
    out.push({ thumb: s.path_thumbnail ?? s.path_full, full: s.path_full, kind: "image" });
  }
  return out.length > 0 ? out.slice(0, count + 1) : fallbackShots(appId);
}
