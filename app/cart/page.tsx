"use client";

import { type ReactElement, useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { Header } from "@/components/Header";
import { useCart } from "@/context/CartContext";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { CartSummaryCard } from "@/components/cart/CartSummaryCard";
import { CartEmptyState } from "@/components/cart/CartEmptyState";

export default function CartPage(): ReactElement {
  const { items, updateQuantity, removeItem, total, clearCart } = useCart();
  const [mounted, setMounted] = useState<boolean>(false);
  const [announcement, setAnnouncement] = useState<string>("");

  useEffect((): (() => void) => {
    const timer = setTimeout((): void => {
      setMounted(true);
    }, 0);
    return (): void => {
      clearTimeout(timer);
    };
  }, []);

  // Total d'articles cumulés (ex: 2 robes + 1 beurre = 3 articles)
  const totalItemsCount = useMemo((): number => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const handleUpdateQuantity = useCallback(
    (productId: string, newQuantity: number): void => {
      const targetItem = items.find((i) => i.productId === productId);
      const itemName = targetItem ? targetItem.name : "Article";
      updateQuantity(productId, newQuantity);
      setAnnouncement(`Quantité de ${itemName} mise à jour : ${newQuantity}`);
    },
    [items, updateQuantity]
  );

  const handleRemoveItem = useCallback(
    (productId: string): void => {
      const targetItem = items.find((i) => i.productId === productId);
      const itemName = targetItem ? targetItem.name : "Article";
      removeItem(productId);
      setAnnouncement(`${itemName} a été retiré de votre panier`);
    },
    [items, removeItem]
  );

  const handleClearCart = useCallback((): void => {
    if (window.confirm("Êtes-vous sûr de vouloir vider l'ensemble de votre panier ?")) {
      clearCart();
      setAnnouncement("Votre panier a été entièrement vidé");
    }
  }, [clearCart]);

  const hasItems = mounted && items.length > 0;

  return (
    <div
      id="cart-page-container"
      className="min-h-screen bg-paper text-charcoal flex flex-col overflow-x-hidden"
    >
      <Header />

      {/* Zone accessible d'annonces dynamiques pour lecteurs d'écran (A11y) */}
      <div
        id="cart-live-region"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      <main
        id="cart-main-content"
        className="flex-1 max-w-5xl w-full mx-auto px-3.5 sm:px-6 py-5 sm:py-8 md:py-10"
      >
        {/* Barre supérieure de navigation contextuelle */}
        <div className="mb-6 flex items-center justify-between border-b border-sand pb-4 gap-2 flex-wrap">
          <div>
            <Link
              href="/products"
              id="cart-back-to-shop-link"
              aria-label="Retourner aux produits de la boutique"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal/70 hover:text-primary transition-colors mb-1.5 focus-visible:outline-2 focus-visible:outline-primary"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Continuer mes achats</span>
            </Link>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-charcoal tracking-tight">
              Mon Panier
            </h1>
          </div>

          {hasItems && (
            <button
              type="button"
              id="cart-clear-all-button"
              onClick={handleClearCart}
              aria-label="Vider entièrement le panier"
              className="inline-flex items-center gap-1 text-xs font-mono font-medium text-danger/80 hover:text-danger hover:underline p-2 rounded transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-danger"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Vider le panier</span>
            </button>
          )}
        </div>

        {/* État de chargement initial / hydratation */}
        {!mounted ? (
          <div
            id="cart-loading-indicator"
            className="flex items-center justify-center py-24 text-charcoal/60"
            role="status"
            aria-live="polite"
          >
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" aria-hidden="true" />
              <span className="text-xs font-mono">Chargement de votre panier...</span>
            </div>
          </div>
        ) : hasItems ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Colonne Gauche : Liste des articles */}
            <section
              id="cart-items-section"
              className="lg:col-span-7 space-y-4"
              aria-label="Liste des articles dans le panier"
            >
              <div
                id="cart-items-container"
                className="relative bg-paper border border-sand rounded-lg p-4 sm:p-6 shadow-sm"
              >
                {/* En-tête de la liste des articles */}
                <div className="border-b border-sand pb-3.5 mb-2 flex justify-between items-center text-xs">
                  <span className="font-mono uppercase tracking-wider text-charcoal/70 font-semibold">
                    Articles ({totalItemsCount})
                  </span>
                  <span className="font-mono font-bold text-primary">
                    {items.length} {items.length > 1 ? "références" : "référence"}
                  </span>
                </div>

                {/* Liste des lignes d'articles */}
                <div className="divide-y divide-sand/80">
                  {items.map((item) => (
                    <CartItemRow
                      key={item.productId}
                      item={item}
                      onUpdateQuantity={handleUpdateQuantity}
                      onRemoveItem={handleRemoveItem}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Colonne Droite : Récapitulatif & CTA */}
            <aside
              id="cart-summary-aside"
              className="lg:col-span-5"
              aria-label="Récapitulatif financier et validation"
            >
              <CartSummaryCard
                totalAmount={total}
                totalItems={totalItemsCount}
              />
            </aside>
          </div>
        ) : (
          /* État Panier Vide */
          <CartEmptyState />
        )}
      </main>
    </div>
  );
}
