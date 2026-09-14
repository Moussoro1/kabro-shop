"use client";

import { useState, useEffect, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Truck, ShieldCheck, Loader2, ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { useCart } from "@/context/CartContext";
import { checkoutSchema, type CheckoutFormValues } from "@/lib/validation/checkout";
import { createOrder } from "@/lib/orders";
import type { Order } from "@/types";
import { OrderTicket } from "@/components/OrderTicket";

export default function CheckoutPage(): ReactElement {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      city: "",
    },
  });

  // Redirection si le panier est vide
  useEffect(() => {
    if (items.length === 0 && !isSubmitting) {
      router.replace("/products");
    }
  }, [items, isSubmitting, router]);

  const previewOrder: Order = {
    id: "PREVIEW",
    items: items.map((item) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
    customer: {
      name: "",
      phone: "",
      address: "",
      city: "",
    },
    total,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  const onSubmit = async (values: CheckoutFormValues): Promise<void> => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const createdOrder = await createOrder(items, values);

      // Vider le panier UNIQUEMENT après succès de la création
      clearCart();

      // Sauvegarde de secours pour la page de confirmation locale
      if (typeof window !== "undefined") {
        sessionStorage.setItem("last_created_order", JSON.stringify(createdOrder));
      }

      router.push(`/checkout/confirmation?orderId=${encodeURIComponent(createdOrder.id)}`);
    } catch (error: unknown) {
      setIsSubmitting(false);
      const message =
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de l'enregistrement de votre commande.";
      setSubmitError(message);
    }
  };

  if (items.length === 0) {
    return (
      <div id="checkout-loading" className="min-h-screen bg-paper text-charcoal flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="flex items-center gap-2 font-mono text-sm text-charcoal/70">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span>Redirection vers la boutique...</span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div id="checkout-page-container" className="min-h-screen bg-paper text-charcoal flex flex-col">
      <Header />

      <main id="checkout-main" className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 md:py-10">
        {/* Fil d'ariane */}
        <div className="mb-6">
          <Link
            href="/cart"
            id="checkout-back-link"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-charcoal/80 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour au panier</span>
          </Link>
        </div>

        <div className="mb-6 border-b border-sand pb-4">
          <span className="font-mono text-xs uppercase tracking-wider text-charcoal/60 block mb-1">
            Étape finale
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
            Bon de Commande & Livraison
          </h1>
          <p className="text-xs sm:text-sm text-charcoal/70 font-body mt-1">
            Renseignez vos coordonnées de livraison. Aucun paiement en ligne n&apos;est demandé.
          </p>
        </div>

        {submitError && (
          <div
            id="checkout-error-banner"
            className="mb-6 p-4 bg-danger/10 border border-danger text-danger rounded [border-radius:4px] text-xs sm:text-sm font-body"
          >
            <p className="font-semibold mb-1">Impossible de valider la commande</p>
            <p>{submitError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Formulaire "Bon de commande" */}
          <div className="lg:col-span-7">
            <form
              id="checkout-form"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="bg-paper border border-sand rounded [border-radius:4px] p-5 sm:p-6 space-y-5"
            >
              <div className="border-b border-dashed border-sand pb-3">
                <h2 className="font-display font-bold text-base sm:text-lg text-charcoal">
                  Coordonnées du destinataire
                </h2>
                <p className="text-xs text-charcoal/60">
                  Ces informations permettront au livreur de vous contacter à l&apos;arrivée.
                </p>
              </div>

              {/* Champ Nom */}
              <div>
                <label
                  htmlFor="customer-name-input"
                  className="block font-mono text-xs uppercase font-medium text-charcoal mb-1.5"
                >
                  Nom complet <span className="text-danger">*</span>
                </label>
                <input
                  id="customer-name-input"
                  type="text"
                  placeholder="Ex: Awa Diop"
                  {...register("name")}
                  className={`w-full px-3.5 py-2.5 bg-paper border rounded [border-radius:2px] text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-primary transition-colors ${
                    errors.name ? "border-danger" : "border-sand"
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-danger font-medium">{errors.name.message}</p>
                )}
              </div>

              {/* Champ Téléphone */}
              <div>
                <label
                  htmlFor="customer-phone-input"
                  className="block font-mono text-xs uppercase font-medium text-charcoal mb-1.5"
                >
                  Numéro de téléphone (Appel & WhatsApp) <span className="text-danger">*</span>
                </label>
                <input
                  id="customer-phone-input"
                  type="tel"
                  placeholder="Ex: 77 123 45 67"
                  {...register("phone")}
                  className={`w-full px-3.5 py-2.5 bg-paper border rounded [border-radius:2px] text-sm text-charcoal placeholder:text-charcoal/40 font-mono focus:outline-none focus:border-primary transition-colors ${
                    errors.phone ? "border-danger" : "border-sand"
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-danger font-medium">{errors.phone.message}</p>
                )}
              </div>

              {/* Champ Ville / Quartier */}
              <div>
                <label
                  htmlFor="customer-city-input"
                  className="block font-mono text-xs uppercase font-medium text-charcoal mb-1.5"
                >
                  Ville / Commune <span className="text-danger">*</span>
                </label>
                <input
                  id="customer-city-input"
                  type="text"
                  placeholder="Ex: Dakar, Cocody, Bamako..."
                  {...register("city")}
                  className={`w-full px-3.5 py-2.5 bg-paper border rounded [border-radius:2px] text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-primary transition-colors ${
                    errors.city ? "border-danger" : "border-sand"
                  }`}
                />
                {errors.city && (
                  <p className="mt-1 text-xs text-danger font-medium">{errors.city.message}</p>
                )}
              </div>

              {/* Champ Adresse / Repère */}
              <div>
                <label
                  htmlFor="customer-address-input"
                  className="block font-mono text-xs uppercase font-medium text-charcoal mb-1.5"
                >
                  Adresse précise & repères <span className="text-danger">*</span>
                </label>
                <textarea
                  id="customer-address-input"
                  rows={3}
                  placeholder="Ex: Mermoz, Rue MZ-45, près de la pharmacie du rond-point"
                  {...register("address")}
                  className={`w-full px-3.5 py-2.5 bg-paper border rounded [border-radius:2px] text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-primary transition-colors resize-none ${
                    errors.address ? "border-danger" : "border-sand"
                  }`}
                />
                {errors.address && (
                  <p className="mt-1 text-xs text-danger font-medium">{errors.address.message}</p>
                )}
              </div>

              {/* Mode de règlement */}
              <div className="bg-sand/20 border border-sand rounded [border-radius:2px] p-3.5 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-success inline-block" />
                  <span className="font-display font-semibold text-xs text-charcoal">
                    Paiement à la livraison (Espèces)
                  </span>
                </div>
                <p className="text-xs text-charcoal/70 pl-4.5 font-body">
                  Vous remettrez le montant exact de {total.toLocaleString("fr-FR")} FCFA au livreur après avoir vérifié le colis.
                </p>
              </div>

              {/* Bouton de soumission */}
              <button
                type="submit"
                disabled={isSubmitting}
                id="checkout-submit-btn"
                className="w-full py-4 px-6 bg-accent text-charcoal font-bold text-base rounded [border-radius:2px] inline-flex items-center justify-center gap-2 hover:brightness-95 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Création de la commande...</span>
                  </>
                ) : (
                  <>
                    <span>Valider ma commande</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Ticket Récapitulatif Panier au-dessus / à droite */}
          <div className="lg:col-span-5 space-y-4">
            <OrderTicket order={previewOrder} showCustomerInfo={false} />

            {/* Réassurance */}
            <div className="bg-sand/15 border border-sand rounded [border-radius:4px] p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Truck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-display font-semibold text-xs text-charcoal">Livraison soignée</h3>
                  <p className="text-xs text-charcoal/70 mt-0.5">Le livreur vous appelle avant d&apos;arriver à l&apos;adresse indiquée.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-success shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-display font-semibold text-xs text-charcoal">Contrôle à l&apos;ouverture</h3>
                  <p className="text-xs text-charcoal/70 mt-0.5">Vérifiez vos articles avant tout paiement.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
