export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
  categoryId: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export type OrderStatus = "pending" | "confirmed" | "delivered" | "cancelled";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Customer {
  name: string;
  phone: string;
  address: string;
  city: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  customer: Customer;
  total: number;
  status: OrderStatus;
  createdAt: string;
}
