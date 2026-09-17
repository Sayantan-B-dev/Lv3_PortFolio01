"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Atom } from "react-loading-indicators";

const THEME_ATOM = "#c4b5fd";

export function RouteLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Route resolved -> hide.
  useEffect(() => {
    setLoading(false);
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, [pathname]);

  useEffect(() => {
    const show = () => {
      setLoading(true);
      if (timer.current) clearTimeout(timer.current);
      // Safety: never trap the UI if navigation stalls.
      timer.current = setTimeout(() => setLoading(false), 8000);
    };
    const handleClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest?.("a[href]");
      if (!anchor) return;
      const href = (anchor as HTMLAnchorElement).getAttribute("href");
      if (!href) return;
      // Hash-only hops are handled by smooth-scroll, not a page load.
      if (href.startsWith("#") || href.startsWith("/#")) return;
      // External / new-tab / download links: no route transition.
      const target = (anchor as HTMLAnchorElement).getAttribute("target");
      if (target === "_blank") return;
      if (!href.startsWith("/") || href.startsWith("//")) return;
      if ((anchor as HTMLAnchorElement).hasAttribute("download")) return;
      // Same-page search-param shuffle still deserves feedback.
      show();
    };
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  if (!loading) return null;

  return (
    <div className="route-loader" role="status" aria-label="Loading page">
      <div className="route-loader__bar" aria-hidden="true" />
      <div className="route-loader__card">
        <Atom color={THEME_ATOM} size="medium" text="" textColor="" />
        <p className="route-loader__text">Loading…</p>
      </div>
    </div>
  );
}

export default RouteLoader;
