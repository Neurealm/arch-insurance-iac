# CDT Product Taxonomy

Status: Foundation (CDT-REFERENCE-FOUNDATION, 2026-07-26).
Canonical terminology for every CDT Reference Manual volume. Terms defined here must
not be paraphrased or given synonyms elsewhere in the library.

Each entry supplies: plain-language definition, technical definition, business
significance, related screens, related actions, common misconception, lifecycle
implications.

---

## 1. Canonical hierarchy

```
Tenant
└── Program
    └── Model Version
        └── Scenario
            └── Effective Assumptions
                └── Revenue / P&L / Cash Runs
                    └── Results
                        ├── Comparison Evidence
                        └── Sensitivity Evidence
                            └── Release Certification
                                └── Activation
```

Where the two lateral concepts fit:

- **Portfolio** hangs off the Program as the commercial account population that the
  program addresses. It is a demand-side context object; it does not feed the run
  engine in the current implementation.
- **Sources** hang off the Program as provenance metadata for where assumptions came
  from. They are evidence of origin, not calculation inputs.

Operating levels used throughout the manual: Tenant level, Program level,
Model-version level, Scenario level, Run level, Analytical-evidence level,
Release level.

---

## 2. Term entries

### Structure and governance

**1. Tenant** — Plain: the customer workspace that owns all commercial data.
Technical: `tenants` row; every commercial table is tenant-scoped and RLS-filtered.
Significance: the isolation boundary for confidentiality and audit.
Screens: all. Actions: workspace selector in the header.
Misconception: "a tenant is a company in the portfolio" — it is not; the portfolio
holds counterparty accounts.
Lifecycle: no active tenant means no commercial data is visible at all.

**2. Program** — Plain: the commercial initiative being modelled (Project Momentous).
Technical: `commercial_programs` row. Significance: the unit of executive reporting.
Screens: Overview, Program, Portfolio, Sources, all Model screens.
Misconception: a program is not a model version; one program carries many versions.
Lifecycle: programs progress through stage gates.

**3. Portfolio** — Plain: the commercial accounts the program targets.
Technical: `commercial_accounts` rows. Significance: shows whether account-level
substantiation exists behind program-level assumptions.
Screens: Portfolio. Misconception: portfolio figures do not drive revenue results in
the current implementation. Lifecycle: none.

**4. Model** — Plain: the financial engine that turns assumptions into Revenue, P&L
and Cash outputs. Technical: formula catalogue implemented in
`commercial-run-scenario`. Significance: the calculation contract.
Misconception: the model is not the spreadsheet; the workbook is a source.

**5. Model Version** — Plain: a named, frozen edition of the model.
Technical: `commercial_model_versions` row with `version_code`, `status`,
`formula_catalog_*`. Screens: Release, Release Detail, all Model screens (context).
Lifecycle: Draft → Active; superseded by a successor.

**6. Draft Model Version** — Plain: a version still being built and run.
Technical: `status = 'draft'`. Significance: the only status in which certification
and activation may be initiated. Lifecycle: mutable inputs, runnable.

**7. Active Model Version** — Plain: the single authoritative version in force.
Technical: `status = 'active'`, enforced single-active by partial unique index.
Significance: what executives and auditors are entitled to rely on.
Misconception: "Active means locked forever" — a successor may supersede it.
Lifecycle: read-only for governed inputs.

**8. Successor Model Version** — Plain: the next draft created from the active one.
Technical: created by `commercial_model_version_create_successor`.
Screens: Release Detail → Successor version card.
Lifecycle: starts at Draft; does not disturb the active version until activated.

### Scenarios and assumptions

**9. Scenario** — Plain: a coherent set of assumptions describing one plausible
future. Technical: `commercial_scenarios` row with a code (CONS, BASE, UPSIDE).
Misconception: scenarios are not separate models; they share the same formulas.
Lifecycle: results become stale when governed assumptions are applied.

**10. Base Scenario** — Plain: the central planning case.
Misconception: Base is not a committed forecast; it is the central assumption set.

**11. Conservative Scenario** — Plain: a deliberately cautious assumption set.
Misconception: Conservative is not a worst case; it is not a stress test.

**12. Upside Scenario** — Plain: a favourable assumption set.
Misconception: Upside is not a target or a quota.

**13. Assumption** — Plain: a single named input value.
Technical: `commercial_scenario_assumptions` row (code, scenario, value, unit).
Screens: Scenarios, Assumptions.

**14. Effective Assumption** — Plain: the value the engine will actually use for a
scenario right now. Technical: the current persisted assumption value after all
applied change sets. Screens: Assumptions ("Browse effective assumptions").

**15. Assumption Override** — Plain: a proposed replacement value staged inside a
change set, not yet in force. Technical:
`commercial_assumption_change_set_items.proposed_value`.

**16. Change Set** — Plain: a reviewable bundle of proposed assumption changes.
Technical: `commercial_assumption_change_sets` row.
Lifecycle: Draft → Validated → Applied, or Cancelled.

**17. Change-Set Item** — Plain: one proposed assumption change inside a bundle,
with rationale. Technical: `commercial_assumption_change_set_items` row.

**18. Applied Change Set** — Plain: a change set whose values are now effective.
Technical: `status = 'applied'`, recorded in `commercial_assumption_apply_log`.
Lifecycle: irreversible; makes downstream runs stale.

**19. Cancelled Change Set** — Plain: an abandoned change set. Technical:
`status = 'cancelled'`. Lifecycle: terminal; no financial effect.

### Sources

**20. Source** — Plain: a documented origin for assumptions.
Technical: `commercial_source_references` row (`SRC-001`…). Screens: Sources.
Note: metadata only — raw content, transcripts and credentials are never stored.

**21. Source Mapping** — Plain: the link between a source and the assumptions or
formulas it substantiates. Technical: `bp3-source-cell-map.md` plus
`commercial_release_lineage` rows at release time.

### Runs and results

**22. Model Run** — Plain: one execution of the engine for a scenario and scope.
Technical: `commercial_model_runs` row with `input_hash` and runtime fingerprint.

**23. Authoritative Run** — Plain: the run whose numbers you should quote.
Technical: latest completed run for a (version, scenario, scope) not superseded.

**24. Historical Run** — Plain: an older completed run retained for audit.

**25. Superseded Run** — Plain: a run replaced by a corrected one.
Technical: referenced via `supersedes_run_id`. Lifecycle: never deleted.

**26. Revenue Scope** — Plain: the volume and revenue portion of the engine.

**27. P&L Scope** — Plain: cost, staffing, OPEX, gross profit and EBITDA.

**28. Cash Scope** — Plain: cash flow, working capital, break-even, payback and
sustainability.

**29. Result** — Plain: one calculated number for a metric and period.
Technical: `commercial_model_results` row (metric code, period, value).

**30. Runtime Fingerprint** — Plain: a stamp of which engine build produced a run.
Significance: forces recomputation when the engine is corrected (e.g. `cash → bp3.4.1`).

**31. Input Hash** — Plain: a fingerprint of the exact inputs used.
Significance: identical inputs plus identical fingerprint deduplicate to the same run
(idempotency).

### Analytical evidence

**32. Scenario Comparison** — Plain: a side-by-side variance analysis between
scenarios. Technical: `commercial_scenario_comparisons` + `_results`.

**33. Saved Comparison** — Plain: a comparison frozen as immutable evidence.
Lifecycle: Draft → Saved; snapshot rows persist only on Save.

**34. Archived Comparison** — Plain: a saved comparison retired from active use.
Lifecycle: terminal; content remains immutable.

**35. Sensitivity Experiment** — Plain: a test of how much one assumption moves the
outputs. Technical: `commercial_sensitivity_experiments` row.

**36. Perturbation** — Plain: one tested value of the chosen assumption.

**37. Elasticity** — Plain: how much output changes per unit of input change.

**38. Tornado Ranking** — Plain: outputs ordered by absolute percentage impact, the
biggest movers first.

### Release and governance

**39. Release Readiness** — Plain: an automated check that the model is fit to
certify. Technical: `commercial_release_readiness` returns per-control rows.

**40. Certification** — Plain: freezing a readiness snapshot and release manifest
with deterministic hashes. Lifecycle: Draft → Certified, or Invalidated.

**41. Invalidated Certification** — Plain: a certification withdrawn with a reason.
Lifecycle: terminal; retained for audit.

**42. Certified Release** — Plain: a certification in `certified` status that permits
activation.

**43. Activation** — Plain: making a model version the single Active version.
Technical: `commercial_model_activations` row; transactional status transition.

**44. Release Manifest** — Plain: the deterministic list of everything included in
the release. Technical: server-built, hashed.

**45. Release Lineage** — Plain: the traceable map of inputs and evidence behind the
release. Technical: `commercial_release_lineage` rows (relationship, upstream,
downstream, scope, source hash).

**46. Audit Event** — Plain: an immutable record of who did what and when.

**47. Immutable Evidence** — Plain: data that can never be edited after creation.
Technical: enforced by database triggers and guards.

### Status concepts

**48. Stale Run** — Plain: results computed before the assumptions changed.
IN_APP_WARNING candidate.

**49. Current Run** — Plain: results computed after the most recent applied change.

**50. Blocking Control** — Plain: a readiness failure that prevents certification.

**51. Warning** — Plain: a readiness concern that is recorded but does not block.

**52. Deferred Item** — Plain: known, accepted, non-blocking work not yet done.
Technical: `docs/commercial/bp3-deferred-items.md` (DEF-01…DEF-09, BP3.7.4).
Rule: never described as implemented.
