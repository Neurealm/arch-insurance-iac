import { useMemo, useRef, useState } from "react";
import { Link2, CheckCircle2, Clock, XCircle, Search, Calendar, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { IntegrationDrawer } from "@/components/eoc/integrations/IntegrationDrawer";
import { profiles, IntegrationStatus } from "@/components/eoc/integrations/profiles";

type Status = "connected" | "progress" | "not";
interface Integration { name: string; cat: string; status: Status; pct?: number }

const initial: Integration[] = [
  { name: "ServiceNow", cat: "ITSM", status: "connected" },
  { name: "Datadog", cat: "Monitoring & Observability", status: "connected" },
  { name: "Splunk Enterprise", cat: "SIEM & Analytics", status: "connected" },
  { name: "Okta", cat: "Identity & Access", status: "connected" },
  { name: "CrowdStrike", cat: "Security Operations", status: "progress", pct: 60 },
  { name: "Microsoft Azure", cat: "Cloud Platform", status: "connected" },
  { name: "Amazon Web Services", cat: "Cloud Platform", status: "connected" },
  { name: "Jira Software", cat: "Project & Issue Tracking", status: "progress", pct: 40 },
  { name: "CMDB / Asset Inventory", cat: "Configuration Management", status: "connected" },
  { name: "PagerDuty", cat: "Incident Management", status: "not" },
  { name: "Slack", cat: "Collaboration", status: "connected" },
  { name: "Webhook Endpoints", cat: "Custom Integrations", status: "not" },
  { name: "SolarWinds", cat: "Network & Infra Monitoring", status: "progress", pct: 50 },
  { name: "Cribl", cat: "Data Pipeline", status: "progress", pct: 55 },
];

const toStatus = (s: IntegrationStatus): { status: Status; pct?: number } => {
  if (s === "Connected") return { status: "connected" };
  if (s === "Not Connected" || s === "Disabled" || s === "Authentication Failed" || s === "Permission Failed") return { status: "not" };
  return { status: "progress", pct: 60 };
};

const toneMap: Record<string, string> = {
  indigo: "bg-indigo/10 text-indigo",
  healthy: "bg-status-healthy-soft text-status-healthy",
  warning: "bg-status-warning-soft text-status-warning",
  critical: "bg-status-critical-soft text-status-critical",
  muted: "bg-secondary text-muted-foreground",
};

export function Step2Integrations() {
  const [items, setItems] = useState<Integration[]>(initial);
  const [query, setQuery] = useState("");
  const [openKey, setOpenKey] = useState<string | null>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const currentTrigger = useRef<HTMLButtonElement | null>(null);

  const filtered = useMemo(
    () => items.filter((i) => i.name.toLowerCase().includes(query.toLowerCase()) || i.cat.toLowerCase().includes(query.toLowerCase())),
    [items, query],
  );

  const stats = [
    { label: "Total Integrations", value: String(items.length), sub: "Required: 10", icon: Link2, tone: "indigo" },
    { label: "Connected", value: String(items.filter((i) => i.status === "connected").length), sub: `${Math.round(items.filter((i) => i.status === "connected").length / items.length * 100)}%`, icon: CheckCircle2, tone: "healthy" },
    { label: "In Progress", value: String(items.filter((i) => i.status === "progress").length), sub: `${Math.round(items.filter((i) => i.status === "progress").length / items.length * 100)}%`, icon: Clock, tone: "warning" },
    { label: "Not Connected", value: String(items.filter((i) => i.status === "not").length), sub: `${Math.round(items.filter((i) => i.status === "not").length / items.length * 100)}%`, icon: XCircle, tone: "critical" },
    { label: "Last Validation", value: "May 14, 2026 10:30 AM", sub: "View Details", icon: Calendar, tone: "muted" },
  ];

  const openFor = (name: string) => {
    currentTrigger.current = triggerRefs.current[name] ?? null;
    setOpenKey(name);
  };

  const onStatusChange = (key: string, next: IntegrationStatus) => {
    setItems((prev) => prev.map((i) => i.name === key ? { ...i, ...toStatus(next) } : i));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-indigo/10 text-indigo grid place-items-center"><Link2 className="h-5 w-5" /></div>
        <div>
          <h2 className="text-lg font-bold">Step 2: Environment Integration</h2>
          <p className="text-sm text-muted-foreground">Connect the tools and platforms in your environment. Validate access and ensure secure data exchange.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
            <div className={cn("h-10 w-10 rounded-xl grid place-items-center", toneMap[s.tone])}><s.icon className="h-5 w-5" /></div>
            <div className="min-w-0">
              <div className="text-[11px] text-muted-foreground font-medium truncate">{s.label}</div>
              <div className="text-base font-bold leading-tight">{s.value}</div>
              <div className="text-[10px] text-muted-foreground">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-5">
        <section className="col-span-12 lg:col-span-9 bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-1 text-xs font-semibold">
              <span className="px-3 py-1.5 rounded-lg bg-accent text-indigo">All Integrations ({items.length})</span>
              <span className="px-3 py-1.5 rounded-lg text-muted-foreground hover:bg-secondary">Required (10)</span>
              <span className="px-3 py-1.5 rounded-lg text-muted-foreground hover:bg-secondary">Optional ({items.length - 10})</span>
            </div>
            <div className="relative w-72">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search integrations…" className="pl-9 h-9" />
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {filtered.map((i) => (
              <div key={i.name} className="rounded-xl border border-border p-4 hover:shadow-[var(--shadow-md)] transition">
                <div className="flex items-start gap-2 mb-3">
                  <div className="h-9 w-9 rounded-lg bg-secondary grid place-items-center text-xs font-bold text-foreground">
                    {i.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{i.name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{i.cat}</div>
                  </div>
                </div>
                <StatusRow status={i.status} pct={i.pct} />
                <button
                  ref={(el) => { triggerRefs.current[i.name] = el; }}
                  onClick={() => openFor(i.name)}
                  aria-label={`${i.status === "connected" ? "Configure" : i.status === "progress" ? "Continue setup for" : "Connect"} ${i.name}`}
                  className={cn(
                    "mt-3 w-full h-8 rounded-lg text-xs font-semibold transition",
                    i.status === "connected" && "border border-border hover:bg-secondary",
                    i.status === "progress" && "bg-status-warning text-white hover:bg-status-warning/90",
                    i.status === "not" && "bg-indigo text-indigo-foreground hover:bg-indigo/90",
                  )}
                >
                  {i.status === "connected" ? "Configure" : i.status === "progress" ? "Continue Setup" : "Connect"}
                </button>
              </div>
            ))}
          </div>
        </section>

        <aside className="col-span-12 lg:col-span-3 space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="text-sm font-bold mb-3">Integration Setup Guide</h3>
            <ol className="space-y-3">
              {["Connect — Authenticate and connect your tools.","Validate — Test API access and data retrieval.","Configure — Set permissions and data access.","Monitor — Verify health and ongoing sync."].map((t, i) => (
                <li key={t} className="flex gap-3">
                  <span className="h-6 w-6 rounded-full bg-accent text-indigo text-xs font-bold grid place-items-center shrink-0">{i + 1}</span>
                  <span className="text-xs text-muted-foreground leading-relaxed">{t}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-4 w-4 text-status-healthy" />
              <h3 className="text-sm font-bold">Credential Vault</h3>
            </div>
            <p className="text-xs text-muted-foreground">All credentials are securely stored and encrypted.</p>
            <button className="text-xs font-semibold text-indigo mt-2">Manage Credentials →</button>
          </div>
        </aside>
      </div>

      <IntegrationDrawer
        open={openKey !== null && !!profiles[openKey]}
        profileKey={openKey}
        onClose={() => setOpenKey(null)}
        onStatusChange={onStatusChange}
        triggerRef={currentTrigger as React.RefObject<HTMLElement>}
      />
    </div>
  );
}

function StatusRow({ status, pct }: { status: Status; pct?: number }) {
  if (status === "connected")
    return (
      <div>
        <div className="text-[11px] font-semibold text-status-healthy inline-flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5" /> Connected
        </div>
        <div className="text-[10px] text-muted-foreground mt-1">Last validated: May 14, 2026</div>
      </div>
    );
  if (status === "progress")
    return (
      <div>
        <div className="text-[11px] font-semibold text-status-warning inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" /> In Progress
        </div>
        <div className="h-1.5 rounded bg-secondary mt-1.5 overflow-hidden">
          <div className="h-full bg-status-warning" style={{ width: `${pct ?? 50}%` }} />
        </div>
      </div>
    );
  return (
    <div className="text-[11px] font-semibold text-status-critical inline-flex items-center gap-1.5">
      <XCircle className="h-3.5 w-3.5" /> Not Connected
    </div>
  );
}
