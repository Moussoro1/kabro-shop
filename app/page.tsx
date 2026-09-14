"use client";

import { useState, useEffect, type ReactElement } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Truck, MessageCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { getProducts, INITIAL_PRODUCTS } from "@/lib/products";
import type { Product } from "@/types";

export default function HomePage(): ReactElement {
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  useEffect(() => {
    async function loadFeatured(): Promise<void> {
      try {
        const loaded = await getProducts();
        if (loaded.length > 0) {
          setProducts(loaded);
        }
      } catch {
        // Fallback
      }
    }
    loadFeatured();
  }, []);

  const featuredProducts = products.slice(0, 4);

  const handleAddToCart = (product: Product): void => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0] || "https://picsum.photos/seed/placeholder/600/600",
    });
    setAddedProductId(product.id);
    setTimeout((): void => {
      setAddedProductId((curr) => (curr === product.id ? null : curr));
    }, 1500);
  };

  return (
    <div id="home-page-container" className="min-h-screen bg-paper text-charcoal flex flex-col">
      <Header />

      <main id="home-main" className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 md:py-12 flex flex-col gap-12">
        {/* Hero Section */}
        <section id="hero-section" className="text-center max-w-3xl mx-auto pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sand/30 border border-sand rounded [border-radius:2px] mb-4">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span className="font-mono text-xs uppercase tracking-wider text-charcoal font-medium">
              Paiement à la livraison & Confirmation WhatsApp
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-extrabold text-charcoal tracking-tight leading-[1.1] mb-5">
            Le meilleur de l&apos;artisanat & de la mode, chez vous en toute confiance.
          </h1>

          <p className="text-base sm:text-lg text-charcoal/80 max-w-2xl mx-auto mb-8 font-body leading-relaxed">
            Commandez en 2 clics sans carte bancaire. Payez uniquement en espèces à la livraison après inspection de votre commande.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              href="/products"
              id="hero-cta-boutique"
              className="w-full sm:w-auto px-8 py-3.5 bg-accent text-charcoal font-bold text-base rounded [border-radius:2px] inline-flex items-center justify-center gap-2 hover:brightness-95 active:scale-[0.99] transition-all shadow-sm cursor-pointer"
            >
              <span>Voir la boutique</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* 3 Engagements simples */}
        <section id="features-banner" className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-b border-dashed border-sand py-6">
          <div className="flex items-start gap-3 p-2">
            <Truck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h2 className="font-display font-bold text-sm text-charcoal">Livraison directe</h2>
              <p className="text-xs text-charcoal/70 mt-0.5">Expédition rapide à domicile ou sur votre lieu de travail.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-2">
            <ShieldCheck className="w-5 h-5 text-success shrink-0 mt-0.5" />
            <div>
              <h2 className="font-display font-bold text-sm text-charcoal">Paiement à la réception</h2>
              <p className="text-xs text-charcoal/70 mt-0.5">Réglez en espèces uniquement quand le colis est entre vos mains.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-2">
            <MessageCircle className="w-5 h-5 text-whatsapp shrink-0 mt-0.5" />
            <div>
              <h2 className="font-display font-bold text-sm text-charcoal">Suivi WhatsApp</h2>
              <p className="text-xs text-charcoal/70 mt-0.5">Notification instantanée et assistance directe sur WhatsApp.</p>
            </div>
          </div>
        </section>

        {/* Produits en vedette */}
        <section id="featured-products-section">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-charcoal/60">
                Sélection du jour
              </span>
              <h2 className="font-display text-2xl font-bold text-charcoal">
                Articles Populaires
              </h2>
            </div>
            <Link
              href="/products"
              id="view-all-products-link"
              className="text-xs sm:text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              <span>Tout voir</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isAdded={addedProductId === product.id}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
