# Commercial sidebar: full page coverage

## Goal
Make the Commercial left-side navigation reflect every built page in the module, with no duplicate or dead entries.

## Current state (verified)
- 19 page components exist under `src/commercial/pages/`, wired to routes in `src/App.tsx`.
- The sidebar (`NAV` array in `src/commercial/shell/CommercialLayout.tsx`) lists 16 entries.
- All 15 top-level pages are already linked, but two entries point at the same route: "Program & Timeline" (Commercial group) and "Timelines" (Governance & Delivery group) both go to `/commercial/program-timeline`. React also renders both with the same `key`.
- The 4 remaining pages are parameterised detail screens with no standalone URL:
  - Change-Set Detail — `/commercial/model/assumptions/change-sets/:id`
  - Comparison Detail — `/commercial/model/compare/:id`
  - Sensitivity Detail — `/commercial/model/sensitivity/:id`
  - Release Detail — `/commercial/model/release/:versionId`

## Changes
1. Remove the duplicate route entry: keep "Timelines" under Governance & Delivery, drop "Program & Timeline" from the Commercial group (same destination page).
2. Add a non-clickable "Detail views" hint group at the bottom of the sidebar listing the four drill-down screens as static, muted text with a short "opened from" note (e.g. Change Set — from Assumptions), so every built page is represented without creating broken links.
3. Change the `NAV` map key from `to` to `label` so entries stay unique.

## Technical notes
- Single file: `src/commercial/shell/CommercialLayout.tsx`.
- Presentation only: no route, permission, data, or page-logic changes.
- Verify with a TypeScript check and the existing commercial guide test suite.
