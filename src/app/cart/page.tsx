"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Package } from "lucide-react";
import { ProductCover } from "@/components/product-cover";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function CartPage() {
  const { items, setQty, remove, subtotal, count, sync } = useCart();
  const toast = useToast();

  // Reconcile against the live catalog on mount: deleted/sold-out items are
  // dropped and quantities clamped to current stock.
  useEffect(() => {
    let alive = true;
    void sync().then((changed) => {
      if (alive && changed) {
        toast.toast(
          "Your cart was updated to match current availability — some items changed quantity or are no longer in stock.",
        );
      }
    });
    return () => {
      alive = false;
    };
  }, [sync, toast]);

  if (count === 0) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-6 py-24 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-none border-2 border-primary bg-surface text-primary pixel-shadow-dark">
          <ShoppingBag className="h-8 w-8" aria-hidden />
        </span>
        <h1 className="font-display text-lg text-pixel sm:text-xl">Your cart is empty</h1>
        <p className="max-w-md text-muted-foreground">
          Browse in-game items and add a few. Checkout is crypto-only with USDT (BEP20)
          or Litecoin, delivered via Discord.
        </p>
        <Link href="/browse" className={buttonVariants({ variant: "accent", size: "lg" })}>
          Browse items <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 font-display text-xl text-pixel sm:text-2xl">
        Cart <span className="text-muted-foreground">({count})</span>
      </h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <section className="space-y-3">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="flex flex-col gap-4 rounded-none border-2 border-border bg-card p-4 sm:flex-row sm:items-center"
            >
              <Link
                href={`/product/${item.product.id}`}
                className="h-24 w-24 shrink-0 overflow-hidden rounded-none border-2 border-border"
                aria-label={item.product.title}
              >
                <ProductCover product={item.product} className="h-full w-full" />
              </Link>

              <div className="flex-1 min-w-0">
                <Link
                  href={`/product/${item.product.id}`}
                  className="font-display text-[11px] leading-relaxed hover:text-primary"
                >
                  {item.product.title}
                </Link>
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 text-secondary">
                    <Package className="h-3 w-3" aria-hidden />
                    {item.product.game}
                  </span>
                  {item.product.rarity && <Badge variant="muted">{item.product.rarity}</Badge>}
                </div>
                <p className="mt-2 text-sm text-secondary">{formatPrice(item.product.price)} each</p>
              </div>

              <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                <div className="flex flex-col items-end gap-1">
                  <div className="inline-flex items-center rounded-none border-2 border-border bg-surface">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => setQty(item.product.id, item.qty - 1)}
                      className="flex h-10 w-10 cursor-pointer items-center justify-center border-r-2 border-border text-muted-foreground hover:text-foreground"
                    >
                      <Minus className="h-4 w-4" aria-hidden />
                    </button>
                    <span className="w-8 text-center font-display text-[10px]">{item.qty}</span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      disabled={item.qty >= item.product.stock}
                      onClick={() => setQty(item.product.id, item.qty + 1)}
                      className="flex h-10 w-10 cursor-pointer items-center justify-center border-l-2 border-border text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                    >
                      <Plus className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                  {item.qty >= item.product.stock && (
                    <span className="text-[11px] text-muted-foreground">
                      Max stock ({item.product.stock})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display text-xs text-accent">{formatPrice(item.product.price * item.qty)}</span>
                  <button
                    type="button"
                    onClick={() => remove(item.product.id)}
                    className="cursor-pointer text-muted-foreground transition-colors hover:text-destructive"
                    aria-label={`Remove ${item.product.title}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-none border-2 border-border bg-card p-6 pixel-shadow-dark">
            <h2 className="font-display text-sm leading-relaxed">Order summary</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Owner fee</dt>
                <dd className="text-success">$0.00</dd>
              </div>
              <div className="flex justify-between border-t-2 border-border pt-3 font-display text-xs">
                <dt>Total</dt>
                <dd className="text-accent">{formatPrice(subtotal)}</dd>
              </div>
            </dl>
            <Link
              href="/checkout"
              className={cn(buttonVariants({ variant: "accent", size: "lg" }), "mt-5 w-full justify-center")}
            >
              <ShieldCheck className="h-5 w-5" /> Checkout with crypto
            </Link>
            <Link href="/browse" className={cn(buttonVariants({ variant: "ghost" }), "mt-2 w-full justify-center")}>
              Continue shopping
            </Link>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Pay crypto, then open a Discord ticket to receive your items.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}