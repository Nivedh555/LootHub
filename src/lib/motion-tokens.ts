export const SPRING_SNAPPY = { type: "spring" as const, stiffness: 420, damping: 30 };
export const SPRING_SOFT = { type: "spring" as const, stiffness: 260, damping: 26 };
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
export const DURATIONS = { fast: 0.18, base: 0.3, slow: 0.5 } as const;
