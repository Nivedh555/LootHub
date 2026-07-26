"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function ProductPurchase({ product }: { product: Product }) {
  const { add, items } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);

  const inCart = items.find((i) => i.product.id === product.id)?.qty ?? 0;
  const outOfStock = product.stock <= 0;
  // How many more of this item the buyer can still add.
  const remaining = Math.max(0, product.stock - inCart);
  const maxed = !outOfStock && remaining === 0;
  const maxQty = Math.max(1, remaining);
  const safeQty = Math.min(qty, maxQty);
  const disabled = outOfStock || maxed;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3">
        <span className="font-display text-4xl text-accent">{formatPrice(product.price)}</span>
        {product.rarity && (
          <span className="mb-1 inline-flex items-center rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {product.rarity}
          </span>
        )}
        {outOfStock && (
          <span className="mb-1.5 inline-flex items-center rounded-full border border-destructive/40 px-2.5 py-0.5 text-xs font-semibold text-destructive">
            Out of stock
          </span>
        )}
        {!outOfStock && product.stock <= 5 && (
          <span className="mb-1.5 inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
            {product.stock} in stock
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className={cn("inline-flex items-center rounded-xl border border-border bg-surface", disabled && "opacity-50")}>
          <button
            type="button"
            aria-label="Decrease quantity"
            disabled={disabled || safeQty <= 1}
            onClick={() => setQty(Math.max(1, safeQty - 1))}
            className="flex h-12 w-12 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            <Minus className="h-4 w-4" />
          </button>
          <input
            readOnly
            value={safeQty}
            aria-label="Quantity"
            className="w-12 bg-transparent text-center font-semibold outline-none"
          />
          <button
            type="button"
            aria-label="Increase quantity"
            disabled={disabled || safeQty >= maxQty}
            onClick={() => setQty(Math.min(maxQty, safeQty + 1))}
            className="flex h-12 w-12 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <Button
          size="lg"
          variant="primary"
          disabled={disabled}
          onClick={() => add(product, safeQty)}
        >
          <ShoppingBag className="h-5 w-5" /> {maxed ? "Max in cart" : "Add to cart"}
        </Button>
        <Button
          size="lg"
          variant="accent"
          disabled={outOfStock}
          onClick={() => {
            if (!maxed) add(product, safeQty);
            router.push("/checkout");
          }}
        >
          <Zap className="h-5 w-5" /> Buy now
        </Button>
      </div>

      {outOfStock && (
        <p className="text-sm text-muted-foreground">
          This item is currently out of stock. Join the Discord to ask about restocks.
        </p>
      )}
      {maxed && (
        <p className="text-sm text-muted-foreground">
          All available stock of this item is already in your cart.
        </p>
      )}
    </div>
  );
}
