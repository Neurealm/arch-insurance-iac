// Prompt 0F — Foundation Status page + Prompt 0G item 14 gallery.
// Renders one example of each shared component category using canonical data
// pulled through the repository (never imported directly).

import React from "react";
import { useRepository } from "@/silicon/data/repository";
import { useSiliconStore } from "@/silicon/state/SiliconStore";
import { manifest } from "@/silicon/manifest";
import {
  KpiCard, KpiTrendCard, StatusBadge, SeverityBadge, ThresholdIndicator, EngineeringGauge,
  TraceabilityMatrix, DependencyGraph, LifecycleTimeline, RequirementCard, SpecificationSectionCard,
  ModuleHierarchyTree, InterfaceDiagram, RegisterMapTable, RegressionHeatmap, FailureClusterCard,
  CoverageProgressCard, CoverageSunburst, FormalPropertyTable, StaticFindingTable, WaveformPreview,
  LogEvidencePanel, CodeDiffViewer, ChangeImpactGraph, SignoffGateCard, MilestoneTimeline,
  ComputeQueueChart, AIReasoningPanel, ConfidenceIndicator, EvidenceCitationList, HumanApprovalPanel,
  AuditTimeline, ScenarioTimelineControl, ScreenContextPanel, FilterBar,
} from "@/silicon/components";
import { SCENARIOS } from "@/silicon/data/scenarios";
import { PERSONAS } from "@/silicon/data/personas";

export default function FoundationStatus() {
  const repo = useRepository();
  const scenario = useSiliconStore(s => s.selectedScenarioId);
  const setScenario = useSiliconStore(s => s.setScenario);
  const openDrawer = useSiliconStore(s => s.openDrawer);
  const persona = useSiliconStore(s => s.selectedPersonaId);
  const personaDesc = PERSONAS.find(p => p.id === persona)!;

  const req = repo.requirements[0];
  const spec = repo.specifications[1];
  const modules = repo.modules;
  const registers = repo.registers;
  const interfaces = repo.interfaces;
  const nightly = repo.regressions.find(r => r.name.startsWith("nightly"))!;
  const ai = repo.aiAnalyses[0];
  const change = repo.changes[0];

  return (
    <div className="space-y-6">
      {/* Manifest */}
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h1 className="text-lg font-semibold text-slate-900">Foundation Status</h1>
        <p className="mt-1 text-sm text-slate-600">
          Canonical data and shared component library for the silicon verification demo.
          Persona <b>{personaDesc.label}</b> — {personaDesc.contextualHint}
        </p>
        <ul className="mt-3 grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
          {manifest.map(m => (
            <li key={m.id} className="flex items-center gap-2 rounded border border-slate-200 px-2 py-1">
              <span className={`inline-block h-2 w-2 rounded-full ${m.done ? "bg-emerald-500" : "bg-slate-300"}`} />
              <span className="font-mono">{m.id}</span>
              <span className="text-slate-500">{m.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <ScreenContextPanel />

      <section>
        <SectionHeader>Scenario timeline</SectionHeader>
        <ScenarioTimelineControl
          scenarios={SCENARIOS.map(s => ({ id: s.id, label: s.label }))}
          activeId={scenario}
          onSelect={(id) => setScenario(id as any)}
        />
      </section>

      <section>
        <SectionHeader>Filters</SectionHeader>
        <FilterBar definitions={[
          { key: "severity", label: "Severity", options: ["low","medium","high","critical"].map(v => ({ value: v, label: v })) },
          { key: "requirementCategory", label: "Requirement category", options: Array.from(new Set(repo.raw.requirements.map((r: any) => r.category))).map(v => ({ value: v as string, label: v as string })) },
          { key: "verificationMethod", label: "Verification method", options: ["sim","formal","review","silicon"].map(v => ({ value: v, label: v })) },
        ]} />
      </section>

      <section>
        <SectionHeader>KPIs & indicators</SectionHeader>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <KpiCard label="Coverage" value={`${repo.coverage.percent.toFixed(1)}%`} tone={repo.coverage.percent >= repo.coverage.threshold ? "green" : "yellow"} help="Aggregate coverage across line, toggle, FSM, and functional bins." footnote={`goal ${repo.coverage.threshold}%`} />
          <KpiCard label="Open defects" value={repo.defects.filter(d => d.state !== "closed").length} tone="yellow" help="Defects currently not in the 'closed' state, filtered by active filters." />
          <KpiTrendCard label="Pass rate" value="96.8%" tone="green" series={[92, 93, 94, 95, 96, 96, 97]} help="Overall regression pass rate trend, last 7 days." />
          <KpiCard label="Failing formal" value={repo.formalProperties.filter(f => f.status === "failed").length} tone="red" help="Formal properties whose solver found a counter-example." />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          <EngineeringGauge value={repo.coverage.percent} label="Coverage gauge" help="Progress toward sign-off threshold." />
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="mb-1 text-xs font-medium text-slate-500">Threshold indicator</div>
            <ThresholdIndicator value={repo.coverage.percent} threshold={repo.coverage.threshold} label="Coverage" />
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="mb-1 text-xs font-medium text-slate-500">Badges</div>
            <div className="flex flex-wrap gap-1">
              <StatusBadge tone="green">green</StatusBadge>
              <StatusBadge tone="yellow">yellow</StatusBadge>
              <StatusBadge tone="red">red</StatusBadge>
              <SeverityBadge severity="critical" /><SeverityBadge severity="medium" /><SeverityBadge severity="low" />
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="mb-1 text-xs font-medium text-slate-500">Confidence</div>
            <ConfidenceIndicator confidence={{ value: 0.82, band: "high" }} />
          </div>
        </div>
      </section>

      <section>
        <SectionHeader>Requirements & specs</SectionHeader>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <RequirementCard id={req.id} title={req.title} category={req.category} priority={req.priority} status={String(req.status)}
            onOpen={() => openDrawer("requirement", req.id, "summary")} />
          <SpecificationSectionCard section={spec.section} title={spec.title} version={spec.version} />
        </div>
        <div className="mt-3">
          <TraceabilityMatrix
            rowLabel="Requirement" colLabel="Test"
            rows={repo.requirements.slice(0, 6).map(r => ({ id: r.id, label: r.id }))}
            cols={repo.tests.slice(0, 6).map(t => ({ id: t.id, label: t.name }))}
            cells={repo.requirements.slice(0, 6).flatMap(r => repo.tests.slice(0, 6).map(t => ({
              rowId: r.id, colId: t.id,
              status: r.linkedTestIds.includes(t.id) ? "ok" as const : "missing" as const
            })))}
          />
        </div>
      </section>

      <section>
        <SectionHeader>RTL structure</SectionHeader>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <ModuleHierarchyTree
            nodes={modules.map(m => ({ id: m.id, name: m.name, parentId: m.parentId }))}
            onOpen={(id) => openDrawer("module", id, "summary")}
          />
          <InterfaceDiagram interfaces={interfaces.map(i => ({ name: i.name, protocol: i.protocol, width: i.width }))} />
        </div>
        <div className="mt-3">
          <RegisterMapTable registers={registers.map(r => ({ name: r.name, offset: r.offset, access: r.access, resetValue: r.resetValue, description: r.description }))} />
        </div>
        <div className="mt-3">
          <DependencyGraph
            nodes={modules.map(m => ({ id: m.id, label: m.name }))}
            edges={modules.filter(m => m.parentId).map(m => ({ from: m.parentId!, to: m.id }))}
          />
        </div>
      </section>

      <section>
        <SectionHeader>Verification signal</SectionHeader>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <RegressionHeatmap suites={repo.regressions.map(r => ({ name: r.name, pass: r.totals.pass, fail: r.totals.fail, abort: r.totals.abort }))} />
          <CoverageProgressCard percent={repo.coverage.percent} threshold={repo.coverage.threshold} updatedAt={repo.coverage.updatedAt} />
          <CoverageSunburst bins={repo.coverage.bins} />
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          {nightly.failureClusters.length ? nightly.failureClusters.slice(0, 1).map(c => (
            <FailureClusterCard key={c.id} label={c.label} count={c.count} hint={c.hint} />
          )) : <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">No failure clusters in the current scenario.</div>}
          <FormalPropertyTable items={repo.formalProperties.map(p => ({ name: p.name, status: p.status, runtimeSec: p.runtimeSec }))} />
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <StaticFindingTable items={repo.staticFindings.map(f => ({ rule: f.rule, severity: f.severity, line: f.line, message: f.message, state: f.state }))} />
          <WaveformPreview />
        </div>
      </section>

      <section>
        <SectionHeader>Change & evidence</SectionHeader>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <LogEvidencePanel lines={[
            { at: "15:24:11", level: "info",  text: "test start ring_wrap_boundary_edge" },
            { at: "15:24:44", level: "warn",  text: "back-pressure window entered (72 cycles)" },
            { at: "15:24:59", level: "error", text: "committed_head lag detected on wrap boundary" },
          ]} />
          <CodeDiffViewer path="rtl/ring_manager.sv" hunks={[
            { minus: ["always_ff @(posedge clk) committed_head <= producer_head_q;"],
              plus:  ["always_ff @(posedge clk)","  if (!fetch_inflight) committed_head <= producer_head_q;"] },
          ]} />
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <ChangeImpactGraph changeTitle={change.title} impactedModules={change.impactedModuleIds.map(m => String(m))} />
          <EvidenceCitationList items={ai?.evidence ?? []} />
        </div>
      </section>

      <section>
        <SectionHeader>Program & sign-off</SectionHeader>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <MilestoneTimeline items={repo.milestones.map(m => ({ name: m.name, targetDate: m.targetDate, status: m.status }))} />
          <div className="grid grid-cols-1 gap-3">
            {repo.signoffs.slice(0, 2).map(g => <SignoffGateCard key={g.id} name={g.name} state={g.state} criteria={g.criteria} />)}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <ComputeQueueChart />
          <LifecycleTimeline steps={[
            { label: "Draft", state: "done" }, { label: "Approved", state: "done" },
            { label: "Verified", state: "active" }, { label: "Sign-off", state: "todo" },
          ]} />
        </div>
      </section>

      <section>
        <SectionHeader>AI reasoning & approval</SectionHeader>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {ai && (
            <AIReasoningPanel
              trigger={ai.trigger} facts={ai.facts} evidence={ai.evidence}
              inference={ai.inference} alternatives={ai.alternatives}
              confidence={ai.confidence} recommendation={ai.recommendation}
              expectedEffect={ai.expectedEffect} risk={ai.risk}
              humanReviewer={String(ai.humanReviewerId ?? "")} approvalStatus={ai.approvalStatus}
            />
          )}
          <HumanApprovalPanel
            reviewer="priya.nair" state={ai?.approvalStatus ?? "pending"}
            actions={personaDesc.approvalActions}
          />
        </div>
        <div className="mt-3">
          <AuditTimeline items={[
            { at: "2026-07-14T15:28", who: "ai-analyzer",  action: "Emitted analysis ai-ring-boundary-rc" },
            { at: "2026-07-14T15:30", who: "priya.nair",   action: "Opened AI panel for review" },
          ]} />
        </div>
      </section>
    </div>
  );
}

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">{children}</h2>
);
