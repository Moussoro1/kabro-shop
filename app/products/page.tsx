"use client";

import { useState, useMemo, useEffect, type ReactElement } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { getProducts, getCategories, INITIAL_PRODUCTS, INITIAL_CATEGORIES } from "@/lib/products";
import type { Product, Category } from "@/types";
import { PackageOpen, Search, SlidersHorizontal, X } from "lucide-react";

type SortOption = "default" | "price-asc" | "price-desc" | "name-asc";

const normalize = (value: string): string =>
  value.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase().trim();

const sortLabels: Record<SortOption, string> = {
  default: "Pertinence",
  "price-asc": "Prix croissant",
  "price-desc": "Prix décroissant",
  "name-asc": "Nom A-Z",
};

function CatalogSkeleton(): ReactElement {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5" aria-label="Chargement des produits">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-xl border border-sand/70 bg-paper animate-pulse">
          <div className="aspect-square bg-sand/40" />
          <div className="space-y-2 p-3">
            <div className="h-3 w-1/3 rounded bg-sand/60" />
            <div className="h-4 w-4/5 rounded bg-sand/60" />
            <div className="h-4 w-1/2 rounded bg-sand/60" />
            <div className="h-10 rounded bg-sand/50" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProductsPage(): ReactElement {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categoriesList, setCategoriesList] = useState<Category[]>(INITIAL_CATEGORIES);
  const [loading, setLoading] = useState<boolean>(true);
  const [query, setQuery] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [sort, setSort] = useState<SortOption>("default");
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const { addItem } = useCart();

  useEffect(() => {
    const syncFromUrl = (): void => {
      const current = new URLSearchParams(window.location.search);
      setQuery(current.get("q") ?? "");
      setSelectedCategoryId(current.get("category") ?? "all");
      const currentSort = current.get("sort") as SortOption | null;
      setSort(currentSort && currentSort in sortLabels ? currentSort : "default");
    };

    // Synchronisation différée pour éviter les rendus en cascade synchrones à l'hydratation
    const timer = setTimeout(syncFromUrl, 0);
    window.addEventListener("popstate", syncFromUrl);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("popstate", syncFromUrl);
    };
  }, []);

  useEffect(() => {
    async function fetchData(): Promise<void> {
      try {
        const [loadedProducts, loadedCategories] = await Promise.all([getProducts(), getCategories()]);
        setProducts(loadedProducts);
        setCategoriesList(loadedCategories);
      } catch {
        // Conserver les données initiales/fallback en cas d'erreur
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const categories = useMemo(() => [{ id: "all", name: "Tous les articles", slug: "tous" }, ...categoriesList], [categoriesList]);

  const activeCategoryName = useMemo(() => {
    if (selectedCategoryId === "all") return null;
    const found = categoriesList.find((cat) => cat.id === selectedCategoryId);
    return found ? found.name : selectedCategoryId;
  }, [categoriesList, selectedCategoryId]);

  const updateUrl = (nextQuery: string, nextCategory: string, nextSort: SortOption): void => {
    const params = new URLSearchParams();
    if (nextQuery.trim()) params.set("q", nextQuery.trim());
    if (nextCategory !== "all") params.set("category", nextCategory);
    if (nextSort !== "default") params.set("sort", nextSort);
    window.history.replaceState(null, "", `/products${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const handleQueryChange = (value: string): void => {
    setQuery(value);
    updateUrl(value, selectedCategoryId, sort);
  };

  const handleCategoryChange = (value: string): void => {
    setSelectedCategoryId(value);
    updateUrl(query, value, sort);
  };

  const handleSortChange = (value: SortOption): void => {
    setSort(value);
    updateUrl(query, selectedCategoryId, value);
  };

  const filteredProducts = useMemo(() => {
    const normalizedQuery = normalize(query);
    const result = products.filter((product) => {
      if (!product.isActive) return false;
      if (selectedCategoryId !== "all" && product.categoryId !== selectedCategoryId) return false;
      if (!normalizedQuery) return true;
      return normalize(`${product.name} ${product.description ?? ""}`).includes(normalizedQuery);
    });

    return [...result].sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "name-asc") return a.name.localeCompare(b.name, "fr", { sensitivity: "base" });
      if (sort === "default") return Number(b.stock > 0) - Number(a.stock > 0);
      return 0;
    });
  }, [products, query, selectedCategoryId, sort]);

  const handleAddToCart = (product: Product): void => {
    addItem({ productId: product.id, name: product.name, price: product.price, quantity: 1, image: product.images[0] || "https://picsum.photos/seed/placeholder/600/600" });
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId((current) => current === product.id ? null : current), 1500);
  };

  const hasActiveFilters = Boolean(query.trim()) || selectedCategoryId !== "all" || sort !== "default";
  const clearFilters = (): void => {
    setQuery("");
    setSelectedCategoryId("all");
    setSort("default");
    updateUrl("", "all", "default");
  };

  return (
    <div id="catalog-page-container" className="min-h-screen bg-paper text-charcoal flex flex-col">
      <Header />
      <main id="catalog-main" className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 md:py-8">
        <div className="mb-5 flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-sand pb-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-charcoal/60 mb-1">Paiement à la livraison</p>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">Catalogue du Marché</h1>
          </div>
          <p className="font-mono text-xs sm:text-sm text-charcoal/60">{filteredProducts.length} {filteredProducts.length > 1 ? "articles" : "article"}</p>
        </div>

        <div className="flex flex-col gap-3 mb-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/50" aria-hidden="true" />
            <input value={query} onChange={(event) => handleQueryChange(event.target.value)} placeholder="Rechercher un article..." aria-label="Rechercher un article" className="w-full min-h-12 rounded-xl border border-sand bg-paper pl-10 pr-11 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
            {query && <button type="button" onClick={() => handleQueryChange("")} aria-label="Effacer la recherche" className="absolute right-2 top-1/2 -translate-y-1/2 min-h-10 min-w-10 inline-flex items-center justify-center rounded-lg hover:bg-sand/40"><X className="w-4 h-4" /></button>}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <nav aria-label="Catégories" className="overflow-x-auto scrollbar-none -mx-1 px-1">
              <div className="flex gap-2 min-w-max">
                {categories.map((category) => <button key={category.id} type="button" onClick={() => handleCategoryChange(category.id)} className={`min-h-11 px-4 rounded-full border text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${selectedCategoryId === category.id ? "bg-primary text-paper border-primary" : "bg-paper border-sand hover:border-primary/50"}`}>{category.name}</button>)}
              </div>
            </nav>
            <label className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap"><SlidersHorizontal className="w-4 h-4" /><span className="sr-only">Trier les produits</span><select value={sort} onChange={(event) => handleSortChange(event.target.value as SortOption)} className="min-h-11 rounded-lg border border-sand bg-paper px-3 font-medium outline-none focus:border-primary">{Object.entries(sortLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-5 text-xs">
            <span className="text-charcoal/60">Filtres actifs :</span>
            {query && (
              <button
                type="button"
                onClick={() => handleQueryChange("")}
                className="min-h-9 rounded-full bg-sand/50 px-3 inline-flex items-center gap-1 hover:bg-sand/70 transition-colors"
                aria-label="Effacer le filtre de recherche"
              >
                <span>Recherche : {query}</span>
                <X className="w-3 h-3" />
              </button>
            )}
            {activeCategoryName && (
              <button
                type="button"
                onClick={() => handleCategoryChange("all")}
                className="min-h-9 rounded-full bg-sand/50 px-3 inline-flex items-center gap-1 hover:bg-sand/70 transition-colors"
                aria-label={`Supprimer le filtre de catégorie ${activeCategoryName}`}
              >
                <span>Catégorie : {activeCategoryName}</span>
                <X className="w-3 h-3" />
              </button>
            )}
            {sort !== "default" && (
              <button
                type="button"
                onClick={() => handleSortChange("default")}
                className="min-h-9 rounded-full bg-sand/50 px-3 inline-flex items-center gap-1 hover:bg-sand/70 transition-colors"
                aria-label={`Réinitialiser le tri ${sortLabels[sort]}`}
              >
                <span>Tri : {sortLabels[sort]}</span>
                <X className="w-3 h-3" />
              </button>
            )}
            <button
              type="button"
              onClick={clearFilters}
              className="min-h-9 px-2 font-semibold text-primary hover:underline transition-colors"
            >
              Tout effacer
            </button>
          </div>
        )}

        {loading ? <CatalogSkeleton /> : filteredProducts.length > 0 ? <div id="products-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">{filteredProducts.map((product) => <ProductCard key={product.id} product={product} isAdded={addedProductId === product.id} onAddToCart={handleAddToCart} />)}</div> : <div id="products-empty-state" className="border border-dashed border-sand rounded-xl p-10 sm:p-12 text-center my-8"><PackageOpen className="w-10 h-10 mx-auto text-charcoal/40 mb-3" /><h2 className="font-display text-lg font-bold mb-1">Aucun article trouvé</h2><p className="text-xs sm:text-sm text-charcoal/70 mb-4">Essayez une autre recherche ou réinitialisez vos filtres.</p><button type="button" onClick={clearFilters} className="min-h-11 px-4 rounded-lg bg-accent text-charcoal font-semibold text-xs sm:text-sm">Afficher tous les articles</button></div>}
      </main>
      <Footer />
    </div>
  );
}
