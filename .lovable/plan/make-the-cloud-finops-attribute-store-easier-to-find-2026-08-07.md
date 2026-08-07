# Make the Cloud FinOps Attribute Store easier to find

The page already exists and works at `/enterprise-cognitive-fabric/modeling-memory/cloud-finops-attribute-store`. The only way in is a small yellow "Open" button in the Actions column of the Cloud FinOps row in the Team Persona Library — that column sits far right in a wide, scrollable table, so the button is easy to miss. No sidebar link will be added.

## What changes

1. **Row-level highlight** — give the Cloud FinOps row a subtle amber tint and a left amber accent bar so it reads as the one row with a deeper drill-down.
2. **Inline badge next to the team name** — add a small amber "Attribute Store" badge in the Team Name cell, which is always visible without horizontal scrolling. Clicking it navigates to the page.
3. **Stronger action button** — enlarge the existing yellow "Open" button slightly, add an external/arrow icon and the label "Open Attribute Store", and keep the amber fill plus focus ring.
4. **Callout above the table** — a one-line amber banner in the Inventory view: "Cloud FinOps has a structured Persona Attribute Store (FOP-001 – FOP-080)" with a direct link.

Accessible labels stay descriptive; other persona rows are untouched.

## Technical notes

- Single file: `src/pages/enterprise-cognitive-fabric/persona-library/panels.tsx`.
- Row styling and badge keyed off the same `p.teamName === "Cloud FinOps"` check already used for the yellow button.
- Badge and banner use `react-router` `Link` with `stopPropagation` so they don't trigger the row's drawer-open handler.
- No data, route, or store changes; existing tests remain valid.
