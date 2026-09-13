import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { BlogSearch } from "@/components/blog-search";
import { PLACEHOLDER_IMAGE } from "@/lib/blog";
import { postsCollection } from "@/lib/mongo";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Blog, Sayantan Bharati",
  description:
    "Notes on full-stack development: MERN, Next.js, TypeScript, databases and shipping real products.",
};

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function getPosts(tag: string, q: string) {
  const posts = await postsCollection();
  const filter: Record<string, unknown> = {
    visibility: "public",
    publishAt: { $lte: new Date().toISOString() },
  };
  if (tag) filter.tags = tag;
  if (q) {
    const rx = { $regex: escapeRegex(q), $options: "i" };
    filter.$or = [{ title: rx }, { description: rx }];
  }
  return posts.find(filter, { sort: { publishAt: -1, createdAt: -1 }, limit: 100 }).toArray();
}

async function getTags() {
  const posts = await postsCollection();
  return posts.distinct("tags", {
    visibility: "public",
    publishAt: { $lte: new Date().toISOString() },
  });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default async function BlogIndex({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; q?: string }>;
}) {
  const { tag: rawTag, q: rawQ } = await searchParams;
  const tag = (rawTag ?? "").trim().toLowerCase().slice(0, 30);
  const q = (rawQ ?? "").trim().slice(0, 80);
  const [docs, tags] = await Promise.all([getPosts(tag, q), getTags()]);
  const sortedTags = (tags as string[]).filter(Boolean).sort();

  return (
    <main className="page-main page-main--padded">
      <div className="container-x">
        <div className="eyebrow-row">
          <span className="eyebrow-row__num">06</span>
          <span className="eyebrow-row__center">Blog</span>
          <span className="eyebrow-row__right">Notes &amp; builds</span>
        </div>

        <h1 className="blog-hero-title">
          Writing<span className="blog-hero-dot">.</span>
        </h1>
        <p className="blog-hero-sub">
          Notes on shipping real products: MERN, Next.js, TypeScript and the rest.
        </p>

        {sortedTags.length > 0 && (
          <div className="blog-tags">
            <Link href="/blog" className={tag ? "blog-tag" : "blog-tag blog-tag--active"}>
              All
            </Link>
            {sortedTags.map((t) => (
              <Link
                key={t}
                href={`/blog?tag=${encodeURIComponent(t)}`}
                className={t === tag ? "blog-tag blog-tag--active" : "blog-tag"}
              >
                {t}
              </Link>
            ))}
          </div>
        )}

        <Suspense>
          <BlogSearch />
        </Suspense>

        {docs.length === 0 ? (
          <p className="blog-empty">
            {tag || q ? "Nothing matches. Try clearing the filters." : "First post is on its way."}
          </p>
        ) : (
          <div className="blog-grid">
            {docs.map((doc, i) => (
              <Link
                key={String(doc.slug)}
                href={`/blog/${doc.slug}`}
                className="blog-card motion-safe-in"
                style={{ animationDelay: `${Math.min(i, 8) * 0.07}s` }}
              >
                <span className="blog-card__imgwrap">
                  <Image
                    src={doc.imageUrl || PLACEHOLDER_IMAGE}
                    alt={String(doc.title)}
                    fill
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                    priority={i === 0}
                    fetchPriority={i === 0 ? "high" : "auto"}
                  />
                </span>
                <span className="blog-card__body">
                  <span className="blog-card__meta">
                    <span>{formatDate(String(doc.publishAt ?? doc.createdAt))}</span>
                    {(doc.tags as string[] | undefined)?.slice(0, 2).map((t) => (
                      <span key={t} className="blog-card__tag">
                        {t}
                      </span>
                    ))}
                  </span>
                  <span className="blog-card__title">{String(doc.title)}</span>
                  <span className="blog-card__desc">{String(doc.description)}</span>
                  <span className="blog-card__more">
                    Read more <span aria-hidden="true">→</span>
                  </span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
