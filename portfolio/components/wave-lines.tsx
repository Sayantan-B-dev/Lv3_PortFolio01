interface WaveLinesProps {
  count?: number;
  seed?: number;
  className?: string;
}

/**
  * WaveLines: 10 thin lines that drift like waves.
 * Even rows go left→right, odd rows go right→left,
 * each with its own duration / delay / opacity (deterministic).
 */
export function WaveLines({ count = 10, seed = 0, className }: WaveLinesProps) {
  const lines = Array.from({ length: count }, (_, i) => {
    const n = i + seed * 3;
    const toRight = n % 2 === 0;
    const duration = 8 + ((n * 2.3) % 6); // 8s – 14s
    const delay = -((n * 1.7) % 12); // desync, negative = mid-flight
    const opacity = 0.28 + ((n * 37) % 50) / 100; // 0.28 – 0.78
    return { i, toRight, duration, delay, opacity };
  });

  return (
    <div aria-hidden="true" className={className ? `wave-sep ${className}` : "wave-sep"}>
      <div className="wave-sep__track">
        {lines.map((line) => (
          <span
            key={line.i}
            className={line.toRight ? "wave-line wave-line--drift-right" : "wave-line wave-line--drift-left"}
            style={
              {
                "--wave-dur": `${line.duration.toFixed(2)}s`,
                "--wave-delay": `${line.delay.toFixed(2)}s`,
                "--wave-opacity": line.opacity.toFixed(2),
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}
