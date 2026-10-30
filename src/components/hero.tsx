import Link from "next/link";
import { Zap } from "lucide-react";

// Portrait capsules from official Steam CDN (library_600x900).
// Same AppIDs bridgeplay uses, loaded from our own source — no hotlink to them.
const ROWS: number[][] = [
  [632360, 1593500, 383180, 1384160, 1237320, 730, 1139900, 814380, 264710, 870780, 1677740, 315210, 578080, 1817230],
  [1065310, 403640, 729040, 2787320, 1966720, 1245620, 601150, 990080, 1496790, 239140, 200710, 271590, 346010, 291550],
  [1687950, 397540, 1790600, 648800, 973810, 1030840, 24240, 1176710, 208650, 1364780, 49520, 1174180, 692890, 1222670],
  [440, 570, 252490, 292030, 377160, 289070, 346110, 1085660, 1172470, 489830, 304930, 322330, 236850, 294100],
];

const portrait = (appId: number) =>
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/library_600x900.jpg`;

function Row({ ids }: { ids: number[] }) {
  const doubled = [...ids, ...ids];
  return (
    <div className="crow" aria-hidden="true">
      <div className="ctrack">
        {doubled.map((id, i) => (
          // Plain <img>: 84 capsules must NOT go through /_next/image optimizer
          // (each one is a server fetch to Steam CDN — that is what hung the page).
          // Direct CDN + native lazy load keeps first paint instant.
          <img
            key={`${id}-${i}`}
            src={portrait(id)}
            alt=""
            width={150}
            height={225}
            loading={i < 14 ? "eager" : "lazy"}
            decoding="async"
            draggable={false}
          />
        ))}
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative -mt-[76px] flex min-h-svh items-center overflow-hidden pt-[76px]">
      {/* Cover wall marquee */}
      <div className="cwall" aria-hidden="true">
        <div className="cwall-inner">
          {ROWS.map((ids, i) => (
            <Row key={i} ids={ids} />
          ))}
        </div>
      </div>
      {/* Readability: darken center, fade bottom into page bg (top dibiarkan full) */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 42%, rgb(8 8 12 / 0.88), transparent 75%), linear-gradient(to bottom, rgb(8 8 12 / 0.35) 0%, transparent 30%, transparent 70%, #08080c 100%)",
        }}
      />
      <div aria-hidden="true" className="glow-blue absolute -right-40 -top-40 h-[480px] w-[480px] opacity-70" />
      <div aria-hidden="true" className="glow-red absolute -left-40 top-40 h-[420px] w-[420px] opacity-70" />

      <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 text-center md:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-panel/80 px-3 py-1 text-xs font-medium uppercase tracking-widest text-elite-cyan backdrop-blur">
            <Zap className="h-3.5 w-3.5" aria-hidden="true" />
            Instant Steam Keys
          </p>
          <h1 className="font-display text-balance text-6xl font-black uppercase italic leading-[1.02] md:text-8xl">
            Play like <span className="text-elite-silver">elite,</span>
            <br />
            <span className="bg-gradient-to-r from-elite-red via-[#a02050] to-elite-blue bg-clip-text text-transparent">
              pay less.
            </span>
          </h1>
          <div aria-hidden="true" className="brand-underline mx-auto mt-6 h-1 w-40 rounded-full" />
          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-muted md:text-lg">
            Legit Steam keys up to 70% off. Pay in IDR, get your key by email in minutes. No VPN, no region tricks.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/games"
              className="btn-elite rounded-full px-8 py-3.5 text-[17px] font-semibold tracking-[-0.015em] text-white hover:brightness-110 focus-visible:ring-2 focus-visible:ring-elite-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-abyss"
            >
              Shop Games
            </Link>
          </div>
          <dl className="mt-10 flex flex-wrap justify-center gap-x-10 gap-y-3 text-sm">
            {[
              ["48K+", "keys delivered"],
              ["4.9/5", "buyer rating"],
              ["~5 min", "avg. delivery"],
            ].map(([n, label]) => (
              <div key={label}>
                <dt className="sr-only">{label}</dt>
                <dd className="text-2xl font-bold tabular">{n}</dd>
                <dd className="text-xs uppercase tracking-wide text-muted">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
