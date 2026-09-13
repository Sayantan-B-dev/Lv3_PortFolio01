# Frontend map

Pure CSS, zero Tailwind. `portfolio/app/globals.css` only `@import`s files from
`portfolio/public/styles/` (one file per area).

## Style files

`tokens` (oklch theme) → `base` (reset, containers, section rhythm, display type) →
`layout` (shell, ticker, footer) → `header` → `hero` → `about` → `projects` →
`skills` → `experience` → `contact` → `marquee` → `curvy-separator` → `motion` →
`cursor` (legacy, superseded by glow) → `globe` → `gold` → `grid-distortion` →
`glow-cursor` → `ui` (buttons/badges/cards) → `blog` → `admin` → `responsive`.

## Key interactive pieces

| Piece | File | Notes |
|---|---|---|
| Smooth scroll | `components/smooth-scroll.tsx` | Lenis + manual 2s anchor flights; `data-lenis-prevent` frees nested scrollers |
| Motion reveals | `components/motion.tsx` | FadeIn/LinesReveal/WordReveal/Parallax; mobile falls back to CSS `motion-safe-in` (can't get stuck invisible) |
| Particle globe | `components/globe.tsx` | Three.js shaders, drag-to-spin with momentum, magnetic pull, playground sliders (spin/tilt/magnet/pixels/color) |
| Portraits | `components/grid-distortion.tsx` | Mouse-ripple distortion, cover-fit shader, optional window tracking |
| Cursor trail | `components/glow-cursor.tsx` | OGL glow trail, fullscreen fixed layer |
| Separators | `components/curvy-separator.tsx` | Tunable heartbeat ECG lines via `CURVY_DEFAULTS` |
| Certificates | `components/accordion-gallery.tsx` + `components/light-tunnel.tsx` | Hover accordion, per-panel tunnel backdrop, phone shows tiny names |
| Contact | `components/contact.tsx` | me2 distortion, Elsewhere/photo/FAQ-thread grid, FAQPage JSON-LD |
| Footer | `components/footer.tsx` | Giant wordmark, link columns, live IST clock, admin lock entry |

## Images

`public/me.png|webp`, `me2.png|webp`, `certifficates/*.webp` (verify via `certifficate-link-map.txt`;
`png(ignore)/` is git-ignored), favicons + `site.webmanifest` wired in `app/layout.tsx`.
Remote images allowed from Cloudinary + Brave placeholder host (`next.config.ts`).
