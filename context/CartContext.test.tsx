import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { type ReactNode } from "react";
import { CartProvider, useCart, type CartItem } from "@/context/CartContext";

function wrapper({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}

describe("CartContext State Management (context/CartContext.tsx)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const itemA: CartItem = {
    productId: "prod-1",
    name: "Robe Wax Bogolan",
    price: 18500,
    quantity: 1,
    image: "https://picsum.photos/seed/test1/600/600",
  };

  const itemB: CartItem = {
    productId: "prod-2",
    name: "Beurre de Karité",
    price: 4500,
    quantity: 2,
    image: "https://picsum.photos/seed/test2/600/600",
  };

  it("initialise un panier vide par défaut", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toEqual([]);
    expect(result.current.total).toBe(0);
  });

  it("ajoute un article dans le panier", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(itemA);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]?.productId).toBe("prod-1");
    expect(result.current.items[0]?.quantity).toBe(1);
    expect(result.current.total).toBe(18500);
  });

  it("cumule la quantité sans créer de doublon si l'article est déjà présent", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(itemA);
    });
    act(() => {
      result.current.addItem({ ...itemA, quantity: 2 });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]?.quantity).toBe(3);
    expect(result.current.total).toBe(18500 * 3);
  });

  it("met à jour la quantité d'un article existant", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(itemA);
    });
    act(() => {
      result.current.updateQuantity("prod-1", 5);
    });

    expect(result.current.items[0]?.quantity).toBe(5);
    expect(result.current.total).toBe(18500 * 5);
  });

  it("supprime l'article si la quantité demandée est <= 0", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(itemA);
      result.current.addItem(itemB);
    });

    expect(result.current.items).toHaveLength(2);

    act(() => {
      result.current.updateQuantity("prod-1", 0);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]?.productId).toBe("prod-2");
  });

  it("supprime un article via removeItem", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(itemA);
      result.current.addItem(itemB);
    });

    act(() => {
      result.current.removeItem("prod-2");
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]?.productId).toBe("prod-1");
  });

  it("vide complètement le panier via clearCart", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(itemA);
      result.current.addItem(itemB);
    });

    expect(result.current.items).toHaveLength(2);

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.total).toBe(0);
  });
});
