import Image from "next/image";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Flat two-tone arcade palettes: [base, accent block]. No gradients — pixel art is flat. */
const palettes: [string, string][] = [
  ["#3c096c", "#ff00ff"],
  ["#240046", "#00ffff"],
  ["#5a189a", "#ffd700"],
  ["#7b2cbf", "#00ff88"],
  ["#3c096c", "#ff3355"],
  ["#240046", "#c17aff"],
  ["#5a189a", "#ff4dd2"],
  ["#7b2cbf", "#00e5a0"],
];

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function ProductCover({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  if (product.image) {
    return (
      <div className={cn("relative h-full w-full overflow-hidden", className)}>
        <Image
          src={product.image}
          alt={`${product.title} cover art`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
          unoptimized
        />
      </div>
    );
  }

  const seed = hash(product.coverSeed);
  const [base, accent] = palettes[seed % palettes.length];
  const blockX = (seed % 100) / 100;
  const blockY = ((seed >> 3) % 100) / 100;
  // Press Start 2P is very wide \u2014 keep the title short so it never overruns the frame.
  const title =
    product.title.length > 17 ? product.title.slice(0, 16) + "\u2026" : product.title;
  const game =
    product.game.length > 16 ? product.game.slice(0, 15) + "\u2026" : product.game;
  // Snap block positions to an 8px grid so every edge lands on a "pixel".
  const snap = (n: number) => Math.round(n / 8) * 8;

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      <svg
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        role="img"
        aria-label={`${product.title} cover art`}
      >
        <rect width="400" height="300" fill={base} />
        {/* Flat pixel blocks — sharp corners, grid-snapped */}
        <rect
          x={snap(24 + blockX * 176)}
          y={snap(24 + blockY * 96)}
          width="96"
          height="96"
          fill={accent}
          fillOpacity="0.9"
        />
        <rect
          x={snap(176 + blockX * 144)}
          y={snap(112 + blockY * 72)}
          width="64"
          height="64"
          fill="#1a0033"
          fillOpacity="0.5"
        />
        <rect
          x={snap(288 - blockX * 72)}
          y={snap(48 + blockY * 64)}
          width="48"
          height="48"
          fill={accent}
          fillOpacity="0.45"
        />
        {/* Bottom plate keeps the labels legible over any block */}
        <rect x="0" y="216" width="400" height="84" fill="#1a0033" fillOpacity="0.88" />
        <rect x="0" y="216" width="400" height="4" fill={accent} />
        <text
          x="16"
          y="36"
          fontFamily="'Press Start 2P', monospace"
          fontSize="10"
          fill={accent}
        >
          {game.toUpperCase()}
        </text>
        <text
          x="16"
          y="252"
          fontFamily="'Press Start 2P', monospace"
          fontSize="14"
          fill="#f8f5ff"
        >
          {title}
        </text>
        {product.rarity && (
          <text
            x="16"
            y="280"
            fontFamily="'Chakra Petch', sans-serif"
            fontSize="14"
            fill="#c0a8e8"
          >
            {product.rarity}
          </text>
        )}
      </svg>
    </div>
  );
}