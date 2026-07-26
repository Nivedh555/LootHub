import type { Game } from "@/lib/types";

export const games: Game[] = [
  "Adopt Me!",
  "Murder Mystery 2",
  "Grow a Garden",
  "Grow a Garden 2",
  "Steal a Brainrot",
  "Donut SMP",
];

export const gameMeta: Record<Game, { platform: string; slug: string; blurb: string }> = {
  "Adopt Me!": { platform: "Roblox", slug: "adopt-me", blurb: "Pets, neon & mega rides" },
  "Murder Mystery 2": { platform: "Roblox", slug: "mm2", blurb: "Godly & chroma knives" },
  "Grow a Garden": { platform: "Roblox", slug: "grow-a-garden", blurb: "Seeds, sprouts & pets" },
  "Grow a Garden 2": { platform: "Roblox", slug: "grow-a-garden-2", blurb: "Pets, tools & harvest" },
  "Steal a Brainrot": { platform: "Roblox", slug: "steal-a-brainrot", blurb: "Auras, emotes & skins" },
  "Donut SMP": { platform: "Minecraft", slug: "donut-smp", blurb: "Blocks, gear & material" },
};