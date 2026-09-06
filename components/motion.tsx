"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * On small screens the scroll-triggered (IntersectionObserver) reveals can
 * misfire and leave headings stuck invisible — so mobile renders the final
 * state immediately with a pure-CSS entrance instead. Desktop keeps framer.
 */
function useInstantReveal() {
  const [instant, setInstant] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setInstant(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return instant;
}

/** Slow fade + rise when the element scrolls into view. */
export function FadeIn({
  children,
  className,
  delay = 0,
  y = 40,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
}) {
  const instant = useInstantReveal();
  if (instant) {
    return (
      <div
        className={className ? `${className} motion-safe-in` : "motion-safe-in"}
        style={{ animationDelay: `${delay}s` }}
      >
        {children}
      </div>
    );
  }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-10% 0px" }}
      transition={{ duration: 1.1, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Split a heading into per-line masked reveals. Pass lines as an array. */
export function LinesReveal({
  lines,
  className,
  lineClassName,
  delay = 0,
}: {
  lines: ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
}) {
  const instant = useInstantReveal();
  if (instant) {
    return (
      <span className={className}>
        {lines.map((line, i) => (
          <span key={i} className="reveal-mask">
            <span
              className={
                lineClassName
                  ? `reveal-line motion-safe-in ${lineClassName}`
                  : "reveal-line motion-safe-in"
              }
              style={{ animationDelay: `${delay + i * 0.12}s` }}
            >
              {line}
            </span>
          </span>
        ))}
      </span>
    );
  }
  return (
    <span className={className}>
      {lines.map((line, i) => (
        <span key={i} className="reveal-mask">
          <motion.span
            className={lineClassName ? `reveal-line ${lineClassName}` : "reveal-line"}
            initial={{ y: "115%", rotate: 2 }}
            whileInView={{ y: 0, rotate: 0 }}
            viewport={{ once: true, margin: "-12% 0px" }}
            transition={{ duration: 1.15, delay: delay + i * 0.12, ease: EASE }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/** Scroll-linked parallax: children translate slower/faster than scroll. */
export function Parallax({
  children,
  className,
  from = 60,
  to = -60,
}: {
  children: ReactNode;
  className?: string;
  from?: number;
  to?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [from, to]);

  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  );
}

/** Word-by-word color wipe for editorial statements. */
export function WordReveal({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const instant = useInstantReveal();
  if (instant) {
    const words = text.split(" ");
    return (
      <span className={className}>
        {words.map((word, i) => (
          <span key={i} className="reveal-word">
            <span
              className="reveal-word__inner motion-safe-in"
              style={{ animationDelay: `${delay + i * 0.035}s` }}
            >
              {word}
              {i < words.length - 1 ? "\u00A0" : ""}
            </span>
          </span>
        ))}
      </span>
    );
  }
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, i) => (
        <span key={i} className="reveal-word">
          <motion.span
            className="reveal-word__inner"
            initial={{ y: "110%" }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, margin: "-8% 0px" }}
            transition={{ duration: 0.9, delay: delay + i * 0.035, ease: EASE }}
          >
            {word}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
