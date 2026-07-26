import { NextResponse } from "next/server";
import { adminPasscode } from "@/config/admin";
import { removeUploadedProduct } from "@/lib/server-store";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: Request,
  ctx: RouteContext<"/api/products/[id]">,
) {
  const { id } = await ctx.params;
  const url = new URL(request.url);
  const passcode = url.searchParams.get("passcode") ?? "";

  if (!passcode || passcode !== adminPasscode) {
    return NextResponse.json({ error: "Invalid passcode." }, { status: 401 });
  }

  await removeUploadedProduct(id);
  return NextResponse.json({ ok: true });
}