"use client";

import { type ReactElement, useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, Search, Store } from "lucide-react";
import { useCart } from "@/context/CartContext";

export function Header(): ReactElement {
  const { items } = useCart();
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect((): (() => void) => {
    const timer = setTimeout((): void => {
      setMounted(true);
    }, 0);
    return (): void => {
      clearTimeout(timer);
    };
  }, []);

  const totalItemCount = mounted
    ? items.reduce((sum, item) => sum + item.quantity, 0)
    : 0;

  return (
    <header id="site-header" className="sticky top-0 z-40 bg-paper/95 backdrop-blur-md border-b border-sand/70 shadow-xs">
      {/* Micro-bandeau de réassurance supérieure */}
      <div id="header-announcement-bar" className="bg-primary text-paper text-[11px] sm:text-xs py-1 px-4 text-center font-medium tracking-wide">
        <p className="truncate">
          📦 <span className="font-bold">Paiement à la livraison</span> • Commande rapide &amp; confirmation WhatsApp
        </p>
      </div>

      {/* Barre de navigation principale */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Logo / Nom de boutique */}
        <Link
          href="/"
          id="header-brand-logo"
          className="flex items-center gap-2 group min-h-[44px] min-w-[44px] py-1 -ml-1 pl-1"
          aria-label="Accueil Kabro Shop"
        >
          <div className="w-8 h-8 rounded-md bg-primary text-paper flex items-center justify-center font-display font-black text-base shadow-xs group-hover:bg-primary/90 transition-colors">
            K
          </div>
          <div className="flex flex-col">
            <span className="font-display font-black text-lg sm:text-xl tracking-tight text-primary leading-none group-hover:text-primary/90 transition-colors">
              Kabro<span className="text-accent ml-0.5">.</span>
            </span>
            <span className="font-mono text-[9px] uppercase tracking-wider text-charcoal/60 leading-none mt-0.5">
              Shop Africain
            </span>
          </div>
        </Link>

        {/* Actions & Navigation */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Lien Boutique */}
          <Link
            href="/products"
            id="header-nav-products"
            className="h-11 px-2.5 sm:px-3 rounded-lg inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-charcoal hover:text-primary hover:bg-sand/40 transition-colors"
          >
            <Store className="w-4 h-4 text-charcoal/70" />
            <span className="hidden xs:inline">Boutique</span>
          </Link>

          {/* Recherche rapide vers le catalogue */}
          <Link
            href="/products"
            id="header-search-button"
            className="w-11 h-11 rounded-lg inline-flex items-center justify-center text-charcoal hover:text-primary hover:bg-sand/40 transition-colors"
            aria-label="Rechercher des produits dans la boutique"
          >
            <Search className="w-5 h-5" />
          </Link>

          {/* Panier avec cible tactile min 44px */}
          <Link
            href="/cart"
            id="header-cart-button"
            className="w-11 h-11 relative rounded-lg inline-flex items-center justify-center text-charcoal hover:text-primary hover:bg-sand/40 transition-colors"
            aria-label={`Panier avec ${totalItemCount} articles`}
          >
            <ShoppingBag className="w-5 h-5 text-charcoal" />
            {totalItemCount > 0 && (
              <span
                id="header-cart-badge"
                className="absolute top-1.5 right-1.5 bg-accent text-charcoal font-mono text-[10px] font-black min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border border-paper shadow-xs"
              >
                {totalItemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
