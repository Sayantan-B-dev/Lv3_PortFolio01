import type { MetadataRoute } from "next";

import { postsCollection } from "@/lib/mongo";

function siteUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  return url || null;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = siteUrl();
  if (!site) return [];
  const posts = await postsCollection();
  const docs = await posts
    .find(
      { visibility: "public", publishAt: { $lte: new Date().toISOString() } },
      { projection: { slug: 1, updatedAt: 1 }, sort: { publishAt: -1 }, limit: 200 }
    )
    .toArray();
  return [
    { url: `${site}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${site}/blog`, changeFrequency: "daily", priority: 0.9 },
    ...docs.map((d) => ({
      url: `${site}/blog/${d.slug}`,
      lastModified: d.updatedAt ? new Date(String(d.updatedAt)) : undefined,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
