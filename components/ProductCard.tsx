import type { ReactElement } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, ShoppingBag } from "lucide-react";
import type { Product } from "@/types";

export interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  isAdded?: boolean;
  className?: string;
}

export function ProductCard({
  product,
  onAddToCart,
  isAdded = false,
  className,
}: ProductCardProps): ReactElement {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;

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

  const mainImage = product.images[0] || "https://picsum.photos/seed/placeholder/600/600";

  return (
    <article
      id={`product-card-${product.id}`}
      className={`group relative bg-paper border border-sand/80 rounded-xl overflow-hidden shadow-xs hover:shadow-md hover:border-primary/40 transition-all duration-200 flex flex-col justify-between ${className ?? ""}`}
    >
      <div className="relative">
        <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
          <span
            className={`inline-flex items-center gap-1 font-mono text-[10px] sm:text-xs font-semibold px-2 py-0.5 border rounded-full backdrop-blur-xs shadow-xs ${stockBadgeClass}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isOutOfStock
                  ? "bg-danger"
                  : isLowStock
                  ? "bg-amber-600 animate-pulse"
                  : "bg-emerald-600"
              }`}
            />
            {stockBadgeText}
          </span>
        </div>

        <Link
          href={`/products/${product.id}`}
          id={`product-card-link-img-${product.id}`}
          className="relative aspect-square w-full bg-sand/15 overflow-hidden block"
          aria-label={`Voir la fiche détaillée de ${product.name}`}
        >
          <Image
            src={mainImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
              isOutOfStock ? "grayscale opacity-75" : ""
            }`}
            referrerPolicy="no-referrer"
          />
        </Link>
      </div>

      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-1.5">
          <Link
            href={`/products/${product.id}`}
            id={`product-card-link-title-${product.id}`}
            className="block group-hover:text-primary transition-colors"
          >
            <h3 className="font-display font-bold text-charcoal text-xs sm:text-sm md:text-base line-clamp-2 leading-snug min-h-[2rem] sm:min-h-[2.5rem]">
              {product.name}
            </h3>
          </Link>

          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="font-mono text-primary font-black text-sm sm:text-base md:text-lg tracking-tight">
              {product.price.toLocaleString("fr-FR")}
            </span>
            <span className="text-[11px] sm:text-xs font-bold text-primary/80 uppercase">
              FCFA
            </span>
          </div>
        </div>

        <div className="pt-1">
          {isOutOfStock ? (
            <button
              type="button"
              disabled
              id={`product-card-btn-disabled-${product.id}`}
              className="w-full h-11 min-h-[44px] px-3 bg-sand/40 text-charcoal/50 font-semibold text-xs sm:text-sm rounded-lg cursor-not-allowed uppercase font-mono text-center flex items-center justify-center border border-sand"
            >
              Épuisé
            </button>
          ) : (
            <button
              type="button"
              id={`product-card-add-btn-${product.id}`}
              onClick={(): void => {
                if (onAddToCart) {
                  onAddToCart(product);
                }
              }}
              className={`w-full h-11 min-h-[44px] px-3 font-bold text-xs sm:text-sm rounded-lg inline-flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer shadow-xs active:scale-[0.98] ${
                isAdded
                  ? "bg-success text-paper hover:bg-success/90"
                  : "bg-accent text-charcoal hover:bg-accent/90"
              }`}
              aria-label={
                isAdded
                  ? `${product.name} ajouté au panier`
                  : `Ajouter ${product.name} au panier`
              }
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
    </article>
  );
}

export default ProductCard;
