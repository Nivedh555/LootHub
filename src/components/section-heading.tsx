"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { SPRING_SOFT, EASE_OUT_EXPO } from "@/lib/motion-tokens";

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 20, clipPath: "inset(100% 0% 0% 0%)" },
  visible: {
    opacity: 1,
    y: 0,
    clipPath: "inset(0% 0% 0% 0%)",
    transition: { duration: 0.5, ease: EASE_OUT_EXPO },
  },
};

const lineVariants: Variants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { ...SPRING_SOFT, delay: 0.15 },
  },
};

export function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={containerVariants}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
      <h2 className="mt-1 font-display text-2xl sm:text-3xl">{title}</h2>
      <motion.span
        className="mt-2 block h-1 w-5 rounded-full bg-primary origin-left"
        variants={lineVariants}
      />
    </motion.div>
  );
}
