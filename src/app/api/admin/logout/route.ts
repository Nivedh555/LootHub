import { NextResponse } from "next/server";
import { clearAdminCookie, isAdminRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  await clearAdminCookie();
  return NextResponse.json({ ok: true });
}
