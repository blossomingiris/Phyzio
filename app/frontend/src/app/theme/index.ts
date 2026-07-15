import {
  createTheme,
  type CSSVariablesResolver,
  type MantineColorsTuple,
} from "@mantine/core";
import classes from "./theme.module.css";

function buildColorTuple({
  subtle,
  subtleHover,
  base,
  hover,
  text,
}: {
  subtle: string;
  subtleHover: string;
  base: string;
  hover: string;
  text: string;
}): MantineColorsTuple {
  return [
    base,
    subtle,
    subtleHover,
    base,
    base,
    base,
    base,
    hover,
    hover,
    text,
  ];
}

const primary = buildColorTuple({
  subtle: "oklch(0.96 0.03 31)",
  subtleHover: "oklch(0.93 0.05 31)",
  base: "oklch(0.6664 0.1899 30.91)",
  hover: "oklch(0.54 0.190 31)",
  text: "oklch(0.48 0.15 42)",
});

const accent = buildColorTuple({
  subtle: "oklch(0.893 0.027 12)",
  subtleHover: "oklch(0.85 0.04 12)",
  base: "oklch(0.628 0.023 11)",
  hover: "oklch(0.55 0.023 11)",
  text: "oklch(0.399 0.018 290)",
});

const success = buildColorTuple({
  subtle: "oklch(0.936 0.07 159)",
  subtleHover: "oklch(0.90 0.09 159)",
  base: "oklch(0.66 0.13 159)",
  hover: "oklch(0.60 0.13 159)",
  text: "oklch(0.54 0.13 159)",
});

const error = buildColorTuple({
  subtle: "oklch(0.93 0.05 25)",
  subtleHover: "oklch(0.89 0.07 25)",
  base: "oklch(0.62 0.20 25)",
  hover: "oklch(0.56 0.20 25)",
  text: "oklch(0.52 0.19 25)",
});

const foreground = "oklch(0.399 0.018 290)";
const surfaceSubtle = "oklch(0.97 0 0)";
const surfaceSubtleHover = "oklch(0.93 0 0)";
const surfaceInput = "oklch(0.985 0 0)";

export const theme = createTheme({
  primaryColor: "primary",
  primaryShade: 6,
  black: foreground,
  white: "#ffffff",
  colors: {
    primary,
    accent,
    success,
    error,
  },
  fontFamily:
    "'Inter Variable', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  headings: {
    fontFamily:
      "'Geist Variable', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    fontWeight: "600",
    sizes: {
      h1: { fontSize: "1.75rem", lineHeight: "1.2" },
      h2: { fontSize: "1.5rem", lineHeight: "1.2" },
      h3: { fontSize: "1.25rem", lineHeight: "1.3" },
      h4: { fontSize: "1.125rem", lineHeight: "1.35" },
      h5: { fontSize: "1rem", lineHeight: "1.4" },
      h6: { fontSize: "0.875rem", lineHeight: "1.4" },
    },
  },
  radius: {
    xs: "0.25rem",
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.625rem",
    xl: "0.875rem",
  },
  defaultRadius: "md",
  spacing: {
    xs: "0.5rem",
    sm: "0.75rem",
    md: "1.125rem",
    lg: "1.5rem",
    xl: "2.25rem",
  },
  shadows: {
    xs: "oklch(0 0 0 / 0.05) 0 1px 2px",
    sm: "oklch(0 0 0 / 0.06) 0 1px 3px, oklch(0 0 0 / 0.04) 0 2px 4px",
    md: "oklch(0 0 0 / 0.07) 0 2px 6px, oklch(0 0 0 / 0.05) 0 4px 8px",
    lg: "oklch(0 0 0 / 0.08) 0 4px 12px, oklch(0 0 0 / 0.05) 0 8px 16px",
    xl: "oklch(0 0 0 / 0.10) 0 8px 24px, oklch(0 0 0 / 0.06) 0 12px 32px",
  },
  components: {
    Card: { defaultProps: { radius: "lg" } },
    Paper: { defaultProps: { radius: "xl" } },
    Modal: { defaultProps: { radius: "lg" } },
    Drawer: { defaultProps: { radius: "lg" } },
    Input: {
      defaultProps: { size: "sm" },
      classNames: { input: classes.input },
    },
    Checkbox: { defaultProps: { color: "accent" } },
    Button: { defaultProps: { radius: "xs" } },
    Tooltip: { defaultProps: { radius: "xs" } },
  },
});

export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {
    "--surface-subtle": surfaceSubtle,
    "--surface-subtle-hover": surfaceSubtleHover,
    "--surface-input": surfaceInput,
  },
  light: {
    "--mantine-color-dimmed": "oklch(0.55 0.015 290)",
    "--mantine-color-placeholder": "oklch(0.65 0.012 290)",
    "--mantine-color-default-border": "oklch(0.9 0.01 290)",
    "--mantine-color-error": "var(--mantine-color-error-6)",
    "--input-asterisk-color": "var(--mantine-color-primary-6)",
  },
  dark: {},
});
