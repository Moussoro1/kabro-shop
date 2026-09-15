/**
 * Configuration Firebase Client & Sécurité Firestore
 * 
 * -------------------------------------------------------------
 * RÈGLES DE SÉCURITÉ FIRESTORE À APPLIQUER DANS LA CONSOLE FIREBASE :
 * -------------------------------------------------------------
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     // Lecture publique du catalogue, écriture réservée aux administrateurs connectés
 *     match /products/{productId} {
 *       allow read: if true;
 *       allow write: if request.auth != null;
 *     }
 *     
 *     match /categories/{categoryId} {
 *       allow read: if true;
 *       allow write: if request.auth != null;
 *     }
 *     
 *     // Création de commande ouverte aux clients sans compte,
 *     // lecture et mise à jour réservées aux administrateurs connectés
 *     match /orders/{orderId} {
 *       allow create: if true;
 *       allow read, update, delete: if request.auth != null;
 *     }
 *   }
 * }
 * -------------------------------------------------------------
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";
import { getStorage, type FirebaseStorage } from "firebase/storage";

let cachedApp: FirebaseApp | null = null;
let cachedDb: Firestore | null = null;
let cachedAuth: Auth | null = null;
let cachedStorage: FirebaseStorage | null = null;

export function getClientApp(): FirebaseApp | null {
  if (cachedApp) {
    return cachedApp;
  }

  const existingApps = getApps();
  if (existingApps.length > 0) {
    cachedApp = getApp();
    return cachedApp;
  }

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!apiKey || !projectId) {
    return null;
  }

  const firebaseConfig = {
    apiKey,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    projectId,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  };

  cachedApp = initializeApp(firebaseConfig);
  return cachedApp;
}

export function getClientDb(): Firestore | null {
  if (cachedDb) {
    return cachedDb;
  }
  const app = getClientApp();
  if (!app) {
    return null;
  }
  cachedDb = getFirestore(app);
  return cachedDb;
}

export function getClientAuth(): Auth | null {
  if (cachedAuth) {
    return cachedAuth;
  }
  const app = getClientApp();
  if (!app) {
    return null;
  }
  cachedAuth = getAuth(app);
  return cachedAuth;
}

export function getClientStorage(): FirebaseStorage | null {
  if (cachedStorage) {
    return cachedStorage;
  }
  const app = getClientApp();
  if (!app) {
    return null;
  }
  cachedStorage = getStorage(app);
  return cachedStorage;
}
