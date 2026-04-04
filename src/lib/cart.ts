import { Product } from "@/app/lib/mock-data";

const CART_STORAGE_KEY = "stitchmart_cart";

export type CartItem = {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  category: string;
};

export function getCartItems(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function setCartItems(items: CartItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export function addProductToCart(product: Product, quantity = 1) {
  const existing = getCartItems();
  const index = existing.findIndex((item) => item.productId === product.id);

  if (index >= 0) {
    existing[index] = {
      ...existing[index],
      quantity: existing[index].quantity + quantity,
    };
  } else {
    existing.push({
      productId: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity,
      category: product.category,
    });
  }

  setCartItems(existing);
}

export function clearCart() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(CART_STORAGE_KEY);
}
