# CDT Reference Manual — Master Outline

Status: Foundation (CDT-REFERENCE-FOUNDATION, 2026-07-26).
Defines the volume architecture, chapter inventory, authoring order and the final
consolidated master artifact. No volume content is authored here.

Governing standard: `cdt-reference-authoring-standard.md`.

---

## Volume 1 — Commercial Digital Twin Foundations

Readiness: **Ready**.

1. Module purpose and business context
2. Business and technical architecture (three-layer)
3. Core taxonomy (from `cdt-product-taxonomy.md`)
4. Canonical hierarchy and operating levels
5. End-to-end lifecycle narrative
6. Navigation model and the module boundary
7. Scenario model and what scenarios are not
8. Financial-engine overview (Revenue → P&L → Cash)
9. Governance, permissions, immutability and audit
10. How to use this manual (volumes, confidence codes, in-app markers)

---

## Volume 2 — Screen-by-Screen Reference

Readiness: **Ready with targeted gaps** (`GAP-01`, `GAP-03`).
One chapter per screen, each using the 28-section screen-chapter standard.

| Chapter | Screen |
|---|---|
| 2.0 | SCR-00 Commercial Shell |
| 2.1 | SCR-01 Overview |
| 2.2 | SCR-02 Program |
| 2.3 | SCR-03 Scenarios |
| 2.4 | SCR-04 Portfolio |
| 2.5 | SCR-05 Sources |
| 2.6 | SCR-06 Revenue |
| 2.7 | SCR-07 P&L (Cost & EBITDA) |
| 2.8 | SCR-08 Cash & Sustainability |
| 2.9 | SCR-09 Assumptions & Change Sets |
| 2.10 | SCR-10 Change-Set Detail |
| 2.11 | SCR-11 Scenario Comparison |
| 2.12 | SCR-12 Comparison Detail |
| 2.13 | SCR-13 Sensitivity Analysis |
| 2.14 | SCR-14 Sensitivity Detail |
| 2.15 | SCR-15 Release & Activation |
| 2.16 | SCR-16 Release Detail |
| 2.17 | Cross-cutting states appendix |

---

## Volume 3 — Action and Functional Reference

Readiness: **Ready with targeted gaps** (`GAP-04` audit-event codes).
One chapter per action, each using the 24-section function-chapter standard.

| Group | Actions |
|---|---|
| 3.1 Navigation and view | ACT-01…ACT-11 |
| 3.2 Seeding | ACT-12, ACT-13 |
| 3.3 Scenario editing | ACT-14, ACT-15 |
| 3.4 Governed change sets | ACT-16…ACT-21 |
| 3.5 Model execution | ACT-22, ACT-23, ACT-24 |
| 3.6 Comparison | ACT-25…ACT-28 |
| 3.7 Sensitivity | ACT-29…ACT-32 |
| 3.8 Release | ACT-33…ACT-39 |
| 3.9 Confirmation and cancel | ACT-40…ACT-45 |
| 3.10 Actions not present | recorded non-features |

---

## Volume 4 — Financial Model and Output Interpretation

Readiness: **Ready with targeted gaps** (`GAP-06`, `GAP-07`, `GAP-08`).

1. How the engine works (inputs → hash → run → results)
2. Assumptions and effective values
3. Volume and demand metrics
4. Revenue metrics and the ten mandatory Revenue questions
5. P&L metrics
6. Cash, working capital, break-even, payback and sustainability
7. Scenario interpretation
8. Comparison interpretation
9. Sensitivity interpretation (elasticity, tornado)
10. Readiness, certification, activation and release evidence
11. Metric-by-metric catalogue (eighteen-column entries)
12. Golden baseline and parity evidence

---

## Volume 5 — Training and In-App Explanation Sourcebook

Readiness: **Ready with targeted gaps** (depends on Volumes 2–4 marker extraction).

1. Page introductions (`IN_APP_PAGE_INTRO`)
2. "Where am I?" blocks (`IN_APP_CONTEXT`)
3. Tooltips (`IN_APP_TOOLTIP`)
4. Warnings — stale, immutable, irreversible, permission (`IN_APP_WARNING`)
5. Next-step prompts (`IN_APP_NEXT_STEP`)
6. Guided tours (first-run, analyst path, release path)
7. Common workflows
8. Common mistakes
9. Role-based learning paths (ten audiences)
10. Output interpretation prompts
11. Help-centre source material

---

## Volume 6 — Technical Appendix

Readiness: **Ready with targeted gaps** (`GAP-04`, `GAP-10`).

1. Route map
2. Component map
3. Hook and service map
4. RPC and Edge Function map
5. Table map and relationships
6. Permission matrix
7. Audit-event catalogue
8. State-transition diagrams
9. Source traceability (workbook cell → formula → metric → screen)

---

## Consolidated master artifact (after all volumes)

Recommended path: `docs/commercial/reference/cdt-reference-manual-master.md`.

Contents: master table of contents · cross-volume index · screen index · action index
· metric index · glossary · lifecycle index · permission index · error and recovery
index · in-app content index · source traceability index · known-gap register.

---

## Recommended authoring order

1. Volume 1 (Foundations) — no dependencies.
2. Volume 2 chapters in navigation order, starting with SCR-00 and SCR-01.
3. Volume 3, authored immediately after each Volume 2 chapter that introduces the
   action, then consolidated.
4. Volume 4 after the Revenue, P&L and Cash chapters exist.
5. Volume 5 by extracting markers from Volumes 1–4.
6. Volume 6 last, as the mechanical appendix.
7. Consolidated master artifact.

Gap dependencies: resolve `GAP-01` before Volume 2 chapter 2.3; `GAP-04` before
Volume 3 §3.4–3.8 audit sections; `GAP-06`/`GAP-07`/`GAP-08` before the corresponding
Volume 4 sections.
