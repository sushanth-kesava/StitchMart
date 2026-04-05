"use client";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShoppingCart, 
  Heart, 
  Download, 
  Star, 
  ShieldCheck, 
  Truck, 
  Sparkles,
  RefreshCw,
  AlertCircle,
  Upload
} from "lucide-react";
import Image from "next/image";
import { useRef, useState, use, useEffect } from "react";
import { embroideryDesignVisualizer } from "@/ai/flows/embroidery-design-visualizer";
import { Product } from "@/app/lib/mock-data";
import Link from "next/link";
import { getProductByIdFromBackend } from "@/lib/api/products";
import { addProductToCart, ProductCustomization } from "@/lib/cart";
import { checkDeliveryByPincode } from "@/lib/api/delivery";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type DeliveryResult =
  | {
      status: "idle";
      message: string;
    }
  | {
      status: "checking";
      message: string;
    }
  | {
      status: "available";
      message: string;
      district: string;
      state: string;
      eta: string;
      shipping: string;
      codSupported: boolean;
      prepaidSupported: boolean;
    }
  | {
      status: "unavailable";
      message: string;
    }
  | {
      status: "invalid";
      message: string;
    };

function getMaterialLabel(productCategory: string) {
  if (productCategory === "Hoodies") return "Heavyweight 400 GSM cotton fleece";
  if (productCategory === "Blouses") return "Silk-blend base fabric";
  if (productCategory === "Embroidery Designs") return "Digital design pack";
  return "Premium-grade base fabric";
}

function getProductHighlights(productCategory: string) {
  if (productCategory === "Hoodies") {
    return [
      "Warm, structured base that holds embroidery well",
      "Clean stitching zones for chest and sleeve placements",
      "Designed for long wear, gifting, and custom branding",
    ];
  }

  if (productCategory === "Blouses") {
    return [
      "Elegant drape suited for festive and occasion wear",
      "Refined surface for traditional or minimal embroidery",
      "Easy to customize with monograms, motifs, and borders",
    ];
  }

  return [
    "Professional base selected for clean embroidery results",
    "Balanced fabric feel for better finish and durability",
    "Well-suited for custom designs and repeated wear",
  ];
}

function getCareNotes(productCategory: string) {
  if (productCategory === "Hoodies") {
    return ["Machine wash inside out in cold water", "Do not iron directly on embroidery", "Tumble dry low or air dry for best results"];
  }

  if (productCategory === "Blouses") {
    return ["Prefer gentle hand wash or delicate cycle", "Store folded to protect embellishment", "Use low heat if ironing is required"];
  }

  return ["Use a gentle wash cycle", "Avoid direct heat on stitched areas", "Dry in shade to preserve color and finish"];
}

export default function ProductDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getProductByIdFromBackend(id);
        setProduct(data);
      } catch (err: any) {
        setError(err?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    void loadProduct();
  }, [id]);

  const [visualizing, setVisualizing] = useState(false);
  const [visualizedImg, setVisualizedImg] = useState<string | null>(null);
  const [openCustomizer, setOpenCustomizer] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [referencePreview, setReferencePreview] = useState<string | null>(null);
  const [referenceFileName, setReferenceFileName] = useState<string | null>(null);
  const [deliveryPincode, setDeliveryPincode] = useState("");
  const [deliveryResult, setDeliveryResult] = useState<DeliveryResult>({
    status: "idle",
    message: "Check delivery availability by entering your 6-digit pincode.",
  });
  const [customization, setCustomization] = useState<ProductCustomization>({
    fabricColor: "Black",
    threadColor: "Gold",
    symbol: "Lotus Mandala",
    size: "Medium",
    placement: "Left Chest",
    notes: "",
    referenceImage: undefined as string | undefined,
    referenceImageName: undefined as string | undefined,
  });

  const symbols = ["Lotus Mandala", "Peacock Crest", "Floral Vine", "Royal Monogram", "Om Motif"];
  const threadColors = ["Gold", "Silver", "Ruby Red", "Emerald", "Royal Blue", "Ivory"];
  const fabricColors = ["Black", "Navy", "White", "Maroon", "Forest Green", "Beige"];
  const placements = ["Left Chest", "Center Chest", "Sleeve", "Back", "Pocket"];

  const handleReferenceUpload = (file: File | undefined) => {
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      if (!result) {
        return;
      }

      setReferencePreview(result);
      setReferenceFileName(file.name);
      setCustomization((prev) => ({
        ...prev,
        referenceImage: result,
        referenceImageName: file.name,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddCustomizedItem = () => {
    if (!product) return;

    addProductToCart(product, quantity, {
      ...customization,
      notes: customization.notes?.trim() || undefined,
    });
    setOpenCustomizer(false);
    setQuantity(1);
    setReferencePreview(null);
    setReferenceFileName(null);
  };

  const handleDeliveryCheck = async () => {
    setDeliveryResult({ status: "checking", message: "Checking delivery availability..." });

    const normalized = deliveryPincode.trim();
    if (!/^\d{6}$/.test(normalized)) {
      setDeliveryResult({
        status: "invalid",
        message: "Enter a valid 6-digit Indian pincode.",
      });
      return;
    }

    try {
      const result = await checkDeliveryByPincode(normalized);

      if (!result.available) {
        setDeliveryResult({
          status: "unavailable",
          message: result.message || "Delivery is not currently available for this pincode.",
        });
        return;
      }

      setDeliveryResult({
        status: "available",
        message: result.message || "Delivery is available for this pincode.",
        district: result.district || "Unknown",
        state: result.state || "Unknown",
        eta: result.eta || "2-7 business days",
        shipping: result.shipping || "Shipping calculated at checkout",
        codSupported: Boolean(result.codSupported),
        prepaidSupported: Boolean(result.prepaidSupported),
      });
    } catch (checkError: any) {
      setDeliveryResult({
        status: "unavailable",
        message: checkError?.message || "Unable to verify delivery right now. Please try again.",
      });
    }
  };

  const handleVisualize = async () => {
    if (!product) return;
    setVisualizing(true);
    try {
      const result = await embroideryDesignVisualizer({
        garmentImage: product.image,
        embroideryDesignImage: product.image,
        fabricType: "cotton",
        fabricColor: "neutral"
      });
      if (result.visualizedImage) {
        setVisualizedImg(result.visualizedImage);
      }
    } catch (err) {
      console.error("Visualization failed", err);
    } finally {
      setVisualizing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <RefreshCw className="h-12 w-12 text-primary animate-spin" />
          <p className="text-muted-foreground font-medium">Fetching product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-6">
          <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center">
            <AlertCircle className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold font-headline">Product Not Found</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              We couldn't find the product you're looking for. It might have been removed or the ID is incorrect.
            </p>
          </div>
          <Button asChild className="rounded-full px-8 h-12">
            <Link href="/marketplace">Back to Marketplace</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Image Display */}
          <div className="space-y-6">
            <div className="relative aspect-square rounded-[40px] overflow-hidden bg-muted border shadow-2xl group">
              <Image 
                src={visualizedImg || product.image} 
                alt={product.name} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {visualizedImg && (
                <div className="absolute top-6 left-6">
                  <Badge className="bg-primary/90 backdrop-blur-md shadow-xl border-none px-4 py-2 text-sm font-bold flex items-center gap-2">
                    <Sparkles className="h-4 w-4" /> AI Preview
                  </Badge>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              {[product.image, "https://picsum.photos/seed/alt1/600/600", "https://picsum.photos/seed/alt2/600/600"].map((img, i) => (
                <button 
                  key={i}
                  type="button"
                  title={`Preview image ${i + 1}`}
                  aria-label={`Preview image ${i + 1}`}
                  onClick={() => setVisualizedImg(null)}
                  className="relative aspect-square rounded-2xl overflow-hidden border-2 border-transparent hover:border-primary transition-all opacity-80 hover:opacity-100"
                >
                  <Image src={img} alt={`${product.name} ${i}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col space-y-10">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-none uppercase tracking-widest px-4 py-1 font-bold">{product.category}</Badge>
                <div className="flex items-center gap-1.5 text-accent">
                  <Star className="h-5 w-5 fill-current" />
                  <span className="font-bold text-foreground text-lg">{product.rating}</span>
                  <span className="text-muted-foreground text-sm">(Verified Purchases)</span>
                </div>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold font-headline leading-tight">{product.name}</h1>
              
              <div className="flex items-center gap-6">
                <span className="text-4xl font-bold text-primary">₹{(product.price * 80).toLocaleString()}</span>
                <Badge className="bg-green-500/10 text-green-600 border-none px-4 py-1 text-sm font-bold">In Stock: {product.stock}</Badge>
              </div>
              
              <p className="text-xl text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            <div className="p-8 rounded-[32px] bg-card border border-border/50 shadow-sm space-y-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="flex-1 h-14 rounded-2xl text-lg font-bold border-primary/40 text-primary hover:bg-primary/5 transition-all"
                >
                  <Link
                    href="/cart"
                    onClick={() => {
                      addProductToCart(product, 1);
                    }}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                  </Link>
                </Button>
                <Button asChild size="lg" className="flex-1 h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
                  <Link
                    href="/cart"
                    onClick={() => {
                      addProductToCart(product, 1);
                    }}
                  >
                    Buy Now
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 rounded-2xl border-primary/20 text-primary hover:bg-primary/5 px-6">
                  <Heart className="h-6 w-6" />
                </Button>
              </div>

              {product.category === 'Embroidery Designs' && (
                <Button 
                  onClick={handleVisualize} 
                  disabled={visualizing}
                  variant="secondary"
                  className="w-full h-14 rounded-2xl bg-secondary text-white font-bold text-lg hover:bg-secondary/90 transition-all flex items-center justify-center gap-3"
                >
                  {visualizing ? <RefreshCw className="h-6 w-6 animate-spin" /> : <Sparkles className="h-6 w-6" />}
                  {visualizing ? "Magic in progress..." : "Try with AI Visualizer"}
                </Button>
              )}

              {product.customizable && (
                <Button
                  onClick={() => setOpenCustomizer(true)}
                  variant="secondary"
                  className="w-full h-14 rounded-2xl bg-secondary text-white font-bold text-lg hover:bg-secondary/90 transition-all flex items-center justify-center gap-3"
                >
                  <Upload className="h-6 w-6" />
                  Customize This Product
                </Button>
              )}

              <div className="rounded-3xl border border-border/50 bg-muted/20 p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-lg">Delivery Check</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Check whether we can deliver this product to your area and see the estimated timeline before placing the order.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    value={deliveryPincode}
                    onChange={(e) => setDeliveryPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    maxLength={6}
                    inputMode="numeric"
                    placeholder="Enter 6-digit pincode"
                    aria-label="Delivery pincode"
                    className="h-12 rounded-2xl"
                  />
                  <Button className="h-12 rounded-2xl px-6" onClick={handleDeliveryCheck}>
                    Check
                  </Button>
                </div>

                <div className={`rounded-2xl border px-4 py-3 text-sm ${deliveryResult.status === "available" ? "border-green-200 bg-green-50 text-green-800" : deliveryResult.status === "unavailable" || deliveryResult.status === "invalid" ? "border-amber-200 bg-amber-50 text-amber-900" : "border-border bg-background text-muted-foreground"}`}>
                  <p className="font-medium">{deliveryResult.message}</p>
                  {deliveryResult.status === "available" && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-xs uppercase tracking-wider opacity-70">Coverage</p>
                        <p className="font-semibold">{deliveryResult.district}, {deliveryResult.state}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider opacity-70">ETA</p>
                        <p className="font-semibold">{deliveryResult.eta}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider opacity-70">Shipping</p>
                        <p className="font-semibold">{deliveryResult.shipping}</p>
                      </div>
                    </div>
                  )}
                  {deliveryResult.status === "available" && (
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className={`rounded-full px-3 py-1 ${deliveryResult.codSupported ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-700"}`}>
                        {deliveryResult.codSupported ? "COD available" : "COD unavailable"}
                      </span>
                      <span className={`rounded-full px-3 py-1 ${deliveryResult.prepaidSupported ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-700"}`}>
                        {deliveryResult.prepaidSupported ? "Prepaid available" : "Prepaid unavailable"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-center gap-5 p-4 rounded-2xl bg-muted/30 border border-border/40">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm shrink-0">
                  <Truck className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold">Fast Delivery</p>
                  <p className="text-xs text-muted-foreground">3-5 days across India</p>
                </div>
              </div>
              <div className="flex items-center gap-5 p-4 rounded-2xl bg-muted/30 border border-border/40">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm shrink-0">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold">Quality Guaranteed</p>
                  <p className="text-xs text-muted-foreground">Premium materials only</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Tabs */}
        <div className="mt-32">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-auto p-0 mb-12 gap-8 overflow-x-auto">
              {["details", "specs", "reviews"].map(tab => (
                <TabsTrigger 
                  key={tab}
                  value={tab} 
                  className="rounded-none border-b-4 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-4 px-4 font-bold text-xl uppercase tracking-widest transition-all"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="details" className="max-w-none space-y-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="rounded-3xl border-border/50 shadow-sm">
                  <CardContent className="p-6 space-y-3">
                    <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">At a Glance</p>
                    <h3 className="text-2xl font-bold">Product Summary</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p><span className="font-semibold text-foreground">Material:</span> {getMaterialLabel(product.category)}</p>
                      <p><span className="font-semibold text-foreground">Category:</span> {product.category}</p>
                      <p><span className="font-semibold text-foreground">Stock:</span> {product.stock} units available</p>
                      <p><span className="font-semibold text-foreground">Rating:</span> {product.rating}/5</p>
                      <p><span className="font-semibold text-foreground">Customization:</span> {product.customizable ? "Enabled" : "Not available"}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-border/50 shadow-sm lg:col-span-2">
                  <CardContent className="p-6 space-y-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Product Story</p>
                    <h3 className="text-2xl font-bold">Why this product stands out</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Crafted with precision and inspired by India's rich textile heritage, this product is designed for customers who want a dependable base with a premium finish. It balances comfort, durability, and embroidery readiness so your final piece looks intentional from day one.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {getProductHighlights(product.category).map((item) => (
                        <div key={item} className="rounded-2xl bg-muted/40 p-4 text-sm text-muted-foreground">
                          {item}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="rounded-3xl border-border/50 shadow-sm">
                  <CardContent className="p-6 space-y-3">
                    <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Care</p>
                    <h3 className="text-2xl font-bold">Fabric & Care</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                      {getCareNotes(product.category).map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-border/50 shadow-sm">
                  <CardContent className="p-6 space-y-3">
                    <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Shipping</p>
                    <h3 className="text-2xl font-bold">Delivery Promise</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                      <li>Dispatch within 24-48 hours for in-stock items.</li>
                      <li>Delivery times depend on your pincode and service zone.</li>
                      <li>Delivery check above gives the latest availability status.</li>
                      <li>Packaging is designed to keep products clean and crease-free.</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="specs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: "Material", value: getMaterialLabel(product.category) },
                  { label: "Category", value: product.category },
                  { label: "Dealer Location", value: "Surat, India" },
                  { label: "Compatibility", value: product.category === "Embroidery Designs" ? "Digital download" : "Industrial & Home Machines" },
                  { label: "Availability", value: product.stock > 0 ? "In stock" : "Out of stock" },
                  { label: "Customization", value: product.customizable ? "Available" : "Not available" },
                ].map((spec, i) => (
                  <div key={i} className="flex justify-between gap-4 py-5 border-b border-border/50">
                    <span className="text-muted-foreground font-medium text-lg">{spec.label}</span>
                    <span className="font-bold text-lg text-right">{spec.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-3xl border border-border/50 bg-muted/20 p-6">
                <h3 className="text-xl font-bold mb-3">What you get</h3>
                <p className="text-muted-foreground">
                  {product.category === "Embroidery Designs"
                    ? "A ready-to-use digital design package with high-quality assets for embroidery workflows."
                    : "A premium base piece selected for custom embroidery, personalization, and long-term wear."}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <Card className="rounded-3xl border-border/50 shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-2xl font-bold">Customer feedback snapshot</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { label: "Finish", value: "Clean and premium" },
                      { label: "Comfort", value: "Wearable all day" },
                      { label: "Customization", value: "Easy to personalize" },
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl bg-muted/40 p-4">
                        <p className="text-xs uppercase tracking-widest text-muted-foreground">{item.label}</p>
                        <p className="text-lg font-semibold mt-1">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This section is intentionally concise until live review data is connected.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <Dialog open={openCustomizer} onOpenChange={setOpenCustomizer}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Customize {product.name}</DialogTitle>
              <DialogDescription>
                Configure the product directly here. The AI Studio is separate and is only for building from scratch.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cloth Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {fabricColors.map((fabricColor) => (
                      <Button
                        key={fabricColor}
                        type="button"
                        variant={customization.fabricColor === fabricColor ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCustomization((prev) => ({ ...prev, fabricColor }))}
                      >
                        {fabricColor}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Thread Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {threadColors.map((threadColor) => (
                      <Button
                        key={threadColor}
                        type="button"
                        variant={customization.threadColor === threadColor ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCustomization((prev) => ({ ...prev, threadColor }))}
                      >
                        {threadColor}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Design</Label>
                <div className="flex flex-wrap gap-2">
                  {symbols.map((symbol) => (
                    <Button
                      key={symbol}
                      type="button"
                      variant={customization.symbol === symbol ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCustomization((prev) => ({ ...prev, symbol }))}
                    >
                      {symbol}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Upload Reference Photo</Label>
                <div className="rounded-2xl border border-dashed border-border p-4 space-y-3">
                  <input
                    ref={uploadInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    aria-label="Upload reference photo"
                    title="Upload reference photo"
                    onChange={(event) => handleReferenceUpload(event.target.files?.[0])}
                  />
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Upload a reference design or inspiration photo.</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, WEBP supported.</p>
                    </div>
                    <Button type="button" variant="outline" onClick={() => uploadInputRef.current?.click()}>
                      Upload Photo
                    </Button>
                  </div>
                  {referencePreview && referenceFileName && (
                    <div className="flex items-center gap-3 rounded-xl bg-muted/40 p-3">
                      <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-background border shrink-0">
                        <Image src={referencePreview} alt={referenceFileName} fill className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{referenceFileName}</p>
                        <p className="text-xs text-muted-foreground">Reference image attached</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Size</Label>
                  <div className="flex flex-wrap gap-2">
                    {(["Small", "Medium", "Large"] as const).map((size) => (
                      <Button
                        key={size}
                        type="button"
                        variant={customization.size === size ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCustomization((prev) => ({ ...prev, size }))}
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label>Placement</Label>
                  <div className="flex flex-wrap gap-2">
                    {placements.map((placement) => (
                      <Button
                        key={placement}
                        type="button"
                        variant={customization.placement === placement ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCustomization((prev) => ({ ...prev, placement }))}
                      >
                        {placement}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-notes">Special Notes</Label>
                <Textarea
                  id="product-notes"
                  placeholder="Example: keep it subtle, place the design closer to the collar, use a soft contrast thread..."
                  value={customization.notes}
                  onChange={(e) => setCustomization((prev) => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-quantity">Quantity</Label>
                <Input
                  id="product-quantity"
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => {
                    const parsed = Number(e.target.value);
                    setQuantity(Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1);
                  }}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenCustomizer(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCustomizedItem}>Add Customized Item</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
