import type { Product } from "./types";

export const products: Product[] = [
  {
    id: "nfr-frost-dragon",
    title: "Neon Fly Ride Frost Dragon",
    game: "Adopt Me!",
    price: 45.0,
    rarity: "Legendary",
    stock: 2,
    description:
      "Neon Frost Dragon with Fly + Ride. Fully grown, ready to trade in Adopt Me!.",
    tags: ["neon", "fly", "ride", "dragon", "legendary"],
    coverSeed: "frost-dragon-neon",
    featured: true,
  },
  {
    id: "mfr-frost-cat",
    title: "Mega Neon Frost Cat",
    game: "Adopt Me!",
    price: 80.0,
    rarity: "Mega Neon",
    stock: 1,
    description:
      "Mega Neon Frost Cat, fully age-progressed. Instant trade at the Adoption Island.",
    tags: ["mega-neon", "cat", "legendary"],
    coverSeed: "frost-cat-mega",
  },
  {
    id: "nfr-shadow-dragon",
    title: "Neon Fly Ride Shadow Dragon",
    game: "Adopt Me!",
    price: 95.0,
    rarity: "Legendary",
    stock: 1,
    description:
      "Rare NFR Shadow Dragon. One of the most sought-after neon pets in the game.",
    tags: ["neon", "fly", "ride", "shadow", "legendary"],
    coverSeed: "shadow-dragon-neon",
    featured: true,
  },
  {
    id: "mm2-godly-niks-scythe",
    title: "Godly Knife: Nik's Scythe",
    game: "Murder Mystery 2",
    price: 30.0,
    rarity: "Godly",
    stock: 1,
    description:
      "Vintage godly scythe, one of the cleanest in circulation. Comes via safe trade.",
    tags: ["godly", "knife", "vintage", "scythe"],
    coverSeed: "mm2-niks-scythe",
    featured: true,
  },
  {
    id: "mm2-chroma-seer",
    title: "Chroma Knife: Seer",
    game: "Murder Mystery 2",
    price: 25.0,
    rarity: "Chroma",
    stock: 3,
    description:
      "Chroma Seer godly knife with rarity tag. Tradable, no dupes, fully clean.",
    tags: ["chroma", "godly", "knife", "seer"],
    coverSeed: "mm2-chroma-seer",
  },
  {
    id: "mm2-vintage-laser-gun",
    title: "Vintage Gun: Laser",
    game: "Murder Mystery 2",
    price: 18.0,
    rarity: "Vintage",
    stock: 2,
    description: "Original vintage Laser gun. Rare drop, perfect for collectors.",
    tags: ["vintage", "gun", "laser"],
    coverSeed: "mm2-laser-gun",
  },
  {
    id: "gag-lunar-seed-pack-10",
    title: "Lunar Seed Pack x10",
    game: "Grow a Garden",
    price: 5.0,
    rarity: "Epic",
    stock: 25,
    description:
      "Bundle of 10 Lunar seed packs for rare crossbreeding. Stacks in your inventory.",
    tags: ["seeds", "pack", "lunar", "epic"],
    coverSeed: "gag-lunar-seeds",
  },
  {
    id: "gag-mythical-sprout-pet",
    title: "Mythical Sprout Pet",
    game: "Grow a Garden",
    price: 12.0,
    rarity: "Mythical",
    stock: 8,
    description:
      "Mythical-tier sprout pet that boosts harvest yield. Ready to claim.",
    tags: ["pet", "mythical", "sprout"],
    coverSeed: "gag-sprout-pet",
    featured: true,
  },
  {
    id: "gag2-petal-phoenix",
    title: "Petal Phoenix Pet",
    game: "Grow a Garden 2",
    price: 15.0,
    rarity: "Legendary",
    stock: 5,
    description:
      "Petal Phoenix pet from Grow a Garden 2. Auto-water bonus across the whole plot.",
    tags: ["pet", "phoenix", "legendary"],
    coverSeed: "gag2-petal-phoenix",
    featured: true,
  },
  {
    id: "gag2-golden-hoe",
    title: "Golden Hoe Tool",
    game: "Grow a Garden 2",
    price: 7.0,
    rarity: "Rare",
    stock: 12,
    description:
      "Golden Hoe — permanent upgrade tool with 2x harvest speed. Account-bound.",
    tags: ["tool", "hoe", "rare"],
    coverSeed: "gag2-golden-hoe",
  },
  {
    id: "sab-sigma-aura",
    title: "Sigma Aura",
    game: "Steal a Brainrot",
    price: 9.0,
    rarity: "Epic",
    stock: 15,
    description:
      "Sigma Aura cosmetic that follows you around the map. Flex-tier brainrot.",
    tags: ["aura", "epic", "brainrot"],
    coverSeed: "sab-sigma-aura",
  },
  {
    id: "sab-rizz-grin-emote",
    title: "Rizz Grin Emote",
    game: "Steal a Brainrot",
    price: 4.0,
    rarity: "Rare",
    stock: 30,
    description:
      "Animated Rizz Grin emote. Unlock instantly via the in-game emote wheel.",
    tags: ["emote", "rare", "rizz"],
    coverSeed: "sab-rizz-grin",
  },
  {
    id: "dsmp-diamond-block-64",
    title: "Diamond Block x64",
    game: "Donut SMP",
    price: 8.0,
    rarity: "Rare",
    stock: 50,
    description:
      "64-stack of diamond blocks for the Donut SMP server. Delivered via chest drop.",
    tags: ["blocks", "diamond", "currency"],
    coverSeed: "dsmp-diamond-block",
  },
  {
    id: "dsmp-netherite-ingot-5",
    title: "Netherite Ingot x5",
    game: "Donut SMP",
    price: 20.0,
    rarity: "Epic",
    stock: 6,
    description:
      "Five netherite ingots pre-crafted. Gear upgrade or trade stock on the SMP.",
    tags: ["ingots", "netherite", "epic", "material"],
    coverSeed: "dsmp-netherite",
    featured: true,
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getFeatured(): Product[] {
  return products.filter((p) => p.featured);
}