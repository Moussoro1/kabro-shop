"use client";

import { useState, useEffect, useRef, type ReactElement } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Loader2,
  X,
  AlertTriangle,
  CheckCircle2,
  Search,
} from "lucide-react";
import {
  getAllAdminProducts,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/products";
import { uploadProductImage } from "@/lib/storage";
import { productSchema, type ProductFormValues } from "@/lib/validation/product";
import type { Product, Category } from "@/types";

export default function AdminProductsPage(): ReactElement {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modale d'édition / création
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modale de confirmation de suppression
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 1000,
      stock: 5,
      categoryId: "",
      isActive: true,
    },
  });

  const refreshProductsList = async (): Promise<void> => {
    try {
      setLoading(true);
      const [prods, cats] = await Promise.all([
        getAllAdminProducts(),
        getCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch {
      setFeedback({
        type: "error",
        message: "Impossible de charger la liste des produits.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function init(): Promise<void> {
      try {
        const [prods, cats] = await Promise.all([
          getAllAdminProducts(),
          getCategories(),
        ]);
        if (isMounted) {
          setProducts(prods);
          setCategories(cats);
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          setFeedback({
            type: "error",
            message: "Impossible de charger la liste des produits.",
          });
          setLoading(false);
        }
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, []);

  const openCreateModal = (): void => {
    setEditingProduct(null);
    setImageUrls(["https://picsum.photos/seed/waxitem/800/800"]);
    reset({
      name: "",
      description: "",
      price: 5000,
      stock: 10,
      categoryId: categories[0]?.id ?? "",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product): void => {
    setEditingProduct(product);
    setImageUrls(product.images.length > 0 ? product.images : ["https://picsum.photos/seed/default/800/800"]);
    reset({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId,
      isActive: product.isActive,
    });
    setIsModalOpen(true);
  };

  const handleImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    try {
      setIsUploadingImage(true);
      const tempId = editingProduct?.id ?? `prod-upload-${Date.now()}`;
      const uploadedUrl = await uploadProductImage(file, tempId);
      setImageUrls((prev) => [uploadedUrl, ...prev]);
      setFeedback({
        type: "success",
        message: "Image chargée avec succès.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur d'upload";
      setFeedback({
        type: "error",
        message: `Échec du téléchargement de l'image : ${msg}`,
      });
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImageUrl = (indexToRemove: number): void => {
    setImageUrls((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const onSubmitProduct = async (values: ProductFormValues): Promise<void> => {
    try {
      setIsSaving(true);
      setFeedback(null);

      const finalImages =
        imageUrls.length > 0
          ? imageUrls
          : ["https://picsum.photos/seed/defaultitem/800/800"];

      if (editingProduct) {
        // Mise à jour
        await updateProduct(editingProduct.id, {
          name: values.name.trim(),
          description: values.description.trim(),
          price: values.price,
          stock: values.stock,
          categoryId: values.categoryId,
          isActive: values.isActive,
          images: finalImages,
        });

        setFeedback({
          type: "success",
          message: `Le produit "${values.name}" a été mis à jour.`,
        });
      } else {
        // Création
        await createProduct({
          name: values.name.trim(),
          description: values.description.trim(),
          price: values.price,
          stock: values.stock,
          categoryId: values.categoryId,
          isActive: values.isActive,
          images: finalImages,
        });

        setFeedback({
          type: "success",
          message: `Nouveau produit "${values.name}" créé avec succès.`,
        });
      }

      setIsModalOpen(false);
      await refreshProductsList();
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Erreur d'enregistrement";
      setFeedback({
        type: "error",
        message: `Impossible d'enregistrer le produit : ${msg}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (!productToDelete) return;

    try {
      setIsDeleting(true);
      await deleteProduct(productToDelete.id);
      setFeedback({
        type: "success",
        message: `Le produit "${productToDelete.name}" a été supprimé.`,
      });
      setProductToDelete(null);
      await refreshProductsList();
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Erreur de suppression";
      setFeedback({
        type: "error",
        message: `Impossible de supprimer le produit : ${msg}`,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return true;
    return (
      p.name.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term)
    );
  });

  return (
    <div id="admin-products-container" className="space-y-6">
      {/* En-tête de page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sand pb-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-charcoal/60 block">
            Catalogue
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
            Gestion des Produits
          </h1>
          <p className="text-xs text-charcoal/70 font-body mt-0.5">
            {products.length} référence{products.length > 1 ? "s" : ""} au catalogue
          </p>
        </div>

        <button
          onClick={openCreateModal}
          id="admin-create-product-btn"
          type="button"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-accent text-charcoal font-bold text-xs sm:text-sm rounded [border-radius:2px] hover:brightness-95 active:scale-[0.99] transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau produit</span>
        </button>
      </div>

      {/* Message de notification */}
      {feedback && (
        <div
          id="admin-feedback-banner"
          className={`p-3.5 border rounded [border-radius:4px] text-xs font-body flex items-center justify-between gap-2 ${
            feedback.type === "success"
              ? "bg-success/15 border-success text-success"
              : "bg-danger/15 border-danger text-danger"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            type="button"
            className="text-current opacity-70 hover:opacity-100 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Barre de recherche */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/50" />
          <input
            type="text"
            id="admin-products-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un produit..."
            className="w-full pl-9 pr-3.5 py-2 bg-paper border border-sand rounded [border-radius:2px] text-xs text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Liste / Table des produits */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="flex items-center gap-2 font-mono text-sm text-charcoal/70">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span>Chargement des produits...</span>
          </div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-sand/15 border border-sand rounded [border-radius:4px] p-8 text-center">
          <p className="font-display font-bold text-base text-charcoal mb-1">
            Aucun produit trouvé
          </p>
          <p className="text-xs text-charcoal/70 font-body">
            {searchQuery
              ? "Aucun résultat ne correspond à votre recherche."
              : "Le catalogue est vide. Créez votre premier article."}
          </p>
        </div>
      ) : (
        <div className="bg-paper border border-sand rounded [border-radius:4px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-sand bg-sand/20 font-mono text-[11px] uppercase text-charcoal/70 tracking-wider">
                  <th className="py-3 px-4">Produit</th>
                  <th className="py-3 px-4">Catégorie</th>
                  <th className="py-3 px-4">Prix</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand/60 text-xs font-body">
                {filteredProducts.map((product) => {
                  const categoryName =
                    categories.find((c) => c.id === product.categoryId)?.name ??
                    "Général";
                  const mainImage =
                    product.images[0] ??
                    "https://picsum.photos/seed/default/400/400";

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-sand/10 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded [border-radius:2px] overflow-hidden bg-sand/20 shrink-0 border border-sand">
                            <Image
                              src={mainImage}
                              alt={product.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div>
                            <span className="font-semibold text-charcoal block line-clamp-1">
                              {product.name}
                            </span>
                            <span className="text-[11px] text-charcoal/60 font-mono">
                              ID: {product.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-charcoal/80">
                        {categoryName}
                      </td>

                      <td className="py-3 px-4 font-mono font-semibold text-primary whitespace-nowrap">
                        {product.price.toLocaleString("fr-FR")} FCFA
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`font-mono text-[11px] px-2 py-0.5 border rounded [border-radius:2px] uppercase font-semibold ${
                            product.stock === 0
                              ? "text-danger border-danger/60 bg-danger/10"
                              : product.stock <= 3
                              ? "text-accent border-accent/60 bg-paper"
                              : "text-success border-success/60 bg-paper"
                          }`}
                        >
                          {product.stock === 0
                            ? "Épuisé (0)"
                            : `${product.stock} en stock`}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`font-mono text-[11px] px-2 py-0.5 rounded [border-radius:2px] ${
                            product.isActive
                              ? "bg-success/15 text-success"
                              : "bg-charcoal/10 text-charcoal/60"
                          }`}
                        >
                          {product.isActive ? "En vente" : "Masqué"}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => openEditModal(product)}
                            id={`edit-prod-${product.id}`}
                            type="button"
                            className="p-1.5 border border-sand rounded [border-radius:2px] text-charcoal hover:text-primary hover:bg-sand/30 transition-colors cursor-pointer"
                            title="Modifier ce produit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setProductToDelete(product)}
                            id={`delete-prod-${product.id}`}
                            type="button"
                            className="p-1.5 border border-sand rounded [border-radius:2px] text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                            title="Supprimer ce produit"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modale de Création / Modification de Produit */}
      {isModalOpen && (
        <div
          id="product-edit-modal"
          className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="relative bg-paper border border-sand rounded [border-radius:4px] max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-lg my-auto">
            {/* Header Modale */}
            <div className="p-4 sm:p-5 border-b border-sand flex items-center justify-between bg-sand/15">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-charcoal/60 block">
                  {editingProduct ? "Modification" : "Nouveau"}
                </span>
                <h2 className="font-display font-bold text-lg text-charcoal">
                  {editingProduct ? `Modifier ${editingProduct.name}` : "Ajouter un produit"}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                type="button"
                className="p-1.5 text-charcoal/70 hover:text-charcoal cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulaire scrollable */}
            <form
              id="admin-product-form"
              onSubmit={handleSubmit(onSubmitProduct)}
              noValidate
              className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1"
            >
              {/* Nom */}
              <div>
                <label
                  htmlFor="product-name-input"
                  className="block font-mono text-xs uppercase font-medium text-charcoal mb-1"
                >
                  Nom de l&apos;article <span className="text-danger">*</span>
                </label>
                <input
                  id="product-name-input"
                  type="text"
                  placeholder="Ex: Tunique Wax Bogolan"
                  {...register("name")}
                  className={`w-full px-3 py-2 bg-paper border rounded [border-radius:2px] text-xs sm:text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-primary ${
                    errors.name ? "border-danger" : "border-sand"
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-danger font-medium">{errors.name.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="product-desc-input"
                  className="block font-mono text-xs uppercase font-medium text-charcoal mb-1"
                >
                  Description détaillée <span className="text-danger">*</span>
                </label>
                <textarea
                  id="product-desc-input"
                  rows={3}
                  placeholder="Matières, confection, conseils d'utilisation..."
                  {...register("description")}
                  className={`w-full px-3 py-2 bg-paper border rounded [border-radius:2px] text-xs sm:text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-primary resize-none ${
                    errors.description ? "border-danger" : "border-sand"
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-danger font-medium">{errors.description.message}</p>
                )}
              </div>

              {/* Catégorie & Statut */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="product-cat-select"
                    className="block font-mono text-xs uppercase font-medium text-charcoal mb-1"
                  >
                    Catégorie <span className="text-danger">*</span>
                  </label>
                  <select
                    id="product-cat-select"
                    {...register("categoryId")}
                    className={`w-full px-3 py-2 bg-paper border rounded [border-radius:2px] text-xs sm:text-sm text-charcoal focus:outline-none focus:border-primary ${
                      errors.categoryId ? "border-danger" : "border-sand"
                    }`}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="mt-1 text-xs text-danger font-medium">{errors.categoryId.message}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="product-active-select"
                    className="block font-mono text-xs uppercase font-medium text-charcoal mb-1"
                  >
                    Visibilité boutique
                  </label>
                  <select
                    id="product-active-select"
                    {...register("isActive", {
                      setValueAs: (v) => v === "true" || v === true,
                    })}
                    className="w-full px-3 py-2 bg-paper border border-sand rounded [border-radius:2px] text-xs sm:text-sm text-charcoal focus:outline-none focus:border-primary"
                  >
                    <option value="true">Actif (Visible en boutique)</option>
                    <option value="false">Masqué (Désactivé)</option>
                  </select>
                </div>
              </div>

              {/* Prix & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="product-price-input"
                    className="block font-mono text-xs uppercase font-medium text-charcoal mb-1"
                  >
                    Prix (FCFA) <span className="text-danger">*</span>
                  </label>
                  <input
                    id="product-price-input"
                    type="number"
                    step="100"
                    placeholder="15000"
                    {...register("price", { valueAsNumber: true })}
                    className={`w-full px-3 py-2 bg-paper border rounded [border-radius:2px] font-mono text-xs sm:text-sm text-charcoal focus:outline-none focus:border-primary ${
                      errors.price ? "border-danger" : "border-sand"
                    }`}
                  />
                  {errors.price && (
                    <p className="mt-1 text-xs text-danger font-medium">{errors.price.message}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="product-stock-input"
                    className="block font-mono text-xs uppercase font-medium text-charcoal mb-1"
                  >
                    Quantité en stock <span className="text-danger">*</span>
                  </label>
                  <input
                    id="product-stock-input"
                    type="number"
                    step="1"
                    placeholder="5"
                    {...register("stock", { valueAsNumber: true })}
                    className={`w-full px-3 py-2 bg-paper border rounded [border-radius:2px] font-mono text-xs sm:text-sm text-charcoal focus:outline-none focus:border-primary ${
                      errors.stock ? "border-danger" : "border-sand"
                    }`}
                  />
                  {errors.stock && (
                    <p className="mt-1 text-xs text-danger font-medium">{errors.stock.message}</p>
                  )}
                </div>
              </div>

              {/* Gestion des Images */}
              <div className="border-t border-dashed border-sand pt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase font-medium text-charcoal">
                    Photos du produit
                  </span>
                  <label
                    htmlFor="product-file-upload"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-sand bg-sand/30 hover:bg-sand/60 text-charcoal rounded [border-radius:2px] font-mono text-[11px] cursor-pointer transition-colors"
                  >
                    {isUploadingImage ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ImageIcon className="w-3.5 h-3.5 text-primary" />
                    )}
                    <span>Ajouter une image</span>
                  </label>
                  <input
                    id="product-file-upload"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                    disabled={isUploadingImage}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {imageUrls.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative h-20 bg-sand/20 border border-sand rounded [border-radius:2px] overflow-hidden group"
                    >
                      <Image
                        src={url}
                        alt={`Photo ${idx + 1}`}
                        fill
                        sizes="100px"
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={() => removeImageUrl(idx)}
                        className="absolute top-1 right-1 bg-charcoal/80 text-paper p-1 rounded-full opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                        title="Retirer cette photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="border-t border-sand pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-sand text-charcoal rounded [border-radius:2px] font-mono text-xs hover:bg-sand/30 transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  id="admin-save-product-btn"
                  className="px-5 py-2 bg-accent text-charcoal font-bold rounded [border-radius:2px] text-xs sm:text-sm inline-flex items-center gap-2 hover:brightness-95 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <span>Enregistrer</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modale de Confirmation de Suppression */}
      {productToDelete && (
        <div
          id="delete-confirm-modal"
          className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-paper border border-sand rounded [border-radius:4px] max-w-sm w-full p-5 space-y-4 shadow-lg">
            <div className="flex items-center gap-3 text-danger">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-display font-bold text-base text-charcoal">
                Confirmer la suppression
              </h3>
            </div>
            <p className="text-xs text-charcoal/80 font-body">
              Êtes-vous sûr de vouloir supprimer définitivement le produit{" "}
              <span className="font-semibold text-charcoal">« {productToDelete.name} »</span> ?
              Cette action est irréversible.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-sand">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
                className="px-3.5 py-1.5 border border-sand text-charcoal rounded [border-radius:2px] font-mono text-xs hover:bg-sand/30 transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                id="confirm-delete-btn"
                className="px-4 py-1.5 bg-danger text-white font-bold rounded [border-radius:2px] font-mono text-xs hover:brightness-110 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Suppression...</span>
                  </>
                ) : (
                  <span>Supprimer</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
