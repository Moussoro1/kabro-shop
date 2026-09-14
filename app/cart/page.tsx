"use client";

import type { ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ArrowRight, ArrowLeft, ShoppingBag, Truck, ShieldCheck } from "lucide-react";
import { Header } from "@/components/Header";
import { useCart } from "@/context/CartContext";

export default function CartPage(): ReactElement {
  const { items, updateQuantity, removeItem, total, clearCart } = useCart();
  const hasItems = items.length > 0;

  return (
    <div id="cart-page-container" className="min-h-screen bg-paper text-charcoal flex flex-col">
      <Header />

      <main id="cart-main" className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 md:py-10">
        {/* En-tête Panier */}
        <div className="mb-6 flex items-center justify-between border-b border-sand pb-4">
          <div>
            <Link
              href="/products"
              id="cart-continue-shopping"
              className="inline-flex items-center gap-1.5 text-xs text-charcoal/70 hover:text-primary transition-colors mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continuer mes achats</span>
            </Link>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
              Mon Panier
            </h1>
          </div>

          {hasItems && (
            <button
              type="button"
              id="clear-cart-button"
              onClick={clearCart}
              className="text-xs font-mono text-danger hover:underline cursor-pointer"
            >
              Vider le panier
            </button>
          )}
        </div>

        {hasItems ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Liste façon Ticket de Marché */}
            <div className="lg:col-span-7 space-y-4">
              <div
                id="cart-ticket-container"
                className="relative bg-paper border border-sand rounded [border-radius:4px] p-4 sm:p-6 overflow-hidden"
              >
                {/* Coin perforé ticket */}
                <div
                  className="absolute -top-3 left-6 w-6 h-6 rounded-full bg-paper border-b border-sand z-10 pointer-events-none"
                  aria-hidden="true"
                />

                <div className="border-b border-dashed border-sand pb-3 mb-4 flex justify-between items-center">
                  <span className="font-mono text-xs uppercase tracking-wider text-charcoal/70">
                    Articles du ticket
                  </span>
                  <span className="font-mono text-xs font-bold text-primary">
                    {items.length} {items.length > 1 ? "références" : "référence"}
                  </span>
                </div>

                {/* Items */}
                <div className="divide-y divide-dashed divide-sand/80">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      id={`cart-item-${item.productId}`}
                      className="py-4 flex gap-3 sm:gap-4 items-center"
                    >
                      {/* Image miniature */}
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-sand/20 border border-sand rounded [border-radius:2px] overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Détails & Quantité */}
                      <div className="flex-1 min-w-0">
                        <h2 className="font-display font-semibold text-charcoal text-sm sm:text-base truncate">
                          {item.name}
                        </h2>
                        <p className="font-mono text-xs sm:text-sm text-primary font-bold mt-0.5">
                          {item.price.toLocaleString("fr-FR")} FCFA
                        </p>

                        <div className="flex items-center gap-3 mt-2.5">
                          {/* Contrôle Quantité */}
                          <div className="inline-flex items-center border border-sand bg-paper rounded [border-radius:2px]">
                            <button
                              type="button"
                              id={`cart-minus-btn-${item.productId}`}
                              onClick={(): void => updateQuantity(item.productId, item.quantity - 1)}
                              aria-label="Diminuer la quantité"
                              className="p-1 text-charcoal hover:bg-sand/30 transition-colors cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center font-mono text-xs sm:text-sm font-bold text-charcoal select-none">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              id={`cart-plus-btn-${item.productId}`}
                              onClick={(): void => updateQuantity(item.productId, item.quantity + 1)}
                              aria-label="Augmenter la quantité"
                              className="p-1 text-charcoal hover:bg-sand/30 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Bouton supprimer */}
                          <button
                            type="button"
                            id={`cart-remove-btn-${item.productId}`}
                            onClick={(): void => removeItem(item.productId)}
                            aria-label={`Supprimer ${item.name}`}
                            className="text-charcoal/50 hover:text-danger p-1 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Sous-total item */}
                      <div className="text-right shrink-0">
                        <span className="font-mono text-sm sm:text-base font-bold text-charcoal block">
                          {(item.price * item.quantity).toLocaleString("fr-FR")}
                        </span>
                        <span className="font-mono text-[10px] text-charcoal/60 uppercase">FCFA</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Récapitulatif Total & CTA Commander */}
            <div className="lg:col-span-5">
              <div
                id="cart-summary-card"
                className="bg-paper border border-sand rounded [border-radius:4px] p-5 sm:p-6 sticky top-20"
              >
                <h2 className="font-display font-bold text-lg text-charcoal mb-4">
                  Récapitulatif de la commande
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal/80">Sous-total articles</span>
                    <span className="font-mono font-medium text-charcoal">{total.toLocaleString("fr-FR")} FCFA</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal/80">Mode de règlement</span>
                    <span className="font-mono font-medium text-primary">Paiement à la livraison (COD)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal/80">Frais d&apos;expédition</span>
                    <span className="font-mono font-medium text-success">Calculés à l&apos;adresse</span>
                  </div>
                </div>

                <div className="border-t border-b border-dashed border-sand py-4 mb-6 flex justify-between items-baseline">
                  <div>
                    <span className="font-display font-bold text-base text-charcoal block">
                      Total estimé
                    </span>
                    <span className="text-xs text-charcoal/60">À régler à la réception</span>
                  </div>
                  <span className="font-mono text-2xl font-bold text-primary">
                    {total.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>

                {/* CTA Commander */}
                <Link
                  href="/checkout"
                  id="cart-checkout-cta"
                  className="w-full py-3.5 px-4 bg-accent text-charcoal font-bold text-base rounded [border-radius:2px] inline-flex items-center justify-center gap-2 hover:brightness-95 active:scale-[0.99] transition-all shadow-sm cursor-pointer"
                >
                  <span>Commander</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                {/* Réassurance */}
                <div className="mt-6 pt-4 border-t border-sand space-y-2">
                  <div className="flex items-center gap-2 text-xs text-charcoal/80">
                    <Truck className="w-4 h-4 text-primary shrink-0" />
                    <span>Livraison à domicile ou au bureau</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-charcoal/80">
                    <ShieldCheck className="w-4 h-4 text-success shrink-0" />
                    <span>Pas de paiement par carte exigé à l&apos;avance</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* État Panier Vide */
          <div
            id="cart-empty-state"
            className="border border-dashed border-sand rounded [border-radius:4px] p-12 text-center my-8 bg-paper max-w-xl mx-auto"
          >
            <ShoppingBag className="w-12 h-12 mx-auto text-charcoal/40 mb-3" />
            <h2 className="font-display text-xl font-bold text-charcoal mb-2">
              Votre panier est vide
            </h2>
            <p className="text-sm text-charcoal/70 mb-6 max-w-md mx-auto">
              Découvrez nos articles artisanaux, cosmétiques et mode wax disponibles immédiatement.
            </p>
            <Link
              href="/products"
              id="cart-empty-cta"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-charcoal font-semibold text-sm rounded [border-radius:2px] hover:brightness-95 transition-all cursor-pointer"
            >
              <span>Parcourir la boutique</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
