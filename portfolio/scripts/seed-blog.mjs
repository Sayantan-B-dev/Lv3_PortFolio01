/* Seed 5 starter posts. Idempotent: upserts by slug, safe to re-run.
   Run from portfolio/: node --env-file=.env.local scripts/seed-blog.mjs
   Images stay empty on purpose; the UI shows a placeholder until edited. */

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;
const collectionName = process.env.MONGODB_PORTFOLIO_COLLECTION;
if (!uri || !dbName || !collectionName) {
  console.error("Missing MONGODB_URI / MONGODB_DB_NAME / MONGODB_PORTFOLIO_COLLECTION");
  process.exit(1);
}

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();

const posts = [
  {
    slug: "structuring-mern-apps-that-dont-rot",
    title: "How I Structure a MERN App So It Doesn't Rot",
    description: "The folder layout, boundaries and habits that keep a MERN codebase clean past month three.",
    markdown: `## The problem with most MERN starters

Everything lives in one \`server.js\` for a week. Then routes multiply, models drift, and auth logic ends up copy-pasted in six places. Here is the shape I use instead:

\`\`\`
server/
  config/      env, db connection, constants
  models/      Mongoose schemas only, no logic
  routes/      thin HTTP layer: validate, call service, respond
  services/    business logic lives here and only here
  middleware/  auth, errors, rate limits
  utils/       small pure helpers
\`\`\`

## Three rules that do the heavy lifting

1. **Routes never touch the database directly.** They call services.
2. **One model, one file.** No 900-line schema dumps.
3. **Auth is middleware, not inline checks.** If you see \`if (!req.user)\` inside a route, move it out.

## Why this scales

| Smell | Fix |
|---|---|
| Route file over 100 lines | Extract a service |
| Same query twice | Share it via the service layer |
| Auth checks inline | Middleware |

> Boring structure beats clever structure. Future you is already grateful.
`,
    links: [{ label: "Express routing docs", url: "https://expressjs.com/en/guide/routing.html" }],
    tags: ["mern", "nodejs", "architecture"],
    visibility: "public",
    publishAt: daysAgo(2),
  },
  {
    slug: "nextjs-16-app-router-production-lessons",
    title: "Next.js 16 App Router: Lessons From Production",
    description: "Server components, caching gotchas and SEO wins I picked up shipping a real marketplace.",
    markdown: `## Server first, client when it earns it

The App Router rewards a simple bias: **fetch and render on the server**, reach for \`"use client"\` only for interaction. Most pages on this portfolio are server components for exactly that reason.

## Caching gotchas

- \`fetch\` in server components caches by default. For live data, opt out deliberately with \`cache: "no-store"\` or \`export const dynamic = "force-dynamic"\`.
- \`generateMetadata\` runs per route. Give every post its own title, description and OG image.

## SEO that actually moves the needle

\`\`\`tsx
export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  return { title: post.title, description: post.description };
}
\`\`\`

1. One \`<h1>\` per page.
2. JSON-LD (\`BlogPosting\`, \`FAQPage\`) alongside visible content.
3. Sitemap + RSS so crawlers find new posts fast.

> Ship the boring SEO first. Fancy can wait.
`,
    links: [{ label: "Next.js docs", url: "https://nextjs.org/docs" }],
    tags: ["nextjs", "react", "seo"],
    visibility: "public",
    publishAt: daysAgo(5),
  },
  {
    slug: "redis-caching-patterns-that-help",
    title: "Redis Caching Patterns That Actually Help",
    description: "Cache-aside, TTL discipline and stampede protection without overengineering.",
    markdown: `## Cache-aside in 20 lines

\`\`\`js
async function getProduct(id) {
  const hit = await redis.get(\`product:\${id}\`);
  if (hit) return JSON.parse(hit);
  const doc = await Product.findById(id).lean();
  if (doc) await redis.set(\`product:\${id}\`, JSON.stringify(doc), "EX", 300);
  return doc;
}
\`\`\`

## TTL discipline

- Hot, slow-changing data: **5 to 15 minutes**.
- Sessions and OTPs: short TTLs, let Redis do the expiry.
- Never cache without a TTL. *Never.*

## Stampede protection

When a hot key expires, fifty requests can dogpile Mongo at once. The cheap fix: **stale-while-revalidate**, serve the stale copy and refresh in the background.

> Cache the reads that hurt. Measure first, cache second.
`,
    links: [{ label: "Redis docs", url: "https://redis.io/docs/latest/" }],
    tags: ["redis", "backend", "performance"],
    visibility: "public",
    publishAt: daysAgo(9),
  },
  {
    slug: "jwt-google-oauth-without-headaches",
    title: "JWT + Google OAuth Without the Headaches",
    description: "Secure cookies, CSRF-safe flows and token hygiene that survive real users.",
    markdown: `## The shape that works

1. Short-lived access token in an **httpOnly, Secure, SameSite=Strict** cookie.
2. Google OAuth only mints identity. Your own JWT mints the session.
3. Never trust the client clock. Verify expiry server-side, always.

## The checklist I run through

- [ ] Cookies are httpOnly (no JS access, ever)
- [ ] CSRF state parameter on the OAuth dance
- [ ] Rate-limited login route with lockout
- [ ] Generic error messages ("invalid credentials", never which half)
- [ ] Tokens expire (12h is my default), logout actually clears them

\`\`\`ts
// verify, then decide. Everything else is decoration.
const { payload } = await jwtVerify(token, secret);
if (payload.sub !== "admin") throw new Error("nope");
\`\`\`

> Auth code should be boring to read and annoying to bypass.
`,
    links: [{ label: "NextAuth docs", url: "https://next-auth.js.org/" }],
    tags: ["security", "auth", "jwt"],
    visibility: "public",
    publishAt: daysAgo(14),
  },
  {
    slug: "talk-prep-webgl-for-beginners",
    title: "Talk Prep: Explaining WebGL to Beginners",
    description: "Private scratch notes for an upcoming talk. Not published.",
    markdown: `## Private scratchpad

Talking points to flesh out later:

## Hooks that land

1. "The GPU is a thousand tiny calculators, the CPU is one fast thinker."
2. Live demo: particle globe, drag it, break it, fix it.
3. Shaders are just functions that run per pixel.

## TODO

- [ ] 5-minute lightning version
- [ ] 20-minute full version with Q&A
- [ ] Record a dry run
`,
    links: [],
    tags: ["webgl", "notes"],
    visibility: "private",
    publishAt: daysAgo(1),
  },
];

const client = new MongoClient(uri);
try {
  await client.connect();
  const col = client.db(dbName).collection(collectionName);
  const existing = await col.indexes();
  const hasSlug = existing.some((ix) => ix.key && ix.key.slug === 1);
  if (!hasSlug) {
    await col.createIndex({ slug: 1 }, { unique: true });
  }
  let created = 0;
  let kept = 0;
  for (const post of posts) {
    const now = new Date().toISOString();
    const res = await col.updateOne(
      { slug: post.slug },
      {
        $set: { ...post, imageUrl: "", imagePublicId: "", updatedAt: now },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );
    if (res.upsertedCount > 0) created += 1;
    else kept += 1;
  }
  console.log(`Seed done: ${created} created, ${kept} already existed (kept, images untouched).`);
} finally {
  await client.close();
}
