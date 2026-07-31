import { NextResponse } from "next/server";
import { findAccountById, updateAccount } from "@/lib/server-store";
import { cryptoAssets } from "@/config/payments";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const MAX_JSON_BODY = 8 * 1024; // 8 KB

/** Public: place a direct order for a game account. */
export async function POST(request: Request) {
  // Rate limit: 3 account orders per IP per 10 minutes
  if (!rateLimit(`account-order:${clientIp(request)}`, 3, 10 * 60_000)) {
    return NextResponse.json(
      { error: "Too many orders. Try again in a few minutes." },
      { status: 429 },
    );
  }

  const len = Number(request.headers.get("content-length") ?? 0);
  if (len > MAX_JSON_BODY) {
    return NextResponse.json({ error: "Payload too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON body." }, { status: 400 });
  }
  const raw = (body ?? {}) as { accountId?: unknown; asset?: unknown };

  const accountId = typeof raw.accountId === "string" ? raw.accountId : "";
  if (!accountId) {
    return NextResponse.json({ error: "Account ID is required." }, { status: 400 });
  }

  const asset = cryptoAssets.find((a) => a.id === raw.asset);
  if (!asset) {
    return NextResponse.json({ error: "Unknown payment method." }, { status: 400 });
  }

  const account = await findAccountById(accountId);
  if (!account) {
    return NextResponse.json({ error: "Account no longer exists." }, { status: 404 });
  }
  if (account.stock <= 0) {
    return NextResponse.json({ error: "Account is sold out." }, { status: 409 });
  }

  // Decrement stock atomically
  const nextStock = account.stock - 1;
  await updateAccount(accountId, { stock: nextStock });

  // Build a lightweight order-like response for the client
  const order = {
    id: `LH-ACCT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    total: account.price,
    asset: asset.id as "usdt" | "ltc",
    assetLabel: asset.label,
    accountTitle: account.title,
  };

  return NextResponse.json({ order }, { status: 201 });
}
