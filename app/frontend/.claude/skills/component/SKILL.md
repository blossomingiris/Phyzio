---
name: component
description: Use this skill when you create or update a UI component in this project
---

# Component best practices

This file defines rules for how we build UI components

For file layout and naming (where a component lives, when it gets its own
folder, CSS Module co-location) see `.claude/rules/architecture.md`.

---

## 1. Compound components

Default to a simple component built from Mantine's ready-made primitives. Don't reach for the compound pattern unless the Developer asks for it, or
the component is genuinely complex — several structural pieces that need to
share state (e.g. collapsed/expanded) without prop-drilling. No explicit
guidance → pick the simple approach.

---

## 2. Styling

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

## 3. Touch targets (tablet-first)

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

---

## 4. Accessibility

Only the basics Mantine doesn't already give us for free.

- **Heading order.** One `order={1}` `Title` per page (the page's main
  heading), then nest subsequent headings sequentially by `order` without
  skipping levels. Use `order` to express hierarchy, not `size`.
- **Images.** Meaningful images get descriptive `alt` text; purely decorative
  images get `alt=""` (empty, never omitted).
- **Icon-only controls.** An `ActionIcon`/icon-only button with no visible
  text needs `aria-label` describing the action — icons carry no semantics on
  their own (see `NavbarToggle` in `navbar.tsx` for the pattern: `ActionIcon`
  + `aria-label` + `Tooltip`). Icons paired with visible text, or passed into
  a component prop (e.g. `Alert`'s `icon`), need nothing extra.
