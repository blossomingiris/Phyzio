---
name: component
description: Use this skill when you create or update a UI component in this project
---

# Component best practices

This file defines rules for how we build UI components

---

## 1. File layout

- One component per file, kebab-case filename matching the
  existing sibling files in that folder.
- Reusable, generic components (not tied to one feature) live in
  `src/shared/components/<name>/`.
- Feature-specific components live inside that feature's `ui/` folder and are
  never imported from outside the feature (only the feature's `*.page.tsx` /
  `index.ts` is public — enforced by `eslint-plugin-boundaries`).
- Co-locate the CSS Module next to the component: `<component>.tsx` +
  `<component>.module.css` in the same folder. Don't put component styles in a
  shared/global stylesheet.
- Config/data that's specific to one component lives next to it

---

## 2. Compound components

Default to a simple component built from Mantine's ready-made primitives. Don't reach for the compound pattern unless the Developer asks for it, or
the component is genuinely complex — several structural pieces that need to
share state (e.g. collapsed/expanded) without prop-drilling. No explicit
guidance → pick the simple approach.

---

## 3. Styling

- **No dark theme.** This app doesn't support dark mode and it's not planned.
  Never use `light-dark()` and never reference `--mantine-color-dark-*` vars.
- **Use our own semantic CSS vars, not Mantine's raw palette.** Extend
  `theme/index.ts`'s `cssVariablesResolver` with a semantic token
  directly in a component's CSS Module. Add new
  tokens there as needed rather than inventing one-off values per component.
- For hover/active states on a themed color, use Mantine's variant vars
  (`--mantine-color-{name}-light`, `-light-hover`, `-light-color`) instead of
  a hand-picked gray.
- **Class names are semantic, not content-based.**
- Prefer normal document flow over `position: absolute` + `transform` +
  hand-picked `z-index` for interactive elements — it's fragile and easy to
  accidentally break.

---

## 4. Touch targets (tablet-first)

The app targets **tablets primarily, laptops secondarily** — not phones, not
large desktop monitors.

- Minimum interactive target: **44×44pt** (Apple HIG; Material's equivalent
  is 48×48dp).
- `Input`, `Button`, and `Checkbox` default to `size="md"` in the theme for
  this reason — don't drop to `sm` without a specific reason.
- Don't rely on `:hover` alone for anything essential — touch has no hover.
  `Tooltip` is fine as a bonus for mouse/trackpad, not as the only way to get
  required information.
- Don't build a mobile-drawer / off-canvas-hide breakpoint unless a phone
  breakpoint is actually in scope.
