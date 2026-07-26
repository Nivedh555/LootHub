import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { removeProduct, updateProduct } from "@/lib/server-store";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/products/[id]">,
) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const { id } = await ctx.params;
  await removeProduct(id);
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/products/[id]">,
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
  const raw = (body ?? {}) as Record<string, unknown>;
  const patch: Partial<Product> = {};

  if ("price" in raw) {
    const price = Number(raw.price);
    if (Number.isNaN(price) || price < 0.5) {
      return NextResponse.json({ error: "Price must be at least $0.50." }, { status: 400 });
    }
    patch.price = price;
  }
  if ("stock" in raw) {
    const stock = Math.floor(Number(raw.stock));
    if (Number.isNaN(stock) || stock < 0) {
      return NextResponse.json({ error: "Stock must be 0 or more." }, { status: 400 });
    }
    patch.stock = stock;
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const product = await updateProduct(id, patch);
  if (!product) {
    return NextResponse.json({ error: "Item not found." }, { status: 404 });
  }
  return NextResponse.json({ product });
}
