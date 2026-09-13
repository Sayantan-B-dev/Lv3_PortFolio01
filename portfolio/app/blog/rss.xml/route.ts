import { postsCollection } from "@/lib/mongo";

export const dynamic = "force-dynamic";

function siteUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  return url || null;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const site = siteUrl();
  const posts = await postsCollection();
  const docs = await posts
    .find(
      { visibility: "public", publishAt: { $lte: new Date().toISOString() } },
      { sort: { publishAt: -1 }, limit: 50 }
    )
    .toArray();

  const items = docs
    .map((d) => {
      const link = site ? `${site}/blog/${d.slug}` : `/blog/${d.slug}`;
      return [
        "    <item>",
        `      <title>${escapeXml(String(d.title))}</title>`,
        `      <link>${escapeXml(link)}</link>`,
        `      <guid>${escapeXml(link)}</guid>`,
        `      <description>${escapeXml(String(d.description))}</description>`,
        `      <pubDate>${new Date(String(d.publishAt)).toUTCString()}</pubDate>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    "  <channel>",
    "    <title>Sayantan Bharati, Blog</title>",
    `    <link>${escapeXml(site ? `${site}/blog` : "/blog")}</link>`,
    "    <description>Notes on shipping real products: MERN, Next.js, TypeScript and the rest.</description>",
    items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
