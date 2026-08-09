"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Coins,
  ArrowRight,
  Clock,
  Wallet,
  MessagesSquare,
  Package,
  ReceiptText,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { cryptoAssets } from "@/config/payments";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { PaymentInstructions, type PaymentOrder } from "@/components/payment-instructions";

const PENDING_KEY = "loothub:pending-order";

export default function CheckoutPage() {
  const { items, subtotal, count, clear, sync } = useCart();
  const [assetId, setAssetId] = useState(cryptoAssets[0].id);
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);
  const [order, setOrder] = useState<PaymentOrder | null>(null);
  const [restored, setRestored] = useState(false);

  // Restore an unfinished payment screen after a refresh, so the buyer
  // doesn't lose their order ID and payment details.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(PENDING_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Restoring sessionStorage-backed order after refresh; one-shot hydration pattern.
      if (raw) setOrder(JSON.parse(raw) as PaymentOrder);
    } catch {
      // ignore
    }
    setRestored(true);
    // Reconcile the cart with live stock before the buyer places an order.
    void sync();
  }, [sync]);

  async function placeOrder() {
    if (placing) return;
    setPlacing(true);
    setPlaceError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asset: assetId,
          items: items.map((i) => ({ productId: i.product.id, qty: i.qty })),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        order?: PaymentOrder;
        error?: string;
      };
      if (!res.ok || !data.order) {
        setPlaceError(
          data.error ??
            "Could not place the order. Please try again or contact us on Discord.",
        );
        // Stock likely changed under us — pull the cart back in line.
        if (res.status === 409) void sync();
        return;
      }
      const placed: PaymentOrder = {
        id: data.order.id,
        total: data.order.total,
        asset: data.order.asset,
        assetLabel: data.order.assetLabel,
      };
      try {
        sessionStorage.setItem(PENDING_KEY, JSON.stringify(placed));
      } catch {
        // ignore
      }
      setOrder(placed);
      clear();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setPlaceError("Network error — check your connection and try again.");
    } finally {
      setPlacing(false);
    }
  }

  function finishOrder() {
    try {
      sessionStorage.removeItem(PENDING_KEY);
    } catch {
      // ignore
    }
    setOrder(null);
  }

  if (!restored) return null;

  // ---------- Step 2: payment instructions for a placed order ----------
  if (order) {
    return (
      <PaymentInstructions
        order={order}
        onDone={finishOrder}
      />
    );
  }

  // ---------- Empty cart ----------
  if (count === 0) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-6 py-24 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Wallet className="h-8 w-8" />
        </span>
        <h1 className="font-display text-2xl">Nothing to check out</h1>
        <p className="max-w-md text-muted-foreground">
          Add items to your cart first, then pay with USDT (BEP20) or Litecoin and open a
          Discord ticket.
        </p>
        <Link href="/browse" className={buttonVariants({ variant: "accent", size: "lg" })}>
          Browse items <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  // ---------- Step 1: review cart + choose payment method ----------
  const asset = cryptoAssets.find((a) => a.id === assetId) ?? cryptoAssets[0];
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="mb-2 font-display text-3xl sm:text-4xl">Checkout</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Step 1 of 2 — review your order and choose a payment method. You&apos;ll get
        payment details on the next step.
      </p>

      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <section>
          <h2 className="mb-4 font-display text-lg">Order review</h2>
          <div className="space-y-2 rounded-2xl border border-border bg-card p-5">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-b-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.product.title}</p>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Package className="h-3 w-3 text-secondary" aria-hidden />
                    {item.product.game} · {item.qty} × {formatPrice(item.product.price)}
                  </p>
                </div>
                <span className="text-sm">{formatPrice(item.product.price * item.qty)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-border pt-3 font-display text-base">
              <span>Total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm">
              <MessagesSquare className="h-5 w-5 text-[#8a93f5]" />
              Delivered via Discord
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm">
              <Clock className="h-5 w-5 text-secondary" />
              Fast on confirm
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-display text-lg">Payment method</h2>

          <div className="grid grid-cols-2 gap-3">
            {cryptoAssets.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setAssetId(a.id)}
                className={cn(
                  "flex flex-col gap-1 rounded-2xl border p-4 text-left transition-all",
                  a.id === assetId
                    ? "border-primary bg-primary/10 shadow-[0_0_0_1px_rgba(124,58,237,0.5)]"
                    : "border-border bg-card hover:border-primary/50",
                )}
              >
                <span className="flex items-center gap-2 font-display">
                  <Coins className="h-4 w-4 text-primary" /> {a.symbol}
                </span>
                <span className="text-xs text-muted-foreground">{a.network}</span>
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-border bg-card p-6">
            <h3 className="font-display text-base">How it works</h3>
            <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary">1.</span> Place your order — you&apos;ll
                get an order ID and the {asset.symbol} payment details.
              </li>
              <li className="flex gap-2">
                <span className="text-primary">2.</span> Send the exact amount on the{" "}
                {asset.network} network.
              </li>
              <li className="flex gap-2">
                <span className="text-primary">3.</span> Open a Discord ticket with your
                order ID. We verify the payment on the blockchain and trade your items
                in-game.
              </li>
            </ol>

            <Button
              type="button"
              size="lg"
              variant="success"
              className="mt-6 w-full justify-center"
              onClick={placeOrder}
              disabled={placing}
            >
              <ReceiptText className="h-5 w-5" />
              {placing ? "Placing order…" : `Place order · ${formatPrice(subtotal)}`}
            </Button>
            {placeError && (
              <p
                className="mt-3 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-center text-sm text-destructive"
                role="alert"
              >
                {placeError}
              </p>
            )}
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Your items are reserved while the order awaits payment.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
