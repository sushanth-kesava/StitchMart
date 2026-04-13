import { MOCK_PRODUCTS } from "@/app/lib/mock-data";
import ProductDetailsClient from "./ProductDetailsClient";

export function generateStaticParams() {
  return MOCK_PRODUCTS.map((product) => ({ id: product.id }));
}

type ProductPageProps = {
  params: {
    id: string;
  };
};

export default function ProductPage({ params }: ProductPageProps) {
  return <ProductDetailsClient id={params.id} />;
}
