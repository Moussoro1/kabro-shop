import { describe, it, expect, beforeEach } from "vitest";
import { createOrder } from "@/lib/orders";
import type { CartItem } from "@/context/CartContext";
import type { CheckoutFormValues } from "@/lib/validation/checkout";

describe("Order Logic & Security (lib/orders.ts)", () => {
  beforeEach(() => {
    // Nettoyer le localStorage simulé dans jsdom
    localStorage.clear();
  });

  const validCustomer: CheckoutFormValues = {
    name: "  Fatou Ndiaye  ",
    phone: "  +221 77 987 65 43  ",
    address: "  Avenue Cheikh Anta Diop  ",
    city: "  Dakar  ",
  };

  const sampleItems: CartItem[] = [
    {
      productId: "prod-wax-1",
      name: "Robe Bogolan",
      price: 18500,
      quantity: 2,
      image: "https://picsum.photos/seed/test1/600/600",
    },
    {
      productId: "prod-karite-2",
      name: "Beurre de Karité",
      price: 4500,
      quantity: 3,
      image: "https://picsum.photos/seed/test2/600/600",
    },
  ];

  it("recalcule strictement le total côté serveur/logique métier (ignore tout total arbitraire)", async () => {
    // Total attendu : (18500 * 2) + (4500 * 3) = 37000 + 13500 = 50500
    const order = await createOrder(sampleItems, validCustomer);

    expect(order.total).toBe(50500);
    expect(order.status).toBe("pending");
    expect(order.items).toHaveLength(2);
  });

  it("nettoie (trim) les espaces superflus dans les coordonnées client", async () => {
    const order = await createOrder(sampleItems, validCustomer);

    expect(order.customer.name).toBe("Fatou Ndiaye");
    expect(order.customer.phone).toBe("+221 77 987 65 43");
    expect(order.customer.address).toBe("Avenue Cheikh Anta Diop");
    expect(order.customer.city).toBe("Dakar");
  });

  it("rejette la création d'une commande si le panier est vide", async () => {
    await expect(createOrder([], validCustomer)).rejects.toThrow(
      "Le panier est vide. Impossible de créer la commande."
    );
  });

  it("génère un identifiant et une date de création ISO valide", async () => {
    const order = await createOrder(sampleItems, validCustomer);

    expect(order.id).toBeDefined();
    expect(order.id.length).toBeGreaterThan(0);
    expect(new Date(order.createdAt).toISOString()).toBe(order.createdAt);
  });
});
