import type { ReactElement } from "react";
import Link from "next/link";
import { ArrowLeft, PackageOpen } from "lucide-react";
import { Header } from "@/components/Header";
import { getProductById } from "@/lib/products";
import { ProductDetailClient } from "./ProductDetailClient";

interface ProductDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps): Promise<ReactElement> {
  const resolvedParams = await params;
  const product = await getProductById(resolvedParams.id);

  if (!product) {
    return (
      <div id="product-not-found" className="min-h-screen bg-paper text-charcoal flex flex-col">
        <Header />
        <main className="flex-1 max-w-xl w-full mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
          <div className="border border-dashed border-sand rounded [border-radius:4px] p-8 w-full bg-paper">
            <PackageOpen className="w-12 h-12 mx-auto text-charcoal/40 mb-4" />
            <h1 className="font-display text-2xl font-bold text-charcoal mb-2">
              Produit introuvable
            </h1>
            <p className="text-sm text-charcoal/70 mb-6">
              Cet article n&apos;est plus disponible ou la référence est incorrecte.
            </p>
            <Link
              href="/products"
              id="not-found-back-link"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-accent text-charcoal font-semibold text-sm rounded [border-radius:2px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour à la boutique</span>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return <ProductDetailClient product={product} />;
}
