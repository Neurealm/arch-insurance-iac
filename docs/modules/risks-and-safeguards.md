# Risks and Safeguards

| Risk | Impact | Safeguard |
|---|---|---|
| Manifest drift — declarations stop matching the code | Registry becomes misleading; Module Capability Intelligence reports fiction | `registry.test.ts` asserts every declared source path, page and component exists on disk; the suite runs with the rest of the project tests |
| Over-claiming maturity — a mock page declared as a real capability | Wrong roadmap and commercial decisions | `implementationStatus` enum plus the `unregistered-implementation` rule: `implemented` requires a service, API or entity reference |
| Silent absence of evidence treated as validity | False confidence | Omitted known-reference lists produce `unable-to-verify` findings, never passes |
| Scope creep into file moves during registration | Regressions across ~35 live routes | Stages 1–3 are additive; `src/App.tsx`, the sidebar and all pages are untouched |
| Two modules claiming the same route or table | Ambiguous ownership | `invalid-route-ownership`, `duplicate-database-ownership`, `duplicate-workflow-ownership` are blocking `ownership-conflict` findings |
| Bundle bloat from a runtime registry | Slower app load | The registry imports only data modules; no page or component is pulled in, and the glob is statically resolved |
| Manifests becoming a second source of truth developers forget | Registry rots | Discovery is convention-based — creating the file is the only registration step; there is no central list to update |
| Owner fields left `unassigned` indefinitely | Conflicts never resolved | `missing-owner` warning surfaces on every report until owners are set |
| A shared asset silently absorbed by one module | Hidden coupling | `shared` assets must name a `primaryOwner` and list `consumingModules`, or a conflict is raised |
