import { promises as fs } from "node:fs";
import path from "node:path";
import { UPLOADS_DIR } from "@/lib/server-store";

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
 * files that existed at build time, so uploads live in data/uploads and are
 * streamed from disk here instead.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;

  // Strict allow-list: "<id>.<ext>" only — blocks traversal and odd names.
  if (!/^[a-z0-9-]+\.[a-z0-9]{1,5}$/i.test(file)) {
    return new Response("Not found", { status: 404 });
  }

  const ext = file.split(".").pop()!.toLowerCase();
  const type = MIME[ext];
  if (!type) return new Response("Not found", { status: 404 });

  const candidates = [
    path.join(UPLOADS_DIR, file),
    // Legacy location: covers uploaded while files were written to public/.
    path.join(process.cwd(), "public", "uploads", file),
  ];

  for (const filePath of candidates) {
    try {
      const buffer = await fs.readFile(filePath);
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          "Content-Type": type,
          "Content-Length": String(buffer.byteLength),
          "Cache-Control": "public, max-age=31536000, immutable",
          // Defence-in-depth: never sniff-execute an uploaded file.
          "X-Content-Type-Options": "nosniff",
          "Content-Security-Policy": "default-src 'none'",
        },
      });
    } catch {
      // try next candidate
    }
  }

  return new Response("Not found", { status: 404 });
}
