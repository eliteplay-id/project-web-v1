import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line bg-[#050508]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Image src="/logo.png" alt="ELITEPLAY logo" width={220} height={140} loading="lazy" className="h-auto w-44 rounded-lg object-cover" />
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted">
            Play Like Elite, Pay Less. Cheap legit Steam keys with instant email delivery and IDR payment support coming soon.
          </p>
          <div aria-hidden="true" className="brand-underline mt-4 h-1 w-32 rounded-full" />
        </div>
        <nav aria-label="Shop">
          <p className="text-sm font-semibold tracking-[-0.01em]">Shop</p>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-muted">
            <li><Link href="/games" className="hover:text-elite-cyan">All games</Link></li>
            <li><Link href="/games?sort=discount" className="hover:text-elite-cyan">Biggest discounts</Link></li>
            <li><Link href="/games?sort=cheap" className="hover:text-elite-cyan">Cheapest first</Link></li>
          </ul>
        </nav>
        <nav aria-label="Support">
          <p className="text-sm font-semibold tracking-[-0.01em]">Support</p>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-muted">
            <li><Link href="/#faq" className="hover:text-elite-cyan">FAQ</Link></li>
            <li><Link href="/checkout" className="hover:text-elite-cyan">Checkout</Link></li>
            <li><Link href="/games?q=gta" className="hover:text-elite-cyan">Track order (soon)</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 <span translate="no">ELITEPLAY</span>. All rights reserved.</p>
          <p>Keys redeem on Steam. Not affiliated with Valve.</p>
        </div>
      </div>
    </footer>
  );
}
