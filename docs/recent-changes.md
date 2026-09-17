# Recent Changes

Fixes for broken hero/globe/certificate visuals on mobile, faster anchor
scrolling, and a themed route loader. Commits are small and ordered, oldest
first. No pushes were made; everything is local on `main`.

## 1. Phase 1: harden hero portrait and globe (`f2a83f5`)

Commit: `fix(phase1): harden GridDistortion fallback and Globe mobile perf`

| File | Change |
|---|---|
| `portfolio/components/grid-distortion.tsx` | WebGL availability probe with plain `<img>` fallback, texture load error fallback, pause rendering offscreen (`IntersectionObserver` + `visibilitychange`), re-measure after `document.fonts.ready` |
| `portfolio/components/globe.tsx` | Lower particle counts and DPR cap on coarse/small screens, `ResizeObserver`, pause when offscreen or tab hidden, slower spin for `prefers-reduced-motion` |
| `portfolio/package.json`, `portfolio/package-lock.json` | Added `react-loading-indicators` (used later in Phase 4) |

## 2. Phase 2: certificate gallery cost cut (`673294d`)

Commit: `fix(phase2): light-tunnel only on active panel for touch, WebGL2 fallback`

| File | Change |
|---|---|
| `portfolio/components/accordion-gallery.tsx` | `LightTunnel` mounts only on the active panel for touch devices, `loading="lazy"` + `decoding="async"` on certificate images |
| `portfolio/components/light-tunnel.tsx` | Early return when WebGL2 is unavailable instead of throwing |

Why: 8 panels each owned a WebGL2 context, which exhausts the browser
context limit and kills the hero and globe contexts.

## 3. Phase 3: immediate anchor scrolling on mobile (`a12329a`)

Commit: `fix(phase3): fast immediate anchor hops on touch, reduced-motion support`

| File | Change |
|---|---|
| `portfolio/components/smooth-scroll.tsx` | Touch devices use a short `lenis.scrollTo` hop (0.55s) instead of the 1 to 2.5s manual glide, `smoothWheel` off on touch, `touchMultiplier` 1.0, cancel flights on `touchstart`, instant jump for `prefers-reduced-motion` |

## 4. Phase 4: themed route loader (`2262138`)

Commit: `feat(phase4): themed Atom route loader, loading states, blog skeletons`

| File | Change |
|---|---|
| `portfolio/components/route-loader.tsx` | New client component. Shows an `Atom` loader from `react-loading-indicators` in project color `#c4b5fd` on internal link clicks, hides on `pathname` change, 8s safety timeout, ignores hash-only and external links |
| `portfolio/public/styles/loader.css` | New. Overlay, top progress bar, card, blog skeleton shimmer, reduced-motion support |
| `portfolio/app/loading.tsx` | New root suspense fallback with the themed `Atom` |
| `portfolio/app/blog/loading.tsx` | New blog index fallback with skeleton cards |
| `portfolio/app/blog/[slug]/loading.tsx` | New blog post fallback |
| `portfolio/app/layout.tsx` | Mounts `<RouteLoader />` inside `<SmoothScroll>` |
| `portfolio/app/globals.css` | Imports `loader.css` |

## 5. Hero/globe black-screen fix (`84c9067`)

Commit: `fix(hero): silence lose_context warning, mount tunnel on active panel only to stop context exhaustion`

| File | Change |
|---|---|
| `portfolio/components/grid-distortion.tsx` | Removed probe `loseContext()` call that logged `WEBGL_lose_context extension not supported`, guarded dispose-time context release through the raw extension |
| `portfolio/components/accordion-gallery.tsx` | `LightTunnel` now mounts only on the active panel on all devices (was touch only), cutting tunnel contexts from 8 to 1 |

Note: the `WEBGL_lose_context` console warning was noise from effect
cleanup, not the cause. The cause was context exhaustion (see section 2).

## 6. Future-proof WebGL layer (`85f12d8`)

Commit: `fix(webgl): shared caps module, context-loss fallbacks, tiered mobile quality`

| File | Change |
|---|---|
| `portfolio/lib/webgl.ts` | New. Single cached capability probe: WebGL2 support, power tier (`high`/`low`/`minimal` from pointer type, screen size, CPU cores, device memory), reduced motion, DPR cap |
| `portfolio/components/grid-distortion.tsx` | Uses shared caps, coarser grid and `low-power` preference on weak GPUs, `webglcontextlost` swaps to the static image, texture errors clear the canvas before fallback |
| `portfolio/components/globe.tsx` | Uses shared caps, tiered particle counts (800/1200 minimal, 1200/2200 low, 2600/5500 high), themed static orb fallback (`.globe-fallback`) on unsupported or lost context, render loop halts on context death |
| `portfolio/components/light-tunnel.tsx` | Uses shared caps for DPR, shader compile failure caught with transparent fallback, context loss stops its loop |
| `portfolio/components/accordion-gallery.tsx` | Skips the tunnel entirely when WebGL is unsupported |
| `portfolio/public/styles/globe.css` | New `.globe-fallback` orb and ring styles in theme color |

## 7. Loader styling (`8f04b70`)

Commit: `style(loader): transparent overlay, centered loader text`

| File | Change |
|---|---|
| `portfolio/public/styles/loader.css` | Overlay background is fully transparent (dim and blur removed), loader card background reduced to 25% so the page shows through, loader text is center aligned in the dead-center card |

## Verification

* `npx tsc --noEmit` passes with no output.
* `npm run lint` reports only pre-existing warnings/errors from `.next` cache artifacts, nothing new from these changes.
