import type { ReactElement } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Truck, ShieldCheck } from "lucide-react";

export interface CartSummaryCardProps {
  totalAmount: number;
  totalItems: number;
  className?: string;
}

export function CartSummaryCard({
  totalAmount,
  totalItems,
  className,
}: CartSummaryCardProps): ReactElement {
  const formattedTotal = totalAmount.toLocaleString("fr-FR");
  const itemsLabel = totalItems > 1 ? "articles" : "article";

  return (
    <section
      id="cart-summary-card"
      className={`bg-paper border border-sand rounded [border-radius:4px] p-5 sm:p-6 sticky top-20 shadow-2xs ${className ?? ""}`}
      aria-labelledby="cart-summary-heading"
    >
      <h2
        id="cart-summary-heading"
        className="font-display font-extrabold text-lg sm:text-xl text-charcoal border-b border-sand pb-3 mb-4"
      >
        Récapitulatif de la commande
      </h2>

      {/* Détails du calcul */}
      <dl className="space-y-3 mb-5 text-sm">
        <div className="flex justify-between items-center text-charcoal/85">
          <dt>Total des articles ({totalItems} {itemsLabel})</dt>
          <dd className="font-mono font-bold text-charcoal">
            {formattedTotal} FCFA
          </dd>
        </div>

        <div className="flex justify-between items-start text-charcoal/85">
          <dt>Mode de règlement</dt>
          <dd className="font-mono font-medium text-primary text-right">
            Espèces à la livraison
          </dd>
        </div>

        <div className="flex justify-between items-start text-charcoal/85 pt-1 border-t border-dashed border-sand/70">
          <dt className="pr-2">Frais d&apos;expédition</dt>
          <dd className="font-mono text-xs text-charcoal/70 text-right">
            Confirmés à l&apos;adresse
          </dd>
        </div>
      </dl>

      {/* Bloc Total Général mis en valeur */}
      <div className="border-t-2 border-b border-sand py-4 mb-6 bg-sand/15 -mx-5 sm:-mx-6 px-5 sm:px-6">
        <div className="flex justify-between items-baseline gap-2">
          <div>
            <span className="font-display font-black text-base sm:text-lg text-charcoal block">
              Total à payer
            </span>
            <span className="text-[11px] text-charcoal/70 font-sans">
              À régler lors de la livraison
            </span>
          </div>
          <div className="text-right">
            <span
              id="cart-summary-total-price"
              className="font-mono text-2xl sm:text-3xl font-black text-primary tracking-tight block"
            >
              {formattedTotal}{" "}
              <span className="text-base sm:text-lg font-bold">FCFA</span>
            </span>
          </div>
        </div>
      </div>

      {/* Actions de commande et navigation */}
      <div className="space-y-3">
        {/* Bouton Principal de Commande (CTA) */}
        <Link
          href="/checkout"
          id="cart-proceed-to-checkout"
          aria-label={`Passer la commande d'un montant de ${formattedTotal} FCFA`}
          className="w-full min-h-[48px] h-12 px-5 bg-accent text-charcoal font-display font-black text-base rounded [border-radius:3px] inline-flex items-center justify-center gap-2 hover:brightness-95 active:scale-[0.99] transition-all shadow-xs cursor-pointer focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        >
          <span>Passer la commande</span>
          <ArrowRight className="w-5 h-5" aria-hidden="true" />
        </Link>

        {/* Bouton Secondaire Continuer les Achats */}
        <Link
          href="/products"
          id="cart-summary-continue-shopping"
          aria-label="Continuer mes achats et retourner au catalogue"
          className="w-full min-h-[44px] py-2.5 px-4 border border-sand bg-paper hover:bg-sand/30 active:bg-sand/50 text-charcoal font-semibold text-xs sm:text-sm rounded [border-radius:3px] inline-flex items-center justify-center gap-2 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-1"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Continuer mes achats</span>
        </Link>
      </div>

      {/* Éléments de Réassurance Réels */}
      <div className="mt-6 pt-4 border-t border-sand space-y-2.5">
        <div className="flex items-start gap-2.5 text-xs text-charcoal/80">
          <Truck className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
          <span>Livraison directe à domicile ou au bureau dans tout N&apos;Djamena</span>
        </div>
        <div className="flex items-start gap-2.5 text-xs text-charcoal/80">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
          <span>Règlement en espèces en toute sécurité à la réception de votre colis</span>
        </div>
      </div>
    </section>
  );
}

export default CartSummaryCard;
