# Frontend architecture & conventions

Feature-sliced layering: `app` → `features` → `services` → `shared`.

| Layer | Responsibility |
| --- | --- |
| `app` | Composition root — entry point, providers, theme, router, authenticated shell. Wires everything else together. |
| `features` | Independent chunks of functionality — pages, components, and local logic for one area of the product. |
| `services` | Reusable business modules (logic *and* presentation) shared by two or more features. |
| `shared` | Code with no feature ownership — API client, generic UI, global config/routes, cross-cutting helpers. |

## `app`

The composition root. Holds the app's most frequently-changing logic: entry point,
global providers, theme, router, and the authenticated shell. `app` is where
everything else gets wired together — it's expected to know about `features` and
`shared`, not the other way around.

## `feature`

A large, independent chunk of functionality — everything a feature needs (pages,
components, local logic) lives inside it. A feature is a **module**: consumers only
see its public API, never its internals (see Boundaries below).

## `services`

Reusable business modules — logic _and_ presentation — shared by two or more
features. Not simple utilities (those can just be a function in `shared/lib`);
services hold real business rules/flows that multiple features need.

## Boundaries

Enforced as a hard ESLint error (`eslint-plugin-boundaries`, `eslint.boundaries.ts`)
— a violation fails `npm run check`, not just a convention. Import direction only
flows downward: `app` → `features` → `services` → `shared`.

- **`app`** may import `shared` freely, and `features` only through a feature's
  public API (`index.ts`/`index.tsx` or `*.page.tsx`). No deep imports into a
  feature's internals.
- **`features`** may import `shared`, `services` (only through a service's
  public API — `index.ts`/`index.tsx`), and their own internals. **No
  cross-feature imports**, even through a public API — move shared code to
  `shared` or to `services` instead.
- **`services`** may import `shared` only — never `app` or `features`.
- **`shared`** may only import other `shared` code. All other layers may import
  from it — it's the base of the dependency graph.

## Module evolution

A feature, or a service grows in stages — promote it to the next stage
only once it actually outgrows the current one. Unnecessary structure is worse than
insufficient structure.

- **Stage 1 — single file.** Starts as one `*.page.tsx`. No subfolders until there's a real reason.
- **Stage 2 — flat module.** A handful of files (components/hooks) stay flat in the
  feature folder or its `ui/` subfolder — the pattern `auth/` already uses
  (`login.page.tsx`, `forgot-password.page.tsx`, `ui/auth-layout.tsx`). Don't force
  subgrouping yet.
- **Stage 3 — grouped module.** Once a feature's file count grows past roughly a
  dozen-plus files, split into semantic subfolders as needed: `ui/`
  (presentation), `model/` (state/hooks), `api/` (feature-local API calls/
  contracts), `domain/` (pure business-rule functions). Add only the groups
  actually needed, not all of them upfront.
- **Stage 4 — composed.** Only if a feature's own submodules need decoupling from
  each other (rare at this project's size), use a `compose/` group as the single
  place that wires them together via props/events/DI, instead of letting
  submodules import each other directly.

### Submodules vs. groups

A feature (or service) can contain **submodules** — nested modules that are
themselves at any evolution stage, each with its own public API (`index.ts`):

```
appointments/
  appointment-list/
    index.ts
    appointment-list.page.tsx
    use-appointment-list.tsx
  appointment-create-form/
    index.ts
    appointment-create-form.tsx
    use-appointment-create.tsx
```

Submodules are cheap but don't scale past ~6 siblings comfortably (heterogeneous
folders get hard to scan). Once you'd cross that, prefer a **group** instead of
more submodules — a group tolerates far more entries (up to ~20) because its
contents are homogeneous.

The distinction matters:

- **Module** — creates an abstraction. You interact with it only through its
  public API (`index.ts`); its internals are opaque and are what the Boundaries
  rules protect. A feature is a module. A submodule is a module.
- **Group** — an organizational folder for several modules/files that share a
  trait (e.g. `ui/`, `model/`, `api/`). A group does **not** hide its contents and
  needs no public API — it's a sorting aid, not a boundary.

## `shared/`

Code with no feature ownership lives here, split into groups by responsibility.
Unlike the app/features/services boundaries, this internal split is **not**
ESLint-enforced — it's a convention to keep the layer navigable, not a hard rule:

- `api/` — the OpenAPI-typed HTTP client (`http-client.ts`, `errors.ts`,
  `types.ts`) plus `generated/` (regenerated, not hand-edited).
- `ui/` — generic UI reused across features.
- `model/` — global data/config (`config.ts`, `routes.ts`). Also where a global
  client-state store would live if one's ever needed (e.g. `store.ts`) — not
  needed today.
- `lib/` — cross-cutting infrastructure and helpers.
- `domain/` - global business types isolated from everything else.

Promote code into `shared/` only once at least two features actually need it — not
preemptively. Treat it as a last resort: an overgrown `shared/` (especially UI or
API modules) is where accidental coupling and bugs tend to accumulate.

Within `ui/`, stay flat — one file per component — and only give a component its own subfolder once it's
genuinely more than one file.
Don't create a directory for a single file.

## Directory & file naming

- Kebab-case for all directories and files.
- A feature's public entrypoints are `*.page.tsx` files or an `index.ts`/
  `index.tsx` — everything else inside a feature is internal.
- Name page components by the action/meaning they represent, as
  `<entity>-<action>.page.tsx` (file) — e.g. `appointment-list.page.tsx`, with
  actions like `List`, `Item`, `Create`, `Edit`. Do not name pages by the bare
  entity, and never rely on singular/plural to distinguish them: a list vs. detail
  pair must not read as `<entities>.page.tsx` vs. `<entity>.page.tsx`, since that
  differs by a single letter and is easy to misread.
- Feature-internal, non-page UI lives in that feature's `ui/` folder.
- Reusable components live in `shared/ui/`, one component per file, filename
  matching the component. Only give a component its own subfolder once it's more
  than one file — see `shared/`'s `ui/` note above.
- Co-locate a component's CSS Module (`<component>.module.css`) and any
  component-specific config/data next to the component file, not in a shared or
  global location.
- Hooks are named `use-<name>.ts`/`.tsx`.

See `src/features/README.md` for the feature public-API rule,
`.claude/skills/component/SKILL.md` for component-level conventions (styling,
touch targets, accessibility), and `.claude/skills/authorization/SKILL.md`
for session/auth state, route guards, and role-gated UI.
