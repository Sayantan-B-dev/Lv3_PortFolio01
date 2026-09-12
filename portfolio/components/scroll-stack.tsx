"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

export function ScrollStackItem({
  children,
  itemClassName = "",
}: {
  itemClassName?: string;
  children: ReactNode;
}) {
  return <div className={`scroll-stack-card ${itemClassName}`.trim()}>{children}</div>;
}

interface ScrollStackProps {
  className?: string;
  children: ReactNode;
  itemDistance?: number;
  itemScale?: number;
  itemStackDistance?: number;
  stackPosition?: string;
  scaleEndPosition?: string;
  baseScale?: number;
  rotationAmount?: number;
  blurAmount?: number;
  onStackComplete?: () => void;
}

/**
 * Window-scroll stacking cards (ReactBits-style, no inner Lenis:
 * it rides the page's own scroll so it never fights SmoothScroll).
 * Tune via props; all have the same defaults as the original.
 */
export function ScrollStack({
  children,
  className = "",
  itemDistance = 100,
  itemScale = 0.03,
  itemStackDistance = 30,
  stackPosition = "20%",
  scaleEndPosition = "10%",
  baseScale = 0.85,
  rotationAmount = 0,
  blurAmount = 0,
  onStackComplete,
}: ScrollStackProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cfgRef = useRef({
    itemDistance,
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    rotationAmount,
    blurAmount,
  });
  cfgRef.current = {
    itemDistance,
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    rotationAmount,
    blurAmount,
  };
  const doneRef = useRef(onStackComplete);
  doneRef.current = onStackComplete;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const cfg = cfgRef.current;
    const cards = Array.from(root.querySelectorAll<HTMLElement>(".scroll-stack-card"));
    const end = root.querySelector<HTMLElement>(".scroll-stack-end");
    const lastT = new Map<number, { ty: number; s: number; r: number; b: number }>();
    let tops: number[] = [];
    let endTop = 0;
    let raf = 0;
    let queued = false;
    let dead = false;

    const pct = (v: string, h: number) =>
      v.includes("%") ? (parseFloat(v) / 100) * h : parseFloat(v);
    const prog = (y: number, s: number, e: number) =>
      y < s ? 0 : y > e ? 1 : (y - s) / (e - s);

    cards.forEach((card, i) => {
      if (i < cards.length - 1) card.style.marginBottom = `${cfg.itemDistance}px`;
      card.style.willChange = "transform, filter";
      card.style.transformOrigin = "top center";
    });

    const measure = () => {
      // transforms don't move layout, but clear them for a true reading
      cards.forEach((c) => {
        c.style.transform = "";
        c.style.filter = "";
      });
      lastT.clear();
      const y = window.scrollY;
      tops = cards.map((c) => c.getBoundingClientRect().top + y);
      endTop = end ? end.getBoundingClientRect().top + y : document.body.scrollHeight;
      update();
    };

    const update = () => {
      queued = false;
      if (dead || !cards.length) return;
      const c = cfgRef.current;
      const y = window.scrollY;
      const vh = window.innerHeight;
      const stackPx = pct(c.stackPosition, vh);
      const scalePx = pct(c.scaleEndPosition, vh);

      let topIdx = 0;
      for (let j = 0; j < cards.length; j++) {
        if (y >= tops[j] - stackPx - c.itemStackDistance * j) topIdx = j;
      }

      cards.forEach((card, i) => {
        const trigS = tops[i] - stackPx - c.itemStackDistance * i;
        const trigE = tops[i] - scalePx;
        const p = prog(y, trigS, trigE);
        const target = c.baseScale + i * c.itemScale;
        const s = 1 - p * (1 - target);
        const r = c.rotationAmount ? i * c.rotationAmount * p : 0;
        const b = c.blurAmount && i < topIdx ? (topIdx - i) * c.blurAmount : 0;

        const pinS = trigS;
        const pinE = endTop - vh / 2;
        let ty = 0;
        if (y >= pinS && y <= pinE) ty = y - tops[i] + stackPx + c.itemStackDistance * i;
        else if (y > pinE) ty = pinE - tops[i] + stackPx + c.itemStackDistance * i;

        const nt = {
          ty: Math.round(ty * 100) / 100,
          s: Math.round(s * 1000) / 1000,
          r: Math.round(r * 100) / 100,
          b: Math.round(b * 100) / 100,
        };
        const lt = lastT.get(i);
        if (
          !lt ||
          Math.abs(lt.ty - nt.ty) > 0.1 ||
          Math.abs(lt.s - nt.s) > 0.001 ||
          Math.abs(lt.r - nt.r) > 0.1 ||
          Math.abs(lt.b - nt.b) > 0.1
        ) {
          card.style.transform = `translate3d(0, ${nt.ty}px, 0) scale(${nt.s}) rotate(${nt.r}deg)`;
          card.style.filter = nt.b > 0 ? `blur(${nt.b}px)` : "";
          lastT.set(i, nt);
        }
      });
    };

    const queue = () => {
      if (!queued) {
        queued = true;
        raf = requestAnimationFrame(update);
      }
    };

    measure();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);
    const fonts = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts;
    if (fonts?.ready) fonts.ready.then(measure).catch(() => {});

    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", measure);
      window.removeEventListener("load", measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={rootRef} className={className ? `scroll-stack ${className}` : "scroll-stack"}>
      <div className="scroll-stack-inner">
        {children}
        <div className="scroll-stack-end" aria-hidden="true" />
      </div>
    </div>
  );
}

export default ScrollStack;
