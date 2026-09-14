import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Le nom du produit est requis"),
  description: z.string().min(5, "La description est requise"),
  price: z.number().min(100, "Le prix minimum est de 100 FCFA"),
  stock: z.number().int().min(0, "Le stock ne peut pas être négatif"),
  categoryId: z.string().min(1, "Veuillez sélectionner une catégorie"),
  isActive: z.boolean(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
