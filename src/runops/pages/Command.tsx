import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Activity, AlertOctagon, Bot, CheckCircle2, Database, GitBranch, Sparkles,
  Target, Workflow, ShieldCheck, XCircle,
} from "lucide-react";
import { useAi, useOperations } from "@/runops/state/RunOpsProviders";

function healthDot(h: string): string {
  switch (h) {
    case "Healthy":           return "bg-emerald-500";
    case "At Risk":           return "bg-amber-500";
    case "Degraded":          return "bg-orange-500";
    case "Severely Degraded": return "bg-red-600";
    case "Unavailable":       return "bg-red-700";
    case "Recovering":        return "bg-sky-500";
    default:                  return "bg-slate-400";
  }
}

function Kpi({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "ok" | "warn" | "bad" | "neutral" }) {
  const t = tone ?? "neutral";
  const color =
    t === "ok"   ? "text-emerald-700" :
    t === "warn" ? "text-amber-700"  :
    t === "bad"  ? "text-red-700"    :
                   "text-slate-900";
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="text-[11px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className={cn("mt-1 text-[22px] font-semibold tabular-nums leading-none", color)}>{value}</div>
      {sub && <div className="mt-1 text-[11.5px] text-slate-500">{sub}</div>}
    </div>
  );
}

export default function Command() {
  const { services, components, digitalWorkers, incident, change, runbook, execution, approval, stages, stageIndex, approveExecution, denyExecution, resolveIncident } = useOperations();
  const { primaryRecommendation, alternatives } = useAi();
  const svc = services[0];

  return (
    <div className="mx-auto max-w-[1600px] p-5">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-slate-500">Command Center</div>
          <h1 className="mt-0.5 text-[22px] font-semibold text-slate-900">Global Order Processing</h1>
          <p className="mt-1 max-w-3xl text-[12.5px] text-slate-600">
            Live reliability posture for the {svc.tier} business service. SRE-first view of health, SLOs, error budget,
            active incident, digital worker activity, and the recommended remediation path.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild><Link to="/runops/incidents">Open Incident</Link></Button>
          <Button variant="outline" size="sm" asChild><Link to="/runops/runbooks">Launch Runbook</Link></Button>
          <Button size="sm" className="bg-slate-900 hover:bg-slate-800"><Sparkles className="mr-1 h-3.5 w-3.5" /> Ask NOVA</Button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
        <Kpi label="Service Health" value={svc.health} tone="bad" />
        <Kpi label="SLO Availability" value={`${svc.sloAvailability}%`} sub="Rolling 30d target" tone="neutral" />
        <Kpi label="Error Budget" value={`${svc.errorBudgetRemaining}%`} sub="Remaining this window" tone="warn" />
        <Kpi label="p95 Latency" value="2.8 s" sub={`Target ≤ ${svc.sloLatencyMs} ms`} tone="bad" />
        <Kpi label="Tx Success" value="91.4%" sub="Baseline 99.7%" tone="bad" />
        <Kpi label="SQL Conn Util" value="98%" sub="Primary pool" tone="bad" />
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4">
        {/* Incident + AI recommendation */}
        <Card className="col-span-12 xl:col-span-8 border-slate-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2 text-[14px]">
                <AlertOctagon className="h-4 w-4 text-red-600" />
                Active Incident · {incident.id}
                <Badge className="bg-red-600 hover:bg-red-600 text-[10px]">{incident.severity}</Badge>
                <Badge variant="outline" className="text-[10px]">{incident.state}</Badge>
              </CardTitle>
              <div className="text-[11px] text-slate-500">Opened {incident.openedAt} · IC {incident.commander}</div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-[12.5px] text-slate-700 leading-relaxed">{incident.summary}</p>

            <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                <span className="text-[12px] font-semibold text-slate-800">AI Recommendation</span>
                <Badge variant="outline" className="text-[10px]">Confidence {primaryRecommendation.confidence}%</Badge>
                <Badge variant="outline" className="text-[10px]">Runbook {runbook.id} · {runbook.version}</Badge>
                <Badge variant="outline" className="text-[10px]">{runbook.autonomy}</Badge>
              </div>
              <div className="text-[13px] font-medium text-slate-900">{primaryRecommendation.title}</div>
              <p className="mt-1 text-[12px] text-slate-700 leading-relaxed">{primaryRecommendation.conclusion}</p>

              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <div className="mb-1 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" /> Supporting evidence
                  </div>
                  <ul className="list-disc pl-4 text-[11.5px] text-slate-700 space-y-1">
                    {primaryRecommendation.supportingEvidence.map((e) => <li key={e}>{e}</li>)}
                  </ul>
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-amber-700">
                    <XCircle className="h-3 w-3" /> Contradictory evidence
                  </div>
                  <ul className="list-disc pl-4 text-[11.5px] text-slate-700 space-y-1">
                    {primaryRecommendation.contradictoryEvidence.map((e) => <li key={e}>{e}</li>)}
                  </ul>
                  <div className="mt-2 text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-700">Uncertainty: </span>{primaryRecommendation.uncertainty}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {primaryRecommendation.sources.map((s) => (
                  <Badge key={s} variant="outline" className="text-[10px] bg-white">{s}</Badge>
                ))}
              </div>
            </div>

            {/* Approval card */}
            <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-amber-700" />
                  <span className="text-[12.5px] font-semibold text-slate-900">Approval · {approval.id}</span>
                  <Badge variant="outline" className="text-[10px]">{approval.state}</Badge>
                  <span className="text-[11px] text-slate-600">Execution {execution.id} · {execution.state}</span>
                </div>
                <div className="text-[11px] text-slate-600">Requested by {approval.requestedBy} @ {approval.requestedAt}</div>
              </div>
              <p className="mt-1 text-[12px] text-slate-700">{approval.reason}</p>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  className="h-7 bg-emerald-600 hover:bg-emerald-700 text-[11.5px]"
                  disabled={approval.state !== "Pending"}
                  onClick={() => approveExecution("sre.oncall")}
                >
                  Approve &amp; Execute
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[11.5px]"
                  disabled={approval.state !== "Pending"}
                  onClick={() => denyExecution("sre.oncall", "Requesting canary first")}
                >
                  Deny
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-[11.5px]" onClick={() => resolveIncident()}>
                  Mark Incident Resolved
                </Button>
              </div>
            </div>

            {/* Runbook steps */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Workflow className="h-3.5 w-3.5 text-slate-600" />
                <span className="text-[12px] font-semibold text-slate-800">Runbook {runbook.id} · {runbook.title}</span>
                <Badge variant="outline" className="text-[10px]">{runbook.state}</Badge>
                <span className="ml-auto text-[11px] text-slate-500">Fitness</span>
                <Progress value={runbook.fitnessScore} className="h-1.5 w-24" />
                <span className="text-[11px] tabular-nums text-slate-700">{runbook.fitnessScore}</span>
              </div>
              <ol className="space-y-1.5">
                {runbook.steps.map((s, i) => (
                  <li key={s.key} className="flex items-start gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-2">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-700">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[12px] font-medium text-slate-900">{s.label}</div>
                      <div className="text-[11px] text-slate-600 leading-snug">{s.description}</div>
                    </div>
                    <Badge variant="outline" className="text-[10px] capitalize">{s.kind}</Badge>
                  </li>
                ))}
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="col-span-12 xl:col-span-4 space-y-4">
          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-[14px]">
                <GitBranch className="h-4 w-4 text-slate-600" /> Recent Change
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-[13px] font-medium text-slate-900">{change.id}</div>
              <div className="text-[12px] text-slate-700">{change.title}</div>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-600">
                <Badge variant="outline" className="text-[10px]">Risk {change.risk}</Badge>
                <span>Deployed {change.deployedAt}</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-500">Linked to {change.linkedIncidentId}</div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-[14px]">
                <Database className="h-4 w-4 text-slate-600" /> Component Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5">
                {components.map((c) => (
                  <li key={c.id} className="flex items-center gap-2 text-[12px]">
                    <span className={cn("inline-block h-2 w-2 rounded-full", healthDot(c.health))} />
                    <span className="min-w-0 flex-1 truncate text-slate-800">{c.name}</span>
                    <span className="text-[10.5px] text-slate-500">{c.health}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-[14px]">
                <Bot className="h-4 w-4 text-slate-600" /> Digital Workers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5">
                {digitalWorkers.map((w) => (
                  <li key={w.id} className="flex items-center gap-2 text-[12px]">
                    <span className="w-24 shrink-0 truncate font-mono text-[10.5px] text-slate-600">{w.id}</span>
                    <span className="min-w-0 flex-1 truncate text-slate-800">{w.role}</span>
                    <Badge variant="outline" className="text-[10px]">{w.status}</Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-[14px]">
                <Activity className="h-4 w-4 text-slate-600" /> Scenario Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-1">
                {stages.map((s) => {
                  const done = s.index < stageIndex;
                  const active = s.index === stageIndex;
                  return (
                    <li key={s.index} className={cn(
                      "flex items-center gap-2 rounded px-1.5 py-1 text-[11.5px]",
                      active ? "bg-slate-900 text-white" : done ? "text-slate-500" : "text-slate-700",
                    )}>
                      <span className="w-5 shrink-0 text-right tabular-nums">{s.index}</span>
                      <span className="truncate">{s.label}</span>
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>

          {alternatives.length > 0 && (
            <Card className="border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-[14px]">
                  <Target className="h-4 w-4 text-slate-600" /> Alternative options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {alternatives.map((a) => (
                  <div key={a.id} className="rounded-md border border-slate-200 bg-white p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[12px] font-medium text-slate-900">{a.title}</div>
                      <Badge variant="outline" className="text-[10px]">Conf {a.confidence}%</Badge>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-600 leading-snug">{a.conclusion}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
