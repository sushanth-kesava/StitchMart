
import { Product, CATEGORIES } from "@/app/lib/mock-data";
import {
  getProductsFromBackend,
  getProductByIdFromBackend,
  seedProductsOnBackend,
} from "@/lib/api/products";

export async function getProducts(categoryFilter?: string | null) {
  return getProductsFromBackend({ category: categoryFilter || undefined });
}

export async function getProductById(id: string) {
  return getProductByIdFromBackend(id);
}

export async function getCategories() {
  return CATEGORIES;
}

export async function seedDatabase(products: any[]) {
  const result = await seedProductsOnBackend();
  return result.success;
}
