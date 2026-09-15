import type { Metadata } from "next";
import type { ReactElement, ReactNode } from "react";
import { Bricolage_Grotesque, Inter, IBM_Plex_Mono } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import "./globals.css";

const displayFont = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const bodyFont = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body",
  display: "swap",
});

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Boutique — Marché & Paiement à la Livraison",
  description: "Boutique en ligne avec paiement à la livraison et confirmation directe par WhatsApp.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return (
    <html
      lang="fr"
      className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`}
    >
      <body className="bg-paper text-charcoal font-body antialiased min-h-screen" suppressHydrationWarning>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
