import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { removeAccount, updateAccount, saveUploadedImage } from "@/lib/server-store";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import type { GameAccount } from "@/lib/types";

export const dynamic = "force-dynamic";

const MAX_BODY_SIZE = 10 * 1024 * 1024;

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
  if (len > MAX_BODY_SIZE) {
    return NextResponse.json({ error: "Payload too large." }, { status: 413 });
  }

  const { id } = await ctx.params;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data." }, { status: 400 });
  }

  const patch: Partial<GameAccount> = {};

  const title = String(form.get("title") ?? "").trim();
  if (title) {
    if (title.length > 120) {
      return NextResponse.json({ error: "Title too long (max 120 characters)." }, { status: 400 });
    }
    patch.title = title;
  }

  const game = String(form.get("game") ?? "").trim();
  if (game) patch.game = game;

  const platform = String(form.get("platform") ?? "").trim();
  if (platform) patch.platform = platform;

  const description = String(form.get("description") ?? "").trim();
  if (description) {
    if (description.length > 5000) {
      return NextResponse.json({ error: "Description too long (max 5000 characters)." }, { status: 400 });
    }
    patch.description = description;
  }

  const tagsRaw = String(form.get("tags") ?? "").trim();
  if (tagsRaw) patch.tags = tagsRaw.split(",").map((t) => t.trim()).filter(Boolean);

  const priceRaw = String(form.get("price") ?? "").trim();
  if (priceRaw) {
    const price = Number(priceRaw);
    if (Number.isNaN(price) || price < 0.01 || price > 2000) {
      return NextResponse.json({ error: "Price must be between $0.01 and $2,000." }, { status: 400 });
    }
    patch.price = price;
  }

  const stockRaw = String(form.get("stock") ?? "").trim();
  if (stockRaw) {
    const stock = Math.floor(Number(stockRaw));
    if (Number.isNaN(stock) || stock < 0) {
      return NextResponse.json({ error: "Stock must be 0 or more." }, { status: 400 });
    }
    patch.stock = stock;
  }

  const image = form.get("image");
  if (image instanceof File && image.size > 0) {
    if (image.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be under 8 MB." }, { status: 400 });
    }
    const buffer = Buffer.from(await image.arrayBuffer());
    const valid = isValidImageMagicBytes(buffer);
    if (!valid) {
      return NextResponse.json({ error: "Cover must be a valid image file." }, { status: 400 });
    }
    const imagePath = await saveUploadedImage(id, image);
    patch.image = imagePath;
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

function isValidImageMagicBytes(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return true;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return true;
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) return true;
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) return true;
  const ftyp = buffer.indexOf("ftyp");
  if (ftyp !== -1 && buffer.slice(ftyp, ftyp + 16).toString().includes("avif")) return true;
  return false;
}
