# Stage 3.5.2 — SRE Capability Graph Slice

Produced by `buildSreGraphSlice()` in `src/modules/graph/sreSlice.ts`. SRE is the
only fully registered module, so its slice is the reference implementation for
every module Stage 4 will register.

## Slice size

| Metric | Value |
| --- | --- |
| Subgraph nodes | 126 |
| Subgraph edges | 367 |

## Nodes by type

| Type | Count |
| --- | --- |
| page | 38 |
| route | 35 |
| capability | 16 |
| sub-capability | 16 |
| service | 7 |
| component | 1 |
| module | 1 |

## Consumed shared capabilities

- `shared.evidence-graph`
- `shared.guided-investigation`
- `shared.operations-console-shell`
- `shared.persona-context`
- `shared.scenario-state`

## Consumed platform capabilities

- `platform.application-shell-and-navigation`
- `platform.authentication`
- `platform.common-data-access`
- `platform.design-system`
- `platform.notifications`
- `platform.rbac`
- `platform.tenant-isolation`

## Evidence strength of SRE implementation

| Strength | Nodes |
| --- | --- |
| client-side-functional | 37 |

No SRE node is database-backed. The module is a fully interactive but
client-side product representation, and the graph says so plainly.

## Implementation character

| Character | Nodes |
| --- | --- |
| interactive-prototype | 13 |
| product-representation | 11 |

`promotedMockNodes` is empty: no mock, static or prototype node has been
represented as operational implementation anywhere in the slice.

## Platform chrome exclusions

The following files are used by SRE pages but are explicitly **not** counted as
SRE-owned capability evidence:

- `src/components/eoc/AppShell.tsx`
- `src/lib/utils.ts`

Shared shell and utility code belongs to platform capabilities. Counting it as
module evidence would overstate every module that renders inside the shell.

## What this slice proves

1. A registered module produces a dense, navigable subgraph (2.9 edges per node
   versus 1.38 across the whole graph).
2. Capability decomposition (16 capabilities, 16 sub-capabilities) survives the
   projection intact.
3. Shared and platform consumption is explicit rather than implied.
4. Evidence strength and implementation character are preserved end to end, so
   intelligence answers can distinguish a prototype from a production capability.
