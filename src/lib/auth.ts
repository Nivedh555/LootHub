import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Owner passcode. Read server-side only — it is never sent to the browser.
 * Set ADMIN_PASSCODE in .env.local. (NEXT_PUBLIC_ADMIN_PASSCODE is accepted
 * for backwards compatibility but ADMIN_PASSCODE is preferred.)
 */
const envPasscode =
  process.env.ADMIN_PASSCODE ?? process.env.NEXT_PUBLIC_ADMIN_PASSCODE;
const FALLBACK_PASSCODE = "loothub-owner";

export const adminPasscode =
  envPasscode && envPasscode.length > 0 ? envPasscode : FALLBACK_PASSCODE;
export const adminIsCustom = Boolean(envPasscode && envPasscode.length > 0);

/** Secret for signing session tokens. Falls back to a passcode-derived key. */
const secret =
  process.env.SESSION_SECRET && process.env.SESSION_SECRET.length > 0
    ? process.env.SESSION_SECRET
    : `loothub-session::${adminPasscode}`;

const COOKIE_NAME = "loothub_admin";
const SESSION_HOURS = 12;

function sign(expiresAt: number): string {
  return createHmac("sha256", secret).update(String(expiresAt)).digest("hex");
}

export function createSessionToken(): { token: string; maxAge: number } {
  const expiresAt = Date.now() + SESSION_HOURS * 3600_000;
  return {
    token: `${expiresAt}.${sign(expiresAt)}`,
    maxAge: SESSION_HOURS * 3600,
  };
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const expiresAt = Number(token.slice(0, dot));
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;
  const given = token.slice(dot + 1);
  const expected = sign(expiresAt);
  if (given.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(given, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

export function verifyPasscode(passcode: string): boolean {
  const a = Buffer.from(passcode);
  const b = Buffer.from(adminPasscode);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** True when the current request carries a valid owner session cookie. */
export async function isAdminRequest(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(COOKIE_NAME)?.value);
}

export async function setAdminCookie(): Promise<void> {
  const { token, maxAge } = createSessionToken();
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
}

export async function clearAdminCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
