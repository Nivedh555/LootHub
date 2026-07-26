"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShoppingBag, Check, Ban, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/types";

/** Buy Now + Add to Cart pair used on product cards. */
export function CardActions({ product }: { product: Product }) {
  const router = useRouter();
  const { add, items } = useCart();
  const [state, setState] = useState<"idle" | "added" | "maxed">("idle");

  const inCart = items.find((i) => i.product.id === product.id)?.qty ?? 0;
  const outOfStock = product.stock <= 0;
  const maxed = !outOfStock && inCart >= product.stock;

  if (outOfStock) {
    return (
      <Button size="sm" variant="outline" disabled className="w-full" aria-label={`${product.title} is out of stock`}>
        <Ban className="h-4 w-4" /> Out of stock
      </Button>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <Button
        size="sm"
        variant="primary"
        aria-label={`Buy ${product.title} now`}
        onClick={() => {
          if (!maxed) add(product, 1);
          router.push("/checkout");
        }}
      >
        <Zap className="h-4 w-4" /> Buy now
      </Button>
      <Button
        size="sm"
        variant="glass"
        disabled={maxed}
        aria-label={maxed ? `Maximum stock of ${product.title} already in cart` : `Add ${product.title} to cart`}
        onClick={() => {
          const ok = add(product, 1);
          setState(ok ? "added" : "maxed");
          window.setTimeout(() => setState("idle"), 1500);
        }}
      >
        {state === "added" ? <Check className="h-4 w-4 text-success" /> : <ShoppingBag className="h-4 w-4" />}
        {maxed ? "Max" : state === "added" ? "Added" : "Add"}
      </Button>
    </div>
  );
}
