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
    color: "#ff4dd2",
    glow: "rgba(255, 77, 210, 0.2)",
    icon: "/games/adopt-me.png",
  },
  "Murder Mystery 2": {
    platform: "Roblox",
    slug: "mm2",
    blurb: "Godly & chroma knives",
    color: "#ff3355",
    glow: "rgba(255, 51, 85, 0.2)",
    icon: "/games/mm2.png",
  },
  "Grow a Garden": {
    platform: "Roblox",
    slug: "grow-a-garden",
    blurb: "Seeds, sprouts & pets",
    color: "#00ff88",
    glow: "rgba(0, 255, 136, 0.2)",
    icon: "/games/grow-a-garden.png",
  },
  "Grow a Garden 2": {
    platform: "Roblox",
    slug: "grow-a-garden-2",
    blurb: "Pets, tools & harvest",
    color: "#00e5a0",
    glow: "rgba(0, 229, 160, 0.2)",
    icon: "/games/grow-a-garden-2.png",
  },
  "Steal a Brainrot": {
    platform: "Roblox",
    slug: "steal-a-brainrot",
    blurb: "Auras, emotes & skins",
    color: "#c17aff",
    glow: "rgba(193, 122, 255, 0.2)",
    icon: "/games/steal-a-brainrot.png",
  },
  "Donut SMP": {
    platform: "Minecraft",
    slug: "donut-smp",
    blurb: "Blocks, gear & material",
    color: "#ffd700",
    glow: "rgba(255, 215, 0, 0.2)",
    icon: "/games/donut-smp.png",
  },
};
