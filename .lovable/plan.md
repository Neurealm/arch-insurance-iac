## Sidebar cleanup plan

Scope: `src/components/eoc/Sidebar.tsx` + a small CSS addition in `src/index.css` for the custom scrollbar. No nav structure changes, no route changes.

### 1. Fix label truncation
- Widen expanded sidebar from `w-[268px]` → `w-[284px]` so depth-0 labels like "App Ops Control Plane" and "Site Resilience Engineering" fit alongside chevron + pin.
- Reduce depth-0 horizontal padding from `px-3` → `px-2.5` and shrink the gap before chevron buttons (pin button stays hover-only so it doesn't steal space).

### 2. Quieter active state
- Replace the loud `bg-sidebar-primary` solid fill on the active row with:
  - `bg-primary/10 text-primary font-medium`
  - keep the existing 3px left accent bar, recolored to `bg-primary`
  - active icon inherits `text-primary`
- `trailActive` stays as the subtle `bg-sidebar-accent/60`.
- Collapsed-mode icon button gets the same treatment (left bar + tint instead of solid pill).

### 3. Thin custom scrollbar
- Add a `.sidebar-scroll` utility in `src/index.css` styling `::-webkit-scrollbar` to 6px wide, transparent track, `hsl(var(--sidebar-foreground) / 0.15)` thumb, hover → 0.3, plus `scrollbar-width: thin` for Firefox.
- Apply it to the `<nav>` element and drop `scrollbarGutter: stable` (no longer needed with the slim scrollbar).

### 4. Merge the two bottom toggles into one header control
- Remove the bottom "Collapse all sections" + "Compact mode" buttons entirely.
- Move a single collapse/expand icon button into the brand header (right side, next to "neuGAIN" lockup). Uses `ChevronsLeft` / `ChevronsRight`.
- "Collapse all sections" behavior is dropped — it's redundant with per-section chevrons and pinning.

### 5. Compact user footer
- Replace the boxed `UserPill` card with a single 40px-tall row: 24px avatar, name (truncated), small logout icon button on the right.
- Remove the border + rounded background; just a top border above the row.
- Collapsed variant: 28px avatar + logout icon stacked, no card chrome.

### 6. Section group labels
- Insert three muted uppercase labels (`text-[10px] tracking-[0.14em] text-sidebar-foreground/50 px-3 pt-3 pb-1`) at fixed positions in `visibleTree` rendering:
  - "PLATFORM" before `home`
  - "PRACTICES" before `sre-practice`
  - "OPERATIONS" before `carve-op`
  - "WORKSPACE" before `vendors`
- Implemented as a small render helper that emits a label `<div>` when the current node key matches one of the boundary keys, then renders the node.

### 7. Quick Actions polish
- Keep the collapsible group but restyle the header button: remove the surrounding card (`mx-3 rounded-xl bg-sidebar-accent/50 border`), keep just the uppercase label row matching the new section labels for visual consistency. The action buttons render below it without a card.

### Files changed
- `src/components/eoc/Sidebar.tsx` — all of the above
- `src/index.css` — `.sidebar-scroll` utility (≈10 lines)

### Out of scope
- Nav tree contents, routing, pin/scroll-restore logic, hover-card flyouts in collapsed mode (kept as-is).
