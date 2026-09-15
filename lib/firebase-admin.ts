import { getApps as getAdminApps, initializeApp as initializeAdminApp, cert, type App as AdminApp } from "firebase-admin/app";
import { getFirestore as getAdminFirestore, type Firestore as AdminFirestore } from "firebase-admin/firestore";

export function getAdminApp(): AdminApp {
  const existingApps = getAdminApps();
  if (existingApps.length > 0) {
    return existingApps[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (clientEmail && privateKey && projectId) {
    return initializeAdminApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }

  return initializeAdminApp({
    projectId: projectId ?? "boutique-app",
  });
}

export function getAdminDb(): AdminFirestore {
  return getAdminFirestore(getAdminApp());
}
