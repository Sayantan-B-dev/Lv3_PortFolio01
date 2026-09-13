import { NextResponse, type NextRequest } from "next/server";

import { hashSecret, sessionCookieHeader, signSession, unauthorized, verifySecret } from "@/lib/auth";
import { validateLoginInput } from "@/lib/blog";
import { clientIp, isLockedOut, recordAttempt } from "@/lib/guard";
import { adminCollection } from "@/lib/mongo";

/** One-time bootstrap: hash the env pair into the admin collection. */
async function bootstrapIfEmpty() {
  const admins = await adminCollection();
  const existing = await admins.findOne({});
  if (existing) return existing;
  const envUsername = process.env.ADMIN_USERNAME;
  const envPassword = process.env.ADMIN_PASSWORD;
  if (!envUsername || !envPassword) {
    throw new Error("Admin credentials are not configured.");
  }
  const now = new Date().toISOString();
  const [usernameHash, passwordHash] = await Promise.all([
    hashSecret(envUsername),
    hashSecret(envPassword),
  ]);
  try {
    await admins.insertOne({ usernameHash, passwordHash, createdAt: now, updatedAt: now });
  } catch {
    // Lost a bootstrap race with another instance: fall through to the winner's doc.
  }
  return admins.findOne({});
}

export async function POST(req: NextRequest) {
  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    return unauthorized();
  }
  const parsed = validateLoginInput(body);
  if (!parsed.ok) return unauthorized();
  const ip = clientIp(req);

  if (await isLockedOut(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Try again later." },
      { status: 429 }
    );
  }

  let admin;
  try {
    admin = await bootstrapIfEmpty();
  } catch {
    return NextResponse.json({ ok: false, error: "Auth is not configured." }, { status: 500 });
  }
  if (!admin) return unauthorized();

  // Both halves always verified (constant work: no user-enumeration timing signal).
  const [usernameOk, passwordOk] = await Promise.all([
    verifySecret(admin.usernameHash, parsed.data.username),
    verifySecret(admin.passwordHash, parsed.data.password),
  ]);
  const ok = usernameOk && passwordOk;
  await recordAttempt(ip, ok);
  if (!ok) return unauthorized();

  let token: string;
  try {
    token = await signSession();
  } catch {
    return NextResponse.json({ ok: false, error: "Auth is not configured." }, { status: 500 });
  }
  const res = NextResponse.json({ ok: true });
  res.headers.set("Set-Cookie", sessionCookieHeader(token));
  return res;
}
