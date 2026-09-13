"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

import { GithubIcon, LinkedinIcon } from "@/components/icons";
import { navLinks, profile } from "@/lib/resume";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const pathname = usePathname();
  const onHome = pathname === "/";
  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>());
  const [pill, setPill] = useState({ left: 0, width: 0, show: false });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // lock body scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open ]);

  // scroll-spy: which section owns the viewport middle
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    navLinks.forEach((link) => {
      const el = document.getElementById(link.href.slice(1));
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // slide the white oval to the active link
  useEffect(() => {
    const update = () => {
      const nav = navRef.current;
      const link = active ? linkRefs.current.get(active) : undefined;
      if (nav && link) {
        const n = nav.getBoundingClientRect();
        const r = link.getBoundingClientRect();
        setPill({ left: r.left - n.left, width: r.width, show: true });
      } else {
        setPill((p) => ({ ...p, show: false }));
      }
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("load", update);
    if (document.fonts?.ready) {
      document.fonts.ready.then(update).catch(() => {});
    }
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("load", update);
    };
  }, [active ]);

  return (
    <header className={scrolled || open ? "site-header site-header--scrolled" : "site-header"}>
      <div className="site-header__inner">
        {/* monogram */}
        <a href={onHome ? "#top" : "/"} className="site-header__brand" onClick={() => setOpen(false)}>
          <span className="site-header__brand-name">Sayantan</span>
          <span className="site-header__brand-accent">
            B dev
          </span>
        </a>

        {/* center links */}
        <nav ref={navRef} className="site-header__nav">
          <span
            aria-hidden="true"
            className={pill.show ? "site-header__pill site-header__pill--show" : "site-header__pill"}
            style={{ left: pill.left, width: pill.width }}
          />
          {navLinks.map((link, i) => (
            <a
              key={link.href}
              ref={(el) => {
                if (el) linkRefs.current.set(link.href, el);
                else linkRefs.current.delete(link.href);
              }}
              href={link.href}
              className={
                active === link.href
                  ? "site-header__nav-link site-header__nav-link--active"
                  : "site-header__nav-link"
              }
            >
              <span className="site-header__nav-index">0{i + 1}</span>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="site-header__actions">
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="site-header__icon-btn"
          >
            <GithubIcon className="icon-4" />
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="site-header__icon-btn"
          >
            <LinkedinIcon className="icon-4" />
          </a>
          <a
            href="/blog"
            className="site-header__blog"
          >
            Blog
          </a>
          <a
            href="#contact"
            className="site-header__cta"
          >
            Hire me
          </a>
          <button
            type="button"
            className="site-header__burger"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="icon-5" aria-hidden="true" /> : <Menu className="icon-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* mobile menu */}
      {open && (
        <nav className="site-header__mobile-nav">
          {navLinks.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              className={
                active === link.href
                  ? "site-header__mobile-link site-header__mobile-link--active"
                  : "site-header__mobile-link"
              }
              onClick={() => setOpen(false)}
            >
              <span className="site-header__nav-index">0{i + 1}</span>
              {link.label}
            </a>
          ))}
          <a
            href="/blog"
            className="site-header__mobile-link"
            onClick={() => setOpen(false)}
          >
            <span className="site-header__nav-index">06</span>
            Blog
          </a>
          <a
            href="#contact"
            className="site-header__mobile-cta"
            onClick={() => setOpen(false)}
          >
            Hire me
          </a>
        </nav>
      )}
    </header>
  );
}
