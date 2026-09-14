"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

export function Header(): ReactElement {
  const { items } = useCart();
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header id="site-header" className="border-b border-sand bg-paper/95 sticky top-0 z-30 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          href="/"
          id="header-brand-logo"
          className="font-display font-bold text-lg sm:text-xl tracking-tight text-primary hover:opacity-90 transition-opacity"
        >
          BOUTIQUE MARCHE
        </Link>

        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/products"
            id="header-nav-products"
            className="text-sm font-medium text-charcoal hover:text-primary transition-colors"
          >
            Boutique
          </Link>

          <Link
            href="/cart"
            id="header-cart-button"
            className="relative p-2 text-charcoal hover:text-primary transition-colors inline-flex items-center"
            aria-label={`Panier avec ${totalItemCount} articles`}
          >
            <ShoppingBag className="w-5 h-5 text-charcoal" />
            {totalItemCount > 0 && (
              <span
                id="header-cart-badge"
                className="absolute -top-1 -right-1 bg-accent text-charcoal font-mono text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-sand"
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
