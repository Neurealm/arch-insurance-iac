import { it } from "vitest";
import { getReasoningEngine } from "@/modules/graph/reasoning/index";
it("report", () => {
  const e = getReasoningEngine();
  const crit = e.criticalNodes({ limit: 10 });
  const spof = e.singlePointsOfFailure({ limit: 10 });
  const bott = e.bottlenecks({ limit: 10 });
  const cyc = e.circularDependencies();
  const cov = e.coverageGaps();
  const own = e.ownershipPropagation();
  const rt = e.routeTraceability();
  const out = {
    hash: e.graphMetadata.contentHash,
    nodes: e.graphMetadata.nodeCount,
    edges: e.graphMetadata.edgeCount,
    critTop: crit.results.map(r => [r.node.id, r.score, r.dependentCount, r.distinctDependentModules]),
    spofCount: spof.resultCount, spofTop: spof.results.slice(0,5).map(r=>[r.node.id,r.strandedCount]),
    bottCount: bott.resultCount, bottTop: bott.results.slice(0,5).map(r=>[r.node.id,r.fanIn,r.fanOut]),
    cycles: cyc.resultCount, cycleTop: cyc.results.slice(0,5).map(r=>[r.id.slice(0,80),r.size]),
    coverage: cov.results.reduce((a,g)=>{a[g.kind]=(a[g.kind]||0)+1;return a;},{} as Record<string,number>),
    coverageUnexpected: cov.results.filter(g=>!g.expected).length,
    ownership: own.results.reduce((a,r)=>{a[r.resolution]=(a[r.resolution]||0)+1;return a;},{} as Record<string,number>),
    routes: rt.resultCount, routesComplete: rt.results.filter(r=>r.complete).length,
    recs: [...crit.recommendations,...spof.recommendations,...cyc.recommendations,...cov.recommendations,...own.recommendations,...rt.recommendations].length,
  };
  console.log(JSON.stringify(out, null, 1));
});
