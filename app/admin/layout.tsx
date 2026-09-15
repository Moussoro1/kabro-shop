"use client";

import { useEffect, useState, type ReactElement } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { type User } from "firebase/auth";
import {
  Package,
  ShoppingBag,
  LogOut,
  Store,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { subscribeToAuthState, signOutAdmin } from "@/lib/auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}): ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    // Si on est sur la page de login, pas besoin de bloquer
    const unsubscribe = subscribeToAuthState((currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (!currentUser && !isLoginPage) {
        router.replace("/admin/login");
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isLoginPage, router]);

  // Si on est sur la page de login, on affiche directement le contenu
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Pendant la vérification d'authentification
  if (loading) {
    return (
      <div
        id="admin-auth-loading"
        className="min-h-screen bg-paper text-charcoal flex items-center justify-center p-6"
      >
        <div className="flex items-center gap-3 font-mono text-sm text-charcoal/70">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span>Vérification de l&apos;accès administrateur...</span>
        </div>
      </div>
    );
  }

  // Si non connecté et pas sur la page de login
  if (!user) {
    return (
      <div
        id="admin-unauthorized"
        className="min-h-screen bg-paper text-charcoal flex items-center justify-center p-6"
      >
        <div className="flex items-center gap-3 font-mono text-sm text-charcoal/70">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span>Redirection vers la page de connexion...</span>
        </div>
      </div>
    );
  }

  const handleSignOut = async (): Promise<void> => {
    try {
      await signOutAdmin();
      router.replace("/admin/login");
    } catch {
      // Ignorer
    }
  };

  const isProductsActive = pathname.startsWith("/admin/products");
  const isOrdersActive = pathname.startsWith("/admin/orders");

  return (
    <div id="admin-root-container" className="min-h-screen bg-paper text-charcoal flex flex-col">
      {/* Header Admin */}
      <header
        id="admin-header"
        className="border-b border-sand bg-paper/95 backdrop-blur-sm sticky top-0 z-30"
      >
        <div className="max-w-6xl w-full mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/admin/products"
              id="admin-brand-link"
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded [border-radius:4px] bg-primary text-paper flex items-center justify-center font-display font-extrabold text-base shadow-sm">
                B
              </div>
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-sm sm:text-base text-primary tracking-tight leading-none">
                  BOUTIQUE
                </span>
                <span className="font-mono text-[10px] text-charcoal/60 uppercase tracking-widest leading-tight">
                  Espace Gestion
                </span>
              </div>
            </Link>

            {/* Navigation principale */}
            <nav id="admin-nav" className="hidden sm:flex items-center gap-1">
              <Link
                href="/admin/products"
                id="admin-nav-products"
                className={`px-3 py-1.5 rounded [border-radius:2px] font-mono text-xs uppercase font-medium transition-colors flex items-center gap-1.5 ${
                  isProductsActive
                    ? "bg-accent text-charcoal font-bold"
                    : "text-charcoal/70 hover:text-charcoal hover:bg-sand/30"
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Produits</span>
              </Link>
              <Link
                href="/admin/orders"
                id="admin-nav-orders"
                className={`px-3 py-1.5 rounded [border-radius:2px] font-mono text-xs uppercase font-medium transition-colors flex items-center gap-1.5 ${
                  isOrdersActive
                    ? "bg-accent text-charcoal font-bold"
                    : "text-charcoal/70 hover:text-charcoal hover:bg-sand/30"
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Commandes</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 font-mono text-xs text-charcoal/60 px-2.5 py-1 border border-sand rounded [border-radius:2px] bg-sand/15">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span className="truncate max-w-[140px]">{user.email}</span>
            </div>

            <Link
              href="/"
              target="_blank"
              id="admin-view-store-btn"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-sand rounded [border-radius:2px] text-xs font-mono text-charcoal hover:bg-sand/30 transition-colors"
              title="Voir la boutique publique"
            >
              <Store className="w-3.5 h-3.5 text-primary" />
              <span className="hidden sm:inline">Boutique</span>
            </Link>

            <button
              onClick={handleSignOut}
              id="admin-logout-btn"
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-sand rounded [border-radius:2px] text-xs font-mono text-danger hover:bg-danger/10 transition-colors cursor-pointer"
              title="Se déconnecter"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="sm:hidden flex border-t border-sand">
          <Link
            href="/admin/products"
            className={`flex-1 py-2.5 text-center font-mono text-xs uppercase font-medium flex items-center justify-center gap-1.5 ${
              isProductsActive
                ? "bg-accent text-charcoal font-bold"
                : "text-charcoal/70 bg-paper"
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Produits</span>
          </Link>
          <Link
            href="/admin/orders"
            className={`flex-1 py-2.5 text-center font-mono text-xs uppercase font-medium flex items-center justify-center gap-1.5 border-l border-sand ${
              isOrdersActive
                ? "bg-accent text-charcoal font-bold"
                : "text-charcoal/70 bg-paper"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Commandes</span>
          </Link>
        </div>
      </header>

      {/* Contenu principal */}
      <main id="admin-main-content" className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
