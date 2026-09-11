import type { Metadata } from "next";
import { Special_Elite, Courier_Prime } from "next/font/google";
import GrainOverlay from "@/components/GrainOverlay";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

const specialElite = Special_Elite({
  variable: "--font-special-elite",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const courierPrime = Courier_Prime({
  variable: "--font-courier-prime",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tírame un Poemita",
  description:
    "Poemas al azar, leídos en voz alta, escritos como si aún salieran de una máquina de escribir.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${specialElite.variable} ${courierPrime.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <GrainOverlay />
        <div id="app-root" className="flex flex-col min-h-full">
          <SiteHeader />
          <main className="flex-1 flex flex-col">{children}</main>
          <footer className="border-t border-ink/15 px-6 py-5 text-xs tracking-wide text-ink-soft flex items-center justify-between max-w-5xl mx-auto w-full">
            <span>tírame un poemita — {new Date().getFullYear()}</span>
            <span className="italic">hecho a máquina, verso a verso.</span>
          </footer>
        </div>
      </body>
    </html>
  );
}
