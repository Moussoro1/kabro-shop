import type { ReactElement } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";

export function Footer(): ReactElement {
  return (
    <footer id="site-footer" className="border-t border-sand bg-paper py-8 mt-12">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-charcoal/60 font-mono">
        <p>© {new Date().getFullYear()} BOUTIQUE MARCHÉ — Tous droits réservés.</p>
        <div className="flex items-center gap-4">
          <span>Paiement à la livraison</span>
          <span className="text-sand">•</span>
          <Link
            href="/admin/login"
            id="footer-admin-link"
            className="inline-flex items-center gap-1 text-charcoal/50 hover:text-primary transition-colors"
          >
            <Lock className="w-3 h-3" />
            <span>Gestion</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
