# Sayantan Bharati — Portfolio

Personal portfolio for **Sayantan Bharati**, Full Stack Developer (MERN, Python).

## Stack

- **Next.js 16** (App Router, RSC) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (base-nova, Base UI)
- **Three.js** — custom WebGL shader particle globe in the hero
- **Framer Motion** — scroll reveals, parallax, line/word masking
- **Lenis** — buttery smooth scrolling with eased anchor navigation
- Deploys to Vercel out of the box

## Experience / Interactions

- **Custom cursor** — dot + eased ring + canvas particle trail; expands over links/buttons, bursts on click (fine pointers only, respects reduced motion)
- **Hero** — giant masked type reveal, Zara-style editorial typography with a serif italic accent, scroll-linked 3D globe drift, floating tech chips
- **Marquees** — counter-moving tech tickers, pause on hover, edge-masked
- **Parallax** — ghost words, vertical section titles, card depth
- **Slow fade-ins** — FadeIn / LinesReveal / WordReveal on scroll into view
- **Projects** — full-bleed editorial rows; hover reveals radial glow + feature bullets
- **Timeline** — experience & education with a scroll-growing gradient line

All motion disabled under `prefers-reduced-motion`; native cursor preserved on touch devices.

## Sections

Hero → tech ticker → About/Statement → Selected Work → Stack → Path (experience & education) → Contact & Certifications → footer.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production

```bash
npm run build
npm start
```
