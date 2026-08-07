# Make the Cloud FinOps Attribute Store easy to find

The page is already built and works at `/enterprise-cognitive-fabric/modeling-memory/cloud-finops-attribute-store`. The only way in is the small yellow "Open" button on the Cloud FinOps row of the Team Persona Library, which is easy to miss in a dense table. No sidebar link will be added.

## Changes

1. **Highlight the Cloud FinOps row** in the Team Persona Library table with a soft amber background tint and a left amber accent border so the row reads as special.
2. **Upgrade the entry button** from a 6px-tall "Open" chip to a clearly labeled amber action button reading "Open Attribute Store" with an external-arrow icon, sized larger than the other row actions.
3. **Add a "Attribute Store" badge** next to the Cloud FinOps team name so the capability is visible even when the Actions column is scrolled out of view.
4. **Add a callout banner** above the persona table (Inventory view) stating that Cloud FinOps has a structured Persona Attribute Store, with a direct link to the page.
5. **Add the same link inside the persona detail drawer** for Cloud FinOps, so opening the persona record also surfaces the store.

## Technical notes

- All edits are in `src/pages/enterprise-cognitive-fabric/persona-library/panels.tsx` (table row, badge, callout, drawer section).
- Styling uses the existing amber accent already applied to the button; no design-token changes.
- Route and page code are untouched.
