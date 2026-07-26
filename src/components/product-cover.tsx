import Image from "next/image";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

const palettes: [string, string][] = [
  ["#7c3aed", "#16a34a"],
  ["#22d3ee", "#7c3aed"],
  ["#f59e0b", "#dc2626"],
  ["#a78bfa", "#22d3ee"],
  ["#16a34a", "#22d3ee"],
  ["#ec4899", "#7c3aed"],
  ["#f43f5e", "#f59e0b"],
  ["#38bdf8", "#a78bfa"],
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
  const [c1, c2] = palettes[seed % palettes.length];
  const blockX = (seed % 100) / 100;
  const blockY = ((seed >> 3) % 100) / 100;
  const safeId = product.id.replace(/[^a-z0-9]/gi, "");
  const title =
    product.title.length > 26 ? product.title.slice(0, 25) + "\u2026" : product.title;

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      <svg
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        role="img"
        aria-label={`${product.title} cover art`}
      >
        <defs>
          <linearGradient id={`bg-${safeId}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={c1} />
            <stop offset="100%" stopColor={c2} />
          </linearGradient>
          <linearGradient id={`fade-${safeId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="40%" stopColor="#0b0614" stopOpacity="0" />
            <stop offset="100%" stopColor="#0b0614" stopOpacity="0.95" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill={`url(#bg-${safeId})`} />
        <rect
          x={20 + blockX * 200}
          y={26 + blockY * 116}
          width="124"
          height="124"
          rx="18"
          fill="#ffffff"
          fillOpacity="0.08"
        />
        <rect
          x={168 + blockX * 150}
          y={120 + blockY * 84}
          width="84"
          height="84"
          rx="16"
          fill="#000000"
          fillOpacity="0.14"
        />
        <circle
          cx={324 - blockX * 80}
          cy={74 + blockY * 70}
          r="44"
          fill="#ffffff"
          fillOpacity="0.1"
        />
        <rect width="400" height="300" fill={`url(#fade-${safeId})`} />
        <rect
          x="16"
          y="16"
          width={product.game.length * 7 + 16}
          height="22"
          rx="11"
          fill="#0b0614"
          fillOpacity="0.55"
        />
        <text
          x="24"
          y="32"
          fontFamily="'Russo One', sans-serif"
          fontSize="11"
          fill="#f5f0ff"
          letterSpacing="1.4"
        >
          {product.game.toUpperCase()}
        </text>
        <text x="20" y="262" fontFamily="'Russo One', sans-serif" fontSize="20" fill="#ffffff">
          {title}
        </text>
        {product.rarity && (
          <text
            x="20"
            y="284"
            fontFamily="'Chakra Petch', sans-serif"
            fontSize="12"
            fill="#a78bfa"
          >
            {product.rarity}
          </text>
        )}
      </svg>
    </div>
  );
}