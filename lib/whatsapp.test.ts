import { describe, it, expect } from "vitest";
import { buildWhatsAppOrderLink, formatShortOrderId } from "@/lib/whatsapp";
import type { Order } from "@/types";

describe("WhatsApp Link Generator (lib/whatsapp.ts)", () => {
  const sampleOrder: Order = {
    id: "CMD-2026-TEST-999",
    items: [
      {
        productId: "prod-1",
        name: "Robe Kimono Wax Bogolan & Soie",
        price: 18500,
        quantity: 2,
      },
      {
        productId: "prod-2",
        name: "Beurre de Karité Brut 100% Naturel",
        price: 4500,
        quantity: 1,
      },
    ],
    customer: {
      name: "Amadou Diallo",
      phone: "+221 77 123 45 67",
      address: "12 Rue des Almadies, Villa 4B",
      city: "Dakar",
    },
    total: 41500,
    status: "pending",
    createdAt: "2026-08-18T10:00:00.000Z",
  };

  it("génère une URL WhatsApp valide pointant vers wa.me", () => {
    const url = buildWhatsAppOrderLink(sampleOrder);
    expect(url).toContain("https://wa.me/");
    expect(url).toContain("?text=");
  });

  it("utilise le numéro WhatsApp configuré sans caractères parasites", () => {
    const url = buildWhatsAppOrderLink(sampleOrder, "221770001122");
    expect(url).toContain("https://wa.me/221770001122?text=");
  });

  it("nettoie le numéro de téléphone des espaces et du signe +", () => {
    const url = buildWhatsAppOrderLink(sampleOrder, "+221 77 000 11 22");
    expect(url).toContain("https://wa.me/221770001122?text=");
  });

  it("encode correctement les accents, espaces et caractères spéciaux (&, %, €)", () => {
    const url = buildWhatsAppOrderLink(sampleOrder);
    const parsedUrl = new URL(url);
    const textParam = parsedUrl.searchParams.get("text");

    expect(textParam).toBeDefined();
    expect(textParam).not.toBeNull();
    if (textParam) {
      expect(textParam).toContain("Robe Kimono Wax Bogolan & Soie");
      expect(textParam).toContain("Beurre de Karité Brut 100% Naturel");
      expect(textParam).toContain("Amadou Diallo");
      expect(textParam).toContain("Dakar");
      expect(textParam).toContain("FCFA");
    }
  });

  it("inclut les informations essentielles de la commande et du client", () => {
    const url = buildWhatsAppOrderLink(sampleOrder);
    const parsedUrl = new URL(url);
    const textParam = parsedUrl.searchParams.get("text") ?? "";

    expect(textParam).toContain("NOUVELLE COMMANDE");
    expect(textParam).toContain("CMD-2026-TEST-999");
    expect(textParam).toContain("TOTAL À PAYER À LA LIVRAISON");
    expect(textParam).toContain("Espèces à la réception (COD)");
    expect(textParam).toContain("12 Rue des Almadies, Villa 4B");
    expect(textParam).toContain("+221 77 123 45 67");
  });

  it("formatShortOrderId formate correctement l'identifiant", () => {
    expect(formatShortOrderId("CMD-ABC-12345")).toBe("CMD-ABC-12345");
    expect(formatShortOrderId("987654321")).toBe("CMD-987654");
    expect(formatShortOrderId("")).toBe("CMD-000");
  });
});
