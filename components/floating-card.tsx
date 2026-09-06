"use client";

import {
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

export function FloatingCard() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // X position: travel across screen with sine wave oscillation
  const x = useTransform(scrollYProgress, (p) => {
    const travel = (p - 0.5) * 300;
    const wave = Math.sin(p * Math.PI * 4) * 70;
    return travel + wave;
  });

  // Y position: gentle sine wave up-down
  const y = useTransform(scrollYProgress, (p) => {
    return Math.sin(p * Math.PI * 3) * 35 - 15;
  });

  // Rotation follows sine wave
  const rotate = useTransform(scrollYProgress, (p) => {
    return Math.sin(p * Math.PI * 2) * 12;
  });

  // Scale: starts hidden, appears, stays, then fades
  const scale = useTransform(scrollYProgress, [0, 0.12, 0.2, 0.75, 0.9, 1], [0, 0, 0.95, 1, 1, 0]);

  // Opacity: fades in when emerging, stays, fades out before footer
  const opacity = useTransform(scrollYProgress, [0, 0.12, 0.2, 0.8, 0.92, 1], [0, 0, 1, 1, 1, 0]);

  // Glow opacity
  const glowOpacity = useTransform(scrollYProgress, [0, 0.2, 0.75, 0.92, 1], [0, 0.6, 0.6, 0.4, 0]);

  return (
    <section ref={sectionRef} className="floating-wrap">
      <div className="floating-void" />

      <motion.div
        style={{
          x,
          y,
          rotate,
          scale,
          opacity,
          zIndex: 50,
          cursor: "grab",
        }}
        className="floating-card"
      >
        {/* Glow behind card */}
        <motion.div
          className="floating-card__glow"
          style={{ opacity: glowOpacity }}
        />

        {/* The floating card */}
        <div
          className="floating-card__box"
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Image */}
          <div className="floating-card__img">
            <Image
              src="/me.webp"
              alt="Sayantan Bharati"
              fill
              priority
              sizes="(max-width: 768px) 40vw, 320px"
            />
          </div>

          {/* Golden overlay */}
          <div className="floating-card__shade" />

          {/* Bottom info */}
          <div className="floating-card__meta">
            <div className="floating-card__meta-inner">
              <span className="gold-text floating-card__name">
                Sayantan Bharati
              </span>
              <span className="floating-card__role">
                Full Stack Developer
              </span>
            </div>
          </div>

          {/* Shine effect */}
          <div className="floating-card__shine">
            <div className="floating-card__shine-bar" />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
