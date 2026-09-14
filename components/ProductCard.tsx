import type { ReactElement } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Check } from "lucide-react";
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
    ? "ÉPUISÉ"
    : isLowStock
    ? "DERNIÈRES PIÈCES"
    : "EN STOCK";

  const stockBadgeColor = isOutOfStock
    ? "text-danger border-danger/60 bg-paper"
    : isLowStock
    ? "text-accent border-accent/80 bg-paper"
    : "text-success border-success/60 bg-paper";

  const mainImage = product.images[0] || "https://picsum.photos/seed/placeholder/600/600";

  return (
    <article
      id={`product-card-${product.id}`}
      className={`group relative bg-paper border border-sand rounded [border-radius:4px] overflow-hidden flex flex-col transition-all duration-150 hover:border-primary/40 ${className ?? ""}`}
    >
      {/* Coin perforé façon ticket détaché */}
      <div
        className="absolute -top-3 left-4 w-6 h-6 rounded-full bg-paper border-b border-sand z-10 pointer-events-none"
        aria-hidden="true"
      />

      {/* Badge stock façon tampon */}
      <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
        <span
          className={`inline-block font-mono text-[10px] sm:text-xs font-semibold px-2 py-0.5 border rounded [border-radius:2px] uppercase tracking-wider transform -rotate-2 ${stockBadgeColor}`}
        >
          {stockBadgeText}
        </span>
      </div>

      {/* Image Produit */}
      <Link
        href={`/products/${product.id}`}
        id={`product-card-link-img-${product.id}`}
        className="relative aspect-square w-full bg-sand/20 overflow-hidden block"
      >
        <Image
          src={mainImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className={`object-cover transition-transform duration-200 group-hover:scale-[1.02] ${isOutOfStock ? "grayscale opacity-75" : ""}`}
          referrerPolicy="no-referrer"
        />
      </Link>

      {/* Bordure pointillée séparant l'image du bloc infos */}
      <div className="border-t border-dashed border-sand w-full" />

      {/* Bloc Infos Ticket */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          <Link
            href={`/products/${product.id}`}
            id={`product-card-link-title-${product.id}`}
            className="block"
          >
            <h3 className="font-display font-semibold text-charcoal text-sm sm:text-base line-clamp-2 hover:text-primary transition-colors leading-snug">
              {product.name}
            </h3>
          </Link>
          <p className="font-mono text-primary font-bold text-sm sm:text-base mt-1.5">
            {product.price.toLocaleString("fr-FR")} FCFA
          </p>
        </div>

        {/* Action rapide */}
        <div className="mt-3 pt-2">
          {isOutOfStock ? (
            <button
              type="button"
              disabled
              id={`product-card-btn-disabled-${product.id}`}
              className="w-full py-2 px-2 bg-sand/30 text-charcoal/50 font-medium text-xs rounded [border-radius:2px] cursor-not-allowed uppercase font-mono text-center"
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
              className="w-full py-2 px-3 bg-accent text-charcoal font-semibold text-xs sm:text-sm rounded [border-radius:2px] inline-flex items-center justify-center gap-1.5 hover:brightness-95 active:scale-[0.98] transition-all cursor-pointer"
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Ajouté !</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter</span>
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
