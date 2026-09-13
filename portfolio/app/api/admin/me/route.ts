import { NextResponse, type NextRequest } from "next/server";

import { forbidden, isAdminRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return forbidden();
  return NextResponse.json({ ok: true, admin: true });
}
