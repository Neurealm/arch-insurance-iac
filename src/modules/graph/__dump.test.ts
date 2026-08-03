import { describe, it } from "vitest";
import { populateCapabilityGraph } from "./populate";
describe("dump", () => { it("dumps", () => {
const { graph, candidateEdges } = populateCapabilityGraph();
const keys = new Map<string, number>();
for (const n of graph.nodes) for (const k of Object.keys(n.attributes)) keys.set(k, (keys.get(k)??0)+1);
console.log("NODES", graph.nodes.length, "EDGES", graph.edges.length, "CAND", candidateEdges.length, "HASH", graph.version.contentHash);
console.log("nodeAttrKeys", JSON.stringify([...keys.entries()].sort((a,b)=>b[1]-a[1])));
const ekeys = new Map<string, number>();
for (const e of graph.edges) for (const k of Object.keys(e.attributes)) ekeys.set(k, (ekeys.get(k)??0)+1);
console.log("edgeAttrKeys", JSON.stringify([...ekeys.entries()].sort((a,b)=>b[1]-a[1])));
const byType: Record<string,number> = {}; for (const n of graph.nodes) byType[n.type]=(byType[n.type]??0)+1;
console.log("nodesByType", JSON.stringify(byType));
const eByType: Record<string,number> = {}; for (const e of graph.edges) eByType[e.type]=(eByType[e.type]??0)+1;
console.log("edgesByType", JSON.stringify(eByType));
console.log("sampleNodes", JSON.stringify(graph.nodes.filter(n=>["capability","route","page","service","persona","integration","database-entity"].includes(n.type)).slice(0,6),null,1));
console.log("moduleIds", JSON.stringify([...new Set(graph.nodes.map(n=>n.moduleId))]));
}); });
