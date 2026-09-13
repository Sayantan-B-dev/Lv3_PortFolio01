/* Auth primitives (single responsibility: credentials + sessions).
   - argon2id for BOTH username and password hashes (OWASP interactive params).
   - Stateless JWT (jose, HS256, 12h) in an httpOnly cookie. No session store,
     nothing to scale, nothing to steal from a DB.
   - Env credentials are only ever read server-side and only to bootstrap or
     verify hashes. They are never returned to any client. */

import * as argon2 from "argon2";
import { jwtVerify, SignJWT } from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const SESSION_COOKIE = "sb_admin";
const SESSION_SUBJECT = "admin";
const SESSION_TTL_SECONDS = 12 * 60 * 60;

function jwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be set to a random string of at least 32 characters.");
  }
  return new TextEncoder().encode(secret);
}

export async function hashSecret(value: string): Promise<string> {
  return argon2.hash(value, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });
}

export async function verifySecret(hash: string, value: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, value);
  } catch {
    return false;
  }
}

export async function signSession(): Promise<string> {
  return new SignJWT({ sub: SESSION_SUBJECT })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(jwtSecret());
}

export async function isAdminRequest(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, jwtSecret(), { subject: SESSION_SUBJECT });
    return payload.sub === SESSION_SUBJECT;
  } catch {
    return false;
  }
}

export function sessionCookieHeader(token: string): string {
  const parts = [
    `${SESSION_COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    `Max-Age=${SESSION_TTL_SECONDS}`,
  ];
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}

export function clearedSessionCookieHeader(): string {
  const parts = [`${SESSION_COOKIE}=`, "Path=/", "HttpOnly", "SameSite=Strict", "Max-Age=0"];
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}

export function unauthorized(): NextResponse {
  // Generic on purpose: never reveal which half of the pair was wrong.
  return NextResponse.json({ ok: false, error: "Invalid credentials." }, { status: 401 });
}

export function forbidden(): NextResponse {
  return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
}
