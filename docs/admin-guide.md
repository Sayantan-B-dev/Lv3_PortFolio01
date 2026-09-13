# Studio admin guide

Open the lock icon in the footer → `/blog/admin`. Log in once; the cookie lasts 12 hours.

## Tabs

**Posts (n)** list · **+ New post** editor · **View blog** (new tab) · **Log out**. Tabs never mix:
actions live with their own section.

## Writing a post

1. **Title** (3-120 chars, becomes the URL slug), **Description** (shows on cards + Google).
2. **Cover**: drag & drop (or click) a **.webp only**, max 5 MB. Preview appears instantly.
   Covers are optional; empty shows the placeholder until you add one.
3. **Markdown toolbar**: B (`**bold**`), I (`*italic*`), code, H1-H3, quote (`>`, nest `>>`
   for the amber variant), bullets, numbered lists, links, fences, dividers. Works on
   selections, drops placeholders otherwise.
4. **Undo/redo**: ↺/↻ buttons with live counts (15 steps each) or Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y.
   Typing pauses snapshot automatically; toolbar ops are atomic steps.
5. **Links** (max 6), **tags** (comma separated, lowercase), **Visibility** (public/private).
6. **Preview** toggle renders the real post page styles, cover included.
7. **Save** stamps the current time. **Cancel** destroys uploads from that session that were
   never saved; previously saved covers are never touched.

Every save stamps `publishAt: now`, so editing an old post also refreshes its date and
bumps it to the top of the grid.

## Reading the list

Each row: **Visit** (live post, new tab) · **Edit** · **Delete** (custom popup, no `confirm()`),
plus `public/private` and `Scheduled` badges (future-dated public posts stay hidden until then).

## Login attempts panel

Bottom of the studio: last 50 attempts with IP, result, timestamp. Bursts of FAIL from one
IP = someone guessing; the 429 lockout is already slowing them down.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Post saved but missing on `/blog` | `publishAt` in the future (e.g. year 2222 from a date-picker typo) or `private` | Check the Scheduled badge; edit re-stamps now |
| `Auth is not configured` (500) | `JWT_SECRET` (or admin env) missing | Add it to `.env.local`, restart dev |
| Upload rejected | Not `.webp`, or over 5 MB | Convert/resize, retry |
| `Invalid credentials` (401) | Wrong pair (deliberately vague) | Retry carefully; 5 fails = 15-min lockout |
| Slug taken | Same title twice | Server auto-suffixes `-2`, `-3` |
| `IndexOptionsConflict` on seed | Old `slug` index under another name | Seeder reuses it; safe to ignore |
