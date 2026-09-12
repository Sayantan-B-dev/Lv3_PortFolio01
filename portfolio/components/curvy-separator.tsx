/* ============================================================
   CurvySeparator: ONE place to tune the in-between lines.
   Tweak CURVY_DEFAULTS below, it applies to EVERY separator
   (About ↔ Projects ↔ Skills ↔ Experience ↔ Contact).

   ── HEARTBEAT PARAMETERS ────────────────────────────────────
   lines:        how many ECG traces (fewer = cleaner)
   amplitude:    R-spike height in px
   wavelength:   px between heartbeats (bigger = calmer)
   thickness:    stroke width in px
   overlap:      px lines bleed into each other (net feel)
   irregularity: 0–1, how much beat heights vary beat-to-beat
                 0 = metronome, 1 = wild ICU monitor
   wander:       baseline wander in px (breathing drift)
   speed:        base loop duration in seconds (lower = faster)
   speedJitter:  random ± seconds added per line
   opacityMin/Max: per-line opacity range
   alternate:    true = even lines →, odd lines ←
   ============================================================ */

export const CURVY_DEFAULTS = {
  lines: 6,
  amplitude: 22,
  wavelength: 100,
  thickness: 1,
  gap: 0,
  overlap: 54,
  irregularity: 5,
  wander: 9,
  speed: 20,
  speedJitter: 10,
  opacityMin: 0.2,
  opacityMax: 0.55,
  alternate: true,
};

interface CurvySeparatorProps {
  seed?: number;
  className?: string;
  /** Override any default just for one instance: leave empty to follow globals. */
  lines?: number;
  amplitude?: number;
  wavelength?: number;
  thickness?: number;
  overlap?: number;
  irregularity?: number;
  wander?: number;
  speed?: number;
}

const SVG_W = 2400;
const STEP = 8;

function gauss(x: number): number {
  return Math.exp(-x * x);
}

/** Deterministic 0–1 pseudo-random from an integer (stable across renders). */
function rand(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

interface LineSpec {
  seedNum: number;
  amp: number;
  wave: number;
  phase: number;
  wanderPhase: number;
}

/**
 * Heartbeat trace: flat baseline + P-QRS-T complex per beat.
 * Beat heights vary randomly (irregularity) so it feels alive.
 */
function heartbeatPath(spec: LineSpec, cfg: typeof CURVY_DEFAULTS, height: number): string {
  const mid = height / 2;
  let d = "";
  for (let x = 0; x <= SVG_W; x += STEP) {
    const beatPos = (x + spec.phase) / spec.wave;
    const beatIndex = Math.floor(beatPos);
    const t = beatPos - beatIndex; // 0–1 within this beat

    // per-beat height variation (deterministic per line+beat)
    const beatRand = rand(spec.seedNum + beatIndex * 17);
    const beatScale = 1 - cfg.irregularity * 0.5 + beatRand * cfg.irregularity;

    // ECG morphology: sharp QRS, soft P + T
    const p = 0.12 * gauss((t - 0.16) / 0.025);
    const q = -0.14 * gauss((t - 0.32) / 0.01);
    const r = 1.0 * gauss((t - 0.36) / 0.008);
    const s = -0.22 * gauss((t - 0.4) / 0.01);
    const tt = 0.28 * gauss((t - 0.62) / 0.045);
    const ecg = (p + q + r + s + tt) * beatScale;

    // wavy baseline: layered breathing drift (more wavy, still heartbeat)
    const wander =
      Math.sin((x / spec.wave) * Math.PI * 2 * 0.5 + spec.wanderPhase) * cfg.wander +
      Math.sin((x / spec.wave) * Math.PI * 2 * 1.3 + spec.wanderPhase * 1.7) * cfg.wander * 0.45;

    const yy = mid - ecg * spec.amp + wander;
    d += x === 0 ? `M0,${yy.toFixed(1)}` : ` L${x},${yy.toFixed(1)}`;
  }
  return d;
}

export function CurvySeparator({ seed = 0, className, ...overrides }: CurvySeparatorProps) {
  const cfg = { ...CURVY_DEFAULTS, ...overrides };
  const viewH = Math.ceil(cfg.amplitude * 2.4 + 16);

  const lines = Array.from({ length: cfg.lines }, (_, i) => {
    const n = i * 31 + seed * 101;
    const amp = cfg.amplitude * (0.8 + rand(n + 1) * 0.4);
    const wave = cfg.wavelength * (0.85 + rand(n + 2) * 0.3);
    const spec: LineSpec = {
      seedNum: n,
      amp,
      wave,
      phase: rand(n + 3) * wave,
      wanderPhase: rand(n + 4) * Math.PI * 2,
    };
    const dur = cfg.speed + rand(n + 50) * cfg.speedJitter - cfg.speedJitter / 2;
    const delay = -(rand(n + 51) * 12);
    const opacity = cfg.opacityMin + rand(n + 52) * (cfg.opacityMax - cfg.opacityMin);
    const toRight = cfg.alternate ? (i + seed) % 2 === 0 : true;
    return { i, spec, dur, delay, opacity, toRight };
  });

  return (
    <div aria-hidden="true" className={className ? `curvy-sep ${className}` : "curvy-sep"}>
      <div className="curvy-sep__track">
        {lines.map((line, idx) => (
          <span
            key={line.i}
            className={line.toRight ? "curvy-line curvy-line--drift-right" : "curvy-line curvy-line--drift-left"}
            style={
              {
                "--curvy-dur": `${line.dur.toFixed(2)}s`,
                "--curvy-delay": `${line.delay.toFixed(2)}s`,
                "--curvy-opacity": line.opacity.toFixed(2),
                height: viewH,
                marginTop: idx === 0 ? 0 : -cfg.overlap,
              } as React.CSSProperties
            }
          >
            <svg
              viewBox={`0 0 ${SVG_W} ${viewH}`}
              preserveAspectRatio="none"
              className="curvy-line__svg"
              style={{ height: viewH }}
            >
              <path
                d={heartbeatPath(line.spec, cfg, viewH)}
                fill="none"
                stroke="currentColor"
                strokeWidth={cfg.thickness}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        ))}
      </div>
    </div>
  );
}

export default CurvySeparator;
