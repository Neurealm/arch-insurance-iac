import { it } from "vitest";
import { classifyUnregistered } from "@/modules/classification";
import { discoverCandidateModules } from "@/modules/candidates";
import { runGovernance } from "@/modules/governance";
import { reconcileRoutes } from "@/modules/routeOwnership";
import { DOMAIN_SIGNALS } from "@/modules/generated/domainSignals";

it("dump", () => {
  const c = classifyUnregistered();
  console.log("CLASSIFICATION", JSON.stringify(c.byClassification), "ownership", JSON.stringify(c.byOwnership), "review", c.humanReviewCount, "undet", c.unableToDetermineCount, "total", c.items.length);
  console.log("CANDIDATES", JSON.stringify(discoverCandidateModules().map(x=>[x.proposedModuleId,x.readiness,x.confidence,x.metrics]),null,0));
  const g = runGovernance();
  const byRule: Record<string,number> = {};
  for (const f of g.findings) byRule[f.ruleId]=(byRule[f.ruleId]??0)+1;
  console.log("GOV", g.errorCount, g.warningCount, g.infoCount, JSON.stringify(byRule));
  console.log("GOVERRORS", JSON.stringify(g.findings.filter(f=>f.severity==="error").slice(0,15).map(f=>[f.ruleId,f.subject,f.moduleId])));
  const r = reconcileRoutes();
  console.log("ROUTES", JSON.stringify(r.counts));
  console.log("SIGNALS", JSON.stringify(DOMAIN_SIGNALS.map(s=>[s.clusterId,s.fileCount,s.supabaseFileCount,s.databaseEntities.length,s.rpcFunctions.length,s.edgeFunctions.length,s.agentRefs.length,s.workflowRefs.length])));
});
