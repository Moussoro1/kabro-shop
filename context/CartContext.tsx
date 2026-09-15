"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactElement,
  type ReactNode,
} from "react";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const CART_STORAGE_KEY = "boutique_marche_cart_v1";

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.productId === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.price === "number" &&
    typeof candidate.quantity === "number" &&
    typeof candidate.image === "string"
  );
}

function parseCartItems(jsonString: string): CartItem[] {
  try {
    const parsed: unknown = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isCartItem);
  } catch {
    return [];
  }
}

function getInitialCart(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? parseCartItems(stored) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }): ReactElement {
  const [items, setItems] = useState<CartItem[]>(getInitialCart);

  // Sync to localStorage
  useEffect((): void => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignorer si localStorage n'est pas accessible
    }
  }, [items]);

  const addItem = useCallback((itemToAdd: CartItem): void => {
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item.productId === itemToAdd.productId
      );

      if (existingIndex > -1) {
        return prevItems.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + itemToAdd.quantity }
            : item
        );
      }

      return [...prevItems, itemToAdd];
    });
  }, []);

  const removeItem = useCallback((productId: string): void => {
    setItems((prevItems) => prevItems.filter((item) => item.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number): void => {
    setItems((prevItems) => {
      if (quantity <= 0) {
        return prevItems.filter((item) => item.productId !== productId);
      }
      return prevItems.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      );
    });
  }, []);

  const clearCart = useCallback((): void => {
    setItems([]);
  }, []);

  const total = useMemo((): number => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const contextValue = useMemo<CartContextValue>(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      total,
    }),
    [items, addItem, removeItem, updateQuantity, clearCart, total]
  );

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
