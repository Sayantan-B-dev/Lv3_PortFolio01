"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Eye, EyeOff, ImagePlus, LockKeyhole } from "lucide-react";
import Link from "next/link";
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
  const [pendingDelete, setPendingDelete] = useState<AdminPost | null>(null);
  const [deleting, setDeleting] = useState(false);

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
    <main className="page-main page-main--padded">
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
                        {post.visibility === "public" && new Date(post.publishAt).getTime() > Date.now() ? (
                          <span className="blog-badge">Scheduled</span>
                        ) : null}
                        <span>{post.slug}</span>
                      </span>
                    </span>
                    <span className="admin-row__actions">
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="admin-btn"
                      >
                        Visit
                      </Link>
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
                        onClick={() => setPendingDelete(post)}
                      >
                        Delete
                      </button>
                    </span>
                  </li>
                ))}
                {posts.length === 0 ? <p className="blog-empty">No posts yet. Write the first one.</p> : null}
              </ul>
            )}

            {pendingDelete ? (
              <div
                className="admin-modal"
                role="dialog"
                aria-modal="true"
                aria-label="Confirm delete"
                onClick={() => {
                  if (!deleting) setPendingDelete(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape" && !deleting) setPendingDelete(null);
                }}
              >
                <div
                  className="admin-modal__card motion-safe-in"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="admin-modal__title">Delete this post?</p>
                  <p className="admin-modal__body">
                    “{pendingDelete.title}” and its cover image will be gone forever. This cannot be
                    undone.
                  </p>
                  <div className="admin-modal__actions">
                    <button
                      type="button"
                      className="admin-btn"
                      disabled={deleting}
                      onClick={() => setPendingDelete(null)}
                    >
                      Keep it
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn--danger admin-btn--solid-danger"
                      disabled={deleting}
                      autoFocus
                      onClick={async () => {
                        setDeleting(true);
                        try {
                          await api(`/api/admin/posts/${pendingDelete._id}`, { method: "DELETE" });
                          setPendingDelete(null);
                          refresh().catch(() => {});
                        } catch (err) {
                          setNotice(err instanceof Error ? err.message : "Delete failed.");
                          setPendingDelete(null);
                        } finally {
                          setDeleting(false);
                        }
                      }}
                    >
                      {deleting ? "Deleting…" : "Yes, delete"}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            <details className="admin-attempts">
              <summary className="admin-attempts__summary">
                Recent login attempts ({attempts.filter((a) => !a.success).length} failed)
              </summary>
              <ul className="admin-attempts__list" data-lenis-prevent>
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
  const [showPassword, setShowPassword] = useState(false);
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
      <p className="admin-login-title">
        <LockKeyhole className="icon-5" aria-hidden="true" />
        Studio login
      </p>
      <p className="admin-login-sub">Restricted area. One admin only.</p>
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
        <span className="admin-password">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            className="admin-eye"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            {showPassword ? (
              <EyeOff className="icon-4" aria-hidden="true" />
            ) : (
              <Eye className="icon-4" aria-hidden="true" />
            )}
          </button>
        </span>
      </label>
      <button type="submit" className="admin-btn admin-btn--primary" disabled={busy}>
        {busy ? "Checking…" : "Log in"}
      </button>
    </form>
  );
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
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [imagePublicId, setImagePublicId] = useState(initial?.imagePublicId ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [sessionUploads, setSessionUploads] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  /** Fire-and-forget orphan cleanup: never blocks the UI. */
  const destroyOrphans = (ids: string[]) => {
    ids
      .filter(Boolean)
      .forEach((id) =>
        fetch(`/api/admin/upload?publicId=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(
          () => {}
        )
      );
  };

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
      setSessionUploads((prev) => [...prev, data.publicId]);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const acceptFile = (file: File | undefined) => {
    if (!file) return;
    const isWebp = file.type === "image/webp" || /\.webp$/i.test(file.name);
    if (!isWebp) {
      onError("Only .webp images are allowed.");
      return;
    }
    upload(file);
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
        publishAt: new Date().toISOString(),
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
      // Anything uploaded but superseded before saving is an orphan now.
      destroyOrphans(sessionUploads.filter((id) => id !== imagePublicId));
      onSaved();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => {
    // Unsaved session uploads die here. The previously saved cover
    // (initial?.imagePublicId) is never touched, so cancelling an edit
    // always restores the exact previous state.
    destroyOrphans(sessionUploads.filter((id) => id !== initial?.imagePublicId));
    onClose();
  };

  return (
    <div className="admin-form">
      <div className="admin-bar">
        <p className="admin-count">{initial ? "Edit post" : "New post"}</p>
        <div className="admin-bar__actions">
          <button type="button" className="admin-btn" onClick={() => setPreview((v) => !v)}>
            {preview ? "Edit" : "Preview"}
          </button>
          <button type="button" className="admin-btn" onClick={cancel}>
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
        <div className="admin-preview" data-lenis-prevent>
          <h2 className="blog-post__title">{title || "Untitled"}</h2>
          {imageUrl ? (
            <span className="admin-cover admin-cover--preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="Cover preview" />
            </span>
          ) : null}
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
            <span>Cover image (.webp, uploads to the blog folder)</span>
            <div
              className={dragOver ? "admin-dropzone admin-dropzone--over" : "admin-dropzone"}
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                acceptFile(e.dataTransfer.files?.[0]);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileRef.current?.click();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Upload a .webp cover image"
            >
              <ImagePlus className="icon-5" aria-hidden="true" />
              <p>
                <strong>Drag &amp; drop a .webp here</strong>
                <span>or click to browse (max 5 MB)</span>
              </p>
              <input
                ref={fileRef}
                type="file"
                accept=".webp,image/webp"
                hidden
                onChange={(e) => {
                  acceptFile(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </div>
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
              data-lenis-prevent
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
          </div>
        </>
      )}
    </div>
  );
}
