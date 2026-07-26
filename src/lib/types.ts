export type Game =
  | "Adopt Me!"
  | "Murder Mystery 2"
  | "Grow a Garden"
  | "Grow a Garden 2"
  | "Steal a Brainrot"
  | "Donut SMP";

export interface Product {
  id: string;
  title: string;
  game: Game;
  price: number;
  rarity?: string;
  stock: number;
  description: string;
  tags: string[];
  coverSeed: string;
  image?: string;
  featured?: boolean;
  local?: boolean;
}