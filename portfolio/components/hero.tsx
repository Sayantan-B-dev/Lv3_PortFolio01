"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { ArrowDown, Mail, RotateCcw } from "lucide-react";

import { GlobeCanvas } from "@/components/globe";
import { GridDistortion } from "@/components/grid-distortion";
import { GithubIcon, LinkedinIcon } from "@/components/icons";
import { LinesReveal } from "@/components/motion";
import { profile } from "@/lib/resume";

const chips = ["MERN", "Next.js 16", "WebGL", "Redis", "PostgreSQL", "TypeScript"];

const TUNE_DEFAULTS = {
  spin: 1,
  tilt: -0.42,
  magnet: 1,
  size: 25,
  accent: "#c4b5fd",
};

const ACCENTS = ["#c4b5fd", "#67e8f9", "#f0abfc", "#fcd34d"];

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [spin, setSpin] = useState(TUNE_DEFAULTS.spin);
  const [tilt, setTilt] = useState(TUNE_DEFAULTS.tilt);
  const [magnet, setMagnet] = useState(TUNE_DEFAULTS.magnet);
  const [psize, setPsize] = useState(TUNE_DEFAULTS.size);
  const [accent, setAccent] = useState(TUNE_DEFAULTS.accent);
  const resetTune = () => {
    setSpin(TUNE_DEFAULTS.spin);
    setTilt(TUNE_DEFAULTS.tilt);
    setMagnet(TUNE_DEFAULTS.magnet);
    setPsize(TUNE_DEFAULTS.size);
    setAccent(TUNE_DEFAULTS.accent);
  };

  // Scroll-linked: globe rises + card will pop out on scroll
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const globeY = useTransform(scrollYProgress, [0, 0.8], [0, -40]);
  const globeRotate = useTransform(scrollYProgress, [0, 1], [0, 8]);
  const typeY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const fade = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section
      ref={sectionRef}
      id="top"
      className="hero"
    >
      {/* Aurora backdrop */}
      <div className="hero__backdrop">
        <div className="hero__orb hero__orb--a aurora-orb" />
        <div className="hero__orb hero__orb--b aurora-orb" style={{ animationDelay: "-6s" }} />
        <div className="hero__fade" />
        {/* giant ghost word */}
        <motion.p
          aria-hidden="true"
          style={{ y: typeY }}
          className="hero__ghost"
        >
          DEVELOPER
        </motion.p>
      </div>

      <div className="hero__inner">
        {/* top meta row */}
        <motion.div
          style={{ opacity: fade }}
          className="hero__meta"
        >
          <span>Full Stack Developer</span>
          <span className="hero__live">
            <span className="hero__pulse">
              <span className="hero__pulse-ring" />
              <span className="hero__pulse-dot" />
            </span>
            Open to opportunities
          </span>
          <span>Kolkata, India · 2026</span>
        </motion.div>

        {/* Two column: left (type + portrait), globe right */}
        <div className="hero__grid">
          {/* Left: Type with wrapped portrait */}
          <motion.div style={{ opacity: fade }} className="hero__left">
            <p className="hero__kicker">
              Hi, I&apos;m
            </p>

            <h1 className="hero__title">
              <LinesReveal
                lines={[
                  <span key="a">Sayantan</span>,
                  <span key="b" className="hero__title-serif">Bharati</span>,
                ]}
              />
            </h1>

            {/* Portrait floats inside the text like a book layout */}
            <div className="hero__portrait">
              <GridDistortion
                imageSrc="/me.webp"
                grid={30}
                mouse={0.05}
                strength={0.15}
                relaxation={0.9}
              />
            </div>

            <div className="hero__copy">
              <p className="hero__lede">
                {profile.role} crafting production-grade{" "}
                <span className="hero__lede-strong">{profile.stack}</span> products:
                secure APIs, expressive interfaces, and a few particles.
              </p>
              <div className="hero__cta-row">
                <a
                  href="#work"
                  className="hero__btn-primary"
                >
                  Explore work
                  <ArrowDown className="icon-4" aria-hidden="true" />
                </a>
                <a
                  href="#contact"
                  className="hero__btn-ghost"
                >
                  <Mail className="icon-4" aria-hidden="true" />
                  Get in touch
                </a>
              </div>
              <div className="hero__socials">
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                  className="hero__social-link"
                >
                  <GithubIcon className="icon-5" />
                  GitHub
                </a>
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className="hero__social-link"
                >
                  <LinkedinIcon className="icon-5" />
                  LinkedIn
                </a>
              </div>
            </div>
          </motion.div>

          {/* Right: 3D globe - free overflow, bigger */}
          <motion.div
            style={{ y: globeY, rotate: globeRotate }}
            className="hero__right"
          >

            {/* Globe container with dotted border */}
            <div className="hero__globe-box">
              <p className="hero__globe-quote">Boredom scares me.</p>
              {/* Globe canvas - directly placed */}
              <GlobeCanvas
                accentColor={accent}
                tune={{ rotationSpeed: spin, tiltX: tilt, magnet, pointSize: psize }}
                className="globe-particles-canvas hero__globe-canvas"
              />
              {/* floating chips around globe */}
              <div className="hero__chip hero__chip--0">
                <Chip className="float-y">{chips[0]}</Chip>
              </div>
              <div className="hero__chip hero__chip--1">
                <Chip className="float-y" delay="-1.4s">{chips[1]}</Chip>
              </div>
              <div className="hero__chip hero__chip--2">
                <Chip className="float-y" delay="-2.6s">{chips[2]}</Chip>
              </div>
              <div className="hero__chip hero__chip--3">
                <Chip className="float-y" delay="-0.8s">{chips[3]}</Chip>
              </div>
              <div className="hero__chip hero__chip--4">
                <Chip className="float-y" delay="-2s">{chips[4]}</Chip>
              </div>
              <div className="hero__chip hero__chip--5">
                <Chip className="float-y" delay="-3.1s">{chips[5]}</Chip>
              </div>
              {/* mini tune panel with fun params, right on the box */}
              <div className="globe-tune">
                <div className="globe-tune__head">
                  <span>Playground</span>
                  <button type="button" className="globe-tune__reset" onClick={resetTune} aria-label="Reset globe">
                    <RotateCcw className="icon-3" aria-hidden="true" />
                  </button>
                </div>
                <label className="globe-tune__row">
                  <span>Spin</span>
                  <input type="range" min={0} max={2.5} step={0.05} value={spin} onChange={(e) => setSpin(Number(e.target.value))} />
                </label>
                <label className="globe-tune__row">
                  <span>Tilt</span>
                  <input type="range" min={-1} max={0.5} step={0.01} value={tilt} onChange={(e) => setTilt(Number(e.target.value))} />
                </label>
                <label className="globe-tune__row">
                  <span>Magnet</span>
                  <input type="range" min={0} max={2} step={0.05} value={magnet} onChange={(e) => setMagnet(Number(e.target.value))} />
                </label>
                <label className="globe-tune__row">
                  <span>Pixels</span>
                  <input type="range" min={10} max={45} step={1} value={psize} onChange={(e) => setPsize(Number(e.target.value))} />
                </label>
                <div className="globe-tune__dots">
                  {ACCENTS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={c === accent ? "globe-tune__dot globe-tune__dot--active" : "globe-tune__dot"}
                      style={{ background: c }}
                      onClick={() => setAccent(c)}
                      aria-label={`Globe color ${c}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* bottom hint */}
        <div className="hero__hint">
          <span>Scroll to explore</span>
          <span className="hero__hint-desktop">The card emerges ↓</span>
        </div>
      </div>
    </section>
  );
}

function Chip({
  children,
  className,
  delay,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: string;
}) {
  return (
    <span
      className={className ? `chip ${className}` : "chip"}
      style={{ animationDelay: delay }}
    >
      {children}
    </span>
  );
}
