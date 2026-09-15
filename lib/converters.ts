import type {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  WithFieldValue,
  DocumentData,
} from "firebase/firestore";
import type { Product, Category, Order, OrderItem, Customer, OrderStatus } from "@/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function parseNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && !Number.isNaN(value) ? value : fallback;
}

function parseBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  return [];
}

function isOrderStatus(value: unknown): value is OrderStatus {
  return (
    typeof value === "string" &&
    (value === "pending" || value === "confirmed" || value === "delivered" || value === "cancelled")
  );
}

function parseOrderItem(value: unknown): OrderItem | null {
  if (!isRecord(value)) return null;
  return {
    productId: parseString(value.productId, ""),
    name: parseString(value.name, ""),
    price: parseNumber(value.price, 0),
    quantity: parseNumber(value.quantity, 1),
  };
}

function parseOrderItems(value: unknown): OrderItem[] {
  if (Array.isArray(value)) {
    const parsed = value.map(parseOrderItem);
    return parsed.filter((item): item is OrderItem => item !== null);
  }
  return [];
}

function parseCustomer(value: unknown): Customer {
  if (!isRecord(value)) {
    return {
      name: "",
      phone: "",
      address: "",
      city: "",
    };
  }
  return {
    name: parseString(value.name, ""),
    phone: parseString(value.phone, ""),
    address: parseString(value.address, ""),
    city: parseString(value.city, ""),
  };
}

export const productConverter: FirestoreDataConverter<Product> = {
  toFirestore(product: WithFieldValue<Product>): DocumentData {
    return {
      name: product.name,
      description: product.description,
      price: product.price,
      images: product.images,
      stock: product.stock,
      categoryId: product.categoryId,
      isActive: product.isActive,
    };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options?: SnapshotOptions
  ): Product {
    const data: unknown = snapshot.data(options);
    if (!isRecord(data)) {
      return {
        id: snapshot.id,
        name: "",
        description: "",
        price: 0,
        images: [],
        stock: 0,
        categoryId: "",
        isActive: false,
      };
    }

    return {
      id: snapshot.id,
      name: parseString(data.name, ""),
      description: parseString(data.description, ""),
      price: parseNumber(data.price, 0),
      images: parseStringArray(data.images),
      stock: parseNumber(data.stock, 0),
      categoryId: parseString(data.categoryId, ""),
      isActive: parseBoolean(data.isActive, true),
    };
  },
};

export const categoryConverter: FirestoreDataConverter<Category> = {
  toFirestore(category: WithFieldValue<Category>): DocumentData {
    return {
      name: category.name,
      slug: category.slug,
    };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options?: SnapshotOptions
  ): Category {
    const data: unknown = snapshot.data(options);
    if (!isRecord(data)) {
      return {
        id: snapshot.id,
        name: "",
        slug: "",
      };
    }

    return {
      id: snapshot.id,
      name: parseString(data.name, ""),
      slug: parseString(data.slug, ""),
    };
  },
};

export const orderConverter: FirestoreDataConverter<Order> = {
  toFirestore(order: WithFieldValue<Order>): DocumentData {
    return {
      items: order.items,
      customer: order.customer,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
    };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options?: SnapshotOptions
  ): Order {
    const data: unknown = snapshot.data(options);
    if (!isRecord(data)) {
      return {
        id: snapshot.id,
        items: [],
        customer: { name: "", phone: "", address: "", city: "" },
        total: 0,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
    }

    return {
      id: snapshot.id,
      items: parseOrderItems(data.items),
      customer: parseCustomer(data.customer),
      total: parseNumber(data.total, 0),
      status: isOrderStatus(data.status) ? data.status : "pending",
      createdAt: parseString(data.createdAt, new Date().toISOString()),
    };
  },
};
