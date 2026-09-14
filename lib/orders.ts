import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { getClientDb } from "@/lib/firebase";
import { orderConverter } from "@/lib/converters";
import type { Order, OrderItem, OrderStatus } from "@/types";
import type { CartItem } from "@/context/CartContext";
import type { CheckoutFormValues } from "@/lib/validation/checkout";

function generateFallbackOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return `CMD-${timestamp}-${randomSuffix}`;
}

export async function createOrder(
  items: CartItem[],
  customer: CheckoutFormValues
): Promise<Order> {
  if (!items || items.length === 0) {
    throw new Error("Le panier est vide. Impossible de créer la commande.");
  }

  // Calcul strict et sécurisé du total
  const calculatedTotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const orderItems: OrderItem[] = items.map((item) => ({
    productId: item.productId,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
  }));

  const orderData: Omit<Order, "id"> = {
    items: orderItems,
    customer: {
      name: customer.name.trim(),
      phone: customer.phone.trim(),
      address: customer.address.trim(),
      city: customer.city.trim(),
    },
    total: calculatedTotal,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  const db = getClientDb();

  if (db) {
    try {
      const ordersRef = collection(db, "orders").withConverter(orderConverter);
      const docRef = await addDoc(ordersRef, {
        id: "", // Sera assigné par Firestore
        ...orderData,
      });

      return {
        id: docRef.id,
        ...orderData,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Erreur inconnue lors de l'enregistrement de la commande";
      throw new Error(
        `Impossible d'enregistrer la commande dans Firestore (${message}). Veuillez réessayer.`
      );
    }
  }

  // Mode local / hors ligne sans clés Firestore initialisées
  const localOrderId = generateFallbackOrderId();
  const localOrder: Order = {
    id: localOrderId,
    ...orderData,
  };

  try {
    if (typeof window !== "undefined") {
      const existingRaw = localStorage.getItem("boutique_orders_history");
      const existing: unknown = existingRaw ? JSON.parse(existingRaw) : [];
      const ordersList = Array.isArray(existing) ? existing : [];
      ordersList.unshift(localOrder);
      localStorage.setItem("boutique_orders_history", JSON.stringify(ordersList));
    }
  } catch {
    // Ignorer si indisponible
  }

  return localOrder;
}

export async function getOrderById(id: string): Promise<Order | null> {
  const db = getClientDb();
  if (db) {
    try {
      const docRef = doc(db, "orders", id).withConverter(orderConverter);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
    } catch {
      // Fallback local
    }
  }

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("boutique_orders_history");
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const found = parsed.find(
            (o): o is Order =>
              typeof o === "object" && o !== null && (o as Order).id === id
          );
          if (found) return found;
        }
      }
    } catch {
      // Ignorer
    }
  }

  return null;
}

export async function getAllOrders(): Promise<Order[]> {
  const db = getClientDb();
  if (db) {
    try {
      const ordersRef = collection(db, "orders").withConverter(orderConverter);
      const q = query(ordersRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((docSnap) => docSnap.data());
      if (list.length > 0) {
        return list;
      }
    } catch {
      // Fallback local
    }
  }

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("boutique_orders_history");
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed as Order[];
        }
      }
    } catch {
      // Ignorer
    }
  }

  return [];
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<void> {
  const db = getClientDb();
  if (db) {
    try {
      const docRef = doc(db, "orders", orderId).withConverter(orderConverter);
      await updateDoc(docRef, { status });
      return;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erreur Firestore";
      throw new Error(`Échec de la mise à jour du statut de la commande (${message})`);
    }
  }

  // Fallback local
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("boutique_orders_history");
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const orders = parsed as Order[];
          const index = orders.findIndex((o) => o.id === orderId);
          if (index !== -1) {
            orders[index].status = status;
            localStorage.setItem("boutique_orders_history", JSON.stringify(orders));
          }
        }
      }
    } catch {
      // Ignorer
    }
  }
}
