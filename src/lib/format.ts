export function formatIDR(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function discountPct(original: number, price: number): number {
  if (original <= 0 || price >= original) return 0;
  return Math.round(((original - price) / original) * 100);
}

/** 1899191 → "1.8M", 759968 → "760K". Untuk jumlah review Steam. */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Angka ring 0–10 dari jumlah review Steam (proksi popularitas, karena
 * Steam tidak kasih skor agregat via API publik):
 *   ≥1M → 9 · ≥300K → 8 · ≥50K → 7 · selain itu 6.
 * Semua game katalog lolos filter Steam (punya review) jadi tidak ada yang 0.
 */
export function reviewRing(totalReviews: number): number {
  if (totalReviews >= 1_000_000) return 9;
  if (totalReviews >= 300_000) return 8;
  if (totalReviews >= 50_000) return 7;
  return 6;
}
