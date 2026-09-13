"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function BlogSearch() {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");

  return (
    <form
      className="blog-search"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const q = value.trim();
        const tag = params.get("tag");
        const next = new URLSearchParams();
        if (tag) next.set("tag", tag);
        if (q) next.set("q", q);
        const suffix = next.toString();
        router.push(`/blog${suffix ? `?${suffix}` : ""}`);
      }}
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search posts…"
        aria-label="Search posts"
        maxLength={80}
      />
      <button type="submit" className="admin-btn">
        Search
      </button>
    </form>
  );
}
