const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001/api";

export type OrderItemInput = {
  productId: string;
  quantity: number;
};

export type OrderItem = {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
};

export type Order = {
  id: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: string;
  createdAt: string;
};

export async function createOrderOnBackend(token: string, items: OrderItemInput[]): Promise<Order> {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ items }),
  });

  const data = await response.json();

  if (!response.ok || !data?.success) {
    throw new Error(data?.message || "Failed to place order");
  }

  return data.order as Order;
}

export async function getMyOrdersFromBackend(token: string): Promise<Order[]> {
  const response = await fetch(`${API_BASE_URL}/orders/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok || !data?.success) {
    throw new Error(data?.message || "Failed to fetch orders");
  }

  return (data.orders || []) as Order[];
}
