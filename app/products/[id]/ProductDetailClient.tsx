"use client";

import { useState, type ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, ShoppingBag, Check, ShieldCheck, Truck } from "lucide-react";
import { Header } from "@/components/Header";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/types";

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps): ReactElement {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState<boolean>(false);
  const { addItem } = useCart();

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;
  const activeImage = product.images[selectedImageIndex] || product.images[0] || "https://picsum.photos/seed/placeholder/800/800";
  
  const stockBadgeText = isOutOfStock
    ? "Épuisé"
    : isLowStock
    ? `Dernières pièces (${product.stock})`
    : "En stock";

  const stockBadgeClass = isOutOfStock
    ? "bg-danger/10 text-danger border-danger/20"
    : isLowStock
    ? "bg-accent/20 text-charcoal border-accent/40"
    : "bg-emerald-500/10 text-emerald-800 border-emerald-500/20";

  const stockDotClass = isOutOfStock
    ? "bg-danger"
    : isLowStock
    ? "bg-amber-600 animate-pulse"
    : "bg-emerald-600";

  const handleIncrement = (): void => {
    if (quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = (): void => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = (): void => {
    if (isOutOfStock) return;
    
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: activeImage,
    });
    
    setIsAdded(true);
    setTimeout((): void => {
      setIsAdded(false);
    }, 2000);
  };

  return (
    <div id="product-detail-container" className="min-h-screen bg-paper text-charcoal flex flex-col pb-24 md:pb-12">
      <Header />
      
      <main id="product-detail-main" className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 md:py-8">
        {/* 1. Retour au catalogue */}
        <div className="mb-6">
          <Link
            href="/products"
            id="detail-back-link"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-charcoal/80 hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour au catalogue</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* 2. Galerie d'Images */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full bg-sand/15 border border-sand/60 rounded-xl overflow-hidden">
              {product.images.length > 1 && (
                <div className="absolute top-3 left-3 z-10 pointer-events-none">
                  <span className="inline-flex items-center justify-center px-2 py-1 bg-paper/90 backdrop-blur-sm border border-sand/50 rounded-md text-[10px] sm:text-xs font-mono font-semibold text-charcoal shadow-sm">
                    {selectedImageIndex + 1} / {product.images.length}
                  </span>
                </div>
              )}
              <Image
                src={activeImage}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className={`object-cover transition-opacity duration-300 ${isOutOfStock ? "grayscale opacity-75" : ""}`}
                referrerPolicy="no-referrer"
              />
            </div>
            
            {/* Miniatures */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                {product.images.map((img, idx) => (
                  <button
                    key={img}
                    type="button"
                    onClick={(): void => setSelectedImageIndex(idx)}
                    aria-label={`Afficher l'image ${idx + 1} sur ${product.images.length}`}
                    aria-current={selectedImageIndex === idx ? "true" : "false"}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer snap-start focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                      selectedImageIndex === idx ? "border-primary shadow-sm" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Miniature ${idx + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Informations Produit */}
          <div className="flex flex-col">
            {/* 3. Nom du produit */}
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-charcoal tracking-tight mb-4">
              {product.name}
            </h1>

            {/* 4. Prix et 5. Disponibilité regroupés */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4 mb-6 pb-6 border-b border-sand/60">
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-primary font-black text-3xl sm:text-4xl tracking-tight">
                  {product.price.toLocaleString("fr-FR")}
                </span>
                <span className="text-sm font-bold text-primary/80 uppercase">
                  FCFA
                </span>
              </div>
              
              <div className="sm:mb-1.5">
                <span
                  className={`inline-flex items-center gap-1.5 font-mono text-xs font-semibold px-2.5 py-1 border rounded-full ${stockBadgeClass}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${stockDotClass}`} />
                  {stockBadgeText}
                </span>
              </div>
            </div>

            {/* 6. Description */}
            <div className="prose text-charcoal/85 text-sm sm:text-base leading-relaxed mb-8 font-body">
              {product.description ? (
                <p className="whitespace-pre-line">{product.description}</p>
              ) : (
                <p className="text-charcoal/50 italic">Aucune description disponible pour ce produit.</p>
              )}
            </div>

            {/* 7. Quantité */}
            {!isOutOfStock && (
              <div className="mb-8">
                <label htmlFor="quantity-selector" className="block font-mono text-xs uppercase font-medium text-charcoal/70 mb-2.5">
                  Quantité {product.stock > 0 && <span className="text-charcoal/50 normal-case">(maximum {product.stock})</span>}
                </label>
                <div className="inline-flex items-center border border-sand bg-paper rounded-lg overflow-hidden shadow-sm">
                  <button
                    type="button"
                    id="qty-minus-btn"
                    onClick={handleDecrement}
                    disabled={quantity <= 1}
                    aria-label="Diminuer la quantité"
                    className="w-12 h-11 min-h-[44px] flex items-center justify-center text-charcoal hover:bg-sand/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer focus:outline-none focus-visible:bg-sand/30"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span
                    id="quantity-selector"
                    aria-live="polite"
                    className="w-12 text-center font-mono font-bold text-base text-charcoal select-none border-x border-sand/50 h-11 min-h-[44px] flex items-center justify-center"
                  >
                    {quantity}
                  </span>
                  <button
                    type="button"
                    id="qty-plus-btn"
                    onClick={handleIncrement}
                    disabled={quantity >= product.stock}
                    aria-label="Augmenter la quantité"
                    className="w-12 h-11 min-h-[44px] flex items-center justify-center text-charcoal hover:bg-sand/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer focus:outline-none focus-visible:bg-sand/30"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* 8. Réassurance */}
            <div className="space-y-3 bg-sand/15 border border-sand/60 rounded-xl p-4 mb-8">
              <div className="flex items-start gap-3 text-sm text-charcoal/80">
                <Truck className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <span className="leading-snug">Livraison rapide à domicile ou au bureau</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-charcoal/80">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                <span className="leading-snug">Vérifiez votre colis avant de régler le livreur</span>
              </div>
            </div>

            {/* 9. Desktop CTA */}
            <div className="hidden md:block mt-auto">
              {isOutOfStock ? (
                <button
                  type="button"
                  disabled
                  id="detail-cta-disabled-desktop"
                  className="w-full h-12 min-h-[48px] px-6 bg-sand/40 text-charcoal/50 font-bold text-sm uppercase rounded-xl cursor-not-allowed font-mono text-center border border-sand/60"
                >
                  Produit épuisé
                </button>
              ) : (
                <button
                  type="button"
                  id="detail-cta-add-desktop"
                  onClick={handleAddToCart}
                  className={`w-full h-12 min-h-[48px] px-6 font-bold text-base rounded-xl inline-flex items-center justify-center gap-2 hover:brightness-95 active:scale-[0.99] transition-all cursor-pointer shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                    isAdded ? "bg-success text-paper" : "bg-accent text-charcoal"
                  }`}
                  aria-label={isAdded ? "Produit ajouté au panier" : "Ajouter au panier"}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Ajouté au panier !</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" />
                      <span>Ajouter au panier • {(product.price * quantity).toLocaleString("fr-FR")} FCFA</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 9. Sticky CTA Mobile en bas */}
      <div
        id="sticky-mobile-cta"
        className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-paper/95 border-t border-sand/60 backdrop-blur-md z-30 flex items-center gap-4 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] pb-[calc(1rem+env(safe-area-inset-bottom))]"
      >
        <div className="flex-1 min-w-0">
          <span className="font-mono text-[10px] text-charcoal/60 block uppercase tracking-wider font-semibold">Total</span>
          <p className="font-mono font-bold text-primary text-lg truncate">
            {(product.price * quantity).toLocaleString("fr-FR")} <span className="text-xs uppercase">FCFA</span>
          </p>
        </div>
        <div className="flex-[2] shrink-0">
          {isOutOfStock ? (
            <button
              type="button"
              disabled
              id="sticky-mobile-cta-disabled"
              className="w-full h-12 min-h-[48px] px-4 bg-sand/40 text-charcoal/50 font-bold text-xs uppercase rounded-lg cursor-not-allowed font-mono text-center border border-sand/60"
            >
              Épuisé
            </button>
          ) : (
            <button
              type="button"
              id="sticky-mobile-cta-add"
              onClick={handleAddToCart}
              className={`w-full h-12 min-h-[48px] px-4 font-bold text-sm rounded-lg inline-flex items-center justify-center gap-2 hover:brightness-95 active:scale-[0.98] transition-all cursor-pointer shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 ${
                isAdded ? "bg-success text-paper" : "bg-accent text-charcoal"
              }`}
              aria-label={isAdded ? "Produit ajouté" : "Ajouter au panier"}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Ajouté !</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Ajouter</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
