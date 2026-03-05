
'use server';

import { seedDatabase } from "@/lib/firebase/services";
import { MOCK_PRODUCTS } from "@/app/lib/mock-data";

export async function runSeeding() {
  try {
    const success = await seedDatabase(MOCK_PRODUCTS);
    return { success, message: success ? "Database seeded successfully!" : "Database already has data." };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
