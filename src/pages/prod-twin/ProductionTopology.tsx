import { useState } from "react";
import { AppShell } from "@/components/eoc/AppShell";
import {
  Search, Bell, HelpCircle, Settings, Info, Filter, RefreshCw, Plus, Minus,
  Layers, Cloud, Database, Server, ShieldAlert, Boxes, Users, Smartphone, Monitor,
  Globe, Building2, UserCog, Network, Lock, KeyRound, Activity, GitBranch,
  Rocket, Eye, ShieldCheck, ShieldX, RotateCcw, Archive, FlaskConical, Link2,
  BookOpen, Zap, Clock, DollarSign, TrendingDown, TrendingUp, AlertTriangle,
  CheckCircle2, ChevronRight, ExternalLink, Bot, ChevronDown, X as XIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Status = "healthy" | "degraded" | "risk" | "maint" | "unknown";
const dotCls: Record<Status, string> = {
  healthy: "bg-emerald-500", degraded: "bg-amber-500", risk: "bg-rose-500",
  maint: "bg-sky-500", unknown: "bg-slate-400",
};

type Node = {
  id: string; label: string; sub?: string; icon?: React.ReactNode;
  status?: Status; highlight?: boolean;
};
type Group = { id?: string; label?: string; color?: string; nodes: Node[] };
type Layer = {
  num: number; title: string; icon: React.ReactNode; color: string;
  groups: Group[];
};

const LAYERS: Layer[] = [
  {
    num: 1, title: "User / Channel Layer",
    icon: <Users className="h-4 w-4" />, color: "text-indigo-600",
    groups: [{
      nodes: [
        { id: "u1", label: "Caregiver Mobile App", sub: "iOS / Android", icon: <Smartphone className="h-3.5 w-3.5" />, status: "healthy" },
        { id: "u2", label: "Provider / Customer Portal", sub: "Web Application", icon: <Monitor className="h-3.5 w-3.5" />, status: "healthy" },
        { id: "u3", label: "State / Payer Integrations", sub: "APIs / EDI / FHIR", icon: <Globe className="h-3.5 w-3.5" />, status: "healthy" },
        { id: "u4", label: "Internal Support Users", sub: "Service Desk / Ops", icon: <UserCog className="h-3.5 w-3.5" />, status: "healthy" },
        { id: "u5", label: "Third-Party Partners", sub: "APIs / File Transfers", icon: <Users className="h-3.5 w-3.5" />, status: "healthy" },
      ],
    }],
  },
  {
    num: 2, title: "Edge / Access Layer",
    icon: <ShieldCheck className="h-4 w-4" />, color: "text-sky-600",
    groups: [{
      nodes: [
        { id: "e1", label: "Public DNS", sub: "Route 53", icon: <Globe className="h-3.5 w-3.5" />, status: "healthy" },
        { id: "e2", label: "WAF / CDN", sub: "AWS CloudFront", icon: <ShieldCheck className="h-3.5 w-3.5" />, status: "healthy" },
        { id: "e3", label: "Load Balancers", sub: "ALB / NLB", icon: <Network className="h-3.5 w-3.5" />, status: "healthy" },
        { id: "e4", label: "VPN / Direct Connect", sub: "Direct Connect", icon: <Link2 className="h-3.5 w-3.5" />, status: "healthy" },
        { id: "e5", label: "Security Groups", sub: "VPC Rules", icon: <Lock className="h-3.5 w-3.5" />, status: "healthy" },
        { id: "e6", label: "Firewall Rules", sub: "Network ACLs", icon: <ShieldAlert className="h-3.5 w-3.5" />, status: "healthy" },
      ],
    }],
  },
  {
    num: 3, title: "Application Layer",
    icon: <Boxes className="h-4 w-4" />, color: "text-violet-600",
    groups: [{
      nodes: [
        { id: "a1", label: "Windows Apps (IIS)", sub: "EC2 Auto Scaling", icon: <Server className="h-3.5 w-3.5" />, status: "degraded" },
        { id: "a2", label: "Linux Services", sub: "EC2 / Ubuntu", icon: <Server className="h-3.5 w-3.5" />, status: "healthy" },
        { id: "a3", label: "EKS Workloads", sub: "Kubernetes", icon: <Boxes className="h-3.5 w-3.5" />, status: "healthy", highlight: true },
        { id: "a4", label: "Legacy Thick Client", sub: "Citrix / Remote Apps", icon: <Monitor className="h-3.5 w-3.5" />, status: "degraded" },
        { id: "a5", label: "API Gateway", sub: "REST / GraphQL", icon: <Network className="h-3.5 w-3.5" />, status: "healthy" },
      ],
    }],
  },
  {
    num: 4, title: "Data Layer",
    icon: <Database className="h-4 w-4" />, color: "text-amber-600",
    groups: [
      { id: "ash", label: "Ashburn Data Center", color: "border-amber-300 bg-amber-50/40", nodes: [
        { id: "d1", label: "SQL Server Shards", sub: "Bare Metal", icon: <Database className="h-3.5 w-3.5" />, status: "degraded" },
        { id: "d2", label: "File Shares / NAS", sub: "NetApp Storage", icon: <Archive className="h-3.5 w-3.5" />, status: "healthy" },
      ]},
      { id: "aws", label: "AWS", color: "border-orange-300 bg-orange-50/40", nodes: [
        { id: "d3", label: "Oracle Exadata", sub: "RDS Custom", icon: <Database className="h-3.5 w-3.5" />, status: "healthy" },
        { id: "d4", label: "Aurora PostgreSQL", sub: "Multi-AZ", icon: <Database className="h-3.5 w-3.5" />, status: "healthy" },
        { id: "d5", label: "MySQL", sub: "RDS", icon: <Database className="h-3.5 w-3.5" />, status: "healthy" },
        { id: "d6", label: "S3 Object Storage", sub: "Encrypted", icon: <Archive className="h-3.5 w-3.5" />, status: "healthy" },
      ]},
      { id: "gcp", label: "GCP", color: "border-emerald-300 bg-emerald-50/40", nodes: [
        { id: "d7", label: "Cloud SQL", sub: "PostgreSQL", icon: <Database className="h-3.5 w-3.5" />, status: "healthy" },
        { id: "d8", label: "MongoDB Atlas", sub: "NoSQL", icon: <Database className="h-3.5 w-3.5" />, status: "healthy" },
      ]},
    ],
  },
  {
    num: 5, title: "Platform Layer",
    icon: <Layers className="h-4 w-4" />, color: "text-blue-600",
    groups: [{
      nodes: [
        { id: "p1", label: "AWS Accounts", sub: "6 Accounts", icon: <Cloud className="h-3.5 w-3.5" />, status: "healthy" },
        { id: "p2", label: "GCP Projects", sub: "3 Projects", icon: <Cloud className="h-3.5 w-3.5" />, status: "healthy" },
        { id: "p3", label: "Entra ID (Azure AD)", sub: "SSO / Identity", icon: <KeyRound className="h-3.5 w-3.5" />, status: "healthy" },
        { id: "p4", label: "GitHub", sub: "Code Repositories", icon: <GitBranch className="h-3.5 w-3.5" />, status: "healthy" },
        { id: "p5", label: "GitHub Actions", sub: "CI/CD Pipelines", icon: <Rocket className="h-3.5 w-3.5" />, status: "healthy" },
        { id: "p6", label: "Octopus Deploy", sub: "Release Orchestration", icon: <Rocket className="h-3.5 w-3.5" />, status: "healthy" },
        { id: "p7", label: "Datadog", sub: "Observability", icon: <Activity className="h-3.5 w-3.5" />, status: "healthy" },
        { id: "p8", label: "Uptrends", sub: "Synthetic Monitoring", icon: <Eye className="h-3.5 w-3.5" />, status: "healthy" },
      ],
    }],
  },
  {
    num: 6, title: "Security Layer",
    icon: <ShieldAlert className="h-4 w-4" />, color: "text-rose-600",
    groups: [{
      nodes: [
        { id: "s1", label: "CrowdStrike", sub: "EDR", icon: <ShieldCheck className="h-3.5 w-3.5" />, status: "healthy" },
        { id: "s2", label: "Vulnerability Scanner", sub: "Tenable / Qualys", icon: <ShieldX className="h-3.5 w-3.5" />, status: "degraded" },
        { id: "s3", label: "SIEM Logging", sub: "Splunk Cloud", icon: <FlaskConical className="h-3.5 w-3.5" />, status: "healthy" },
        { id: "s4", label: "Entra ID", sub: "Identity & Access", icon: <KeyRound className="h-3.5 w-3.5" />, status: "healthy" },
        { id: "s5", label: "PAM (Roadmap)", sub: "CyberArk Target", icon: <Lock className="h-3.5 w-3.5" />, status: "maint" },
        { id: "s6", label: "Security Groups", sub: "Least Privilege", icon: <ShieldCheck className="h-3.5 w-3.5" />, status: "healthy" },
        { id: "s7", label: "Patch Posture", sub: "78% Compliant", icon: <ShieldAlert className="h-3.5 w-3.5" />, status: "degraded" },
      ],
    }],
  },
  {
    num: 7, title: "Resilience Layer",
    icon: <RotateCcw className="h-4 w-4" />, color: "text-teal-600",
    groups: [{
      nodes: [
        { id: "r1", label: "Backups", sub: "Daily / Encrypted", icon: <Archive className="h-3.5 w-3.5" />, status: "healthy" },
        { id: "r2", label: "Restore Testing", sub: "Weekly", icon: <FlaskConical className="h-3.5 w-3.5" />, status: "healthy" },
        { id: "r3", label: "DR Strategy", sub: "Cross-Region", icon: <RotateCcw className="h-3.5 w-3.5" />, status: "healthy" },
        { id: "r4", label: "Direct Connect", sub: "Redundant Links", icon: <Link2 className="h-3.5 w-3.5" />, status: "healthy" },
        { id: "r5", label: "Runbooks", sub: "Automated + Manual", icon: <BookOpen className="h-3.5 w-3.5" />, status: "healthy" },
        { id: "r6", label: "Failover Drills", sub: "Quarterly", icon: <Zap className="h-3.5 w-3.5" />, status: "healthy" },
        { id: "r7", label: "RTO / RPO", sub: "4h / 15m", icon: <Clock className="h-3.5 w-3.5" />, status: "healthy" },
      ],
    }],
  },
  {
    num: 8, title: "Cost Layer",
    icon: <DollarSign className="h-4 w-4" />, color: "text-emerald-600",
    groups: [{
      nodes: [
        { id: "c1", label: "AWS Monthly Spend", sub: "$2.78M", icon: <DollarSign className="h-3.5 w-3.5" />, status: "healthy" },
        { id: "c2", label: "GCP Monthly Spend", sub: "$642K", icon: <DollarSign className="h-3.5 w-3.5" />, status: "healthy" },
        { id: "c3", label: "Savings Plans", sub: "Coverage 62%", icon: <TrendingUp className="h-3.5 w-3.5" />, status: "healthy" },
        { id: "c4", label: "Idle Resources", sub: "$186K", icon: <TrendingDown className="h-3.5 w-3.5" />, status: "degraded" },
        { id: "c5", label: "Rightsizing", sub: "$312K", icon: <TrendingDown className="h-3.5 w-3.5" />, status: "degraded" },
        { id: "c6", label: "Cost to Serve", sub: "$0.87", icon: <DollarSign className="h-3.5 w-3.5" />, status: "healthy" },
      ],
    }],
  },
];

const KPIS = [
  { id: "tot", label: "Total Services", value: "412", sub: "+18 vs last month", icon: <Layers className="h-5 w-5 text-sky-600" />, bg: "bg-sky-50", tone: "good" },
  { id: "aws", label: "AWS Services", value: "287", sub: "69% of total", icon: <span className="text-orange-500 text-[11px] font-extrabold">aws</span>, bg: "bg-orange-50", tone: "neutral" },
  { id: "gcp", label: "GCP Services", value: "68", sub: "16% of total", icon: <Cloud className="h-5 w-5 text-blue-500" />, bg: "bg-blue-50", tone: "neutral" },
  { id: "onp", label: "On-Prem (Ashburn)", value: "57", sub: "14% of total", icon: <Building2 className="h-5 w-5 text-slate-600" />, bg: "bg-slate-100", tone: "neutral" },
  { id: "risk", label: "High Risk Resources", value: "24", sub: "-3 vs last month", icon: <AlertTriangle className="h-5 w-5 text-rose-600" />, bg: "bg-rose-50", tone: "good" },
  { id: "data", label: "Data Stores", value: "84", sub: "Across all environments", icon: <Database className="h-5 w-5 text-violet-600" />, bg: "bg-violet-50", tone: "neutral" },
];

const STATUS_LEGEND: { s: Status; label: string }[] = [
  { s: "healthy", label: "Healthy" }, { s: "degraded", label: "Degraded" },
  { s: "risk", label: "At Risk" }, { s: "maint", label: "Maintenance" }, { s: "unknown", label: "Unknown" },
];

export default function ProductionTopology() {
  const [selected, setSelected] = useState<Node | null>(LAYERS[2].groups[0].nodes[2]); // EKS Workloads
  const [open, setOpen] = useState(true);

  const pick = (n: Node) => { setSelected(n); setOpen(true); };

  return (
    <AppShell>
      <div className="flex-1 flex flex-col bg-slate-50/60 min-h-screen">
        {/* Top utility bar */}
        <div className="h-14 border-b bg-white px-6 flex items-center gap-4 sticky top-0 z-20">
          <div className="font-semibold text-slate-800">Client Production Resilience Operating System</div>
          <div className="flex-1 max-w-2xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search for services, resources, owners…" className="pl-9 h-9 bg-slate-50 border-slate-200" />
          </div>
          <button className="relative h-9 w-9 grid place-items-center rounded-md hover:bg-slate-100">
            <Bell className="h-4 w-4 text-slate-600" />
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 bg-rose-500 text-white text-[10px] rounded-full grid place-items-center font-semibold">12</span>
          </button>
          <button className="h-9 w-9 grid place-items-center rounded-md hover:bg-slate-100"><HelpCircle className="h-4 w-4 text-slate-600" /></button>
          <button className="h-9 w-9 grid place-items-center rounded-md hover:bg-slate-100"><Settings className="h-4 w-4 text-slate-600" /></button>
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 grid place-items-center text-white text-xs font-bold">JS</div>
        </div>

        <div className="flex flex-1 min-h-0">
          <main className="flex-1 overflow-auto p-6 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between mb-5 gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold text-slate-900">Production Topology Digital Twin</h1>
                  <Info className="h-4 w-4 text-slate-400" />
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  Real-time digital twin of Client production environment across AWS, GCP, and Ashburn Data Centers.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Select defaultValue="prod">
                  <SelectTrigger className="h-9 w-[200px] text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prod">Environment: Production</SelectItem>
                    <SelectItem value="nonprod">Environment: Non-Production</SelectItem>
                    <SelectItem value="all">Environment: All</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5">
                  Last updated: 9:30 AM ET <RefreshCw className="h-3.5 w-3.5 ml-1" />
                </Button>
                <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5 border-blue-200 text-blue-700">
                  <Filter className="h-3.5 w-3.5" />Filters (4)
                </Button>
              </div>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
              {KPIS.map(k => (
                <button key={k.id} onClick={() => pick({ id: k.id, label: k.label, sub: k.sub, status: "healthy" })}
                  className="text-left bg-white border rounded-xl p-4 hover:shadow-md hover:border-blue-300 transition group">
                  <div className="flex items-start gap-3">
                    <div className={cn("h-10 w-10 rounded-lg grid place-items-center shrink-0", k.bg)}>{k.icon}</div>
                    <div className="min-w-0">
                      <div className="text-[11px] text-slate-500">{k.label}</div>
                      <div className="text-2xl font-semibold text-slate-900 leading-tight">{k.value}</div>
                    </div>
                  </div>
                  <div className={cn("text-[11px] mt-2",
                    k.sub.startsWith("+") && k.label !== "High Risk Resources" ? "text-emerald-600" :
                    k.sub.startsWith("-") && k.label === "High Risk Resources" ? "text-emerald-600" :
                    "text-slate-500")}>
                    {k.sub}
                  </div>
                </button>
              ))}
            </div>

            {/* Topology canvas */}
            <div className="bg-white border rounded-xl p-4 overflow-x-auto">
              <div className="min-w-[1100px] space-y-2">
                {LAYERS.map((layer, li) => (
                  <LayerRow key={layer.num} layer={layer} onPick={pick} selectedId={selected?.id} />
                ))}

                {/* Legend + Mini-map */}
                <div className="flex items-center justify-between pt-3 mt-2 border-t">
                  <div className="flex items-center gap-4 text-[11px] text-slate-600">
                    {STATUS_LEGEND.map(l => (
                      <span key={l.s} className="flex items-center gap-1.5">
                        <span className={cn("h-2 w-2 rounded-full", dotCls[l.s])} />{l.label}
                      </span>
                    ))}
                    <span className="flex items-center gap-1.5"><span className="h-px w-5 bg-slate-400" />Data Flow</span>
                    <span className="flex items-center gap-1.5"><span className="h-px w-5 border-t border-dashed border-slate-400" />Dependency</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MiniMap activeIndex={LAYERS.findIndex(l => l.groups.some(g => g.nodes.some(n => n.id === selected?.id)))} />
                    <div className="flex flex-col gap-1">
                      <button className="h-7 w-7 rounded-md border bg-white grid place-items-center hover:bg-slate-50"><Plus className="h-3.5 w-3.5 text-slate-600" /></button>
                      <button className="h-7 w-7 rounded-md border bg-white grid place-items-center hover:bg-slate-50"><Minus className="h-3.5 w-3.5 text-slate-600" /></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Last updated: Jun 14, 2026 9:30 AM ET</span>
              <span className="flex items-center gap-1">Source: Client Digital Twin <Info className="h-3 w-3" /></span>
            </div>
          </main>

          {/* Right Detail Drawer */}
          <Sheet open={open} onOpenChange={setOpen} modal={false}>
            <SheetContent side="right" className="w-[500px] sm:max-w-[500px] p-0 overflow-y-auto">
              {selected && <NodeDrawer node={selected} />}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </AppShell>
  );
}

function LayerRow({ layer, onPick, selectedId }: { layer: Layer; onPick: (n: Node) => void; selectedId?: string }) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-3 items-stretch py-1.5">
      {/* Layer label */}
      <div className="rounded-lg border bg-slate-50/70 px-3 py-3 flex items-start gap-2">
        <div className={cn("h-8 w-8 rounded-md bg-white border grid place-items-center shrink-0", layer.color)}>{layer.icon}</div>
        <div>
          <div className="text-[11px] text-slate-500 font-medium">{layer.num}.</div>
          <div className="text-xs font-semibold text-slate-800 leading-tight">{layer.title}</div>
        </div>
      </div>

      {/* Nodes (possibly grouped) */}
      <div className="flex flex-wrap gap-2">
        {layer.groups.length === 1 && !layer.groups[0].label ? (
          layer.groups[0].nodes.map(n => (
            <NodeCard key={n.id} node={n} active={selectedId === n.id} onClick={() => onPick(n)} />
          ))
        ) : (
          <div className="flex flex-wrap gap-3 w-full">
            {layer.groups.map(g => (
              <div key={g.id} className={cn("rounded-lg border-2 border-dashed p-2.5 flex-1 min-w-[260px]", g.color)}>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 mb-1.5">{g.label}</div>
                <div className="flex flex-wrap gap-2">
                  {g.nodes.map(n => (
                    <NodeCard key={n.id} node={n} active={selectedId === n.id} onClick={() => onPick(n)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NodeCard({ node: n, active, onClick }: { node: Node; active?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={cn(
        "group flex items-start gap-2 rounded-lg border bg-white px-3 py-2 min-w-[170px] text-left transition",
        "hover:shadow-sm hover:border-blue-400 hover:bg-blue-50/30",
        active && "border-blue-500 ring-2 ring-blue-100 bg-blue-50/40",
        n.highlight && !active && "border-blue-300 ring-1 ring-blue-100",
      )}>
      <div className="h-7 w-7 rounded-md bg-slate-50 grid place-items-center text-slate-600 shrink-0 group-hover:bg-white">
        {n.icon ?? <Boxes className="h-3.5 w-3.5" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <div className="text-[12px] font-semibold text-slate-800 leading-tight truncate">{n.label}</div>
          {n.status && <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotCls[n.status])} />}
        </div>
        {n.sub && <div className="text-[10.5px] text-slate-500 mt-0.5 truncate">{n.sub}</div>}
      </div>
    </button>
  );
}

function MiniMap({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="border rounded-md p-2 bg-white">
      <div className="grid grid-cols-1 gap-0.5">
        {LAYERS.map((_, i) => (
          <div key={i} className={cn(
            "h-1.5 w-20 rounded-sm",
            i === activeIndex ? "bg-blue-500" : "bg-slate-200",
          )} />
        ))}
      </div>
    </div>
  );
}

/* ---------------- Drawer ---------------- */

function NodeDrawer({ node }: { node: Node }) {
  // Custom content for EKS, generic otherwise
  const isEks = node.id === "a3";
  return (
    <div>
      {/* Header */}
      <div className="p-5 border-b bg-gradient-to-b from-slate-50/80 to-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-50 grid place-items-center text-blue-600">
              {node.icon ?? <Boxes className="h-5 w-5" />}
            </div>
            <div>
              <div className="text-lg font-semibold text-slate-900">{node.label}</div>
              {node.sub && <div className="text-xs text-slate-500">{node.sub}</div>}
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="p-5">
        <TabsList className="bg-transparent border-b w-full justify-start rounded-none p-0 h-auto -mx-5 px-5">
          {["overview", "dependencies", "risk", "modernization", "operations", "neurealm"].map(t => (
            <TabsTrigger key={t} value={t}
              className="capitalize rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none px-3 py-2 text-xs">
              {t === "dependencies" ? `Dependencies (23)` : t === "neurealm" ? "Neurealm" : t}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4 text-sm">
          <Section icon={<Boxes className="h-4 w-4 text-blue-600" />} title="Current State">
            {isEks
              ? "Amazon EKS 1.29 running 28 services across 6 clusters. Auto-scaling enabled. Images stored in ECR. Logging to CloudWatch."
              : `${node.label} is operational. ${node.sub ?? ""} Owned by Platform Engineering. Supports caregiver visit, claims, and payroll workflows.`}
          </Section>

          <Section icon={<AlertTriangle className="h-4 w-4 text-rose-600" />} title="Risk">
            {isEks
              ? "Image patch lag (avg 14 days), IAM role sprawl, network policy gaps, and cluster upgrade backlog."
              : "Patch lead time elevated. Configuration drift detected. Single-owner dependency increases bus factor."}
          </Section>

          <Section icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />} title="SRE Target State">
            SLO-monitored workloads, IaC-managed clusters, automated patching, GitOps delivery, service ownership defined.
          </Section>

          <Section icon={<Bot className="h-4 w-4 text-violet-600" />} title="Neurealm Competency">
            Kubernetes platform ops, cloud-native engineering, observability, security hardening, DevSecOps enablement.
          </Section>

          <div>
            <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Bot className="h-4 w-4 text-violet-600" /> Digital Coworkers
            </div>
            <div className="flex flex-wrap gap-1.5">
              {["Cluster Health Analyst", "Drift Detector", "Cost Optimizer", "Image Scanner"].map(d => (
                <Badge key={d} variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 font-medium">{d}</Badge>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <div className="text-xs font-semibold text-slate-700 mb-2">Next 30 / 90 / 180-Day Actions</div>
            <ActionBlock day="30" color="blue" items={["Inventory all workloads and owners", "Baseline SLOs and alerts", "Enable policy-as-code guardrails"]} />
            <ActionBlock day="90" color="violet" items={["Implement GitOps deployment", "Automate image patching pipeline", "Enforce network policies"]} />
            <ActionBlock day="180" color="teal" items={["Optimize autoscaling & resource requests", "Standardize observability dashboards", "Run chaos drills and validate resilience"]} />
          </div>

          <div className="flex flex-col gap-2 pt-3">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 gap-2"><Plus className="h-4 w-4" />View Related Runbooks <ExternalLink className="h-3.5 w-3.5" /></Button>
            <Button variant="outline" className="w-full gap-2"><Plus className="h-4 w-4" />Create Action Item</Button>
          </div>
        </TabsContent>

        <TabsContent value="dependencies" className="mt-4 space-y-2">
          {["Aurora PostgreSQL", "S3 Object Storage", "Datadog", "GitHub Actions", "CrowdStrike", "Entra ID", "AWS Direct Connect", "Octopus Deploy"].map(d => (
            <div key={d} className="p-2.5 border rounded-md text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer">
              <span className="flex items-center gap-2"><Link2 className="h-3.5 w-3.5 text-slate-500" /><span className="font-medium text-slate-800">{d}</span></span>
              <Badge variant="outline" className="text-[10px] border-emerald-200 text-emerald-700">Healthy</Badge>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="risk" className="mt-4 space-y-2 text-xs">
          {[
            ["Patch lead time", "High"], ["Configuration drift", "Medium"], ["Legacy deployment pattern", "Medium"],
            ["Manual failover", "High"], ["Golden image gaps", "Medium"], ["Single-owner dependency", "Low"],
            ["Open vulnerabilities", "High"],
          ].map(([k, sev]) => (
            <div key={k} className="flex items-center justify-between p-2.5 border rounded-md">
              <span className="text-slate-700">{k}</span>
              <Badge variant="outline" className={cn("text-[10px] border",
                sev === "High" ? "bg-rose-50 text-rose-700 border-rose-200" :
                sev === "Medium" ? "bg-amber-50 text-amber-700 border-amber-200" :
                "bg-emerald-50 text-emerald-700 border-emerald-200")}>{sev}</Badge>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="modernization" className="mt-4 space-y-2 text-xs">
          {["SLO monitored", "Infrastructure as Code governed", "Automated patch validation", "Defined ownership", "GitOps enabled", "Container ready", "Platform standardized"].map(m => (
            <div key={m} className="p-2.5 border rounded-md flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /><span className="text-slate-700">{m}</span>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="operations" className="mt-4 grid grid-cols-2 gap-2 text-xs">
          {[["Availability", "99.94%"], ["Latency p95", "180ms"], ["Capacity", "62% util"], ["Cost", "$48K/mo"], ["Error Budget", "82% remaining"], ["Patch Compliance", "78%"]].map(([k, v]) => (
            <div key={k} className="p-2.5 border rounded-md">
              <div className="text-[10px] text-slate-500">{k}</div>
              <div className="font-semibold text-slate-800 mt-0.5">{v}</div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="neurealm" className="mt-4 space-y-2 text-xs">
          {["Cloud Operations", "Platform Engineering", "Cyber Hardening", "FinOps", "DR Validation", "Modernization", "SRE Transformation", "GitOps", "Containerization"].map(c => (
            <div key={c} className="p-2.5 border rounded-md flex items-center gap-2">
              <Bot className="h-3.5 w-3.5 text-violet-600" /><span className="text-slate-700 font-medium">{c}</span>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="h-8 w-8 rounded-md bg-slate-50 grid place-items-center shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-slate-800">{title}</div>
        <div className="text-xs text-slate-600 leading-relaxed mt-0.5">{children}</div>
      </div>
    </div>
  );
}

function ActionBlock({ day, color, items }: { day: string; color: "blue" | "violet" | "teal"; items: string[] }) {
  const tone = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    violet: "bg-violet-50 text-violet-700 border-violet-200",
    teal: "bg-teal-50 text-teal-700 border-teal-200",
  }[color];
  return (
    <div className="flex gap-3 py-2 border-b last:border-0">
      <div className={cn("h-10 w-10 rounded-full border-2 grid place-items-center text-[10px] font-bold leading-tight shrink-0", tone)}>
        <div className="text-center">{day}<br /><span className="font-medium">Days</span></div>
      </div>
      <ul className="text-xs text-slate-700 space-y-1 flex-1 pt-1 list-disc pl-4">
        {items.map((i, k) => <li key={k}>{i}</li>)}
      </ul>
    </div>
  );
}
