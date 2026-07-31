## What exists today

The right-side guide panel is already built and mounted on every `/commercial/*` route (`CommercialLayout` → `CommercialGuideRoot`). The only way to open it is the small outline button labeled **Commercial Guide** in the page header, top-right — visible in your screenshot between the page title and the "Platform Admin" badge. Clicking it slides the guide drawer in from the right.

Nothing is broken; it is just visually indistinguishable from the other header controls. This plan makes it obvious.

## Changes (frontend/presentation only)

1. **Promote the header button**
   - Change `CommercialGuideButton` from `variant="outline"` to a filled/primary-toned button with the book icon, so it reads as the page's help affordance rather than a secondary control.
   - Add the keyboard shortcut hint in the tooltip.

2. **Add a persistent right-edge "Guide" tab**
   - A slim vertically-labeled tab pinned to the right edge of the viewport (mid-height), visible on all Commercial pages, that opens the same drawer.
   - Hidden while the drawer is open and during a walkthrough; hidden on small screens; excluded from print.
   - Purely a second trigger — reuses `useCommercialGuide().setOpen(true)`.

3. **Keyboard shortcut**
   - `Shift + ?` (and `Escape` to close, already handled by the Sheet) toggles the guide, registered in `CommercialGuideProvider` and ignored while typing in inputs.

4. **One-time in-session hint**
   - A small dismissible pointer near the header button on the first Commercial page view of a session ("Page-specific guidance lives here"), auto-dismissing after ~8s or on first open.
   - Session state only, held in the existing provider — no localStorage, no backend, consistent with the current no-persistence rule.

## Technical notes

- Files touched: `src/features/commercial-guide/CommercialGuideButton.tsx`, `CommercialGuideProvider.tsx`, `CommercialGuideRoot.tsx`, plus one new `CommercialGuideEdgeTab.tsx`.
- No changes to guide content, registry, routes, anchors, walkthrough logic, or any commercial data/calculations.
- Existing 258 guide tests should continue to pass; the new tab/shortcut get light coverage in the cross-page test file.
