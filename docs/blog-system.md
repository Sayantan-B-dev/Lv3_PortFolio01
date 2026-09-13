# Blog system

## Public routes (no login)

| Route | What | Data |
|---|---|---|
| `/blog` | Card grid, tag pills, search box, LCP-priority first image | `GET /api/posts` semantics, server-rendered, `force-dynamic` |
| `/blog/[slug]` | Full post: meta, tags, cover, markdown (`#`/`##`/code/fences/lists/tables), links, BlogPosting JSON-LD | Single indexed `findOne({slug})`, shared between metadata + page via React `cache()` |
| `/blog/rss.xml` | RSS 2.0, latest 50 public posts | Same filter |
| `/sitemap.xml`, `/robots.txt` | SEO plumbing; admin/API paths disallowed | Needs `NEXT_PUBLIC_SITE_URL` or sitemap is empty |

Visibility rule, enforced in the DB query (never in the browser): visitors only get
`visibility: "public"` AND `publishAt <= now`. Private or future posts 404 for strangers.

## Post document

`slug` (unique), `title` (3-120), `description` (≤300, cards + SEO), `markdown` (≤100k),
`imageUrl` + `imagePublicId` (both optional; empty shows `PLACEHOLDER_IMAGE` from `lib/blog.ts`),
`links[]` (`{label, url}`, http(s) only, max 6), `tags[]` (lowercase slugs, max 8),
`visibility`, `publishAt`, `createdAt`, `updatedAt`.

## Admin API (all require the admin cookie, else 403)

| Route | Method | Does |
|---|---|---|
| `/api/admin/login` | POST | Bootstrap-hashes env pair on first ever run, verifies both halves, sets httpOnly JWT cookie. 5 fails/15min/IP → 429 |
| `/api/admin/logout` | POST | Clears the cookie |
| `/api/admin/me` | GET | Session check for the studio gate |
| `/api/admin/attempts` | GET | Last 50 login attempts (shown in studio) |
| `/api/admin/posts` | GET/POST | List all / create (unique slug with `-2`, `-3`… retry) |
| `/api/admin/posts/[id]` | PATCH/DELETE | Full-object update / delete-then-clean-image |
| `/api/admin/upload` | POST/DELETE | WebP-only (≤5MB) upload to `portfolio-blog/` / orphan destroy |

## CRUD + images, exactly

- **Create:** upload cover first → POST post with `imageUrl`/`imagePublicId`. Covers optional.
- **Edit:** PATCH sends the whole object. Replaced covers: old asset destroyed after a successful save (best effort, never fails the save).
- **Delete:** post deleted from DB first, then its image destroyed (a failed destroy orphans a file, never a broken post).
- **Cancel:** any upload from that editor session that was never saved is destroyed; the previously saved cover is never touched. Superseded pre-save uploads are cleaned on save.
- All writes are single-document (atomic by MongoDB). No multi-doc transactions exist because none are needed.

## Seeding

`portfolio/scripts/seed-blog.mjs` — idempotent upserts by slug (safe to re-run):

```bash
cd portfolio
node --env-file=.env.local scripts/seed-blog.mjs
```

Ships 5 posts (4 public, 1 private) with empty covers. Re-running keeps existing images (`$setOnInsert`-style care is built in: images untouched).
