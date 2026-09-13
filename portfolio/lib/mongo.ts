/* MongoDB connection + collection access (single responsibility: data access).
   - One cached client for the whole server lifetime (no connection storms).
   - Only the collection named by MONGODB_PORTFOLIO_COLLECTION is ever touched;
     the rest of the database is left exactly as it is.
   - Document-level writes are atomic (ACID at the single-document level);
     unique slug index guarantees no duplicate public URLs. */

import { Collection, Db, MongoClient } from "mongodb";

import type { AdminDoc, AttemptDoc, BlogPostDoc } from "@/lib/blog";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

let clientPromise: Promise<MongoClient> | null = null;

function getClient(): Promise<MongoClient> {
  if (!clientPromise) {
    const client = new MongoClient(requiredEnv("MONGODB_URI"));
    clientPromise = client.connect().catch((err: unknown) => {
      clientPromise = null;
      throw err;
    });
  }
  return clientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClient();
  return client.db(requiredEnv("MONGODB_DB_NAME"));
}

async function ensurePostIndexes(posts: Collection<BlogPostDoc>): Promise<void> {
  await posts.createIndex({ slug: 1 }, { unique: true, name: "slug_unique" });
  await posts.createIndex({ visibility: 1, publishAt: -1 }, { name: "visibility_publish" });
  await posts.createIndex({ tags: 1 }, { name: "tags" });
}

let indexesReady = false;

export async function postsCollection(): Promise<Collection<BlogPostDoc>> {
  const db = await getDb();
  const posts = db.collection<BlogPostDoc>(requiredEnv("MONGODB_PORTFOLIO_COLLECTION"));
  if (!indexesReady) {
    await ensurePostIndexes(posts);
    indexesReady = true;
  }
  return posts;
}

export async function adminCollection(): Promise<Collection<AdminDoc>> {
  const db = await getDb();
  return db.collection<AdminDoc>("portfolio_admin");
}

export async function attemptsCollection(): Promise<Collection<AttemptDoc>> {
  const db = await getDb();
  return db.collection<AttemptDoc>("portfolio_login_attempts");
}
