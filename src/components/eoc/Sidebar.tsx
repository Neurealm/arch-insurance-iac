import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Home, LayoutGrid, AlertTriangle, Bell, GitBranch, Boxes, Bot,
  Building2, BarChart3, ShieldCheck, BookOpen, ScrollText, Settings,
  ChevronsLeft, Plus, Zap, FileBarChart2, AlertOctagon, ShieldAlert,
  Scissors, ChevronRight, ChevronDown, Pin, Activity, Network as NetIcon, Server, Workflow,
  Briefcase, Smile, Target, ShieldX, Headphones, Users,
  Library, Package, Layers, Cloud, TrendingUp as TrendingUp2, DollarSign as DollarSign2,
  Sparkles as Sparkles2, CheckCircle2 as CheckCircle2b,
  ShieldHalf,
  ClipboardList,
  ArrowRightLeft, Rocket, Compass, Gauge, X, Database,
  Search as SearchIcon, Star, Clock, Circle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { carveOutGroups } from "@/data/carveout";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/context/AuthContext";
import { useTenantScope } from "@/hooks/useTenantScope";
import { LogOut } from "lucide-react";
import { AccountPanel } from "@/components/account/AccountPanel";

/* ---------- Tree model ---------- */

type Node = {
  key: string;
  label: string;
  icon?: LucideIcon;
  to?: string;
  badge?: string;
  badgeTone?: "critical" | "warning";
  /** Small text pill next to label, e.g. LIVE / NEW / BETA / DRAFT. */
  pill?: "LIVE" | "NEW" | "BETA" | "DRAFT";
  /** Tiny status dot beside the label. */
  statusDot?: "green" | "amber" | "red" | "blue";
  children?: Node[];
  exact?: boolean;
  /** If true, clicking the row navigates to `to` AND expands children (instead of just toggling). */
  navOnClick?: boolean;
};

const coworkerChildren: Node[] = [
  { key: "sre",    label: "Site Reliability Engineering",            to: "/coworkers/site-reliability-engineering",        icon: Activity },
  { key: "iam",    label: "Identity and Access Management",          to: "/coworkers/identity-access-management",          icon: ShieldCheck },
  { key: "vuln",   label: "Vulnerability Management",                to: "/coworkers/vulnerability-management",            icon: ShieldX  },
  { key: "net",    label: "Network & Connectivity Engineering",      to: "/coworkers/network-connectivity-engineering",    icon: NetIcon  },
  { key: "infra",  label: "Infrastructure Automation",               to: "/coworkers/infrastructure-automation",           icon: Server   },
  { key: "citrix", label: "Citrix Platform Digital Coworkers",       to: "/coworkers/citrix-platform-digital-coworkers",   icon: Layers, pill: "NEW" },
  { key: "appsup", label: "Application Support",                     to: "/coworkers/application-support",                 icon: Headphones },
  { key: "carve",  label: "IT Carve-Out & Separation",               to: "/coworkers/it-carve-out-and-separation",         icon: Scissors },
  { key: "hcpayer",label: "Healthcare Payer",                        to: "/coworkers/healthcare-payer",                    icon: Activity },
];

const carveOpModelChildren: Node[] = carveOutGroups.map((g) => ({
  key: g.key,
  label: g.title,
  icon: g.icon,
  children: g.children.map((c) => ({
    key: c.slug,
    label: c.title,
    to: `/carve-out/${g.key}/${c.slug}`,
  })),
}));

const itsmChildren: Node[] = [
  {
    key: "exec-biz-ops",
    label: "Executive & Business Operations",
    icon: Briefcase,
    children: [
      { key: "ecc",   label: "Executive Command Center",                       to: "/itsm/exec-biz-ops/executive-command-center", icon: LayoutGrid },
      { key: "bsh",   label: "Business Services (Service Portfolio & Health)", to: "/itsm/exec-biz-ops/business-services",        icon: Boxes },
      { key: "cxjh",  label: "Customer Experience & Journey Health (XLA)",    to: "/itsm/exec-biz-ops/customer-experience",      icon: Smile },
      { key: "slo",   label: "SLA / SLO / Error Budget Performance",          to: "/itsm/exec-biz-ops/sla-slo-error-budget",     icon: Target },
      { key: "risk",  label: "Risk & Operational Exposure View",              to: "/itsm/exec-biz-ops/risk-exposure",            icon: ShieldX },
    ],
  },
  { key: "incidents",  label: "Incidents",         icon: AlertTriangle, to: "/incidents", badge: "342", badgeTone: "critical" },
  { key: "alerts",     label: "Alerts",            icon: Bell,          to: "/alerts",    badge: "1.5k", badgeTone: "critical" },
  { key: "change",     label: "Change Management", icon: GitBranch,     to: "/change",    badge: "1.2k", badgeTone: "critical" },
];

const tree: Node[] = [
  {
    key: "sre-practice",
    label: "Site Resilience Engineering",
    icon: ShieldCheck,
    children: [
      { key: "sre-ofi", label: "Enterprise Friction Index", icon: TrendingUp2, to: "/operational-friction-index" },
      { key: "sre-fnd", label: "Enterprise Operating Shifts", icon: Compass, to: "/reliability-foundations" },
      { key: "sre-anat", label: "Anatomy of a Modern Product Reliability Organization", icon: Compass, to: "/product-reliability-anatomy" },
      { key: "sre-tj", label: "Production Reliability Transformation Journey", icon: TrendingUp2, to: "/transformation-journey" },
      { key: "sre-ms", label: "Measuring Success", icon: Gauge, to: "/measuring-success" },
      
      { key: "sre-cmd", label: "PROD Resilience Command Center", icon: Activity, to: "/prod-resilience-twin" },
      { key: "sre-plm", label: "Client Product Line Map", icon: Package, to: "/product-line-map" },
      { key: "sre-gwm", label: "Client Golden Workflow Map", icon: Workflow, to: "/golden-workflow-map" },
      { key: "sre-topo", label: "Client Production Topology Digital Twin", icon: NetIcon, to: "/production-topology" },
      { key: "sre-opmodel", label: "Client SRE Operating Model Cockpit", icon: Activity, to: "/sre-operating-model" },
      { key: "sre-signal", label: "Signal Intelligence", icon: Activity, to: "/signal-intelligence" },
      { key: "sre-ecdt", label: "Enterprise Cloud Application Digital Twin", icon: Cloud, to: "/enterprise-cloud-twin" },
      { key: "sre-awsrat", label: "AWS Resilience Architecture Twin", icon: Cloud, to: "/aws-resilience-architecture-twin" },
      { key: "sre-pef", label: "Platform Engineering & Golden Environment Factory", icon: Package, to: "/platform-engineering-factory" },
      { key: "sre-hcw", label: "Hybrid Cloud, Data & Modernization Workbench", icon: Cloud, to: "/hybrid-cloud-workbench" },
      { key: "sre-amp", label: "Product Reliability Automation Marketplace", icon: Boxes, to: "/automation-marketplace" },
      { key: "sre-admf", label: "Application & Data Modernization Factory", icon: Cloud, to: "/modernization-factory" },
      { key: "sre-cyber", label: "Cyber Resilience Overlay", icon: ShieldCheck, to: "/cyber-resilience-overlay" },
      { key: "sre-aicr", label: "Automation & AI Digital Coworker Control Room", icon: Bot, to: "/ai-coworker-control-room" },
      { key: "sre-tdr", label: "Transition & Dual-Run Command Center", icon: ArrowRightLeft, to: "/transition-dual-run" },
      { key: "sre-aof", label: "Acquisition-to-SRE Onboarding Factory", icon: Rocket, to: "/acquisition-onboarding-factory" },
      { key: "sre-vcb", label: "Value Creation & PE / Board Dashboard", icon: TrendingUp2, to: "/value-creation-board" },
      { key: "sre-mrm", label: "Modernization Roadmap", icon: FileBarChart2, to: "/modernization-roadmap" },
      { key: "sre-idc", label: "Interactive Demo Experience Center", icon: Sparkles2, to: "/interactive-demo-center" },
      { key: "sre-mrm2", label: "Modernization Roadmap", icon: FileBarChart2, to: "/modernization-roadmap-v2" },
    ],
  },
  {
    key: "sre-data-orch",
    label: "SRE Data Orchestration",
    icon: Database,
    to: "/data-orchestration-twin",
    pill: "LIVE",
    statusDot: "green",
  },
  {
    key: "runops",
    label: "RunOps Practice",
    icon: BookOpen,
    to: "/practice-library",
    navOnClick: true,
    children: [
      { key: "itsm-pl",      label: "IT Service Desk & ITSM",                       icon: Headphones, to: "/practice-library/it-service-desk-itsm" },
      { key: "euc-pl",       label: "Digital Workplace & End User Compute (EUC)",   icon: Users,      to: "/practice-library/digital-workplace-euc" },
      { key: "infra-pl",     label: "Infrastructure & Hybrid Platform Operations",  icon: Server,     to: "/practice-library/infrastructure-hybrid-platform" },
      { key: "network-pl",   label: "Network & Connectivity Operations",            icon: NetIcon,    to: "/practice-library/network-connectivity" },
      { key: "cloud-pl",     label: "Cloud & Multicloud Operations",                icon: Boxes,      to: "/practice-library/cloud-multicloud" },
      { key: "app-pl",       label: "Application & Product Support Operations",     icon: LayoutGrid, to: "/practice-library/application-product-support" },
      { key: "data-pl",      label: "Data, Integration & Interoperability Operations", icon: Workflow, to: "/practice-library/data-integration-interoperability" },
      { key: "sre-pl",       label: "Observability & Resilience Engineering (SRE)", icon: Activity,   to: "/practice-library/observability-resilience-sre" },
      { key: "ehr-pl",       label: "EHR & Clinical Application Operations",        icon: ShieldCheck, to: "/practice-library/ehr-clinical-application" },
      { key: "workforce-pl", label: "Digital Workforce Operations",                 icon: Bot,        to: "/practice-library/digital-workforce" },
    ],
  },
  {
    key: "cyber",
    label: "Cyber Security Practice",
    icon: ShieldCheck,
    to: "/practice-library/cyber-security",
    navOnClick: true,
    children: [
      { key: "iam",      label: "Identity & Access Management (IAM)",                       icon: Users,       to: "/practice-library/cyber-security/iam" },
      { key: "soc",      label: "Security Operations Center (SOC) & Threat Detection",      icon: ShieldAlert, to: "/practice-library/cyber-security/soc-threat-detection" },
      { key: "edr",      label: "Endpoint Security & Modern Device Protection EDR/XDR",     icon: ShieldHalf,  to: "/practice-library/cyber-security/endpoint-edr-xdr" },
      { key: "cnapp",    label: "Cloud Security & CNAPP",                                   icon: Boxes,       to: "/practice-library/cyber-security/cloud-cnapp" },
      { key: "vuln",     label: "Vulnerability Management & Exposure Management",           icon: ShieldX,     to: "/practice-library/cyber-security/vulnerability-exposure" },
      { key: "grc",      label: "Governance, Risk & Compliance (GRC)",                      icon: ScrollText,  to: "/practice-library/cyber-security/grc" },
      { key: "dlp",      label: "Data Security & Privacy Protection DLP",                   icon: ShieldCheck, to: "/practice-library/cyber-security/data-privacy-dlp" },
      { key: "devsecops",label: "Application & DevSecOps Security",                         icon: GitBranch,   to: "/practice-library/cyber-security/devsecops" },
      { key: "ir",       label: "Cyber Resilience, Incident Response & Recovery",           icon: Activity,    to: "/practice-library/cyber-security/resilience-ir" },
    ],
  },
  {
    key: "runops-runbooks",
    label: "Runbook Engineering",
    icon: Sparkles2,
    to: "/runops",
  },
  {
    key: "sead",
    label: "S.E.A.D. RunOps",
    icon: Sparkles2,
    to: "/sead/command-center",
  },
  {
    key: "ai-vlsi",
    label: "AI VLSI Engineering",
    icon: Sparkles2,
    to: "/ai-vlsi-engineering",
  },
  
  { key: "itsm",       label: "IT Service Desk & ITSM Operations", icon: Headphones, to: "/itsm", children: itsmChildren },
  { key: "coworkers",  label: "Digital Coworkers",   icon: Bot,           to: "/coworkers" },
  {
    key: "settings",
    label: "Settings",
    icon: Settings,
    to: "/settings",
    exact: true,
  },


];

/* ---------- Quick actions ---------- */

const quickActions = [
  { label: "Create Major Incident", icon: AlertOctagon, tone: "critical" as const },
  { label: "Runbook Automation", icon: Zap, tone: "indigo" as const },
  { label: "Executive Report", icon: FileBarChart2, tone: "healthy" as const },
  { label: "Add Widget", icon: Plus, tone: "muted" as const },
];

const toneClass = {
  critical: "text-status-critical bg-status-critical-soft",
  indigo: "text-indigo bg-accent",
  healthy: "text-status-healthy bg-status-healthy-soft",
  muted: "text-muted-foreground bg-secondary",
};

/* ---------- Helpers ---------- */

function pathMatches(pathname: string, to?: string, exact?: boolean) {
  if (!to) return false;
  if (to === "/" || exact) return pathname === to;
  return pathname === to || pathname.startsWith(to + "/");
}

/* ---------- Flatten + favorites + recents ---------- */

type FlatItem = { key: string; label: string; to: string; icon?: LucideIcon; parents: string[] };

function flattenTree(nodes: Node[], parents: string[] = []): FlatItem[] {
  const out: FlatItem[] = [];
  for (const n of nodes) {
    if (n.to) out.push({ key: n.key, label: n.label, to: n.to, icon: n.icon, parents });
    if (n.children?.length) out.push(...flattenTree(n.children, [...parents, n.label]));
  }
  return out;
}

const FAV_KEY = "eoc.favorites";
const RECENT_KEY = "eoc.recents";

function useFavorites() {
  const [favs, setFavs] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(window.localStorage.getItem(FAV_KEY) || "[]"); } catch { return []; }
  });
  useEffect(() => {
    try { window.localStorage.setItem(FAV_KEY, JSON.stringify(favs)); } catch {}
  }, [favs]);
  const toggle = (to: string) =>
    setFavs((prev) => (prev.includes(to) ? prev.filter((x) => x !== to) : [to, ...prev].slice(0, 12)));
  return { favs, toggle, isFav: (to: string) => favs.includes(to) };
}

function useRecents(pathname: string) {
  const [rec, setRec] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(window.localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; }
  });
  useEffect(() => {
    if (!pathname) return;
    setRec((prev) => {
      const next = [pathname, ...prev.filter((p) => p !== pathname)].slice(0, 5);
      try { window.localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
  return rec;
}

/* ---------- Search palette ---------- */

function NavSearch({ tree }: { tree: Node[] }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const nav = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const flat = useMemo(() => flattenTree(tree), [tree]);
  const results = useMemo(() => {
    if (!q.trim()) return [];
    const needle = q.toLowerCase();
    return flat
      .filter((f) => f.label.toLowerCase().includes(needle) || f.parents.join(" ").toLowerCase().includes(needle))
      .slice(0, 8);
  }, [q, flat]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      } else if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => { setActive(0); }, [q]);

  const commit = (idx = active) => {
    const item = results[idx];
    if (!item) return;
    nav(item.to);
    setQ("");
    setOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div className="px-2 pb-2">
      <div className="relative">
        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-sidebar-foreground/50" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(i + 1, Math.max(results.length - 1, 0))); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
            else if (e.key === "Enter") { e.preventDefault(); commit(); }
          }}
          placeholder="Search pages, dashboards, twins…"
          className="w-full h-9 pl-8 pr-12 rounded-lg bg-white/[0.06] hover:bg-white/[0.09] focus:bg-white/10 border border-white/10 focus:border-white/20 text-[12.5px] text-sidebar-foreground placeholder:text-sidebar-foreground/40 outline-none transition-colors"
        />
        <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[9.5px] font-semibold text-sidebar-foreground/50 bg-white/10 border border-white/10 rounded px-1.5 py-0.5">
          ⌘K
        </kbd>
        {open && results.length > 0 && (
          <div className="absolute z-40 mt-1 left-0 right-0 rounded-lg bg-[hsl(230_60%_9%)] border border-white/10 shadow-2xl overflow-hidden">
            <div className="px-2.5 py-1.5 text-[9.5px] font-semibold tracking-[0.14em] text-sidebar-foreground/50 border-b border-white/5">
              PAGES · {results.length}
            </div>
            {results.map((r, i) => {
              const Icon = r.icon;
              return (
                <button
                  key={r.to}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => commit(i)}
                  onMouseEnter={() => setActive(i)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2.5 py-2 text-left text-[12px] transition-colors",
                    i === active ? "bg-white/10 text-white" : "text-sidebar-foreground/85 hover:bg-white/5",
                  )}
                >
                  {Icon && <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" />}
                  <div className="min-w-0 flex-1">
                    <div className="truncate">{r.label}</div>
                    {r.parents.length > 0 && (
                      <div className="text-[10px] text-sidebar-foreground/45 truncate">{r.parents.join(" › ")}</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Favorites + Recents ---------- */

const FavCtx = React.createContext<{ favs: string[]; isFav: (to: string) => boolean; toggle: (to: string) => void } | null>(null);

function NavFavorites({ tree, pathname }: { tree: Node[]; pathname: string }) {
  const ctx = React.useContext(FavCtx);
  const nav = useNavigate();
  if (!ctx || !ctx.favs.length) return null;
  const flat = flattenTree(tree);
  const favItems = flat.filter((f) => ctx.isFav(f.to));
  if (!favItems.length) return null;
  return (
    <div className="pt-1">
      <div className="px-3 pt-2 pb-1.5 flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.16em] text-sidebar-foreground/45">
        <Star className="h-2.5 w-2.5" /> PINNED
      </div>
      <div className="space-y-0.5">
        {favItems.map((f) => {
          const Icon = f.icon;
          const active = pathMatches(pathname, f.to);
          return (
            <button
              key={f.to}
              onClick={() => nav(f.to)}
              className={cn(
                "group w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12.5px] transition-colors",
                active
                  ? "bg-sidebar-primary/15 text-sidebar-primary font-semibold"
                  : "text-sidebar-foreground/85 hover:bg-white/5 hover:text-white",
              )}
            >
              {Icon && <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" />}
              <span className="flex-1 truncate text-left">{f.label}</span>
              <Star
                className="h-3 w-3 fill-amber-300 text-amber-300 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => { e.stopPropagation(); ctx?.toggle(f.to); }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NavRecent({ tree, pathname }: { tree: Node[]; pathname: string }) {
  const recents = useRecents(pathname);
  const nav = useNavigate();
  const flat = useMemo(() => flattenTree(tree), [tree]);
  const items = recents
    .map((path) => flat.find((f) => f.to === path))
    .filter((x): x is FlatItem => !!x)
    .slice(0, 4);
  if (items.length === 0) return null;
  return (
    <div className="pt-1">
      <div className="px-3 pt-2 pb-1.5 flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.16em] text-sidebar-foreground/45">
        <Clock className="h-2.5 w-2.5" /> RECENT
      </div>
      <div className="space-y-0.5">
        {items.map((r) => {
          const Icon = r.icon;
          const active = pathMatches(pathname, r.to);
          return (
            <button
              key={r.to}
              onClick={() => nav(r.to)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12.5px] transition-colors",
                active
                  ? "bg-sidebar-primary/15 text-sidebar-primary font-semibold"
                  : "text-sidebar-foreground/80 hover:bg-white/5 hover:text-white",
              )}
            >
              {Icon && <Icon className="h-3.5 w-3.5 shrink-0 opacity-70" />}
              <span className="flex-1 truncate text-left">{r.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** True at the `md` breakpoint and up. Used to gate the desktop-only collapse. */
function useIsDesktop() {
  const query = "(min-width: 768px)";
  const [isDesktop, setIsDesktop] = useState<boolean>(() =>
    typeof window === "undefined" ? true : window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    setIsDesktop(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isDesktop;
}

function UserPill({ collapsed }: { collapsed: boolean }) {
  const { displayName, initials, email, avatarUrl, signOut } = useUserProfile();
  const navigate = useNavigate();
  const handleSignOut = async () => { await signOut(); navigate("/"); };

  if (collapsed) {
    return (
      <div className="px-2 py-2 shrink-0 flex flex-col items-center gap-1.5 border-t border-sidebar-border">
        <AccountPanel>
          <button
            title={`${displayName} — open profile`}
            aria-label="Open profile"
            className="h-7 w-7 rounded-full overflow-hidden bg-gradient-to-br from-indigo to-ai grid place-items-center text-white text-[10px] font-bold hover:ring-2 hover:ring-sidebar-accent transition"
          >
            {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : initials}
          </button>
        </AccountPanel>
        <button
          onClick={handleSignOut}
          title="Sign out"
          className="h-6 w-6 rounded grid place-items-center text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
        >
          <LogOut className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="px-3 h-10 flex items-center gap-2 shrink-0 border-t border-sidebar-border">
      <AccountPanel>
        <button
          title="Open profile"
          className="flex items-center gap-2 min-w-0 flex-1 -mx-1 px-1 py-1 rounded hover:bg-sidebar-accent/60 transition-colors"
        >
          <span className="h-6 w-6 rounded-full overflow-hidden bg-gradient-to-br from-indigo to-ai grid place-items-center text-white text-[10px] font-bold shrink-0">
            {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : initials}
          </span>
          <span className="min-w-0 flex-1 text-left text-[12px] font-medium text-sidebar-foreground truncate" title={email || displayName}>
            {displayName}
          </span>
        </button>
      </AccountPanel>
      <button
        onClick={handleSignOut}
        title="Sign out"
        aria-label="Sign out"
        className="h-6 w-6 rounded grid place-items-center text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors shrink-0"
      >
        <LogOut className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

const SECTIONS: { label: string; keys: string[] }[] = [
  { label: "PLATFORM",       keys: ["home", "ops"] },
  { label: "DIGITAL TWINS",  keys: ["sre-practice", "runops-runbooks", "sead", "ai-vlsi"] },
  { label: "AI & DATA",      keys: ["sre-data-orch"] },
  { label: "PRACTICES",      keys: ["runops", "cyber"] },
  { label: "OPERATIONS",     keys: ["carve-op", "itsm", "coworkers"] },
  { label: "ADMIN WORKSPACE", keys: ["crm", "etdm", "settings"] },
];

const ADMIN_ONLY_KEYS = new Set(["crm", "etdm"]);


function findActiveTrail(nodes: Node[], pathname: string, trail: string[] = []): string[] | null {
  for (const n of nodes) {
    const here = [...trail, n.key];
    if (n.children) {
      const sub = findActiveTrail(n.children, pathname, here);
      if (sub) return sub;
    }
    if (pathMatches(pathname, n.to, n.exact)) return here;
  }
  return null;
}

const SIDEBAR_SCROLL_KEY = "eoc.sidebarScroll";
let sidebarScrollPosition = 0;

function openStateFromTrail(activeTrail: string[]): Record<string, Set<string>> {
  const next: Record<string, Set<string>> = {};
  if (activeTrail.length < 1) return next;

  const trail = ["root", ...activeTrail];
  for (let i = 0; i < trail.length - 1; i++) {
    const parent = trail[i];
    const child = trail[i + 1];
    const set = new Set(next[parent] ?? []);
    set.add(child);
    next[parent] = set;
  }
  return next;
}

/* ---------- Component ---------- */

export function EocSidebar({
  mobileOpen = false,
  onMobileClose,
}: {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
} = {}) {
  const { pathname } = useLocation();
  const { isAdmin } = useAuth();
  const { scoped, routes } = useTenantScope();
  const visibleTree = useMemo(() => {
    const base = isAdmin ? tree : tree.filter((n) => !ADMIN_ONLY_KEYS.has(n.key));

    if (!scoped) return base;
    // Always-visible top-level keys for tenant members
    const ALWAYS_KEYS = new Set(["home", "settings"]);
    const filterNode = (n: Node): Node | null => {
      const selfMatches = !!n.to && routes.has(n.to);
      const alwaysOn = ALWAYS_KEYS.has(n.key);
      // If the top-level/section itself is enabled, expose its entire subtree.
      if (alwaysOn || selfMatches) return n;
      const childMatches = (n.children ?? [])
        .map(filterNode)
        .filter(Boolean) as Node[];
      if (childMatches.length) {
        return { ...n, children: childMatches.length ? childMatches : undefined };
      }
      return null;
    };
    return base.map(filterNode).filter(Boolean) as Node[];
  }, [isAdmin, scoped, routes]);
  const activeTrail = useMemo(() => findActiveTrail(visibleTree, pathname) ?? [], [pathname, visibleTree]);

  const isDesktop = useIsDesktop();
  const [collapsedPref, setCollapsedPref] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("eoc.collapsed") === "1";
  });
  useEffect(() => {
    window.localStorage.setItem("eoc.collapsed", collapsedPref ? "1" : "0");
  }, [collapsedPref]);
  // Collapse only applies on desktop — the mobile drawer is always full-width.
  const collapsed = isDesktop ? collapsedPref : false;
  const [quickOpen, setQuickOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("eoc.quickOpen") === "1";
  });
  useEffect(() => {
    window.localStorage.setItem("eoc.quickOpen", quickOpen ? "1" : "0");
  }, [quickOpen]);

  // Preserve sidebar scroll position across route changes (AppShell remounts per page).
  const navRef = useRef<HTMLElement | null>(null);
  const isRestoringScrollRef = useRef(true);
  const restoreScrollPendingRef = useRef(true);
  const persistNavScroll = () => {
    const el = navRef.current;
    if (!el) return;
    sidebarScrollPosition = el.scrollTop;
    sessionStorage.setItem(SIDEBAR_SCROLL_KEY, String(el.scrollTop));
  };
  useLayoutEffect(() => {
    const el = navRef.current;
    if (!el) return;
    let secondFrame = 0;

    const restore = () => {
      const saved = sessionStorage.getItem(SIDEBAR_SCROLL_KEY);
      const nextScroll = sidebarScrollPosition || (saved ? parseInt(saved, 10) || 0 : 0);
      if (nextScroll > 0) el.scrollTop = nextScroll;
    };

    isRestoringScrollRef.current = true;
    restore();
    const firstFrame = requestAnimationFrame(() => {
      restore();
      secondFrame = requestAnimationFrame(() => {
        restore();
        isRestoringScrollRef.current = false;
      });
    });

    const onScroll = () => {
      if (isRestoringScrollRef.current) return;
      sidebarScrollPosition = el.scrollTop;
      sessionStorage.setItem(SIDEBAR_SCROLL_KEY, String(el.scrollTop));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      el.removeEventListener("scroll", onScroll);
    };
  }, []);

  // openByParent: parentKey -> set of open child keys (accordion: at most one unless pinned)
  const [openByParent, setOpenByParent] = useState<Record<string, Set<string>>>(() => openStateFromTrail(activeTrail));
  const [pinned, setPinned] = useState<Set<string>>(new Set());

  // Auto-open the active trail. Replace (not merge) so navigating to a new
  // section closes the previously-open one — only the current route's parents
  // stay open. Pinned sections are always preserved.
  useLayoutEffect(() => {
    if (activeTrail.length < 1) return;
    restoreScrollPendingRef.current = true;
    setOpenByParent(() => {
      const next: Record<string, Set<string>> = {};
      const activeOpenState = openStateFromTrail(activeTrail);
      for (const [parent, children] of Object.entries(activeOpenState)) {
        next[parent] = new Set(children);
      }
      for (const id of pinned) {
        const [p, c] = id.split("/");
        next[p] = next[p] ?? new Set();
        next[p].add(c);
      }
      return next;
    });
    // `pinned` intentionally excluded from deps: re-running on pin toggle would
    // collapse manually-opened siblings.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTrail]);

  useLayoutEffect(() => {
    if (!restoreScrollPendingRef.current) return;
    const el = navRef.current;
    if (!el) return;
    let secondFrame = 0;
    const restore = () => {
      const saved = sessionStorage.getItem(SIDEBAR_SCROLL_KEY);
      const nextScroll = sidebarScrollPosition || (saved ? parseInt(saved, 10) || 0 : 0);
      if (nextScroll > 0) el.scrollTop = nextScroll;
    };
    isRestoringScrollRef.current = true;
    restore();
    const firstFrame = requestAnimationFrame(() => {
      restore();
      secondFrame = requestAnimationFrame(() => {
        restore();
        restoreScrollPendingRef.current = false;
        isRestoringScrollRef.current = false;
      });
    });
    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, [pathname, openByParent]);

  const isOpen = (parentKey: string, childKey: string) =>
    !!openByParent[parentKey]?.has(childKey) || pinned.has(`${parentKey}/${childKey}`);

  const toggleOpen = (parentKey: string, childKey: string) => {
    setOpenByParent((prev) => {
      const cur = new Set(prev[parentKey] ?? []);
      if (cur.has(childKey)) {
        // Closing the open section.
        cur.delete(childKey);
        return { ...prev, [parentKey]: cur };
      }
      // Accordion: opening a section closes its siblings, but pinned siblings stay open.
      const next = new Set<string>();
      for (const id of pinned) {
        const [p, c] = id.split("/");
        if (p === parentKey) next.add(c);
      }
      next.add(childKey);
      return { ...prev, [parentKey]: next };
    });
  };

  const togglePin = (parentKey: string, childKey: string) => {
    const id = `${parentKey}/${childKey}`;
    const wasPinned = pinned.has(id);
    setPinned((prev) => {
      const next = new Set(prev);
      if (wasPinned) next.delete(id);
      else next.add(id);
      return next;
    });
    if (!wasPinned) {
      // ensure open when pinning (separate setter — no side effects inside updater)
      setOpenByParent((p) => {
        const cur = new Set(p[parentKey] ?? []);
        cur.add(childKey);
        return { ...p, [parentKey]: cur };
      });
    }
  };

  const collapseAll = () => {
    const keep: Record<string, Set<string>> = {};
    for (const id of pinned) {
      const [p, c] = id.split("/");
      keep[p] = keep[p] ?? new Set();
      keep[p].add(c);
    }
    setOpenByParent(keep);
  };

  const favApi = useFavorites();

  return (
    <FavCtx.Provider value={favApi}>
    <aside
      aria-label="Primary navigation"
      data-collapsed={collapsed ? "true" : "false"}
      className={cn(
        "flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border",
        "will-change-[width,transform]",
        // Mobile: fixed overlay drawer — reserves no layout space.
        "fixed inset-y-0 left-0 z-50 h-dvh",
        // Desktop: in-flow sticky column that reserves exactly its own width,
        // so collapsing it lets `main` reclaim the space with no margin hacks.
        "md:sticky md:top-0 md:z-30 md:h-screen md:self-start",
        // Width: 280 expanded, 72 collapsed (collapse is desktop-only).
        "w-[280px]",
        collapsed && "md:w-[72px]",
        // Slide the drawer in/out on mobile; always visible from md up.
        mobileOpen ? "translate-x-0" : "-translate-x-full",
        "md:translate-x-0",
        // Snappy width + slide transitions.
        "transition-[width,transform] duration-200 ease-out",
        // Floating depth on the mobile drawer; flat column on desktop.
        "shadow-2xl md:shadow-none",
      )}
    >
      {/* Brand — fixed header (does not scroll) */}
      <div className={cn(
        "flex items-center h-[68px] border-b border-sidebar-border shrink-0",
        collapsed ? "px-2 justify-center" : "px-3 gap-3",
      )}>
        {collapsed ? (
          // Collapsed: centered logo doubles as the expand button.
          <button
            onClick={() => setCollapsedPref(false)}
            aria-label="Expand sidebar"
            title="Expand sidebar"
            className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo to-ai grid place-items-center shadow-[var(--shadow-md)] hover:opacity-90 transition-opacity"
          >
            <ShieldAlert className="h-5 w-5 text-white" />
          </button>
        ) : (
          <>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo to-ai grid place-items-center shadow-[var(--shadow-md)] shrink-0">
              <ShieldAlert className="h-5 w-5 text-white" />
            </div>
            <div className="leading-tight flex-1 min-w-0">
              <div className="tracking-[0.18em] text-sidebar-foreground font-bold text-lg font-sans">neuGAIN</div>
              <div className="text-[11px] font-medium tracking-wide text-sidebar-foreground/60 uppercase">AI Platform</div>
            </div>
            {/* Desktop collapse toggle */}
            <button
              onClick={() => setCollapsedPref(true)}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
              className="hidden md:grid h-7 w-7 rounded-md place-items-center text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors shrink-0"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            {/* Mobile close (drawer) */}
            <button
              onClick={onMobileClose}
              aria-label="Close menu"
              title="Close menu"
              className="md:hidden grid h-7 w-7 rounded-md place-items-center text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* Nav (independent scroll) */}
      <nav
        ref={navRef}
        aria-label="Sections"
        className="sidebar-scroll flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 space-y-1"
      >
        {!collapsed && (
          <NavSearch tree={visibleTree} />
        )}
        {!collapsed && <NavFavorites tree={visibleTree} pathname={pathname} />}
        {!collapsed && <NavRecent tree={visibleTree} pathname={pathname} />}

        {(() => {
          const byKey = new Map(visibleTree.map((n) => [n.key, n] as const));
          const claimed = new Set<string>();
          return (
            <>
              {SECTIONS.map((section) => {
                const nodes = section.keys
                  .map((k) => byKey.get(k))
                  .filter((n): n is Node => {
                    if (!n) return false;
                    claimed.add(n.key);
                    return true;
                  });
                if (!nodes.length) return null;
                return (
                  <div key={section.label} className="pt-3">
                    {!collapsed && (
                      <div className="px-3 pt-2 pb-1.5 text-[10px] font-semibold tracking-[0.16em] text-sidebar-foreground/45">
                        {section.label}
                      </div>
                    )}
                    <div className="space-y-0.5">
                      {nodes.map((node) => (
                        <SidebarNode
                          key={node.key}
                          node={node}
                          depth={0}
                          parentKey="root"
                          collapsed={collapsed}
                          pathname={pathname}
                          isOpen={isOpen}
                          toggleOpen={toggleOpen}
                          togglePin={togglePin}
                          pinned={pinned}
                          persistScroll={persistNavScroll}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Uncategorized fallback (keeps future nodes visible even if not sectioned yet) */}
              {(() => {
                const rest = visibleTree.filter((n) => !claimed.has(n.key));
                if (!rest.length) return null;
                return (
                  <div className="pt-3">
                    {!collapsed && (
                      <div className="px-3 pt-2 pb-1.5 text-[10px] font-semibold tracking-[0.16em] text-sidebar-foreground/45">
                        MORE
                      </div>
                    )}
                    <div className="space-y-0.5">
                      {rest.map((node) => (
                        <SidebarNode
                          key={node.key}
                          node={node}
                          depth={0}
                          parentKey="root"
                          collapsed={collapsed}
                          pathname={pathname}
                          isOpen={isOpen}
                          toggleOpen={toggleOpen}
                          togglePin={togglePin}
                          pinned={pinned}
                          persistScroll={persistNavScroll}
                        />
                      ))}
                    </div>
                  </div>
                );
              })()}
            </>
          );
        })()}
      </nav>


      {/* Quick Actions */}
      <div className="px-3 pt-2 shrink-0">
        {!collapsed && (
          <button
            onClick={() => setQuickOpen((v) => !v)}
            className="w-full flex items-center justify-between px-0 py-1 text-[10px] font-semibold tracking-[0.14em] text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
            aria-expanded={quickOpen}
          >
            <span>QUICK ACTIONS</span>
            {quickOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
        )}
        {(collapsed || quickOpen) && (
          <div className="space-y-1 mt-1">
            {quickActions.map((q) => {
              const Icon = q.icon;
              return (
                <button
                  key={q.label}
                  type="button"
                  title={collapsed ? q.label : undefined}
                  aria-label={q.label}
                  className="w-full flex items-center gap-2.5 rounded-lg px-1 py-1.5 text-xs font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                >
                  <span className={cn("h-7 w-7 rounded-md grid place-items-center shrink-0", toneClass[q.tone])}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  {!collapsed && <span className="truncate">{q.label}</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* User profile */}
      <UserPill collapsed={collapsed} />
    </aside>
    </FavCtx.Provider>
  );
}

/* ---------- Recursive node ---------- */

type NodeProps = {
  node: Node;
  depth: number;
  parentKey: string;
  collapsed: boolean;
  pathname: string;
  isOpen: (parent: string, child: string) => boolean;
  toggleOpen: (parent: string, child: string) => void;
  togglePin: (parent: string, child: string) => void;
  pinned: Set<string>;
  persistScroll: () => void;
};

function SidebarNode(props: NodeProps) {
  const { node, depth, parentKey, collapsed, pathname, isOpen, toggleOpen, togglePin, pinned, persistScroll } = props;
  const nav = useNavigate();
  const fav = React.useContext(FavCtx);
  const Icon = node.icon;
  const hasChildren = !!node.children?.length;
  const id = `${parentKey}/${node.key}`;
  const open = hasChildren ? isOpen(parentKey, node.key) : false;
  const showChildren = open;
  const isPinned = pinned.has(id);

  const active = pathMatches(pathname, node.to, node.exact);
  const trailActive = useMemo(() => {
    if (!hasChildren) return false;
    const trail = findActiveTrail([node], pathname);
    return !!trail && trail.length > 1;
  }, [pathname, node, hasChildren]);

  const handleRowClick = (e: React.MouseEvent) => {
    if (collapsed) return;
    e.stopPropagation();
    persistScroll();
    if (hasChildren) {
      // Row click never collapses — only the chevron does.
      // Row click only opens (and navigates if the node has a route).
      if (node.to) nav(node.to);
      if (!open) toggleOpen(parentKey, node.key);
      return;
    }
    if (node.to) nav(node.to);
  };

  // Compact (depth 0 only): icon button with HoverCard flyout
  if (collapsed && depth === 0) {
    const Btn = (
      <button
        onClick={() => {
          persistScroll();
          if (node.to) nav(node.to);
        }}
        className={cn(
          "relative w-12 h-10 mx-auto flex items-center justify-center rounded-lg transition-colors",
          (active || trailActive)
            ? "bg-sidebar-primary/20 text-sidebar-primary"
            : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        )}
      >
        {Icon && <Icon className="h-[18px] w-[18px]" />}
        {node.badge && (
          <span className="absolute -top-0.5 -right-0.5 text-[9px] font-bold px-1 py-px rounded-md bg-status-critical text-white">
            {node.badge}
          </span>
        )}
      </button>
    );
    if (!hasChildren) return <div className="my-0.5">{Btn}</div>;
    return (
      <div className="my-0.5">
        <HoverCard openDelay={80} closeDelay={120}>
          <HoverCardTrigger asChild>{Btn}</HoverCardTrigger>
          <HoverCardContent side="right" align="start" sideOffset={8} className="w-72 p-2 bg-sidebar text-sidebar-foreground border-sidebar-border">
            <div className="px-2 py-1.5 text-[11px] font-semibold tracking-wider uppercase text-sidebar-foreground/70">
              {node.label}
            </div>
            <div className="space-y-0.5 max-h-[60vh] overflow-y-auto">
              {node.children!.map((c) => (
                <FlyoutItem key={c.key} node={c} pathname={pathname} depth={0} />
              ))}
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
    );
  }

  // Expanded mode rendering
  const indent = depth === 0 ? "px-2.5" : depth === 1 ? "pl-6 pr-2" : "pl-9 pr-2";
  const sizeText = depth === 0 ? "text-sm" : depth === 1 ? "text-[12px]" : "text-[11px]";
  const py = depth === 0 ? "py-2.5" : "py-1.5";

  return (
    <div>
      <div
        role={hasChildren ? "button" : "link"}
        tabIndex={0}
        aria-expanded={hasChildren ? open : undefined}
        aria-current={active ? "page" : undefined}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleRowClick(e as unknown as React.MouseEvent);
          }
        }}
        className={cn(
          "group relative w-full flex items-center gap-1.5 rounded-lg transition-colors cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
          indent, py, sizeText,
          active
            ? "bg-sidebar-primary/15 text-sidebar-primary font-medium"
            : trailActive
              ? "bg-sidebar-accent/60 text-sidebar-accent-foreground font-medium"
              : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        )}
        onClick={handleRowClick}
      >
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r bg-sidebar-primary shadow-[0_0_10px_hsl(var(--sidebar-primary)/0.6)]" />
        )}
        {Icon && (
          <Icon className={cn(
            depth === 0 ? "h-[18px] w-[18px]" : "h-3.5 w-3.5",
            "shrink-0 transition-transform duration-200 group-hover:scale-110",
          )} />
        )}
        <span className={cn("flex-1 text-left truncate", depth === 0 ? "font-semibold" : "")}>{node.label}</span>

        {node.statusDot && (
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full shrink-0",
              node.statusDot === "green" && "bg-emerald-400",
              node.statusDot === "amber" && "bg-amber-400",
              node.statusDot === "red" && "bg-rose-400",
              node.statusDot === "blue" && "bg-sky-400",
            )}
            aria-hidden
          />
        )}

        {node.pill && (
          <span className={cn(
            "text-[8.5px] font-bold px-1.5 py-0.5 rounded tracking-wide shrink-0",
            node.pill === "LIVE" && "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30",
            node.pill === "NEW" && "bg-sky-500/20 text-sky-300 border border-sky-400/30",
            node.pill === "BETA" && "bg-purple-500/20 text-purple-300 border border-purple-400/30",
            node.pill === "DRAFT" && "bg-slate-500/25 text-slate-300 border border-slate-400/30",
          )}>
            {node.pill}
          </span>
        )}

        {node.badge && (
          <span className={cn(
            "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
            node.badgeTone === "critical" ? "bg-status-critical text-white" : "bg-status-warning text-white",
          )}>
            {node.badge}
          </span>
        )}

        {/* Favorite star (leaves only) */}
        {!hasChildren && node.to && fav && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); fav.toggle(node.to!); }}
            aria-label={fav.isFav(node.to) ? "Unpin from favorites" : "Pin to favorites"}
            title={fav.isFav(node.to) ? "Remove from Pinned" : "Add to Pinned"}
            className={cn(
              "h-5 w-5 grid place-items-center rounded transition-opacity",
              fav.isFav(node.to) ? "opacity-100 text-amber-300" : "opacity-0 group-hover:opacity-60 hover:opacity-100",
            )}
          >
            <Star className={cn("h-3 w-3", fav.isFav(node.to) && "fill-current")} />
          </button>
        )}



        {hasChildren && (
          <>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); persistScroll(); togglePin(parentKey, node.key); }}
              aria-label={isPinned ? `Unpin ${node.label}` : `Pin ${node.label} open`}
              aria-pressed={isPinned}
              title={isPinned ? "Unpin section" : "Pin section open"}
              className={cn(
                "h-5 w-5 grid place-items-center rounded transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                isPinned ? "opacity-100 text-status-warning" : "opacity-0 group-hover:opacity-70 hover:opacity-100 focus-visible:opacity-100",
              )}
            >
              {isPinned ? <Pin className="h-3 w-3 fill-current" /> : <Pin className="h-3 w-3" />}
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); persistScroll(); toggleOpen(parentKey, node.key); }}
              className="h-5 w-5 grid place-items-center rounded hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
              aria-label={open ? `Collapse ${node.label}` : `Expand ${node.label}`}
              aria-expanded={open}
            >
              <ChevronRight
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200 ease-out",
                  open && "rotate-90",
                )}
              />
            </button>
          </>
        )}
      </div>

      {/* Children (animated) */}
      {hasChildren && (
        <div
          className={cn(
            "grid transition-[grid-template-rows] ease-out",
            showChildren ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
          style={{ transitionDuration: "250ms" }}
        >
          <div className="overflow-hidden">
            <div className={cn(
              "ml-4 mt-0.5 pl-3 border-l border-sidebar-border/70 space-y-0.5",
            )}>
              {node.children!.map((c) => (
                <SidebarNode
                  key={c.key}
                  node={c}
                  depth={depth + 1}
                  parentKey={node.key}
                  collapsed={false}
                  pathname={pathname}
                  isOpen={isOpen}
                  toggleOpen={toggleOpen}
                  togglePin={togglePin}
                  pinned={pinned}
                  persistScroll={persistScroll}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Flyout item (compact mode) ---------- */

function FlyoutItem({ node, pathname, depth }: { node: Node; pathname: string; depth: number }) {
  const hasChildren = !!node.children?.length;
  const active = pathMatches(pathname, node.to, node.exact);
  const Icon = node.icon;
  return (
    <div>
      {node.to ? (
        <NavLink
          to={node.to}
          className={cn(
            "flex items-center gap-2 rounded-md px-2 py-1.5 text-[12px] transition-colors",
            depth > 0 && "ml-3 text-[11px]",
            active
              ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
              : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          )}
        >
          {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
          <span className="truncate">{node.label}</span>
        </NavLink>
      ) : (
        <div className={cn("px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/60", depth > 0 && "ml-3")}>
          {node.label}
        </div>
      )}
      {hasChildren && (
        <div className="space-y-0.5 mt-0.5">
          {node.children!.map((c) => (
            <FlyoutItem key={c.key} node={c} pathname={pathname} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
