/* Domain types + strict input validation for the blog.
   Pure module: no I/O, no framework imports (single responsibility). */

import type { ObjectId } from "mongodb";

export type Visibility = "public" | "private";

/** Shown whenever a post has no cover image yet. */
export const PLACEHOLDER_IMAGE =
  "https://imgs.search.brave.com/UaGneFC96IeZmvrWigTNl5LJlJxtoEQ3f1Bx8R7MUAg/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzIwLzIxLzk5Lzgz/LzM2MF9GXzIwMjE5/OTgzMzJfSXJLbzVk/QUpkVFRhclR5TUVh/RkRkbkdUcjJ6UU9J/aVcuanBn";

export interface BlogLink {
  label: string;
  url: string;
}

export interface BlogPostDoc {
  _id?: ObjectId;
  slug: string;
  title: string;
  description: string;
  markdown: string;
  imageUrl: string;
  imagePublicId: string;
  links: BlogLink[];
  tags: string[];
  visibility: Visibility;
  publishAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostInput {
  title: string;
  description: string;
  markdown: string;
  links: BlogLink[];
  tags: string[];
  visibility: Visibility;
  publishAt?: string;
}

export interface AdminDoc {
  _id?: ObjectId;
  usernameHash: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttemptDoc {
  _id?: ObjectId;
  ip: string;
  success: boolean;
  createdAt: string;
}

const TITLE_MIN = 3;
const TITLE_MAX = 120;
const DESC_MAX = 300;
const MARKDOWN_MAX = 100_000;
const LINKS_MAX = 6;
const TAGS_MAX = 8;
const TAG_RE = /^[a-z0-9][a-z0-9-]{0,29}$/;
const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,99}$/;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isHttpUrl(v: unknown): v is string {
  if (typeof v !== "string") return false;
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** URL-safe slug from a title. Collision suffixing happens at the route layer. */
export function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return base || "post";
}

export function isValidSlug(slug: unknown): slug is string {
  return typeof slug === "string" && SLUG_RE.test(slug);
}

export function validatePostInput(input: unknown):
  | { ok: true; data: BlogPostInput }
  | { ok: false; errors: string[] } {
  const errors: string[] = [];
  if (!isRecord(input)) return { ok: false, errors: ["Body must be a JSON object."] };

  const title = typeof input.title === "string" ? input.title.trim() : "";
  const description = typeof input.description === "string" ? input.description.trim() : "";
  const markdown = typeof input.markdown === "string" ? input.markdown : "";

  if (title.length < TITLE_MIN || title.length > TITLE_MAX) {
    errors.push(`Title must be ${TITLE_MIN}-${TITLE_MAX} characters.`);
  }
  if (description.length > DESC_MAX) {
    errors.push(`Description must be at most ${DESC_MAX} characters.`);
  }
  if (markdown.length > MARKDOWN_MAX) {
    errors.push(`Markdown body is too large (max ${MARKDOWN_MAX} chars).`);
  }

  const links: BlogLink[] = [];
  if (input.links !== undefined) {
    if (!Array.isArray(input.links) || input.links.length > LINKS_MAX) {
      errors.push(`Links must be an array of at most ${LINKS_MAX} items.`);
    } else {
      for (const [idx, item] of input.links.entries()) {
        if (!isRecord(item)) {
          errors.push(`Link #${idx + 1} must be an object.`);
          continue;
        }
        const label = typeof item.label === "string" ? item.label.trim().slice(0, 40) : "";
        if (!label) errors.push(`Link #${idx + 1} needs a label.`);
        if (!isHttpUrl(item.url)) errors.push(`Link #${idx + 1} needs an http(s) URL.`);
        if (label && isHttpUrl(item.url)) links.push({ label, url: item.url });
      }
    }
  }

  const tags: string[] = [];
  if (input.tags !== undefined) {
    if (!Array.isArray(input.tags) || input.tags.length > TAGS_MAX) {
      errors.push(`Tags must be an array of at most ${TAGS_MAX} slugs.`);
    } else {
      for (const [idx, tag] of input.tags.entries()) {
        const t = typeof tag === "string" ? tag.trim().toLowerCase() : "";
        if (!TAG_RE.test(t)) {
          errors.push(`Tag #${idx + 1} must be lowercase alphanumeric with dashes.`);
        } else if (!tags.includes(t)) {
          tags.push(t);
        }
      }
    }
  }

  const visibility: Visibility = input.visibility === "private" ? "private" : "public";

  let publishAt: string | undefined;
  if (input.publishAt !== undefined && input.publishAt !== null && input.publishAt !== "") {
    if (typeof input.publishAt !== "string" || Number.isNaN(Date.parse(input.publishAt))) {
      errors.push("publishAt must be a valid date string.");
    } else {
      publishAt = new Date(input.publishAt).toISOString();
    }
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, data: { title, description, markdown, links, tags, visibility, publishAt } };
}

export function validateLoginInput(input: unknown):
  | { ok: true; data: { username: string; password: string } }
  | { ok: false; errors: string[] } {
  if (!isRecord(input)) return { ok: false, errors: ["Body must be a JSON object."] };
  const username = typeof input.username === "string" ? input.username : "";
  const password = typeof input.password === "string" ? input.password : "";
  if (!username || !password) return { ok: false, errors: ["Username and password are required."] };
  if (username.length > 128 || password.length > 256) {
    return { ok: false, errors: ["Username and password are required."] };
  }
  return { ok: true, data: { username, password } };
}
