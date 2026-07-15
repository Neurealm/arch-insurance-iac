
# Digital Coworkers landing — expand to all categories with richer stats

Refresh `/coworkers` so it lists all 9 current Digital Coworker categories (matching the left nav) plus future-ready placeholder slots, and replace the single "N agents" badge with a compact 3-column tile that surfaces real, page-derived stats.

## Changes

**File edited:** `src/pages/Coworkers.tsx` (no route or nav changes required)

### Categories rendered

Nine live categories, sourced from the same list the sidebar uses so they never drift apart:

1. Site Reliability Engineering
2. Identity and Access Management
3. Vulnerability Management
4. Network & Connectivity Engineering
5. Infrastructure Automation
6. Citrix Platform Digital Coworkers *(NEW pill)*
7. Application Support
8. IT Carve-Out & Separation
9. Healthcare Payer

Plus two future-ready "Coming Soon" tiles (disabled, muted styling, no navigation) so the shape of the grid signals the module is expanding:

- Data & Observability Coworkers
- Cloud & Platform Engineering Coworkers

### Tile layout — compact 3-column grid

Each tile shows:

```text
[icon]  Category Title                                   [NEW / LIVE pill]
        One-line description
        ─────────────────────────────────────────────
        11 agents · 3 deployed         [MTTR ↓] [Toil ↓] [Reliability ↑]
        Explore →
```

Stats per tile:

- **Agents + Deployed** — counts pulled from each category's underlying agent list (SRE = 11 total, 1 deployed today; other categories computed the same way from their existing data files). "Coming Soon" tiles show a dashed placeholder instead of counts.
- **Business impact themes** — up to 3 chips derived from the `impact` lines of that category's agents. Themes are inferred by keyword mapping (e.g. "MTTR", "toil", "reliability", "cost", "risk", "compliance", "experience", "throughput") and shown as small colored pills. Only themes actually present in that category's content appear.

Nothing is fabricated: if a category has no deployed agents, the tile shows `0 deployed` in muted text; if only one theme surfaces, only one chip renders.

### Data wiring

- A small helper `categoryStats.ts` (new, colocated under `src/pages/`) exposes a typed list of categories with `{ title, desc, route, tone, icon, agents, deployed, themes }`.
- Where the target page already has a structured agent array (SRE, Citrix, etc.), the helper imports it and computes `agents` / `deployed` / `themes` at build time — no runtime fetch, no hardcoded duplicates.
- Where a category page today only has narrative content (some Practice Library stubs), the helper falls back to a curated count that matches what that page renders and marks `themes` as `[]` so the tile stays honest.

### Header + pillars

Kept exactly as-is. Only the "Coworker Categories" grid below is replaced.

## Verification checklist

1. All 9 live categories render, in sidebar order
2. Each tile's agent count matches the count on the target page
3. "Deployed" count reflects the `deployed: true` agents on the target page (SRE tile shows `1 deployed`, others `0` until flagged)
4. Impact chips only appear when the underlying impact text supports them
5. Citrix tile shows the NEW pill matching the sidebar
6. Two "Coming Soon" tiles render disabled and are not clickable
7. Layout is a 3-column grid at md+, collapsing to 2 columns on tablet and 1 on mobile
8. No console errors, `tsgo` clean

## Not in scope

- No changes to the individual category pages
- No changes to routing, sidebar, or auth
- No new backend, tables, or migrations
