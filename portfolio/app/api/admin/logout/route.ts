import { NextResponse, type NextRequest } from "next/server";

import { clearedSessionCookieHeader, forbidden, isAdminRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) return forbidden();
  const res = NextResponse.json({ ok: true });
  res.headers.set("Set-Cookie", clearedSessionCookieHeader());
  return res;
}
