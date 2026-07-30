import type { Game } from "@/lib/types";

export const games: Game[] = [
  "Adopt Me!",
  "Murder Mystery 2",
  "Grow a Garden",
  "Grow a Garden 2",
  "Steal a Brainrot",
  "Donut SMP",
];

export const gameMeta: Record<
  Game,
  {
    platform: string;
    slug: string;
    blurb: string;
    /** Neon accent used for icons, borders and glows on game cards. */
    color: string;
    /** Translucent version of the accent for spotlight/glow layers. */
    glow: string;
    /** Official game icon served from public/games/. */
    icon: string;
  }
> = {
  "Adopt Me!": {
    platform: "Roblox",
    slug: "adopt-me",
    blurb: "Pets, neon & mega rides",
    color: "#ec4899",
    glow: "rgba(236, 72, 153, 0.35)",
    icon: "/games/adopt-me.png",
  },
  "Murder Mystery 2": {
    platform: "Roblox",
    slug: "mm2",
    blurb: "Godly & chroma knives",
    color: "#ef4444",
    glow: "rgba(239, 68, 68, 0.35)",
    icon: "/games/mm2.png",
  },
  "Grow a Garden": {
    platform: "Roblox",
    slug: "grow-a-garden",
    blurb: "Seeds, sprouts & pets",
    color: "#22c55e",
    glow: "rgba(34, 197, 94, 0.35)",
    icon: "/games/grow-a-garden.png",
  },
  "Grow a Garden 2": {
    platform: "Roblox",
    slug: "grow-a-garden-2",
    blurb: "Pets, tools & harvest",
    color: "#10b981",
    glow: "rgba(16, 185, 129, 0.35)",
    icon: "/games/grow-a-garden-2.png",
  },
  "Steal a Brainrot": {
    platform: "Roblox",
    slug: "steal-a-brainrot",
    blurb: "Auras, emotes & skins",
    color: "#8b5cf6",
    glow: "rgba(139, 92, 246, 0.35)",
    icon: "/games/steal-a-brainrot.png",
  },
  "Donut SMP": {
    platform: "Minecraft",
    slug: "donut-smp",
    blurb: "Blocks, gear & material",
    color: "#f59e0b",
    glow: "rgba(245, 158, 11, 0.35)",
    icon: "/games/donut-smp.png",
  },
};
