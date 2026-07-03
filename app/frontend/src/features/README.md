# features

Each direct child folder here is one **feature** — a self-contained slice of the
app. A feature is imported only through its public API:

- `index.ts` / `index.tsx`, or
- a `*.page.tsx` entry.

Rules (enforced by `eslint-plugin-boundaries`):

- A feature may import from `shared` and from its own internals.
- A feature may **not** import another feature's internals (no sibling coupling).
- Deep-importing into a feature from outside (any file other than its public API)
  is disallowed.
