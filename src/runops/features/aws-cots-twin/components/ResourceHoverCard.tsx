/**
 * AWS COTS Digital Twin — Resource Hover Card (Prompt 4).
 *
 * One reusable hover-card component for every selectable resource on the
 * architecture canvas. Data is loaded lazily on open via the repository
 * layer. Only "Open resource details" is fully functional in this phase;
 * every other action truthfully reports it will land in a later prompt.
 */

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  HoverCard, HoverCardContent, HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Activity, AlertOctagon, ArrowDown, ArrowRight, ArrowUp, Boxes, Cog, Copy,
  ExternalLink, FlaskConical, GitBranch, History, Info, MinusCircle,
  Radius, Route as RouteIcon, ShieldAlert, Wrench,
} from "lucide-react";
import {
  getAwsCotsRepository,
  type Alert,
  type AwsResource,
  type BackupStatusRecord,
  type ComplianceFinding,
  type ResourceRelationship,
  type Runbook,
  type TelemetryDefinition,
  type TelemetryObservation,
} from "..";

/* -------------------------------------------------------------------------- */
/*  Public API                                                                 */
/* -------------------------------------------------------------------------- */

export interface ResourceHoverCardProps {
  resourceId: string;
  children: ReactNode;
  onOpenDetails?: (resourceId: string) => void;
  /** Optional label suffix used when the same physical resource is rendered
   *  multiple times on the canvas (e.g. "Primary" / "Standby" for multi-AZ). */
  roleLabel?: string;
  /** Optional AZ override for synthetic renderings. */
  availabilityZoneOverride?: string;
}

/* -------------------------------------------------------------------------- */
/*  Data loading                                                               */
/* -------------------------------------------------------------------------- */

interface HoverPayload {
  resource: AwsResource;
  relationships: ResourceRelationship[];
  telemetry: TelemetryObservation[];
  telemetryDefs: TelemetryDefinition[];
  alerts: Alert[];
  backup: BackupStatusRecord[];
  compliance: ComplianceFinding[];
  runbooks: Runbook[];
}

async function loadPayload(resourceId: string): Promise<HoverPayload | null> {
  const repo = getAwsCotsRepository();
  const resource = await repo.getResourceById(resourceId);
  if (!resource) return null;
  const [relationships, telemetry, telemetryDefs, directAlerts, backup, compliance, runbooks, allResources] = await Promise.all([
    repo.getResourceRelationships(resourceId),
    repo.getResourceTelemetry(resourceId),
    repo.getTelemetryDefinitions(),
    repo.getAlerts({ resourceId }),
    repo.getBackupStatus(resourceId),
    repo.getComplianceFindings(resourceId),
    repo.getRunbooks({ resourceType: resource.resource_type }),
    repo.getResources(),
  ]);
  // Bubble up alerts from directly attached child resources (e.g. EC2 → EBS).
  const childIds = allResources.filter((x) => x.parent_resource_id === resourceId).map((x) => x.id);
  const childAlerts = childIds.length
    ? (await Promise.all(childIds.map((id) => repo.getAlerts({ resourceId: id })))).flat()
    : [];
  const seen = new Set<string>();
  const alerts = [...directAlerts, ...childAlerts].filter((a) => (seen.has(a.id) ? false : (seen.add(a.id), true)));
  return { resource, relationships, telemetry, telemetryDefs, alerts, backup, compliance, runbooks };
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function ResourceHoverCard({
  resourceId, children, onOpenDetails, roleLabel, availabilityZoneOverride,
}: ResourceHoverCardProps) {
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState<HoverPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!open || payload) return;
    let cancelled = false;
    loadPayload(resourceId)
      .then((p) => { if (!cancelled) { if (p) setPayload(p); else setError("Resource not found"); } })
      .catch(() => { if (!cancelled) setError("Failed to load resource details"); });
    return () => { cancelled = true; };
  }, [open, resourceId, payload]);

  const deferred = (name: string) => () => {
    toast({
      title: `${name} — coming in a later phase`,
      description: "This action will be wired up alongside the resource details panel and simulation engine.",
    });
  };

  const copyArn = async (arn: string) => {
    try {
      await navigator.clipboard.writeText(arn);
      toast({ title: "ARN copied", description: arn });
    } catch {
      toast({ title: "Copy failed", description: "Clipboard unavailable.", variant: "destructive" });
    }
  };

  return (
    <HoverCard open={open} onOpenChange={setOpen} openDelay={220} closeDelay={140}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent
        side="right"
        align="start"
        sideOffset={8}
        collisionPadding={16}
        avoidCollisions
        className="w-[380px] p-0 text-slate-800"
      >
        {!payload && !error && (
          <div className="p-3 text-[12px] text-slate-500">Loading resource details…</div>
        )}
        {error && (
          <div className="p-3 text-[12px] text-red-600">{error}</div>
        )}
        {payload && (
          <HoverCardBody
            payload={payload}
            roleLabel={roleLabel}
            availabilityZoneOverride={availabilityZoneOverride}
            onCopyArn={copyArn}
            onOpenDetails={onOpenDetails ? () => onOpenDetails(payload.resource.id) : undefined}
            onDeferred={deferred}
          />
        )}
      </HoverCardContent>
    </HoverCard>
  );
}

/* -------------------------------------------------------------------------- */
/*  Body                                                                       */
/* -------------------------------------------------------------------------- */

function HoverCardBody({
  payload, roleLabel, availabilityZoneOverride, onCopyArn, onOpenDetails, onDeferred,
}: {
  payload: HoverPayload;
  roleLabel?: string;
  availabilityZoneOverride?: string;
  onCopyArn: (arn: string) => void;
  onOpenDetails?: () => void;
  onDeferred: (name: string) => () => void;
}) {
  const { resource: r, relationships, telemetry, telemetryDefs, alerts, backup, compliance, runbooks } = payload;

  const az = availabilityZoneOverride ?? r.availability_zone ?? "Regional";
  const upstream = relationships.filter((x) => x.target_resource_id === r.id);
  const downstream = relationships.filter((x) => x.source_resource_id === r.id);
  const connectedIds = new Set<string>([
    ...upstream.map((x) => x.source_resource_id),
    ...downstream.map((x) => x.target_resource_id),
  ]);
  const blastRadius = downstream.length + Math.round(connectedIds.size * 0.75); // heuristic count
  const activeAlerts = alerts.filter((a) => a.status === "Firing" || a.status === "Acknowledged");
  const topAlert = [...activeAlerts].sort((a, b) => severityRank(b.severity) - severityRank(a.severity))[0];
  const cfgAttrs = configAttrsFor(r);
  const metrics = telemetryDefs
    .filter((d) => d.resource_type === r.resource_type)
    .map((d) => ({ def: d, obs: telemetry.find((o) => o.metric_definition_id === d.id) }))
    .filter((m) => m.obs)
    .slice(0, 6);
  const bak = backup[0];
  const runbook = runbooks[0];
  const complianceStatus = pickCompliance(r.compliance_status, compliance);

  return (
    <div className="flex max-h-[560px] flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-200 bg-slate-50/70 px-3 py-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <div className="truncate text-[13px] font-semibold text-slate-900">{r.resource_name}</div>
              {roleLabel && (
                <span className="rounded border border-slate-200 bg-white px-1 py-px text-[9.5px] font-medium uppercase tracking-wide text-slate-600">
                  {roleLabel}
                </span>
              )}
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10.5px] text-slate-500">
              <span>{prettyType(r.resource_type)}</span>
              <Dot /> <HealthBadge status={r.health_status} />
              <Dot /> <span>{r.environment}</span>
              <Dot /> <span>{az}</span>
              <Dot /> <span>{r.criticality}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto px-3 py-2.5 text-[11.5px] leading-relaxed">
        {/* Identity */}
        <Section title="Identity" icon={<Info className="h-3 w-3" />}>
          <Kv label="Resource ID" value={<code className="rounded bg-slate-100 px-1 py-px text-[10.5px]">{r.resource_id}</code>} />
          <Kv label="ARN" value={
            <span className="inline-flex items-center gap-1">
              <code className="max-w-[220px] truncate rounded bg-slate-100 px-1 py-px text-[10.5px]" title={r.arn}>{abbreviateArn(r.arn)}</code>
              <button
                type="button"
                onClick={() => onCopyArn(r.arn)}
                className="grid h-4 w-4 place-items-center rounded text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                aria-label="Copy ARN"
              >
                <Copy className="h-3 w-3" />
              </button>
            </span>
          } />
          <Kv label="AWS account" value="7421-Production" />
          <Kv label="Region" value={r.region} />
          <Kv label="AZ" value={r.availability_zone ?? "Regional"} />
          <Kv label="Application" value="Atlas COTS Platform" />
          <Kv label="Business service" value="Enterprise Resource Management" />
          <Kv label="Owner" value={r.owner} />
          <Kv label="Support group" value={r.support_group} />
          <Kv label="Cost center" value={r.cost_center} />
          <Kv label="Tags" value={
            <span className="flex flex-wrap gap-1">
              {Object.entries(r.tags).slice(0, 4).map(([k, v]) => (
                <span key={k} className="inline-flex items-center rounded border border-slate-200 bg-white px-1 py-px text-[9.5px] text-slate-700">
                  <span className="text-slate-500">{k}:</span>&nbsp;<span>{v}</span>
                </span>
              ))}
            </span>
          } />
        </Section>

        {/* Configuration */}
        {cfgAttrs.length > 0 && (
          <Section title="Configuration" icon={<Cog className="h-3 w-3" />}>
            {cfgAttrs.map((a) => <Kv key={a.label} label={a.label} value={<span>{a.value}</span>} />)}
          </Section>
        )}

        {/* Telemetry */}
        {metrics.length > 0 && (
          <Section title="Telemetry" icon={<Activity className="h-3 w-3" />}>
            <div className="grid grid-cols-1 gap-1.5">
              {metrics.map(({ def, obs }) => (
                <MetricRow key={def.id} def={def} obs={obs!} />
              ))}
            </div>
          </Section>
        )}

        {/* Alerts */}
        <Section title="Alerts" icon={<AlertOctagon className="h-3 w-3" />}>
          <Kv label="Active" value={
            activeAlerts.length === 0
              ? <span className="text-emerald-700">None</span>
              : <span className="font-semibold text-red-700">{activeAlerts.length}</span>
          } />
          {topAlert && (
            <>
              <Kv label="Highest severity" value={<SeverityBadge severity={topAlert.severity} />} />
              <Kv label="Top alert" value={<span className="truncate" title={topAlert.title}>{topAlert.title}</span>} />
              <Kv label="First detected" value={fmtDate(topAlert.first_detected_at)} />
              <Kv label="Duration" value={durationSince(topAlert.first_detected_at)} />
              <Kv label="Assigned team" value={topAlert.assigned_team} />
              <Kv label="Acknowledged" value={topAlert.acknowledged_at ? "Yes" : "No"} />
            </>
          )}
        </Section>

        {/* Relationships */}
        <Section title="Relationships" icon={<GitBranch className="h-3 w-3" />}>
          <div className="grid grid-cols-4 gap-1">
            <StatTile label="Upstream" value={upstream.length} icon={<ArrowUp className="h-3 w-3" />} />
            <StatTile label="Downstream" value={downstream.length} icon={<ArrowDown className="h-3 w-3" />} />
            <StatTile label="Connected" value={connectedIds.size} icon={<ArrowRight className="h-3 w-3" />} />
            <StatTile label="Blast radius" value={blastRadius} icon={<Radius className="h-3 w-3" />} />
          </div>
        </Section>

        {/* Operations */}
        <Section title="Operations" icon={<Wrench className="h-3 w-3" />}>
          <Kv label="Last config change" value={fmtDate(r.last_configuration_change_at)} />
          <Kv label="Patch status" value={<PatchBadge status={r.patch_status} />} />
          <Kv label="Backup" value={
            bak
              ? <span>{bak.plan_name} · {fmtDate(bak.last_backup_at)} · <span className={bak.last_backup_status === "Succeeded" ? "text-emerald-700" : "text-amber-700"}>{bak.last_backup_status}</span></span>
              : <BackupBadge status={r.backup_status} />
          } />
          <Kv label="Compliance" value={<ComplianceBadge status={complianceStatus} />} />
          <Kv label="Open incidents" value={String(0)} />
          <Kv label="Open changes" value={String(0)} />
          <Kv label="Related runbook" value={runbook ? runbook.name : <span className="text-slate-500">None</span>} />
          <Kv label="Automation" value={r.automation_eligibility} />
        </Section>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-1 border-t border-slate-200 bg-slate-50/70 px-2 py-2">
        <ActionButton primary onClick={onOpenDetails} icon={<ExternalLink className="h-3 w-3" />}>Open details</ActionButton>
        <ActionButton onClick={onDeferred("Show dependencies")} icon={<GitBranch className="h-3 w-3" />}>Dependencies</ActionButton>
        <ActionButton onClick={onDeferred("Show blast radius")} icon={<Radius className="h-3 w-3" />}>Blast radius</ActionButton>
        <ActionButton onClick={onDeferred("Open telemetry")} icon={<Activity className="h-3 w-3" />}>Telemetry</ActionButton>
        <ActionButton onClick={onDeferred("View alerts")} icon={<AlertOctagon className="h-3 w-3" />}>Alerts</ActionButton>
        <ActionButton onClick={onDeferred("Config history")} icon={<History className="h-3 w-3" />}>Config</ActionButton>
        <ActionButton onClick={onDeferred("Related incidents")} icon={<ShieldAlert className="h-3 w-3" />}>Incidents</ActionButton>
        <ActionButton onClick={onDeferred("Runbook")} icon={<Boxes className="h-3 w-3" />}>Runbook</ActionButton>
        <ActionButton onClick={onDeferred("Simulate failure")} icon={<FlaskConical className="h-3 w-3" />}>Simulate</ActionButton>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                             */
/* -------------------------------------------------------------------------- */

function Section({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="mb-2.5 last:mb-0">
      <div className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {icon}<span>{title}</span>
      </div>
      <div className="space-y-0.5">{children}</div>
    </section>
  );
}

function Kv({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline gap-2">
      <div className="w-[112px] shrink-0 text-[10.5px] text-slate-500">{label}</div>
      <div className="min-w-0 flex-1 text-[11.5px] text-slate-800">{value}</div>
    </div>
  );
}

function Dot() { return <span className="text-slate-300">·</span>; }

function StatTile({ label, value, icon }: { label: string; value: number; icon: ReactNode }) {
  return (
    <div className="rounded border border-slate-200 bg-white p-1.5">
      <div className="flex items-center gap-1 text-[9.5px] uppercase tracking-wide text-slate-500">
        {icon}<span>{label}</span>
      </div>
      <div className="mt-0.5 text-[13px] font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function ActionButton({ children, onClick, icon, primary }: {
  children: ReactNode; onClick?: () => void; icon: ReactNode; primary?: boolean;
}) {
  const disabled = !onClick;
  return (
    <Button
      size="sm"
      variant={primary ? "default" : "outline"}
      disabled={disabled}
      onClick={onClick}
      className="h-6 gap-1 px-1.5 text-[10.5px] font-medium"
    >
      {icon}{children}
    </Button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Badges + formatting                                                        */
/* -------------------------------------------------------------------------- */

function HealthBadge({ status }: { status: AwsResource["health_status"] }) {
  const cls =
    status === "Healthy" ? "text-emerald-700" :
    status === "Warning" ? "text-amber-700" :
    status === "Critical" ? "text-red-700" : "text-slate-600";
  return <span className={cn("font-medium", cls)}>{status}</span>;
}

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

function severityRank(s: Alert["severity"]): number {
  return { Critical: 5, High: 4, Medium: 3, Low: 2, Info: 1 }[s];
}

function PatchBadge({ status }: { status: AwsResource["patch_status"] }) {
  const cls =
    status === "Current" ? "text-emerald-700" :
    status === "Pending" ? "text-amber-700" :
    status === "Overdue" ? "text-red-700" : "text-slate-600";
  return <span className={cls}>{status}</span>;
}

function BackupBadge({ status }: { status: AwsResource["backup_status"] }) {
  const cls =
    status === "Protected" ? "text-emerald-700" :
    status === "Partial" ? "text-amber-700" :
    status === "Unprotected" ? "text-red-700" : "text-slate-600";
  return <span className={cls}>{status}</span>;
}

function ComplianceBadge({ status }: { status: AwsResource["compliance_status"] }) {
  const cls =
    status === "Compliant" ? "text-emerald-700" :
    status === "Non-Compliant" ? "text-red-700" :
    status === "Not-Applicable" ? "text-slate-500" : "text-slate-600";
  return <span className={cls}>{status}</span>;
}

function pickCompliance(base: AwsResource["compliance_status"], findings: ComplianceFinding[]): AwsResource["compliance_status"] {
  if (findings.some((f) => f.status === "Non-Compliant")) return "Non-Compliant";
  return base;
}

function abbreviateArn(arn: string): string {
  if (arn.length <= 48) return arn;
  const parts = arn.split(":");
  if (parts.length < 6) return arn.slice(0, 24) + "…" + arn.slice(-16);
  return `${parts.slice(0, 3).join(":")}:…:${parts[parts.length - 1]}`;
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

/* -------------------------------------------------------------------------- */
/*  Metric row with sparkline                                                  */
/* -------------------------------------------------------------------------- */

function MetricRow({ def, obs }: { def: TelemetryDefinition; obs: TelemetryObservation }) {
  const points = useMemo(() => synthesizeSeries(obs.baseline_value, obs.previous_value, obs.current_value), [obs]);
  const min = Math.min(...points);
  const max = Math.max(...points, def.critical_threshold ?? -Infinity);
  const range = max - min || 1;
  const w = 60, h = 20, pad = 2;
  const stroke =
    def.critical_threshold != null && obs.current_value >= def.critical_threshold ? "#dc2626" :
    def.warning_threshold != null && obs.current_value >= def.warning_threshold ? "#d97706" : "#16a34a";
  const path = points.map((v, i) => {
    const x = pad + (i / (points.length - 1)) * (w - 2 * pad);
    const y = h - pad - ((v - min) / range) * (h - 2 * pad);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  const trendIcon = obs.trend === "up" ? <ArrowUp className="h-3 w-3 text-slate-500" /> :
                    obs.trend === "down" ? <ArrowDown className="h-3 w-3 text-slate-500" /> :
                    <MinusCircle className="h-3 w-3 text-slate-400" />;

  return (
    <div className="flex items-center gap-2 rounded border border-slate-200 bg-white px-1.5 py-1">
      <div className="min-w-0 flex-1">
        <div className="truncate text-[10.5px] text-slate-500">{def.display_name}</div>
        <div className="flex items-center gap-1 text-[11.5px]">
          <span className="font-semibold text-slate-900">{formatValue(obs.current_value)}</span>
          <span className="text-slate-500">{def.unit}</span>
          {trendIcon}
        </div>
        <div className="text-[9.5px] text-slate-500">
          {def.warning_threshold != null && <>W ≥ {def.warning_threshold}</>}
          {def.critical_threshold != null && <> · C ≥ {def.critical_threshold}</>}
          <> · {fmtDate(obs.timestamp)}</>
        </div>
      </div>
      <svg width={w} height={h} className="shrink-0" aria-hidden>
        <path d={path} stroke={stroke} strokeWidth={1.25} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function synthesizeSeries(baseline: number, previous: number, current: number): number[] {
  // Small deterministic wiggle around the seeded points so the sparkline
  // has visual shape without pretending to be real historical data.
  const pts: number[] = [];
  const start = baseline;
  const mid = previous;
  const end = current;
  const seed = Math.abs(Math.round(baseline + previous + current)) || 1;
  const rand = (i: number) => (((seed * 9301 + i * 49297) % 233280) / 233280 - 0.5) * (Math.abs(end - start) * 0.35 + 0.1);
  for (let i = 0; i < 12; i++) {
    const t = i / 11;
    const base = t < 0.5 ? start + (mid - start) * (t / 0.5) : mid + (end - mid) * ((t - 0.5) / 0.5);
    pts.push(Number((base + rand(i)).toFixed(3)));
  }
  return pts;
}

function formatValue(v: number): string {
  if (Math.abs(v) >= 1000) return v.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (Math.abs(v) >= 10) return v.toFixed(1);
  return v.toFixed(2);
}

/* -------------------------------------------------------------------------- */
/*  Configuration attribute chooser (per resource type)                        */
/* -------------------------------------------------------------------------- */

interface CfgAttr { label: string; value: string }

function configAttrsFor(r: AwsResource): CfgAttr[] {
  const c = r.configuration ?? {};
  const s = (k: string) => c[k] != null ? String(c[k]) : "—";
  const yes = (v: unknown) => v ? "Yes" : "No";

  switch (r.resource_type) {
    case "Ec2Instance":
      return [
        { label: "Instance type", value: s("instance_type") },
        { label: "Operating system", value: (c["os"] as string) ?? "Amazon Linux 2023" },
        { label: "Private IP", value: (c["private_ip"] as string) ?? "10.40.11.0/24 pool" },
        { label: "Auto Scaling group", value: "asg-atlas" },
        { label: "IAM role", value: "AtlasApplicationRole" },
        { label: "Detailed monitoring", value: yes(c["detailed_monitoring"] ?? true) },
        { label: "Systems Manager", value: "Managed" },
      ];
    case "EbsVolume":
      return [
        { label: "Volume type", value: s("type") },
        { label: "Size", value: `${s("size_gib")} GiB` },
        { label: "IOPS", value: (c["iops"] as string) ?? "3000" },
        { label: "Throughput", value: (c["throughput"] as string) ?? "125 MB/s" },
        { label: "Encryption", value: yes(c["encrypted"] ?? true) },
        { label: "Attached instance", value: r.parent_resource_id ?? "—" },
        { label: "Snapshot status", value: r.backup_status },
      ];
    case "RdsInstance":
      return [
        { label: "Engine", value: s("engine") },
        { label: "Instance class", value: s("instance_class") },
        { label: "Multi-AZ", value: yes(c["multi_az"]) },
        { label: "Allocated storage", value: `${s("storage_gib")} GiB` },
        { label: "Backup retention", value: (c["backup_retention_days"] as string) ?? "14 days" },
        { label: "Encryption", value: yes(c["encrypted"] ?? true) },
        { label: "Public accessibility", value: yes(c["publicly_accessible"] ?? false) },
      ];
    case "Alb":
      return [
        { label: "Scheme", value: s("scheme") },
        { label: "Listener", value: "HTTPS 443" },
        { label: "Target group", value: "alb-tg-app" },
        { label: "Healthy targets", value: "3 / 4" },
        { label: "Security group", value: "sg-alb" },
        { label: "TLS policy", value: (c["tls_policy"] as string) ?? "ELBSecurityPolicy-TLS13-1-2-2021-06" },
      ];
    case "VPC":
      return [
        { label: "CIDR", value: s("cidr") },
        { label: "Subnets", value: "6 (2 public, 2 app, 2 db)" },
        { label: "Flow Logs", value: (c["flow_logs"] as string) ?? "Enabled → /atlas/vpc-flow" },
        { label: "DNS support", value: yes(c["dns_support"] ?? true) },
        { label: "Endpoint count", value: "6" },
      ];
    case "AlbTargetGroup":
      return [
        { label: "Protocol", value: "HTTP" },
        { label: "Port", value: "8080" },
        { label: "Health check", value: "/healthz" },
        { label: "Healthy targets", value: "3 / 4" },
        { label: "Deregistration delay", value: "30s" },
      ];
    case "NatGateway":
      return [
        { label: "Elastic IP", value: s("elastic_ip") },
        { label: "State", value: "available" },
        { label: "Connectivity", value: "public" },
      ];
    case "AutoScalingGroup":
      return [
        { label: "Min", value: s("min") },
        { label: "Max", value: s("max") },
        { label: "Desired", value: s("desired") },
        { label: "Launch template", value: "lt-atlas" },
        { label: "Health check", value: "ELB" },
      ];
    case "S3Bucket":
      return [
        { label: "Versioning", value: "Enabled" },
        { label: "Default encryption", value: "SSE-KMS (Atlas KMS)" },
        { label: "Public access", value: "Blocked" },
        { label: "Lifecycle rules", value: "1 (Glacier after 90d)" },
      ];
    case "WafWebAcl":
      return [
        { label: "Managed rule groups", value: "Common, KnownBadInputs, SQLi" },
        { label: "Rate-based rules", value: "1" },
        { label: "Default action", value: "Allow" },
        { label: "Association", value: "alb-atlas" },
      ];
    case "SecretsManagerSecret":
      return [
        { label: "Rotation", value: "Enabled · 30d" },
        { label: "Version stages", value: "AWSCURRENT, AWSPREVIOUS" },
        { label: "KMS key", value: "kms-atlas" },
      ];
    case "KmsKey":
      return [
        { label: "Rotation enabled", value: yes(c["rotation_enabled"]) },
        { label: "Key spec", value: "SYMMETRIC_DEFAULT" },
        { label: "Usage", value: "ENCRYPT_DECRYPT" },
      ];
    case "AcmCertificate":
      return [
        { label: "Domain", value: "*.erm.meridian.example" },
        { label: "Expires", value: s("expires") },
        { label: "Validation", value: "DNS · issued" },
      ];
    default:
      return [
        { label: "Status", value: r.status },
        { label: "Network scope", value: r.network_scope },
        { label: "Backup", value: r.backup_status },
      ];
  }
}
