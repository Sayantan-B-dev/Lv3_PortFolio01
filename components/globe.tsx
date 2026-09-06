"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const globeParticleVertex = `
attribute float a_size;
attribute float a_layer;

uniform float u_time;
uniform float u_pointSize;

varying float v_layer;
varying float v_depth;
varying float v_falloff;

void main() {
  vec3 pos = position;
  float breathe = 1.0 + sin(u_time * 0.65 + a_layer * 4.0) * 0.012;
  pos *= breathe;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = u_pointSize * a_size * (1.0 / max(0.18, -mvPosition.z));
  gl_Position = projectionMatrix * mvPosition;

  v_layer = a_layer;
  v_depth = smoothstep(-1.8, 1.8, pos.z);
  v_falloff = smoothstep(2.45, 0.25, length(pos));
}
`;

const globeParticleFragment = `
precision highp float;

uniform vec3 u_coreColor;
uniform vec3 u_accentColor;

varying float v_layer;
varying float v_depth;
varying float v_falloff;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float alpha = smoothstep(0.5, 0.0, d);
  alpha *= alpha;

  vec3 color = mix(u_coreColor, u_accentColor, smoothstep(0.35, 1.0, v_layer));
  color += vec3(1.0) * v_depth * 0.08;
  color = mix(color * 0.42, color, clamp(v_falloff + v_layer * 0.28, 0.0, 1.0));
  alpha *= mix(0.52, 1.0, clamp(v_falloff + v_layer * 0.24, 0.0, 1.0));

  gl_FragColor = vec4(color, alpha);
}
`;

function hexToRgb01(hex: string) {
  const clean = hex.replace("#", "").trim();
  const value =
    clean.length === 3
      ? clean
          .split("")
          .map((char) => char + char)
          .join("")
      : clean;

  return new THREE.Color(
    parseInt(value.slice(0, 2), 16) / 255,
    parseInt(value.slice(2, 4), 16) / 255,
    parseInt(value.slice(4, 6), 16) / 255
  );
}

interface GlobeOptions {
  sphereCount?: number;
  ringCount?: number;
  radius?: number;
  ringRadius?: number;
  ringThickness?: number;
  tiltX?: number;
  tiltZ?: number;
  rotationSpeed?: number;
  mouseStrength?: number;
  pointSize?: number;
  coreColor?: string;
  accentColor?: string;
  cameraDistance?: number;
  maxDpr?: number;
}

function buildGlobeParticleGeometry(options: Required<Omit<GlobeOptions, "coreColor" | "accentColor">>) {
  const sphereCount = options.sphereCount;
  const ringCount = options.ringCount;
  const total = sphereCount + ringCount;

  const positions = new Float32Array(total * 3);
  const sizes = new Float32Array(total);
  const layers = new Float32Array(total);

  for (let i = 0; i < sphereCount; i++) {
    const z = Math.random() * 2 - 1;
    const theta = Math.random() * Math.PI * 2;
    const r = options.radius * (0.58 + Math.pow(Math.random(), 0.42) * 0.42);
    const root = Math.sqrt(1 - z * z);
    const index = i * 3;

    positions[index] = Math.cos(theta) * root * r;
    positions[index + 1] = Math.sin(theta) * root * r;
    positions[index + 2] = z * r;
    sizes[i] = 0.72 + Math.random() * 0.72;
    layers[i] = Math.random() * 0.28;
  }

  for (let i = 0; i < ringCount; i++) {
    const pointIndex = sphereCount + i;
    const angle = Math.random() * Math.PI * 2;
    const r = options.ringRadius + (Math.random() - 0.5) * options.ringThickness;
    const y = (Math.random() - 0.5) * options.ringThickness * 0.58;
    const index = pointIndex * 3;

    positions[index] = Math.cos(angle) * r;
    positions[index + 1] = y;
    positions[index + 2] = Math.sin(angle) * r;
    sizes[pointIndex] = 0.62 + Math.random() * 0.58;
    layers[pointIndex] = 0.72 + Math.random() * 0.28;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("a_size", new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute("a_layer", new THREE.BufferAttribute(layers, 1));
  return geometry;
}

export interface GlobeTune {
  rotationSpeed: number;
  tiltX: number;
  magnet: number;
  pointSize: number;
}

export function GlobeCanvas({
  accentColor = "#a78bfa",
  className = "",
  tune,
}: {
  accentColor?: string;
  className?: string;
  tune?: GlobeTune;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef({ x: 0, z: 0, yaw: 0 });
  const isDragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  // live-updating mirror so sliders apply without rebuilding WebGL
  const tuneRef = useRef<GlobeTune>({
    rotationSpeed: 1,
    tiltX: -0.42,
    magnet: 1,
    pointSize: 25,
  });
  if (tune) tuneRef.current = tune;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasEl: HTMLCanvasElement = canvas;

    const defaults = {
      sphereCount: 2600,
      ringCount: 5500,
      radius: 1,
      ringRadius: 2,
      ringThickness: 0.40,
      tiltZ: 0.22,
      mouseStrength: 0.3,
      coreColor: "#f8fafc",
      cameraDistance: 8.0,
      maxDpr: 2.0,
    };

    const renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, defaults.maxDpr));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, defaults.cameraDistance);

    const geometry = buildGlobeParticleGeometry({
      ...defaults,
      tiltX: tuneRef.current.tiltX,
      rotationSpeed: tuneRef.current.rotationSpeed,
      pointSize: tuneRef.current.pointSize,
    });
    const material = new THREE.ShaderMaterial({
      vertexShader: globeParticleVertex,
      fragmentShader: globeParticleFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        u_time: { value: 0 },
        u_pointSize: { value: tuneRef.current.pointSize },
        u_coreColor: { value: hexToRgb01(defaults.coreColor) },
        u_accentColor: { value: hexToRgb01(accentColor) },
      },
    });
    let lastAccent = accentColor;

    const particles = new THREE.Points(geometry, material);
    particles.rotation.x = tuneRef.current.tiltX;
    particles.rotation.z = defaults.tiltZ;
    scene.add(particles);

    const pointer = new THREE.Vector2(0, 0);
    let rafId = 0;

    // Magnetic pull: canvas drifts toward the cursor when it's close
    const magnet = { x: 0, y: 0 };
    const magnetTarget = { x: 0, y: 0 };
    const MAGNET_RADIUS = 420;
    const MAGNET_PULL = 0.12;
    const MAGNET_MAX = 38;

    function handleWindowPointerMove(event: PointerEvent) {
      const magnetStrength = tuneRef.current.magnet;
      const rect = canvasEl.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = event.clientX - cx;
      const dy = event.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < MAGNET_RADIUS && magnetStrength > 0) {
        const pull = (1 - dist / MAGNET_RADIUS) * MAGNET_PULL * magnetStrength;
        let tx = dx * pull;
        let ty = dy * pull;
        const maxPull = MAGNET_MAX * Math.min(magnetStrength, 2);
        const mag = Math.hypot(tx, ty);
        if (mag > maxPull) {
          tx = (tx / mag) * maxPull;
          ty = (ty / mag) * maxPull;
        }
        magnetTarget.x = tx;
        magnetTarget.y = ty;
      } else {
        magnetTarget.x = 0;
        magnetTarget.y = 0;
      }
    }

    function handleWindowPointerLeave() {
      magnetTarget.x = 0;
      magnetTarget.y = 0;
    }

    function handlePointerDown(event: PointerEvent) {
      isDragging.current = true;
      spinVel.yaw = 0;
      spinVel.x = 0;
      lastPointer.current = { x: event.clientX, y: event.clientY };
      canvasEl.setPointerCapture(event.pointerId);
    }

    function handlePointerMove(event: PointerEvent) {
      const rect = canvasEl.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

      if (isDragging.current) {
        const dx = event.clientX - lastPointer.current.x;
        const dy = event.clientY - lastPointer.current.y;
        const stepYaw = dx * 0.008;
        const stepX = dy * 0.005;
        rotationRef.current.yaw += stepYaw;
        // clamp vertical tilt so it can't flip inside-out
        rotationRef.current.x = Math.max(-0.9, Math.min(0.9, rotationRef.current.x + stepX));
        // smooth fling velocity for release momentum
        spinVel.yaw = spinVel.yaw * 0.7 + stepYaw * 0.3;
        spinVel.x = spinVel.x * 0.7 + stepX * 0.3;
        lastPointer.current = { x: event.clientX, y: event.clientY };
      }
    }

    function handlePointerUp() {
      isDragging.current = false;
    }

    // Fling momentum + eased-back auto spin (no jumps: auto angle accumulates)
    const spinVel = { yaw: 0, x: 0 };
    let autoAngle = 0;
    let lastTime = -1;

    function resize() {
      const width = Math.max(1, canvasEl.clientWidth);
      const height = Math.max(1, canvasEl.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, defaults.maxDpr));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    function render(time = 0) {
      const t = time * 0.001;
      material.uniforms.u_time.value = t;

      // frame delta for framerate-independent spin
      const dt = lastTime < 0 ? 0.016 : Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      if (!isDragging.current) {
        // release momentum with friction
        rotationRef.current.yaw += spinVel.yaw * dt * 60;
        rotationRef.current.x = Math.max(
          -0.9,
          Math.min(0.9, rotationRef.current.x + spinVel.x * dt * 60)
        );
        spinVel.yaw *= 0.95;
        spinVel.x *= 0.95;
        // auto spin eases back once the fling dies down
        const fling = Math.min(1, Math.hypot(spinVel.yaw, spinVel.x) * 30);
        autoAngle += dt * tuneRef.current.rotationSpeed * (1 - Math.min(1, fling));
      }

      const breath = Math.sin(t * 0.55) * 0.045;
      // live fun params: tilt + particle size + accent color
      const liveTiltX = tuneRef.current.tiltX;
      material.uniforms.u_pointSize.value = tuneRef.current.pointSize;
      if (accentColor !== lastAccent) {
        lastAccent = accentColor;
        material.uniforms.u_accentColor.value = hexToRgb01(accentColor);
      }
      particles.rotation.y = autoAngle + rotationRef.current.yaw;
      particles.rotation.x = liveTiltX - pointer.y * defaults.mouseStrength + rotationRef.current.x;
      particles.rotation.z = defaults.tiltZ - pointer.x * defaults.mouseStrength;
      particles.scale.setScalar(1 + breath);

      // ease canvas toward magnetic target (snappy pull, soft release)
      magnet.x += (magnetTarget.x - magnet.x) * 0.08;
      magnet.y += (magnetTarget.y - magnet.y) * 0.08;
      canvasEl.style.transform = `translate3d(${magnet.x.toFixed(2)}px, ${magnet.y.toFixed(2)}px, 0)`;

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(render);
    }

    function handleResize() {
      cancelAnimationFrame(rafId);
      resize();
      render();
    }

    resize();
    render();
    window.addEventListener("resize", handleResize);
    window.addEventListener("pointermove", handleWindowPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", handleWindowPointerLeave);
    canvasEl.addEventListener("pointerdown", handlePointerDown);
    canvasEl.addEventListener("pointermove", handlePointerMove);
    canvasEl.addEventListener("pointerup", handlePointerUp);
    canvasEl.addEventListener("pointercancel", handlePointerUp);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handleWindowPointerMove);
      document.documentElement.removeEventListener("pointerleave", handleWindowPointerLeave);
      canvasEl.removeEventListener("pointerdown", handlePointerDown);
      canvasEl.removeEventListener("pointermove", handlePointerMove);
      canvasEl.removeEventListener("pointerup", handlePointerUp);
      canvasEl.removeEventListener("pointercancel", handlePointerUp);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [accentColor]);

  return (
    <canvas
      ref={canvasRef}
      data-globe-particles
      aria-hidden="true"
      className={className}
    />
  );
}
