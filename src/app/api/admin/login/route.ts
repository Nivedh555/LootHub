import { NextResponse } from "next/server";
import { adminLoginEnabled, setAdminCookie, verifyPasscode } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // Brute-force guard: 5 attempts per IP per 15 minutes.
  if (!rateLimit(`login:${clientIp(request)}`, 5, 15 * 60_000)) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429 },
    );
  }

  // Refuse the well-known demo passcode in production deployments.
  if (!adminLoginEnabled) {
    return NextResponse.json(
      { error: "Admin login is disabled: set ADMIN_PASSCODE on the server." },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON body." }, { status: 400 });
  }
  const passcode =
    typeof body === "object" && body !== null && "passcode" in body
      ? String((body as { passcode: unknown }).passcode ?? "")
      : "";

  if (!passcode || !verifyPasscode(passcode)) {
    return NextResponse.json({ error: "Wrong passcode." }, { status: 401 });
  }

  await setAdminCookie();
  return NextResponse.json({ ok: true });
}
