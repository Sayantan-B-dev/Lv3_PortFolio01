import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { postsCollection } from "@/lib/mongo";

export const dynamic = "force-dynamic";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function readingMinutes(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

async function getPost(slug: string) {
  const posts = await postsCollection();
  return posts.findOne({ slug });
}

async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  return verifySessionToken(jar.get(SESSION_COOKIE)?.value);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getPost(slug);
  if (!doc) return { title: "Not found" };
  return {
    title: `${doc.title}, Sayantan Bharati`,
    description: doc.description,
    openGraph: {
      title: `${doc.title}, Sayantan Bharati`,
      description: doc.description,
      type: "article",
      ...(doc.imageUrl ? { images: [{ url: doc.imageUrl }] } : {}),
    },
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = await getPost(slug);
  if (!doc) notFound();

  const admin = await isAdmin();
  const published = doc.visibility === "public" && doc.publishAt <= new Date().toISOString();
  if (!published && !admin) notFound();

  const postJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: doc.title,
    description: doc.description,
    datePublished: doc.publishAt,
    dateModified: doc.updatedAt,
    author: { "@type": "Person", name: "Sayantan Bharati" },
    ...(doc.imageUrl ? { image: [doc.imageUrl] } : {}),
  };

  return (
    <main className="page-main">
      <div className="container-x">
        <div className="blog-post">
          <Link href="/blog" className="blog-back">
            <span aria-hidden="true">←</span> All posts
          </Link>
          <p className="blog-post__kicker">
            <span>{formatDate(doc.publishAt)}</span>
            <span aria-hidden="true">·</span>
            <span>{readingMinutes(doc.markdown)} min read</span>
            {doc.visibility === "private" && <span className="blog-badge">Private</span>}
          </p>
          <h1 className="blog-post__title">{doc.title}</h1>
          {doc.description ? <p className="blog-post__lede">{doc.description}</p> : null}
          {(doc.tags as string[] | undefined)?.length ? (
            <div className="blog-tags blog-tags--post">
              {(doc.tags as string[]).map((t) => (
                <Link key={t} href={`/blog?tag=${encodeURIComponent(t)}`} className="blog-tag">
                  {t}
                </Link>
              ))}
            </div>
          ) : null}
          {doc.imageUrl ? (
            <span className="blog-post__imgwrap">
              <Image
                src={doc.imageUrl}
                alt={doc.title}
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 60vw"
              />
            </span>
          ) : null}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(postJsonLd) }}
          />
          <div className="blog-md">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ node: _node, ...props }) => (
                  <a {...props} target="_blank" rel="noreferrer" />
                ),
              }}
            >
              {doc.markdown}
            </ReactMarkdown>
          </div>
          {(doc.links as { label: string; url: string }[] | undefined)?.length ? (
            <div className="blog-post__links">
              <p className="contact-label">Links</p>
              <div className="blog-post__links-row">
                {(doc.links as { label: string; url: string }[]).map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="blog-post__link"
                  >
                    {link.label} <span aria-hidden="true">↗</span>
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
