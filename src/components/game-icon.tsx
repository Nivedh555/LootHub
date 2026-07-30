import Image from "next/image";
import { gameMeta } from "@/config/games";
import type { Game } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Official game icon (Roblox game icons / Donut SMP server icon) served
 * from public/games/. Sized via className (e.g. "h-6 w-6").
 */
export function GameIcon({
  game,
  className,
}: {
  game: Game;
  className?: string;
}) {
  const meta = gameMeta[game];
  return (
    <Image
      src={meta.icon}
      alt={`${game} icon`}
      width={64}
      height={64}
      unoptimized
      className={cn("rounded-none object-cover", className)}
    />
  );
}

export { gameMeta };
