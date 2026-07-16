// Entity detail drawer — 7 tabs, dispatch by entity kind.

import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSiliconStore, type DrawerTab } from "@/silicon/state/SiliconStore";
import { useRepository } from "@/silicon/data/repository";
import {
  AIReasoningPanel, AuditTimeline, ConfidenceIndicator, EvidenceCitationList,
  LogEvidencePanel, StatusBadge,
} from "@/silicon/components";
import type { AnyEntity } from "@/silicon/domain/types";

const TABS: { id: DrawerTab; label: string }[] = [
  { id: "summary",       label: "Summary" },
  { id: "relationships", label: "Relationships" },
  { id: "telemetry",     label: "Telemetry" },
  { id: "history",       label: "History" },
  { id: "evidence",      label: "Evidence" },
  { id: "ai",            label: "AI analysis" },
  { id: "audit",         label: "Audit" },
];

export const EntityDetailDrawer: React.FC = () => {
  const drawer = useSiliconStore(s => s.drawerState);
  const close = useSiliconStore(s => s.closeDrawer);
  const setTab = useSiliconStore(s => s.setDrawerTab);
  const repo = useRepository();

  const entity = drawer.entity ? repo.getEntity(drawer.entity.kind, drawer.entity.id) : undefined;

  return (
    <Sheet open={drawer.open} onOpenChange={(o) => !o && close()}>
      <SheetContent side="right" className="w-full max-w-lg overflow-y-auto bg-white">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-sm">
            {entity ? (
              <>
                <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px]">{entity.kind}</span>
                <span>{entityLabel(entity)}</span>
              </>
            ) : "No entity selected"}
          </SheetTitle>
        </SheetHeader>

        {entity && (
          <Tabs value={drawer.tab} onValueChange={(v) => setTab(v as DrawerTab)} className="mt-3">
            <TabsList className="w-full flex-wrap justify-start">
              {TABS.map(t => <TabsTrigger key={t.id} value={t.id} className="text-[11px]">{t.label}</TabsTrigger>)}
            </TabsList>

            <TabsContent value="summary" className="mt-3"><SummaryTab entity={entity} /></TabsContent>
            <TabsContent value="relationships" className="mt-3"><RelationshipsTab entity={entity} /></TabsContent>
            <TabsContent value="telemetry" className="mt-3"><TelemetryTab entity={entity} /></TabsContent>
            <TabsContent value="history" className="mt-3">
              <AuditTimeline items={[
                { at: "2026-07-14T15:26", who: "system",  action: `Opened for ${entity.kind}` },
                { at: "2026-07-14T15:12", who: "priya.nair", action: "Reviewed" },
              ]} />
            </TabsContent>
            <TabsContent value="evidence" className="mt-3">
              <EvidenceCitationList items={sampleEvidence(entity)} />
              <div className="mt-2"><LogEvidencePanel lines={sampleLogs(entity)} /></div>
            </TabsContent>
            <TabsContent value="ai" className="mt-3"><AiTab entity={entity} /></TabsContent>
            <TabsContent value="audit" className="mt-3">
              <AuditTimeline items={[
                { at: "2026-07-14T15:30", who: "audit",  action: "Deep-link opened this entity" },
                { at: "2026-07-14T15:00", who: "system", action: "Scenario overlay applied" },
              ]} />
            </TabsContent>
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  );
};

function entityLabel(e: AnyEntity): string {
  if ("title" in e && typeof (e as any).title === "string") return (e as any).title;
  if ("name" in e && typeof (e as any).name === "string") return (e as any).name;
  return (e as any).id;
}

const SummaryTab: React.FC<{ entity: AnyEntity }> = ({ entity }) => (
  <div className="space-y-2 text-xs">
    <table className="w-full">
      <tbody>
        {Object.entries(entity).filter(([k]) => !["kind","linkedSpecIds","linkedTestIds","interfaceIds","criteria","evidence","facts","alternatives","impactedModuleIds"].includes(k))
          .map(([k, v]) => (
          <tr key={k} className="border-b border-slate-50">
            <td className="py-1 pr-2 font-medium text-slate-500">{k}</td>
            <td className="py-1 text-slate-800">{typeof v === "object" ? JSON.stringify(v) : String(v)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const RelationshipsTab: React.FC<{ entity: AnyEntity }> = ({ entity }) => {
  const rels: { kind: string; ids: string[] }[] = [];
  const e = entity as any;
  if (e.linkedSpecIds?.length) rels.push({ kind: "specification", ids: e.linkedSpecIds });
  if (e.linkedTestIds?.length) rels.push({ kind: "test",          ids: e.linkedTestIds });
  if (e.interfaceIds?.length)  rels.push({ kind: "interface",     ids: e.interfaceIds });
  if (e.impactedModuleIds?.length) rels.push({ kind: "module",    ids: e.impactedModuleIds });
  if (e.moduleId) rels.push({ kind: "module", ids: [e.moduleId] });
  if (e.ownerId)  rels.push({ kind: "person", ids: [e.ownerId] });
  if (rels.length === 0) return <div className="text-xs text-slate-400">No related entities.</div>;
  return (
    <ul className="space-y-2 text-xs">
      {rels.map(r => (
        <li key={r.kind}>
          <div className="mb-1 text-[10px] uppercase text-slate-500">{r.kind}</div>
          <div className="flex flex-wrap gap-1">
            {r.ids.map(id => <span key={id} className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px]">{id}</span>)}
          </div>
        </li>
      ))}
    </ul>
  );
};

const TelemetryTab: React.FC<{ entity: AnyEntity }> = ({ entity }) => {
  if (entity.kind === "regression") {
    const t = entity.totals;
    return (
      <div className="grid grid-cols-4 gap-2 text-xs">
        <StatusBadge tone="green">pass {t.pass}</StatusBadge>
        <StatusBadge tone="red">fail {t.fail}</StatusBadge>
        <StatusBadge tone="yellow">abort {t.abort}</StatusBadge>
        <StatusBadge tone="gray">not-run {t.notRun}</StatusBadge>
      </div>
    );
  }
  return <div className="text-xs text-slate-500">No structured telemetry for this entity type.</div>;
};

const AiTab: React.FC<{ entity: AnyEntity }> = ({ entity }) => {
  if (entity.kind === "aiAnalysis") {
    return <AIReasoningPanel
      trigger={entity.trigger} facts={entity.facts} evidence={entity.evidence}
      inference={entity.inference} alternatives={entity.alternatives}
      confidence={entity.confidence} recommendation={entity.recommendation}
      expectedEffect={entity.expectedEffect} risk={entity.risk}
      humanReviewer={entity.humanReviewerId} approvalStatus={entity.approvalStatus} />;
  }
  return (
    <div className="space-y-2 text-xs text-slate-600">
      <ConfidenceIndicator confidence={{ value: 0.6, band: "medium" }} />
      <div>No dedicated AI analysis is attached to this entity.</div>
    </div>
  );
};

function sampleEvidence(e: AnyEntity) {
  if (e.kind === "aiAnalysis") return e.evidence;
  return [
    { id: "ev-log-1", kind: "log" as const,      label: "regression stdout excerpt" },
    { id: "ev-wf-1",  kind: "waveform" as const, label: "synthetic waveform preview" },
  ];
}
function sampleLogs(_e: AnyEntity) {
  return [
    { at: "15:24:11", level: "info"  as const, text: "test start" },
    { at: "15:24:44", level: "warn"  as const, text: "back-pressure window entered (72 cycles)" },
    { at: "15:24:59", level: "error" as const, text: "committed_head lag detected on wrap boundary" },
  ];
}
