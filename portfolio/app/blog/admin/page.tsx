"use client";

import { useCallback, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface PostLink {
  label: string;
  url: string;
}

interface AdminPost {
  _id: string;
  slug: string;
  title: string;
  description: string;
  markdown: string;
  imageUrl: string;
  imagePublicId: string;
  links: PostLink[];
  tags: string[];
  visibility: "public" | "private";
  publishAt: string;
  createdAt: string;
  updatedAt: string;
}

type Status = "checking" | "login" | "admin";

const EMPTY_FORM = {
  title: "",
  description: "",
  markdown: "",
  links: [] as PostLink[],
  tags: "",
  visibility: "public" as "public" | "private",
  publishAt: "",
  imageUrl: "",
  imagePublicId: "",
};

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data = (await res.json().catch(() => null)) as T & { ok?: boolean; error?: string; errors?: string[] };
  if (!res.ok || data?.ok === false) {
    const msg = data?.error ?? data?.errors?.join(" ") ?? `Request failed (${res.status}).`;
    throw new Error(msg);
  }
  return data;
}

export default function AdminStudio() {
  const [status, setStatus] = useState<Status>("checking");
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [attempts, setAttempts] = useState<{ ip: string; success: boolean; createdAt: string }[]>([]);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const data = await api<{ items: AdminPost[] }>("/api/admin/posts");
    setPosts(data.items);
    try {
      const log = await api<{ items: { ip: string; success: boolean; createdAt: string }[] }>(
        "/api/admin/attempts"
      );
      setAttempts(log.items);
    } catch {
      setAttempts([]);
    }
  }, []);

  useEffect(() => {
    api<{ ok: boolean }>("/api/admin/me")
      .then(() => {
        setStatus("admin");
        refresh().catch((err: Error) => setNotice(err.message));
      })
      .catch(() => setStatus("login"));
  }, [refresh]);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    setStatus("login");
    setPosts([]);
    setEditingId(null);
  };

  return (
    <main className="page-main">
      <div className="container-x">
        <div className="eyebrow-row">
          <span className="eyebrow-row__num">07</span>
          <span className="eyebrow-row__center">Studio</span>
          <span className="eyebrow-row__right">Admin only</span>
        </div>

        <h1 className="blog-hero-title">
          Studio<span className="blog-hero-dot">.</span>
        </h1>

        {notice ? <p className="admin-notice">{notice}</p> : null}

        {status === "checking" ? <p className="blog-empty">Checking session…</p> : null}

        {status === "login" ? (
          <LoginForm
            onDone={() => {
              setStatus("admin");
              refresh().catch((err: Error) => setNotice(err.message));
            }}
            onError={setNotice}
          />
        ) : null}

        {status === "admin" ? (
          <>
            <nav className="admin-tabs" aria-label="Studio sections">
              <span className="admin-tabs__group">
                <button
                  type="button"
                  className={editingId ? "admin-tab" : "admin-tab admin-tab--active"}
                  onClick={() => {
                    setEditingId(null);
                    setNotice(null);
                  }}
                >
                  Posts ({posts.length})
                </button>
                <button
                  type="button"
                  className={editingId ? "admin-tab admin-tab--active" : "admin-tab"}
                  onClick={() => {
                    setEditingId("new");
                    setNotice(null);
                  }}
                >
                  + New post
                </button>
              </span>
              <span className="admin-tabs__group">
                <a href="/blog" className="admin-tab">
                  View blog <span aria-hidden="true">↗</span>
                </a>
                <button type="button" className="admin-tab" onClick={logout}>
                  Log out
                </button>
              </span>
            </nav>

            {editingId ? (
              <Editor
                key={editingId === "new" ? "new" : editingId}
                initial={editingId === "new" ? null : posts.find((p) => p._id === editingId) ?? null}
                onClose={() => setEditingId(null)}
                onSaved={() => {
                  setEditingId(null);
                  refresh().catch((err: Error) => setNotice(err.message));
                }}
                onError={setNotice}
              />
            ) : (
              <ul className="admin-list">
                {posts.map((post) => (
                  <li key={post._id} className="admin-row">
                    <span className="admin-row__main">
                      <span className="admin-row__title">{post.title}</span>
                      <span className="admin-row__sub">
                        <span className={post.visibility === "private" ? "blog-badge" : "admin-visibility"}>
                          {post.visibility}
                        </span>
                        <span>{post.slug}</span>
                      </span>
                    </span>
                    <span className="admin-row__actions">
                      <button
                        type="button"
                        className="admin-btn"
                        onClick={() => {
                          setEditingId(post._id);
                          setNotice(null);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn--danger"
                        onClick={async () => {
                          if (!window.confirm(`Delete "${post.title}" forever?`)) return;
                          try {
                            await api(`/api/admin/posts/${post._id}`, { method: "DELETE" });
                            refresh().catch(() => {});
                          } catch (err) {
                            setNotice(err instanceof Error ? err.message : "Delete failed.");
                          }
                        }}
                      >
                        Delete
                      </button>
                    </span>
                  </li>
                ))}
                {posts.length === 0 ? <p className="blog-empty">No posts yet. Write the first one.</p> : null}
              </ul>
            )}

            <details className="admin-attempts">
              <summary className="admin-attempts__summary">
                Recent login attempts ({attempts.filter((a) => !a.success).length} failed)
              </summary>
              <ul className="admin-attempts__list">
                {attempts.length === 0 ? (
                  <li className="admin-attempts__row">No attempts logged yet.</li>
                ) : (
                  attempts.map((a, i) => (
                    <li key={`${a.createdAt}-${i}`} className="admin-attempts__row">
                      <span className={a.success ? "admin-attempts__ok" : "admin-attempts__bad"}>
                        {a.success ? "OK" : "FAIL"}
                      </span>
                      <span>{a.ip}</span>
                      <span>{new Date(a.createdAt).toLocaleString("en-IN")}</span>
                    </li>
                  ))
                )}
              </ul>
            </details>
          </>
        ) : null}
      </div>
    </main>
  );
}

function LoginForm({ onDone, onError }: { onDone: () => void; onError: (msg: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="admin-form admin-form--narrow"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          await api("/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
          });
          setUsername("");
          setPassword("");
          onDone();
        } catch (err) {
          onError(err instanceof Error ? err.message : "Login failed.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <label className="admin-field">
        <span>Username</span>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />
      </label>
      <label className="admin-field">
        <span>Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </label>
      <button type="submit" className="admin-btn admin-btn--primary" disabled={busy}>
        {busy ? "Checking…" : "Log in"}
      </button>
    </form>
  );
}

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function Editor({
  initial,
  onClose,
  onSaved,
  onError,
}: {
  initial: AdminPost | null;
  onClose: () => void;
  onSaved: () => void;
  onError: (msg: string) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [markdown, setMarkdown] = useState(initial?.markdown ?? "");
  const [links, setLinks] = useState<PostLink[]>(initial?.links ?? []);
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [visibility, setVisibility] = useState<"public" | "private">(initial?.visibility ?? "public");
  const [publishAt, setPublishAt] = useState(initial?.publishAt ? toLocalInput(initial.publishAt) : "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [imagePublicId, setImagePublicId] = useState(initial?.imagePublicId ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const data = await api<{ url: string; publicId: string }>("/api/admin/upload", {
        method: "POST",
        body: form,
      });
      setImageUrl(data.url);
      setImagePublicId(data.publicId);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        markdown,
        links: links.filter((l) => l.label.trim() && l.url.trim()),
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        visibility,
        publishAt: publishAt ? new Date(publishAt).toISOString() : undefined,
        imageUrl,
        imagePublicId,
      };
      if (initial) {
        await api(`/api/admin/posts/${initial._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await api("/api/admin/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      onSaved();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-form">
      <div className="admin-bar">
        <p className="admin-count">{initial ? "Edit post" : "New post"}</p>
        <div className="admin-bar__actions">
          <button type="button" className="admin-btn" onClick={() => setPreview((v) => !v)}>
            {preview ? "Edit" : "Preview"}
          </button>
          <button type="button" className="admin-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            disabled={saving || uploading}
            onClick={save}
          >
            {saving ? "Saving…" : "Save post"}
          </button>
        </div>
      </div>

      {preview ? (
        <div className="admin-preview">
          <h2 className="blog-post__title">{title || "Untitled"}</h2>
          <div className="blog-md">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown || "_Nothing yet._"}</ReactMarkdown>
          </div>
        </div>
      ) : (
        <>
          <label className="admin-field">
            <span>Title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} required />
          </label>
          <label className="admin-field">
            <span>Description (card + SEO)</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={300}
              rows={2}
            />
          </label>
          <div className="admin-field">
            <span>Cover image (uploads to the blog folder)</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) upload(file);
              }}
            />
            {uploading ? <p className="admin-hint">Uploading…</p> : null}
            {imageUrl ? (
              <span className="admin-cover">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Cover preview" />
              </span>
            ) : null}
          </div>
          <label className="admin-field">
            <span>Markdown (`#`, `##`, ``` code supported)</span>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              rows={14}
              spellCheck={false}
            />
          </label>
          <div className="admin-field">
            <span>Links</span>
            {links.map((link, i) => (
              <span key={i} className="admin-linkrow">
                <input
                  value={link.label}
                  placeholder="Label"
                  onChange={(e) =>
                    setLinks(links.map((l, j) => (j === i ? { ...l, label: e.target.value } : l)))
                  }
                />
                <input
                  value={link.url}
                  placeholder="https://…"
                  onChange={(e) =>
                    setLinks(links.map((l, j) => (j === i ? { ...l, url: e.target.value } : l)))
                  }
                />
                <button
                  type="button"
                  className="admin-btn"
                  onClick={() => setLinks(links.filter((_, j) => j !== i))}
                >
                  ✕
                </button>
              </span>
            ))}
            <button
              type="button"
              className="admin-btn"
              onClick={() => links.length < 6 && setLinks([...links, { label: "", url: "" }])}
            >
              + Add link
            </button>
          </div>
          <div className="admin-duo">
            <label className="admin-field">
              <span>Tags (comma separated)</span>
              <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="nextjs, notes" />
            </label>
            <label className="admin-field">
              <span>Visibility</span>
              <select value={visibility} onChange={(e) => setVisibility(e.target.value as "public" | "private")}>
                <option value="public">Public: everyone sees it</option>
                <option value="private">Private: only you</option>
              </select>
            </label>
            <label className="admin-field">
              <span>Publish at (empty = now)</span>
              <input type="datetime-local" value={publishAt} onChange={(e) => setPublishAt(e.target.value)} />
            </label>
          </div>
        </>
      )}
    </div>
  );
}
