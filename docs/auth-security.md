# Auth + security

Single-admin design. There are no roles, no user table, no sessions to store.

## How login works (the "tricky" part, as requested)

1. First ever login: server reads `ADMIN_USERNAME`/`ADMIN_PASSWORD` from env, hashes **both**
   with argon2id and stores only the hashes in `portfolio_admin` (one doc, ever).
2. Every login after that verifies the submitted pair against the DB hashes with
   `argon2.verify`, both halves every time (no timing signal about which half was wrong).
3. Success mints a 12-hour HS256 JWT (`jose`) in an httpOnly cookie (`sb_admin`,
   `Secure` in prod, `SameSite=Strict`). Env values never leave the server.

## Why JWT, not Passport

Passport is session-based: it needs a session store to scale and adds moving parts.
One admin + stateless JWT = nothing to store, nothing to steal from a database,
expiry enforced by signature.

## Threat model (who we're keeping out)

| Attack | Defense |
|---|---|
| Brute force / credential stuffing | 5 fails per IP per 15 min → 429 lockout; argon2id makes each guess expensive |
| User enumeration | Identical generic error + identical argon2 work whether the user exists or not |
| Cookie theft via XSS | httpOnly (JS can't read it); markdown renders with no raw HTML |
| CSRF | `SameSite=Strict` cookie; state-changing routes are JSON APIs, not forms |
| Privilege peekery | Every admin check + private-post filter runs server-side; hidden buttons are decoration |
| Scrapers harvesting posts | Public posts are public by design; private ones never leave the DB query |
| Orphan/secret leaks | `.env.local` git-ignored; `.env.example` placeholders only; Cloudinary destroy locked to `portfolio-blog/` prefix |

## Still on you (do these)

1. `JWT_SECRET`: 48 random bytes hex. Anyone with it mints admin cookies.
2. Rotate `ADMIN_PASSWORD` in env if it ever leaks (delete the `portfolio_admin` doc afterwards so it re-bootstraps from the new value).
3. Watch the studio's **login attempts** panel; repeated FAILs from one IP mean someone's knocking.
4. Vercel/system: keep Node ≥ 20 (argon2 prebuilds), HTTPS on (Secure cookies need it).

## Later upgrades (optional)

- TOTP 2FA field on the same admin doc.
- Alert (email/Telegram) on lockout events.
- Shorter sessions (2h) + sliding refresh.
