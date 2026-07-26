import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { removeOrder, updateOrderStatus } from "@/lib/server-store";
import type { OrderStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUSES: OrderStatus[] = ["awaiting-payment", "fulfilled", "cancelled"];

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/orders/[id]">,
) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON body." }, { status: 400 });
  }
  const status = (body as { status?: unknown })?.status;
  if (typeof status !== "string" || !STATUSES.includes(status as OrderStatus)) {
    return NextResponse.json({ error: "Unknown status." }, { status: 400 });
  }

  const order = await updateOrderStatus(id, status as OrderStatus);
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  return NextResponse.json({ order });
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/orders/[id]">,
) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const { id } = await ctx.params;
  await removeOrder(id);
  return NextResponse.json({ ok: true });
}
