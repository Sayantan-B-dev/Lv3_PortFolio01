import { NextResponse, type NextRequest } from "next/server";

import { isAdminRequest } from "@/lib/auth";
import { postsCollection } from "@/lib/mongo";
import type { BlogPostDoc } from "@/lib/blog";

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req: NextRequest) {
  const admin = await isAdminRequest(req);
  const { searchParams } = new URL(req.url);
  const tag = (searchParams.get("tag") ?? "").trim().toLowerCase().slice(0, 30);
  const q = (searchParams.get("q") ?? "").trim().slice(0, 80);

  const filter: Record<string, unknown> = {};
  // Visitors only ever see published public posts. No exceptions.
  if (!admin) {
    filter.visibility = "public";
    filter.publishAt = { $lte: new Date().toISOString() };
  }
  if (tag) filter.tags = tag;
  if (q) {
    const rx = { $regex: escapeRegex(q), $options: "i" };
    filter.$or = [{ title: rx }, { description: rx }];
  }

  const posts = await postsCollection();
  const docs = await posts
    .find(filter, {
      projection: { markdown: 0 },
      sort: { publishAt: -1, createdAt: -1 },
      limit: 100,
    })
    .toArray();

  const items = (docs as BlogPostDoc[]).map((d) => ({
    slug: d.slug,
    title: d.title,
    description: d.description,
    imageUrl: d.imageUrl,
    links: d.links,
    tags: d.tags,
    visibility: d.visibility,
    publishAt: d.publishAt,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  }));
  return NextResponse.json({ ok: true, items });
}
