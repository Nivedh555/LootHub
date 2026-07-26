import { Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

interface Review {
  name: string;
  game: string;
  rating: number;
  text: string;
}

const reviews: Review[] = [
  {
    name: "xX_QualityKid_Xx",
    game: "Adopt Me!",
    rating: 5,
    text: "Got my NFR Frost Dragon in under 5 minutes after paying in LTC. Owner was super chill on Discord, traded it no problem.",
  },
  {
    name: "MM2_Collector",
    game: "Murder Mystery 2",
    rating: 5,
    text: "Bought Nik's Scythe godly. Clean trade, no dupes, exactly as described. This is my go-to store now.",
  },
  {
    name: "GardenGamer",
    game: "Grow a Garden",
    rating: 5,
    text: "10 lunar seed packs arrived fast. The Discord ticket system made it really easy to coordinate the trade.",
  },
  {
    name: "BrainrotKing",
    game: "Steal a Brainrot",
    rating: 4,
    text: "Sigma Aura looks insane in-game. USDT payment went smooth, took maybe 10 minutes from cart to claim.",
  },
  {
    name: "DonutMiner",
    game: "Donut SMP",
    rating: 5,
    text: "Ordered 5 netherite ingots for the SMP. Owner dropped them in my chest same day. Legit store.",
  },
  {
    name: "AdoptMePro",
    game: "Adopt Me!",
    rating: 5,
    text: "Mega Neon Frost Cat was exactly as advertised. Crypto checkout is so much easier than other sites I've used.",
  },
];

function ReviewCard({ r }: { r: Review }) {
  return (
    <figure className="flex w-80 shrink-0 flex-col gap-3 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 font-display text-primary">
          {r.name.charAt(0).toUpperCase()}
        </span>
        <div>
          <p className="font-semibold text-sm">{r.name}</p>
          <p className="text-xs text-muted-foreground">{r.game}</p>
        </div>
      </div>
      <div className="flex items-center gap-0.5" aria-label={`${r.rating} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-4 w-4",
              i < r.rating ? "fill-amber-300 text-amber-300" : "text-muted-foreground/40",
            )}
            aria-hidden
          />
        ))}
      </div>
      <blockquote className="flex gap-2 text-sm text-muted-foreground">
        <Quote className="h-4 w-4 shrink-0 text-primary/50" aria-hidden />
        <span>{r.text}</span>
      </blockquote>
    </figure>
  );
}

export function Reviews() {
  const loop = [...reviews, ...reviews];
  return (
    <div className="marquee">
      <div className="marquee-track gap-5">
        {loop.map((r, i) => (
          <ReviewCard key={`${r.name}-${i}`} r={r} />
        ))}
      </div>
    </div>
  );
}