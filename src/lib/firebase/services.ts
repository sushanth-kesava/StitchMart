
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where, 
  addDoc, 
  serverTimestamp,
  orderBy,
  limit
} from "firebase/firestore";
import { db } from "./config";
import { Product, CATEGORIES } from "@/app/lib/mock-data";

export async function getProducts(categoryFilter?: string | null) {
  const productsCol = collection(db, 'products');
  let q = query(productsCol, orderBy('createdAt', 'desc'));
  
  if (categoryFilter) {
    q = query(productsCol, where('category', '==', categoryFilter), orderBy('createdAt', 'desc'));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
}

export async function getProductById(id: string) {
  const docRef = doc(db, 'products', id);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() } as Product;
  }
  return null;
}

export async function getCategories() {
  // In a real app, this might be a collection, but using the constant is fine for now
  return CATEGORIES;
}

export async function seedDatabase(products: any[]) {
  const productsCol = collection(db, 'products');
  const existing = await getDocs(productsCol);
  
  if (existing.empty) {
    for (const product of products) {
      await addDoc(productsCol, {
        ...product,
        createdAt: serverTimestamp(),
      });
    }
    return true;
  }
  return false;
}
