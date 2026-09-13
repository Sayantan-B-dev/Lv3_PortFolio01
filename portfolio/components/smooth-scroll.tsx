"use client";

import { useEffect } from "react";
import Lenis from "lenis";

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    let rafId = 0;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Manual anchor flights (Lenis parked while flying): deterministic 2s
    // glide home for #top, quick hops for nearby sections.
    let flight = 0;
    const cancelFlight = () => {
      if (flight) {
        cancelAnimationFrame(flight);
        flight = 0;
        lenis.start();
      }
    };
    const flyTo = (targetY: number, duration: number) => {
      cancelFlight();
      lenis.stop();
      const startY = window.scrollY;
      const dist = targetY - startY;
      if (Math.abs(dist) < 2) {
        lenis.start();
        return;
      }
      const t0 = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / (duration * 1000));
        window.scrollTo(0, startY + dist * easeInOutCubic(t));
        if (t < 1) {
          flight = requestAnimationFrame(step);
        } else {
          flight = 0;
          lenis.start();
        }
      };
      flight = requestAnimationFrame(step);
    };

    // grabbing the wheel/touch mid-flight hands control back instantly
    window.addEventListener("wheel", cancelFlight, { passive: true });
    window.addEventListener("touchmove", cancelFlight, { passive: true });

    // Anchor links -> manual glide
    const handleClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest?.('a[href^="#"],a[href^="/#"]');
      if (!anchor) return;
      const href = (anchor as HTMLAnchorElement).getAttribute("href");
      if (!href) return;
      const hashIndex = href.indexOf("#");
      if (hashIndex === -1) return;
      const hash = href.slice(hashIndex);
      if (!hash || hash === "#") return;
      const el = document.querySelector(hash);
      if (!el) {
        // Target lives on another page: back-to-top still glides home here,
        // anything else navigates home and lets the native anchor land.
        event.preventDefault();
        if (hash === "#top") {
          flyTo(0, 2);
        } else {
          window.location.href = `/${hash}`;
        }
        return;
      }
      event.preventDefault();
      // make sure a stuck body lock (mobile menu) never traps the flight
      document.body.style.overflow = "";
      const dest = Math.max(
        0,
        (el as HTMLElement).getBoundingClientRect().top + window.scrollY - 72
      );
      const dist = Math.abs(dest - window.scrollY);
      const duration = hash === "#top" ? 2 : Math.min(2.5, Math.max(1, dist / 1400));
      flyTo(dest, duration);
    };

    document.addEventListener("click", handleClick);

    // Re-measure scroll limits as late content (fonts, images, WebGL) lands,
    // so the very bottom of the page stays reachable.
    const handleResize = () => lenis.resize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("load", handleResize);
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => lenis.resize()).catch(() => {});
    }

    return () => {
      cancelFlight();
      cancelAnimationFrame(rafId);
      document.removeEventListener("click", handleClick);
      window.removeEventListener("wheel", cancelFlight);
      window.removeEventListener("touchmove", cancelFlight);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("load", handleResize);
      lenis.start();
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
