import type { Order } from "@/types";

export function formatShortOrderId(orderId: string): string {
  if (!orderId) return "CMD-000";
  if (orderId.startsWith("CMD-")) return orderId;
  return `CMD-${orderId.slice(0, 6).toUpperCase()}`;
}

export function buildWhatsAppOrderLink(
  order: Order,
  whatsappNumber?: string
): string {
  const defaultNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "221770000000";
  const targetNumber = (whatsappNumber || defaultNumber).replace(/[^0-9]/g, "");

  const shortId = formatShortOrderId(order.id);

  const itemsLines = order.items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.name}* (x${item.quantity}) — ${(item.price * item.quantity).toLocaleString("fr-FR")} FCFA`
    )
    .join("\n");

  const message = [
    `🛍️ *NOUVELLE COMMANDE — ${shortId}*`,
    `--------------------------------`,
    `👤 *Client :* ${order.customer.name}`,
    `📞 *Téléphone :* ${order.customer.phone}`,
    `📍 *Adresse :* ${order.customer.address}, ${order.customer.city}`,
    `--------------------------------`,
    `📦 *ARTICLES COMMANDÉS :*`,
    itemsLines,
    `--------------------------------`,
    `💰 *TOTAL À PAYER À LA LIVRAISON :* *${order.total.toLocaleString("fr-FR")} FCFA*`,
    `💳 *Mode :* Espèces à la réception (COD)`,
    `--------------------------------`,
    `Bonjour, je confirme ma commande ci-dessus et je souhaite organiser la livraison. Merci !`,
  ].join("\n");

  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${targetNumber}?text=${encodedText}`;
}
