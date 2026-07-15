---
name: authorization
description: Use this skill when working with authentication, sessions, roles, protected routes, or role-gated UI in this project
---

# Authorization

This file explains how session/auth state, route protection, and role-gated
UI fit together, and how to extend them for new features.

Backend reference: JWT access token (short-lived) + rotated, single-use
httpOnly refresh cookie (`POST /auth/login`, `POST /auth/refresh`,
`POST /auth/logout`, `GET /me/`). Two roles only: `admin` | `therapist`
(`shared/domain/user.ts`'s `USER_ROLES`). Admin-only endpoints live at plain
prefixes (`/users`, `/therapists`, `/clients`, `/appointments`,
`/treatments`, `/treatment-plans`); therapist self-service only exists under
`/me/*` today (clients/appointments/treatment-plans — not treatments).

---

## 1. Where things live, and why

- **`shared/lib/auth/`** — pure mechanism, no business meaning. It exists
  here (not in `services/`) because `shared/api/http-client.ts` needs it
  directly, and `shared` can never import upward from `services`.
  - `token-storage.ts` — the access token as a plain `localStorage` value
    (`getToken`/`setToken`/`clearToken`). Its presence alone is what tells
    `session-store.ts`'s `bootstrap()` whether this browser was ever logged
    in — no separate "had a session" flag needed.
  - `refresh-access-token.ts` — raw `fetch(POST /auth/refresh)` (deliberately
    bypasses `http-client.ts` so it can't recurse into its own middleware),
    with an in-flight promise memoized so concurrent 401s share one refresh
    call.
  - `force-logout.ts` — clears the token and hard-redirects to `/login` via
    `window.location.assign` (not `navigate()` — `shared` can't import the
    `app`-layer router singleton). Used by `http-client.ts`'s middleware when
    a mid-session refresh fails.
- **`services/session/session-store.ts`** — **one Zustand store**, the
  single source of truth for "who's logged in, what's their role, log out."
  Consumed by `app` and `features/auth` through the public API
  (`services/session/index.ts`) only.
  - State: `authenticated`, `user`, `ready` (has the initial check settled —
    guards wait on this, nothing else needs to).
  - Actions: `bootstrap()` (call once, at app start — see §2),
    `check()` (calls `GET /me/`; a 401 there is already silently
    refreshed-and-retried by `http-client.ts`'s middleware, so this action
    doesn't duplicate that logic), `login(credentials)`, `logout()`.
  - Consumed directly via selectors — `useSessionStore((s) => s.user)`,
    `useSessionStore((s) => s.logout)`, etc. There's no `useCurrentUser`/
    `useLogout`/`useIsAuthenticated` wrapper-hook layer on top; Zustand's
    store *is* the hook. Don't reintroduce one-hook-per-field wrappers here —
    that's what caused this to sprawl into eight files the first time around.

---

## 2. Bootstrapping the session

`app/main.tsx` calls `useSessionStore.getState().bootstrap()` **once**,
before `createRoot(...).render(...)` — not inside a component/effect. This
is what keeps the whole thing StrictMode-safe and avoids re-deriving
"should I check" logic on every guard mount:

- No token in storage → `ready: true` synchronously, zero network calls. A
  genuinely fresh/logged-out visitor never sees a loading spinner anywhere.
- Token present → `check()` runs (a real `GET /me/` round trip); `ready`
  stays `false` until it settles. This is the only case where a guard's
  brief loader is shown — a returning user's hard reload, restoring the
  session from the httpOnly refresh cookie.

Don't call `bootstrap()` anywhere else, and don't re-derive its result with
a second check inside a guard or hook — everything downstream just reads
`ready`/`authenticated`/`user` off the store.

---

## 3. Route guards (`app/route-guards.tsx`)

Three small components, all reading the store directly, no data fetching of
their own:

- **`RequireAuth`** — loader while `!ready`; redirects to `/login`
  (preserving `location` in `state.from`) once settled if not authenticated;
  otherwise `<Outlet/>`.
- **`RequireGuest`** — the inverse, wraps `/login`: loader while `!ready`;
  redirects to `/` if already authenticated; otherwise `<Outlet/>`. This is
  why `login.page.tsx` itself needs no auth-status-checking logic — the
  router-level guard handles "already logged in" before the page ever
  mounts.
- **`RequireRole({ role })`** — nested *inside* `RequireAuth` in the route
  tree, so `user` is already populated by the time it mounts; just checks
  `user?.role === role`, no query, no loading state of its own.

To make a new route **admin-only**, nest it under the existing `RequireRole`
group in `router.tsx`:

```tsx
{
  element: <RequireRole role={USER_ROLES.ADMIN} />,
  children: [
    { path: ROUTES.SOME_ADMIN_ROUTE, element: <SomePage /> },
  ],
},
```

There's no therapist-only route group yet — only `admin` gating exists today,
since therapist self-service views (`/me/*`) haven't been built as pages yet.

---

## 4. Role-gating a nav item

Tag the item in `shared/ui/navbar/navigation.config.ts` with `roles`:

```ts
{ key: "users", title: "Users", icon: IconUsers, path: ROUTES.USERS, roles: [USER_ROLES.ADMIN] },
```

An item with no `roles` is visible to any authenticated role. `app-shell.tsx`
filters `navigationConfig` against `useSessionStore((s) => s.user)`.

Nav-item role tags and router `RequireRole` groups are two separate lists
(a route without a nav entry, like an item-detail page, still needs its own
guard) — keep them in sync by hand when adding a feature.

---

## 5. Consuming the current user in a feature

```ts
import { useSessionStore } from "@/services/session";

const user = useSessionStore((state) => state.user); // user?.role, user?.id, ...
```

Never reach into `shared/lib/auth` directly from a feature — always go
through `services/session`'s public API.

---

## 6. Login flow reference

`features/auth/use-login.ts` is the pattern for any future form bound to a
mutation:

- A plain TanStack `useMutation({ mutationFn: <store action> })` wrapping a
  `session-store.ts` action — not `rqClient.useMutation`, since the store
  action itself is a plain async function, not a direct endpoint call.
- `login.mutateAsync(...)` in the form's submit handler (not `onError` in the
  hook) — the page owns form concerns.
- `applyApiFieldErrors(form, error)` (`shared/lib/mantine/`) maps a 422 field
  error onto the Mantine form.
- `isGeneralError(error)` (`shared/api/errors.ts`) decides whether to show a
  generic alert instead.
- The hook itself only does navigation-on-success — no form state, no
  auth-status checking (that's `RequireGuest`'s job, see §3).
