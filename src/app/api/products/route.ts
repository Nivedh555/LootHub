import { NextResponse } from "next/server";
import { adminPasscode } from "@/config/admin";
import {
  addUploadedProduct,
  getUploadedProducts,
  saveUploadedImage,
} from "@/lib/server-store";
import { games } from "@/config/games";
import type { Game, Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const products = await getUploadedProducts();
  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data." }, { status: 400 });
  }

  const passcode = String(form.get("passcode") ?? "");
  if (!passcode || passcode !== adminPasscode) {
    return NextResponse.json({ error: "Invalid passcode." }, { status: 401 });
  }

  const title = String(form.get("title") ?? "").trim();
  const gameRaw = String(form.get("game") ?? "").trim();
  const priceRaw = String(form.get("price") ?? "").trim();
  const stockRaw = String(form.get("stock") ?? "").trim();
  const rarity = String(form.get("rarity") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const tagsRaw = String(form.get("tags") ?? "").trim();
  const image = form.get("image");

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
    local: true,
  };

  await addUploadedProduct(product);
  return NextResponse.json({ product }, { status: 201 });
}