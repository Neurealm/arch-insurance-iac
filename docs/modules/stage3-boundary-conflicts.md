# Stage 3 — Boundary Conflicts and Overlaps

Conflicts recorded, not resolved. Each requires a product or architecture decision before the
affected candidate can be registered in Stage 4.

## 1. Operations Console Shell has no owner

`src/components/eoc/` is consumed by SRE, coworkers, practice-library and carve-out surfaces and
hosts navigation for several modules. No module claims it.

Decision needed: assign a primary owner, or promote it to a platform capability alongside
Application Shell and Navigation.

## 2. Scenario state implemented twice

`src/context/ScenarioStateContext.tsx` (shared, wraps `/enterprise-cloud-twin`) and
`src/runops/scenario/ScenarioStore.tsx` (RunOps-local) implement the same concept.

Decision needed: converge on one, or state explicitly that they model different things.

## 3. SRE automation catalogue vs Digital Coworkers

`sre.automation` catalogues automations and an AI coworker control room. The `coworkers`
candidate catalogues coworkers across the same domains. The two overlap in content and in intent.

Decision needed: one owner for the coworker catalogue.

## 4. Data Orchestration Twin sits under SRE navigation but outside the SRE module

31 routes under `/data-orchestration-twin`, reached from the SRE navigation group, implemented as
an independent tree.

Decision needed: fold into SRE, or register as a sibling module.

## 5. Agentic AI Studio inside the Digital Coworkers navigation group

The studio is a design-time surface; coworkers is a catalogue. They share a navigation parent and
nothing else.

Decision needed: separate module, or a capability of `coworkers`.

## 6. Commercial Guide lives outside the Commercial module

`src/features/commercial-guide/` is a reusable engine named after one consumer.

Decision needed: rename and generalise, or move under `src/commercial/` and drop the shared
claim.

## 7. CAE is both a platform-located folder and a product-shaped capability

Registered as a shared capability owned by `cae`, but physically under `src/platform/cae/` and
proposed as a candidate module.

Decision needed: is CAE a product module or a shared platform service?

## 8. CRM overlaps platform tenant administration

CRM's promote-to-tenant path writes tenant data owned by the platform Tenant Isolation
capability.

Decision needed: CRM calls a platform service, rather than writing tenant tables directly.

## 9. ETDM under `/admin`

Eight routes under `/admin/technology-taxonomy` read as platform administration but are a product
domain model with their own audit table.

Decision needed: namespace the routes under the module, and move audit onto the platform stream.

## 10. Two live modernization roadmaps

`ModernizationRoadmap.tsx` and `ModernizationRoadmapV2.tsx` are both routed and both in
navigation, under two identically labelled nav entries.

Decision needed: retire one.

## Route-level conflicts

`reconcileRoutes()` reports **0** ownership conflicts. No two registered owners claim the same
route. Every conflict above is a *boundary* conflict, not a route collision — which is why route
reconciliation alone was never going to surface them.
