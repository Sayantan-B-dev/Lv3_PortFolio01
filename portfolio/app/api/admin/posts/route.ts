import { NextResponse, type NextRequest } from "next/server";

import { forbidden, isAdminRequest } from "@/lib/auth";
import { isValidSlug, slugify, validatePostInput, type BlogPostDoc } from "@/lib/blog";
import { postsCollection } from "@/lib/mongo";

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return forbidden();
  const posts = await postsCollection();
  const docs = await posts
    .find({}, { sort: { createdAt: -1 }, limit: 200 })
    .toArray();
  return NextResponse.json({ ok: true, items: docs });
}

async function uniqueSlug(posts: Awaited<ReturnType<typeof postsCollection>>, base: string): Promise<string> {
  const clean = isValidSlug(base) ? base : slugify(base);
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidate = attempt === 0 ? clean : `${clean}-${attempt + 1}`;
    const existing = await posts.findOne({ slug: candidate }, { projection: { _id: 1 } });
    if (!existing) return candidate;
  }
  return `${clean}-${Date.now().toString(36)}`;
}

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) return forbidden();
  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body must be JSON." }, { status: 400 });
  }
  const parsed = validatePostInput(body);
  if (!parsed.ok) return NextResponse.json({ ok: false, errors: parsed.errors }, { status: 400 });

  const imageUrl =
    body && typeof body === "object" && typeof (body as Record<string, unknown>).imageUrl === "string"
      ? ((body as Record<string, unknown>).imageUrl as string).slice(0, 2000)
      : "";
  const imagePublicId =
    body && typeof body === "object" && typeof (body as Record<string, unknown>).imagePublicId === "string"
      ? ((body as Record<string, unknown>).imagePublicId as string).slice(0, 500)
      : "";
  // Cover is optional: posts without one show a placeholder until edited.

  const posts = await postsCollection();
  const now = new Date().toISOString();
  const doc: BlogPostDoc = {
    slug: await uniqueSlug(posts, slugify(parsed.data.title)),
    title: parsed.data.title,
    description: parsed.data.description,
    markdown: parsed.data.markdown,
    imageUrl,
    imagePublicId,
    links: parsed.data.links,
    tags: parsed.data.tags,
    visibility: parsed.data.visibility,
    publishAt: parsed.data.publishAt ?? now,
    createdAt: now,
    updatedAt: now,
  };
  // Single-document insert: atomic (ACID) by itself.
  await posts.insertOne(doc);
  return NextResponse.json({ ok: true, item: doc }, { status: 201 });
}
