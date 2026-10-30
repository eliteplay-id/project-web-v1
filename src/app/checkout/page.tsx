"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, QrCode, Wallet, Building2, CheckCircle2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatIDR } from "@/lib/format";
import { coverOf } from "@/data/games";
import { cn } from "@/lib/utils";

const methods = [
  { id: "qris", icon: QrCode, label: "QRIS", sub: "All e-wallets & m-banking" },
  { id: "va", icon: Building2, label: "Virtual Account", sub: "BCA, BRI, Mandiri, BNI" },
  { id: "ewallet", icon: Wallet, label: "E-Wallet", sub: "GoPay, OVO, DANA, ShopeePay" },
];

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const router = useRouter();
  const [method, setMethod] = useState("qris");
  const [done, setDone] = useState(false);
  const fee = 0;

  const pay = (e: React.FormEvent) => {
    e.preventDefault();
    setDone(true);
  };

  if (done) {
    return (
      <main className="mx-auto flex max-w-xl flex-1 flex-col items-center px-4 py-16 text-center">
        <CheckCircle2 className="h-14 w-14 text-emerald-400" aria-hidden="true" />
        <h1 className="font-display mt-4 text-3xl font-black uppercase italic">Order received</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          This is a frontend preview — payment gateway ships in phase 2. Your cart was kept so you can review it, or clear it to start over.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => { clear(); router.push("/games"); }}
            className="btn-elite rounded-lg px-6 py-3 text-sm font-black uppercase italic text-white"
            style={{ touchAction: "manipulation" }}
          >
            Back to shop
          </button>
          <button
            type="button"
            onClick={() => setDone(false)}
            className="rounded-lg border border-line bg-panel px-6 py-3 text-sm font-bold"
            style={{ touchAction: "manipulation" }}
          >
            Review order
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl flex-1 px-4 py-8">
      <Link href="/games" className="inline-flex items-center gap-1 text-sm font-bold text-muted hover:text-elite-cyan">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Continue shopping
      </Link>
      <h1 className="font-display mt-2 text-3xl font-black uppercase italic md:text-4xl">Checkout</h1>

      {items.length === 0 ? (
        <div className="mt-8 rounded-xl border border-line bg-panel p-10 text-center">
          <p className="font-display text-xl font-bold uppercase italic">Your cart is empty</p>
          <p className="mt-2 text-sm text-muted">Add some games first — deals wait for no one.</p>
          <Link href="/games" className="btn-elite mt-5 inline-block rounded-lg px-6 py-3 text-sm font-black uppercase italic text-white">
            Browse games
          </Link>
        </div>
      ) : (
        <form onSubmit={pay} className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-4 lg:col-span-2">
            <section aria-labelledby="contact" className="rounded-xl border border-line bg-panel p-6">
              <h2 id="contact" className="font-display text-lg font-black uppercase italic">1. Where to send the key</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="email" className="text-xs font-bold uppercase tracking-wide text-muted">Email</label>
                  <input
                    id="email" name="email" type="email" required autoComplete="email" spellCheck={false}
                    placeholder="you@mail.com…"
                    className="mt-1 w-full rounded-lg border border-line bg-panel-2 px-3 py-2.5 text-sm placeholder:text-muted focus:border-elite-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-elite-blue"
                  />
                </div>
                <div>
                  <label htmlFor="wa" className="text-xs font-bold uppercase tracking-wide text-muted">WhatsApp (backup)</label>
                  <input
                    id="wa" name="wa" type="tel" inputMode="tel" autoComplete="tel"
                    placeholder="08xx-xxxx-xxxx…"
                    className="mt-1 w-full rounded-lg border border-line bg-panel-2 px-3 py-2.5 text-sm placeholder:text-muted focus:border-elite-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-elite-blue"
                  />
                </div>
              </div>
            </section>

            <section aria-labelledby="paym" className="rounded-xl border border-line bg-panel p-6">
              <h2 id="paym" className="font-display text-lg font-black uppercase italic">2. Payment method</h2>
              <div className="mt-4 grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Payment method">
                {methods.map(({ id, icon: Icon, label, sub }) => (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={method === id}
                    onClick={() => setMethod(id)}
                    className={cn(
                      "rounded-xl border p-4 text-left",
                      method === id ? "border-elite-blue bg-panel-2" : "border-line hover:border-elite-blue",
                    )}
                    style={{ touchAction: "manipulation" }}
                  >
                    <Icon className={cn("h-5 w-5", method === id ? "text-elite-cyan" : "text-muted")} aria-hidden="true" />
                    <p className="mt-2 text-sm font-bold">{label}</p>
                    <p className="text-xs text-muted">{sub}</p>
                  </button>
                ))}
              </div>
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-400/10 px-3 py-2 text-xs text-amber-300">
                <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                Gateway coming soon — clicking Pay only previews the success screen.
              </p>
            </section>
          </div>

          <aside aria-labelledby="summary" className="h-fit rounded-xl border border-line bg-panel p-6 lg:sticky lg:top-20">
            <h2 id="summary" className="font-display text-lg font-black uppercase italic">Order summary</h2>
            <ul className="mt-4 flex max-h-72 flex-col gap-3 overflow-y-auto">
              {items.map((i) => (
                <li key={`${i.game.id}__${i.edition}`} className="flex gap-3">
                  <Image src={coverOf(i.game)} alt="" width={92} height={43} loading="lazy" className="h-11 w-[92px] shrink-0 rounded-md object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold">{i.game.title}</p>
                    <p className="text-[11px] text-muted">{i.edition} × {i.qty}</p>
                  </div>
                  <p className="shrink-0 text-xs font-bold tabular">{formatIDR(i.price * i.qty)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
              <div className="flex justify-between text-muted"><dt>Subtotal</dt><dd className="tabular">{formatIDR(total)}</dd></div>
              <div className="flex justify-between text-muted"><dt>Service fee</dt><dd className="tabular">{formatIDR(fee)}</dd></div>
              <div className="flex justify-between font-display text-lg font-black italic"><dt>Total</dt><dd className="text-elite-cyan tabular">{formatIDR(total + fee)}</dd></div>
            </dl>
            <button
              type="submit"
              className="btn-elite mt-4 w-full rounded-lg py-3 font-display text-sm font-black uppercase italic text-white hover:brightness-110 focus-visible:ring-2 focus-visible:ring-elite-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-abyss"
              style={{ touchAction: "manipulation" }}
            >
              Pay {formatIDR(total + fee)}
            </button>
            <p className="mt-2 text-center text-[11px] text-muted">Key arrives by email after gateway goes live.</p>
          </aside>
        </form>
      )}
    </main>
  );
}
