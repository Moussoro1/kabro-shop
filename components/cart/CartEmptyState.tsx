import type { ReactElement } from "react";
import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";

export function CartEmptyState(): ReactElement {
  return (
    <section
      id="cart-empty-state"
      className="border border-dashed border-sand rounded [border-radius:4px] p-8 sm:p-12 text-center my-8 bg-paper max-w-xl mx-auto shadow-2xs"
      aria-labelledby="cart-empty-title"
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-sand/30 flex items-center justify-center text-primary/70">
        <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10" aria-hidden="true" />
      </div>

      <h2
        id="cart-empty-title"
        className="font-display text-xl sm:text-2xl font-extrabold text-charcoal mb-2"
      >
        Votre panier est vide
      </h2>

      <p className="text-xs sm:text-sm text-charcoal/70 mb-6 max-w-md mx-auto leading-relaxed">
        Vous n&apos;avez actuellement aucun article dans votre panier. Parcourez nos
        produits pour découvrir les créations artisanales, vêtements wax et cosmétiques
        disponibles immédiatement à N&apos;Djamena.
      </p>

      <Link
        href="/products"
        id="cart-empty-browse-cta"
        aria-label="Découvrir la boutique et parcourir le catalogue"
        className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-3 bg-accent text-charcoal font-display font-bold text-sm sm:text-base rounded [border-radius:3px] hover:brightness-95 active:scale-[0.99] transition-all shadow-xs cursor-pointer focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
      >
        <span>Découvrir la boutique</span>
        <ArrowRight className="w-4 h-4" aria-hidden="true" />
      </Link>
    </section>
  );
}

export default CartEmptyState;
