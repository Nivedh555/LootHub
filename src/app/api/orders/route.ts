import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { createOrder, getAllOrders } from "@/lib/server-store";
import { cryptoAssets } from "@/config/payments";

export const dynamic = "force-dynamic";

/** Owner only: list all orders. */
export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  return NextResponse.json({ orders: await getAllOrders() });
}

/** Public: place an order from the checkout page. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON body." }, { status: 400 });
  }
  const raw = (body ?? {}) as { asset?: unknown; items?: unknown };

  const asset = cryptoAssets.find((a) => a.id === raw.asset);
  if (!asset) {
    return NextResponse.json({ error: "Unknown payment method." }, { status: 400 });
  }

  if (!Array.isArray(raw.items) || raw.items.length === 0 || raw.items.length > 50) {
    return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  }
  const items: { productId: string; qty: number }[] = [];
  for (const entry of raw.items) {
    const e = (entry ?? {}) as { productId?: unknown; qty?: unknown };
    const productId = typeof e.productId === "string" ? e.productId : "";
    const qty = Number(e.qty);
    if (!productId || !Number.isInteger(qty) || qty < 1 || qty > 999) {
      return NextResponse.json({ error: "Invalid cart items." }, { status: 400 });
    }
    items.push({ productId, qty });
  }

  const result = await createOrder({
    asset: asset.id,
    assetLabel: asset.label,
    items,
  });
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }
  return NextResponse.json({ order: result.order }, { status: 201 });
}
