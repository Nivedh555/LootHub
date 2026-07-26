"use client";

import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { Button } from "./ui/button";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/types";

type Size = "sm" | "md" | "lg";
type Variant = "primary" | "accent" | "outline";

export function AddToCart({
  product,
  qty = 1,
  size = "md",
  variant = "primary",
  label = "Add to cart",
}: {
  product: Product;
  qty?: number;
  size?: Size;
  variant?: Variant;
  label?: string;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <Button
      size={size}
      variant={variant}
      aria-label={`Add ${product.title} to cart`}
      onClick={() => {
        add(product, qty);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1500);
      }}
    >
      {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
      {added ? "Added" : label}
    </Button>
  );
}