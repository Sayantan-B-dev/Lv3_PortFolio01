# Environment

All runtime config lives in `portfolio/.env.local` (git-ignored, never committed).
`portfolio/.env.example` is the committed template with placeholders only.

## Variables

| Var | Required | Used by | Breaks if missing |
|---|---|---|---|
| `MONGODB_URI` | yes | `lib/mongo.ts` | Every DB route 500s |
| `MONGODB_DB_NAME` | yes | `lib/mongo.ts` | Every DB route 500s |
| `MONGODB_PORTFOLIO_COLLECTION` | yes | `lib/mongo.ts` | Blog reads/writes 500 (`blog_posts`) |
| `ADMIN_USERNAME` | yes | login bootstrap | First login 500s (`Auth is not configured`) |
| `ADMIN_PASSWORD` | yes | login bootstrap | First login 500s |
| `JWT_SECRET` | yes | `lib/auth.ts` | Login + all session checks 500. Min 32 random chars. Generate: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `CLOUDINARY_CLOUD_NAME` | yes | `lib/cloudinary.ts` | Uploads 500 |
| `CLOUDINARY_KEY` | yes | `lib/cloudinary.ts` | Uploads 500 |
| `CLOUDINARY_SECRET` | yes | `lib/cloudinary.ts` | Uploads 500 |
| `NEXT_PUBLIC_SITE_URL` | no | sitemap, RSS, OG | Without it, sitemap is empty and RSS links are relative |

## Collections (same database, nothing else touched)

| Collection | Purpose | Created by |
|---|---|---|
| `$MONGODB_PORTFOLIO_COLLECTION` (`blog_posts`) | Posts. Unique index on `slug`; indexes on `(visibility, publishAt)` and `tags` | `lib/mongo.ts` on first use |
| `portfolio_admin` | Single doc: `{ usernameHash, passwordHash }` (argon2id, both halves) | First successful login bootstrap |
| `portfolio_login_attempts` | `{ ip, success, createdAt }`, 30-day TTL | Every login attempt |

## Gotchas hit so far

1. **Slug index name conflict.** Something created a `{slug: 1}` index under a different name before the app did, so `createIndex({slug}, {name: "slug_unique"})` threw `IndexOptionsConflict (85)`. Fix: `lib/mongo.ts` and `scripts/seed-blog.mjs` now check existing indexes and only create what's missing.
2. **Scheduled-in-2222 post.** A `datetime-local` typo set `publishAt` to year 2222, hiding the post (correct behavior: future = unpublished). The studio now stamps `publishAt: now` on every save, and shows a **Scheduled** badge on public posts dated in the future.
3. **`.env*` gitignore vs `.env.example`.** Root `.gitignore` ignores `.env*`, so the template must be added with `git add -f`.
