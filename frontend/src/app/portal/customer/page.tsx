import { Navbar } from "@/components/navbar";
import CustomerDashboardClient from "./CustomerDashboardClient";

const recommendations = {
  recommendations: [
    {
      productId: "fallback-design-pack",
      productName: "Royal Zardosi Floral Pack",
      category: "Embroidery Designs",
      reason: "A premium design pack suited for festive and traditional customization.",
    },
    {
      productId: "fallback-thread-set",
      productName: "Vibrant Silk Thread Set",
      category: "Machine Threads",
      reason: "Versatile thread set for vibrant custom embroidery work.",
    },
  ],
};

export default function CustomerPortal() {

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans">
      <Navbar />
      <CustomerDashboardClient recommendations={recommendations} />
    </div>
  );
}
