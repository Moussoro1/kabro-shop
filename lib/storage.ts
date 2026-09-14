import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getClientStorage } from "@/lib/firebase";

export async function uploadProductImage(
  file: File,
  productId: string
): Promise<string> {
  const storage = getClientStorage();

  if (storage) {
    try {
      const extension = file.name.split(".").pop() ?? "jpg";
      const sanitizedName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${extension}`;
      const imageRef = ref(storage, `products/${productId}/${sanitizedName}`);
      
      const snapshot = await uploadBytes(imageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erreur Storage";
      console.warn("Échec upload Firebase Storage, bascule en conversion locale :", message);
    }
  }

  // Fallback local via FileReader en base64 pour prévisualisation et persistance locale
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Impossible de lire l'image"));
      }
    };
    reader.onerror = () => {
      reject(new Error("Erreur de lecture du fichier image"));
    };
    reader.readAsDataURL(file);
  });
}
