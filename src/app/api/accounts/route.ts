import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import {
  addAccount,
  getAllAccounts,
  saveUploadedImage,
} from "@/lib/server-store";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import type { GameAccount } from "@/lib/types";

export const dynamic = "force-dynamic";

const MAX_BODY_SIZE = 10 * 1024 * 1024;

export async function GET(request: Request) {
  if (!rateLimit(`accounts:get:${clientIp(request)}`, 60, 60_000)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }
  const accounts = await getAllAccounts();
  return NextResponse.json({ accounts });
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

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
  const game = String(form.get("game") ?? "").trim();
  const platform = String(form.get("platform") ?? "").trim();
  const priceRaw = String(form.get("price") ?? "").trim();
  const stockRaw = String(form.get("stock") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const tagsRaw = String(form.get("tags") ?? "").trim();
  const image = form.get("image");

  if (title.length > 120) {
    return NextResponse.json({ error: "Title too long (max 120 characters)." }, { status: 400 });
  }
  if (description.length > 5000) {
    return NextResponse.json({ error: "Description too long (max 5000 characters)." }, { status: 400 });
  }
  if (game.length > 60 || platform.length > 60) {
    return NextResponse.json({ error: "Game or platform name too long (max 60 characters)." }, { status: 400 });
  }

  if (!title) return NextResponse.json({ error: "Title is required." }, { status: 400 });
  if (!game) return NextResponse.json({ error: "Game is required." }, { status: 400 });
  const price = Number(priceRaw);
  if (Number.isNaN(price) || price < 0.01 || price > 2000) {
    return NextResponse.json({ error: "Price must be between $0.01 and $2,000." }, { status: 400 });
  }
  const stock = Math.max(1, Math.floor(Number(stockRaw) || 1));
  if (!description) {
    return NextResponse.json({ error: "Description is required." }, { status: 400 });
  }

  const id = `acct-${Date.now().toString(36)}`;
  const imageFile = image instanceof File && image.size > 0 ? image : null;
  if (imageFile && imageFile.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "Image must be under 8 MB." }, { status: 400 });
  }

  if (imageFile) {
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const valid = isValidImageMagicBytes(buffer);
    if (!valid) {
      return NextResponse.json({ error: "Cover must be a valid image file." }, { status: 400 });
    }
  }

  const imagePath = imageFile ? await saveUploadedImage(id, imageFile) : undefined;

  const account: GameAccount = {
    id,
    title,
    game,
    platform: platform || "Standard",
    price,
    stock,
    description,
    tags: tagsRaw.split(",").map((t) => t.trim()).filter(Boolean),
    image: imagePath,
    featured: false,
  };

  await addAccount(account);
  return NextResponse.json({ account }, { status: 201 });
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
