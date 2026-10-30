import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, MessageCircle, Star, ChevronDown } from "lucide-react";
import { Hero } from "@/components/hero";
import { BestSellers } from "@/components/best-sellers";
import { GameCard } from "@/components/game-card";
import { catalogGenres, catalogPopular, getCatalog } from "@/lib/catalog";

function SectionHead({ kicker, title, link, linkLabel }: { kicker: string; title: string; link: string; linkLabel: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-elite-red">{kicker}</p>
        <h2 className="mt-1 text-2xl font-bold tracking-[-0.025em] md:text-3xl">{title}</h2>
      </div>
      <Link href={link} className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-elite-silver/60 hover:text-elite-cyan hover:underline">
        {linkLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

const faqs = [
  { q: "Are these keys legit?", a: "Yes. Every key is sourced from official distributors and activates directly on Steam. If a key fails, you get a replacement or refund." },
  { q: "How fast is delivery?", a: "Average 5 minutes by email after payment. During peak traffic it can take up to 30 minutes." },
  { q: "Do I need a VPN to redeem?", a: "No. Keys are global or SEA region. Redeem from Indonesia with no VPN and no tricks." },
  { q: "How do I pay?", a: "MVP supports checkout preview. QRIS, VA, and e-wallet via payment gateway ship in phase 2." },
  { q: "What if my PC can't run the game?", a: "Check minimum requirements on each game page before buying. Unredeemed keys can be refunded within 24 hours." },
];

const testimonials = [
  { name: "Rizky", game: "GTA V", text: "Rp 149rb, key masuk 3 menit. Steam langsung aktif, gila murah." },
  { name: "Salsa", game: "Stardew Valley", text: "Cheapest I found anywhere. Bought at night, played at night." },
  { name: "Dimas", game: "Elden Ring", text: "Deluxe cheaper than Steam standard. Support replied fast on chat." },
];

export default async function Home() {
  const catalog = await getCatalog();
  const popular = catalogPopular(catalog);
  const allGenres = catalogGenres(catalog);
  return (
    <main className="flex-1">
      <Hero />

      {/* Best sellers carousel (angka peringkat raksasa) — tepat di bawah hero */}
      <BestSellers catalog={catalog} />

      <section aria-labelledby="popular-title" className="mx-auto max-w-7xl px-4 py-8">
        <SectionHead kicker="Top rated" title="Popular right now" link="/games" linkLabel="View catalog" />
        <h2 id="popular-title" className="sr-only">Popular games</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {popular.map((g) => (
            <GameCard key={g.id} game={g} />
          ))}
        </div>
      </section>

      <section aria-labelledby="genre-title" className="mx-auto max-w-7xl px-4 py-8">
        <h2 id="genre-title" className="text-2xl font-bold tracking-[-0.025em] md:text-3xl">
          Shop by genre
        </h2>
        <div className="mt-5 flex flex-wrap gap-2">
          {allGenres.map((genre) => (
            <Link
              key={genre}
              href={`/games?genre=${encodeURIComponent(genre)}`}
              className="rounded-full border border-line bg-panel px-4 py-2 text-sm font-bold hover:border-elite-blue hover:text-elite-cyan"
            >
              {genre}
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="why-title" className="border-y border-line bg-panel/50">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <h2 id="why-title" className="text-center text-2xl font-bold tracking-[-0.025em] md:text-3xl">
            Why buy on <span className="text-elite-red">Eliteplay?</span>
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "Keys that work", text: "Activate on Steam in one click. Failed key? Replacement or refund, no debate." },
              { icon: Zap, title: "Delivered in minutes", text: "No waiting 24 hours. Average delivery 5 minutes straight to your email." },
              { icon: MessageCircle, title: "Humans on chat", text: "Stuck redeeming at midnight? ID support answers 09:00–23:00 daily." },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-xl border border-line bg-panel p-6">
                <Icon className="h-7 w-7 text-elite-blue" aria-hidden="true" />
                <h3 className="mt-3 text-lg font-semibold tracking-[-0.02em]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="testi-title" className="mx-auto max-w-7xl px-4 py-12">
        <h2 id="testi-title" className="text-2xl font-bold tracking-[-0.025em] md:text-3xl">
          Buyers talk
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="rounded-xl border border-line bg-panel p-5">
              <div className="flex gap-0.5" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                ))}
              </div>
              <blockquote className="mt-3 text-sm leading-6">“{t.text}”</blockquote>
              <figcaption className="mt-3 text-xs text-muted">
                <span className="font-bold text-elite-silver">{t.name}</span> bought {t.game}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section id="faq" aria-labelledby="faq-title" className="mx-auto max-w-4xl scroll-mt-20 px-4 pb-16">
        <h2 id="faq-title" className="text-center text-2xl font-bold tracking-[-0.025em] md:text-3xl">
          FAQ
        </h2>
        <div className="mt-6 flex flex-col gap-3">
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-xl border border-line bg-panel px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold">
                {f.q}
                <ChevronDown className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="mt-2 text-sm leading-6 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-muted">
          {catalog.length} games live. More drop every Friday.{" "}
          <Link href="/games" className="font-bold text-elite-cyan hover:underline">Browse all</Link>
        </p>
      </section>
    </main>
  );
}
