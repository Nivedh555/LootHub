import { getUploadedImage } from "@/lib/server-store";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// Raster formats only — SVG is deliberately excluded because it can embed
// scripts and would be a stored-XSS vector when served same-origin.
const MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
};

/**
 * Serves cover images uploaded at runtime. `next start` only serves public/
 * files that existed at build time, so uploads live in Postgres (production)
 * or data/uploads (local dev) and are streamed from here instead.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  // Rate limit file serving: 120 per IP per minute.
  if (!rateLimit(`uploads:get:${clientIp(request)}`, 120, 60_000)) {
    return new Response("Too many requests.", { status: 429 });
  }

  const { file } = await params;

  // Strict allow-list: "<id>.<ext>" only — blocks traversal and odd names.
  if (!/^[a-z0-9-]+\.[a-z0-9]{1,5}$/i.test(file)) {
    return new Response("Not found", { status: 404 });
  }

  const ext = file.split(".").pop()!.toLowerCase();
  if (!MIME[ext]) return new Response("Not found", { status: 404 });

  const image = await getUploadedImage(file);
  if (!image) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(image.bytes), {
    status: 200,
    headers: {
      "Content-Type": image.contentType,
      "Content-Length": String(image.bytes.byteLength),
      "Cache-Control": "public, max-age=31536000, immutable",
      // Defence-in-depth: never sniff-execute an uploaded file.
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'",
    },
  });
}
