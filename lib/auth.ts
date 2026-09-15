import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
  type Unsubscribe,
} from "firebase/auth";
import { getClientAuth } from "@/lib/firebase";

export async function signIn(email: string, password: string): Promise<User> {
  const auth = getClientAuth();
  if (!auth) {
    throw new Error(
      "Le service d'authentification n'est pas configuré. Veuillez vérifier les variables d'environnement Firebase."
    );
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Identifiants invalides";
    if (
      message.includes("auth/invalid-credential") ||
      message.includes("auth/wrong-password") ||
      message.includes("auth/user-not-found") ||
      message.includes("auth/invalid-email")
    ) {
      throw new Error("Adresse email ou mot de passe incorrect.");
    }
    throw new Error(`Erreur de connexion : ${message}`);
  }
}

export async function signOutAdmin(): Promise<void> {
  const auth = getClientAuth();
  if (!auth) {
    return;
  }
  await signOut(auth);
}

export function subscribeToAuthState(
  callback: (user: User | null) => void
): Unsubscribe {
  const auth = getClientAuth();
  if (!auth) {
    // Si Firebase n'est pas initialisé, on notifie immédiatement avec null
    callback(null);
    return () => {
      // Pas de désabonnement nécessaire
    };
  }

  return onAuthStateChanged(auth, (user: User | null) => {
    callback(user);
  });
}
