/* Login guard (single responsibility: brute-force defense + audit trail).
   Sliding-window lockout: 5 failed attempts from one IP inside 15 minutes
   locks logins until the window slides past. Every attempt is logged. */

import type { NextRequest } from "next/server";

import { attemptsCollection } from "@/lib/mongo";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;
const ATTEMPT_TTL_SECONDS = 30 * 24 * 60 * 60;

let ttlReady = false;

async function ensureTtl(): Promise<void> {
  if (ttlReady) return;
  const attempts = await attemptsCollection();
  await attempts.createIndex({ createdAt: 1 }, { expireAfterSeconds: ATTEMPT_TTL_SECONDS, name: "attempts_ttl" });
  ttlReady = true;
}

export function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  return "unknown";
}

export async function recordAttempt(ip: string, success: boolean): Promise<void> {
  const attempts = await attemptsCollection();
  await attempts.insertOne({ ip, success, createdAt: new Date().toISOString() });
}

export async function isLockedOut(ip: string): Promise<boolean> {
  await ensureTtl();
  const attempts = await attemptsCollection();
  const since = new Date(Date.now() - WINDOW_MS).toISOString();
  const failures = await attempts.countDocuments({ ip, success: false, createdAt: { $gte: since } });
  return failures >= MAX_FAILURES;
}
