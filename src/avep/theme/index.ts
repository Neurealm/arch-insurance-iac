export { AvepThemeProvider, useAvepTheme, AVEP_IDENTITY } from "./ThemeProvider";
export type { AvepIdentity } from "./ThemeProvider";

/**
 * Responsive breakpoints (px). Mirror the CSS custom properties in tokens.css
 * so JS-side layout logic can consume the same values as CSS.
 */
export const AVEP_BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type AvepBreakpoint = keyof typeof AVEP_BREAKPOINTS;
