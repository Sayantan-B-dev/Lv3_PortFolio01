"use client";

import { useEffect, useState } from "react";
import { ArrowUp, Mail } from "lucide-react";

import { Marquee } from "@/components/marquee";
import { GithubIcon, LinkedinIcon } from "@/components/icons";
import { navLinks, profile } from "@/lib/resume";

function useKolkataTime() {
  const [time, setTime] = useState("--:--");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Kolkata",
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export function Footer() {
  const time = useKolkataTime();
  return (
    <footer className="site-footer">
      <div className="container-x">
        {/* giant wordmark */}
        <a href="#top" className="site-footer__giant" aria-label="Back to top">
          Sayantan Bharati<span className="site-footer__giant-dot">.</span>
        </a>

        {/* link columns */}
        <div className="site-footer__grid">
          <div className="site-footer__col">
            <p className="site-footer__col-title">Menu</p>
            <ul className="site-footer__links-col">
              {navLinks.map((link, i) => (
                <li key={link.href}>
                  <a href={link.href} className="site-footer__col-link">
                    <span className="site-header__nav-index">0{i + 1}</span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="site-footer__col">
            <p className="site-footer__col-title">Elsewhere</p>
            <ul className="site-footer__links-col">
              <li>
                <a href={profile.github} target="_blank" rel="noreferrer" className="site-footer__col-link">
                  <GithubIcon className="icon-4" />
                  GitHub
                </a>
              </li>
              <li>
                <a href={profile.linkedin} target="_blank" rel="noreferrer" className="site-footer__col-link">
                  <LinkedinIcon className="icon-4" />
                  LinkedIn
                </a>
              </li>
              <li>
                <a href={`mailto:${profile.email}`} className="site-footer__col-link">
                  <Mail className="icon-4" />
                  Send an email
                </a>
              </li>
            </ul>
          </div>

          <div className="site-footer__col">
            <p className="site-footer__col-title">Contact</p>
            <p className="site-footer__blurb">
              {profile.role} {profile.stack} — building production-ready web apps from Kolkata, India.
            </p>
            <a href={`mailto:${profile.email}`} className="site-footer__mail">
              Send an email
            </a>
            <p className="site-footer__blurb-dim">Replies within a day.</p>
          </div>
        </div>
      </div>

      {/* ticker divider */}
      <div className="site-footer__ticker">
        <Marquee
          speed={44}
          items={[
            "Designed & built in Kolkata",
            "© 2026 Sayantan Bharati",
            "React + Next.js + Three.js",
            "Open to freelance & full-time",
          ]}
          className="site-footer__marquee"
        />
      </div>

      <div className="container-x">
        <div className="site-footer__row">
          <p className="site-footer__copy">
            © {new Date().getFullYear()} {profile.name}
          </p>
          <p className="site-footer__copy">
            Kolkata, IN — <span className="site-footer__time">{time} IST</span>
          </p>
          <a href="#top" className="site-footer__link">
            Back to top
            <ArrowUp className="icon-3-5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
