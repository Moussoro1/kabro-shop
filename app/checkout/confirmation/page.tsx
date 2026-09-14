"use client";

import { useEffect, useState, Suspense, type ReactElement } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MessageCircle, CheckCircle2, ShoppingBag, ArrowRight, Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { OrderTicket } from "@/components/OrderTicket";
import { getOrderById } from "@/lib/orders";
import { buildWhatsAppOrderLink, formatShortOrderId } from "@/lib/whatsapp";
import type { Order } from "@/types";

function ConfirmationContent(): ReactElement {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadOrder(): Promise<void> {
      if (!orderId) {
        // Tentative de récupération depuis sessionStorage
        if (typeof window !== "undefined") {
          const raw = sessionStorage.getItem("last_created_order");
          if (raw) {
            try {
              const parsed: unknown = JSON.parse(raw);
              if (
                typeof parsed === "object" &&
                parsed !== null &&
                "id" in parsed &&
                isMounted
              ) {
                setOrder(parsed as Order);
                setLoading(false);
                return;
              }
            } catch {
              // ignorer
            }
          }
        }
        if (isMounted) setLoading(false);
        return;
      }

      // Récupération par ID
      try {
        const fetched = await getOrderById(orderId);
        if (isMounted) {
          if (fetched) {
            setOrder(fetched);
          } else if (typeof window !== "undefined") {
            const raw = sessionStorage.getItem("last_created_order");
            if (raw) {
              const parsed: unknown = JSON.parse(raw);
              if (typeof parsed === "object" && parsed !== null) {
                setOrder(parsed as Order);
              }
            }
          }
        }
      } catch {
        // En cas d'erreur de requête
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadOrder();

    return (): void => {
      isMounted = false;
    };
  }, [orderId]);

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="flex items-center gap-2 font-mono text-sm text-charcoal/70">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span>Chargement de votre confirmation...</span>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="flex-1 max-w-md mx-auto px-4 py-12 text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded [border-radius:4px] bg-sand/30 border border-sand flex items-center justify-center mb-4 text-charcoal">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <h1 className="font-display text-xl font-bold text-charcoal mb-2">
          Aucune commande trouvée
        </h1>
        <p className="text-xs sm:text-sm text-charcoal/70 mb-6 font-body">
          La commande demandée est introuvable ou a expiré. Vous pouvez retourner à la boutique pour découvrir nos articles.
        </p>
        <Link
          href="/products"
          id="confirmation-back-to-shop"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-charcoal font-bold text-sm rounded [border-radius:2px] hover:brightness-95 transition-all"
        >
          <span>Voir la boutique</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </main>
    );
  }

  const whatsappUrl = buildWhatsAppOrderLink(order);
  const shortId = formatShortOrderId(order.id);

  return (
    <main id="confirmation-main" className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 md:py-10 pb-28 sm:pb-12">
      {/* En-tête de validation */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success/15 text-success border border-success/30 mb-3">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <span className="font-mono text-xs uppercase tracking-wider text-success font-semibold block mb-1">
          Commande enregistrée
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
          Votre commande {shortId} est prête !
        </h1>
        <p className="text-xs sm:text-sm text-charcoal/80 font-body max-w-lg mx-auto mt-2">
          Envoyez le message WhatsApp pré-rempli pour confirmer votre commande. Nous vous recontactons pour organiser la livraison.
        </p>
      </div>

      {/* Ticket récapitulatif */}
      <div className="mb-6">
        <OrderTicket order={order} showCustomerInfo={true} />
      </div>

      {/* Explication de la suite des étapes */}
      <div className="bg-sand/20 border border-sand rounded [border-radius:4px] p-4 sm:p-5 mb-8 space-y-3">
        <h2 className="font-display font-bold text-sm text-charcoal">
          Comment finaliser votre commande ?
        </h2>
        <ol className="text-xs sm:text-sm text-charcoal/80 font-body space-y-2 list-decimal list-inside pl-1">
          <li>
            Cliquez sur le bouton vert ci-dessous <span className="font-semibold text-charcoal">« Confirmer via WhatsApp »</span>.
          </li>
          <li>
            Votre application WhatsApp s&apos;ouvre avec le récapitulatif complet de vos articles et de votre adresse.
          </li>
          <li>
            Appuyez sur envoyer : notre équipe valide immédiatement le créneau de livraison avec vous.
          </li>
          <li>
            Vous payez <span className="font-mono font-bold text-charcoal">{order.total.toLocaleString("fr-FR")} FCFA</span> en espèces directement au livreur.
          </li>
        </ol>
      </div>

      {/* Bouton principal WhatsApp (Desktop & vue normale) */}
      <div className="space-y-3">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          id="confirmation-whatsapp-main-btn"
          className="w-full py-4 px-6 bg-whatsapp text-white font-bold text-base rounded [border-radius:2px] inline-flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.99] transition-all shadow-sm cursor-pointer"
        >
          <MessageCircle className="w-5 h-5 fill-current" />
          <span>Confirmer via WhatsApp</span>
        </a>

        <div className="text-center pt-2">
          <Link
            href="/products"
            id="confirmation-continue-shopping"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-charcoal/70 hover:text-primary transition-colors"
          >
            <span>Continuer mes achats</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Barre Sticky WhatsApp Mobile (Toujours visible sans scroll sur mobile) */}
      <div
        id="confirmation-sticky-bar"
        className="fixed bottom-0 left-0 right-0 z-40 bg-paper/95 backdrop-blur-sm border-t border-sand p-3 sm:hidden shadow-lg"
      >
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          id="confirmation-whatsapp-sticky-btn"
          className="w-full py-3 px-4 bg-whatsapp text-white font-bold text-sm rounded [border-radius:2px] inline-flex items-center justify-center gap-2 shadow cursor-pointer active:scale-[0.99]"
        >
          <MessageCircle className="w-4 h-4 fill-current" />
          <span>Confirmer via WhatsApp ({order.total.toLocaleString("fr-FR")} FCFA)</span>
        </a>
      </div>
    </main>
  );
}

export default function ConfirmationPage(): ReactElement {
  return (
    <div id="confirmation-page-container" className="min-h-screen bg-paper text-charcoal flex flex-col">
      <Header />
      <Suspense
        fallback={
          <main className="flex-1 flex items-center justify-center p-6">
            <div className="flex items-center gap-2 font-mono text-sm text-charcoal/70">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span>Chargement...</span>
            </div>
          </main>
        }
      >
        <ConfirmationContent />
      </Suspense>
    </div>
  );
}
