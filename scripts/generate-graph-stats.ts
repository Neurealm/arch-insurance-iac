/**
 * Stage 3.5.2 — emit machine-readable capability graph statistics.
 *
 * Usage: bunx vite-node scripts/generate-graph-stats.ts
 * Writes docs/modules/graph-statistics.json. Read-only with respect to the app.
 */
import { writeFileSync } from "node:fs";
import { populateCapabilityGraph } from "../src/modules/graph/populate";
import { graphStatistics, graphStatisticsJson } from "../src/modules/graph/statistics";

const populated = populateCapabilityGraph({ generatedAt: "1970-01-01T00:00:00.000Z" });
const stats = graphStatistics(populated.graph, populated.candidateEdges);
writeFileSync("docs/modules/graph-statistics.json", `${graphStatisticsJson(stats)}\n`);
console.log(graphStatisticsJson(stats));
