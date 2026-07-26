# CDT Reference Manual — Authoring Standard

Status: Foundation established (CDT-REFERENCE-FOUNDATION, 2026-07-26).
Scope: governs every volume of the Commercial Digital Twin (CDT) Reference Manual.
This document is a controlled authoring standard. It is not a manual volume.

---

## 1. Purpose

Establish one controlled way to write, evidence, and structure every chapter of the
CDT Reference Manual so that the resulting library can serve training, in-app help,
tooltips, guided tours, operational support, audit review, and future AI-assisted
explanation without rediscovery of the underlying system.

---

## 2. Authoritative source hierarchy

When determining current behaviour, use sources in this order:

| Rank | Source | Role |
|---|---|---|
| 1 | Current deployed application behaviour | Current-state authority |
| 2 | Current application source and route registration (`src/App.tsx`, `src/commercial/**`) | Structural authority |
| 3 | Current database functions, tables, permissions, RLS, lifecycle guards | Behavioural authority |
| 4 | Current persisted runtime evidence (runs, results, certifications, activations, audit events) | Evidential authority |
| 5 | Final validated BP3 closeout documents | Governance authority |
| 6 | Package architecture documents (`docs/commercial/bp3-*.md`) | Design intent |
| 7 | Package test-evidence documents | Verification history |
| 8 | `.lovable/plan.md` | Programme status |
| 9 | Historical build and patch records | Context only |

Conflict rules:

1. Record the disagreement explicitly in the gap register.
2. Treat current deployed behaviour as the current-state authority.
3. Preserve historical intent as context, never as current fact.
4. Never silently reconcile a discrepancy.
5. Never invent missing functionality to close a narrative gap.

---

## 3. Three-layer technical depth standard

Every substantive explanation must be written in three layers, in this order.

- **Layer 1 — Business.** Plain language. No SQL, no React, no schema names. Answers
  "what does this mean for my decision?"
- **Layer 2 — Functional system.** What the system does, in product terms: which
  objects are read, which are written, what state changes, what becomes immutable.
- **Layer 3 — Technical reference.** Component, hook, RPC, Edge Function, table,
  column, permission code, audit event, RLS constraint.

A reader must be able to stop after Layer 1 and still be correct.

---

## 4. Evidence and confidence standard

Every factual entry carries exactly one confidence classification:

| Code | Meaning |
|---|---|
| `C1` | Confirmed in deployed UI |
| `C2` | Confirmed in application source |
| `C3` | Confirmed in database or function definition |
| `C4` | Confirmed in persisted runtime evidence |
| `C5` | Confirmed in validated documentation |
| `C6` | Inferred from multiple authoritative sources |
| `C7` | Historical only — not current-state evidence |
| `C8` | Unresolved |

Rules:

1. `C6`, `C7`, and `C8` entries must be visibly marked in the rendered text.
2. Never present `C6`/`C8` content as confirmed.
3. Formulas may only be stated at `C3`, `C4`, or `C5`. Never infer a formula.
4. Deferred functionality is never described as implemented.

---

## 5. Screen-chapter authoring standard

Every screen chapter in Volume 2 must use these 28 sections in this exact order.
Sections that do not apply are retained with the text `Not applicable` plus one line
of justification — they are never deleted.

1. Screen identity
2. Route and navigation
3. Purpose
4. Business question answered
5. Where am I?
6. Required context
7. Required permissions
8. Screen anatomy
9. Section-by-section reference
10. Element-by-element reference
11. Action-by-action reference
12. Status and lifecycle behaviour
13. Financial interpretation
14. Data and calculation lineage
15. What changes
16. What does not change
17. Audit and governance
18. Error, empty, stale, and loading states
19. Common workflows
20. Common mistakes
21. Related screens
22. Typical next step
23. In-app explanation candidates
24. Tooltip candidates
25. Guided-tour candidates
26. Role-specific interpretation
27. Technical implementation reference
28. Known limitations and deferred items

---

## 6. Function-chapter authoring standard

Every action or function chapter in Volume 3 must use these 24 sections in order:

1. Function name
2. User-facing label
3. Purpose
4. Screen or screens
5. Actor or permission
6. Preconditions
7. Inputs
8. User steps
9. Internal processing
10. Validation rules
11. Data read
12. Data written
13. State transition
14. Output
15. Financial effect
16. Historical-evidence effect
17. Audit event
18. Error modes
19. Recovery
20. Reversibility
21. Security controls
22. Related functions
23. User explanation
24. Technical reference

---

## 7. "Where am I?" standard block

Every screen chapter includes this block, omitting only lines that cannot apply.

```
Commercial Digital Twin
Tenant:            NeuGAIN Commercial
Program:           Project Momentous
Model Version:     PM-FIN-2026.1
Model Status:      Active
Scenario:          Base
Functional Stage:  Revenue
Current Context:   Viewing authoritative completed Revenue outputs
Run Status:        Completed / Current
Evidence Status:   Persisted, part of release evidence
Mutability:        Read-only because the model version is Active
Typical Next Step: Review P&L or compare scenarios
```

Field definitions: Tenant, Program, Model Version, Model-Version Status, Scenario,
Functional Stage, Run Status, Evidence Status, Mutability Status, Typical Next Step.

---

## 8. Financial-metric explanation standard

Every metric described anywhere in the library must supply all sixteen attributes:

1. Metric name · 2. Plain-language meaning · 3. Formula or derivation ·
4. Source inputs · 5. Scenario sensitivity · 6. Time basis · 7. Currency basis ·
8. Unit basis · 9. Positive versus negative interpretation · 10. Relationship to
other metrics · 11. Decision supported · 12. Warning conditions · 13. Common
misinterpretation · 14. Input / intermediate / final classification ·
15. Persisted or derived · 16. Release-evidence status.

---

## 9. Role-based interpretation standard

Each major screen chapter carries one concise role-interpretation section — never a
duplicated chapter per role — covering: Executive, CFO, FP&A analyst, Commercial
leader, Program owner, Model owner, Platform administrator, Auditor.

Each role entry is at most three sentences: what they look at, what conclusion it
supports, what they must not conclude.

---

## 10. In-app content extraction markers

Content destined for the product is tagged inline with explicit markers so Volume 5
and future in-app tooling can extract it mechanically.

| Marker | Destination |
|---|---|
| `IN_APP_PAGE_INTRO` | Page introduction copy |
| `IN_APP_CONTEXT` | "Where am I?" panel |
| `IN_APP_TOOLTIP` | Field or button tooltip |
| `IN_APP_WARNING` | Stale, immutable, permission, or destructive-action warning |
| `IN_APP_NEXT_STEP` | Suggested next action |
| `TRAINING_NOTE` | Training-only explanation, not shipped in product |

Additional destinations that reuse the markers above: section explanation,
confirmation-dialog copy, empty-state guidance, error guidance, guided-tour step,
financial interpretation panel, executive summary, help-centre article.

Marker rules: one marker per block; markers wrap self-contained prose that can ship
without surrounding context; marked copy must be plain-language Layer 1 only.

---

## 11. Terminology control

1. Use the exact visible UI label when naming a control, in quotes.
2. Use the canonical taxonomy term (`cdt-product-taxonomy.md`) for every concept.
3. Never introduce a synonym for a taxonomy term.
4. Where the UI label and the canonical term differ, state both once and then use
   the canonical term.

---

## 12. Gap-handling rules

When a screen, action, metric, or explanation cannot be fully resolved:

1. Record the gap in `cdt-reference-gap-register.md` with a `GAP-nn` identifier.
2. Identify the missing source.
3. State what is confirmed.
4. State what remains unknown.
5. Never invent behaviour.
6. Assign a follow-up research item.
7. Mark whether the gap blocks later authorship, and which chapter it blocks.

---

## 13. Prohibited authoring actions

Manual authorship must never modify application code, database code, migrations,
runtime data, permissions or RLS; must never run models, create comparisons, execute
sensitivity, create certifications, activate models, or create successor versions;
must never rewrite BP3 historical evidence; and must never treat deferred
functionality as implemented.
