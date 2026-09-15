"use client";

import { type ReactElement, useState } from "react";
import Image from "next/image";
import { Trash2, Plus, Minus } from "lucide-react";
import type { CartItem } from "@/context/CartContext";

export interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
}

const FALLBACK_IMAGE = "https://picsum.photos/seed/placeholder/600/600";

export function CartItemRow({
  item,
  onUpdateQuantity,
  onRemoveItem,
}: CartItemRowProps): ReactElement {
  const [imageError, setImageError] = useState<boolean>(false);
  const isMinQuantity = item.quantity <= 1;
  const itemTotal = item.price * item.quantity;
  const imageSource = imageError || !item.image ? FALLBACK_IMAGE : item.image;

  const handleDecrement = (): void => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.productId, item.quantity - 1);
    }
  };

  const handleIncrement = (): void => {
    onUpdateQuantity(item.productId, item.quantity + 1);
  };

  const handleRemove = (): void => {
    onRemoveItem(item.productId);
  };

  return (
    <article
      id={`cart-item-row-${item.productId}`}
      className="py-4 sm:py-5 border-b border-sand/80 last:border-b-0"
      aria-labelledby={`cart-item-title-${item.productId}`}
    >
      <div className="flex flex-col xs:flex-row gap-3 sm:gap-4">
        {/* Vignette Produit avec ratio stable */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-sand/20 border border-sand/70 rounded-md overflow-hidden self-start">
          <Image
            src={imageSource}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 80px, 96px"
            className="object-cover"
            onError={(): void => setImageError(true)}
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Détails du produit, prix et contrôles */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          {/* Titre et Prix Unitaire */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-3">
            <div className="min-w-0 flex-1">
              <h3
                id={`cart-item-title-${item.productId}`}
                className="font-display font-bold text-charcoal text-sm sm:text-base leading-snug line-clamp-2 break-words"
                title={item.name}
              >
                {item.name}
              </h3>
              <p className="font-mono text-xs text-charcoal/70 mt-0.5">
                Prix unitaire :{" "}
                <span className="font-semibold text-charcoal">
                  {item.price.toLocaleString("fr-FR")} FCFA
                </span>
              </p>
            </div>

            {/* Sous-total affiché au niveau supérieur sur desktop */}
            <div className="hidden sm:block text-right shrink-0">
              <span className="text-[11px] uppercase tracking-wider text-charcoal/60 font-mono block">
                Sous-total
              </span>
              <span className="font-mono text-base font-extrabold text-primary block">
                {itemTotal.toLocaleString("fr-FR")}{" "}
                <span className="text-xs font-semibold">FCFA</span>
              </span>
            </div>
          </div>

          {/* Ligne des contrôles tactiles et suppression */}
          <div className="mt-3 sm:mt-2.5 pt-2 flex items-center justify-between gap-3 flex-wrap">
            {/* Contrôles de quantité (Boutons min 44x44px) */}
            <div className="flex items-center gap-1.5">
              <span className="sr-only">Quantité pour {item.name}</span>
              <div
                className="inline-flex items-center border border-sand bg-paper rounded-md shadow-2xs"
                role="group"
                aria-label={`Ajuster la quantité de ${item.name}`}
              >
                <button
                  type="button"
                  id={`cart-decrement-btn-${item.productId}`}
                  onClick={handleDecrement}
                  disabled={isMinQuantity}
                  aria-disabled={isMinQuantity}
                  aria-label={`Diminuer la quantité de ${item.name}`}
                  className="min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center text-charcoal hover:bg-sand/30 active:bg-sand/50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-1 cursor-pointer"
                >
                  <Minus className="w-4 h-4" aria-hidden="true" />
                </button>
                <span
                  id={`cart-item-qty-${item.productId}`}
                  className="w-9 sm:w-10 text-center font-mono text-sm sm:text-base font-bold text-charcoal select-none"
                  aria-live="polite"
                  aria-atomic="true"
                  aria-label={`Quantité actuelle : ${item.quantity}`}
                >
                  {item.quantity}
                </span>
                <button
                  type="button"
                  id={`cart-increment-btn-${item.productId}`}
                  onClick={handleIncrement}
                  aria-label={`Augmenter la quantité de ${item.name}`}
                  className="min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center text-charcoal hover:bg-sand/30 active:bg-sand/50 transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              {/* Bouton supprimer séparé (min 44x44px) */}
              <button
                type="button"
                id={`cart-remove-btn-${item.productId}`}
                onClick={handleRemove}
                aria-label={`Supprimer ${item.name} du panier`}
                className="min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center text-charcoal/50 hover:text-danger active:text-danger/80 hover:bg-danger/10 rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-danger focus-visible:outline-offset-1 cursor-pointer ml-1"
                title={`Supprimer ${item.name}`}
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Sous-total affiché sur mobile */}
            <div className="sm:hidden text-right">
              <span className="text-[10px] uppercase tracking-wider text-charcoal/60 font-mono block">
                Sous-total
              </span>
              <span className="font-mono text-sm font-extrabold text-primary">
                {itemTotal.toLocaleString("fr-FR")} FCFA
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default CartItemRow;
