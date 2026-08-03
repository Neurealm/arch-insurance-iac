# Stage 3 — Module Capability Intelligence Readiness

What the registry can and cannot support once Module Capability Intelligence is built on top of
it.

## Questions the registry can answer today

| Question | Answerable | Source |
| --- | --- | --- |
| Which modules exist and what do they own? | Yes, for SRE only | `getModules()` |
| Which route belongs to which module? | Yes, for 77 of 436 routes | `reconcileRoutes()` |
| What is shared, and by whom? | Yes | shared capability registry |
| What is platform-owned? | Yes | platform capability registry |
| Is a capability real or a representation? | Yes, for SRE | capability hierarchy |
| Does a capability touch a database? | Yes | domain signals + evidence strength |
| Which implementation is unowned? | Yes | classification report |
| Which boundaries are contested? | Yes | boundary conflicts report |

## Questions it cannot answer yet

| Question | Blocker |
| --- | --- |
| What does the *product* do, end to end? | 12 of 13 modules are unregistered |
| Which capability serves a given customer need? | No customer-need taxonomy exists |
| Which capabilities are production-grade? | Only SRE has an implementation classification |
| What breaks if a shared capability changes? | Five shared capabilities have no owner |
| Which agents and workflows actually run? | Agent and workflow references are catalogue content, not runtime |
| Which routes exist at runtime? | Two route families are generated dynamically |

## Answer-quality rules Capability Intelligence must honour

1. **Never answer from a route name.** A route proves reachability, not capability.
2. **Never count a platform capability as a module capability.** Eight platform capabilities are
   flagged `frequentlyMiscounted` for exactly this reason.
3. **Always qualify by implementation classification.** `product-representation` means a screen
   describes a capability; it does not mean the capability operates.
4. **Always qualify by evidence strength.** `static-data` is not `database-backed`.
5. **Never present customer-specific or demonstration implementation as product capability.**
6. **Report unknowns as unknown.** 367 items are `unable-to-determine`; the correct answer for
   those is "not established", not silence and not a guess.
7. **Never infer that a capability exists because a sibling module has it.**

## Required Stage 4 inputs

- Manifests for the remaining candidate modules.
- Owners assigned to the five unowned shared capabilities.
- Capability hierarchies for at least the data-backed modules.
- A resolution for each of the ten boundary conflicts.
