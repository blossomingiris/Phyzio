---
name: verify
description: Use this skill to run/verify the Phyzio frontend end-to-end (login, auth, API flows) in a real browser
---

# Verifying the Phyzio frontend

## Prerequisites (usually already running in dev)

- Postgres via `docker compose` (`app/backend/docker-compose.yaml`) — check
  `docker ps` first.
- Backend: `cd app/backend && npm run server` — Fastify on `http://localhost:3000`
  (Swagger UI at `/docs`).
- Frontend: `cd app/frontend && npm run dev` — Vite on `http://localhost:5173`.

Check `netstat`/`docker ps` before starting anything — both are commonly already
running in this environment.

## Seeded login credentials

From `app/backend/database/seed.ts`: password for every seeded user is
`password123`. Admin: `admin@phyzio.test`.

## Driving a real browser (no Playwright installed in the repo)

Playwright isn't a project dependency, but a matching Chromium build is often
already cached at `~/AppData/Local/ms-playwright`. To drive the app:

```bash
cd <scratchpad>
npm init -y && npm install playwright@<version matching the cached chromium-<rev> folder> --no-save
npx playwright install chromium   # only if versions mismatch; downloads the right build
node your-script.js
```

Check `~/AppData/Local/ms-playwright` for the cached `chromium-<rev>` folder and
match the `playwright` npm version to it to skip a fresh multi-hundred-MB
download.

Login form gotcha: Mantine's `PasswordInput` renders a "Toggle password
visibility" button whose accessible name also matches `getByLabel("Password")`,
so `getByLabel` hits a strict-mode violation (2 elements). Use
`page.getByRole("textbox", { name: "Password" })` instead.

## Verifying the access-token refresh flow (`shared/api/http-client.ts` middleware)

1. Log in through the UI.
2. Read `localStorage.getItem("phyzio-auth-token")`, then overwrite it with a
   garbage string — this simulates an expired/invalid access token while
   leaving the real httpOnly refresh cookie intact.
3. Reload the page. `app/main.tsx`'s `bootstrap()` sees a token, so it calls
   `check()` → `GET /me/`. Watch network traffic: expect
   `401 GET /me/` → `200 POST /auth/refresh` → `200 GET /me/` (retried), and
   the user stays authenticated with a rotated token in localStorage.
4. Negative path: `context.clearCookies()` (drops the refresh cookie) plus a
   corrupted access token, then reload. Expect `401 GET /me/` →
   `401 POST /auth/refresh` → token cleared from localStorage → redirected to
   `/login` (via `force-logout.ts`'s `window.location.assign`).

This exercises the retry-after-refresh code path end-to-end — the actual
regression here was `options.fetch(retryRequest)` in the `onResponse`
middleware throwing "Illegal invocation" (native `fetch` needs `this` bound to
`window`; `options` from openapi-fetch is a plain frozen object). Symptom
when broken: step 3's refresh POST succeeds (200) but the retried `GET /me/`
never fires, and the user gets bounced to `/login` despite the refresh cookie
still being valid. Fix is to call `globalThis.fetch(retryRequest)` instead.
