"use client";

import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";
import { getWebGLCaps } from "@/lib/webgl";

export type FlowDirection = "inward" | "outward";

export interface LightTunnelProps {
  cableColor?: string;
  pulseColor?: string;
  tunnelColor?: string;
  tunnelOpacity?: number;
  speed?: number;
  flowDirection?: FlowDirection;
  pulseSpeed?: number;
  pulseLength?: number;
  pulseBlend?: number;
  pulseWidth?: number;
  cableCount?: number;
  thickness?: number;
  rimWidth?: number;
  waviness?: number;
  sway?: number;
  size?: number;
  centerX?: number;
  centerY?: number;
  glow?: number;
  fadeNear?: number;
  fadeFar?: number;
  brightness?: number;
  colorVariance?: boolean;
  grain?: boolean;
  grainIntensity?: number;
  opacity?: number;
  mouseInteraction?: boolean;
  mouseStrength?: number;
  lightMode?: boolean;
  className?: string;
}

const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [1, 1, 1];
  return [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255];
};

const vertex = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uFlowDir;
uniform float uPulseSpeed;
uniform float uPulseLength;
uniform float uPulseBlend;
uniform float uPulseWidth;
uniform float uCableCount;
uniform float uThickness;
uniform float uRimWidth;
uniform float uWaviness;
uniform float uSway;
uniform float uSize;
uniform vec2 uCenter;
uniform vec2 uMouseOffset;
uniform float uGlow;
uniform float uFadeNear;
uniform float uFadeFar;
uniform float uBrightness;
uniform float uColorVariance;
uniform float uOpacity;
uniform vec3 uCableColor;
uniform vec3 uPulseColor;
uniform vec3 uTunnelColor;
uniform float uTunnelOpacity;
uniform float uGrain;
uniform float uGrainIntensity;
uniform float uLightMode;
out vec4 fragColor;

void mainImage(out vec4 o, in vec2 fragCoord) {
  float size = uSize * 2.0;
  float flowDir = uFlowDir;
  float speedBase = uSpeed * 4.0 * flowDir;
  float waviness = uWaviness * 0.15;
  float rotationOsc = uSway * 0.5;
  float baseThick = uThickness * 0.35 + 0.05;
  float borderWeight = uRimWidth * 0.15 + 0.01;
  float cablesCount = floor(uCableCount);

  vec2 res = iResolution.xy;
  vec2 uv = (fragCoord - 0.5 * res) / min(res.y, res.x);
  uv -= (uCenter + uMouseOffset);
  uv /= (size + 0.0001);

  float r = length(uv);
  float angle = atan(uv.y, uv.x);
  float depth = -log(r + 0.0001);

  float swing = sin(iTime * (uSpeed * 0.5 + 0.1)) * rotationOsc;
  float waveOffset = sin(depth * 1.2 + iTime * speedBase * 0.25) * waviness;

  float angleNormalized = (angle / 6.2831853) + 0.5;
  float finalAngle = fract(angleNormalized + waveOffset + swing);

  float cableID = floor(finalAngle * cablesCount);
  float gvX = (fract(finalAngle * cablesCount) - 0.5);

  float rand = fract(sin(cableID * 12.9898) * 43758.5453);
  float randSpeed = (0.4 + rand * 0.6) * speedBase * uPulseSpeed;
  float cableThick = baseThick * (0.6 + rand * 0.4);

  vec3 cableCol = uCableColor;
  cableCol *= 1.0 + (rand - 0.5) * 0.4 * uColorVariance;
  cableCol = mix(cableCol, uPulseColor, rand * 0.25 * uColorVariance);

  float scroll = depth + (iTime * randSpeed);
  float pulseFact = fract(scroll);

  float distToCore = abs(gvX);
  float wireMask = smoothstep(cableThick, cableThick - 0.05, distToCore);
  float rimGlow = smoothstep(borderWeight, 0.0, abs(distToCore - cableThick));

  float pulseThick = cableThick * uPulseWidth;
  float pulseMask = smoothstep(pulseThick, pulseThick - 0.05 * uPulseWidth, distToCore);

  float pulseDist = abs(pulseFact - 0.5);
  float pulseTotal = uPulseLength;
  float pulseCore = pulseTotal * (1.0 - uPulseBlend);
  float pulseLo = min(pulseCore, pulseTotal - max(fwidth(scroll), 1e-4));
  float dataPulse = 1.0 - smoothstep(pulseLo, pulseTotal, pulseDist);

  float aBody = wireMask * uTunnelOpacity;
  float aRim = rimGlow;
  float aPulse = clamp(dataPulse * pulseMask, 0.0, 1.0);

  vec3 fiberCol = uTunnelColor * aBody
    + cableCol * aRim * 1.3 * uGlow
    + uPulseColor * dataPulse * 3.0 * pulseMask;

  float distFade = smoothstep(0.0, uFadeNear, r) * smoothstep(uFadeFar, uFadeFar - 0.9, r);
  float inten = clamp(aBody + aRim + aPulse, 0.0, 1.0) * distFade;

  vec3 finalCol = fiberCol * uBrightness;
  float alpha = clamp(inten, 0.0, 1.0) * uOpacity;
  vec3 outRgb = finalCol * alpha;

  if (uGrain > 0.5) {
    float gv = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + iTime) * 43758.5453) - 0.5) * uGrainIntensity;
    outRgb = clamp(outRgb + gv, 0.0, 1.0);
    alpha = clamp(alpha + gv, 0.0, 1.0);
  }

  o = vec4(outRgb, alpha);
}

void main() {
  vec4 o = vec4(0.0);
  mainImage(o, gl_FragCoord.xy);
  if (uLightMode > 0.5) {
    float peak = max(o.r, max(o.g, o.b));
    vec3 chroma = pow(clamp(o.rgb / max(peak, 0.0001), 0.0, 1.0), vec3(1.16));
    fragColor = vec4(mix(vec3(1.0), chroma, o.a * 0.95), 1.0);
  } else {
    fragColor = o;
  }
}
`;

type LightTunnelCtx = {
  renderer: InstanceType<typeof Renderer>;
  program: InstanceType<typeof Program>;
  mesh: InstanceType<typeof Mesh>;
};
const ctxMap = new WeakMap<HTMLDivElement, LightTunnelCtx>();

export function LightTunnel({
  cableColor = "#A855F7",
  pulseColor = "#A855F7",
  tunnelColor = "#5227FF",
  tunnelOpacity = 0,
  speed = 0.1,
  flowDirection = "outward",
  pulseSpeed = 2,
  pulseLength = 0.28,
  pulseBlend = 1,
  pulseWidth = 1,
  cableCount = 20,
  thickness = 0.35,
  rimWidth = 0.15,
  waviness = 0.3,
  sway = 0.5,
  size = 1.0,
  centerX = 0.0,
  centerY = 0.0,
  glow = 1.0,
  fadeNear = 0.5,
  fadeFar = 2,
  brightness = 1.0,
  colorVariance = true,
  grain = true,
  grainIntensity = 0.05,
  opacity = 1.0,
  mouseInteraction = true,
  mouseStrength = 0.1,
  lightMode = false,
  className = "",
}: LightTunnelProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseEnabledRef = useRef<boolean>(mouseInteraction);
  const mouseStrengthRef = useRef<number>(mouseStrength);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const caps = getWebGLCaps();
    // No WebGL2 -> leave the transparent fallback instead of throwing.
    if (!caps.supported) return;

    let renderer: InstanceType<typeof Renderer>;
    try {
      renderer = new Renderer({
        canvas: document.createElement("canvas"),
        alpha: true,
        antialias: false,
        dpr: Math.min(window.devicePixelRatio || 1, caps.maxDpr),
        webgl: 2,
      } as ConstructorParameters<typeof Renderer>[0]);
    } catch {
      return;
    }

    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    container.appendChild(canvas);

    const geometry = new Triangle(gl);
    let program: InstanceType<typeof Program>;
    try {
      program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Float32Array([1, 1]) },
        uSpeed: { value: 0.1 },
        uFlowDir: { value: -1.0 },
        uPulseSpeed: { value: 2.0 },
        uPulseLength: { value: 0.28 },
        uPulseBlend: { value: 1.0 },
        uPulseWidth: { value: 1.0 },
        uCableCount: { value: 20 },
        uThickness: { value: 0.35 },
        uRimWidth: { value: 0.15 },
        uWaviness: { value: 0.3 },
        uSway: { value: 0.5 },
        uSize: { value: 1.0 },
        uCenter: { value: new Float32Array([0, 0]) },
        uMouseOffset: { value: new Float32Array([0, 0]) },
        uGlow: { value: 1.0 },
        uFadeNear: { value: 0.5 },
        uFadeFar: { value: 2.0 },
        uBrightness: { value: 1.0 },
        uColorVariance: { value: 1.0 },
        uOpacity: { value: 1.0 },
        uCableColor: { value: new Float32Array([0.65882353, 0.33333333, 0.96862745]) },
        uPulseColor: { value: new Float32Array([0.65882353, 0.33333333, 0.96862745]) },
        uTunnelColor: { value: new Float32Array([0.32156863, 0.15294118, 1]) },
        uTunnelOpacity: { value: 0.0 },
        uGrain: { value: 1.0 },
        uGrainIntensity: { value: 0.05 },
        uLightMode: { value: 0.0 },
      },
      });
    } catch {
      // Shader compile failure on old GPUs -> transparent fallback.
      try {
        container.removeChild(canvas);
      } catch {
        /* ignore */
      }
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      return;
    }

    const mesh = new Mesh(gl, { geometry, program });
    ctxMap.set(container, { renderer, program, mesh });

    const setSize = () => {
      const rect = container.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      renderer.setSize(w, h);
      const res = (program.uniforms.iResolution as { value: Float32Array }).value;
      res[0] = gl.drawingBufferWidth;
      res[1] = gl.drawingBufferHeight;
      renderer.render({ scene: mesh });
    };

    const ro = new ResizeObserver(setSize);
    ro.observe(container);
    setSize();

    let currentMouse: [number, number] = [0.5, 0.5];
    let targetMouse: [number, number] = [0.5, 0.5];

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouse = [(e.clientX - rect.left) / rect.width, 1.0 - (e.clientY - rect.top) / rect.height];
    };
    const handleMouseLeave = () => {
      targetMouse = [0.5, 0.5];
    };
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    let raf = 0;
    let isVisible = true;
    let isPageVisible = !document.hidden;
    const t0 = performance.now();

    const loop = (t: number) => {
      (program.uniforms.iTime as { value: number }).value = (t - t0) * 0.001;

      if (mouseEnabledRef.current) {
        currentMouse[0] += 0.05 * (targetMouse[0] - currentMouse[0]);
        currentMouse[1] += 0.05 * (targetMouse[1] - currentMouse[1]);
      } else {
        currentMouse[0] += 0.05 * (0.5 - currentMouse[0]);
        currentMouse[1] += 0.05 * (0.5 - currentMouse[1]);
      }
      const off = (program.uniforms.uMouseOffset as { value: Float32Array }).value;
      off[0] = (currentMouse[0] - 0.5) * mouseStrengthRef.current;
      off[1] = (currentMouse[1] - 0.5) * mouseStrengthRef.current;

      renderer.render({ scene: mesh });
      raf = requestAnimationFrame(loop);
    };

    const tryStart = () => {
      if (isVisible && isPageVisible && raf === 0) raf = requestAnimationFrame(loop);
    };
    const tryStop = () => {
      if (raf !== 0) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) tryStart();
        else tryStop();
      },
      { threshold: 0 }
    );
    io.observe(container);

    const onVisibility = () => {
      isPageVisible = !document.hidden;
      if (isPageVisible) tryStart();
      else tryStop();
    };
    document.addEventListener("visibilitychange", onVisibility);

    // Runtime context loss (memory pressure, too many contexts): stop the loop
    // and leave the transparent fallback instead of throwing every frame.
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      tryStop();
    };
    canvas.addEventListener("webglcontextlost", handleContextLost);

    tryStart();

    return () => {
      tryStop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      ctxMap.delete(container);
      try {
        container.removeChild(canvas);
      } catch {
        /* already removed */
      }
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  useEffect(() => {
    mouseEnabledRef.current = mouseInteraction;
    mouseStrengthRef.current = mouseStrength;

    const container = containerRef.current;
    if (!container) return;
    const ctx = ctxMap.get(container);
    if (!ctx) return;
    const { program } = ctx;
    const u = program.uniforms as Record<string, { value: never }>;

    (u.uSpeed.value as number) = speed;
    (u.uFlowDir.value as number) = flowDirection === "outward" ? -1.0 : 1.0;
    (u.uPulseSpeed.value as number) = pulseSpeed;
    (u.uPulseLength.value as number) = pulseLength;
    (u.uPulseBlend.value as number) = pulseBlend;
    (u.uPulseWidth.value as number) = pulseWidth;
    (u.uCableCount.value as number) = cableCount;
    (u.uThickness.value as number) = thickness;
    (u.uRimWidth.value as number) = rimWidth;
    (u.uWaviness.value as number) = waviness;
    (u.uSway.value as number) = sway;
    (u.uSize.value as number) = size;
    const center = u.uCenter.value as unknown as Float32Array;
    center[0] = centerX;
    center[1] = centerY;
    (u.uGlow.value as number) = glow;
    (u.uFadeNear.value as number) = fadeNear;
    (u.uFadeFar.value as number) = fadeFar;
    (u.uBrightness.value as number) = brightness;
    (u.uColorVariance.value as number) = colorVariance ? 1.0 : 0.0;
    (u.uGrain.value as number) = grain ? 1.0 : 0.0;
    (u.uGrainIntensity.value as number) = grainIntensity;
    (u.uOpacity.value as number) = opacity;
    (u.uLightMode.value as number) = lightMode ? 1.0 : 0.0;
    const cable = hexToRgb(cableColor);
    const cableU = u.uCableColor.value as unknown as Float32Array;
    cableU[0] = cable[0];
    cableU[1] = cable[1];
    cableU[2] = cable[2];
    const pulse = hexToRgb(pulseColor);
    const pulseU = u.uPulseColor.value as unknown as Float32Array;
    pulseU[0] = pulse[0];
    pulseU[1] = pulse[1];
    pulseU[2] = pulse[2];
    const tunnel = hexToRgb(tunnelColor);
    const tunnelU = u.uTunnelColor.value as unknown as Float32Array;
    tunnelU[0] = tunnel[0];
    tunnelU[1] = tunnel[1];
    tunnelU[2] = tunnel[2];
    (u.uTunnelOpacity.value as number) = tunnelOpacity;
  }, [
    cableColor,
    pulseColor,
    tunnelColor,
    tunnelOpacity,
    speed,
    flowDirection,
    pulseSpeed,
    pulseLength,
    pulseBlend,
    pulseWidth,
    cableCount,
    thickness,
    rimWidth,
    waviness,
    sway,
    size,
    centerX,
    centerY,
    glow,
    fadeNear,
    fadeFar,
    brightness,
    colorVariance,
    grain,
    grainIntensity,
    opacity,
    mouseInteraction,
    mouseStrength,
    lightMode,
  ]);

  return <div ref={containerRef} className={`light-tunnel-container ${className}`.trim()} />;
}

export default LightTunnel;
