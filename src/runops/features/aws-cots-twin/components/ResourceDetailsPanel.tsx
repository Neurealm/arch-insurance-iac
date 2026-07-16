/**
 * AWS COTS Digital Twin — Persistent Resource Details Panel (Prompt 5).
 *
 * Twelve tabs backed by the repository layer. UI-only: no writes.
 * All potentially sensitive material (Secrets Manager values, credentials,
 * API tokens) is redacted before it is ever rendered.
 */

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Activity, AlertOctagon, ArrowDown, ArrowUp, Boxes, CheckCircle2, Copy,
  DollarSign, ExternalLink, FileCode2, GitBranch, History, Info, Layers,
  MinusCircle, PlayCircle, ShieldAlert, ShieldCheck, Sparkles, Wrench, X,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  getAwsCotsRepository,
  type Alert,
  type AutomationAction,
  type AwsResource,
  type AwsResourceConfiguration,
  type BackupStatusRecord,
  type Change,
  type ComplianceFinding,
  type CostObservation,
  type Incident,
  type ResourceRelationship,
  type Runbook,
  type SecurityFinding,
  type TelemetryDefinition,
  type TelemetryObservation,
} from "..";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export type DetailsTab =
  | "overview" | "configuration" | "telemetry" | "alerts" | "dependencies"
  | "security" | "cost" | "changes" | "incidents" | "runbooks"
  | "automation" | "raw";

const TAB_ORDER: { id: DetailsTab; label: string; icon: typeof Info }[] = [
  { id: "overview",      label: "Overview",      icon: Info },
  { id: "configuration", label: "Configuration", icon: Layers },
  { id: "telemetry",     label: "Telemetry",     icon: Activity },
  { id: "alerts",        label: "Alerts",        icon: AlertOctagon },
  { id: "dependencies",  label: "Dependencies",  icon: GitBranch },
  { id: "security",      label: "Security",      icon: ShieldCheck },
  { id: "cost",          label: "Cost",          icon: DollarSign },
  { id: "changes",       label: "Changes",       icon: History },
  { id: "incidents",     label: "Incidents",     icon: ShieldAlert },
  { id: "runbooks",      label: "Runbooks",      icon: Boxes },
  { id: "automation",    label: "Automation",    icon: PlayCircle },
  { id: "raw",           label: "Raw JSON",      icon: FileCode2 },
];

const TIME_RANGES = [
  { id: "1h",  label: "1h",  hours: 1 },
  { id: "6h",  label: "6h",  hours: 6 },
  { id: "24h", label: "24h", hours: 24 },
  { id: "7d",  label: "7d",  hours: 24 * 7 },
  { id: "30d", label: "30d", hours: 24 * 30 },
] as const;
type TimeRangeId = (typeof TIME_RANGES)[number]["id"];

export interface ResourceDetailsPanelProps {
  resourceId: string;
  onClose: () => void;
  onFocusCanvas?: () => void;
  /** Retained across resource selection. */
  activeTab: DetailsTab;
  onActiveTabChange: (t: DetailsTab) => void;
}

interface DetailsPayload {
  resource: AwsResource;
  configurations: AwsResourceConfiguration[];
  relationships: ResourceRelationship[];
  allResources: AwsResource[];
  telemetry: TelemetryObservation[];
  telemetryDefs: TelemetryDefinition[];
  alerts: Alert[];
  incidents: Incident[];
  changes: Change[];
  runbooks: Runbook[];
  automations: AutomationAction[];
  security: SecurityFinding[];
  compliance: ComplianceFinding[];
  backup: BackupStatusRecord[];
  cost: CostObservation[];
}

/* -------------------------------------------------------------------------- */
/*  Data loader                                                                */
/* -------------------------------------------------------------------------- */

async function loadDetails(resourceId: string): Promise<DetailsPayload | null> {
  const repo = getAwsCotsRepository();
  const resource = await repo.getResourceById(resourceId);
  if (!resource) return null;
  const [configurations, relationships, allResources, telemetry, telemetryDefs,
    directAlerts, incidents, changes, runbooks, security, compliance, backup, cost] =
  await Promise.all([
    repo.getResourceConfigurations(resourceId),
    repo.getResourceRelationships(resourceId),
    repo.getResources(),
    repo.getResourceTelemetry(resourceId),
    repo.getTelemetryDefinitions(),
    repo.getAlerts({ resourceId }),
    repo.getIncidents(),
    repo.getChanges(),
    repo.getRunbooks({ resourceType: resource.resource_type }),
    repo.getSecurityFindings(resourceId),
    repo.getComplianceFindings(resourceId),
    repo.getBackupStatus(resourceId),
    repo.getCostObservations(resourceId),
  ]);
  const runbookIds = runbooks.map((r) => r.id);
  const automations = (await Promise.all(runbookIds.map((id) => repo.getAutomationActions(id)))).flat();
  // Bubble up alerts from directly attached child resources (EC2 → EBS).
  const childIds = allResources.filter((x) => x.parent_resource_id === resourceId).map((x) => x.id);
  const childAlerts = childIds.length
    ? (await Promise.all(childIds.map((id) => repo.getAlerts({ resourceId: id })))).flat()
    : [];
  const seen = new Set<string>();
  const alerts = [...directAlerts, ...childAlerts].filter((a) => (seen.has(a.id) ? false : (seen.add(a.id), true)));
  return {
    resource, configurations, relationships, allResources, telemetry, telemetryDefs,
    alerts, incidents, changes, runbooks, automations, security, compliance, backup, cost,
  };
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function ResourceDetailsPanel({
  resourceId, onClose, onFocusCanvas, activeTab, onActiveTabChange,
}: ResourceDetailsPanelProps) {
  const [payload, setPayload] = useState<DetailsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;
    setPayload(null);
    setError(null);
    loadDetails(resourceId)
      .then((p) => { if (!cancelled) { if (p) setPayload(p); else setError("Resource not found"); } })
      .catch(() => { if (!cancelled) setError("Failed to load resource details"); });
    return () => { cancelled = true; };
  }, [resourceId]);

  const handleClose = () => {
    onClose();
    onFocusCanvas?.();
  };

  const deferred = (name: string) => () => {
    toast({
      title: `${name} — coming in a later phase`,
      description: "Action wire-up lands with the simulation engine and automation approvals.",
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-col text-[12px] text-slate-800">
      {/* Header */}
      <DetailsHeader
        resource={payload?.resource}
        onClose={handleClose}
        onCopyId={() => {
          if (!payload) return;
          navigator.clipboard.writeText(payload.resource.resource_id).then(
            () => toast({ title: "Resource ID copied", description: payload.resource.resource_id }),
            () => toast({ title: "Copy failed", variant: "destructive" }),
          );
        }}
        onCopyArn={() => {
          if (!payload) return;
          navigator.clipboard.writeText(payload.resource.arn).then(
            () => toast({ title: "ARN copied", description: payload.resource.arn }),
            () => toast({ title: "Copy failed", variant: "destructive" }),
          );
        }}
      />

      {/* Body */}
      {!payload && !error && (
        <div className="p-3 text-slate-500">Loading resource details…</div>
      )}
      {error && (
        <div className="p-3 text-red-600">{error}</div>
      )}
      {payload && (
        <Tabs
          value={activeTab}
          onValueChange={(v) => onActiveTabChange(v as DetailsTab)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="border-b border-slate-200 bg-slate-50/60">
            <TabsList className="h-auto w-full justify-start gap-0 overflow-x-auto rounded-none bg-transparent p-0">
              {TAB_ORDER.map(({ id, label, icon: Icon }) => (
                <TabsTrigger
                  key={id}
                  value={id}
                  className={cn(
                    "shrink-0 rounded-none border-b-2 border-transparent px-2.5 py-1.5",
                    "text-[11px] font-medium text-slate-600 data-[state=active]:border-slate-900",
                    "data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-none",
                  )}
                >
                  <Icon className="mr-1 h-3 w-3" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
            <TabsContent value="overview" className="m-0"><OverviewTab p={payload} /></TabsContent>
            <TabsContent value="configuration" className="m-0"><ConfigurationTab p={payload} /></TabsContent>
            <TabsContent value="telemetry" className="m-0"><TelemetryTab p={payload} /></TabsContent>
            <TabsContent value="alerts" className="m-0"><AlertsTab p={payload} /></TabsContent>
            <TabsContent value="dependencies" className="m-0"><DependenciesTab p={payload} /></TabsContent>
            <TabsContent value="security" className="m-0"><SecurityTab p={payload} /></TabsContent>
            <TabsContent value="cost" className="m-0"><CostTab p={payload} /></TabsContent>
            <TabsContent value="changes" className="m-0"><ChangesTab p={payload} /></TabsContent>
            <TabsContent value="incidents" className="m-0"><IncidentsTab p={payload} /></TabsContent>
            <TabsContent value="runbooks" className="m-0"><RunbooksTab p={payload} onOpen={deferred} /></TabsContent>
            <TabsContent value="automation" className="m-0"><AutomationTab p={payload} onRun={deferred} /></TabsContent>
            <TabsContent value="raw" className="m-0"><RawJsonTab p={payload} /></TabsContent>
          </div>
        </Tabs>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Header                                                                     */
/* -------------------------------------------------------------------------- */

function DetailsHeader({ resource, onClose, onCopyId, onCopyArn }: {
  resource?: AwsResource; onClose: () => void; onCopyId: () => void; onCopyArn: () => void;
}) {
  return (
    <div className="border-b border-slate-200 bg-white px-3 py-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Selected resource</div>
          <div className="mt-0.5 truncate text-[13.5px] font-semibold text-slate-900">
            {resource?.resource_name ?? "Loading…"}
          </div>
          {resource && (
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10.5px] text-slate-500">
              <span>{prettyType(resource.resource_type)}</span>
              <Dot />
              <HealthText status={resource.health_status} />
              <Dot />
              <span>{resource.environment}</span>
              <Dot />
              <span>{resource.availability_zone ?? "Regional"}</span>
              <Dot />
              <span>{resource.criticality}</span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close resource details"
          className="grid h-6 w-6 place-items-center rounded text-slate-500 hover:bg-slate-100"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      {resource && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={onCopyId}
            className="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-700 hover:bg-slate-100"
          >
            <code className="max-w-[140px] truncate">{resource.resource_id}</code>
            <Copy className="h-2.5 w-2.5" />
          </button>
          <button
            type="button"
            onClick={onCopyArn}
            className="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-700 hover:bg-slate-100"
            title={resource.arn}
          >
            <span>ARN</span>
            <Copy className="h-2.5 w-2.5" />
          </button>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Tab: Overview                                                              */
/* -------------------------------------------------------------------------- */

function OverviewTab({ p }: { p: DetailsPayload }) {
  const { resource: r, alerts, telemetry, telemetryDefs, runbooks } = p;
  const healthScore = computeHealthScore(r, alerts, telemetry, telemetryDefs);
  const activeAlerts = alerts.filter((a) => a.status === "Firing" || a.status === "Acknowledged");
  const topAlert = [...activeAlerts].sort((a, b) => severityRank(b.severity) - severityRank(a.severity))[0];
  const metrics = telemetryDefs
    .filter((d) => d.resource_type === r.resource_type)
    .map((d) => ({ def: d, obs: telemetry.find((o) => o.metric_definition_id === d.id) }))
    .filter((m) => m.obs);
  const recs = recommendations(r, alerts, runbooks);

  return (
    <div className="space-y-3">
      <Section title="Identity" icon={<Info className="h-3 w-3" />}>
        <Kv label="Name" value={r.resource_name} />
        <Kv label="Type" value={prettyType(r.resource_type)} />
        <Kv label="AWS ID" value={<code className="text-[10.5px]">{r.resource_id}</code>} />
        <Kv label="Region" value={r.region} />
        <Kv label="AZ" value={r.availability_zone ?? "Regional"} />
        <Kv label="Environment" value={r.environment} />
        <Kv label="Owner" value={r.owner} />
        <Kv label="Support" value={r.support_group} />
      </Section>

      <Section title="Health & criticality" icon={<Sparkles className="h-3 w-3" />}>
        <div className="grid grid-cols-2 gap-1.5">
          <StatTile label="Health score" value={`${healthScore}/100`} tone={healthScoreTone(healthScore)} />
          <StatTile label="Health status" value={r.health_status} tone={healthTone(r.health_status)} />
          <StatTile label="Criticality" value={r.criticality} tone={r.criticality === "Business Critical" ? "warn" : "neutral"} />
          <StatTile label="Active alerts" value={String(activeAlerts.length)} tone={activeAlerts.length ? "bad" : "ok"} />
        </div>
      </Section>

      <Section title="Configuration summary" icon={<Layers className="h-3 w-3" />}>
        {configSummary(r).map((c) => <Kv key={c.label} label={c.label} value={c.value} />)}
      </Section>

      <Section title="Current telemetry" icon={<Activity className="h-3 w-3" />}>
        {metrics.length === 0 && <div className="text-slate-500">No telemetry defined for this resource type.</div>}
        {metrics.slice(0, 4).map(({ def, obs }) => obs && (
          <Kv key={def.id} label={def.display_name} value={
            <span>
              <span className="font-medium text-slate-900">{formatValue(obs.current_value)}</span>{" "}
              <span className="text-slate-500">{def.unit}</span>
              {def.warning_threshold != null && (
                <span className="ml-2 text-[10px] text-slate-500">W ≥ {def.warning_threshold} · C ≥ {def.critical_threshold ?? "—"}</span>
              )}
            </span>
          } />
        ))}
      </Section>

      <Section title="Active alerts" icon={<AlertOctagon className="h-3 w-3" />}>
        {activeAlerts.length === 0 && <div className="text-emerald-700">None. Resource is quiet.</div>}
        {topAlert && (
          <>
            <Kv label="Top alert" value={<span title={topAlert.title}>{topAlert.title}</span>} />
            <Kv label="Severity" value={<SeverityBadge severity={topAlert.severity} />} />
            <Kv label="Category" value={topAlert.category} />
          </>
        )}
      </Section>

      <Section title="Business impact" icon={<ShieldAlert className="h-3 w-3" />}>
        <div className="rounded border border-slate-200 bg-slate-50/60 p-2 leading-relaxed text-slate-700">
          {topAlert?.business_impact
            ?? `${r.resource_name} supports the Atlas COTS Platform, part of Enterprise Resource Management. Failure impact is proportional to its criticality (${r.criticality}).`}
        </div>
      </Section>

      <Section title="Operational readiness" icon={<CheckCircle2 className="h-3 w-3" />}>
        <div className="grid grid-cols-2 gap-1.5">
          <StatTile label="Backup" value={r.backup_status} tone={r.backup_status === "Protected" ? "ok" : r.backup_status === "Unprotected" ? "bad" : "warn"} />
          <StatTile label="Patch" value={r.patch_status} tone={r.patch_status === "Current" ? "ok" : r.patch_status === "Overdue" ? "bad" : "warn"} />
          <StatTile label="Compliance" value={r.compliance_status} tone={r.compliance_status === "Compliant" ? "ok" : r.compliance_status === "Non-Compliant" ? "bad" : "neutral"} />
          <StatTile label="Automation" value={r.automation_eligibility} tone={r.automation_eligibility === "Full" ? "ok" : r.automation_eligibility === "None" ? "bad" : "warn"} />
        </div>
      </Section>

      <Section title="Top recommendations" icon={<Wrench className="h-3 w-3" />}>
        {recs.length === 0 && <div className="text-slate-500">No open recommendations.</div>}
        <ul className="space-y-1">
          {recs.map((rec, i) => (
            <li key={i} className="flex gap-1.5 rounded border border-slate-200 bg-white p-1.5">
              <span className="mt-px text-slate-400">•</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function recommendations(r: AwsResource, alerts: Alert[], runbooks: Runbook[]): string[] {
  const out: string[] = [];
  for (const a of alerts) {
    if (a.status === "Resolved") continue;
    if (a.recommended_action) out.push(`${a.title}: ${a.recommended_action}`);
  }
  if (r.patch_status === "Overdue") out.push("Patches are overdue — schedule a maintenance window.");
  if (r.patch_status === "Pending") out.push("Pending patches available — coordinate with change window.");
  if (r.backup_status === "Unprotected") out.push("Enable a backup plan to meet RPO commitments.");
  if (out.length === 0 && runbooks.length) out.push(`Consider certifying "${runbooks[0].name}" for this resource type.`);
  return out.slice(0, 5);
}

function computeHealthScore(r: AwsResource, alerts: Alert[], obs: TelemetryObservation[], defs: TelemetryDefinition[]): number {
  let score = 100;
  for (const a of alerts) {
    if (a.status !== "Firing" && a.status !== "Acknowledged") continue;
    score -= { Critical: 40, High: 25, Medium: 12, Low: 6, Info: 2 }[a.severity];
  }
  if (r.patch_status === "Overdue") score -= 8;
  if (r.backup_status === "Unprotected") score -= 6;
  if (r.compliance_status === "Non-Compliant") score -= 10;
  for (const o of obs) {
    const def = defs.find((d) => d.id === o.metric_definition_id);
    if (!def) continue;
    if (def.critical_threshold != null && o.current_value >= def.critical_threshold) score -= 6;
    else if (def.warning_threshold != null && o.current_value >= def.warning_threshold) score -= 3;
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}

/* -------------------------------------------------------------------------- */
/*  Tab: Configuration                                                         */
/* -------------------------------------------------------------------------- */

function ConfigurationTab({ p }: { p: DetailsPayload }) {
  const { resource: r, configurations, changes } = p;
  const configEntries = useMemo(() => buildConfigTable(r, configurations, changes), [r, configurations, changes]);
  const historyItems = configHistory(r, configurations, changes);

  return (
    <div className="space-y-3">
      <Section title="Configuration attributes" icon={<Layers className="h-3 w-3" />}>
        <div className="overflow-x-auto rounded border border-slate-200">
          <table className="w-full text-[11px]">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <Th>Attribute</Th>
                <Th>Current</Th>
                <Th>Desired</Th>
                <Th>Compliance</Th>
                <Th>Source</Th>
                <Th>Last changed</Th>
                <Th>Changed by</Th>
                <Th>Change</Th>
                <Th>Drift</Th>
              </tr>
            </thead>
            <tbody>
              {configEntries.map((row) => (
                <tr key={row.attribute} className="border-t border-slate-100">
                  <Td className="font-medium text-slate-800">{row.attribute}</Td>
                  <Td>{row.current}</Td>
                  <Td>{row.desired}</Td>
                  <Td><ComplianceBadge status={row.compliance} /></Td>
                  <Td className="text-slate-600">{row.source}</Td>
                  <Td className="text-slate-600">{fmtDate(row.lastChanged)}</Td>
                  <Td className="text-slate-600">{row.changedBy}</Td>
                  <Td>{row.change ? <Badge variant="outline" className="border-slate-200 text-[10px]">{row.change}</Badge> : <span className="text-slate-400">—</span>}</Td>
                  <Td>{row.drift ? <span className="text-red-700">Drift</span> : <span className="text-emerald-700">In sync</span>}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Configuration history" icon={<History className="h-3 w-3" />}>
        <ol className="space-y-1.5">
          {historyItems.map((h, i) => (
            <li key={i} className="flex gap-2 rounded border border-slate-200 bg-white p-2">
              <div className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-slate-100 text-[9px] font-semibold text-slate-600">
                {historyItems.length - i}
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-medium text-slate-800">{h.summary}</div>
                <div className="text-[10px] text-slate-500">{fmtDate(h.at)} · by {h.actor} {h.change ? `· ${h.change}` : ""}</div>
              </div>
            </li>
          ))}
          {historyItems.length === 0 && <div className="text-slate-500">No configuration history recorded.</div>}
        </ol>
      </Section>
    </div>
  );
}

interface ConfigTableRow {
  attribute: string;
  current: string;
  desired: string;
  compliance: AwsResource["compliance_status"];
  source: string;
  lastChanged: string;
  changedBy: string;
  change?: string;
  drift: boolean;
}

function buildConfigTable(
  r: AwsResource,
  configs: AwsResourceConfiguration[],
  changes: Change[],
): ConfigTableRow[] {
  const rows: ConfigTableRow[] = [];
  const configByKey = new Map(configs.map((c) => [c.configuration_key, c]));
  for (const [key, valueRaw] of Object.entries(r.configuration ?? {})) {
    if (isSensitiveKey(key)) continue;
    const captured = configByKey.get(key);
    const value = String(valueRaw);
    const baseline = captured?.baseline_value != null ? String(captured.baseline_value) : value;
    const drift = captured?.drift_detected ?? false;
    const change = changes.find((c) => c.affected_resource_ids.includes(r.id));
    rows.push({
      attribute: key,
      current: value,
      desired: baseline,
      compliance: drift ? "Non-Compliant" : "Compliant",
      source: "AWS Config",
      lastChanged: r.last_configuration_change_at,
      changedBy: r.support_group,
      change: change?.external_id,
      drift,
    });
  }
  // Include drift-only configs (e.g. AMI pending_patches, EBS used_pct).
  for (const c of configs) {
    if (rows.find((row) => row.attribute === c.configuration_key)) continue;
    if (isSensitiveKey(c.configuration_key)) continue;
    rows.push({
      attribute: c.configuration_key,
      current: String(c.configuration_value),
      desired: c.baseline_value != null ? String(c.baseline_value) : "—",
      compliance: c.drift_detected ? "Non-Compliant" : "Compliant",
      source: "AWS Config",
      lastChanged: c.captured_at,
      changedBy: r.support_group,
      drift: c.drift_detected,
    });
  }
  return rows;
}

function configHistory(r: AwsResource, configs: AwsResourceConfiguration[], changes: Change[]) {
  const items: { at: string; summary: string; actor: string; change?: string }[] = [];
  for (const c of configs) {
    items.push({
      at: c.captured_at,
      summary: `${c.configuration_key} → ${String(c.configuration_value)}${c.drift_detected ? " (drift detected)" : ""}`,
      actor: r.support_group,
    });
  }
  const relatedChange = changes.find((c) => c.affected_resource_ids.includes(r.id));
  if (relatedChange) {
    items.push({
      at: relatedChange.planned_start,
      summary: relatedChange.title,
      actor: relatedChange.owner,
      change: relatedChange.external_id,
    });
  }
  items.push({
    at: r.last_configuration_change_at,
    summary: `${r.resource_name} configuration synced from AWS Config`,
    actor: r.support_group,
  });
  return items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 6);
}

/* -------------------------------------------------------------------------- */
/*  Tab: Telemetry                                                             */
/* -------------------------------------------------------------------------- */

function TelemetryTab({ p }: { p: DetailsPayload }) {
  const { resource: r, telemetry, telemetryDefs } = p;
  const [range, setRange] = useState<TimeRangeId>("24h");

  const metrics = telemetryDefs
    .filter((d) => d.resource_type === r.resource_type)
    .map((d) => ({ def: d, obs: telemetry.find((o) => o.metric_definition_id === d.id) }))
    .filter((m) => m.obs) as { def: TelemetryDefinition; obs: TelemetryObservation }[];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-1">
        <span className="mr-1 text-[10px] uppercase tracking-wider text-slate-500">Range</span>
        {TIME_RANGES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setRange(t.id)}
            className={cn(
              "rounded border px-2 py-0.5 text-[10.5px]",
              range === t.id
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      {metrics.length === 0 && (
        <div className="rounded border border-dashed border-slate-200 bg-slate-50 p-3 text-slate-500">
          No telemetry defined for {prettyType(r.resource_type)}.
        </div>
      )}
      <div className="space-y-2">
        {metrics.map(({ def, obs }) => (
          <MetricCard key={def.id} def={def} obs={obs} range={range} />
        ))}
      </div>
    </div>
  );
}

function MetricCard({ def, obs, range }: { def: TelemetryDefinition; obs: TelemetryObservation; range: TimeRangeId }) {
  const rangeHours = TIME_RANGES.find((t) => t.id === range)!.hours;
  const points = useMemo(
    () => synthesizeSeries(obs.baseline_value, obs.previous_value, obs.current_value, rangeHours, obs.id),
    [obs, rangeHours],
  );
  const min = Math.min(...points, def.warning_threshold ?? Infinity);
  const max = Math.max(...points, def.critical_threshold ?? -Infinity);
  const range01 = max - min || 1;
  const w = 320, h = 60, pad = 4;

  const stroke =
    def.critical_threshold != null && obs.current_value >= def.critical_threshold ? "#dc2626" :
    def.warning_threshold != null && obs.current_value >= def.warning_threshold ? "#d97706" : "#16a34a";

  const path = points.map((v, i) => {
    const x = pad + (i / (points.length - 1)) * (w - 2 * pad);
    const y = h - pad - ((v - min) / range01) * (h - 2 * pad);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  const anomalies = points
    .map((v, i) => ({ v, i }))
    .filter(({ v }) =>
      (def.critical_threshold != null && v >= def.critical_threshold) ||
      (def.warning_threshold != null && v >= def.warning_threshold * 1.05),
    )
    .slice(0, 6);

  const previousLabel =
    range === "1h" ? "prev 10 min" :
    range === "6h" ? "prev hour" :
    range === "24h" ? "1h trend" :
    range === "7d" ? "24h trend" : "7d trend";

  return (
    <div className="rounded border border-slate-200 bg-white p-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[11.5px] font-medium text-slate-800">{def.display_name}</div>
          <div className="text-[10px] text-slate-500">
            {def.metric_namespace} · {def.metric_name} · {def.statistic} · every {def.period_seconds}s
          </div>
        </div>
        <div className="text-right">
          <div className="text-[13px] font-semibold text-slate-900">
            {formatValue(obs.current_value)} <span className="text-[10.5px] font-normal text-slate-500">{def.unit}</span>
          </div>
          <div className="text-[10px] text-slate-500">
            <TrendIcon trend={obs.trend} /> {previousLabel}: {formatValue(obs.previous_value)} {def.unit}
          </div>
        </div>
      </div>
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} className="mt-1.5" aria-hidden>
        {/* Threshold guides */}
        {def.warning_threshold != null && (
          <line
            x1={pad} x2={w - pad}
            y1={h - pad - ((def.warning_threshold - min) / range01) * (h - 2 * pad)}
            y2={h - pad - ((def.warning_threshold - min) / range01) * (h - 2 * pad)}
            stroke="#d97706" strokeDasharray="3 3" strokeWidth={0.75}
          />
        )}
        {def.critical_threshold != null && (
          <line
            x1={pad} x2={w - pad}
            y1={h - pad - ((def.critical_threshold - min) / range01) * (h - 2 * pad)}
            y2={h - pad - ((def.critical_threshold - min) / range01) * (h - 2 * pad)}
            stroke="#dc2626" strokeDasharray="3 3" strokeWidth={0.75}
          />
        )}
        <path d={path} stroke={stroke} strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {anomalies.map(({ v, i }) => {
          const x = pad + (i / (points.length - 1)) * (w - 2 * pad);
          const y = h - pad - ((v - min) / range01) * (h - 2 * pad);
          return <circle key={i} cx={x} cy={y} r={2} fill="#dc2626" />;
        })}
      </svg>
      <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-slate-600 md:grid-cols-3">
        <div><span className="text-slate-500">Baseline:</span> {formatValue(obs.baseline_value)} {def.unit}</div>
        <div><span className="text-slate-500">Normal range:</span> {def.normal_min ?? "—"}–{def.normal_max ?? "—"} {def.unit}</div>
        <div><span className="text-slate-500">Warning:</span> ≥ {def.warning_threshold ?? "—"} {def.unit}</div>
        <div><span className="text-slate-500">Critical:</span> ≥ {def.critical_threshold ?? "—"} {def.unit}</div>
        <div><span className="text-slate-500">Anomaly score:</span> {obs.anomaly_score.toFixed(2)}</div>
        <div><span className="text-slate-500">Freshness:</span> <FreshnessBadge status={obs.freshness_status} /></div>
      </div>
    </div>
  );
}

function synthesizeSeries(baseline: number, previous: number, current: number, hours: number, seedKey: string): number[] {
  const points = Math.max(24, Math.min(96, Math.round(hours * 4)));
  const arr: number[] = [];
  const seed = Array.from(seedKey).reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 1);
  const rand = (i: number) => (((Math.abs(seed) * 9301 + i * 49297) % 233280) / 233280 - 0.5) * (Math.abs(current - baseline) * 0.4 + 0.1);
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1);
    const anchor = t < 0.5
      ? baseline + (previous - baseline) * (t / 0.5)
      : previous + (current - previous) * ((t - 0.5) / 0.5);
    arr.push(Number((anchor + rand(i)).toFixed(3)));
  }
  return arr;
}

/* -------------------------------------------------------------------------- */
/*  Tab: Alerts                                                                */
/* -------------------------------------------------------------------------- */

function AlertsTab({ p }: { p: DetailsPayload }) {
  const { alerts, incidents, runbooks } = p;
  if (alerts.length === 0) {
    return <div className="rounded border border-dashed border-slate-200 bg-emerald-50/50 p-3 text-emerald-700">No alerts on this resource or its attached children.</div>;
  }
  return (
    <div className="space-y-2">
      {alerts.map((a) => {
        const incident = incidents.find((i) => i.id === a.incident_id);
        const runbook = runbooks.find((r) => r.id === a.runbook_id);
        return (
          <div key={a.id} className="rounded border border-slate-200 bg-white p-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[12px] font-medium text-slate-900">{a.title}</div>
                <div className="text-[10.5px] text-slate-500">{a.detection_source}</div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <SeverityBadge severity={a.severity} />
                <StatusBadge status={a.status} />
              </div>
            </div>
            <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10.5px]">
              <Kv label="Current" value={a.current_value != null ? `${a.current_value}${a.metric_name ? "" : ""}` : "—"} />
              <Kv label="Threshold" value={a.threshold != null ? String(a.threshold) : "—"} />
              <Kv label="First detected" value={fmtDate(a.first_detected_at)} />
              <Kv label="Duration" value={durationSince(a.first_detected_at)} />
              <Kv label="Team" value={a.assigned_team} />
              <Kv label="Owner" value={a.assigned_owner ?? "—"} />
              <Kv label="Incident" value={incident ? incident.external_id : <span className="text-slate-500">Unlinked</span>} />
              <Kv label="Runbook" value={runbook ? runbook.name : <span className="text-slate-500">None</span>} />
            </div>
            <div className="mt-1.5 rounded bg-slate-50 p-1.5 text-[10.5px] text-slate-700">
              <span className="font-medium text-slate-800">Recommended action:</span> {a.recommended_action}
            </div>
            <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500">
              <span>Automation available: <span className={a.automation_available ? "text-emerald-700" : "text-slate-500"}>{a.automation_available ? "Yes" : "No"}</span></span>
              <span>· Status: {a.automated_action_status}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Tab: Dependencies                                                          */
/* -------------------------------------------------------------------------- */

function DependenciesTab({ p }: { p: DetailsPayload }) {
  const { resource: r, relationships, allResources } = p;
  const nameOf = (id: string) => allResources.find((x) => x.id === id)?.resource_name ?? id;
  const upstream = relationships.filter((x) => x.target_resource_id === r.id);
  const downstream = relationships.filter((x) => x.source_resource_id === r.id);

  return (
    <div className="space-y-3">
      <Section title={`Upstream (${upstream.length})`} icon={<ArrowUp className="h-3 w-3" />}>
        <DependencyTable rows={upstream} otherEndOf={(rel) => rel.source_resource_id} nameOf={nameOf} />
      </Section>
      <Section title={`Downstream (${downstream.length})`} icon={<ArrowDown className="h-3 w-3" />}>
        <DependencyTable rows={downstream} otherEndOf={(rel) => rel.target_resource_id} nameOf={nameOf} />
      </Section>
      <div className="rounded border border-dashed border-slate-200 bg-slate-50/50 p-2 text-[10.5px] text-slate-500">
        Full graph highlighting on the canvas will be wired up in a later phase.
      </div>
    </div>
  );
}

function DependencyTable({
  rows, otherEndOf, nameOf,
}: {
  rows: ResourceRelationship[];
  otherEndOf: (r: ResourceRelationship) => string;
  nameOf: (id: string) => string;
}) {
  if (rows.length === 0) return <div className="text-slate-500">None.</div>;
  return (
    <div className="overflow-x-auto rounded border border-slate-200">
      <table className="w-full text-[11px]">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <Th>Resource</Th>
            <Th>Type</Th>
            <Th>Protocol</Th>
            <Th>Port</Th>
            <Th>Status</Th>
            <Th>Latency</Th>
            <Th>Criticality</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((rel) => (
            <tr key={rel.id} className="border-t border-slate-100">
              <Td className="font-medium text-slate-800">{nameOf(otherEndOf(rel))}</Td>
              <Td>{rel.relationship_type}</Td>
              <Td>{rel.protocol ?? "—"}</Td>
              <Td>{rel.port ?? "—"}</Td>
              <Td>
                <span className={
                  rel.relationship_status === "Active" ? "text-emerald-700" :
                  rel.relationship_status === "Degraded" ? "text-amber-700" :
                  rel.relationship_status === "Broken" ? "text-red-700" : "text-slate-500"
                }>{rel.relationship_status}</span>
              </Td>
              <Td>{rel.latency_ms != null ? `${rel.latency_ms} ms` : "—"}</Td>
              <Td>{rel.criticality}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Tab: Security                                                              */
/* -------------------------------------------------------------------------- */

function SecurityTab({ p }: { p: DetailsPayload }) {
  const { resource: r, security, compliance } = p;
  const openFindings = security.filter((f) => f.status === "Open");
  const secScore = Math.max(0, 100
    - openFindings.reduce((n, f) => n + ({ Critical: 30, High: 20, Medium: 12, Low: 6, Info: 2 }[f.severity]), 0)
    - (r.compliance_status === "Non-Compliant" ? 15 : 0)
    - (r.patch_status === "Overdue" ? 10 : 0));
  const exposure =
    r.network_scope === "public" || r.network_scope === "edge" ? "Internet-facing" :
    r.network_scope === "n/a" ? "Not applicable" : "Internal only";
  const enc = String((r.configuration as Record<string, unknown>)?.encrypted ?? "").toLowerCase() === "true" || r.resource_type === "KmsKey" || r.resource_type === "SecretsManagerSecret"
    ? "Encrypted (at rest + in transit)"
    : "Encryption managed at parent layer";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-1.5 md:grid-cols-4">
        <StatTile label="Security score" value={`${secScore}/100`} tone={healthScoreTone(secScore)} />
        <StatTile label="Exposure" value={exposure} tone={exposure === "Internet-facing" ? "warn" : "ok"} />
        <StatTile label="Encryption" value={enc} tone="ok" />
        <StatTile label="Open findings" value={String(openFindings.length)} tone={openFindings.length ? "warn" : "ok"} />
      </div>

      <Section title="IAM posture" icon={<ShieldCheck className="h-3 w-3" />}>
        <Kv label="Role" value={String((r.configuration as Record<string, unknown>)?.iam_role ?? "AtlasApplicationRole")} />
        <Kv label="Least privilege" value={<span className="text-emerald-700">Enforced (Access Analyzer clean)</span>} />
        <Kv label="MFA required" value={<span className="text-emerald-700">Yes (delegated admin)</span>} />
      </Section>

      <Section title="Vulnerability summary" icon={<ShieldAlert className="h-3 w-3" />}>
        {openFindings.length === 0
          ? <div className="text-emerald-700">No open vulnerabilities from Inspector / GuardDuty / Security Hub.</div>
          : (
            <ul className="space-y-1">
              {openFindings.map((f) => (
                <li key={f.id} className="rounded border border-slate-200 bg-white p-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-slate-800">{f.title}</span>
                    <SeverityBadge severity={f.severity} />
                  </div>
                  <div className="mt-0.5 text-[10px] text-slate-500">{f.source} · {f.standard} · first seen {fmtDate(f.first_seen_at)}</div>
                </li>
              ))}
            </ul>
          )
        }
      </Section>

      <Section title="Logging coverage" icon={<Activity className="h-3 w-3" />}>
        <Kv label="CloudTrail" value={<span className="text-emerald-700">Management + data events</span>} />
        <Kv label="VPC Flow Logs" value={<span className="text-emerald-700">Enabled → /atlas/vpc-flow</span>} />
        <Kv label="Application logs" value={<span className="text-emerald-700">CloudWatch Logs (30d)</span>} />
      </Section>

      <Section title="Compliance results" icon={<CheckCircle2 className="h-3 w-3" />}>
        {compliance.length === 0
          ? <div className="text-slate-500">No compliance controls evaluated against this resource.</div>
          : compliance.map((c) => (
            <Kv key={c.id}
              label={`${c.framework} ${c.control_id}`}
              value={<span><ComplianceBadge status={c.status} /> <span className="text-slate-500">— {c.detail}</span></span>}
            />
          ))
        }
      </Section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Tab: Cost                                                                  */
/* -------------------------------------------------------------------------- */

function CostTab({ p }: { p: DetailsPayload }) {
  const { resource: r, cost } = p;
  const current = r.monthly_cost;
  const observed = cost.reduce((s, c) => s + c.amount, 0);
  const variance = cost[0]?.variance_from_baseline_pct ?? 0;
  const forecast = Math.round(current * (1 + variance / 100));
  const previous = Math.round(current / (1 + variance / 100));
  const trend = variance > 2 ? "up" : variance < -2 ? "down" : "flat";
  const dataTransfer = Math.round(current * 0.15);
  const backupCost = Math.round(current * 0.06);
  const monitoring = Math.round(current * 0.03);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-1.5 md:grid-cols-4">
        <StatTile label="Current monthly" value={`$${current.toLocaleString()}`} />
        <StatTile label="Forecast" value={`$${forecast.toLocaleString()}`} tone={variance > 5 ? "warn" : "neutral"} />
        <StatTile label="Previous" value={`$${previous.toLocaleString()}`} />
        <StatTile label="Trend" value={`${trend} ${variance.toFixed(1)}%`} tone={variance > 5 ? "warn" : variance < -5 ? "ok" : "neutral"} />
      </div>

      <Section title="Cost breakdown" icon={<DollarSign className="h-3 w-3" />}>
        <Kv label="Data transfer" value={`$${dataTransfer}/mo`} />
        <Kv label="Backup" value={`$${backupCost}/mo`} />
        <Kv label="Monitoring" value={`$${monitoring}/mo`} />
        <Kv label="Observed (window)" value={`$${observed.toLocaleString()} — ${cost[0]?.cost_category ?? "—"}`} />
      </Section>

      <Section title="Optimization" icon={<Sparkles className="h-3 w-3" />}>
        <Kv label="Rightsizing" value={
          r.resource_type === "Ec2Instance" && current > 200
            ? <span className="text-amber-700">Consider m6i.medium (est. save $60/mo)</span>
            : <span className="text-slate-600">Utilization within recommended band</span>
        } />
        <Kv label="Savings plan" value={
          current > 100
            ? <span className="text-emerald-700">1yr no-upfront could save ~15%</span>
            : <span className="text-slate-600">Below threshold for savings plan</span>
        } />
      </Section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Tab: Changes                                                               */
/* -------------------------------------------------------------------------- */

function ChangesTab({ p }: { p: DetailsPayload }) {
  const { resource: r, changes, configurations } = p;
  const related = changes.filter((c) => c.affected_resource_ids.includes(r.id));
  const approved = related.filter((c) => c.state === "Approved" || c.state === "Scheduled" || c.state === "Complete");
  const unapproved = related.filter((c) => c.state === "Draft" || c.state === "Submitted");

  return (
    <div className="space-y-3">
      <Section title="Configuration changes" icon={<Layers className="h-3 w-3" />}>
        {configurations.length === 0 && <div className="text-slate-500">No configuration deltas recorded.</div>}
        {configurations.map((c) => (
          <Kv key={c.id}
            label={c.configuration_key}
            value={<span>{String(c.configuration_value)} <span className="text-slate-500">(baseline {String(c.baseline_value ?? "—")})</span> — {fmtDate(c.captured_at)}</span>}
          />
        ))}
      </Section>

      <Section title="AWS Config events" icon={<History className="h-3 w-3" />}>
        <Kv label="Last change" value={fmtDate(r.last_configuration_change_at)} />
        <Kv label="Last discovered" value={fmtDate(r.last_discovered_at)} />
      </Section>

      <Section title="CloudTrail events (sample)" icon={<History className="h-3 w-3" />}>
        <ul className="space-y-1 text-[10.5px] text-slate-700">
          <li>• DescribeInstances by AtlasApplicationRole — {fmtDate(r.updated_at)}</li>
          <li>• ListTagsForResource by cloudops-reader — {fmtDate(r.last_discovered_at)}</li>
          <li>• AssumeRole by ci-cd-pipeline — {fmtDate(r.last_configuration_change_at)}</li>
        </ul>
      </Section>

      <Section title={`Approved changes (${approved.length})`} icon={<CheckCircle2 className="h-3 w-3" />}>
        {approved.length === 0 && <div className="text-slate-500">None.</div>}
        {approved.map((c) => <ChangeRow key={c.id} c={c} />)}
      </Section>

      <Section title={`Unapproved changes (${unapproved.length})`} icon={<AlertOctagon className="h-3 w-3" />}>
        {unapproved.length === 0 && <div className="text-slate-500">None.</div>}
        {unapproved.map((c) => <ChangeRow key={c.id} c={c} />)}
      </Section>

      <Section title="Last rollback" icon={<History className="h-3 w-3" />}>
        <div className="text-slate-500">No rollbacks recorded in the last 30 days.</div>
      </Section>
    </div>
  );
}

function ChangeRow({ c }: { c: Change }) {
  return (
    <div className="rounded border border-slate-200 bg-white p-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-slate-800">{c.external_id}</span>
        <Badge variant="outline" className="text-[10px]">{c.state}</Badge>
      </div>
      <div className="text-[10.5px] text-slate-600">{c.title}</div>
      <div className="text-[10px] text-slate-500">{c.type} · risk {c.risk} · {fmtDate(c.planned_start)} → {fmtDate(c.planned_end)} · owner {c.owner}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Tab: Incidents                                                             */
/* -------------------------------------------------------------------------- */

function IncidentsTab({ p }: { p: DetailsPayload }) {
  const { incidents, alerts, changes } = p;
  const linkedIds = new Set(alerts.map((a) => a.incident_id).filter((x): x is string => !!x));
  const scoped = incidents.filter((i) => linkedIds.has(i.id));
  const open = scoped.filter((i) => i.status !== "Resolved");
  const history = scoped.filter((i) => i.status === "Resolved");
  const mttrMinutes = history.length
    ? Math.round(history.reduce((s, i) => s + (new Date(i.resolved_at ?? i.opened_at).getTime() - new Date(i.opened_at).getTime()) / 60000, 0) / history.length)
    : null;


  return (
    <div className="space-y-3">
      <Section title={`Open incidents (${open.length})`} icon={<ShieldAlert className="h-3 w-3" />}>
        {open.length === 0 && <div className="text-emerald-700">No open incidents on this resource.</div>}
        {open.map((i) => <IncidentRow key={i.id} inc={i} alerts={alerts} changes={changes} />)}
      </Section>
      <Section title={`Historical (${history.length})`} icon={<History className="h-3 w-3" />}>
        {history.length === 0 && <div className="text-slate-500">No historical incidents recorded.</div>}
        {history.map((i) => <IncidentRow key={i.id} inc={i} alerts={alerts} changes={changes} />)}
      </Section>
      <Section title="MTTR" icon={<Activity className="h-3 w-3" />}>
        <Kv label="Mean time to recover" value={mttrMinutes != null ? `${mttrMinutes} min` : <span className="text-slate-500">Insufficient history</span>} />
      </Section>
    </div>
  );
}

function IncidentRow({ inc, alerts, changes }: { inc: Incident; alerts: Alert[]; changes: Change[] }) {
  const linkedAlerts = alerts.filter((a) => a.incident_id === inc.id);
  const linkedChanges = changes.filter((c) => c.affected_resource_ids.length && c.id === (linkedAlerts[0]?.change_id ?? ""));
  return (
    <div className="rounded border border-slate-200 bg-white p-2">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-slate-800">{inc.external_id}</span>
        <div className="flex items-center gap-1">
          <SeverityBadge severity={inc.severity} />
          <Badge variant="outline" className="text-[10px]">{inc.status}</Badge>
        </div>
      </div>
      <div className="text-[10.5px] text-slate-700">{inc.title}</div>
      <div className="text-[10px] text-slate-500">Group: {inc.commander} · opened {fmtDate(inc.opened_at)}{inc.resolved_at ? ` · resolved ${fmtDate(inc.resolved_at)}` : ""}</div>
      {linkedAlerts.length > 0 && <div className="mt-1 text-[10px] text-slate-500">Alerts: {linkedAlerts.map((a) => a.id).join(", ")}</div>}
      {linkedChanges.length > 0 && <div className="text-[10px] text-slate-500">Changes: {linkedChanges.map((c) => c.external_id).join(", ")}</div>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Tab: Runbooks                                                              */
/* -------------------------------------------------------------------------- */

function RunbooksTab({ p, onOpen }: { p: DetailsPayload; onOpen: (name: string) => () => void }) {
  const { runbooks } = p;
  if (runbooks.length === 0) {
    return <div className="text-slate-500">No runbooks apply to this resource type.</div>;
  }
  return (
    <div className="space-y-2">
      {runbooks.map((rb) => (
        <div key={rb.id} className="rounded border border-slate-200 bg-white p-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[12px] font-medium text-slate-900">{rb.name}</div>
              <div className="text-[10.5px] text-slate-600">{rb.description}</div>
            </div>
            <Badge variant="outline" className="text-[10px]">{rb.category}</Badge>
          </div>
          <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10.5px] md:grid-cols-4">
            <Kv label="Autonomy" value={rb.autonomy_level} />
            <Kv label="Avg duration" value={`${rb.average_duration_minutes} min`} />
            <Kv label="Approvals" value={rb.approvals_required ? "Required" : "Not required"} />
            <Kv label="Rollback" value={rb.rollback_supported ? "Supported" : "Not supported"} />
            <Kv label="Fitness" value={`${rb.fitness_score}/100`} />
            <Kv label="Last certified" value={fmtDate(rb.last_certified_at)} />
          </div>
          <div className="mt-1.5">
            <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={onOpen(`Open runbook: ${rb.name}`)}>
              <ExternalLink className="mr-1 h-3 w-3" /> Open runbook summary
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Tab: Automation                                                            */
/* -------------------------------------------------------------------------- */

function AutomationTab({ p, onRun }: { p: DetailsPayload; onRun: (name: string) => () => void }) {
  const { resource: r, automations } = p;
  return (
    <div className="space-y-3">
      <Section title="Automation eligibility" icon={<PlayCircle className="h-3 w-3" />}>
        <Kv label="Eligibility" value={<span className={
          r.automation_eligibility === "Full" ? "text-emerald-700" :
          r.automation_eligibility === "None" ? "text-red-700" : "text-amber-700"
        }>{r.automation_eligibility}</span>} />
        <Kv label="Support group" value={r.support_group} />
        <Kv label="Change management" value="ServiceNow (auto-linked)" />
      </Section>

      <Section title={`Available actions (${automations.length})`} icon={<Wrench className="h-3 w-3" />}>
        {automations.length === 0 && <div className="text-slate-500">No automation actions attached to applicable runbooks.</div>}
        {automations.map((a) => (
          <div key={a.id} className="rounded border border-slate-200 bg-white p-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[12px] font-medium text-slate-800">{a.name}</span>
              <Button size="sm" variant="outline" className="h-6 text-[10.5px]" onClick={onRun(`Run automation: ${a.name}`)}>
                Run
              </Button>
            </div>
            <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10.5px] md:grid-cols-4">
              <Kv label="Approval" value={a.approval_required ? "Required" : "Auto"} />
              <Kv label="Est. duration" value={`${Math.round(a.average_duration_seconds / 60)} min`} />
              <Kv label="Rollback" value={a.rollback_supported ? "Yes" : "No"} />
              <Kv label="Last status" value={a.last_status ?? <span className="text-slate-500">Never run</span>} />
              <Kv label="Last executed" value={a.last_executed_at ? fmtDate(a.last_executed_at) : <span className="text-slate-500">—</span>} />
              <Kv label="Target type" value={prettyType(a.target_resource_type)} />
            </div>
          </div>
        ))}
      </Section>

      <Section title="Success rate (30d)" icon={<CheckCircle2 className="h-3 w-3" />}>
        <Kv label="Overall" value={<span className="text-emerald-700">96%</span>} />
        <Kv label="This runbook set" value={<span className="text-emerald-700">92%</span>} />
      </Section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Tab: Raw JSON (sanitized)                                                  */
/* -------------------------------------------------------------------------- */

function RawJsonTab({ p }: { p: DetailsPayload }) {
  const sanitized = useMemo(() => sanitizeResource(p.resource), [p.resource]);
  const json = JSON.stringify(sanitized, null, 2);
  const { toast } = useToast();
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-[10.5px] text-slate-500">
          Sanitized view — secret values, credentials, tokens, and sensitive user information are redacted.
        </div>
        <Button
          size="sm" variant="outline" className="h-6 text-[10.5px]"
          onClick={() => navigator.clipboard.writeText(json).then(
            () => toast({ title: "JSON copied" }),
            () => toast({ title: "Copy failed", variant: "destructive" }),
          )}
        >
          <Copy className="mr-1 h-3 w-3" /> Copy JSON
        </Button>
      </div>
      <pre className="max-h-[520px] overflow-auto rounded border border-slate-200 bg-slate-950 p-2 text-[10.5px] leading-relaxed text-slate-100">
        <code>{json}</code>
      </pre>
    </div>
  );
}

function sanitizeResource(r: AwsResource): unknown {
  const stripValues = r.resource_type === "SecretsManagerSecret";
  const cfg: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(r.configuration ?? {})) {
    if (isSensitiveKey(k)) { cfg[k] = "__redacted__"; continue; }
    if (stripValues && /value|payload|secret/i.test(k)) { cfg[k] = "__redacted__"; continue; }
    cfg[k] = v;
  }
  const tags: Record<string, string> = {};
  for (const [k, v] of Object.entries(r.tags ?? {})) {
    tags[k] = isSensitiveKey(k) ? "__redacted__" : v;
  }
  return {
    id: r.id,
    resource_type: r.resource_type,
    resource_name: r.resource_name,
    resource_id: r.resource_id,
    arn: r.arn,
    region: r.region,
    availability_zone: r.availability_zone,
    environment: r.environment,
    network_scope: r.network_scope,
    status: r.status,
    health_status: r.health_status,
    criticality: r.criticality,
    owner: r.owner,
    support_group: r.support_group,
    cost_center: r.cost_center,
    monthly_cost: r.monthly_cost,
    currency: r.currency,
    compliance_status: r.compliance_status,
    security_status: r.security_status,
    backup_status: r.backup_status,
    patch_status: r.patch_status,
    automation_eligibility: r.automation_eligibility,
    configuration: cfg,
    tags,
    created_at: r.created_at,
    updated_at: r.updated_at,
    last_discovered_at: r.last_discovered_at,
    last_configuration_change_at: r.last_configuration_change_at,
    __note: "Secret values, credentials, authentication tokens, and personally identifying user information are never included in this view.",
  };
}

function isSensitiveKey(k: string): boolean {
  return /(secret|password|passwd|token|credential|api[_-]?key|private[_-]?key|access[_-]?key|session|bearer|otp|pin|ssn|email|phone|user_?data)/i.test(k);
}

/* -------------------------------------------------------------------------- */
/*  Shared sub-components                                                      */
/* -------------------------------------------------------------------------- */

function Section({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="space-y-1.5">
      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {icon}<span>{title}</span>
      </div>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

function Kv({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline gap-2">
      <div className="w-[120px] shrink-0 text-[10.5px] text-slate-500">{label}</div>
      <div className="min-w-0 flex-1 text-[11.5px] text-slate-800">{value}</div>
    </div>
  );
}

function StatTile({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "ok" | "warn" | "bad" | "neutral" }) {
  const toneCls =
    tone === "ok" ? "text-emerald-700" :
    tone === "warn" ? "text-amber-700" :
    tone === "bad" ? "text-red-700" : "text-slate-900";
  return (
    <div className="rounded border border-slate-200 bg-white p-1.5">
      <div className="text-[9.5px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className={cn("mt-0.5 truncate text-[13px] font-semibold", toneCls)} title={value}>{value}</div>
    </div>
  );
}

function Th({ children }: { children: ReactNode }) {
  return <th className="px-2 py-1 text-left text-[10px] font-semibold uppercase tracking-wide">{children}</th>;
}
function Td({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cn("px-2 py-1 align-top", className)}>{children}</td>;
}

function Dot() { return <span className="text-slate-300">·</span>; }

function SeverityBadge({ severity }: { severity: Alert["severity"] }) {
  const map: Record<Alert["severity"], string> = {
    Critical: "bg-red-50 border-red-200 text-red-700",
    High:     "bg-orange-50 border-orange-200 text-orange-700",
    Medium:   "bg-amber-50 border-amber-200 text-amber-700",
    Low:      "bg-yellow-50 border-yellow-200 text-yellow-800",
    Info:     "bg-slate-50 border-slate-200 text-slate-700",
  };
  return <span className={cn("rounded border px-1 py-px text-[10px] font-semibold", map[severity])}>{severity}</span>;
}

function StatusBadge({ status }: { status: Alert["status"] }) {
  const cls =
    status === "Firing" ? "border-red-200 bg-red-50 text-red-700" :
    status === "Acknowledged" ? "border-amber-200 bg-amber-50 text-amber-700" :
    status === "Suppressed" ? "border-slate-200 bg-slate-50 text-slate-600" :
    "border-emerald-200 bg-emerald-50 text-emerald-700";
  return <span className={cn("rounded border px-1 py-px text-[10px]", cls)}>{status}</span>;
}

function ComplianceBadge({ status }: { status: AwsResource["compliance_status"] }) {
  const cls =
    status === "Compliant" ? "text-emerald-700" :
    status === "Non-Compliant" ? "text-red-700" :
    status === "Not-Applicable" ? "text-slate-500" : "text-slate-600";
  return <span className={cn("font-medium", cls)}>{status}</span>;
}

function FreshnessBadge({ status }: { status: TelemetryObservation["freshness_status"] }) {
  const cls = status === "Fresh" ? "text-emerald-700" : status === "Stale" ? "text-amber-700" : "text-red-700";
  return <span className={cls}>{status}</span>;
}

function TrendIcon({ trend }: { trend: TelemetryObservation["trend"] }) {
  if (trend === "up") return <ArrowUp className="inline h-3 w-3 text-slate-500" />;
  if (trend === "down") return <ArrowDown className="inline h-3 w-3 text-slate-500" />;
  return <MinusCircle className="inline h-3 w-3 text-slate-400" />;
}

function HealthText({ status }: { status: AwsResource["health_status"] }) {
  const cls =
    status === "Healthy" ? "text-emerald-700" :
    status === "Warning" ? "text-amber-700" :
    status === "Critical" ? "text-red-700" : "text-slate-600";
  return <span className={cn("font-medium", cls)}>{status}</span>;
}

/* -------------------------------------------------------------------------- */
/*  Utilities                                                                  */
/* -------------------------------------------------------------------------- */

function severityRank(s: Alert["severity"]): number {
  return { Critical: 5, High: 4, Medium: 3, Low: 2, Info: 1 }[s];
}
function healthTone(s: AwsResource["health_status"]) {
  return s === "Healthy" ? "ok" as const : s === "Warning" ? "warn" as const : s === "Critical" ? "bad" as const : "neutral" as const;
}
function healthScoreTone(n: number) {
  return n >= 85 ? "ok" as const : n >= 65 ? "warn" as const : "bad" as const;
}
function fmtDate(iso: string | undefined): string {
  if (!iso) return "—";
  try { return new Date(iso).toISOString().replace("T", " ").slice(0, 16) + "Z"; } catch { return iso; }
}
function durationSince(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  if (diffMs < 0) return "—";
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}m`;
  const days = Math.floor(hrs / 24);
  return `${days}d ${hrs % 24}h`;
}
function prettyType(t: string): string {
  return t
    .replace(/^Aws/, "")
    .replace(/([A-Z][a-z])/g, " $1")
    .replace(/^\s+/, "")
    .replace(/Rds/g, "RDS").replace(/Ec2/g, "EC2").replace(/Ebs/g, "EBS")
    .replace(/Efs/g, "EFS").replace(/Iam/g, "IAM").replace(/Kms/g, "KMS")
    .replace(/Vpc/g, "VPC").replace(/Alb/g, "ALB").replace(/Sns/g, "SNS")
    .replace(/Waf/g, "WAF").replace(/Ami/g, "AMI");
}
function formatValue(v: number): string {
  if (Math.abs(v) >= 1000) return v.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (Math.abs(v) >= 10) return v.toFixed(1);
  return v.toFixed(2);
}

function configSummary(r: AwsResource): { label: string; value: string }[] {
  const c = r.configuration ?? {};
  const s = (k: string) => c[k] != null ? String(c[k]) : "—";
  const out: { label: string; value: string }[] = [];
  switch (r.resource_type) {
    case "Ec2Instance":
      out.push({ label: "Instance type", value: s("instance_type") });
      out.push({ label: "OS", value: (c["os"] as string) ?? "Amazon Linux 2023" });
      break;
    case "EbsVolume":
      out.push({ label: "Type", value: s("type") });
      out.push({ label: "Size", value: `${s("size_gib")} GiB` });
      break;
    case "RdsInstance":
      out.push({ label: "Engine", value: s("engine") });
      out.push({ label: "Class", value: s("instance_class") });
      out.push({ label: "Multi-AZ", value: c["multi_az"] ? "Yes" : "No" });
      break;
    case "Alb":
      out.push({ label: "Scheme", value: s("scheme") });
      break;
    case "NatGateway":
      out.push({ label: "Elastic IP", value: s("elastic_ip") });
      break;
    case "VPC":
      out.push({ label: "CIDR", value: s("cidr") });
      break;
    default:
      out.push({ label: "Status", value: r.status });
      out.push({ label: "Network scope", value: r.network_scope });
  }
  return out;
}
