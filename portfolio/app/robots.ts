import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/blog/admin", "/api/admin"] }],
    sitemap: site ? `${site}/sitemap.xml` : undefined,
  };
}
