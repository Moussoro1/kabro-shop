"use client";

import { useState, useEffect, type ReactElement } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, MessageCircle, Shirt, Sparkles, Home, Utensils, ChevronRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { getProducts, INITIAL_PRODUCTS, INITIAL_CATEGORIES } from "@/lib/products";
import type { Product, Category } from "@/types";

export default function HomePage(): ReactElement {
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  useEffect(() => {
    async function loadFeatured(): Promise<void> {
      try {
        const loaded = await getProducts();
        if (loaded.length > 0) setProducts(loaded);
      } catch {
        // Fallback sur INITIAL_PRODUCTS
      }
    }
    loadFeatured();
  }, []);

  const featuredProducts = products.filter((p) => p.isActive).slice(0, 4);

  const handleAddToCart = (product: Product): void => {
    addItem({ productId: product.id, name: product.name, price: product.price, quantity: 1, image: product.images[0] || "https://picsum.photos/seed/placeholder/600/600" });
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId((curr) => (curr === product.id ? null : curr)), 1500);
  };

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case "mode-wax": return <Shirt className="w-5 h-5 text-primary" />;
      case "beaute-soins": return <Sparkles className="w-5 h-5 text-accent" />;
      case "maison-artisanat": return <Home className="w-5 h-5 text-primary" />;
      case "epices-terroir": return <Utensils className="w-5 h-5 text-accent" />;
      default: return <Sparkles className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div id="home-page-container" className="min-h-screen bg-paper text-charcoal flex flex-col">
      <Header />
      <main id="home-main" className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 py-6 sm:py-10 flex flex-col gap-8 sm:gap-12">
        <section id="hero-section" className="relative bg-gradient-to-b from-sand/30 to-sand/10 border border-sand/70 rounded-2xl p-5 sm:p-8 md:p-10 text-center flex flex-col items-center overflow-hidden shadow-xs">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-paper/90 border border-sand/80 rounded-full text-xs font-semibold text-charcoal shadow-2xs mb-3 sm:mb-4"><span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" /><span>Paiement à la livraison • WhatsApp instantané</span></div>
          <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-black text-charcoal tracking-tight leading-tight max-w-2xl mb-3">Le meilleur de la mode, des soins et du terroir africain</h1>
          <p className="text-xs sm:text-base text-charcoal/80 max-w-xl mx-auto mb-6 leading-relaxed">Commandez en toute sérénité sans carte bancaire. Vous réglez en espèces à la livraison uniquement après avoir vérifié vos articles.</p>
          <Link href="/products" id="hero-cta-boutique" className="w-full sm:w-auto h-12 min-h-[48px] px-8 bg-primary text-paper font-bold text-sm sm:text-base rounded-xl inline-flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.99] transition-all shadow-sm cursor-pointer"><span>Découvrir la boutique</span><ArrowRight className="w-4 h-4" /></Link>
        </section>

        <section id="categories-section" className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between"><div><h2 className="font-display text-lg sm:text-xl font-bold text-charcoal">Explorez par rayon</h2><p className="text-xs text-charcoal/60">Trouvez facilement vos produits préférés</p></div><Link href="/products" id="view-all-categories-link" className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"><span>Tout voir</span><ChevronRight className="w-3.5 h-3.5" /></Link></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
            {INITIAL_CATEGORIES.map((cat: Category) => <Link key={cat.id} href={`/products?category=${encodeURIComponent(cat.id)}`} id={`category-card-${cat.id}`} className="group p-3 sm:p-4 bg-paper border border-sand/80 rounded-xl hover:border-primary/50 hover:shadow-xs transition-all flex items-center gap-2.5 sm:gap-3"><div className="w-10 h-10 rounded-lg bg-sand/30 flex items-center justify-center shrink-0 group-hover:bg-sand/60 transition-colors">{getCategoryIcon(cat.slug)}</div><div className="min-w-0"><h3 className="font-display text-xs sm:text-sm font-bold text-charcoal truncate group-hover:text-primary transition-colors">{cat.name}</h3><span className="text-[10px] text-charcoal/50 font-mono flex items-center gap-0.5">Parcourir <ChevronRight className="w-2.5 h-2.5" /></span></div></Link>)}
          </div>
        </section>

        <section id="featured-products-section" className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between"><div><span className="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-charcoal/60 font-semibold">Sélection du moment</span><h2 className="font-display text-xl sm:text-2xl font-black text-charcoal">Articles Populaires</h2></div><Link href="/products" id="view-all-products-link" className="h-10 px-3 rounded-lg text-xs sm:text-sm font-bold text-primary hover:bg-sand/30 inline-flex items-center gap-1 transition-colors"><span>Voir tout</span><ArrowRight className="w-3.5 h-3.5" /></Link></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">{featuredProducts.map((product) => <ProductCard key={product.id} product={product} isAdded={addedProductId === product.id} onAddToCart={handleAddToCart} />)}</div>
        </section>

        <section id="features-banner" className="bg-paper border border-sand/80 rounded-2xl p-5 sm:p-6 md:p-8 shadow-2xs"><div className="text-center max-w-xl mx-auto mb-6"><h2 className="font-display text-lg sm:text-xl font-bold text-charcoal">Achetez en toute tranquillité sur Kabro Shop</h2><p className="text-xs sm:text-sm text-charcoal/70 mt-1">Un service pensé pour votre confort et adapté aux réalités locales</p></div><div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"><div className="flex items-start gap-3.5 p-3 rounded-xl bg-sand/20 border border-sand/40"><div className="w-10 h-10 rounded-lg bg-sand/50 flex items-center justify-center shrink-0"><Truck className="w-5 h-5 text-primary" /></div><div><h3 className="font-display font-bold text-xs sm:text-sm text-charcoal">Livraison directe</h3><p className="text-[11px] sm:text-xs text-charcoal/70 mt-0.5 leading-relaxed">Expédition rapide à domicile ou sur votre lieu de travail avec remise en main propre.</p></div></div><div className="flex items-start gap-3.5 p-3 rounded-xl bg-sand/20 border border-sand/40"><div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0"><ShieldCheck className="w-5 h-5 text-emerald-800" /></div><div><h3 className="font-display font-bold text-xs sm:text-sm text-charcoal">Paiement à la livraison</h3><p className="text-[11px] sm:text-xs text-charcoal/70 mt-0.5 leading-relaxed">Aucun numéro de carte requis. Vous payez en espèces une fois le colis reçu et validé.</p></div></div><div className="flex items-start gap-3.5 p-3 rounded-xl bg-sand/20 border border-sand/40"><div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0"><MessageCircle className="w-5 h-5 text-emerald-700" /></div><div><h3 className="font-display font-bold text-xs sm:text-sm text-charcoal">Assistance WhatsApp</h3><p className="text-[11px] sm:text-xs text-charcoal/70 mt-0.5 leading-relaxed">Confirmation immédiate de votre commande et suivi direct avec notre équipe locale.</p></div></div></div></section>
      </main>
      <Footer />
    </div>
  );
}
