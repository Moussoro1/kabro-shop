import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { getClientDb } from "@/lib/firebase";
import { productConverter, categoryConverter } from "@/lib/converters";
import type { Product, Category } from "@/types";

export const INITIAL_CATEGORIES: Category[] = [
  { id: "cat-mode", name: "Mode & Wax", slug: "mode-wax" },
  { id: "cat-beaute", name: "Beauté & Soins", slug: "beaute-soins" },
  { id: "cat-maison", name: "Maison & Artisanat", slug: "maison-artisanat" },
  { id: "cat-epices", name: "Épices & Terroir", slug: "epices-terroir" },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Robe Kimono Wax Bogolan",
    description: "Confection artisanale en coton 100% avec motifs traditionnels bogolan. Coupe fluide et ceinturée ajustable.",
    price: 18500,
    images: [
      "https://picsum.photos/seed/waxkimono/800/800",
      "https://picsum.photos/seed/waxkimono2/800/800",
    ],
    stock: 8,
    categoryId: "cat-mode",
    isActive: true,
  },
  {
    id: "prod-2",
    name: "Beurre de Karité Brut Non Raffiné 500g",
    description: "Beurre pur extrait à froid par une coopérative féminine. Idéal pour hydrater la peau sèche et nourrir les cheveux.",
    price: 4500,
    images: [
      "https://picsum.photos/seed/sheabutter/800/800",
    ],
    stock: 2,
    categoryId: "cat-beaute",
    isActive: true,
  },
  {
    id: "prod-3",
    name: "Panier Tressé Bolga Bicolore",
    description: "Panier tressé main en paille d'éléphant naturelle avec poignée en cuir résistant. Parfait pour le marché ou la déco.",
    price: 12000,
    images: [
      "https://picsum.photos/seed/bolgabasket/800/800",
    ],
    stock: 5,
    categoryId: "cat-maison",
    isActive: true,
  },
  {
    id: "prod-4",
    name: "Mélange Épices Suya Spécial Grillades",
    description: "Sachet de 200g du véritable mélange Suya Yaji : arachide torréfiée, gingembre, piment doux et ail fumé.",
    price: 2500,
    images: [
      "https://picsum.photos/seed/suyaspice/800/800",
    ],
    stock: 0,
    categoryId: "cat-epices",
    isActive: true,
  },
  {
    id: "prod-5",
    name: "Chemise Col Mao Tissu Kente",
    description: "Chemise moderne manches courtes avec empiècement kente tissé sur le col et la poche avant.",
    price: 15000,
    images: [
      "https://picsum.photos/seed/kenteshirt/800/800",
    ],
    stock: 12,
    categoryId: "cat-mode",
    isActive: true,
  },
  {
    id: "prod-6",
    name: "Huile Pure de Baobab Bio 100ml",
    description: "Élixir régénérant riche en omégas 3, 6 et 9. Pénétration rapide sans fini gras.",
    price: 6000,
    images: [
      "https://picsum.photos/seed/baobaboil/800/800",
    ],
    stock: 3,
    categoryId: "cat-beaute",
    isActive: true,
  },
  {
    id: "prod-7",
    name: "Sculpture Masque Baoulé Mural",
    description: "Bois d'iroko sculpté à la main et patiné à la cire d'abeille. Pièce authentique unique de 35 cm.",
    price: 24000,
    images: [
      "https://picsum.photos/seed/africanmask/800/800",
    ],
    stock: 1,
    categoryId: "cat-maison",
    isActive: true,
  },
  {
    id: "prod-8",
    name: "Fleurs d'Hibiscus Séchées (Bissap Royal) 500g",
    description: "Fleurs entières sélectionnées pour une boisson rafraîchissante riche en vitamine C et antioxydants.",
    price: 3000,
    images: [
      "https://picsum.photos/seed/bissapflowers/800/800",
    ],
    stock: 15,
    categoryId: "cat-epices",
    isActive: true,
  },
];

function getStoredLocalProducts(): Product[] {
  if (typeof window === "undefined") return INITIAL_PRODUCTS;
  try {
    const raw = localStorage.getItem("boutique_admin_products");
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as Product[];
      }
    }
  } catch {
    // Ignorer
  }
  return INITIAL_PRODUCTS;
}

function saveStoredLocalProducts(products: Product[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("boutique_admin_products", JSON.stringify(products));
  } catch {
    // Ignorer
  }
}

export async function getProducts(): Promise<Product[]> {
  try {
    const db = getClientDb();
    if (db) {
      const productsRef = collection(db, "products").withConverter(productConverter);
      const q = query(productsRef, where("isActive", "==", true));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((docSnap) => docSnap.data());
      if (list.length > 0) {
        return list;
      }
    }
  } catch {
    // Utilisation du catalogue local
  }

  const local = getStoredLocalProducts();
  return local.filter((p) => p.isActive);
}

export async function getAllAdminProducts(): Promise<Product[]> {
  try {
    const db = getClientDb();
    if (db) {
      const productsRef = collection(db, "products").withConverter(productConverter);
      const snapshot = await getDocs(productsRef);
      const list = snapshot.docs.map((docSnap) => docSnap.data());
      if (list.length > 0) {
        return list;
      }
    }
  } catch {
    // Utilisation du catalogue local
  }

  return getStoredLocalProducts();
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const db = getClientDb();
    if (db) {
      const docRef = doc(db, "products", id).withConverter(productConverter);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
    }
  } catch {
    // Utilisation du catalogue local
  }

  const local = getStoredLocalProducts();
  const found = local.find((p) => p.id === id);
  return found ?? null;
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  try {
    const db = getClientDb();
    if (db) {
      const productsRef = collection(db, "products").withConverter(productConverter);
      const q = query(
        productsRef,
        where("categoryId", "==", categoryId),
        where("isActive", "==", true)
      );
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((docSnap) => docSnap.data());
      if (list.length > 0) {
        return list;
      }
    }
  } catch {
    // Utilisation du catalogue local
  }

  const local = getStoredLocalProducts();
  return local.filter((p) => p.categoryId === categoryId && p.isActive);
}

export async function getCategories(): Promise<Category[]> {
  try {
    const db = getClientDb();
    if (db) {
      const catRef = collection(db, "categories").withConverter(categoryConverter);
      const snapshot = await getDocs(catRef);
      const list = snapshot.docs.map((docSnap) => docSnap.data());
      if (list.length > 0) {
        return list;
      }
    }
  } catch {
    // Utilisation des catégories locales
  }

  return INITIAL_CATEGORIES;
}

export async function createProduct(
  productData: Omit<Product, "id">
): Promise<Product> {
  const db = getClientDb();
  if (db) {
    try {
      const productsRef = collection(db, "products").withConverter(productConverter);
      const docRef = await addDoc(productsRef, {
        id: "",
        ...productData,
      });

      return {
        id: docRef.id,
        ...productData,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erreur Firestore";
      throw new Error(`Échec de la création du produit dans Firestore (${message})`);
    }
  }

  // Fallback local
  const newId = `prod-${Date.now()}`;
  const newProduct: Product = {
    id: newId,
    ...productData,
  };
  const list = getStoredLocalProducts();
  list.unshift(newProduct);
  saveStoredLocalProducts(list);
  return newProduct;
}

export async function updateProduct(
  id: string,
  productData: Partial<Omit<Product, "id">>
): Promise<void> {
  const db = getClientDb();
  if (db) {
    try {
      const docRef = doc(db, "products", id).withConverter(productConverter);
      await updateDoc(docRef, productData);
      return;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erreur Firestore";
      throw new Error(`Échec de la mise à jour du produit (${message})`);
    }
  }

  // Fallback local
  const list = getStoredLocalProducts();
  const index = list.findIndex((p) => p.id === id);
  if (index !== -1) {
    list[index] = {
      ...list[index],
      ...productData,
    };
    saveStoredLocalProducts(list);
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const db = getClientDb();
  if (db) {
    try {
      const docRef = doc(db, "products", id);
      await deleteDoc(docRef);
      return;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erreur Firestore";
      throw new Error(`Échec de la suppression du produit (${message})`);
    }
  }

  // Fallback local
  const list = getStoredLocalProducts();
  const updated = list.filter((p) => p.id !== id);
  saveStoredLocalProducts(updated);
}
