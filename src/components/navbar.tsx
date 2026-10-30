"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Delete,
  Search,
  ShoppingCart,
  Menu,
  X,
  Sun,
  Moon,
  User,
  LayoutGrid,
  Package,
  ClipboardList,
  BookOpen,
  LifeBuoy,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { SearchSuggest } from "./search-suggest";

// Struktur mencontek product-menu IG (lihat G:\Project web v1\ig-navbar.html):
// satu pil berisi nav + search. Isi/label disesuaikan punya kita —
// menu atas (Home · Catalog · Gamespack · Pesanan · Tutorial · FAQ)
// yang dulu baris sekunder, sekarang jadi isi pilnya.

// Isi pil: menu utama kita (Home tidak ada — klik logo untuk ke home).
const platforms = [
  { label: "Catalog", href: "/games", icon: LayoutGrid },
  { label: "Gamespack", href: "/#gamespack", icon: Package },
  { label: "Pesanan", href: "/checkout", icon: ClipboardList },
  { label: "Tutorial", href: "/#tutorial", icon: BookOpen },
  { label: "FAQ", href: "/#faq", icon: LifeBuoy },
];

// Tombol search: gradasi tema ElitePlay (biru -> cyan, class btn-elite).
const searchBtn =
  "btn-elite grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full text-white shadow-lg shadow-elite-blue/30 transition hover:brightness-110 focus-visible:ring-2 focus-visible:ring-elite-cyan";

export function Navbar() {
  const { count, setOpen } = useCart();
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const [mobile, setMobile] = useState(false);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  // Lebar pil menu — diukur biar form search selebar pil (navbar tidak berubah ukuran).
  const pillRef = useRef<HTMLDivElement>(null);
  const [pillW, setPillW] = useState<number | null>(null);
  // ala IG: header transparan di atas, background blur baru muncul pas scroll.
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Ukur lebar pil menu saat masih mode menu — form search dipaksa
  // selebar itu persis, jadi navbar tidak berubah ukuran saat toggle.
  useEffect(() => {
    if (searchOpen) return;
    const measure = () => {
      if (pillRef.current) setPillW(pillRef.current.offsetWidth);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [searchOpen]);

  // Tutup search + dropdown saat klik di luar area search.
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!searchOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setSearchOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [searchOpen]);

  // Halaman detail game (/games/[id]): navbar jadi overlay (fixed) di atas
  // wallpaper — background game full sampai ke atas, kayak di home.
  // Style navbar TIDAK berubah: transparan di atas, blur baru pas scroll.
  const segs = pathname.split("/").filter(Boolean);
  const isDetail = segs[0] === "games" && segs.length > 1;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    const base = href.split("#")[0];
    if (!base || base === "/") return false;
    // Halaman detail (/games/[id]) bukan halaman Catalog — jangan nyalakan
    // highlight biru Catalog di sana.
    if (isDetail && base === "/games") return false;
    return pathname === base || pathname.startsWith(`${base}/`);
  };

  return (
    <header
      className={cn(
        "font-nav transition-colors duration-200",
        isDetail ? "fixed inset-x-0 top-0 z-40" : "sticky top-0 z-40",
        // Background header HANYA saat scroll — klik search di atas tidak memicu.
        scrolled || mobile
          ? "border-b border-white/[0.06] bg-black/60 backdrop-blur-[60px] backdrop-saturate-150"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:p-2 focus:text-elite-cyan">
        Skip to content
      </a>

      <div className="mx-auto flex max-w-7xl items-stretch gap-3 px-4">
        {/* Hamburger — cuma mobile/tablet */}
        <div className="flex items-center lg:hidden">
          <button
            type="button"
            onClick={() => setMobile((v) => !v)}
            aria-label={mobile ? "Close menu" : "Open menu"}
            aria-expanded={mobile}
            className="inline-flex rounded-lg border border-line bg-panel p-2.5 hover:border-elite-blue focus-visible:ring-2 focus-visible:ring-elite-blue"
            style={{ touchAction: "manipulation" }}
          >
            {mobile ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </button>
        </div>

        {/* logo-ig: logo kiri, vertikal tengah terhadap gabungan 2 baris */}
        <Link href="/" title="Home" className="flex shrink-0 items-center gap-2.5 py-4" aria-label="ELITEPLAY home">
          <Image src="/logo-icon.png" alt="ELITEPLAY" width={44} height={44} priority className="h-11 w-11 rounded-lg object-cover" />
          <span className="font-display hidden text-[22px] font-bold uppercase italic tracking-wide sm:block">
            Elite
            <span className="font-black text-elite-red [-webkit-text-stroke:0.6px_currentColor]">
              play
            </span>
          </span>
        </Link>

        {/* div.menu: satu pil ala IG — isi menu utama kita + search.
            Pil SELALU rounded-full + overflow-hidden. Baris = pil + X luar
            sejajar (flex-row). Dropdown dirender FIXED di bawah pil. */}
        <div ref={wrapRef} className="hidden min-w-0 flex-1 flex-col items-center justify-center py-2.5 lg:flex">
          <div className="flex w-full items-center justify-center gap-2">
          <div
            id="nav-pill"
            ref={pillRef}
            className={cn(
              "relative flex h-[54px] w-fit max-w-full items-center gap-[5px] overflow-hidden rounded-full py-0 pl-[10px] pr-0 transition-all duration-200",
              scrolled
                ? "border border-transparent bg-transparent shadow-none backdrop-blur-0"
                : "border border-transparent bg-white/[0.07] shadow-[0_8px_28px_-8px_rgb(0_0_0/0.8)] backdrop-blur-[60px] backdrop-saturate-150",
            )}
          >
            {/* Lapisan wipe: gradient pas selebar pil, scaleX dari kanan.
                Tanpa lingkaran raksasa — tidak bisa bocor/noda. */}
            <span
              aria-hidden="true"
              className={cn(
                "btn-elite pointer-events-none absolute inset-0 origin-right rounded-full transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform",
                searchOpen ? "scale-x-100" : "scale-x-0",
              )}
            />
            {searchOpen ? (
              <form
                action="/games"
                method="get"
                role="search"
                style={pillW ? { width: pillW } : undefined}
                className="search-form-in relative flex max-w-[60vw] items-center gap-1 py-1 pl-3 pr-1"
              >
                <label htmlFor="nav-search" className="sr-only">
                  Search games
                </label>
                <input
                  id="nav-search"
                  name="q"
                  type="search"
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setSearchOpen(false);
                  }}
                  placeholder="Minecraft, RPG, multiplayer..."
                  autoComplete="off"
                  spellCheck={false}
                  className="h-10 min-w-0 flex-1 bg-transparent px-2 text-sm text-white placeholder:text-white/40 focus:outline-none"
                />
                {/* Hapus tulisan — ikon backspace kayak referensi (di DALAM pil). */}
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <Delete className="h-5 w-5" aria-hidden="true" />
                  </button>
                )}
                {/* Pas kosong: teks "Advanced search" di kanan dalam (kayak referensi). */}
                {!query && (
                  <button
                    type="submit"
                    className="shrink-0 whitespace-nowrap rounded-full px-3 py-2 text-sm font-bold text-white/90 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    Advanced search
                  </button>
                )}
              </form>
            ) : (
              <>
                <nav aria-label="Main menu" className="relative">
                  <ul className="scrollbar-none flex items-center gap-[5px] overflow-x-auto py-1">
                    {platforms.map((s) => {
                      const Icon = s.icon;
                      const active = isActive(s.href);
                      return (
                      <li key={s.label} className="flex shrink-0 items-center">
                        <Link
                          href={s.href}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex h-10 items-center gap-2 whitespace-nowrap rounded-full px-4 py-0 text-[17px] font-normal transition-colors",
                            active ? "btn-elite text-white shadow-lg shadow-elite-blue/30" : "text-white/85 hover:bg-white/[0.15]",
                          )}
                        >
                          <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                          {s.label}
                        </Link>
                      </li>
                      );
                    })}
                  </ul>
                </nav>
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  aria-label="Open search"
                  className={cn(searchBtn, "relative")}
                >
                  <Search className="h-5 w-5" aria-hidden="true" />
                </button>
              </>
            )}
          </div>

          {/* X luar — SEJAJAR di kanan pil (bukan di bawah), tutup search & balikin menu.
              Lingkaran outline kayak referensi. */}
          {searchOpen && (
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              aria-label="Close search"
              className="search-form-in grid h-10 w-10 shrink-0 place-items-center self-center rounded-full border border-white/40 text-white/90 transition-colors hover:border-white hover:bg-white/10 hover:text-white"
              style={{ touchAction: "manipulation" }}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
          </div>

          {/* Dropdown saran game — FIXED tepat di bawah pil, selebar pil.
              Di luar alur layout: header & halaman tidak ikut melar ke bawah. */}
          {searchOpen && (
            <SearchSuggest query={query} onPick={() => setSearchOpen(false)} />
          )}
        </div>

        {/* header-right: tema · cart · avatar lingkaran */}
        <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
          <button
            type="button"
            onClick={toggle}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="hidden h-11 w-11 place-items-center rounded-xl text-white/70 transition-colors hover:bg-white/10 hover:text-white sm:grid"
            style={{ touchAction: "manipulation" }}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Moon className="h-5 w-5" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={`Open cart, ${count} items`}
            title="Go to cart"
            className="relative grid h-11 w-11 place-items-center rounded-xl text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            style={{ touchAction: "manipulation" }}
          >
            <ShoppingCart className="h-[22px] w-[22px]" aria-hidden="true" />
            {count > 0 && (
              <span aria-live="polite" className="btn-danger absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white tabular">
                {count}
              </span>
            )}
          </button>

          <Link
            href="/checkout"
            aria-label="Account"
            title="Account"
            className="ml-0.5 grid h-11 w-11 place-items-center rounded-full border border-white/25 text-white/80 transition-colors hover:border-white hover:text-white focus-visible:ring-2 focus-visible:ring-elite-blue"
          >
            <User className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Mobile/tablet: search full + menu geser */}
      <div className="px-4 pb-3 lg:hidden">
        <form action="/games" method="get" role="search" className="w-full">
          <label htmlFor="m-search" className="sr-only">
            Search games
          </label>
          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/50 p-1.5 backdrop-blur-md">
            <input
              id="m-search"
              name="q"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search GTA V, Elden Ring…"
              autoComplete="off"
              spellCheck={false}
              className="h-10 min-w-0 flex-1 bg-transparent px-3 text-sm text-white placeholder:text-white/40 focus:outline-none"
            />
            <button type="submit" aria-label="Search" className={searchBtn}>
              <Search className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </form>
        <div className="scrollbar-none -mx-4 mt-2 flex items-center gap-1 overflow-x-auto px-4">
          {platforms.map((s) => {
            const Icon = s.icon;
            return (
            <Link
              key={s.label}
              href={s.href}
              className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-xs font-semibold text-white/75"
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {s.label}
            </Link>
            );
          })}
        </div>
      </div>

      {/* Panel hamburger: menu utama + tema */}
      {mobile && (
        <div className="border-t border-line bg-abyss px-4 py-3 lg:hidden">
          <nav className="flex flex-col gap-1 text-sm" aria-label="Mobile">
            {platforms.map((l) => (
              <Link
                key={l.href + l.label}
                href={l.href}
                onClick={() => setMobile(false)}
                aria-current={isActive(l.href) ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3 py-2",
                  isActive(l.href) ? "text-elite-silver" : "text-elite-silver/80 hover:bg-panel hover:text-elite-cyan",
                )}
              >
                {l.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => { toggle(); setMobile(false); }}
              className="rounded-lg px-3 py-2 text-left text-elite-silver/80 hover:bg-panel hover:text-elite-cyan sm:hidden"
            >
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
