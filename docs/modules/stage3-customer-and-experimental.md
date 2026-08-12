# Stage 3 — Customer-Specific, Demonstration and Experimental Implementation

Five items classify as customer-specific, 26 as demonstration-or-prototype and two as
experimental. They are recorded separately because Module Capability Intelligence must never
answer "yes, the product does that" on the strength of a demo screen or a named-customer asset.

## Customer-specific (5 items)

Content built around a named customer or engagement. Treat as engagement assets, not product.

Handling rules:

- Never register as a product capability.
- Never present as evidence that a capability exists for another customer.
- If the pattern is valuable, generalise it first, then register the generalised version.

## Demonstration and prototype (26 items)

Includes the interactive demo centre, demo scenario controllers and showcase surfaces.

Handling rules:

- These may be registered as capabilities of a *demo* boundary, never of a product module.
- Any capability whose only evidence is a demo screen must be classified
  `product-representation` in the capability hierarchy.

## Experimental (2 items)

Version-suffixed or explicitly experimental work. The clearest example is the pair of live
modernization roadmap implementations (`ModernizationRoadmap.tsx` and
`ModernizationRoadmapV2.tsx`), both routed and both in navigation.

Handling rules:

- Experimental implementation must not appear in a released module manifest.
- Where two versions are live, product must pick one before Stage 4 registration.

## Duplicates (12 items)

Duplicates are recorded rather than silently collapsed. Two patterns dominate:

- One component exposed under two routes (for example the friction index).
- Two implementations of the same surface (the roadmap pair above).

Each duplicate is a Stage 4 decision: keep one, redirect the other.
