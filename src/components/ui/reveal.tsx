"use client";

import { useRef } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  type Variants,
  type Transition,
  type TargetAndTransition,
} from "motion/react";
import { cn } from "@/lib/utils";
import { SPRING_SOFT, SPRING_SNAPPY, EASE_OUT_EXPO } from "@/lib/motion-tokens";

type Variant = "rise" | "clip" | "scale";
type InViewMargin = NonNullable<Parameters<typeof useInView>[1]>["margin"];

const variantMap: Record<Variant, { hidden: TargetAndTransition; visible: TargetAndTransition }> = {
  rise: {
    hidden: { opacity: 0, y: 24, scale: 0.97 },
    visible: { opacity: 1, y: 0, scale: 1 },
  },
  clip: {
    hidden: { opacity: 0, y: 20, clipPath: "inset(100% 0% 0% 0%)" },
    visible: { opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)" },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1 },
  },
};

const transitionMap: Record<Variant, Transition> = {
  rise: { ...SPRING_SOFT },
  clip: { duration: 0.5, ease: EASE_OUT_EXPO },
  scale: { ...SPRING_SOFT },
};

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  variant?: Variant;
  delay?: number;
  inView?: boolean;
  inViewInViewMargin?: InViewMargin;
  once?: boolean;
  style?: React.CSSProperties;
}

export function Reveal({
  children,
  className,
  variant = "rise",
  delay = 0,
  inView = false,
  inViewInViewMargin = "-50px",
  once = true,
  style,
}: RevealProps) {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: inViewInViewMargin });
  const active = !inView || isInView;

  const v = variantMap[variant];
  const t = transitionMap[variant];

  return (
    <motion.div
      ref={ref}
      initial={reduced ? false : v.hidden}
      animate={active ? v.visible : v.hidden}
      transition={{ ...t, delay }}
      className={cn(className)}
      style={style}
    >
      {children}
    </motion.div>
  );
}

interface RevealGroupProps {
  children: React.ReactNode;
  className?: string;
  variant?: Variant;
  staggerChildren?: number;
  inView?: boolean;
  inViewInViewMargin?: InViewMargin;
  once?: boolean;
  style?: React.CSSProperties;
}

export function RevealGroup({
  children,
  className,
  variant = "scale",
  staggerChildren = 0.05,
  inView = true,
  inViewInViewMargin = "-50px",
  once = true,
  style,
}: RevealGroupProps) {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: inViewInViewMargin });
  const active = !inView || isInView;

  const v = variantMap[variant];
  const t = transitionMap[variant];

  const groupVariants: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren, delayChildren: 0 },
    },
  };

  const childVariants: Variants = {
    hidden: v.hidden,
    visible: { ...v.visible, transition: t },
  };

  return (
    <motion.div
      ref={ref}
      initial={reduced ? false : "hidden"}
      animate={active ? "visible" : "hidden"}
      variants={groupVariants}
      className={cn(className)}
      style={style}
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div key={i} variants={childVariants}>
              {child}
            </motion.div>
          ))
        : (
            <motion.div variants={childVariants}>
              {children}
            </motion.div>
          )}
    </motion.div>
  );
}

interface RevealBadgeProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  style?: React.CSSProperties;
}

export function RevealBadge({
  children,
  className,
  delay = 0,
  style,
}: RevealBadgeProps) {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={reduced ? false : { opacity: 0, scale: 0.85 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
      transition={{ ...SPRING_SNAPPY, delay }}
      className={cn("w-fit", className)}
      style={style}
    >
      {children}
    </motion.div>
  );
}
