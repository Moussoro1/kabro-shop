import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { ImgHTMLAttributes } from "react";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { CartSummaryCard } from "@/components/cart/CartSummaryCard";
import { CartEmptyState } from "@/components/cart/CartEmptyState";
import type { CartItem } from "@/context/CartContext";

// Mock next/image dans l'environnement Vitest jsdom
vi.mock("next/image", () => ({
  default: ({ fill, ...props }: ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt ?? ""} data-fill={fill ? "true" : undefined} />;
  },
}));

describe("CartItemRow component", () => {
  const sampleItem: CartItem = {
    productId: "prod-wax-1",
    name: "Robe Longue en Tissu Wax Africain - Motif Bogolan Traditionnel",
    price: 15000,
    quantity: 2,
    image: "https://picsum.photos/seed/wax/600/600",
  };

  it("affiche correctement le nom du produit, le prix unitaire et le sous-total", () => {
    const onUpdate = vi.fn();
    const onRemove = vi.fn();

    render(
      <CartItemRow
        item={sampleItem}
        onUpdateQuantity={onUpdate}
        onRemoveItem={onRemove}
      />
    );

    // Titre
    expect(screen.getByText(sampleItem.name)).toBeInTheDocument();
    // Prix unitaire
    expect(screen.getByText(/15\s*000\s*FCFA/)).toBeInTheDocument();
    // Sous-total (15 000 * 2 = 30 000 FCFA)
    expect(screen.getAllByText(/30\s*000/).length).toBeGreaterThan(0);
  });

  it("incrémente la quantité lors du clic sur le bouton plus", () => {
    const onUpdate = vi.fn();
    const onRemove = vi.fn();

    render(
      <CartItemRow
        item={sampleItem}
        onUpdateQuantity={onUpdate}
        onRemoveItem={onRemove}
      />
    );

    const plusBtn = screen.getByLabelText(`Augmenter la quantité de ${sampleItem.name}`);
    fireEvent.click(plusBtn);

    expect(onUpdate).toHaveBeenCalledWith("prod-wax-1", 3);
  });

  it("décrémente la quantité lors du clic sur le bouton moins", () => {
    const onUpdate = vi.fn();
    const onRemove = vi.fn();

    render(
      <CartItemRow
        item={sampleItem}
        onUpdateQuantity={onUpdate}
        onRemoveItem={onRemove}
      />
    );

    const minusBtn = screen.getByLabelText(`Diminuer la quantité de ${sampleItem.name}`);
    fireEvent.click(minusBtn);

    expect(onUpdate).toHaveBeenCalledWith("prod-wax-1", 1);
  });

  it("désactive le bouton moins lorsque la quantité est égale à 1", () => {
    const onUpdate = vi.fn();
    const onRemove = vi.fn();

    render(
      <CartItemRow
        item={{ ...sampleItem, quantity: 1 }}
        onUpdateQuantity={onUpdate}
        onRemoveItem={onRemove}
      />
    );

    const minusBtn = screen.getByLabelText(`Diminuer la quantité de ${sampleItem.name}`);
    expect(minusBtn).toBeDisabled();

    fireEvent.click(minusBtn);
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it("appelle la suppression lors du clic sur la poubelle avec un aria-label contextuel", () => {
    const onUpdate = vi.fn();
    const onRemove = vi.fn();

    render(
      <CartItemRow
        item={sampleItem}
        onUpdateQuantity={onUpdate}
        onRemoveItem={onRemove}
      />
    );

    const removeBtn = screen.getByLabelText(`Supprimer ${sampleItem.name} du panier`);
    expect(removeBtn).toBeInTheDocument();

    fireEvent.click(removeBtn);
    expect(onRemove).toHaveBeenCalledWith("prod-wax-1");
  });

  it("applique les dimensions tactiles recommandées (au moins 44px) sur les boutons interactifs", () => {
    const onUpdate = vi.fn();
    const onRemove = vi.fn();

    render(
      <CartItemRow
        item={sampleItem}
        onUpdateQuantity={onUpdate}
        onRemoveItem={onRemove}
      />
    );

    const minusBtn = screen.getByLabelText(`Diminuer la quantité de ${sampleItem.name}`);
    const plusBtn = screen.getByLabelText(`Augmenter la quantité de ${sampleItem.name}`);
    const removeBtn = screen.getByLabelText(`Supprimer ${sampleItem.name} du panier`);

    expect(minusBtn.className).toContain("min-w-[44px]");
    expect(minusBtn.className).toContain("min-h-[44px]");
    expect(plusBtn.className).toContain("min-w-[44px]");
    expect(plusBtn.className).toContain("min-h-[44px]");
    expect(removeBtn.className).toContain("min-w-[44px]");
    expect(removeBtn.className).toContain("min-h-[44px]");
  });
});

describe("CartSummaryCard component", () => {
  it("affiche le nombre d'articles, le total formaté et le lien vers le checkout", () => {
    render(<CartSummaryCard totalAmount={45000} totalItems={3} />);

    expect(screen.getByText(/45\s*000\s*FCFA/)).toBeInTheDocument();
    expect(screen.getByText(/3 articles/)).toBeInTheDocument();

    const checkoutLink = screen.getByRole("link", { name: /Passer la commande/i });
    expect(checkoutLink).toHaveAttribute("href", "/checkout");

    const continueLink = screen.getByRole("link", { name: /Continuer mes achats/i });
    expect(continueLink).toHaveAttribute("href", "/products");
  });
});

describe("CartEmptyState component", () => {
  it("affiche le message d'accueil et le bouton de redirection vers la boutique", () => {
    render(<CartEmptyState />);

    expect(screen.getByText("Votre panier est vide")).toBeInTheDocument();
    const browseLink = screen.getByRole("link", { name: /Découvrir la boutique/i });
    expect(browseLink).toHaveAttribute("href", "/products");
  });
});
