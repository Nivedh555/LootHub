/**
 * Client-side image compression so covers of ANY size can be uploaded.
 * Vercel caps request bodies at ~4.5 MB, so big phone photos must be
 * shrunk in the browser before the FormData POST.
 */

const SKIP_UNDER_BYTES = 500 * 1024; // small files aren't worth recompressing
const TARGET_BYTES = 3.5 * 1024 * 1024; // safety margin under Vercel's 4.5 MB

async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  try {
    return await createImageBitmap(file);
  } catch {
    // Fallback for browsers/formats where createImageBitmap fails.
    const url = URL.createObjectURL(file);
    try {
      return await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Could not decode image"));
        img.src = url;
      });
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

async function render(
  source: ImageBitmap | HTMLImageElement,
  maxDim: number,
  quality: number,
): Promise<{ blob: Blob; ext: string } | null> {
  const w = "naturalWidth" in source ? source.naturalWidth : source.width;
  const h = "naturalHeight" in source ? source.naturalHeight : source.height;
  if (!w || !h) return null;

  const scale = Math.min(1, maxDim / Math.max(w, h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(w * scale));
  canvas.height = Math.max(1, Math.round(h * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);

  // webp first; old Safari returns null for webp → fall back to jpeg.
  const webp = await toBlob(canvas, "image/webp", quality);
  if (webp && webp.type === "image/webp") return { blob: webp, ext: "webp" };
  const jpeg = await toBlob(canvas, "image/jpeg", quality);
  if (jpeg) return { blob: jpeg, ext: "jpg" };
  return null;
}

/**
 * Compress an image file for upload. Returns the original file when
 * compression isn't needed or isn't possible (server cap is the backstop).
 * Throws only for GIFs that are too large to pass through unmodified.
 */
export async function compressImage(file: File): Promise<File> {
  // Canvas would flatten GIF animation — pass through if small enough.
  if (file.type === "image/gif") {
    if (file.size > 4 * 1024 * 1024) {
      throw new Error("GIFs must be under 4 MB (animations can't be compressed).");
    }
    return file;
  }

  if (file.size < SKIP_UNDER_BYTES) return file;

  let source: ImageBitmap | HTMLImageElement;
  try {
    source = await decode(file);
  } catch {
    return file; // undecodable → let the server respond
  }

  try {
    const baseName = (file.name.replace(/\.[^.]*$/, "") || "cover").slice(0, 60);

    // Progressive fallback: normal → lower quality → smaller + lower quality.
    const attempts: Array<[number, number]> = [
      [1600, 0.85],
      [1600, 0.7],
      [1200, 0.7],
    ];
    let best: { blob: Blob; ext: string } | null = null;
    for (const [maxDim, quality] of attempts) {
      best = await render(source, maxDim, quality);
      if (!best) return file;
      if (best.blob.size <= TARGET_BYTES) break;
    }
    if (!best) return file;

    return new File([best.blob], `${baseName}.${best.ext}`, { type: best.blob.type });
  } finally {
    if ("close" in source) source.close();
  }
}
