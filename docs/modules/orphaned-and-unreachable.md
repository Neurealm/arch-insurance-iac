# Stage 2 — Orphaned and Unreachable Implementation

Two distinct signals, deliberately not merged.

## 1. Unreachable routes — 198 of 436

A route is **reachable** when it is referenced by a navigation entry, by an
internal link (`<Link to>`, `href`, `navigate(...)`) anywhere in `src/`, or when
it is an index/layout route of a reachable parent. Everything else is
unreachable *by static analysis*.

Largest unreachable clusters:

| Cluster | Approx. routes | Note |
|---|---|---|
| `/carve-out/*` deep pages | ~70 | Reached only via the `/carve-out/:group/:slug` dynamic route, which the analyser cannot statically expand. **Likely a false positive.** |
| `/assurance/*` | 3 | No navigation entry and no inbound link found. |
| `/admin/technology-taxonomy/*` create routes | 2 | Reached from buttons that build paths at runtime. Likely false positive. |
| Flat legacy routes (`/alerts`, `/auth-orchestration`, …) | ~20 | No inbound reference found. Genuine orphan candidates. |
| `/_dev/cae-components` | 1 | Intentional developer-only route. |

**Do not treat this list as a delete list.** Runtime-composed paths and dynamic
route parameters both produce false positives, and the report says so rather
than pretending to certainty.

## 2. Unused implementation files — 230 items

Files with zero import sites and no route reference. Examples confirmed by
inspection:

- `src/components/eoc/KpiStrip.tsx`, `IncidentTrend.tsx`, `IncidentsPanel.tsx`,
  `AIInsightRibbon.tsx`, `DigitalCoworkers.tsx` — superseded EOC widgets.
- `src/components/crm/PromoteToTenantDialog.tsx`, `StakeholderSheet.tsx`.
- `src/components/auth/AuthVerificationOverlay.tsx`, `TenantAccessGuard.tsx` —
  authorization components not wired into any route guard. Worth a security
  review before removal: unused guards may indicate a control that was intended
  but never applied.
- `src/avep/manifest.ts`, `src/avep/data/canonical.ts` — referenced only through
  dynamically-composed imports in the AVEP route factory; **false positives**.

## Recommended handling

1. Never remove anything from this report automatically.
2. For each candidate: confirm no dynamic import, no string-built route, no
   test-only usage.
3. Treat unused auth/guard components as security findings for review, not as
   dead code.
4. Re-run `node scripts/scan-implementation.mjs` after any deletion to confirm
   the count moved as expected.
