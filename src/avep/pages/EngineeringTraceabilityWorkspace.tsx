import { useEffect, useMemo, useRef, useState } from "react";
import {
  Network, Sparkles, ShieldCheck, Users, Download, Search, ChevronRight,
  ChevronDown, AlertTriangle, CheckCircle2, XCircle, Activity, GitBranch,
  Layers, FileText, Cpu, Radio, Zap, Boxes, FolderTree, BadgeCheck,
  ArrowRight, TrendingUp, Wand2, Link2,
} from "lucide-react";

/* --------------------------------- tokens --------------------------------- */

const card: React.CSSProperties = {
  background: "hsl(var(--avep-surface))",
  border: "1px solid hsl(var(--avep-border))",
  borderRadius: "var(--avep-radius-md)",
  boxShadow: "var(--avep-shadow-xs)",
};

const label2xs: React.CSSProperties = {
  fontSize: "var(--avep-text-2xs)",
  letterSpacing: "var(--avep-tracking-wide)",
  color: "hsl(var(--avep-foreground-subtle))",
  textTransform: "uppercase",
  fontWeight: 600,
};

type Tone = "ok" | "warn" | "err" | "info" | "neutral" | "accent";
const toneMap: Record<Tone, { bg: string; fg: string; dot: string }> = {
  ok:      { bg: "hsl(142 70% 94%)", fg: "hsl(142 65% 28%)", dot: "hsl(142 65% 42%)" },
  warn:    { bg: "hsl(38 100% 92%)", fg: "hsl(28 85% 34%)",  dot: "hsl(35 92% 52%)" },
  err:     { bg: "hsl(0 90% 95%)",   fg: "hsl(0 72% 40%)",   dot: "hsl(0 78% 55%)" },
  info:    { bg: "hsl(var(--avep-primary-soft))", fg: "hsl(var(--avep-primary))", dot: "hsl(var(--avep-primary))" },
  neutral: { bg: "hsl(var(--avep-surface-muted))", fg: "hsl(var(--avep-foreground-muted))", dot: "hsl(var(--avep-foreground-subtle))" },
  accent:  { bg: "hsl(var(--avep-accent-soft))", fg: "hsl(var(--avep-accent))", dot: "hsl(var(--avep-accent))" },
};

function Badge({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  const s = toneMap[tone];
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded"
      style={{ background: s.bg, color: s.fg, fontSize: "var(--avep-text-2xs)", fontWeight: 600 }}>
      {children}
    </span>
  );
}

function Btn({ children, variant = "ghost", onClick, icon: Icon, title }:
  { children: React.ReactNode; variant?: "primary" | "ghost" | "soft"; onClick?: () => void; icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>; title?: string }) {
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: "hsl(var(--avep-primary))", color: "hsl(var(--avep-primary-foreground))", border: "1px solid hsl(var(--avep-primary))" },
    soft:    { background: "hsl(var(--avep-primary-soft))", color: "hsl(var(--avep-primary))", border: "1px solid hsl(var(--avep-primary-soft))" },
    ghost:   { background: "hsl(var(--avep-surface))", color: "hsl(var(--avep-foreground))", border: "1px solid hsl(var(--avep-border))" },
  };
  return (
    <button type="button" title={title} onClick={onClick}
      className="inline-flex items-center gap-1.5 px-2.5 h-8 rounded-md transition-colors hover:opacity-90"
      style={{ ...styles[variant], fontSize: "var(--avep-text-sm)", fontWeight: 500 }}>
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}

function useCounter(target: number, ms = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / ms);
      setV(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

function SectionHeader({ icon: Icon, title, hint, right }:
  { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; title: string; hint?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" style={{ color: "hsl(var(--avep-primary))" }} />
        <div>
          <div style={{ fontSize: "var(--avep-text-md)", fontWeight: 600 }}>{title}</div>
          {hint && <div style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>{hint}</div>}
        </div>
      </div>
      {right}
    </div>
  );
}

function Kpi({ label, value, hint, tone = "info", suffix = "" }:
  { label: string; value: number; hint: string; tone?: Tone; suffix?: string }) {
  const v = useCounter(value);
  const s = toneMap[tone];
  return (
    <div className="p-3.5" style={card} title={hint}>
      <div style={label2xs}>{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <div style={{ fontSize: "var(--avep-text-2xl)", fontWeight: 700, color: s.fg, lineHeight: 1.1 }}>
          {suffix === "%" ? v.toFixed(1) : Math.round(v).toLocaleString()}
        </div>
        <span style={{ fontSize: "var(--avep-text-md)", color: "hsl(var(--avep-foreground-subtle))" }}>{suffix}</span>
      </div>
      <div style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>{hint}</div>
    </div>
  );
}

/* --------------------------------- data ---------------------------------- */

type NodeKind =
  | "Requirement" | "Architecture" | "Interface" | "Register" | "RTL"
  | "Assertion" | "Test" | "Formal" | "Simulation" | "Coverage"
  | "Defect" | "Change" | "Approval" | "Evidence" | "Spec";

const KIND_TONE: Record<NodeKind, Tone> = {
  Requirement:  "info",
  Architecture: "accent",
  Interface:    "info",
  Register:     "neutral",
  RTL:          "info",
  Assertion:    "accent",
  Test:         "ok",
  Formal:       "accent",
  Simulation:   "ok",
  Coverage:     "warn",
  Defect:       "err",
  Change:       "warn",
  Approval:     "ok",
  Evidence:     "neutral",
  Spec:         "info",
};

interface GNode { id: string; kind: NodeKind; label: string; x: number; y: number; broken?: boolean; owner?: string; }
interface GEdge { s: string; t: string; kind: EdgeKind; broken?: boolean; }
type EdgeKind =
  | "Implements" | "Verifies" | "DependsOn" | "AllocatedTo" | "DerivedFrom"
  | "Impacts" | "Approves" | "Tests" | "Covers" | "Changes" | "Fails"
  | "Resolves" | "CertifiedBy";

const EDGE_COLORS: Record<EdgeKind, string> = {
  Implements: "hsl(var(--avep-primary))",
  Verifies:   "hsl(142 65% 42%)",
  DependsOn:  "hsl(210 15% 60%)",
  AllocatedTo:"hsl(var(--avep-accent))",
  DerivedFrom:"hsl(260 60% 60%)",
  Impacts:    "hsl(35 92% 52%)",
  Approves:   "hsl(142 65% 32%)",
  Tests:      "hsl(180 55% 40%)",
  Covers:     "hsl(35 80% 45%)",
  Changes:    "hsl(28 85% 40%)",
  Fails:      "hsl(0 78% 55%)",
  Resolves:   "hsl(142 65% 42%)",
  CertifiedBy:"hsl(260 55% 45%)",
};

// Curated knowledge graph — laid out left-to-right by lifecycle phase
const NODES: GNode[] = [
  // Column 1 — Requirements
  { id: "REQ-1042", kind: "Requirement",  label: "REQ-1042",  x: 60,  y: 60,  owner: "P. Nair" },
  { id: "REQ-1058", kind: "Requirement",  label: "REQ-1058",  x: 60,  y: 130, owner: "M. Rossi" },
  { id: "REQ-1091", kind: "Requirement",  label: "REQ-1091",  x: 60,  y: 200, owner: "L. Tran", broken: true },
  { id: "REQ-1117", kind: "Requirement",  label: "REQ-1117",  x: 60,  y: 270, owner: "B. Cohen" },
  { id: "REQ-1146", kind: "Requirement",  label: "REQ-1146",  x: 60,  y: 340, owner: "P. Nair" },
  // Column 2 — Architecture / Spec
  { id: "ARCH-DMA",  kind: "Architecture", label: "ARCH-DMA",  x: 200, y: 90,  owner: "P. Nair" },
  { id: "ARCH-MAC",  kind: "Architecture", label: "ARCH-MAC",  x: 200, y: 200 },
  { id: "SPEC-CSR",  kind: "Spec",         label: "SPEC-CSR",  x: 200, y: 300 },
  // Column 3 — Interfaces & Registers
  { id: "IF-AXI",    kind: "Interface",    label: "IF-AXI4",   x: 340, y: 60 },
  { id: "IF-APB",    kind: "Interface",    label: "IF-APB4",   x: 340, y: 140 },
  { id: "REG-228",   kind: "Register",     label: "REG-228",   x: 340, y: 220, broken: true },
  { id: "REG-112",   kind: "Register",     label: "REG-112",   x: 340, y: 300 },
  // Column 4 — RTL
  { id: "RTL-17",    kind: "RTL",          label: "rtl_dma_top",   x: 490, y: 80,  broken: true },
  { id: "RTL-22",    kind: "RTL",          label: "rtl_mac_tx",    x: 490, y: 170 },
  { id: "RTL-31",    kind: "RTL",          label: "rtl_csr",       x: 490, y: 260 },
  // Column 5 — Assertions / Formal
  { id: "ASN-401",   kind: "Assertion",    label: "asn_ring_ord",  x: 640, y: 80 },
  { id: "FRM-14",    kind: "Formal",       label: "frm_underflow", x: 640, y: 170 },
  { id: "ASN-412",   kind: "Assertion",    label: "asn_apb_hs",    x: 640, y: 260 },
  // Column 6 — Tests / Sim / Coverage
  { id: "TST-DMA-1", kind: "Test",         label: "tst_ring_wrap", x: 790, y: 60 },
  { id: "SIM-9412",  kind: "Simulation",   label: "sim_nightly",   x: 790, y: 140 },
  { id: "COV-A",     kind: "Coverage",     label: "cov_functional",x: 790, y: 220 },
  { id: "COV-B",     kind: "Coverage",     label: "cov_toggle",    x: 790, y: 300 },
  // Column 7 — Defects / Changes
  { id: "BUG-2201",  kind: "Defect",       label: "BUG-2201",      x: 940, y: 100 },
  { id: "ECR-118",   kind: "Change",       label: "ECR-118",       x: 940, y: 200 },
  // Column 8 — Approval / Evidence
  { id: "APR-ARCH",  kind: "Approval",     label: "APR-ARCH",      x: 1080, y: 80 },
  { id: "APR-VER",   kind: "Approval",     label: "APR-VER",       x: 1080, y: 180 },
  { id: "EVD-REL",   kind: "Evidence",     label: "EVD-REL-v2.4",  x: 1080, y: 280 },
];

const EDGES: GEdge[] = [
  { s: "REQ-1042", t: "ARCH-DMA", kind: "AllocatedTo" },
  { s: "REQ-1058", t: "ARCH-DMA", kind: "AllocatedTo" },
  { s: "REQ-1091", t: "SPEC-CSR", kind: "DerivedFrom", broken: true },
  { s: "REQ-1117", t: "ARCH-DMA", kind: "AllocatedTo" },
  { s: "REQ-1146", t: "ARCH-DMA", kind: "AllocatedTo" },
  { s: "ARCH-DMA", t: "IF-AXI",   kind: "DependsOn" },
  { s: "ARCH-DMA", t: "IF-APB",   kind: "DependsOn" },
  { s: "ARCH-DMA", t: "RTL-17",   kind: "Implements", broken: true },
  { s: "ARCH-MAC", t: "RTL-22",   kind: "Implements" },
  { s: "SPEC-CSR", t: "REG-112",  kind: "DerivedFrom" },
  { s: "SPEC-CSR", t: "REG-228",  kind: "DerivedFrom", broken: true },
  { s: "REG-228",  t: "RTL-31",   kind: "AllocatedTo" },
  { s: "REG-112",  t: "RTL-31",   kind: "AllocatedTo" },
  { s: "IF-AXI",   t: "ASN-401",  kind: "Verifies" },
  { s: "IF-APB",   t: "ASN-412",  kind: "Verifies" },
  { s: "RTL-17",   t: "ASN-401",  kind: "Verifies" },
  { s: "RTL-31",   t: "FRM-14",   kind: "Verifies" },
  { s: "RTL-22",   t: "TST-DMA-1",kind: "Tests" },
  { s: "TST-DMA-1",t: "SIM-9412", kind: "Tests" },
  { s: "SIM-9412", t: "COV-A",    kind: "Covers" },
  { s: "SIM-9412", t: "COV-B",    kind: "Covers" },
  { s: "SIM-9412", t: "BUG-2201", kind: "Fails" },
  { s: "BUG-2201", t: "ECR-118",  kind: "Resolves" },
  { s: "ECR-118",  t: "RTL-17",   kind: "Changes" },
  { s: "ARCH-DMA", t: "APR-ARCH", kind: "Approves" },
  { s: "COV-A",    t: "APR-VER",  kind: "Approves" },
  { s: "APR-ARCH", t: "EVD-REL",  kind: "CertifiedBy" },
  { s: "APR-VER",  t: "EVD-REL",  kind: "CertifiedBy" },
];

const AI_STREAM = [
  { t: "0s",  tone: "err"  as Tone, msg: "Missing RTL implementation detected for REQ-1091" },
  { t: "2s",  tone: "err"  as Tone, msg: "Broken relationship: ARCH-DMA → rtl_dma_top (baseline drift)" },
  { t: "5s",  tone: "warn" as Tone, msg: "Coverage gap identified on rtl_mac_tx cov_toggle" },
  { t: "8s",  tone: "warn" as Tone, msg: "Register REG-228 has no verification test" },
  { t: "11s", tone: "info" as Tone, msg: "Unverified requirement REQ-1117 — assign SEC owner" },
  { t: "14s", tone: "warn" as Tone, msg: "Unapproved interface: IF-APB4 pending owner sign-off" },
  { t: "17s", tone: "ok"   as Tone, msg: "New engineering link inferred: BUG-2201 → ECR-118 (Resolves, 94%)" },
];

const BROKEN_QUEUE = [
  { id: "REQ-1091", finding: "Missing RTL Implementation", owner: "RTL Team",     severity: "critical" as const },
  { id: "REG-228",  finding: "Missing Verification",       owner: "Verification", severity: "high"     as const },
  { id: "RTL-17",   finding: "No Architecture Allocation", owner: "Architecture", severity: "med"      as const },
  { id: "COV-B",    finding: "Coverage without Evidence",  owner: "Verification", severity: "med"      as const },
];

const MISSING_LINK_TYPES = [
  { k: "Requirement without architecture",  n: 3, tone: "err"  as Tone, suggest: "AllocatedTo" },
  { k: "Architecture without RTL",          n: 2, tone: "err"  as Tone, suggest: "Implements" },
  { k: "RTL without verification",          n: 4, tone: "warn" as Tone, suggest: "Verifies" },
  { k: "Verification without coverage",     n: 2, tone: "warn" as Tone, suggest: "Covers" },
  { k: "Coverage without evidence",         n: 3, tone: "warn" as Tone, suggest: "CertifiedBy" },
  { k: "Register without specification",    n: 1, tone: "warn" as Tone, suggest: "DerivedFrom" },
  { k: "Interface without ownership",       n: 2, tone: "info" as Tone, suggest: "Owns" },
  { k: "Assertion without requirement",     n: 1, tone: "info" as Tone, suggest: "Verifies" },
];

const RELATIONSHIP_LEGEND: EdgeKind[] = [
  "Implements","Verifies","DependsOn","AllocatedTo","DerivedFrom","Impacts","Approves","Tests","Covers","Changes","Fails","Resolves","CertifiedBy",
];

const HEALTH_DIMENSIONS = [
  { k: "Completeness",         v: 98.2 },
  { k: "Consistency",          v: 99.4 },
  { k: "Coverage",             v: 96.7 },
  { k: "Verification",         v: 97.8 },
  { k: "Approval",             v: 92.1 },
  { k: "Evidence",             v: 99.0 },
  { k: "Dependency Integrity", v: 99.6 },
];

const APPROVAL_STATE = [
  { k: "Architecture",   status: "Approved" as const },
  { k: "RTL",            status: "Approved" as const },
  { k: "Verification",   status: "Pending"  as const },
  { k: "Security",       status: "Approved" as const },
  { k: "Interface",      status: "Pending"  as const },
  { k: "Manufacturing",  status: "Approved" as const },
];

// Artifact explorer tree
interface TreeNode { id: string; label: string; count?: number; kind?: NodeKind; children?: TreeNode[]; }
const TREE: TreeNode = {
  id: "prog", label: "Program: Palo Alto NextGen SoC",
  children: [
    { id: "soc", label: "SoC: pan-nextgen-a1",
      children: [
        { id: "ip", label: "IP Block: DDMAC v2.4",
          children: [
            { id: "reqs", label: "Requirements",     kind: "Requirement",  count: 186 },
            { id: "spec", label: "Specifications",   kind: "Spec",         count: 42 },
            { id: "arch", label: "Architecture",     kind: "Architecture", count: 42 },
            { id: "iface",label: "Interfaces",       kind: "Interface",    count: 18 },
            { id: "reg",  label: "Registers",        kind: "Register",     count: 212 },
            { id: "rtl",  label: "RTL",              kind: "RTL",          count: 13 },
            { id: "asn",  label: "Assertions",       kind: "Assertion",    count: 1128 },
            { id: "tst",  label: "Tests",            kind: "Test",         count: 612 },
            { id: "frm",  label: "Formal Properties",kind: "Formal",       count: 96 },
            { id: "cov",  label: "Coverage",         kind: "Coverage",     count: 486 },
            { id: "bug",  label: "Defects",          kind: "Defect",       count: 117 },
            { id: "ecr",  label: "Changes",          kind: "Change",       count: 84 },
            { id: "evd",  label: "Evidence",         kind: "Evidence",     count: 61 },
            { id: "apr",  label: "Approvals",        kind: "Approval",     count: 76 },
          ]},
      ]},
  ],
};

const MATRIX_ROWS = ["REQ-1042", "REQ-1058", "REQ-1091", "REQ-1117", "REQ-1146"];
const MATRIX_COLS = ["Architecture","Interface","Register","RTL","Assertions","Tests","Coverage","Simulation","Defect","Approval","Evidence"] as const;

// Coverage/traceability status per row per col: 'ok' | 'warn' | 'err' | undefined
const MATRIX: Record<string, Partial<Record<typeof MATRIX_COLS[number], Tone>>> = {
  "REQ-1042": { Architecture: "ok", Interface: "ok", Register: "ok", RTL: "warn", Assertions: "ok", Tests: "ok", Coverage: "warn", Simulation: "ok", Defect: "ok", Approval: "ok", Evidence: "ok" },
  "REQ-1058": { Architecture: "ok", Interface: "ok", Register: "ok", RTL: "ok",   Assertions: "ok", Tests: "warn", Coverage: "warn", Simulation: "warn", Defect: "err", Approval: "warn", Evidence: "warn" },
  "REQ-1091": { Architecture: "ok", Interface: "warn", Register: "err", RTL: "err", Assertions: "err", Tests: "err", Coverage: "err", Simulation: "err", Defect: "ok", Approval: "err", Evidence: "err" },
  "REQ-1117": { Architecture: "ok", Interface: "ok", Register: "warn", RTL: "warn", Assertions: "warn", Tests: "warn", Coverage: "warn", Simulation: "warn", Defect: "ok", Approval: "warn", Evidence: "warn" },
  "REQ-1146": { Architecture: "ok", Interface: "ok", Register: "ok", RTL: "ok", Assertions: "ok", Tests: "ok", Coverage: "ok", Simulation: "ok", Defect: "ok", Approval: "ok", Evidence: "ok" },
};

const TIMELINE_STAGES = [
  "Requirement Created", "Architecture Approved", "RTL Generated",
  "Verification Planned", "Simulation Passed", "Coverage Complete",
  "Approval Granted", "Release Package",
];

/* --------------------------- Knowledge Graph SVG --------------------------- */

function KnowledgeGraph({
  hoverId, setHoverId, selectedId, setSelectedId, hiddenKinds, focusNeighborhood,
}: {
  hoverId: string | null; setHoverId: (id: string | null) => void;
  selectedId: string | null; setSelectedId: (id: string | null) => void;
  hiddenKinds: Set<NodeKind>; focusNeighborhood: boolean;
}) {
  const focusId = hoverId ?? selectedId;

  const neighborhood = useMemo(() => {
    if (!focusId) return null;
    const nodeSet = new Set<string>([focusId]);
    const edgeSet = new Set<number>();
    EDGES.forEach((e, i) => {
      if (e.s === focusId || e.t === focusId) {
        edgeSet.add(i);
        nodeSet.add(e.s);
        nodeSet.add(e.t);
      }
    });
    return { nodeSet, edgeSet };
  }, [focusId]);

  const visibleNodes = NODES.filter((n) => !hiddenKinds.has(n.kind));
  const visibleIds = new Set(visibleNodes.map((n) => n.id));

  return (
    <div className="relative rounded overflow-hidden" style={{ border: "1px solid hsl(var(--avep-border))", background: "linear-gradient(180deg, hsl(var(--avep-canvas)), hsl(var(--avep-surface)))" }}>
      <svg viewBox="0 0 1180 400" width="100%" style={{ height: 440 }} role="img" aria-label="Engineering knowledge graph">
        <defs>
          <marker id="arr" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 z" fill="hsl(210 15% 55%)" />
          </marker>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Edges */}
        {EDGES.map((e, i) => {
          if (!visibleIds.has(e.s) || !visibleIds.has(e.t)) return null;
          const a = NODES.find((n) => n.id === e.s)!;
          const b = NODES.find((n) => n.id === e.t)!;
          const dim = focusNeighborhood && neighborhood && !neighborhood.edgeSet.has(i);
          const highlighted = neighborhood?.edgeSet.has(i);
          const color = e.broken ? toneMap.err.dot : EDGE_COLORS[e.kind];
          return (
            <g key={i} opacity={dim ? 0.15 : 1}>
              <line
                x1={a.x + 22} y1={a.y} x2={b.x - 22} y2={b.y}
                stroke={color}
                strokeWidth={highlighted ? 2.2 : 1.2}
                strokeDasharray={e.broken ? "4 3" : "0"}
                markerEnd="url(#arr)"
              >
                {e.broken && <animate attributeName="opacity" values="0.4;1;0.4" dur="1.8s" repeatCount="indefinite" />}
              </line>
            </g>
          );
        })}

        {/* Nodes */}
        {visibleNodes.map((n) => {
          const c = toneMap[KIND_TONE[n.kind]];
          const isFocus = n.id === focusId;
          const inHood = neighborhood?.nodeSet.has(n.id);
          const dim = focusNeighborhood && neighborhood && !inHood;
          return (
            <g key={n.id}
              onMouseEnter={() => setHoverId(n.id)}
              onMouseLeave={() => setHoverId(null)}
              onClick={() => setSelectedId(n.id)}
              style={{ cursor: "pointer" }}
              opacity={dim ? 0.25 : 1}>
              <rect
                x={n.x - 44} y={n.y - 14} width={88} height={28} rx={6}
                fill={c.bg} stroke={n.broken ? toneMap.err.dot : c.dot}
                strokeWidth={isFocus ? 2.4 : 1.2}
                filter={isFocus ? "url(#glow)" : undefined}
              >
                {isFocus && <animate attributeName="stroke-opacity" values="0.6;1;0.6" dur="1.4s" repeatCount="indefinite" />}
              </rect>
              <circle cx={n.x - 34} cy={n.y} r={3} fill={n.broken ? toneMap.err.dot : c.dot} />
              <text x={n.x - 26} y={n.y + 3.5} fontSize={9.5} fill={c.fg} fontWeight={600}>{n.label}</text>
            </g>
          );
        })}
      </svg>

      {focusId && (
        <div className="absolute top-2 right-2 rounded-md p-2 max-w-[260px]"
          style={{ background: "hsl(var(--avep-surface))", border: "1px solid hsl(var(--avep-border))", boxShadow: "var(--avep-shadow-sm)" }}>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: toneMap[KIND_TONE[NODES.find(n => n.id === focusId)!.kind]].dot }} />
            <span style={{ fontSize: "var(--avep-text-xs)", fontWeight: 700 }}>{focusId}</span>
            <Badge tone={KIND_TONE[NODES.find(n => n.id === focusId)!.kind]}>{NODES.find(n => n.id === focusId)!.kind}</Badge>
          </div>
          <div className="mt-1" style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-muted))" }}>
            {neighborhood ? `${neighborhood.nodeSet.size - 1} connected artifacts · ${neighborhood.edgeSet.size} relationships` : ""}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------ Traceability health gauge ------------------------ */

function HealthRadar({ data }: { data: { k: string; v: number }[] }) {
  const cx = 130, cy = 130, r = 100;
  const n = data.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (i: number, v: number) => {
    const rr = (v / 100) * r;
    return [cx + Math.cos(angle(i)) * rr, cy + Math.sin(angle(i)) * rr] as const;
  };
  const rings = [25, 50, 75, 100];
  const poly = data.map((d, i) => point(i, d.v).join(",")).join(" ");
  return (
    <svg viewBox="0 0 260 260" width="100%" role="img" aria-label="Traceability health radar">
      {rings.map((g) => (
        <circle key={g} cx={cx} cy={cy} r={(g / 100) * r} fill="none"
          stroke="hsl(var(--avep-border))" strokeDasharray={g === 100 ? "0" : "2 3"} />
      ))}
      {data.map((d, i) => {
        const [x, y] = point(i, 100);
        return <line key={d.k} x1={cx} y1={cy} x2={x} y2={y} stroke="hsl(var(--avep-border))" />;
      })}
      <polygon points={poly} fill="hsl(var(--avep-primary) / 0.18)" stroke="hsl(var(--avep-primary))" strokeWidth={1.5} />
      {data.map((d, i) => {
        const [x, y] = point(i, 100);
        const lx = cx + (x - cx) * 1.18;
        const ly = cy + (y - cy) * 1.18;
        return (
          <text key={d.k} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
            fontSize={9} fill="hsl(var(--avep-foreground-muted))">
            {d.k} {d.v}
          </text>
        );
      })}
    </svg>
  );
}

/* --------------------------- Artifact tree walker --------------------------- */

function ArtifactTree({
  node, depth = 0, expanded, toggle, onSelect,
}: {
  node: TreeNode; depth?: number;
  expanded: Set<string>; toggle: (id: string) => void; onSelect: (kind?: NodeKind) => void;
}) {
  const hasChildren = !!node.children?.length;
  const isOpen = expanded.has(node.id);
  const c = node.kind ? toneMap[KIND_TONE[node.kind]] : toneMap.neutral;
  return (
    <div>
      <button type="button"
        onClick={() => { if (hasChildren) toggle(node.id); else onSelect(node.kind); }}
        className="w-full flex items-center gap-1.5 py-1 pr-1 rounded hover:bg-black/[0.03]"
        style={{ paddingLeft: 4 + depth * 12, fontSize: "var(--avep-text-xs)" }}>
        {hasChildren
          ? (isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />)
          : <span className="h-2 w-2 rounded-full shrink-0" style={{ background: c.dot }} />}
        <span className="flex-1 text-left truncate">{node.label}</span>
        {typeof node.count === "number" && (
          <span className="px-1 rounded" style={{ fontSize: "var(--avep-text-2xs)", background: "hsl(var(--avep-surface-muted))", color: "hsl(var(--avep-foreground-muted))" }}>
            {node.count.toLocaleString()}
          </span>
        )}
      </button>
      {hasChildren && isOpen && (
        <div>
          {node.children!.map((ch) => (
            <ArtifactTree key={ch.id} node={ch} depth={depth + 1} expanded={expanded} toggle={toggle} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------- page ---------------------------------- */

export default function EngineeringTraceabilityWorkspace() {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hiddenKinds, setHiddenKinds] = useState<Set<NodeKind>>(new Set());
  const [focusMode, setFocusMode] = useState(false);
  const [streamIdx, setStreamIdx] = useState(3);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["prog", "soc", "ip"]));
  const [search, setSearch] = useState("");
  const [impactReq, setImpactReq] = useState<string>("REQ-1042");

  useEffect(() => {
    const id = setInterval(() => setStreamIdx((i) => Math.min(AI_STREAM.length, i + 1)), 2500);
    return () => clearInterval(id);
  }, []);

  const toggleKind = (k: NodeKind) => setHiddenKinds((prev) => {
    const n = new Set(prev);
    n.has(k) ? n.delete(k) : n.add(k);
    return n;
  });

  const toggleTree = (id: string) => setExpanded((prev) => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  // Impact analysis — walk edges downstream from a starting node
  const impactSet = useMemo(() => {
    const visited = new Set<string>();
    const stack = [impactReq];
    while (stack.length) {
      const cur = stack.pop()!;
      if (visited.has(cur)) continue;
      visited.add(cur);
      EDGES.filter((e) => e.s === cur).forEach((e) => stack.push(e.t));
    }
    visited.delete(impactReq);
    return visited;
  }, [impactReq]);

  const impactBuckets = useMemo(() => {
    const byKind: Partial<Record<NodeKind, string[]>> = {};
    impactSet.forEach((id) => {
      const node = NODES.find((n) => n.id === id);
      if (!node) return;
      byKind[node.kind] ??= [];
      byKind[node.kind]!.push(id);
    });
    return byKind;
  }, [impactSet]);

  const selectedNode = selectedId ? NODES.find((n) => n.id === selectedId) : null;
  const selectedUpstream = selectedId ? EDGES.filter((e) => e.t === selectedId) : [];
  const selectedDownstream = selectedId ? EDGES.filter((e) => e.s === selectedId) : [];

  return (
    <div className="flex flex-col gap-4 p-4" style={{ background: "hsl(var(--avep-canvas))", minHeight: "100%" }}>
      {/* Breadcrumb */}
      <nav aria-label="Workflow breadcrumb" className="flex items-center gap-1.5 flex-wrap"
        style={{ fontSize: "var(--avep-text-xs)", color: "hsl(var(--avep-foreground-subtle))" }}>
        <span>Engineering Context</span>
        <ChevronRight className="h-3 w-3" />
        <span>Requirements Intake</span>
        <ChevronRight className="h-3 w-3" />
        <span>Requirements Quality</span>
        <ChevronRight className="h-3 w-3" />
        <span style={{ color: "hsl(var(--avep-primary))", fontWeight: 600 }}>Engineering Traceability</span>
        <ChevronRight className="h-3 w-3" />
        <span>Architecture</span>
      </nav>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5" style={{ color: "hsl(var(--avep-primary))" }} />
            <h1 style={{ fontSize: "var(--avep-text-xl)", fontWeight: 700 }}>Engineering Traceability Workspace</h1>
            <Badge tone="info">AVEP.030</Badge>
          </div>
          <p className="mt-1 max-w-3xl" style={{ fontSize: "var(--avep-text-sm)", color: "hsl(var(--avep-foreground-muted))" }}>
            Model engineering relationships, preserve the digital thread, and detect traceability gaps before they become downstream engineering risk.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Btn variant="primary" icon={Sparkles} title="Rebuild the AI-inferred engineering knowledge graph">Generate Knowledge Graph</Btn>
          <Btn variant="soft" icon={Wand2} title="Continuously check every relationship for consistency">Run Traceability Analysis</Btn>
          <Btn icon={ShieldCheck} title="Have AI validate every relationship's engineering integrity">Validate Relationships</Btn>
          <Btn icon={Users} title="Route unowned artifacts to responsible engineers">Assign Artifact Owners</Btn>
          <Btn icon={Download} title="Export the complete engineering digital thread">Export Traceability Report</Btn>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi label="Artifacts Modeled"       value={3842}  hint="Across the entire IP block lifecycle" tone="info" />
        <Kpi label="Relationships Validated" value={18927} hint="AI-inferred and human-approved links"   tone="ok" />
        <Kpi label="Broken Links"            value={11}    hint="Requires engineering resolution"       tone="err" />
        <Kpi label="Traceability Coverage"   value={99.3}  suffix="%" hint="Digital thread completeness" tone="ok" />
      </div>

      {/* 3-column layout */}
      <div className="grid grid-cols-12 gap-3">
        {/* LEFT — Artifact explorer + relationship filters */}
        <div className="col-span-12 xl:col-span-3 flex flex-col gap-3">
          <div className="p-3" style={card}>
            <SectionHeader icon={FolderTree} title="Artifact Explorer" hint="3,842 artifacts across the digital thread" />
            <div className="flex items-center gap-1.5 rounded-md px-2 h-7 mb-2"
              style={{ background: "hsl(var(--avep-surface-muted))", border: "1px solid hsl(var(--avep-border))" }}>
              <Search className="h-3.5 w-3.5" style={{ color: "hsl(var(--avep-foreground-subtle))" }} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search artifacts…"
                className="bg-transparent outline-none w-full"
                style={{ fontSize: "var(--avep-text-xs)" }} />
            </div>
            <div className="max-h-[300px] overflow-y-auto pr-1">
              <ArtifactTree node={TREE} expanded={expanded} toggle={toggleTree} onSelect={() => { /* selection hook */ }} />
            </div>
          </div>

          <div className="p-3" style={card}>
            <SectionHeader icon={Boxes} title="Relationship Filters" hint="Toggle artifact kinds" />
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(KIND_TONE) as NodeKind[]).map((k) => {
                const on = !hiddenKinds.has(k);
                const c = toneMap[KIND_TONE[k]];
                return (
                  <button key={k} type="button" onClick={() => toggleKind(k)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md transition-colors"
                    style={{
                      fontSize: "var(--avep-text-2xs)",
                      fontWeight: 600,
                      border: `1px solid ${on ? c.dot : "hsl(var(--avep-border))"}`,
                      background: on ? c.bg : "hsl(var(--avep-surface))",
                      color: on ? c.fg : "hsl(var(--avep-foreground-subtle))",
                      opacity: on ? 1 : 0.55,
                    }}
                    title={on ? `Hide ${k}` : `Show ${k}`}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.dot }} />
                    {k}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3" style={card}>
            <SectionHeader icon={Link2} title="Relationship Legend" hint="Edge semantics" />
            <div className="grid grid-cols-2 gap-1">
              {RELATIONSHIP_LEGEND.map((r) => (
                <div key={r} className="flex items-center gap-1.5" style={{ fontSize: "var(--avep-text-2xs)" }}>
                  <span className="h-0.5 w-4 rounded-full" style={{ background: EDGE_COLORS[r] }} />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER — Knowledge graph + AI stream */}
        <div className="col-span-12 xl:col-span-6 flex flex-col gap-3">
          <div className="p-3" style={card}>
            <SectionHeader icon={Network} title="Engineering Knowledge Graph"
              hint="Hover to highlight neighborhood · click to inspect · toggle kinds on the left"
              right={
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setFocusMode((v) => !v)}
                    className="inline-flex items-center gap-1 px-2 h-7 rounded-md transition-colors"
                    title="Dim unrelated artifacts when hovering"
                    style={{
                      fontSize: "var(--avep-text-2xs)", fontWeight: 600,
                      background: focusMode ? "hsl(var(--avep-primary-soft))" : "hsl(var(--avep-surface))",
                      color: focusMode ? "hsl(var(--avep-primary))" : "hsl(var(--avep-foreground-muted))",
                      border: `1px solid ${focusMode ? "hsl(var(--avep-primary))" : "hsl(var(--avep-border))"}`,
                    }}>
                    <Zap className="h-3 w-3" /> Focus Mode
                  </button>
                  <button onClick={() => { setSelectedId(null); setHoverId(null); }}
                    className="inline-flex items-center gap-1 px-2 h-7 rounded-md hover:bg-black/[0.04]"
                    style={{ fontSize: "var(--avep-text-2xs)", border: "1px solid hsl(var(--avep-border))" }}>
                    Reset
                  </button>
                </div>
              } />
            <KnowledgeGraph
              hoverId={hoverId} setHoverId={setHoverId}
              selectedId={selectedId} setSelectedId={setSelectedId}
              hiddenKinds={hiddenKinds}
              focusNeighborhood={focusMode}
            />
            {/* Column labels */}
            <div className="mt-1.5 grid grid-cols-8 gap-1" style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>
              <div className="text-center">Requirement</div>
              <div className="text-center">Architecture</div>
              <div className="text-center">Interface / Reg</div>
              <div className="text-center">RTL</div>
              <div className="text-center">Assertion / Formal</div>
              <div className="text-center">Test / Sim / Cov</div>
              <div className="text-center">Defect / Change</div>
              <div className="text-center">Approval / Evidence</div>
            </div>
          </div>

          <div className="p-3" style={card}>
            <SectionHeader icon={Activity} title="AI Relationship Insights" hint="Streaming from the traceability engine" />
            <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto pr-1">
              {AI_STREAM.slice(0, streamIdx).map((e, i) => {
                const c = toneMap[e.tone];
                return (
                  <div key={i} className="flex items-start gap-2 rounded-md px-2 py-1.5 animate-fade-in"
                    style={{ border: "1px solid hsl(var(--avep-border))", background: "hsl(var(--avep-surface))" }}>
                    <span className="mt-1 h-2 w-2 rounded-full shrink-0" style={{ background: c.dot }} />
                    <div className="min-w-0 flex-1" style={{ fontSize: "var(--avep-text-xs)" }}>{e.msg}</div>
                    <span style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>{e.t}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3" style={card}>
            <SectionHeader icon={Zap} title="Change Impact Analysis" hint="Select a requirement — the graph tells you what changes"
              right={
                <select value={impactReq} onChange={(e) => setImpactReq(e.target.value)}
                  className="h-7 px-2 rounded-md"
                  style={{
                    fontSize: "var(--avep-text-xs)",
                    background: "hsl(var(--avep-surface-muted))",
                    border: "1px solid hsl(var(--avep-border))",
                  }}>
                  {NODES.filter((n) => n.kind === "Requirement").map((n) => (
                    <option key={n.id} value={n.id}>{n.id}</option>
                  ))}
                </select>
              } />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {(["Architecture","Register","RTL","Assertion","Test","Coverage","Simulation","Approval"] as NodeKind[]).map((k) => {
                const c = toneMap[KIND_TONE[k]];
                const items = impactBuckets[k] ?? [];
                return (
                  <div key={k} className="rounded-md p-2" style={{ border: "1px solid hsl(var(--avep-border))" }}>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ background: c.dot }} />
                      <span style={{ fontSize: "var(--avep-text-2xs)", fontWeight: 600, color: c.fg }}>{k}</span>
                    </div>
                    <div style={{ fontSize: "var(--avep-text-lg)", fontWeight: 700 }}>{items.length}</div>
                    <div className="truncate" style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>
                      {items.slice(0, 2).join(", ") || "—"}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 flex items-center justify-between" style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>
              <span>{impactSet.size} downstream artifacts touched by {impactReq}</span>
              <span>Estimated engineering impact: <strong style={{ color: toneMap.warn.fg }}>medium</strong></span>
            </div>
          </div>
        </div>

        {/* RIGHT — Health + broken queue */}
        <div className="col-span-12 xl:col-span-3 flex flex-col gap-3">
          <div className="p-3" style={card}>
            <SectionHeader icon={TrendingUp} title="Traceability Health" hint="Composite score: 99.3%" />
            <HealthRadar data={HEALTH_DIMENSIONS} />
          </div>

          <div className="p-3" style={card}>
            <SectionHeader icon={AlertTriangle} title="Broken Relationship Queue" hint="Highest severity first" />
            <div className="flex flex-col gap-2">
              {BROKEN_QUEUE.map((b) => (
                <div key={b.id} className="rounded-md p-2"
                  style={{ border: `1px solid ${b.severity === "critical" ? toneMap.err.dot : "hsl(var(--avep-border))"}` }}>
                  <div className="flex items-center justify-between">
                    <span className="font-mono" style={{ fontSize: "var(--avep-text-xs)", fontWeight: 700 }}>{b.id}</span>
                    <Badge tone={b.severity === "critical" ? "err" : b.severity === "high" ? "warn" : "neutral"}>
                      {b.severity}
                    </Badge>
                  </div>
                  <div className="mt-0.5" style={{ fontSize: "var(--avep-text-xs)", color: "hsl(var(--avep-foreground-muted))" }}>{b.finding}</div>
                  <div className="mt-1 flex items-center justify-between">
                    <span style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>Owner: {b.owner}</span>
                    <button className="px-2 py-0.5 rounded"
                      style={{ fontSize: "var(--avep-text-2xs)", background: "hsl(var(--avep-primary-soft))", color: "hsl(var(--avep-primary))", fontWeight: 600 }}
                      onClick={() => setSelectedId(b.id)}>
                      Resolve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3" style={card}>
            <SectionHeader icon={BadgeCheck} title="Approval Workflow" hint="Discipline sign-offs" />
            <div className="flex flex-col gap-1.5">
              {APPROVAL_STATE.map((a) => (
                <div key={a.k} className="flex items-center justify-between rounded px-2 py-1"
                  style={{ border: "1px solid hsl(var(--avep-border))" }}>
                  <span style={{ fontSize: "var(--avep-text-xs)" }}>{a.k}</span>
                  <Badge tone={a.status === "Approved" ? "ok" : "warn"}>{a.status}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Traceability Matrix */}
      <div className="p-3" style={card}>
        <SectionHeader icon={Layers} title="Engineering Traceability Matrix" hint="Every requirement × every engineering discipline — click a cell to inspect" />
        <div className="overflow-x-auto rounded" style={{ border: "1px solid hsl(var(--avep-border))" }}>
          <table className="w-full" style={{ fontSize: "var(--avep-text-xs)" }}>
            <thead>
              <tr style={{ background: "hsl(var(--avep-surface-muted))" }}>
                <th className="text-left px-2 py-1.5" style={label2xs}>Requirement</th>
                {MATRIX_COLS.map((c) => (
                  <th key={c} className="text-center px-2 py-1.5" style={label2xs}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MATRIX_ROWS.map((r) => (
                <tr key={r} className="border-t" style={{ borderColor: "hsl(var(--avep-border))" }}>
                  <td className="px-2 py-1.5 font-mono" style={{ fontWeight: 600 }}>{r}</td>
                  {MATRIX_COLS.map((c) => {
                    const tone = MATRIX[r]?.[c] ?? "neutral";
                    const s = toneMap[tone];
                    return (
                      <td key={c} className="text-center px-2 py-1.5">
                        <button className="inline-flex items-center justify-center h-6 w-14 rounded transition-transform hover:scale-105"
                          title={`${r} · ${c}: ${tone === "ok" ? "Linked" : tone === "warn" ? "Partial" : tone === "err" ? "Broken" : "Not applicable"}`}
                          onClick={() => setSelectedId(r)}
                          style={{ background: s.bg, border: `1px solid ${s.dot}`, color: s.fg, fontSize: 10, fontWeight: 600 }}>
                          {tone === "ok" ? "✓ Linked" : tone === "warn" ? "◐ Partial" : tone === "err" ? "✕ Broken" : "—"}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-2 flex items-center gap-3" style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: toneMap.ok.dot }} /> Linked</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: toneMap.warn.dot }} /> Partial</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: toneMap.err.dot }} /> Broken</span>
        </div>
      </div>

      {/* Digital Thread Timeline */}
      <div className="p-3" style={card}>
        <SectionHeader icon={GitBranch} title="Digital Thread Timeline" hint="Provenance from requirement to release" />
        <div className="flex items-center gap-1.5 flex-wrap">
          {TIMELINE_STAGES.map((s, i) => {
            const done = i < 6;
            const active = i === 5;
            const tone: Tone = done ? "ok" : active ? "warn" : "neutral";
            const c = toneMap[tone];
            return (
              <div key={s} className="flex items-center gap-1.5">
                <button className="rounded-md px-2.5 py-1.5 transition-all hover:scale-[1.02]"
                  style={{ border: `1px solid ${c.dot}`, background: c.bg, minWidth: 130 }}>
                  <div style={{ fontSize: "var(--avep-text-2xs)", fontWeight: 700, color: c.fg }}>{s}</div>
                  <div style={{ fontSize: 9, color: c.fg }}>{done ? "Complete" : active ? "In progress" : "Upcoming"}</div>
                </button>
                {i < TIMELINE_STAGES.length - 1 && <ArrowRight className="h-3.5 w-3.5" style={{ color: "hsl(var(--avep-foreground-subtle))" }} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Missing link detection + coverage heatmap */}
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-6 p-3" style={card}>
          <SectionHeader icon={Wand2} title="Missing Link Detection" hint="AI-inferred gaps with one-click assignment" />
          <div className="flex flex-col gap-1.5">
            {MISSING_LINK_TYPES.map((m) => {
              const c = toneMap[m.tone];
              return (
                <div key={m.k} className="flex items-center gap-2 rounded-md p-2"
                  style={{ border: `1px solid ${c.dot}`, background: c.bg }}>
                  <span className="h-2 w-2 rounded-full" style={{ background: c.dot }} />
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: "var(--avep-text-xs)", fontWeight: 600, color: c.fg }}>{m.k}</div>
                    <div style={{ fontSize: "var(--avep-text-2xs)", color: c.fg, opacity: 0.85 }}>Suggested: {m.suggest}</div>
                  </div>
                  <span style={{ fontSize: "var(--avep-text-md)", fontWeight: 700, color: c.fg }}>{m.n}</span>
                  <button className="px-2 h-6 rounded"
                    style={{ background: "hsl(var(--avep-surface))", border: "1px solid hsl(var(--avep-border))", fontSize: "var(--avep-text-2xs)", fontWeight: 600 }}>
                    Assign
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6 p-3" style={card}>
          <SectionHeader icon={Cpu} title="Engineering Coverage Heatmap" hint="Requirement × discipline density" />
          <div className="overflow-x-auto rounded" style={{ border: "1px solid hsl(var(--avep-border))" }}>
            <table className="w-full" style={{ fontSize: "var(--avep-text-2xs)" }}>
              <thead>
                <tr style={{ background: "hsl(var(--avep-surface-muted))" }}>
                  <th className="text-left px-2 py-1" style={label2xs}>Req</th>
                  {["Arch","RTL","Ver","Sim","Cov","Formal","Evd","Apr"].map((c) => (
                    <th key={c} className="text-center px-1.5 py-1" style={label2xs}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MATRIX_ROWS.map((r) => (
                  <tr key={r} className="border-t" style={{ borderColor: "hsl(var(--avep-border))" }}>
                    <td className="px-2 py-1 font-mono">{r}</td>
                    {[0.95, 0.86, 0.78, 0.72, 0.64, 0.83, 0.90, 0.75].map((base, i) => {
                      const seed = (r.charCodeAt(4) + i) % 13;
                      const val = Math.max(0.15, Math.min(1, base - seed * 0.04 + (r === "REQ-1091" ? -0.35 : 0)));
                      const hue = 210;
                      return (
                        <td key={i} className="p-0.5">
                          <div className="h-6 w-full rounded" title={`${(val * 100).toFixed(0)}% coverage`}
                            style={{ background: `hsl(${hue} ${20 + val * 60}% ${88 - val * 40}%)` }} />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* AI Reasoning */}
      <div className="p-3" style={card}>
        <SectionHeader icon={Sparkles} title="AI Reasoning" hint="Why the AI inferred this relationship" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="rounded-md p-2.5 md:col-span-2" style={{ border: "1px solid hsl(var(--avep-border))" }}>
            <div style={label2xs}>Inferred Link</div>
            <div className="mt-1 flex items-center gap-1.5" style={{ fontSize: "var(--avep-text-sm)", fontWeight: 600 }}>
              <Badge tone="err">BUG-2201</Badge>
              <ArrowRight className="h-3.5 w-3.5" />
              <Badge tone="warn">ECR-118</Badge>
              <span style={{ color: "hsl(var(--avep-foreground-muted))", fontWeight: 500 }}>Resolves</span>
            </div>
            <ul className="mt-1.5 list-disc pl-4 flex flex-col gap-0.5" style={{ fontSize: "var(--avep-text-xs)", color: "hsl(var(--avep-foreground-muted))" }}>
              <li>Bug commentary references the change request title and 3 shared code paths.</li>
              <li>ECR-118 modifies rtl_dma_top, matching the failing simulation stack.</li>
              <li>Cross-referenced against 41 similar historical resolutions.</li>
            </ul>
          </div>
          <div className="rounded-md p-2.5" style={{ border: "1px solid hsl(var(--avep-border))" }}>
            <div style={label2xs}>AI Confidence</div>
            <div style={{ fontSize: "var(--avep-text-2xl)", fontWeight: 700, color: toneMap.ok.fg }}>94%</div>
            <div style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>Requires human review</div>
          </div>
          <div className="rounded-md p-2.5" style={{ border: "1px solid hsl(var(--avep-border))" }}>
            <div style={label2xs}>Recommended Action</div>
            <div className="mt-1" style={{ fontSize: "var(--avep-text-xs)" }}>Route to RTL owner for confirmation, then commit link into baseline b/rel-2.4.</div>
            <div className="mt-1.5 flex items-center gap-1">
              <Btn variant="primary" icon={CheckCircle2}>Approve</Btn>
              <Btn icon={XCircle}>Reject</Btn>
            </div>
          </div>
        </div>
      </div>

      {/* Artifact Inspector Drawer */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 flex" role="dialog" aria-label="Artifact Inspector">
          <button type="button" onClick={() => setSelectedId(null)}
            className="flex-1 bg-black/30" aria-label="Close inspector" />
          <div className="w-full max-w-xl h-full overflow-y-auto animate-slide-in-right p-4 flex flex-col gap-3"
            style={{ background: "hsl(var(--avep-surface))", borderLeft: "1px solid hsl(var(--avep-border))" }}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono" style={{ fontSize: "var(--avep-text-md)", fontWeight: 700 }}>{selectedNode.id}</span>
                  <Badge tone={KIND_TONE[selectedNode.kind]}>{selectedNode.kind}</Badge>
                  {selectedNode.broken && <Badge tone="err">Broken Link</Badge>}
                </div>
                <div className="mt-1" style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>
                  Owner: {selectedNode.owner ?? "Unassigned"} · Revision: v2.4 · Source: DDMAC-baseline
                </div>
              </div>
              <button onClick={() => setSelectedId(null)} className="p-1 rounded hover:bg-black/[0.04]" aria-label="Close">
                <XCircle className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-md p-2.5" style={{ border: "1px solid hsl(var(--avep-border))" }}>
              <div style={label2xs}>Artifact Summary</div>
              <div className="mt-1" style={{ fontSize: "var(--avep-text-sm)" }}>
                {selectedNode.label} — participates in {selectedUpstream.length + selectedDownstream.length} engineering relationships.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-md p-2.5" style={{ border: "1px solid hsl(var(--avep-border))" }}>
                <div style={label2xs}>Upstream / Parents</div>
                <ul className="mt-1 flex flex-col gap-1" style={{ fontSize: "var(--avep-text-xs)" }}>
                  {selectedUpstream.length === 0 && <li style={{ color: toneMap.warn.fg }}>No upstream links</li>}
                  {selectedUpstream.map((e, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <Badge tone="info">{e.kind}</Badge>
                      <button className="font-mono hover:underline" onClick={() => setSelectedId(e.s)}>{e.s}</button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-md p-2.5" style={{ border: "1px solid hsl(var(--avep-border))" }}>
                <div style={label2xs}>Downstream / Children</div>
                <ul className="mt-1 flex flex-col gap-1" style={{ fontSize: "var(--avep-text-xs)" }}>
                  {selectedDownstream.length === 0 && <li style={{ color: toneMap.warn.fg }}>No downstream links</li>}
                  {selectedDownstream.map((e, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <Badge tone="info">{e.kind}</Badge>
                      <button className="font-mono hover:underline" onClick={() => setSelectedId(e.t)}>{e.t}</button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-md p-2.5" style={{ border: "1px solid hsl(var(--avep-border))" }}>
              <div style={label2xs}>Linked Evidence</div>
              <ul className="mt-1 flex flex-col gap-1" style={{ fontSize: "var(--avep-text-xs)", color: "hsl(var(--avep-foreground-muted))" }}>
                <li>· Nightly regression sim_9412 log</li>
                <li>· Coverage report cov-2026-07-19</li>
                <li>· Approval package APR-ARCH v2.4</li>
              </ul>
            </div>

            <div className="rounded-md p-2.5" style={{ border: "1px solid hsl(var(--avep-border))" }}>
              <div style={label2xs}>Approval History</div>
              <ul className="mt-1 flex flex-col gap-1" style={{ fontSize: "var(--avep-text-xs)", color: "hsl(var(--avep-foreground-muted))" }}>
                <li>· Architecture approved by P. Nair — 2 days ago</li>
                <li>· Verification pending — D. Okafor</li>
                <li>· Security review complete — B. Cohen</li>
              </ul>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <Btn variant="primary" icon={CheckCircle2}>Approve Relationship</Btn>
              <Btn icon={Radio}>View in Graph</Btn>
              <Btn icon={Users}>Reassign Owner</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
