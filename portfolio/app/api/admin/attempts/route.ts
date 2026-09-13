import { NextResponse, type NextRequest } from "next/server";

import { forbidden, isAdminRequest } from "@/lib/auth";
import { attemptsCollection } from "@/lib/mongo";

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return forbidden();
  const attempts = await attemptsCollection();
  const items = await attempts.find({}, { sort: { createdAt: -1 }, limit: 50 }).toArray();
  return NextResponse.json({ ok: true, items });
}
