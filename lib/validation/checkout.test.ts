import { describe, it, expect } from "vitest";
import { checkoutSchema, type CheckoutFormValues } from "@/lib/validation/checkout";

describe("Checkout Validation Schema (lib/validation/checkout.ts)", () => {
  it("valide des données client correctes", () => {
    const validData: CheckoutFormValues = {
      name: "Moussa Traoré",
      phone: "771234567",
      address: "Quartier Mermoz, Rue 12",
      city: "Dakar",
    };

    const result = checkoutSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Moussa Traoré");
      expect(result.data.phone).toBe("771234567");
    }
  });

  it("rejette un nom trop court (< 2 caractères)", () => {
    const invalidData = {
      name: "M",
      phone: "771234567",
      address: "Quartier Mermoz, Rue 12",
      city: "Dakar",
    };

    const result = checkoutSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const nameError = result.error.format().name?._errors;
      expect(nameError).toContain("Le nom est requis");
    }
  });

  it("rejette un numéro de téléphone invalide (< 8 caractères)", () => {
    const invalidData = {
      name: "Moussa Traoré",
      phone: "123456",
      address: "Quartier Mermoz, Rue 12",
      city: "Dakar",
    };

    const result = checkoutSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const phoneError = result.error.format().phone?._errors;
      expect(phoneError).toContain("Numéro de téléphone invalide");
    }
  });

  it("rejette une adresse trop courte (< 5 caractères)", () => {
    const invalidData = {
      name: "Moussa Traoré",
      phone: "771234567",
      address: "Rue",
      city: "Dakar",
    };

    const result = checkoutSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const addressError = result.error.format().address?._errors;
      expect(addressError).toContain("L'adresse est requise");
    }
  });

  it("rejette une ville trop courte (< 2 caractères)", () => {
    const invalidData = {
      name: "Moussa Traoré",
      phone: "771234567",
      address: "Quartier Mermoz, Rue 12",
      city: "D",
    };

    const result = checkoutSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const cityError = result.error.format().city?._errors;
      expect(cityError).toContain("La ville est requise");
    }
  });
});
