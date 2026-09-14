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
    ? "ÉPUISÉ"
    : isLowStock
    ? "DERNIÈRES PIÈCES"
    : "EN STOCK";

  const stockBadgeColor = isOutOfStock
    ? "text-danger border-danger/60"
    : isLowStock
    ? "text-accent border-accent/80"
    : "text-success border-success/60";

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
        {/* Fil d'ariane / retour */}
        <div className="mb-6">
          <Link
            href="/products"
            id="detail-back-link"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-charcoal/80 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour au catalogue</span>
          </Link>
        </div>

        {/* Grille Détails */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          {/* Galerie d'Images */}
          <div className="space-y-3">
            <div className="relative aspect-square w-full bg-sand/20 border border-sand rounded [border-radius:4px] overflow-hidden">
              {/* Coin perforé ticket */}
              <div
                className="absolute -top-3 left-4 w-6 h-6 rounded-full bg-paper border-b border-sand z-10 pointer-events-none"
                aria-hidden="true"
              />

              <Image
                src={activeImage}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className={`object-cover ${isOutOfStock ? "grayscale opacity-80" : ""}`}
                referrerPolicy="no-referrer"
              />

              {/* Badge stock façon tampon */}
              <div className="absolute top-3 right-3 z-10 pointer-events-none">
                <span
                  className={`inline-block font-mono text-xs font-semibold px-2.5 py-1 bg-paper border rounded [border-radius:2px] uppercase tracking-wider transform -rotate-2 ${stockBadgeColor}`}
                >
                  {stockBadgeText}
                </span>
              </div>
            </div>

            {/* Miniatures */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={img}
                    type="button"
                    onClick={(): void => setSelectedImageIndex(idx)}
                    className={`relative w-16 h-16 rounded [border-radius:2px] overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedImageIndex === idx ? "border-primary" : "border-sand opacity-70"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} vue ${idx + 1}`}
                      fill
                      sizes="64px"
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Informations Produit */}
          <div className="flex flex-col justify-between">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-charcoal/60 block mb-1">
                Réf: {product.id}
              </span>
              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-charcoal tracking-tight mb-3">
                {product.name}
              </h1>

              <div className="border-t border-b border-dashed border-sand py-3 my-4">
                <p className="font-mono text-2xl sm:text-3xl font-bold text-primary">
                  {product.price.toLocaleString("fr-FR")} FCFA
                </p>
                <p className="text-xs text-charcoal/70 mt-1 font-body">
                  Paiement sécurisé à la livraison (en espèces)
                </p>
              </div>

              <div className="prose text-charcoal/85 text-sm sm:text-base leading-relaxed mb-6 font-body">
                <p>{product.description}</p>
              </div>

              {/* Sélecteur de quantité */}
              {!isOutOfStock && (
                <div className="mb-6">
                  <label htmlFor="quantity-selector" className="block font-mono text-xs uppercase font-medium text-charcoal/70 mb-2">
                    Quantité {product.stock > 0 && <span className="text-charcoal/50">(max {product.stock})</span>}
                  </label>
                  <div className="inline-flex items-center border border-sand bg-paper rounded [border-radius:2px]">
                    <button
                      type="button"
                      id="qty-minus-btn"
                      onClick={handleDecrement}
                      disabled={quantity <= 1}
                      aria-label="Diminuer la quantité"
                      className="p-2.5 text-charcoal hover:bg-sand/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span
                      id="quantity-selector"
                      className="w-12 text-center font-mono font-bold text-base text-charcoal select-none"
                    >
                      {quantity}
                    </span>
                    <button
                      type="button"
                      id="qty-plus-btn"
                      onClick={handleIncrement}
                      disabled={quantity >= product.stock}
                      aria-label="Augmenter la quantité"
                      className="p-2.5 text-charcoal hover:bg-sand/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Réassurance COD */}
              <div className="space-y-2.5 bg-sand/15 border border-sand rounded [border-radius:4px] p-3.5 mb-6">
                <div className="flex items-center gap-2.5 text-xs text-charcoal/80">
                  <Truck className="w-4 h-4 text-primary shrink-0" />
                  <span>Livraison rapide à domicile ou au bureau</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-charcoal/80">
                  <ShieldCheck className="w-4 h-4 text-success shrink-0" />
                  <span>Vérifiez votre colis avant de régler le livreur</span>
                </div>
              </div>
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:block pt-2">
              {isOutOfStock ? (
                <button
                  type="button"
                  disabled
                  id="detail-cta-disabled-desktop"
                  className="w-full py-3.5 px-6 bg-sand/40 text-charcoal/50 font-bold text-sm uppercase rounded [border-radius:2px] cursor-not-allowed font-mono text-center"
                >
                  Produit épuisé
                </button>
              ) : (
                <button
                  type="button"
                  id="detail-cta-add-desktop"
                  onClick={handleAddToCart}
                  className="w-full py-3.5 px-6 bg-accent text-charcoal font-bold text-base rounded [border-radius:2px] inline-flex items-center justify-center gap-2 hover:brightness-95 active:scale-[0.99] transition-all cursor-pointer shadow-sm"
                >
                  {isAdded ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Ajouté au panier !</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" />
                      <span>Ajouter au panier ({ (product.price * quantity).toLocaleString("fr-FR") } FCFA)</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Sticky CTA Mobile en bas */}
      <div
        id="sticky-mobile-cta"
        className="md:hidden fixed bottom-0 left-0 right-0 p-3 bg-paper/95 border-t border-sand backdrop-blur-sm z-30 flex items-center gap-3 shadow-lg"
      >
        <div className="flex-1">
          <span className="font-mono text-xs text-charcoal/60 block">Total</span>
          <p className="font-mono font-bold text-primary text-base">
            {(product.price * quantity).toLocaleString("fr-FR")} FCFA
          </p>
        </div>

        <div className="flex-[2]">
          {isOutOfStock ? (
            <button
              type="button"
              disabled
              id="sticky-mobile-cta-disabled"
              className="w-full py-3 px-4 bg-sand/40 text-charcoal/50 font-bold text-xs uppercase rounded [border-radius:2px] cursor-not-allowed font-mono text-center"
            >
              Produit épuisé
            </button>
          ) : (
            <button
              type="button"
              id="sticky-mobile-cta-add"
              onClick={handleAddToCart}
              className="w-full py-3 px-4 bg-accent text-charcoal font-bold text-sm rounded [border-radius:2px] inline-flex items-center justify-center gap-1.5 hover:brightness-95 active:scale-[0.98] transition-all cursor-pointer"
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Ajouté !</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Ajouter au panier</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
