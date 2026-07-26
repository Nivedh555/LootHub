const envPasscode =
  process.env.NEXT_PUBLIC_ADMIN_PASSCODE ?? process.env.ADMIN_PASSCODE;
const HARD_FALLBACK = "loothub-owner";

export const adminPasscode =
  envPasscode && envPasscode.length > 0 ? envPasscode : HARD_FALLBACK;
export const adminIsCustom = Boolean(envPasscode && envPasscode.length > 0);