/**
 * AIM-007 — shared motion and interaction tokens for the Agentic SRE NOC pages.
 *
 * Every transition is restrained (150–250 ms, ease-in-out) and every token
 * disables itself under `prefers-reduced-motion`. Components import these
 * instead of hand-writing transition utilities so hover, focus and drawer
 * behaviour stay identical across the module.
 */

/** Panels, cards and other static surfaces that change tone on hover/selection. */
export const surfaceTransition =
  "transition-[background-color,border-color,box-shadow,opacity] duration-200 ease-in-out motion-reduce:transition-none";

/** Buttons, table rows, list items and other quick colour-only affordances. */
export const controlTransition =
  "transition-colors duration-150 ease-in-out motion-reduce:transition-none";

/** Backdrop behind modal drawers. */
export const backdropEnter = "animate-fade-in motion-reduce:animate-none";

/** Drawer panel: bottom sheet on mobile, right-hand slide on desktop. */
export const drawerEnter =
  "animate-fade-in motion-reduce:animate-none sm:animate-slide-in-right";

/** Consistent keyboard focus treatment. */
export const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 focus-visible:ring-offset-white";
