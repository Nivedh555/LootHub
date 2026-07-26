import { NextResponse } from "next/server";
import { setAdminCookie, verifyPasscode } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
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
