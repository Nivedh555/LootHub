"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { PawPrint, Ghost, Sprout, Gem } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * AAA-style opening loot crate. One 10s loop:
 *  closed + floating → seams glow → lid hinges open → volumetric purple
 *  light + particles escape → item cards float up and fan out → cards
 *  sink back → lid closes.
 * Built with motion/react + CSS 3D transforms (no Lottie, no WebGL).
 */

const LOOP = 10;

// times as fractions of the loop
const T = {
  seamsOn: 0.08,
  lidOpen: 0.18,
  itemsUp: 0.3,
  itemsHold: 0.55,
  itemsDown: 0.68,
  lidClose: 0.82,
  closed: 0.94,
};

const ITEM_CARDS = [
  { icon: PawPrint, label: "Frost Dragon", tint: "#f0abfc", x: -78, r: -14, d: 0 },
  { icon: Ghost, label: "Chroma Fang", tint: "#c4b5fd", x: 0, r: 0, d: 0.12 },
  { icon: Sprout, label: "Moon Cactus", tint: "#a78bfa", x: 78, r: 14, d: 0.24 },
] as const;

const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  left: 18 + ((i * 47) % 64),
  drift: ((i * 31) % 40) - 20,
  size: 3 + ((i * 13) % 4),
  delay: (i % 7) * 0.09,
}));

export function LootCrateHero({ size = 300, className }: { size?: number; className?: string }) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const box = size * 0.56;

  // Reduced motion / SSR frame: crate open, one card shown, no loops.
  const animate = mounted && !reduced;

  return (
    <div
      className={cn("relative", className)}
      style={{ width: size, height: size * 1.18, perspective: 1200 }}
      role="img"
      aria-label="Loot crate opening to reveal in-game items"
    >
      {/* floor shadow + glow */}
      <motion.span
        aria-hidden
        className="absolute bottom-[2%] left-1/2 h-[9%] w-[72%] -translate-x-1/2 rounded-full bg-primary/50 blur-2xl"
        animate={animate ? { opacity: [0.35, 0.35, 0.9, 0.9, 0.4, 0.35], scaleX: [0.9, 0.9, 1.15, 1.15, 0.95, 0.9] } : { opacity: 0.7 }}
        transition={animate ? { duration: LOOP, repeat: Infinity, times: [0, T.seamsOn, T.itemsUp, T.itemsHold, T.lidClose, 1], ease: "easeInOut" } : undefined}
      />

      {/* volumetric light cone escaping the crate */}
      <motion.span
        aria-hidden
        className="absolute left-1/2 top-[6%] h-[58%] w-[86%] -translate-x-1/2"
        style={{
          background:
            "conic-gradient(from 180deg at 50% 100%, transparent 40deg, rgba(167,139,250,0.28) 70deg, rgba(124,58,237,0.42) 90deg, rgba(167,139,250,0.28) 110deg, transparent 140deg)",
          filter: "blur(6px)",
          maskImage: "linear-gradient(to top, rgba(0,0,0,0.9), transparent 92%)",
          WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0.9), transparent 92%)",
        }}
        initial={{ opacity: 0 }}
        animate={animate ? { opacity: [0, 0, 0.4, 1, 1, 0.3, 0, 0] } : { opacity: 0.8 }}
        transition={animate ? { duration: LOOP, repeat: Infinity, times: [0, T.seamsOn, T.lidOpen, T.itemsUp, T.itemsHold, T.itemsDown, T.lidClose, 1], ease: "easeInOut" } : undefined}
      />

      {/* particles rising with the light */}
      {PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="absolute rounded-full bg-secondary"
          style={{ left: `${p.left}%`, bottom: "34%", width: p.size, height: p.size, boxShadow: "0 0 8px rgba(167,139,250,0.9)" }}
          initial={{ opacity: 0 }}
          animate={
            animate
              ? { opacity: [0, 0, 0.9, 0], y: [0, 0, -size * 0.52, -size * 0.62], x: [0, 0, p.drift, p.drift * 1.2] }
              : { opacity: 0 }
          }
          transition={
            animate
              ? { duration: LOOP, repeat: Infinity, times: [0, T.lidOpen + p.delay * 0.05, T.itemsHold, T.itemsDown], ease: "easeOut", delay: p.delay }
              : undefined
          }
        />
      ))}

      {/* item cards floating out of the crate */}
      <div aria-hidden className="absolute left-1/2 top-[30%] z-10 -translate-x-1/2">
        {ITEM_CARDS.map((card) => (
          <motion.div
            key={card.label}
            className="absolute left-1/2 top-0 w-[92px] -translate-x-1/2 rounded-xl border border-white/15 bg-surface-2/90 p-2.5 text-center backdrop-blur-md"
            style={{ boxShadow: `0 8px 30px -8px ${card.tint}66, inset 0 0 20px rgba(124,58,237,0.15)` }}
            initial={{ opacity: 0, y: 40, scale: 0.5 }}
            animate={
              animate
                ? {
                    opacity: [0, 0, 1, 1, 0, 0],
                    y: [40, 40, -66, -74, 30, 40],
                    x: [0, 0, card.x, card.x, 0, 0],
                    scale: [0.5, 0.5, 1, 1, 0.5, 0.5],
                    rotate: [0, 0, card.r, card.r, 0, 0],
                  }
                : card.label === "Chroma Fang"
                  ? { opacity: 1, y: -70, scale: 1 }
                  : { opacity: 0 }
            }
            transition={
              animate
                ? {
                    duration: LOOP,
                    repeat: Infinity,
                    times: [0, T.lidOpen + card.d * 0.1, T.itemsUp + card.d * 0.05, T.itemsHold, T.itemsDown, 1],
                    ease: [0.22, 1, 0.36, 1],
                  }
                : undefined
            }
          >
            <card.icon className="mx-auto h-6 w-6" style={{ color: card.tint }} />
            <p className="mt-1.5 truncate font-display text-[9px] font-semibold tracking-wide text-foreground">
              {card.label}
            </p>
            <p className="text-[8px] uppercase tracking-widest" style={{ color: card.tint }}>
              <Gem className="mr-0.5 inline h-2 w-2" /> Rare
            </p>
          </motion.div>
        ))}
      </div>

      {/* the crate itself — floats as a whole */}
      <motion.div
        className="absolute left-1/2 top-[54%]"
        style={{ width: box, height: box, transformStyle: "preserve-3d", x: "-50%", y: "-50%" }}
        animate={animate ? { rotateX: -20, rotateY: [-32, -28, -32], translateY: [0, -7, 0] } : { rotateX: -20, rotateY: -32 }}
        transition={animate ? { duration: 6, repeat: Infinity, ease: "easeInOut" } : undefined}
      >
        {/* body faces */}
        {(
          [
            { t: `translateZ(${box / 2}px)`, strap: true },
            { t: `rotateY(180deg) translateZ(${box / 2}px)` },
            { t: `rotateY(-90deg) translateZ(${box / 2}px)` },
            { t: `rotateY(90deg) translateZ(${box / 2}px)`, strap: true },
            { t: `rotateX(-90deg) translateZ(${box / 2}px)` },
          ] as { t: string; strap?: boolean }[]
        ).map((f, i) => (
          <motion.span
            key={i}
            className="absolute inset-0 border-2 border-secondary/50"
            style={{
              transform: f.t,
              background: f.strap
                ? "linear-gradient(90deg, rgba(30,17,55,0.98) 42%, rgba(124,58,237,0.95) 42%, rgba(167,139,250,0.95) 58%, rgba(30,17,55,0.98) 58%), linear-gradient(165deg, rgba(46,24,90,0.95), rgba(20,11,34,0.98))"
                : "linear-gradient(165deg, rgba(46,24,90,0.95), rgba(20,11,34,0.98))",
            }}
            animate={
              animate
                ? { boxShadow: [
                    "inset 0 0 18px rgba(124,58,237,0.25)",
                    "inset 0 0 34px rgba(167,139,250,0.65)",
                    "inset 0 0 34px rgba(167,139,250,0.65)",
                    "inset 0 0 18px rgba(124,58,237,0.25)",
                  ] }
                : undefined
            }
            transition={animate ? { duration: LOOP, repeat: Infinity, times: [0, T.seamsOn, T.lidClose, 1] } : undefined}
          />
        ))}

        {/* glowing interior */}
        <span
          className="absolute inset-0"
          style={{
            transform: `rotateX(90deg) translateZ(${box / 2 - 3}px)`,
            background: "radial-gradient(circle, rgba(167,139,250,0.9), rgba(124,58,237,0.5) 45%, rgba(11,6,20,0.95) 80%)",
          }}
        />

        {/* lid — hinges backward */}
        <motion.div
          className="absolute inset-0"
          style={{ transformStyle: "preserve-3d", transformOrigin: `50% 0% ${-box / 2}px` }}
          animate={animate ? { rotateX: [0, 0, -110, -110, -110, 0, 0] } : { rotateX: -110 }}
          transition={
            animate
              ? { duration: LOOP, repeat: Infinity, times: [0, T.seamsOn, T.lidOpen, T.itemsHold, T.itemsDown, T.lidClose, 1], ease: [0.65, 0, 0.35, 1] }
              : undefined
          }
        >
          <span
            className="absolute inset-0 border-2 border-secondary/60"
            style={{
              transform: `rotateX(90deg) translateZ(${box / 2 + 2}px)`,
              background:
                "linear-gradient(90deg, rgba(30,17,55,0.98) 42%, rgba(124,58,237,0.95) 42%, rgba(167,139,250,0.95) 58%, rgba(30,17,55,0.98) 58%), linear-gradient(165deg, rgba(52,28,100,0.96), rgba(24,13,42,0.98))",
              boxShadow: "0 0 26px rgba(124,58,237,0.55), inset 0 0 20px rgba(167,139,250,0.35)",
            }}
          />
          {/* lid front lip */}
          <span
            className="absolute inset-x-0 top-0 h-[15%] border-2 border-secondary/60"
            style={{
              transform: `translateZ(${box / 2 + 2}px)`,
              background: "linear-gradient(165deg, rgba(52,28,100,0.96), rgba(24,13,42,0.98))",
            }}
          />
        </motion.div>

        {/* logo emblem on front face */}
        <span
          className="absolute left-1/2 top-1/2 h-[46%] w-[46%]"
          style={{ transform: `translate(-50%, -42%) translateZ(${box / 2 + 3}px)` }}
        >
          <Image src="/logo.png" alt="" fill sizes="120px" className="rounded-lg object-contain opacity-90" />
        </span>
      </motion.div>
    </div>
  );
}
