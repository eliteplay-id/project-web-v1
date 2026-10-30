/**
 * Lingkaran rating plek screenshot referensi (angka di tengah,
 * ring orange untuk porsi nilai).
 */
export function RatingRing({ value, max = 10 }: { value: number; max?: number }) {
  const pct = Math.max(0, Math.min(1, value / max));
  const r = 26;
  const c = 2 * Math.PI * r;

  return (
    <span
      className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full bg-black/40"
      role="img"
      aria-label={`Rating ${value} out of ${max}`}
    >
      <svg viewBox="0 0 64 64" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="32" cy="32" r={r} fill="none" strokeWidth="5" className="stroke-white/15" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="#f97316"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
        />
      </svg>
      <span className="text-lg font-black text-white tabular">{value}</span>
    </span>
  );
}
