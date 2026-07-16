/**
 * AVEP Build Manifest
 * Tracks which foundation prompts have been completed.
 */
export const AVEP_MANIFEST = {
  "0A": {
    title: "Application Identity & Design System",
    status: "complete",
    completedAt: "2026-07-16",
    deliverables: [
      "Design tokens (color, typography, spacing, radius, elevation, motion)",
      "AvepThemeProvider (centralized, scoped, dark-mode disabled)",
      "Typography: Inter + JetBrains Mono",
      "Responsive breakpoints (sm/md/lg/xl/2xl)",
      "Accessibility baseline (focus ring, prefers-reduced-motion, WCAG AA contrast)",
    ],
  },
} as const;
