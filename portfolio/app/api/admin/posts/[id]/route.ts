import { NextResponse, type NextRequest } from "next/server";
import { ObjectId } from "mongodb";

import { forbidden, isAdminRequest } from "@/lib/auth";
import { validatePostInput } from "@/lib/blog";
import { destroyBlogImage } from "@/lib/cloudinary";
import { postsCollection } from "@/lib/mongo";

function toObjectId(id: string) {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(req))) return forbidden();
  const { id } = await params;
  const objectId = toObjectId(id);
  if (!objectId) return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });

  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body must be JSON." }, { status: 400 });
  }
  const parsed = validatePostInput(body);
  if (!parsed.ok) return NextResponse.json({ ok: false, errors: parsed.errors }, { status: 400 });

  const posts = await postsCollection();
  const existing = await posts.findOne({ _id: objectId });
  if (!existing) return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });

  const record = (body ?? {}) as Record<string, unknown>;
  const imageUrl = typeof record.imageUrl === "string" ? record.imageUrl : "";
  const imagePublicId = typeof record.imagePublicId === "string" ? record.imagePublicId : "";
  if (!imageUrl || !imagePublicId) {
    return NextResponse.json({ ok: false, error: "A cover image upload is required." }, { status: 400 });
  }

  const now = new Date().toISOString();
  // Single-document update: atomic (ACID) by itself.
  await posts.updateOne(
    { _id: objectId },
    {
      $set: {
        title: parsed.data.title,
        description: parsed.data.description,
        markdown: parsed.data.markdown,
        imageUrl,
        imagePublicId,
        links: parsed.data.links,
        tags: parsed.data.tags,
        visibility: parsed.data.visibility,
        publishAt: parsed.data.publishAt ?? existing.publishAt,
        updatedAt: now,
      },
    }
  );

  // Cover replaced: destroy the old asset (best effort, never fails the save).
  if (existing.imagePublicId && existing.imagePublicId !== imagePublicId) {
    try {
      await destroyBlogImage(existing.imagePublicId);
    } catch (err) {
      console.error("Old cover cleanup failed:", err);
    }
  }

  const updated = await posts.findOne({ _id: objectId });
  return NextResponse.json({ ok: true, item: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(req))) return forbidden();
  const { id } = await params;
  const objectId = toObjectId(id);
  if (!objectId) return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });

  const posts = await postsCollection();
  const existing = await posts.findOne({ _id: objectId });
  if (!existing) return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });

  // DB first (source of truth), then the image. A failed destroy only orphans
  // a file, never a broken post.
  await posts.deleteOne({ _id: objectId });
  if (existing.imagePublicId) {
    try {
      await destroyBlogImage(existing.imagePublicId);
    } catch (err) {
      console.error("Cover cleanup after delete failed:", err);
    }
  }
  return NextResponse.json({ ok: true });
}
