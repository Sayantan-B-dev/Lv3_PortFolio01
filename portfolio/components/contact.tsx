"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowUpRight, Mail, MapPin } from "lucide-react";

import { GithubIcon, LinkedinIcon } from "@/components/icons";
import { FadeIn, LinesReveal } from "@/components/motion";
import { GridDistortion } from "@/components/grid-distortion";
import { profile } from "@/lib/resume";

const faqs = [
  {
    q: "Who is Sayantan Bharati?",
    a: "Sayantan Bharati is a Full Stack Developer from Kolkata, India. He builds production-ready web applications with the MERN stack, Next.js and TypeScript, covering everything from database design and secure REST APIs to responsive, user-focused interfaces.",
  },
  {
    q: "What services does Sayantan offer?",
    a: "Full-stack web development: scalable MERN and Next.js applications, secure session and token authentication, REST API design, Redis caching, PostgreSQL and MongoDB data modeling, plus pixel-level frontends with WebGL and Canvas effects.",
  },
  {
    q: "What is his tech stack?",
    a: "Frontend: React, Next.js 16, TypeScript, Tailwind CSS, D3.js and WebGL. Backend: Node.js, Express.js, MongoDB, PostgreSQL, Redis, JWT and NextAuth. Tooling: Git, Vercel, Cloudinary, ImageKit and Razorpay.",
  },
  {
    q: "Is Sayantan available for freelance or full-time work?",
    a: "Yes. He is open to both freelance projects and full-time Full Stack Developer roles. Send an email and expect a reply within a day.",
  },
  {
    q: "Where is he based, and does he work remotely?",
    a: "He is based in Kolkata, India and works remotely with clients worldwide across time zones.",
  },
  {
    q: "What has he shipped so far?",
    a: "Production projects include Re-Docs (MERN knowledge platform), BlueEye (artist discovery and booking on Next.js with Redis and WebGL) and LnkZoo (community link discovery with PostgreSQL and Groq AI). He also managed 900+ client projects as a freelance music producer and sound engineer.",
  },
  {
    q: "How fast does he reply to new inquiries?",
    a: "Within a day. Use the email button above or connect on GitHub and LinkedIn.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

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

            {/* SEO FAQ thread */}
            <FadeIn delay={0.1} className="contact-faq">
              <p className="contact-label">
                Questions, answered
              </p>
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
              />
              <div className="contact-faq__list">
                {faqs.map((faq) => (
                  <details key={faq.q} className="contact-faq__item" name="contact-faq">
                    <summary className="contact-faq__q">
                      <span>{faq.q}</span>
                    </summary>
                    <p className="contact-faq__a">{faq.a}</p>
                  </details>
                ))}
              </div>
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
