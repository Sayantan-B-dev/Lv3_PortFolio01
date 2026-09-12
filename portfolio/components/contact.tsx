"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowUpRight, Mail, MapPin } from "lucide-react";

import { GithubIcon, LinkedinIcon } from "@/components/icons";
import { FadeIn, LinesReveal } from "@/components/motion";
import { GridDistortion } from "@/components/grid-distortion";
import { certifications, profile } from "@/lib/resume";

export function Contact() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1]);

  return (
    <section ref={ref} id="contact" className="section-pad--contact">
      {/* ambient glow */}
      <div className="contact-glow">
        <div className="contact-glow__orb" />
      </div>

      <motion.div style={{ scale }}>
        <div className="container-x">
          <div className="eyebrow-row">
            <span className="eyebrow-row__num">05</span>
            <span className="eyebrow-row__center">Contact</span>
            <span className="eyebrow-row__right">Replies within a day</span>
          </div>

          <div className="contact-head">
            <LinesReveal
              className="display-lines display-lines--contact"
              lines={[
                <span key="a">Let&apos;s build</span>,
                <span key="b">
                  something <em>together</em>.
                </span>,
              ]}
            />
          </div>

          <FadeIn delay={0.2}>
            <a
              href={`mailto:${profile.email}`}
              className="contact-email"
            >
              <Mail className="icon-6 contact-email__icon" aria-hidden="true" />
              <span className="contact-email__addr">Send me an email</span>
              <ArrowUpRight className="icon-6 contact-email__arrow" aria-hidden="true" />
            </a>
          </FadeIn>

          <div className="contact-grid">
            {/* Socials, squeezed a bit to make room for me2 */}
            <FadeIn className="contact-elsewhere">
              <div className="contact-socials">
                <p className="contact-label">
                  Elsewhere
                </p>
                <SocialRow href={profile.github} icon={<GithubIcon className="icon-5" />} label="GitHub" handle="@Sayantan-B-dev" />
                <SocialRow href={profile.linkedin} icon={<LinkedinIcon className="icon-5" />} label="LinkedIn" handle="Sayantan Bharati" />
                <SocialRow href="https://maps.google.com/?q=Kolkata,India" icon={<MapPin className="icon-5" />} label="Based in" handle="Kolkata, India" />
              </div>
            </FadeIn>

            {/* me2 with GridDistortion hover effect */}
            <FadeIn delay={0.05} className="contact-photo">
              <div className="contact-photo__frame">
                <GridDistortion
                  imageSrc="/me2.webp"
                  grid={20}
                  mouse={0.1}
                  strength={0.1}
                  relaxation={0.9}
                  className="contact-distortion"
                />
              </div>
            </FadeIn>

            {/* Certifications */}
            <FadeIn delay={0.1} className="contact-certs">
              <p className="contact-label">
                Certifications
              </p>
              <ul className="contact-certs__list">
                {certifications.map((cert) => (
                  <li key={cert.name}>
                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noreferrer"
                      className="contact-certs__link"
                    >
                      <span className="contact-certs__name">
                        {cert.name}
                      </span>
                      <span className="contact-certs__right">
                        <span className="contact-certs__verify">
                          Verify
                        </span>
                        <ArrowUpRight className="icon-5 contact-certs__arrow" aria-hidden="true" />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </FadeIn>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function SocialRow({
  href,
  icon,
  label,
  handle,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  handle: string;
}) {
  return (
    <a
      href={href}
      {...(href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
      className="social-row"
    >
      <span className="social-row__left">
        <span className="social-row__icon">{icon}</span>
        <span className="social-row__texts">
          <span className="social-row__label">{label}</span>
          <span className="social-row__handle">{handle}</span>
        </span>
      </span>
      <ArrowUpRight className="icon-4 social-row__arrow" aria-hidden="true" />
    </a>
  );
}
