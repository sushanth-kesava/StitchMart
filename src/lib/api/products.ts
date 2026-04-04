import { Product } from "@/app/lib/mock-data";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001/api";

export type ProductInput = {
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  rating?: number;
  customizable?: boolean;
  fileDownloadLink?: string | null;
};

function toQueryString(params: Record<string, string | boolean | undefined>) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "undefined") {
      continue;
    }

    query.set(key, String(value));
  }

  return query.toString();
}

export async function getProductsFromBackend(filters?: {
  category?: string | null;
  search?: string;
  dealerId?: string;
  customizable?: boolean;
}): Promise<Product[]> {
  const query = toQueryString({
    category: filters?.category || undefined,
    search: filters?.search || undefined,
    dealerId: filters?.dealerId,
    customizable: typeof filters?.customizable === "boolean" ? filters.customizable : undefined,
  });

  const response = await fetch(`${API_BASE_URL}/products${query ? `?${query}` : ""}`);
  const data = await response.json();

  if (!response.ok || !data?.success) {
    throw new Error(data?.message || "Failed to fetch products");
  }

  return data.products as Product[];
}

export async function getProductByIdFromBackend(id: string): Promise<Product | null> {
  const response = await fetch(`${API_BASE_URL}/products/${id}`);

  if (response.status === 404) {
    return null;
  }

  const data = await response.json();

  if (!response.ok || !data?.success) {
    throw new Error(data?.message || "Failed to fetch product");
  }

  return data.product as Product;
}

export async function createProductOnBackend(token: string, payload: ProductInput): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok || !data?.success) {
    throw new Error(data?.message || "Failed to create product");
  }

  return data.product as Product;
}

export async function deleteProductOnBackend(token: string, productId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok || !data?.success) {
    throw new Error(data?.message || "Failed to delete product");
  }
}

export async function seedProductsOnBackend(): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/products/seed`, {
    method: "POST",
  });

  const data = await response.json();

  return {
    success: Boolean(data?.success),
    message: data?.message || "Unknown response",
  };
}
