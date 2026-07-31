import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { removeAccount, updateAccount } from "@/lib/server-store";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import type { GameAccount } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: Request,
  ctx: RouteContext<"/api/accounts/[id]">,
) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (!rateLimit(`accounts:delete:${clientIp(request)}`, 30, 60_000)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }
  const { id } = await ctx.params;
  const existed = await removeAccount(id);
  if (!existed) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/accounts/[id]">,
) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (!rateLimit(`accounts:patch:${clientIp(request)}`, 30, 60_000)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const len = Number(request.headers.get("content-length") ?? 0);
  if (len > 32 * 1024) {
    return NextResponse.json({ error: "Payload too large." }, { status: 413 });
  }

  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON body." }, { status: 400 });
  }
  const raw = (body ?? {}) as Record<string, unknown>;
  const patch: Partial<GameAccount> = {};

  if ("price" in raw) {
    const price = Number(raw.price);
    if (Number.isNaN(price) || price < 0.01 || price > 2000) {
      return NextResponse.json({ error: "Price must be between $0.01 and $2,000." }, { status: 400 });
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

  const account = await updateAccount(id, patch);
  if (!account) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }
  return NextResponse.json({ account });
}
