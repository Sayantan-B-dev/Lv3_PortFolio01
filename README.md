# Workspace Root

Monorepo-style workspace holding the portfolio site plus shared agent/skills config.

## Layout

- **`portfolio/`**: Sayantan Bharati's personal portfolio. Next.js 16 (App Router) + React 19 + TypeScript, pure-CSS design system (no Tailwind), Three.js particle globe, GridDistortion portraits, Lenis smooth scroll, Framer Motion reveals. See [`portfolio/README.md`](portfolio/README.md).
  ```bash
  cd portfolio
  npm install
  npm run dev
  ```
- **`.agents/` / `.claude/`**: installable agent skills (UI effects, Tailwind v4, shadcn, Three.js, particles, retro styles).
- **`.github/`**: repo agent docs.
- **`skills-lock.json`**: pinned skill versions.

## Git

Single repo, `main` branch. The portfolio's original 9-commit history is preserved and grafted under `portfolio/` via `git subtree`. Commit in small steps (setup → pages → components → styles → effects), push with `git push`.
