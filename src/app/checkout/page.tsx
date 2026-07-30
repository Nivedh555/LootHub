"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import {
  Copy,
  Check,
  Coins,
  ArrowRight,
  Clock,
  Wallet,
  MessagesSquare,
  Package,
  ReceiptText,
  TriangleAlert,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { useCart } from "@/lib/cart-context";
import { cryptoAssets } from "@/config/payments";
import { discord } from "@/config/site";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PlacedOrder {
  id: string;
  total: number;
  asset: "usdt" | "ltc";
  assetLabel: string;
}

const PENDING_KEY = "loothub:pending-order";

export default function CheckoutPage() {
  const { items, subtotal, count, clear, sync } = useCart();
  const toast = useToast();
  const [assetId, setAssetId] = useState(cryptoAssets[0].id);
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);
  const [order, setOrder] = useState<PlacedOrder | null>(null);
  const [restored, setRestored] = useState(false);

  // Restore an unfinished payment screen after a refresh, so the buyer
  // doesn't lose their order ID and payment details.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(PENDING_KEY);
      // One-time restore from an external store; the `restored` gate below
      // keeps the first client render null, so no hydration mismatch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setOrder(JSON.parse(raw) as PlacedOrder);
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
        order?: PlacedOrder;
        error?: string;
      };
      if (!res.ok || !data.order) {
        const message =
          data.error ??
          "Could not place the order. Please try again or contact us on Discord.";
        setPlaceError(message);
        toast.error(message);
        // Stock likely changed under us — pull the cart back in line.
        if (res.status === 409) void sync();
        return;
      }
      const placed: PlacedOrder = {
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
      const message = "Network error — check your connection and try again.";
      setPlaceError(message);
      toast.error(message);
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
    const asset = cryptoAssets.find((a) => a.id === order.asset) ?? cryptoAssets[0];
    return (
      <PaymentInstructions
        order={order}
        asset={asset}
        onDone={finishOrder}
      />
    );
  }

  // ---------- Empty cart ----------
  if (count === 0) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-6 py-24 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-none border-2 border-primary bg-surface text-primary pixel-shadow-dark">
          <Wallet className="h-8 w-8" aria-hidden />
        </span>
        <h1 className="font-display text-lg text-pixel sm:text-xl">Nothing to check out</h1>
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
      <h1 className="mb-3 font-display text-xl text-pixel sm:text-2xl">Checkout</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Step 1 of 2 — review your order and choose a payment method. You&apos;ll get
        payment details on the next step.
      </p>

      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <section>
          <h2 className="mb-4 font-display text-sm leading-relaxed">Order review</h2>
          <div className="space-y-2 rounded-none border-2 border-border bg-card p-5">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center justify-between gap-3 border-b-2 border-border py-3 last:border-b-0 last:pb-0"
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
            <div className="flex justify-between border-t-2 border-border pt-3 font-display text-xs">
              <span>Total</span>
              <span className="text-accent">{formatPrice(subtotal)}</span>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2 rounded-none border-2 border-border bg-surface px-4 py-3 text-sm">
              <MessagesSquare className="h-5 w-5 text-[#8a93f5]" aria-hidden />
              Delivered via Discord
            </div>
            <div className="flex items-center gap-2 rounded-none border-2 border-border bg-surface px-4 py-3 text-sm">
              <Clock className="h-5 w-5 text-secondary" aria-hidden />
              Fast on confirm
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-display text-sm leading-relaxed">Payment method</h2>

          <div className="grid grid-cols-2 gap-3">
            {cryptoAssets.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setAssetId(a.id)}
                aria-pressed={a.id === assetId}
                className={cn(
                  "flex cursor-pointer flex-col gap-1.5 rounded-none border-2 p-4 text-left transition-colors",
                  a.id === assetId
                    ? "border-primary bg-primary/10 pixel-shadow-dark"
                    : "border-border bg-card hover:border-secondary",
                )}
              >
                <span className="flex items-center gap-2 font-display text-[10px] uppercase">
                  <Coins className={cn("h-4 w-4", a.id === assetId ? "text-primary" : "text-secondary")} aria-hidden />{" "}
                  {a.symbol}
                </span>
                <span className="text-xs text-muted-foreground">{a.network}</span>
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-none border-2 border-border bg-card p-6 pixel-shadow-dark">
            <h3 className="font-display text-xs leading-relaxed">How it works</h3>
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
                className="mt-3 rounded-none border-2 border-destructive bg-destructive/10 p-3 text-center text-sm text-destructive"
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

function PaymentInstructions({
  order,
  asset,
  onDone,
}: {
  order: PlacedOrder;
  asset: (typeof cryptoAssets)[number];
  onDone: () => void;
}) {
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedOrder, setCopiedOrder] = useState(false);

  async function copy(text: string, set: (v: boolean) => void) {
    try {
      await navigator.clipboard.writeText(text);
      set(true);
      window.setTimeout(() => set(false), 1600);
    } catch {
      // clipboard blocked; user can still select manually
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="rounded-none border-2 border-border bg-card p-6 pixel-shadow-dark sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-none border-2 border-success bg-background text-success">
            <ReceiptText className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <h1 className="font-display text-base leading-relaxed text-pixel sm:text-lg">Order placed</h1>
            <p className="text-sm text-muted-foreground">
              Step 2 of 2 — complete your {asset.symbol} payment
            </p>
          </div>
        </div>

        {/* Order summary */}
        <div className="mt-6 rounded-none border-2 border-border bg-surface p-4 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Order ID</span>
            <span className="inline-flex items-center gap-2">
              <span className="font-display text-[10px] text-secondary">{order.id}</span>
              <button
                type="button"
                onClick={() => copy(order.id, setCopiedOrder)}
                className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-none border-2 border-border text-muted-foreground transition-colors hover:border-secondary hover:text-foreground"
                aria-label="Copy order ID"
              >
                {copiedOrder ? (
                  <Check className="h-3.5 w-3.5 text-success" aria-hidden />
                ) : (
                  <Copy className="h-3.5 w-3.5" aria-hidden />
                )}
              </button>
            </span>
          </div>
          <div className="mt-2 flex justify-between">
            <span className="text-muted-foreground">Amount due</span>
            <span className="font-display text-[10px] text-accent">{formatPrice(order.total)} in {asset.symbol}</span>
          </div>
          <div className="mt-2 flex justify-between">
            <span className="text-muted-foreground">Method</span>
            <span>{order.assetLabel}</span>
          </div>
          <div className="mt-2 flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className="inline-flex items-center gap-1.5 text-accent">
              <Clock className="h-3.5 w-3.5" aria-hidden /> Awaiting payment
            </span>
          </div>
        </div>

        {/* Payment details */}
        <div className="mt-5 flex flex-col items-center gap-4 rounded-none border-2 border-border bg-surface p-5">
          <div className="rounded-none border-2 border-accent bg-[#1a0033] p-3">
            <QRCodeSVG
              value={asset.deepLink(order.total)}
              size={172}
              level="M"
              marginSize={2}
              bgColor="#1a0033"
              fgColor="#f8f5ff"
            />
          </div>
          <div className="w-full">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Wallet address</span>
              <Badge variant="muted">{asset.network}</Badge>
            </div>
            <div className="mt-2 flex items-center gap-2 rounded-none border-2 border-border bg-background p-3">
              <code className="flex-1 break-all text-sm">{asset.address}</code>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => copy(asset.address, setCopiedAddress)}
                className="shrink-0"
              >
                {copiedAddress ? (
                  <Check className="h-4 w-4 text-success" aria-hidden />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden />
                )}
                {copiedAddress ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
          <p className="flex items-start gap-2 rounded-none border-2 border-accent bg-accent/10 p-3 text-left text-xs text-accent">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            Send only {asset.symbol} on the {asset.network} network. Funds sent on the
            wrong network cannot be recovered.
          </p>
        </div>

        {/* Next steps */}
        <div className="mt-5 space-y-2 text-sm text-muted-foreground">
          <p className="flex gap-2">
            <span className="text-primary">1.</span> Send the equivalent of{" "}
            <span className="font-semibold text-foreground">{formatPrice(order.total)}</span>{" "}
            in {asset.symbol} to the address above.
          </p>
          <p className="flex gap-2">
            <span className="text-primary">2.</span> Open a Discord ticket and paste your
            order ID.
          </p>
          <p className="flex gap-2">
            <span className="text-primary">3.</span> We verify the payment on the
            blockchain and trade your items to you in-game.
          </p>
        </div>

        <Link
          href={discord.ticketUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: "accent", size: "lg" }),
            "mt-6 w-full justify-center",
          )}
        >
          <MessagesSquare className="h-5 w-5" /> Open a Discord ticket
        </Link>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Link
            href="/browse"
            onClick={onDone}
            className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-center")}
          >
            Keep browsing
          </Link>
          <button
            type="button"
            onClick={onDone}
            className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-center")}
          >
            Done
          </button>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Keep your order ID — it&apos;s how we match your payment to your items.
        </p>
      </div>
    </div>
  );
}
