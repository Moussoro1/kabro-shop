import type { ReactElement } from "react";
import type { Order, OrderStatus } from "@/types";
import { formatShortOrderId } from "@/lib/whatsapp";

export interface OrderTicketProps {
  order: Order;
  showCustomerInfo?: boolean;
  className?: string;
}

function getStatusBadge(status: OrderStatus): { label: string; className: string } {
  switch (status) {
    case "pending":
      return {
        label: "En attente",
        className: "text-charcoal border-sand bg-sand/30",
      };
    case "confirmed":
      return {
        label: "Confirmée",
        className: "text-accent border-accent/70 bg-paper",
      };
    case "delivered":
      return {
        label: "Livrée",
        className: "text-success border-success/70 bg-paper",
      };
    case "cancelled":
      return {
        label: "Annulée",
        className: "text-danger border-danger/70 bg-paper",
      };
    default:
      return {
        label: "En attente",
        className: "text-charcoal border-sand bg-sand/30",
      };
  }
}

export function OrderTicket({
  order,
  showCustomerInfo = true,
  className,
}: OrderTicketProps): ReactElement {
  const statusInfo = getStatusBadge(order.status);
  const shortId = formatShortOrderId(order.id);

  return (
    <div
      id={`order-ticket-${order.id}`}
      className={`relative bg-paper border border-sand rounded [border-radius:4px] p-5 sm:p-6 overflow-hidden ${className ?? ""}`}
    >
      {/* Coin perforé ticket */}
      <div
        className="absolute -top-3 left-6 w-6 h-6 rounded-full bg-paper border-b border-sand z-10 pointer-events-none"
        aria-hidden="true"
      />

      {/* En-tête du ticket */}
      <div className="flex justify-between items-start border-b border-dashed border-sand pb-4 mb-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-charcoal/60 block">
            Ticket de Commande
          </span>
          <p className="font-mono font-bold text-primary text-base sm:text-lg">
            {shortId}
          </p>
        </div>
        <span
          className={`font-mono text-xs px-2.5 py-1 border rounded [border-radius:2px] uppercase font-semibold ${statusInfo.className}`}
        >
          {statusInfo.label}
        </span>
      </div>

      {/* Détails Client si demandé */}
      {showCustomerInfo && order.customer && order.customer.name && (
        <div className="border-b border-dashed border-sand pb-3 mb-4 text-xs font-body text-charcoal/80 space-y-1">
          <p><span className="font-semibold text-charcoal">Client :</span> {order.customer.name}</p>
          <p><span className="font-semibold text-charcoal">Téléphone :</span> <span className="font-mono">{order.customer.phone}</span></p>
          <p><span className="font-semibold text-charcoal">Livraison :</span> {order.customer.address}, {order.customer.city}</p>
        </div>
      )}

      {/* Liste des articles */}
      <div className="space-y-2.5 mb-4">
        <div className="flex justify-between text-xs font-mono uppercase text-charcoal/60 pb-1">
          <span>Article & Quantité</span>
          <span>Sous-total</span>
        </div>
        {order.items.map((item) => (
          <div
            key={item.productId}
            className="flex justify-between items-baseline font-mono text-xs sm:text-sm"
          >
            <span className="text-charcoal pr-2">
              {item.name} <span className="text-charcoal/60">× {item.quantity}</span>
            </span>
            <span className="font-medium text-charcoal whitespace-nowrap">
              {(item.price * item.quantity).toLocaleString("fr-FR")} FCFA
            </span>
          </div>
        ))}
      </div>

      {/* Ligne pointillée et Total */}
      <div className="border-t border-dashed border-sand pt-4 mt-2 flex justify-between items-baseline">
        <div>
          <span className="font-display font-bold text-sm sm:text-base text-charcoal block">
            Total à la livraison
          </span>
          <span className="text-[11px] text-charcoal/60 font-body">Paiement en espèces</span>
        </div>
        <span className="font-mono text-xl sm:text-2xl font-bold text-primary">
          {order.total.toLocaleString("fr-FR")} FCFA
        </span>
      </div>
    </div>
  );
}

export default OrderTicket;
