"use client";

import { useState, useMemo, useEffect, type ReactElement } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { getProducts, getCategories, INITIAL_PRODUCTS, INITIAL_CATEGORIES } from "@/lib/products";
import type { Product, Category } from "@/types";
import { PackageOpen, Sparkles, Loader2 } from "lucide-react";

export default function ProductsPage(): ReactElement {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categoriesList, setCategoriesList] = useState<Category[]>(INITIAL_CATEGORIES);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const { addItem } = useCart();

  useEffect(() => {
    async function fetchData(): Promise<void> {
      try {
        const [loadedProducts, loadedCategories] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);
        setProducts(loadedProducts);
        setCategoriesList(loadedCategories);
      } catch {
        // Fallback to initial
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const categories = useMemo(() => [
    { id: "all", name: "Tous les articles", slug: "tous" },
    ...categoriesList,
  ], [categoriesList]);

  const filteredProducts = useMemo(() => {
    if (selectedCategoryId === "all") {
      return products.filter((p) => p.isActive);
    }
    return products.filter(
      (p) => p.categoryId === selectedCategoryId && p.isActive
    );
  }, [products, selectedCategoryId]);

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
      setAddedProductId((current) => (current === product.id ? null : current));
    }, 1500);
  };

  return (
    <div id="catalog-page-container" className="min-h-screen bg-paper text-charcoal flex flex-col">
      <Header />

      <main id="catalog-main" className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 md:py-8">
        {/* En-tête Catalogue */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-2 border-b border-sand pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="font-mono text-xs uppercase tracking-wider text-charcoal/70">
                Paiement à la livraison
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
              Catalogue du Marché
            </h1>
          </div>
          <p className="font-mono text-xs sm:text-sm text-charcoal/60">
            {filteredProducts.length} {filteredProducts.length > 1 ? "articles disponibles" : "article disponible"}
          </p>
        </div>

        {/* Filtres Catégories (Horizontal scrollable sur mobile) */}
        <nav
          id="category-filters-nav"
          aria-label="Catégories"
          className="mb-8 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          <div className="flex items-center gap-2 min-w-max pb-2">
            {categories.map((category) => {
              const isSelected = selectedCategoryId === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  id={`filter-category-${category.id}`}
                  onClick={(): void => setSelectedCategoryId(category.id)}
                  className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded [border-radius:2px] transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? "bg-primary text-paper font-semibold"
                      : "bg-paper text-charcoal border border-sand hover:border-primary/50"
                  }`}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Chargement ou Grille de Produits */}
        {loading ? (
          <div className="flex items-center justify-center p-16">
            <div className="flex items-center gap-2 font-mono text-sm text-charcoal/70">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span>Chargement du catalogue...</span>
            </div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div
            id="products-grid"
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5"
          >
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isAdded={addedProductId === product.id}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        ) : (
          /* État vide clair */
          <div
            id="products-empty-state"
            className="border border-dashed border-sand rounded [border-radius:4px] p-12 text-center my-8 bg-paper"
          >
            <PackageOpen className="w-10 h-10 mx-auto text-charcoal/40 mb-3" />
            <h2 className="font-display text-lg font-bold text-charcoal mb-1">
              Aucun produit dans cette catégorie pour le moment
            </h2>
            <p className="text-xs sm:text-sm text-charcoal/70 mb-4">
              Consultez nos autres catégories ou revenez un peu plus tard.
            </p>
            <button
              type="button"
              id="reset-category-filter-btn"
              onClick={(): void => setSelectedCategoryId("all")}
              className="px-4 py-2 bg-accent text-charcoal font-semibold text-xs sm:text-sm rounded [border-radius:2px] cursor-pointer"
            >
              Afficher tous les articles
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
