/**
 * AWS COTS Digital Twin — Architecture Canvas (Prompt 3).
 *
 * Interactive 2D topology built on React Flow 11. Nested boundaries model
 * Enterprise → AWS Account → Region → VPC → Availability Zone → Subnet.
 * Regional resources sit outside AZ boundaries; AZ-specific resources sit
 * inside their subnet + AZ. Traffic flow is animated; secondary dependency
 * edges are hidden by default and revealed via progressive disclosure.
 *
 * UI-only. All data is loaded via `getAwsCotsRepository()` — this file never
 * imports seeded data directly.
 */

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  MarkerType,
  MiniMap,
  Node,
  NodeProps,
  Panel,
  ReactFlowInstance,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  Activity, AlertOctagon, AlertTriangle, Boxes, CheckCircle2, Cloud, Cog,
  Database, Eye, EyeOff, Globe, HardDrive, Key, Layers, Lock, Mail,
  Maximize, Minimize, Network, RotateCcw, Route as RouteIcon, Server,
  Shield, ShieldAlert, Users, Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  getAwsCotsRepository,
  type AwsResource,
  type AwsResourceType,
  type HealthStatus,
  type ResourceRelationship,
} from "..";
import { ResourceHoverCard } from "./ResourceHoverCard";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface ArchitectureCanvasProps {
  selectedResourceId: string | null;
  onSelectResource: (id: string | null) => void;
  onSelectRelationship?: (id: string | null) => void;
  /** Fires the "Open resource details" action from the hover card. */
  onOpenResourceDetails?: (id: string) => void;
}

type CanvasHealth =
  | "Healthy" | "Warning" | "Critical" | "Unknown"
  | "Maintenance" | "Degraded" | "Failed over";

interface ResourceNodeData {
  resource: AwsResource | SyntheticResource;
  health: CanvasHealth;
  azLabel: string;
  alertCount: number;
  selected: boolean;
  onOpenDetails?: (id: string) => void;
  roleLabel?: string;
}

interface BoundaryNodeData {
  label: string;
  sublabel?: string;
  kind: "enterprise" | "account" | "region" | "vpc" | "az" | "subnet-public" | "subnet-app" | "subnet-db" | "shared" | "regional" | "external";
  icon?: React.ComponentType<{ className?: string }>;
}

/** Rendered-only nodes not present in the repository (e.g. the Internet cloud
 *  and per-AZ visual representations of the shared multi-AZ RDS). */
interface SyntheticResource {
  __synthetic: true;
  id: string;
  resource_id: string;      // The real resource ID this node routes selection to
  resource_type: AwsResourceType | "Internet";
  resource_name: string;
  availability_zone?: string;
  health_status: HealthStatus;
  alert_count?: number;
  synthetic_role?: string;  // "Primary", "Standby", "Internet"
}

/* -------------------------------------------------------------------------- */
/*  Icon + health mapping                                                      */
/* -------------------------------------------------------------------------- */

const ICONS_BY_TYPE: Partial<Record<AwsResourceType | "Internet", React.ComponentType<{ className?: string }>>> = {
  Internet: Globe,
  Route53HostedZone: RouteIcon,
  Route53Record: RouteIcon,
  WafWebAcl: Shield,
  Alb: Network,
  AlbListener: Network,
  AlbTargetGroup: Layers,
  AcmCertificate: Lock,
  AutoScalingGroup: Boxes,
  LaunchTemplate: Cog,
  Ami: HardDrive,
  Ec2Instance: Server,
  EbsVolume: HardDrive,
  Efs: HardDrive,
  S3Bucket: Database,
  RdsInstance: Database,
  RdsSubnetGroup: Database,
  IamRole: Users,
  SecretsManagerSecret: Key,
  KmsKey: Key,
  SecurityHub: ShieldAlert,
  GuardDuty: ShieldAlert,
  SystemsManager: Wrench,
  CloudWatch: Activity,
  CloudWatchLogGroup: Activity,
  CloudWatchAlarm: AlertOctagon,
  CloudTrail: Eye,
  AwsConfig: Cog,
  AwsBackup: Database,
  SnsTopic: Mail,
  EventBridgeBus: Activity,
  EventBridgeRule: Activity,
  NatGateway: Network,
  VpcEndpoint: Network,
  ExternalDependency: Cloud,
};

function iconFor(t: AwsResourceType | "Internet") {
  return ICONS_BY_TYPE[t] ?? Cloud;
}

const HEALTH_STYLES: Record<CanvasHealth, {
  border: string; ring: string; badge: string; label: string; dot: string;
  borderStyle: "solid" | "dashed" | "dotted";
  marker: React.ComponentType<{ className?: string }>;
}> = {
  Healthy:      { border: "border-emerald-400", ring: "ring-emerald-100", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Healthy",     dot: "bg-emerald-500", borderStyle: "solid",  marker: CheckCircle2 },
  Warning:      { border: "border-amber-400",   ring: "ring-amber-100",   badge: "bg-amber-50 text-amber-700 border-amber-200",       label: "Warning",     dot: "bg-amber-500",   borderStyle: "dashed", marker: AlertTriangle },
  Critical:     { border: "border-red-500",     ring: "ring-red-100",     badge: "bg-red-50 text-red-700 border-red-200",             label: "Critical",    dot: "bg-red-500",     borderStyle: "solid",  marker: AlertOctagon },
  Degraded:     { border: "border-orange-400",  ring: "ring-orange-100",  badge: "bg-orange-50 text-orange-700 border-orange-200",    label: "Degraded",    dot: "bg-orange-500",  borderStyle: "dashed", marker: AlertTriangle },
  Maintenance:  { border: "border-blue-400",    ring: "ring-blue-100",    badge: "bg-blue-50 text-blue-700 border-blue-200",          label: "Maintenance", dot: "bg-blue-500",    borderStyle: "dashed", marker: Wrench },
  "Failed over":{ border: "border-purple-400",  ring: "ring-purple-100",  badge: "bg-purple-50 text-purple-700 border-purple-200",    label: "Failed over", dot: "bg-purple-500",  borderStyle: "dashed", marker: RotateCcw },
  Unknown:      { border: "border-slate-300",   ring: "ring-slate-100",   badge: "bg-slate-50 text-slate-600 border-slate-200",       label: "Unknown",     dot: "bg-slate-400",   borderStyle: "dotted", marker: AlertTriangle },
};

/* -------------------------------------------------------------------------- */
/*  Boundary node                                                              */
/* -------------------------------------------------------------------------- */

const BOUNDARY_STYLES: Record<BoundaryNodeData["kind"], { border: string; bg: string; label: string }> = {
  enterprise:    { border: "border-slate-400 border-dashed",  bg: "bg-white",           label: "text-slate-700" },
  external:      { border: "border-slate-300 border-dashed",  bg: "bg-slate-50/60",     label: "text-slate-600" },
  account:       { border: "border-orange-400 border-dashed", bg: "bg-orange-50/40",    label: "text-orange-700" },
  region:        { border: "border-orange-300",               bg: "bg-white",           label: "text-orange-700" },
  regional:      { border: "border-slate-200",                bg: "bg-slate-50/40",     label: "text-slate-600" },
  vpc:           { border: "border-emerald-400",              bg: "bg-emerald-50/30",   label: "text-emerald-700" },
  az:            { border: "border-sky-400 border-dashed",    bg: "bg-sky-50/40",       label: "text-sky-700" },
  "subnet-public": { border: "border-teal-300",               bg: "bg-teal-50/30",      label: "text-teal-700" },
  "subnet-app":    { border: "border-indigo-300",             bg: "bg-indigo-50/30",    label: "text-indigo-700" },
  "subnet-db":     { border: "border-rose-300",               bg: "bg-rose-50/30",      label: "text-rose-700" },
  shared:        { border: "border-slate-300",                bg: "bg-slate-50/40",     label: "text-slate-600" },
};

const BoundaryNode = memo(function BoundaryNode({ data }: NodeProps<BoundaryNodeData>) {
  const s = BOUNDARY_STYLES[data.kind];
  const Icon = data.icon;
  return (
    <div className={cn("h-full w-full rounded-md border-[1.5px]", s.border, s.bg)}>
      <div className={cn("flex items-center gap-1.5 px-2 pt-1.5 text-[10.5px] font-semibold uppercase tracking-wider", s.label)}>
        {Icon && <Icon className="h-3 w-3" />}
        <span>{data.label}</span>
        {data.sublabel && (
          <span className="ml-1 rounded bg-white/70 px-1 py-px text-[9.5px] font-normal normal-case tracking-normal text-slate-500">
            {data.sublabel}
          </span>
        )}
      </div>
    </div>
  );
});

/* -------------------------------------------------------------------------- */
/*  Resource node                                                              */
/* -------------------------------------------------------------------------- */

const ResourceNode = memo(function ResourceNode({ data }: NodeProps<ResourceNodeData>) {
  const r = data.resource;
  const styles = HEALTH_STYLES[data.health];
  const Icon = iconFor(r.resource_type as AwsResourceType | "Internet");
  const Marker = styles.marker;
  const isSynth = "__synthetic" in r;
  const roleTag = isSynth && r.synthetic_role ? r.synthetic_role : undefined;
  const realId = isSynth ? (r as SyntheticResource).resource_id : r.id;

  const card = (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${r.resource_name}, ${data.health}${data.alertCount ? `, ${data.alertCount} alerts` : ""}`}
      className={cn(
        "group relative flex h-full w-full flex-col rounded-md border bg-white px-2 py-1.5 shadow-sm transition-all",
        "hover:shadow-md hover:-translate-y-[0.5px]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-1",
        styles.border,
        styles.borderStyle === "dashed" && "border-dashed",
        styles.borderStyle === "dotted" && "border-dotted",
        data.selected && cn("ring-2 ring-offset-1", styles.ring, "ring-offset-white border-slate-900"),
      )}
      title={`${r.resource_name} — ${data.health}`}
    >
      <div className="flex items-center justify-between gap-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 shrink-0 text-slate-500" />
          <div className="truncate text-[11px] font-semibold text-slate-900">{r.resource_name}</div>
        </div>
        <Marker className={cn("h-3 w-3 shrink-0",
          data.health === "Healthy" ? "text-emerald-500" :
          data.health === "Warning" ? "text-amber-500" :
          data.health === "Critical" ? "text-red-500" :
          data.health === "Degraded" ? "text-orange-500" :
          data.health === "Failed over" ? "text-purple-500" :
          data.health === "Maintenance" ? "text-blue-500" : "text-slate-400")}
        />
      </div>
      <div className="mt-0.5 flex items-center justify-between gap-1 text-[9.5px] text-slate-500">
        <span className="truncate">{prettyType(r.resource_type)}{roleTag ? ` · ${roleTag}` : ""}</span>
        <span className="shrink-0">{data.azLabel}</span>
      </div>
      <div className="mt-0.5 flex items-center gap-1">
        <span className={cn("inline-flex items-center gap-0.5 rounded border px-1 py-px text-[9px] font-medium", styles.badge)}>
          <span className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} aria-hidden />
          {styles.label}
        </span>
        {data.alertCount > 0 && (
          <span className="inline-flex items-center gap-0.5 rounded border border-red-200 bg-red-50 px-1 py-px text-[9px] font-semibold text-red-700">
            <AlertOctagon className="h-2.5 w-2.5" /> {data.alertCount}
          </span>
        )}
      </div>
    </div>
  );

  // "Internet" is a purely visual anchor with no repository record — skip
  // the hover card for it so we don't fire a lookup that will 404.
  if (r.resource_type === "Internet") return card;

  return (
    <ResourceHoverCard
      resourceId={realId}
      roleLabel={data.roleLabel ?? roleTag}
      onOpenDetails={data.onOpenDetails}
    >
      {card}
    </ResourceHoverCard>
  );
});

function prettyType(t: string): string {
  return t
    .replace(/^Aws/, "")
    .replace(/([A-Z][a-z])/g, " $1")
    .replace(/^\s+/, "")
    .replace(/Rds/g, "RDS")
    .replace(/Ec2/g, "EC2")
    .replace(/Ebs/g, "EBS")
    .replace(/Efs/g, "EFS")
    .replace(/Iam/g, "IAM")
    .replace(/Kms/g, "KMS")
    .replace(/Vpc/g, "VPC")
    .replace(/Alb/g, "ALB")
    .replace(/Sns/g, "SNS")
    .replace(/Waf/g, "WAF")
    .replace(/Ami/g, "AMI");
}

const NODE_TYPES = { resource: ResourceNode, boundary: BoundaryNode };

/* -------------------------------------------------------------------------- */
/*  Static layout (positions are child-of-parent when `parentNode` is set).    */
/* -------------------------------------------------------------------------- */

// Boundary geometry (all positions are within the parent node)
const GEOM = {
  enterprise: { x: 0,    y: 0,   w: 1800, h: 1220 },
  externals:  { x: 20,   y: 40,  w: 200,  h: 500 },
  account:    { x: 240,  y: 40,  w: 1540, h: 1160 },
  region:     { x: 12,   y: 32,  w: 1516, h: 1120 },
  regional:   { x: 12,   y: 30,  w: 1492, h: 168 },
  vpc:        { x: 12,   y: 210, w: 1180, h: 900 },
  azA:        { x: 12,   y: 32,  w: 560,  h: 852 },
  azB:        { x: 600,  y: 32,  w: 560,  h: 852 },
  subnetPub:  { y: 30,   h: 110 },
  subnetApp:  { y: 150,  h: 380 },
  subnetDb:   { y: 540,  h: 300 },
  shared:     { x: 1200, y: 210, w: 316,  h: 900 },
} as const;

const NODE_W = 168;
const NODE_H = 62;

/** Compute (parentId, x, y) placement for a real or synthetic resource. */
type Placement = { id: string; parentId?: string; x: number; y: number; w?: number; h?: number };

function tile(items: string[], colW: number, cols: number, startX = 12, startY = 30, gapX = 12, gapY = 12): Record<string, { x: number; y: number }> {
  const out: Record<string, { x: number; y: number }> = {};
  items.forEach((id, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    out[id] = {
      x: startX + col * (colW + gapX),
      y: startY + row * (NODE_H + gapY),
    };
  });
  return out;
}

/* -------------------------------------------------------------------------- */
/*  Canvas                                                                     */
/* -------------------------------------------------------------------------- */

export function ArchitectureCanvas(props: ArchitectureCanvasProps) {
  return (
    <ReactFlowProvider>
      <ArchitectureCanvasInner {...props} />
    </ReactFlowProvider>
  );
}

function ArchitectureCanvasInner({ selectedResourceId, onSelectResource, onSelectRelationship }: ArchitectureCanvasProps) {
  const [resources, setResources] = useState<AwsResource[]>([]);
  const [relationships, setRelationships] = useState<ResourceRelationship[]>([]);
  const [alertCountByResource, setAlertCountByResource] = useState<Record<string, number>>({});
  const [loaded, setLoaded] = useState(false);

  const [showDependencies, setShowDependencies] = useState(false);
  const [showObservability, setShowObservability] = useState(false);
  const [zoom, setZoom] = useState(1);

  const rfRef = useRef<ReactFlowInstance | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFull, setIsFull] = useState(false);

  useEffect(() => {
    const on = () => setIsFull(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", on);
    return () => document.removeEventListener("fullscreenchange", on);
  }, []);

  useEffect(() => {
    const repo = getAwsCotsRepository();
    Promise.all([repo.getResources(), repo.getResourceRelationships(), repo.getAlerts({ status: "Firing" })])
      .then(([res, rels, alerts]) => {
        setResources(res);
        setRelationships(rels);
        const map: Record<string, number> = {};
        for (const a of alerts) map[a.resource_id] = (map[a.resource_id] ?? 0) + 1;
        setAlertCountByResource(map);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const byId = useMemo(() => new Map(resources.map((r) => [r.id, r])), [resources]);

  /* ----------------------------- Build boundaries -------------------------- */

  const boundaryNodes: Node<BoundaryNodeData>[] = useMemo(() => [
    { id: "b.enterprise", type: "boundary", position: { x: GEOM.enterprise.x, y: GEOM.enterprise.y }, style: { width: GEOM.enterprise.w, height: GEOM.enterprise.h, zIndex: 0 }, data: { kind: "enterprise", label: "Meridian Enterprise", icon: Layers }, draggable: false, selectable: false, zIndex: 0 },
    { id: "b.externals",  type: "boundary", parentNode: "b.enterprise", extent: "parent", position: { x: GEOM.externals.x, y: GEOM.externals.y }, style: { width: GEOM.externals.w, height: GEOM.externals.h, zIndex: 1 }, data: { kind: "external", label: "External Systems", icon: Globe }, draggable: false, selectable: false, zIndex: 1 },
    { id: "b.account",    type: "boundary", parentNode: "b.enterprise", extent: "parent", position: { x: GEOM.account.x, y: GEOM.account.y }, style: { width: GEOM.account.w, height: GEOM.account.h, zIndex: 1 }, data: { kind: "account", label: "AWS Account · 7421-Production (742198563210)", icon: Cloud }, draggable: false, selectable: false, zIndex: 1 },
    { id: "b.region",     type: "boundary", parentNode: "b.account", extent: "parent", position: { x: GEOM.region.x, y: GEOM.region.y }, style: { width: GEOM.region.w, height: GEOM.region.h, zIndex: 2 }, data: { kind: "region", label: "Region · us-east-1 (N. Virginia)", icon: RouteIcon }, draggable: false, selectable: false, zIndex: 2 },
    { id: "b.regional",   type: "boundary", parentNode: "b.region", extent: "parent", position: { x: GEOM.regional.x, y: GEOM.regional.y }, style: { width: GEOM.regional.w, height: GEOM.regional.h, zIndex: 3 }, data: { kind: "regional", label: "Regional Edge & Shared Services" }, draggable: false, selectable: false, zIndex: 3 },
    { id: "b.vpc",        type: "boundary", parentNode: "b.region", extent: "parent", position: { x: GEOM.vpc.x, y: GEOM.vpc.y }, style: { width: GEOM.vpc.w, height: GEOM.vpc.h, zIndex: 3 }, data: { kind: "vpc", label: "VPC · Atlas Production VPC", sublabel: "10.40.0.0/16" }, draggable: false, selectable: false, zIndex: 3 },
    { id: "b.shared",     type: "boundary", parentNode: "b.region", extent: "parent", position: { x: GEOM.shared.x, y: GEOM.shared.y }, style: { width: GEOM.shared.w, height: GEOM.shared.h, zIndex: 3 }, data: { kind: "shared", label: "Shared Application Resources" }, draggable: false, selectable: false, zIndex: 3 },
    { id: "b.az.a",       type: "boundary", parentNode: "b.vpc", extent: "parent", position: { x: GEOM.azA.x, y: GEOM.azA.y }, style: { width: GEOM.azA.w, height: GEOM.azA.h, zIndex: 4 }, data: { kind: "az", label: "Availability Zone A · us-east-1a" }, draggable: false, selectable: false, zIndex: 4 },
    { id: "b.az.b",       type: "boundary", parentNode: "b.vpc", extent: "parent", position: { x: GEOM.azB.x, y: GEOM.azB.y }, style: { width: GEOM.azB.w, height: GEOM.azB.h, zIndex: 4 }, data: { kind: "az", label: "Availability Zone B · us-east-1b" }, draggable: false, selectable: false, zIndex: 4 },

    // Subnets inside AZ-A
    { id: "b.sub.pub-a", type: "boundary", parentNode: "b.az.a", extent: "parent", position: { x: 12, y: GEOM.subnetPub.y }, style: { width: GEOM.azA.w - 24, height: GEOM.subnetPub.h, zIndex: 5 }, data: { kind: "subnet-public", label: "Public Subnet A", sublabel: "10.40.1.0/24" }, draggable: false, selectable: false, zIndex: 5 },
    { id: "b.sub.app-a", type: "boundary", parentNode: "b.az.a", extent: "parent", position: { x: 12, y: GEOM.subnetApp.y }, style: { width: GEOM.azA.w - 24, height: GEOM.subnetApp.h, zIndex: 5 }, data: { kind: "subnet-app", label: "Private Application Subnet A", sublabel: "10.40.11.0/24" }, draggable: false, selectable: false, zIndex: 5 },
    { id: "b.sub.db-a",  type: "boundary", parentNode: "b.az.a", extent: "parent", position: { x: 12, y: GEOM.subnetDb.y }, style: { width: GEOM.azA.w - 24, height: GEOM.subnetDb.h, zIndex: 5 }, data: { kind: "subnet-db", label: "Private Database Subnet A", sublabel: "10.40.21.0/24" }, draggable: false, selectable: false, zIndex: 5 },

    // Subnets inside AZ-B
    { id: "b.sub.pub-b", type: "boundary", parentNode: "b.az.b", extent: "parent", position: { x: 12, y: GEOM.subnetPub.y }, style: { width: GEOM.azB.w - 24, height: GEOM.subnetPub.h, zIndex: 5 }, data: { kind: "subnet-public", label: "Public Subnet B", sublabel: "10.40.2.0/24" }, draggable: false, selectable: false, zIndex: 5 },
    { id: "b.sub.app-b", type: "boundary", parentNode: "b.az.b", extent: "parent", position: { x: 12, y: GEOM.subnetApp.y }, style: { width: GEOM.azB.w - 24, height: GEOM.subnetApp.h, zIndex: 5 }, data: { kind: "subnet-app", label: "Private Application Subnet B", sublabel: "10.40.12.0/24" }, draggable: false, selectable: false, zIndex: 5 },
    { id: "b.sub.db-b",  type: "boundary", parentNode: "b.az.b", extent: "parent", position: { x: 12, y: GEOM.subnetDb.y }, style: { width: GEOM.azB.w - 24, height: GEOM.subnetDb.h, zIndex: 5 }, data: { kind: "subnet-db", label: "Private Database Subnet B", sublabel: "10.40.22.0/24" }, draggable: false, selectable: false, zIndex: 5 },
  ], []);

  /* ----------------------------- Placement plan ---------------------------- */

  const placements: Placement[] = useMemo(() => {
    const p: Placement[] = [];

    // Externals column (top-down)
    const externals = ["__internet", "ext-ad", "ext-smtp", "ext-itsm"];
    externals.forEach((id, i) => p.push({ id, parentId: "b.externals", x: 12, y: 30 + i * (NODE_H + 18) }));

    // Regional edge & shared services (two rows × up to 7)
    const regional = [
      "r53-zone", "waf-web-acl", "alb-atlas", "acm-cert", "cw", "cloudtrail", "aws-config",
      "sec-hub", "guardduty", "aws-backup", "sns-ops", "eb-bus", "kms-atlas", "secret-atlas-db",
    ];
    const tiles = tile(regional, NODE_W, 7, 12, 30, 12, 8);
    regional.forEach((id) => p.push({ id, parentId: "b.regional", x: tiles[id].x, y: tiles[id].y }));

    // Public subnets
    p.push({ id: "nat-a", parentId: "b.sub.pub-a", x: 12, y: 34 });
    p.push({ id: "nat-b", parentId: "b.sub.pub-b", x: 12, y: 34 });

    // App subnets — 2 EC2 side-by-side with EBS below
    const azAppLayout = [
      { id: "ec2-a1", x: 12,  y: 34, parent: "b.sub.app-a" },
      { id: "ec2-a2", x: 196, y: 34, parent: "b.sub.app-a" },
      { id: "ebs-a1", x: 12,  y: 116, parent: "b.sub.app-a" },
      { id: "ebs-a2", x: 196, y: 116, parent: "b.sub.app-a" },
      { id: "ec2-b1", x: 12,  y: 34, parent: "b.sub.app-b" },
      { id: "ec2-b2", x: 196, y: 34, parent: "b.sub.app-b" },
      { id: "ebs-b1", x: 12,  y: 116, parent: "b.sub.app-b" },
      { id: "ebs-b2", x: 196, y: 116, parent: "b.sub.app-b" },
    ];
    azAppLayout.forEach((n) => p.push({ id: n.id, parentId: n.parent, x: n.x, y: n.y }));

    // DB subnets — synthetic primary/standby cards for the multi-AZ RDS
    p.push({ id: "__rds-primary", parentId: "b.sub.db-a", x: 12, y: 40 });
    p.push({ id: "__rds-standby", parentId: "b.sub.db-b", x: 12, y: 40 });

    // Shared column (single column, 8 rows)
    const shared = ["asg-atlas", "lt-atlas", "ami-golden", "alb-tg-app", "efs-atlas", "s3-atlas", "iam-app-role", "ssm", "__vpc-endpoints"];
    shared.forEach((id, i) => p.push({ id, parentId: "b.shared", x: 12, y: 30 + i * (NODE_H + 14) }));

    return p;
  }, []);

  /* ----------------------------- Synthetic nodes --------------------------- */

  const syntheticById = useMemo<Record<string, SyntheticResource>>(() => ({
    __internet: {
      __synthetic: true, id: "__internet", resource_id: "__internet", resource_type: "Internet",
      resource_name: "Internet", health_status: "Healthy", synthetic_role: "Public",
    },
    __rds_primary_marker: {
      __synthetic: true, id: "__rds-primary", resource_id: "rds-atlas", resource_type: "RdsInstance",
      resource_name: "Atlas RDS (Primary)", availability_zone: "us-east-1a",
      health_status: "Healthy", synthetic_role: "Primary",
    },
    __rds_standby_marker: {
      __synthetic: true, id: "__rds-standby", resource_id: "rds-atlas", resource_type: "RdsInstance",
      resource_name: "Atlas RDS (Standby)", availability_zone: "us-east-1b",
      health_status: "Healthy", synthetic_role: "Standby",
    },
    __vpc_endpoints_marker: {
      __synthetic: true, id: "__vpc-endpoints", resource_id: "vpce-s3", resource_type: "VpcEndpoint",
      resource_name: "VPC Endpoints (S3, SSM, Secrets, Logs)", health_status: "Healthy",
    },
  }), []);

  /* ----------------------------- Resource nodes ---------------------------- */

  const resourceNodes: Node<ResourceNodeData>[] = useMemo(() => {
    if (!loaded) return [];
    return placements.map((pl) => {
      let res: AwsResource | SyntheticResource | undefined = byId.get(pl.id);
      if (!res) {
        // synthetic lookups
        if (pl.id === "__internet") res = syntheticById.__internet;
        else if (pl.id === "__rds-primary") res = syntheticById.__rds_primary_marker;
        else if (pl.id === "__rds-standby") res = syntheticById.__rds_standby_marker;
        else if (pl.id === "__vpc-endpoints") res = syntheticById.__vpc_endpoints_marker;
      }
      if (!res) return null;

      const isSynth = "__synthetic" in res;
      const targetId = isSynth ? (res as SyntheticResource).resource_id : res.id;
      const alertCount = alertCountByResource[targetId] ?? 0;
      const health: CanvasHealth = (res.health_status ?? "Unknown") as CanvasHealth;
      const azLabel = res.availability_zone
        ? res.availability_zone.toUpperCase().replace("US-EAST-1", "AZ ")
        : "Regional";

      const node: Node<ResourceNodeData> = {
        id: pl.id,
        type: "resource",
        parentNode: pl.parentId,
        extent: pl.parentId ? "parent" : undefined,
        position: { x: pl.x, y: pl.y },
        style: { width: pl.w ?? NODE_W, height: pl.h ?? NODE_H, zIndex: 10 },
        zIndex: 10,
        draggable: false,
        selectable: true,
        data: {
          resource: res,
          health,
          azLabel,
          alertCount,
          selected: selectedResourceId === targetId,
        },
      };
      return node;
    }).filter(Boolean) as Node<ResourceNodeData>[];
  }, [placements, byId, syntheticById, loaded, alertCountByResource, selectedResourceId]);

  const allNodes = useMemo<Node[]>(() => [...boundaryNodes, ...resourceNodes], [boundaryNodes, resourceNodes]);
  const [nodes, setNodes, onNodesChange] = useNodesState<any>(allNodes);
  useEffect(() => { setNodes(allNodes); }, [allNodes, setNodes]);

  /* ----------------------------- Edges ------------------------------------ */

  const edges = useMemo<Edge[]>(() => {
    const list: Edge[] = [];

    // --- Primary traffic flow (always animated) --------------------------
    const traffic: Array<[string, string, string, string?]> = [
      ["__internet", "r53-zone", "DNS", "HTTPS"],
      ["r53-zone", "waf-web-acl", "Resolve", "HTTPS"],
      ["waf-web-acl", "alb-atlas", "Filter", "HTTPS/443"],
      ["alb-atlas", "alb-tg-app", "Route", "HTTPS/443"],
      ["alb-tg-app", "ec2-a1", "Forward", "HTTP/8080"],
      ["alb-tg-app", "ec2-a2", "Forward", "HTTP/8080"],
      ["alb-tg-app", "ec2-b1", "Forward", "HTTP/8080"],
      ["alb-tg-app", "ec2-b2", "Forward", "HTTP/8080"],
      ["ec2-a1", "__rds-primary", "SQL", "TCP/5432"],
      ["ec2-a2", "__rds-primary", "SQL", "TCP/5432"],
      ["ec2-b1", "__rds-primary", "SQL", "TCP/5432"],
      ["ec2-b2", "__rds-primary", "SQL", "TCP/5432"],
    ];
    traffic.forEach(([s, t, label, sub]) => {
      list.push({
        id: `e.traffic.${s}->${t}`,
        source: s,
        target: t,
        animated: true,
        label: `${label}${sub ? ` · ${sub}` : ""}`,
        labelStyle: { fill: "#0f172a", fontSize: 10, fontWeight: 500 },
        labelBgStyle: { fill: "#f8fafc", opacity: 0.9 },
        labelBgPadding: [3, 2],
        labelBgBorderRadius: 3,
        style: { stroke: "#0284c7", strokeWidth: 1.75 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#0284c7", width: 14, height: 14 },
        data: { kind: "traffic" },
      });
    });

    // Multi-AZ RDS failover marker
    list.push({
      id: "e.rds.failover",
      source: "__rds-primary",
      target: "__rds-standby",
      animated: false,
      label: "Multi-AZ · sync replication",
      labelStyle: { fill: "#7e22ce", fontSize: 10, fontWeight: 500 },
      labelBgStyle: { fill: "#faf5ff", opacity: 0.9 },
      labelBgPadding: [3, 2],
      labelBgBorderRadius: 3,
      style: { stroke: "#a855f7", strokeWidth: 1.5, strokeDasharray: "6 3" },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#a855f7" },
      data: { kind: "failover" },
    });

    // --- Dependency edges (progressive disclosure) ------------------------
    if (showDependencies) {
      const deps: Array<[string, string, string, string]> = [
        // EC2 → EBS
        ["ec2-a1", "ebs-a1", "Attached", "root vol"],
        ["ec2-a2", "ebs-a2", "Attached", "root vol"],
        ["ec2-b1", "ebs-b1", "Attached", "root vol"],
        ["ec2-b2", "ebs-b2", "Attached", "root vol"],
        // EC2 → EFS (represent all 4 via one aggregated line from each EC2)
        ["ec2-a1", "efs-atlas", "Mount", "NFS"],
        ["ec2-a2", "efs-atlas", "Mount", "NFS"],
        ["ec2-b1", "efs-atlas", "Mount", "NFS"],
        ["ec2-b2", "efs-atlas", "Mount", "NFS"],
        // EC2 → Secrets
        ["ec2-a1", "secret-atlas-db", "Read", "secret"],
        ["ec2-a2", "secret-atlas-db", "Read", "secret"],
        ["ec2-b1", "secret-atlas-db", "Read", "secret"],
        ["ec2-b2", "secret-atlas-db", "Read", "secret"],
        // EC2 → AD, SMTP
        ["ec2-a1", "ext-ad", "Auth", "LDAP"],
        ["ec2-b1", "ext-ad", "Auth", "LDAP"],
        ["ec2-a1", "ext-smtp", "Send", "SMTP/587"],
        ["ec2-b1", "ext-smtp", "Send", "SMTP/587"],
      ];
      deps.forEach(([s, t, label, sub]) => {
        list.push({
          id: `e.dep.${s}->${t}`,
          source: s,
          target: t,
          animated: false,
          label: `${label} · ${sub}`,
          labelStyle: { fill: "#475569", fontSize: 9 },
          labelBgStyle: { fill: "#f1f5f9", opacity: 0.85 },
          labelBgPadding: [2, 2],
          labelBgBorderRadius: 3,
          style: { stroke: "#94a3b8", strokeWidth: 1, strokeDasharray: "4 3" },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#94a3b8", width: 12, height: 12 },
          data: { kind: "dependency" },
        });
      });
    }

    // --- Observability edges (progressive disclosure) --------------------
    if (showObservability) {
      const obs: Array<[string, string, string]> = [
        ["ec2-a1", "cw", "Metrics"],
        ["ec2-a2", "cw", "Metrics"],
        ["ec2-b1", "cw", "Metrics"],
        ["ec2-b2", "cw", "Metrics"],
        ["alb-atlas", "cw", "Metrics"],
        ["__rds-primary", "cw", "Metrics"],
        ["ec2-a1", "cloudtrail", "API log"],
        ["alb-atlas", "cloudtrail", "API log"],
        ["ec2-a1", "aws-config", "Config"],
        ["__rds-primary", "aws-config", "Config"],
      ];
      obs.forEach(([s, t, label]) => {
        list.push({
          id: `e.obs.${s}->${t}`,
          source: s,
          target: t,
          animated: false,
          label,
          labelStyle: { fill: "#0f766e", fontSize: 9 },
          labelBgStyle: { fill: "#f0fdfa", opacity: 0.85 },
          labelBgPadding: [2, 2],
          labelBgBorderRadius: 3,
          style: { stroke: "#14b8a6", strokeWidth: 1, strokeDasharray: "2 3" },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#14b8a6", width: 10, height: 10 },
          data: { kind: "observability" },
        });
      });
    }

    // Selection highlight
    return list.map((e) => ({
      ...e,
      selected: false,
    }));
  }, [showDependencies, showObservability]);

  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState(edges);
  useEffect(() => { setRfEdges(edges); }, [edges, setRfEdges]);

  /* ----------------------------- Interactions ----------------------------- */

  const handleNodeClick = useCallback((_e: React.MouseEvent, node: Node) => {
    if (node.type !== "resource") return;
    const d = node.data as ResourceNodeData;
    const target = "__synthetic" in d.resource ? (d.resource as SyntheticResource).resource_id : d.resource.id;
    onSelectResource(target);
    onSelectRelationship?.(null);
  }, [onSelectResource, onSelectRelationship]);

  const handleNodeDoubleClick = useCallback((_e: React.MouseEvent, node: Node) => {
    if (node.type !== "resource") return;
    const inst = rfRef.current;
    if (!inst) return;
    // React Flow gives us absolute position via getNode's positionAbsolute.
    const n = inst.getNode(node.id);
    if (!n?.positionAbsolute) return;
    inst.setCenter(
      n.positionAbsolute.x + (Number(n.style?.width) || NODE_W) / 2,
      n.positionAbsolute.y + (Number(n.style?.height) || NODE_H) / 2,
      { zoom: Math.max(inst.getZoom(), 1.1), duration: 400 },
    );
  }, []);

  const handleEdgeClick = useCallback((_e: React.MouseEvent, edge: Edge) => {
    onSelectRelationship?.(edge.id);
  }, [onSelectRelationship]);

  const handlePaneClick = useCallback(() => {
    onSelectResource(null);
    onSelectRelationship?.(null);
  }, [onSelectResource, onSelectRelationship]);

  const fitAll = useCallback(() => { rfRef.current?.fitView({ padding: 0.08, duration: 400 }); }, []);
  const resetView = useCallback(() => { rfRef.current?.setViewport({ x: 0, y: 0, zoom: 0.5 }, { duration: 300 }); }, []);
  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else el.requestFullscreen?.().catch(() => {});
  }, []);

  return (
    <TooltipProvider delayDuration={200}>
      <div ref={containerRef} className="relative h-full w-full overflow-hidden rounded-md border border-slate-200 bg-white">
        <ReactFlow
          nodes={nodes}
          edges={rfEdges}
          nodeTypes={NODE_TYPES}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          onNodeDoubleClick={handleNodeDoubleClick}
          onEdgeClick={handleEdgeClick}
          onPaneClick={handlePaneClick}
          onInit={(inst) => { rfRef.current = inst; inst.fitView({ padding: 0.08 }); }}
          onMove={(_e, vp) => setZoom(vp.zoom)}
          minZoom={0.25}
          maxZoom={1.75}
          panOnScroll
          selectionOnDrag={false}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable
          proOptions={{ hideAttribution: true }}
          fitView
          fitViewOptions={{ padding: 0.08 }}
          className="bg-white"
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e2e8f0" />
          <Controls
            position="bottom-left"
            showInteractive={false}
            className="!rounded-md !border !border-slate-200 !bg-white !shadow-sm"
          />
          <MiniMap
            position="bottom-right"
            pannable
            zoomable
            style={{ height: 100, width: 160 }}
            className="!rounded-md !border !border-slate-200 !bg-white"
            nodeColor={(n) => n.type === "boundary" ? "#f1f5f9" : "#0f172a"}
            nodeStrokeWidth={2}
            maskColor="rgba(15,23,42,0.06)"
          />

          {/* Top-right toolbar */}
          <Panel position="top-right" className="!m-2 flex items-center gap-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant={showDependencies ? "default" : "outline"} className="h-7 gap-1 px-2 text-[11px]"
                  onClick={() => setShowDependencies((v) => !v)}>
                  {showDependencies ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  Dependencies
                </Button>
              </TooltipTrigger>
              <TooltipContent>Show EC2 ↔ EBS / EFS / Secrets / AD / SMTP dependencies</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant={showObservability ? "default" : "outline"} className="h-7 gap-1 px-2 text-[11px]"
                  onClick={() => setShowObservability((v) => !v)}>
                  {showObservability ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  Observability
                </Button>
              </TooltipTrigger>
              <TooltipContent>Show CloudWatch, CloudTrail, and AWS Config edges</TooltipContent>
            </Tooltip>
            <div className="mx-1 h-4 w-px bg-slate-200" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" className="h-7 gap-1 px-2 text-[11px]" onClick={fitAll}>
                  <Maximize className="h-3 w-3" /> Fit
                </Button>
              </TooltipTrigger>
              <TooltipContent>Fit entire architecture to view</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" className="h-7 gap-1 px-2 text-[11px]" onClick={resetView}>
                  <RotateCcw className="h-3 w-3" /> Reset
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset pan and zoom</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" className="h-7 gap-1 px-2 text-[11px]" onClick={toggleFullscreen}>
                  {isFull ? <Minimize className="h-3 w-3" /> : <Maximize className="h-3 w-3" />} {isFull ? "Exit" : "Full"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isFull ? "Exit full screen" : "Full screen canvas"}</TooltipContent>
            </Tooltip>
          </Panel>

          {/* Legend */}
          <Panel position="top-left" className="!m-2">
            <CanvasLegend zoom={zoom} />
          </Panel>
        </ReactFlow>
      </div>
    </TooltipProvider>
  );
}

/* -------------------------------------------------------------------------- */
/*  Legend                                                                     */
/* -------------------------------------------------------------------------- */

function CanvasLegend({ zoom }: { zoom: number }) {
  const items: Array<{ label: string; className: string; dot: string; style?: string }> = [
    { label: "Healthy",      className: "border-emerald-400",  dot: "bg-emerald-500" },
    { label: "Warning",      className: "border-amber-400 border-dashed", dot: "bg-amber-500" },
    { label: "Critical",     className: "border-red-500",      dot: "bg-red-500" },
    { label: "Degraded",     className: "border-orange-400 border-dashed", dot: "bg-orange-500" },
    { label: "Maintenance",  className: "border-blue-400 border-dashed", dot: "bg-blue-500" },
    { label: "Failed over",  className: "border-purple-400 border-dashed", dot: "bg-purple-500" },
    { label: "Unknown",      className: "border-slate-300 border-dotted", dot: "bg-slate-400" },
  ];
  return (
    <div className="rounded-md border border-slate-200 bg-white/95 px-2 py-1.5 text-[10px] shadow-sm backdrop-blur-sm">
      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
        Legend <span className="ml-1 rounded bg-slate-100 px-1 py-px text-[9px] font-normal normal-case tracking-normal text-slate-500">{Math.round(zoom * 100)}%</span>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-1.5">
            <span className={cn("inline-block h-3 w-6 rounded border-[1.5px] bg-white", it.className)} />
            <span className={cn("h-1.5 w-1.5 rounded-full", it.dot)} />
            <span className="text-slate-700">{it.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-1.5 border-t border-slate-100 pt-1.5">
        <div className="flex items-center gap-1.5 text-slate-600">
          <svg width="22" height="6" viewBox="0 0 22 6"><line x1="0" y1="3" x2="22" y2="3" stroke="#0284c7" strokeWidth="1.75" /></svg>
          <span>Live traffic</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600">
          <svg width="22" height="6" viewBox="0 0 22 6"><line x1="0" y1="3" x2="22" y2="3" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 3" /></svg>
          <span>Dependency</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600">
          <svg width="22" height="6" viewBox="0 0 22 6"><line x1="0" y1="3" x2="22" y2="3" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="6 3" /></svg>
          <span>Multi-AZ replication</span>
        </div>
      </div>
    </div>
  );
}

export default ArchitectureCanvas;
