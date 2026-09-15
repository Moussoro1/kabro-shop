"use client";

import { useEffect, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AdminIndexPage(): ReactElement {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/products");
  }, [router]);

  return (
    <div className="flex items-center justify-center p-12">
      <div className="flex items-center gap-2 font-mono text-sm text-charcoal/70">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <span>Redirection vers la gestion des produits...</span>
      </div>
    </div>
  );
}
