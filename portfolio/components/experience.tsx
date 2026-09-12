"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

import { FadeIn, LinesReveal, Parallax } from "@/components/motion";
import { ScrollStack, ScrollStackItem } from "@/components/scroll-stack";
import { certifications, education, experience } from "@/lib/resume";

export function Experience() {
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 0.75", "end 0.4"],
  });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const work = experience.map((job) => ({
    title: job.role,
    org: job.company,
    period: job.period,
    points: job.points,
  }));

  const study = education.map((edu) => ({
    title: edu.degree,
    org: edu.school,
    period: edu.period,
    points: [edu.detail, edu.status].filter(Boolean) as string[],
  }));

  return (
    <section id="experience" className="section-pad">
      <Parallax from={-60} to={60} className="exp-ghost">
        <p>
          The Journey
        </p>
      </Parallax>

      <div className="container-x">
        <div className="eyebrow-row">
          <span className="eyebrow-row__num">04</span>
          <span className="eyebrow-row__center">Path</span>
          <span className="eyebrow-row__right">2020 → Present</span>
        </div>

        <div className="exp-head">
          <LinesReveal
            className="display-lines"
            lines={[
              <span key="a">Work, study,</span>,
              <span key="b">
                repeat, <em>with intent</em>.
              </span>,
            ]}
          />
        </div>

        <div ref={trackRef} className="exp-track">
          <div className="exp-groups">
            {/* Work */}
            <div className="exp-group">
              <div className="exp-line">
                <motion.div
                  className="exp-line__fill"
                  style={{ scaleY: lineScale }}
                />
              </div>
              <p className="exp-group__label">
                <span>Experience</span>
                <span className="exp-group__count">{String(work.length).padStart(2, "0")}</span>
              </p>
              <div className="exp-list">
                {work.map((entry) => (
                  <FadeIn key={entry.title} y={44}>
                    <EntryBlock
                      kind="Work"
                      title={entry.title}
                      org={entry.org}
                      period={entry.period}
                      points={entry.points}
                    />
                  </FadeIn>
                ))}
              </div>
            </div>

            {/* Study */}
            <div className="exp-group">
              <div className="exp-line">
                <motion.div
                  className="exp-line__fill"
                  style={{ scaleY: lineScale }}
                />
              </div>
              <p className="exp-group__label">
                <span>Education</span>
                <span className="exp-group__count">{String(study.length).padStart(2, "0")}</span>
              </p>
              <div className="exp-list">
                {study.map((entry) => (
                  <FadeIn key={entry.title} y={44}>
                    <EntryBlock
                      kind="Education"
                      title={entry.title}
                      org={entry.org}
                      period={entry.period}
                      points={entry.points}
                    />
                  </FadeIn>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Certifications stack */}
        <div className="exp-certs">
          <p className="exp-group__label exp-certs__label">
            <span>Certifications</span>
            <span className="exp-group__count">{String(certifications.length).padStart(2, "0")}</span>
          </p>
          <ScrollStack itemDistance={60} itemScale={0.04} baseScale={0.88}>
            {certifications.map((cert) => (
              <ScrollStackItem key={cert.name}>
                <a
                  href={cert.url}
                  target="_blank"
                  rel="noreferrer"
                  className="stack-cert"
                  aria-label={`${cert.name} (verify certificate)`}
                >
                  <span
                    className="stack-cert__imgwrap"
                    style={{
                      position: "relative",
                      display: "block",
                      width: "100%",
                      aspectRatio: "16 / 9",
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      src={encodeURI(cert.image)}
                      alt={cert.name}
                      fill
                      sizes="(max-width: 1024px) 90vw, 70vw"
                    />
                  </span>
                  <span className="stack-cert__meta">
                    <span className="stack-cert__name">{cert.name}</span>
                    <span className="stack-cert__verify">
                      Verify
                      <ArrowUpRight className="icon-4" aria-hidden="true" />
                    </span>
                  </span>
                </a>
              </ScrollStackItem>
            ))}
          </ScrollStack>
        </div>
      </div>
    </section>
  );
}

function EntryBlock({
  kind,
  title,
  org,
  period,
  points,
}: {
  kind: string;
  title: string;
  org: string;
  period: string;
  points: string[];
}) {
  return (
    <div className="exp-entry">
      {/* node */}
      <span className="exp-entry__node" />

      <div className="exp-entry__main">
        <div className="exp-entry__kicker">
          <span className="exp-entry__kind">
            {kind}
          </span>
          <span className="exp-entry__period">
            {period}
          </span>
        </div>
        <h3 className="exp-entry__title">
          {title}
        </h3>
        <p className="exp-entry__org">
          {org}
        </p>
      </div>

      <ul className="exp-entry__points">
        {points.map((point) => (
          <li key={point} className="exp-entry__point">
            <span className="exp-entry__point-dot" />
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}
