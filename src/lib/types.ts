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

export interface GameAccount {
  id: string;
  title: string;
  game: string;
  platform: string;
  price: number;
  stock: number;
  description: string;
  tags: string[];
  image?: string;
  featured?: boolean;
}

export type OrderStatus = "awaiting-payment" | "fulfilled" | "cancelled";

export interface OrderLine {
  productId: string;
  title: string;
  game: Game;
  unitPrice: number;
  qty: number;
}

export interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;
  asset: "usdt" | "ltc";
  assetLabel: string;
  total: number;
  lines: OrderLine[];
}
