import { z } from "zod";

export const checkoutSchema = z.object({
  name: z.string().min(2, "Le nom est requis"),
  phone: z.string().min(8, "Numéro de téléphone invalide"),
  address: z.string().min(5, "L'adresse est requise"),
  city: z.string().min(2, "La ville est requise"),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
