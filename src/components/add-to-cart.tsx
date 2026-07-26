"use client";

import { useState } from "react";
import { ShoppingBag, Check, Ban } from "lucide-react";
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
  const { add, items } = useCart();
  const [state, setState] = useState<"idle" | "added" | "maxed">("idle");

  const inCart = items.find((i) => i.product.id === product.id)?.qty ?? 0;
  const outOfStock = product.stock <= 0;
  const maxed = !outOfStock && inCart >= product.stock;

  if (outOfStock) {
    return (
      <Button size={size} variant="outline" disabled aria-label={`${product.title} is out of stock`}>
        <Ban className="h-4 w-4" /> Out of stock
      </Button>
    );
  }

  return (
    <Button
      size={size}
      variant={variant}
      disabled={maxed}
      aria-label={maxed ? `Maximum stock of ${product.title} already in cart` : `Add ${product.title} to cart`}
      onClick={() => {
        const ok = add(product, qty);
        setState(ok ? "added" : "maxed");
        window.setTimeout(() => setState("idle"), 1500);
      }}
    >
      {state === "added" ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
      {maxed ? "Max in cart" : state === "added" ? "Added" : label}
    </Button>
  );
}
