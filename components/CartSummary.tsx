import type { ReactElement } from "react";
import type { OrderItem } from "@/types";

export interface CartSummaryProps {
  items: OrderItem[];
  total: number;
  onCheckout?: () => void;
  className?: string;
}

export function CartSummary({
  items,
  total,
  className,
}: CartSummaryProps): ReactElement {
  return (
    <section
      id="cart-summary-section"
      className={`bg-paper border border-sand rounded [border-radius:4px] p-4 ${className ?? ""}`}
    >
      <h2 className="font-display text-xl font-bold text-charcoal mb-4">Récapitulatif</h2>
      <div className="space-y-2 mb-4">
        {items.map((item) => (
          <div key={item.productId} className="flex justify-between font-mono text-sm">
            <span>{item.name} × {item.quantity}</span>
            <span>{(item.price * item.quantity).toLocaleString("fr-FR")} FCFA</span>
          </div>
        ))}
      </div>
      <div className="border-t border-dashed border-sand pt-3 flex justify-between font-mono font-bold text-primary">
        <span>Total</span>
        <span>{total.toLocaleString("fr-FR")} FCFA</span>
      </div>
    </section>
  );
}

export default CartSummary;
