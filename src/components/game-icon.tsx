import { gameMeta } from "@/config/games";
import type { Game } from "@/lib/types";
import { PawPrint, Ghost, Sprout, Carrot, Brain, Server, Package, type LucideIcon } from "lucide-react";

const GAME_ICONS: Record<Game, LucideIcon> = {
  "Adopt Me!": PawPrint,
  "Murder Mystery 2": Ghost,
  "Grow a Garden": Sprout,
  "Grow a Garden 2": Carrot,
  "Steal a Brainrot": Brain,
  "Donut SMP": Server,
};

export function getGameIcon(game: Game): LucideIcon {
  return GAME_ICONS[game] ?? Package;
}

export { gameMeta };