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
  "0B": {
    title: "Application Shell",
    status: "complete",
    completedAt: "2026-07-16",
    deliverables: [
      "AvepLayout (top bar + collapsible sidebar + breadcrumbs + page title + main + footer)",
      "AvepTopBar with global search trigger, tenant/program/scenario/persona selectors, notifications, help",
      "AvepSidebar with 21 grouped nav placeholders (Plan/Design/Verify/Deliver/Platform), icon-collapse mode",
      "AvepCommandPalette (Cmd/Ctrl+K, arrow-key + Enter + Esc navigation)",
      "Sonner toast host mounted in shell",
      "Keyboard shortcuts: Cmd/Ctrl+K (palette), Cmd/Ctrl+B (sidebar toggle)",
      "Every nav entry routes to a ModulePlaceholder marking the module as NOT INSTALLED",
    ],
  },
} as const;
