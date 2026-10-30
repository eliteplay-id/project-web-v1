import type { Metadata } from "next";
import { Barlow, Chakra_Petch, Geist } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import { ThemeProvider } from "@/lib/theme";
import { Navbar } from "@/components/navbar";
import { CartSheet } from "@/components/cart-sheet";
import { Footer } from "@/components/footer";

const display = Chakra_Petch({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

// Barlow — font asli navbar Instant Gaming (barlow-regular/medium/bold).
const nav = Barlow({
  variable: "--font-nav",
  subsets: ["latin"],
  weight: ["400", "700"],
});

// Geist — ala bridgeplay: geometris, tracking rapat, tenang (body + UI umum).
const body = Geist({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ELITEPLAY — Play Like Elite, Pay Less",
  description: "Cheap legit Steam keys with instant delivery. GTA V, Elden Ring, RDR 2 and more at IDR prices.",
};

export const viewport = {
  themeColor: "#08080c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${nav.variable} h-full antialiased`}>
      <head>
        {/* Pasang tema tersimpan SEBELUM render — cegah kedip dark→light */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("eliteplay-theme");if(!t){t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}if(t==="light")document.documentElement.classList.add("light")}catch(e){}})();`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          <CartProvider>
            <Navbar />
            <CartSheet />
            <div id="main" className="flex flex-1 flex-col">
              {children}
            </div>
            <Footer />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
