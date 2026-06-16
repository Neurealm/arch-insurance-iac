import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Home, LayoutGrid, AlertTriangle, Bell, GitBranch, Boxes, Bot,
  Building2, BarChart3, ShieldCheck, BookOpen, ScrollText, Settings,
  ChevronsLeft, ChevronsRight, Plus, Zap, FileBarChart2, AlertOctagon, ShieldAlert,
  Scissors, ChevronRight, ChevronDown, Pin, Activity, Network as NetIcon, Server, Workflow,
  Briefcase, Smile, Target, ShieldX, Headphones, Users,
  Library, Package, Layers, Cloud, TrendingUp as TrendingUp2, DollarSign as DollarSign2,
  Sparkles as Sparkles2, CheckCircle2 as CheckCircle2b,
  ShieldHalf,
  ClipboardList,
  ArrowRightLeft, Rocket, Compass, Gauge,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { carveOutGroups } from "@/data/carveout";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/context/AuthContext";
import { useTenantScope } from "@/hooks/useTenantScope";
import { LogOut } from "lucide-react";

/* ---------- Tree model ---------- */

type Node = {
  key: string;
  label: string;
  icon?: LucideIcon;
  to?: string;
  badge?: string;
  badgeTone?: "critical" | "warning";
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
  { key: "home",       label: "Command Center",      icon: Home,          to: "/app" },
  {
    key: "aocp",
    label: "App Ops Control Plane",
    icon: Package,
    to: "/aocp/claims-processing",
    navOnClick: true,
    children: [
      {
        key: "aocp-intel", label: "Application Intelligence", icon: Layers,
        children: [
          { key: "aocp-profile",   label: "Application Profile",       icon: Package,     to: "/aocp/claims-processing" },
          { key: "aocp-env",       label: "Environment Model",         icon: Server,      to: "/aocp/claims-processing/environments" },
          { key: "aocp-crit",      label: "Business Criticality",      icon: ShieldAlert, to: "/aocp/claims-processing/criticality" },
          { key: "aocp-outcomes",  label: "Desired Outcomes",          icon: Target,      to: "/aocp/claims-processing/outcomes" },
          { key: "aocp-lifecycle", label: "Lifecycle & Tech Debt",     icon: GitBranch,   to: "/aocp/claims-processing/lifecycle" },
          { key: "aocp-admin",     label: "Admin Model",               icon: Settings,    to: "/aocp/claims-processing/admin" },
        ],
      },
      {
        key: "aocp-infra", label: "Infrastructure", icon: Server,
        children: [
          { key: "aocp-hosting",  label: "Hosting Platform",     icon: Cloud,    to: "/aocp/claims-processing/hosting" },
          { key: "aocp-compute",  label: "Compute Services",     icon: Server,   to: "/aocp/claims-processing/compute" },
          { key: "aocp-storage",  label: "Storage & Data",       icon: Boxes,    to: "/aocp/claims-processing/storage" },
          { key: "aocp-db",       label: "Database Services",    icon: Workflow, to: "/aocp/claims-processing/databases" },
          { key: "aocp-net",      label: "Network & Edge",       icon: NetIcon,  to: "/aocp/claims-processing/network" },
          { key: "aocp-drift",    label: "Config & Drift",       icon: ShieldAlert, to: "/aocp/claims-processing/config-drift" },
        ],
      },
      {
        key: "aocp-ops", label: "Operations", icon: Activity,
        children: [
          { key: "aocp-tasks",     label: "Task Inventory",       icon: ClipboardList, to: "/aocp/claims-processing/tasks" },
          { key: "aocp-support",   label: "Support Scope L1–L4",  icon: Headphones,    to: "/aocp/claims-processing/support-scope" },
          { key: "aocp-workload",  label: "Workload Profile",     icon: BarChart3,     to: "/aocp/claims-processing/workload" },
          { key: "aocp-catalog",   label: "Service Catalog",      icon: BookOpen,      to: "/aocp/claims-processing/service-catalog" },
          { key: "aocp-escalation",label: "Escalation & On-Call", icon: Bell,          to: "/aocp/claims-processing/escalation" },
        ],
      },
      {
        key: "aocp-ai", label: "Automation & AI", icon: Bot,
        children: [
          { key: "aocp-auto-cat",  label: "Automation Catalog",      icon: Zap,      to: "/aocp/claims-processing/automation-catalog" },
          { key: "aocp-heatmap",   label: "Opportunity Heatmap",     icon: BarChart3,to: "/aocp/claims-processing/automation-heatmap" },
          { key: "aocp-remediate", label: "Auto Remediation",        icon: Workflow, to: "/aocp/claims-processing/auto-remediation" },
          { key: "aocp-dc-cat",    label: "Digital Coworker Catalog",icon: Bot,      to: "/aocp/claims-processing/coworker-catalog" },
          { key: "aocp-agentic",   label: "Agentic Workflow Library", icon: Sparkles2, to: "/aocp/claims-processing/agentic-workflows" },
          { key: "aocp-raci",      label: "RACI Matrix",             icon: Users,    to: "/aocp/claims-processing/raci" },
          { key: "aocp-gov",       label: "Agentic Governance",      icon: ShieldCheck, to: "/aocp/claims-processing/agentic-governance" },
          { key: "aocp-roi",       label: "Automation Value & ROI",  icon: TrendingUp2, to: "/aocp/claims-processing/automation-roi" },
        ],
      },
      {
        key: "aocp-exec", label: "Executive", icon: Briefcase,
        children: [
          { key: "aocp-maturity",  label: "Maturity Model",       icon: Target,      to: "/aocp/claims-processing/maturity" },
          { key: "aocp-cost",      label: "Internal Cost Model",  icon: DollarSign2, to: "/aocp/claims-processing/cost-model" },
          { key: "aocp-pricing",   label: "Customer Pricing",     icon: FileBarChart2, to: "/aocp/claims-processing/pricing" },
          { key: "aocp-scenario",  label: "Scenario Modeling",    icon: LayoutGrid,  to: "/aocp/claims-processing/scenarios" },
          { key: "aocp-runops",    label: "Final RunOps Model",   icon: CheckCircle2b, to: "/aocp/claims-processing/runops-model" },
        ],
      },
    ],
  },
  { key: "ops",        label: "Operations Overview", icon: LayoutGrid,    to: "/operations" },
  {
    key: "sre-practice",
    label: "Site Resilience Engineering",
    icon: ShieldCheck,
    children: [
      { key: "sre-ofi", label: "Enterprise Friction Index", icon: TrendingUp2, to: "/operational-friction-index" },
      { key: "sre-fnd", label: "Foundations of Production Reliability Operating Model", icon: Compass, to: "/reliability-foundations" },
      { key: "sre-anat", label: "Anatomy of a Modern Product Reliability Organization", icon: Compass, to: "/product-reliability-anatomy" },
      { key: "sre-tj", label: "Production Reliability Transformation Journey", icon: TrendingUp2, to: "/transformation-journey" },
      { key: "sre-ms", label: "Measuring Success", icon: Gauge, to: "/measuring-success" },
      { key: "sre-hro", label: "How a Modern Product Reliability Organization Operates", icon: Workflow, to: "/how-reliability-operates" },
      { key: "sre-cmd", label: "PROD Resilience Command Center", icon: Activity, to: "/prod-resilience-twin" },
      { key: "sre-plm", label: "HHAX Product Line Map", icon: Package, to: "/product-line-map" },
      { key: "sre-gwm", label: "HHAX Golden Workflow Map", icon: Workflow, to: "/golden-workflow-map" },
      { key: "sre-topo", label: "HHAX Production Topology Digital Twin", icon: NetIcon, to: "/production-topology" },
      { key: "sre-opmodel", label: "HHAX SRE Operating Model Cockpit", icon: Activity, to: "/sre-operating-model" },
      { key: "sre-signal", label: "Signal Intelligence", icon: Activity, to: "/signal-intelligence" },
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
  { key: "carve-op",   label: "IT Carve-Out & Separation Operating Model", icon: Scissors, to: "/carve-out", children: carveOpModelChildren },
  { key: "itsm",       label: "IT Service Desk & ITSM Operations", icon: Headphones, to: "/itsm", children: itsmChildren },
  { key: "services",   label: "Business Services",   icon: Boxes,         to: "/itsm/exec-biz-ops/business-services" },
  { key: "coworkers",  label: "Digital Coworkers",   icon: Bot,           to: "/coworkers", children: coworkerChildren },
  { key: "vendors",    label: "Vendor Management",   icon: Building2,     to: "/vendors" },
  { key: "reports",    label: "Reports & Analytics", icon: BarChart3,     to: "/reports" },
  { key: "risk",       label: "Risk & Compliance",   icon: ShieldCheck,   to: "/risk" },
  { key: "knowledge",  label: "Knowledge Center",    icon: BookOpen,      to: "/knowledge" },
  { key: "audit",      label: "Audit & Logs",        icon: ScrollText,    to: "/audit" },
  { key: "questionnaires", label: "Questionnaires", icon: ClipboardList, to: "/questionnaires" },
  { key: "settings",   label: "Settings",            icon: Settings,      to: "/settings", exact: true },
  { key: "crm", label: "Customer Relation Manager", icon: Building2, to: "/crm" },
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

function UserPill({ collapsed }: { collapsed: boolean }) {
  const { displayName, initials, email, signOut } = useUserProfile();
  const navigate = useNavigate();
  const handleSignOut = async () => { await signOut(); navigate("/"); };

  if (collapsed) {
    return (
      <div className="px-2 py-2 shrink-0 flex flex-col items-center gap-1.5 border-t border-sidebar-border">
        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo to-ai grid place-items-center text-white text-[10px] font-bold" title={displayName}>
          {initials}
        </div>
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
      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo to-ai grid place-items-center text-white text-[10px] font-bold shrink-0">
        {initials}
      </div>
      <div className="min-w-0 flex-1 text-[12px] font-medium text-sidebar-foreground truncate" title={email || displayName}>
        {displayName}
      </div>
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

const SECTION_LABELS: Record<string, string> = {
  home: "PLATFORM",
  "sre-practice": "PRACTICES",
  "carve-op": "OPERATIONS",
  vendors: "WORKSPACE",
};

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

export function EocSidebar() {
  const { pathname } = useLocation();
  const { isAdmin } = useAuth();
  const { scoped, routes } = useTenantScope();
  const visibleTree = useMemo(() => {
    const base = isAdmin ? tree : tree.filter((n) => n.key !== "settings");
    if (!scoped) return base;
    // Always-visible top-level keys for tenant members
    const ALWAYS_KEYS = new Set(["home"]);
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

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("eoc.collapsed") === "1";
  });
  useEffect(() => {
    window.localStorage.setItem("eoc.collapsed", collapsed ? "1" : "0");
  }, [collapsed]);
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

  // Auto-open the active trail
  useLayoutEffect(() => {
    if (activeTrail.length < 1) return;
    restoreScrollPendingRef.current = true;
    setOpenByParent((prev) => {
      const next = { ...prev };
      const activeOpenState = openStateFromTrail(activeTrail);
      for (const [parent, children] of Object.entries(activeOpenState)) {
        const set = new Set(next[parent] ?? []);
        children.forEach((child) => set.add(child));
        next[parent] = set;
      }
      return next;
    });

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
      if (cur.has(childKey)) cur.delete(childKey);
      else cur.add(childKey);
      return { ...prev, [parentKey]: cur };
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

  const w = collapsed ? "w-[72px]" : "w-[284px]";

  return (
    <aside
      aria-label="Primary navigation"
      className={cn(
        "flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border shrink-0 h-dvh sticky top-0",
        "transition-[width] duration-300 ease-out",
        w,
      )}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-3 h-[68px] border-b border-sidebar-border shrink-0">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo to-ai grid place-items-center shadow-[var(--shadow-md)] shrink-0">
          <ShieldAlert className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <div className="leading-tight flex-1 min-w-0">
            <div className="tracking-[0.18em] text-sidebar-foreground font-bold text-lg font-sans">neuGAIN</div>
            <div className="text-[11px] font-medium tracking-wide text-sidebar-foreground/60 uppercase">AI Platform</div>
          </div>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="h-7 w-7 rounded-md grid place-items-center text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors shrink-0"
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav (independent scroll) */}
      <nav
        ref={navRef}
        aria-label="Sections"
        className="sidebar-scroll flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 space-y-0.5"
      >
        {visibleTree.map((node) => {
          const label = !collapsed ? SECTION_LABELS[node.key] : undefined;
          return (
            <div key={node.key}>
              {label && (
                <div className="px-3 pt-3 pb-1 text-[10px] font-semibold tracking-[0.14em] text-sidebar-foreground/50">
                  {label}
                </div>
              )}
              <SidebarNode
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
            </div>
          );
        })}
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
            ? "bg-status-critical/15 text-status-critical"
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
            ? "bg-status-critical/15 text-status-critical font-medium"
            : trailActive
              ? "bg-sidebar-accent/60 text-sidebar-accent-foreground font-medium"
              : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        )}
        onClick={handleRowClick}
      >
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r bg-status-critical" />
        )}
        {Icon && <Icon className={cn(depth === 0 ? "h-[18px] w-[18px]" : "h-3.5 w-3.5", "shrink-0")} />}
        <span className={cn("flex-1 text-left truncate", depth === 0 ? "font-medium" : "")}>{node.label}</span>

        {node.badge && (
          <span className={cn(
            "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
            node.badgeTone === "critical" ? "bg-status-critical text-white" : "bg-status-warning text-white",
          )}>
            {node.badge}
          </span>
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
