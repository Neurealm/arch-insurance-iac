## Goal

Refactor `src/components/eoc/Sidebar.tsx` (used app-wide via `AppShell`) into a premium, dark-navy enterprise navigation matching Datadog / ServiceNow / Foundry aesthetics — while preserving today's routes, tree data, pinning, collapse, tenant/auth footer, and mobile drawer behavior.

## Scope

- Restyle only the primary app sidebar. Module-level rails (Data Orchestration, SEAD, etc.) are out of scope for this pass.
- No route changes. Existing `tree` data in `Sidebar.tsx` stays as the single source of truth (JSON-shaped `Node[]`).
- Reuse `lucide-react` icons already imported.

## New visual system

- Background: deep navy `#0B1235` with subtle inner shadow and 1px right border.
- Width: 280px collapsed rail (icon+section), 360px expanded. Smooth 250ms width transition.
- Typography: Inter, weights 500/600/700. Parent 15px / Child 14px / Section 11px uppercase tracked.
- Section headers: `PLATFORM`, `AI & DATA`, `DIGITAL TWINS`, `PRACTICES`, `OPERATIONS`, `SETTINGS` — muted slate-400, 32px top spacing.
- Parent row: rounded-xl capsule, icon 18px, chevron rotates 90° on expand.
- Selected item: coral/red pill (`bg-rose-500/15`), 3px left accent bar (`bg-rose-400`), white text, soft glow.
- Hover: `bg-white/5` on parents, `bg-sky-400/10` on children, icon scales 1.05.
- Children: 28px indent, vertical guide line (`border-l border-white/10`), fade-in.
- Accordion: CSS grid-rows height animation, 250ms ease.

## New features layered on top

- **Search bar** pinned at top with ⌘K/Ctrl+K shortcut. Fuzzy match over flattened tree; grouped results (Pages / Twins / Recent / Favorites); Enter navigates.
- **Favorites**: star icon per row, persisted in `localStorage`. "Pinned" section auto-renders above sections when non-empty.
- **Recent Pages**: last 5 routes visited, persisted in `localStorage`, auto-updated on route change.
- **Badges**: extend `Node` with `statusDot?: "green"|"amber"|"red"|"blue"` and `pill?: "LIVE"|"NEW"|"BETA"|"DRAFT"` alongside existing `badge`.
- **Context awareness**: active route auto-expands its ancestor chain and scrolls the row into view.
- **Footer** (existing): environment chip (green dot • Production), workspace, avatar, notifications, settings, collapse toggle — restyled to the dark theme.
- **Responsive**: keep existing mobile drawer; auto-collapse under `lg`.

## Section mapping (from existing tree — no route changes)

```text
PLATFORM        Command Center, Operations Overview
AI & DATA       AI Engineering, SRE Data Orchestration
DIGITAL TWINS   App Ops Control Plane, Site Resilience Engineering,
                S.E.A.D. RunOps, Semiconductor Ops Command Center
PRACTICES       RunOps Practice, Cyber Security Practice
OPERATIONS      IT Carve-Out, ITSM, Business Services,
                Digital Coworkers, Questionnaires, CRM
SETTINGS        Settings
```

Sections are declared as a small `sections: { label, keys: string[] }[]` array that references the existing `Node.key`s — so future additions keep working with a one-line change.

## Componentization

Split the current monolith into `src/components/nav/`:

- `PrimaryNav.tsx` — wires state, search, favorites, recents, sections
- `NavSection.tsx` — uppercase section label + slot
- `NavGroup.tsx` — parent accordion row (animated chevron, active-trail, guide line)
- `NavItem.tsx` — leaf row (icon, label, badge, pill, status dot, favorite star)
- `NavSearch.tsx` — command palette-style search with ⌘K
- `NavFavorites.tsx` / `NavRecent.tsx`
- `NavFooter.tsx` — env, workspace, user, actions
- `useNavPrefs.ts` — localStorage hooks for open groups, pinned favorites, recents, collapsed state

`Sidebar.tsx` becomes a thin wrapper that keeps its existing export so `AppShell.tsx` and every consumer keeps working unchanged.

## Preserved behavior

- Existing `Node` tree, routes, hover-cards on collapsed rail, pin-to-open, scroll persistence, tenant scope, auth sign-out.
- Existing collapse toggle and mobile drawer continue to work.

## Out of scope

- Module rails (Data Orchestration Twin `DataOrchLayout`, SEAD rail, etc.) keep their current light styling. A follow-up can align them.
- No new routes, no data-model changes.

## Verification

- Load `/`, `/prod-resilience-twin`, `/data-orchestration-twin`, `/sead/command-center`, `/semiconductor/command-center`; confirm active route highlights, ancestor expands, search jumps, favorites persist, collapse rail works.
- Check `tsgo` build clean.
