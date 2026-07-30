import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import {
  addProduct,
  getAllProducts,
  saveUploadedImage,
} from "@/lib/server-store";
import { games } from "@/config/games";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import type { Game, Product } from "@/lib/types";

export const dynamic = "force-dynamic";

const MAX_BODY_SIZE = 10 * 1024 * 1024; // 10 MB multipart cap

export async function GET(request: Request) {
  // Rate limit public catalog reads: 60 per IP per minute.
  if (!rateLimit(`products:get:${clientIp(request)}`, 60, 60_000)) {
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429 },
    );
  }

  const products = await getAllProducts();
  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  // Enforce body size limit BEFORE parsing multipart.
  const len = Number(request.headers.get("content-length") ?? 0);
  if (len > MAX_BODY_SIZE) {
    return NextResponse.json({ error: "Payload too large." }, { status: 413 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data." }, { status: 400 });
  }

  const title = String(form.get("title") ?? "").trim();
  const gameRaw = String(form.get("game") ?? "").trim();
  const priceRaw = String(form.get("price") ?? "").trim();
  const stockRaw = String(form.get("stock") ?? "").trim();
  const rarity = String(form.get("rarity") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const tagsRaw = String(form.get("tags") ?? "").trim();
  const image = form.get("image");

  // Input length caps
  if (title.length > 120) {
    return NextResponse.json({ error: "Title too long (max 120 characters)." }, { status: 400 });
  }
  if (description.length > 5000) {
    return NextResponse.json({ error: "Description too long (max 5000 characters)." }, { status: 400 });
  }
  if (rarity.length > 40) {
    return NextResponse.json({ error: "Rarity too long (max 40 characters)." }, { status: 400 });
  }
  if (tagsRaw.length > 500) {
    return NextResponse.json({ error: "Tags too long (max 500 characters)." }, { status: 400 });
  }

  if (!title) return NextResponse.json({ error: "Title is required." }, { status: 400 });
  if (!games.includes(gameRaw as Game)) {
    return NextResponse.json({ error: "Unknown game." }, { status: 400 });
  }
  const price = Number(priceRaw);
  if (Number.isNaN(price) || price < 0.5) {
    return NextResponse.json({ error: "Price must be at least $0.50." }, { status: 400 });
  }
  const stock = Math.max(1, Math.floor(Number(stockRaw) || 1));
  if (!description) {
    return NextResponse.json({ error: "Description is required." }, { status: 400 });
  }

  const id = `item-${Date.now().toString(36)}`;
  const imageFile = image instanceof File && image.size > 0 ? image : null;
  if (imageFile && imageFile.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "Image must be under 8 MB." }, { status: 400 });
  }

  // Server-side magic-byte validation (ignore client-reported MIME type).
  if (imageFile) {
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const valid = isValidImageMagicBytes(buffer);
    if (!valid) {
      return NextResponse.json({ error: "Cover must be a valid image file." }, { status: 400 });
    }
  }

  const imagePath = imageFile ? await saveUploadedImage(id, imageFile) : undefined;

  const product: Product = {
    id,
    title,
    game: gameRaw as Game,
    price,
    rarity: rarity || undefined,
    stock,
    description,
    tags: tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    coverSeed: title,
    image: imagePath,
    featured: false,
  };

  await addProduct(product);
  return NextResponse.json({ product }, { status: 201 });
}

/** Validate image file by magic bytes (PNG, JPEG, GIF, WebP, AVIF). */
function isValidImageMagicBytes(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;
  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return true;
  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return true;
  // GIF: GIF87a or GIF89a
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) return true;
  // WebP: RIFF....WEBP
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) return true;
  // AVIF: ftyp....avif or ftyp....avis
  const ftyp = buffer.indexOf("ftyp");
  if (ftyp !== -1 && buffer.slice(ftyp, ftyp + 16).toString().includes("avif")) return true;
  return false;
}
