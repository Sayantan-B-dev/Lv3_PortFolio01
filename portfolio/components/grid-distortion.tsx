"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { getWebGLCaps } from "@/lib/webgl";

interface GridDistortionProps {
  grid?: number;
  mouse?: number;
  strength?: number;
  relaxation?: number;
  imageSrc: string;
  className?: string;
  /** Track the window pointer instead of only the container (for bg layers). */
  trackWindow?: boolean;
}

const vertexShader = `
uniform float time;
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform sampler2D uDataTexture;
uniform sampler2D uTexture;
uniform vec4 resolution;
uniform float uImageAspect;
uniform float uContainerAspect;
varying vec2 vUv;

void main() {
  // cover-fit: crop UV so image fills frame with no squeeze
  vec2 uv = vUv;
  if (uContainerAspect > uImageAspect) {
    // container wider -> crop top/bottom
    float s = uImageAspect / uContainerAspect;
    uv.y = 0.5 + (uv.y - 0.5) * s;
  } else {
    // container taller -> crop left/right
    float s = uContainerAspect / uImageAspect;
    uv.x = 0.5 + (uv.x - 0.5) * s;
  }
  vec4 offset = texture2D(uDataTexture, vUv);
  gl_FragColor = texture2D(uTexture, uv - 0.02 * offset.rg);
}
`;

export function GridDistortion({
  grid = 15,
  mouse = 0.1,
  strength = 0.15,
  relaxation = 0.9,
  imageSrc,
  className = "",
  trackWindow = false,
}: GridDistortionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const caps = getWebGLCaps();

    // No WebGL at all -> static image. Never a black box.
    if (!caps.supported) {
      setFailed(true);
      return;
    }

    // Low-power GPUs get a coarser grid + cheaper renderer before they choke.
    const effGrid = caps.tier === "minimal" ? Math.min(grid, 12) : caps.lowPower ? Math.min(grid, 18) : grid;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !caps.lowPower,
        alpha: true,
        powerPreference: caps.lowPower ? "low-power" : "high-performance",
      });
    } catch {
      setFailed(true);
      return;
    }
    const scene = new THREE.Scene();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, caps.maxDpr));
    renderer.setClearColor(0x000000, 0);

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Future-proofing: ANY runtime context loss (driver reset, memory pressure,
    // too many contexts) swaps to the static image instead of a black canvas.
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      try {
        container.innerHTML = "";
      } catch {
        /* ignore */
      }
      setFailed(true);
    };
    renderer.domElement.addEventListener("webglcontextlost", handleContextLost);

    const camera = new THREE.OrthographicCamera(0, 0, 0, 0, -1000, 1000);
    camera.position.z = 2;

    const uniforms = {
      time: { value: 0 },
      resolution: { value: new THREE.Vector4() },
      uTexture: { value: null as THREE.Texture | null },
      uDataTexture: { value: null as THREE.DataTexture | null },
      uImageAspect: { value: 3 / 4 },
      uContainerAspect: { value: 3 / 4 },
    };

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      imageSrc,
      (texture) => {
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        uniforms.uTexture.value = texture;
        if (texture.image?.width && texture.image?.height) {
          uniforms.uImageAspect.value = texture.image.width / texture.image.height;
        }
        handleResize();
      },
      undefined,
      () => {
        try {
          container.innerHTML = "";
        } catch {
          /* ignore */
        }
        setFailed(true);
      }
    );

    const size = effGrid;
    const data = new Float32Array(4 * size * size);
    for (let i = 0; i < size * size; i++) {
      data[i * 4] = Math.random() * 255 - 125;
      data[i * 4 + 1] = Math.random() * 255 - 125;
    }

    const dataTexture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.FloatType);
    dataTexture.needsUpdate = true;
    uniforms.uDataTexture.value = dataTexture;

    const material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
    });

    const geometry = new THREE.PlaneGeometry(1, 1, size - 1, size - 1);
    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    const handleResize = () => {
      if (!container || !renderer || !camera) return;

      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      if (width === 0 || height === 0) return;

      const containerAspect = width / height;
      uniforms.uContainerAspect.value = containerAspect;

      renderer.setSize(width, height);

      plane.scale.set(containerAspect, 1, 1);

      const frustumHeight = 1;
      const frustumWidth = frustumHeight * containerAspect;
      camera.left = -frustumWidth / 2;
      camera.right = frustumWidth / 2;
      camera.top = frustumHeight / 2;
      camera.bottom = -frustumHeight / 2;
      camera.updateProjectionMatrix();

      uniforms.resolution.value.set(width, height, 1, 1);
    };

    let resizeObserver: ResizeObserver | null = null;
    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(container);
    } else {
      window.addEventListener("resize", handleResize);
    }

    const mouseState = {
      x: 0,
      y: 0,
      prevX: 0,
      prevY: 0,
      vX: 0,
      vY: 0,
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1 - (e.clientY - rect.top) / rect.height;
      mouseState.vX = x - mouseState.prevX;
      mouseState.vY = y - mouseState.prevY;
      Object.assign(mouseState, { x, y, prevX: x, prevY: y });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const rect = container.getBoundingClientRect();
      const x = (e.touches[0].clientX - rect.left) / rect.width;
      const y = 1 - (e.touches[0].clientY - rect.top) / rect.height;
      mouseState.vX = x - mouseState.prevX;
      mouseState.vY = y - mouseState.prevY;
      Object.assign(mouseState, { x, y, prevX: x, prevY: y });
    };

    const handleMouseLeave = () => {
      dataTexture.needsUpdate = true;
      Object.assign(mouseState, {
        x: 0,
        y: 0,
        prevX: 0,
        prevY: 0,
        vX: 0,
        vY: 0,
      });
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("touchmove", handleTouchMove, { passive: true });
    container.addEventListener("touchend", handleMouseLeave);
    if (trackWindow) {
      window.addEventListener("pointermove", handleMouseMove, { passive: true });
    }

    handleResize();
    // Late content (fonts/images) can change layout: re-measure once settled.
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => handleResize()).catch(() => {});
    }

    let animationId = 0;
    let visible = true;
    let pageVisible = !document.hidden;
    const onVisibility = () => {
      pageVisible = !document.hidden;
      if (pageVisible && visible && !animationId) animationId = requestAnimationFrame(animate);
      else if (!pageVisible && animationId) {
        cancelAnimationFrame(animationId);
        animationId = 0;
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && pageVisible && !animationId) animationId = requestAnimationFrame(animate);
        else if (!visible && animationId) {
          cancelAnimationFrame(animationId);
          animationId = 0;
        }
      },
      { threshold: 0 }
    );
    io.observe(container);
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      uniforms.time.value += 0.05;

      const raw = dataTexture.image.data;
      if (!(raw instanceof Float32Array)) return;
      const d: Float32Array = raw;
      for (let i = 0; i < size * size; i++) {
        d[i * 4] *= relaxation;
        d[i * 4 + 1] *= relaxation;
      }

      const gridMouseX = size * mouseState.x;
      const gridMouseY = size * mouseState.y;
      const maxDist = size * mouse;

      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          const distSq = Math.pow(gridMouseX - i, 2) + Math.pow(gridMouseY - j, 2);
          if (distSq < maxDist * maxDist) {
            const index = 4 * (i + size * j);
            const power = Math.min(maxDist / Math.sqrt(distSq || 1), 10);
            d[index] += strength * 100 * mouseState.vX * power;
            d[index + 1] -= strength * 100 * mouseState.vY * power;
          }
        }
      }

      mouseState.vX *= 0.9;
      mouseState.vY *= 0.9;
      dataTexture.needsUpdate = true;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      animationId = 0;
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);

      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener("resize", handleResize);
      }

      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleMouseLeave);
      renderer.domElement.removeEventListener("webglcontextlost", handleContextLost);
      if (trackWindow) {
        window.removeEventListener("pointermove", handleMouseMove);
      }

      geometry.dispose();
      material.dispose();
      dataTexture.dispose();
      if (uniforms.uTexture.value) uniforms.uTexture.value.dispose();
      renderer.dispose();
      // Guarded context release: THREE's forceContextLoss() warns loudly
      // when the extension is missing, so go through the raw extension.
      try {
        const raw = renderer.getContext()?.getExtension("WEBGL_lose_context") as unknown as {
          loseContext?: () => void;
        } | null;
        raw?.loseContext?.();
      } catch {
        /* ignore: context will be GC'd */
      }
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [grid, mouse, strength, relaxation, imageSrc, trackWindow]);

  if (failed) {
    return (
      <div
        ref={containerRef}
        role="img"
        aria-label="Sayantan Bharati"
        className={className ? `distortion-container ${className}` : "distortion-container"}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt="Sayantan Bharati"
          draggable={false}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="Sayantan Bharati"
      className={className ? `distortion-container ${className}` : "distortion-container"}
    />
  );
}

export default GridDistortion;
