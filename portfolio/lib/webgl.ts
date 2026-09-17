/**
 * webgl.ts: central WebGL capability detection for the portfolio.
 *
 * Every 3D component (GridDistortion, GlobeCanvas, LightTunnel) goes through
 * here so behavior is consistent across current and future mobile GPUs:
 *  - single cached probe (probing itself costs a GL context slot, so do it once)
 *  - WebGL2 requirement (THREE r163+ dropped WebGL1 entirely)
 *  - power tiers to scale particle counts / DPR / AA before a device chokes
 *  - graceful "no WebGL" signal so callers render static fallbacks, never black boxes
 */

export type PowerTier = "high" | "low" | "minimal";

export interface WebGLCaps {
  /** False on SSR and when no WebGL2 context can be created. */
  supported: boolean;
  /** True when the device should get reduced particle counts / DPR. */
  lowPower: boolean;
  /** Power tier used to scale quality. */
  tier: PowerTier;
  /** prefers-reduced-motion. */
  reducedMotion: boolean;
  /** Recommended renderer pixel-ratio cap. */
  maxDpr: number;
}

let cached: WebGLCaps | null = null;

function serverDefaults(): WebGLCaps {
  return {
    supported: true, // render canvas markup on SSR; client effect corrects if needed
    lowPower: false,
    tier: "high",
    reducedMotion: false,
    maxDpr: 2,
  };
}

function detect(): WebGLCaps {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return serverDefaults();
  }

  const coarse =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse)").matches;
  const small =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(max-width: 640px)").matches;
  const reducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const cores =
    typeof navigator !== "undefined" && navigator.hardwareConcurrency
      ? navigator.hardwareConcurrency
      : 8;
  const mem =
    typeof navigator !== "undefined"
      ? (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8
      : 8;

  // One shared probe for the whole page. Never loseContext() it (that logs
  // "WEBGL_lose_context extension not supported" noise); the GC reclaims it.
  let supported = false;
  try {
    const probe = document.createElement("canvas");
    supported =
      probe.getContext("webgl2") !== null ||
      probe.getContext("webgl") !== null;
  } catch {
    supported = false;
  }

  // Tiering: weak silicon gets minimal geometry even on desktop-sized screens.
  let tier: PowerTier = "high";
  if (!supported) {
    tier = "minimal";
  } else if ((coarse && (cores <= 4 || mem <= 4)) || mem <= 2) {
    tier = "minimal";
  } else if (coarse || small || cores <= 4 || mem <= 4) {
    tier = "low";
  }

  return {
    supported,
    lowPower: tier !== "high",
    tier,
    reducedMotion,
    maxDpr: tier === "minimal" ? 1.25 : tier === "low" ? 1.5 : 2,
  };
}

/** Cached capability snapshot. Safe to call during render and on the server. */
export function getWebGLCaps(): WebGLCaps {
  if (!cached) cached = detect();
  return cached;
}

/** For tests / HMR: drop the cached snapshot so the next call re-probes. */
export function resetWebGLCaps() {
  cached = null;
}
