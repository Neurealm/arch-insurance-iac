import { useEffect, useMemo, useState } from "react";
import {
  ShieldCheck, Sparkles, Users, CheckCircle2, Download, AlertTriangle,
  XCircle, Clock, ChevronRight, Search, Filter, MessageSquare,
  GitBranch, Activity, Network, FileText, Cpu, Layers, Radio,
  Zap, HelpCircle, TrendingUp, ArrowRight, BookOpen,
} from "lucide-react";

/* ------------------------------- tokens ------------------------------- */

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

type Tone = "ok" | "warn" | "err" | "info" | "neutral";
const toneMap: Record<Tone, { bg: string; fg: string; dot: string }> = {
  ok:      { bg: "hsl(142 70% 94%)", fg: "hsl(142 65% 28%)", dot: "hsl(142 65% 42%)" },
  warn:    { bg: "hsl(38 100% 92%)", fg: "hsl(28 85% 34%)",  dot: "hsl(35 92% 52%)" },
  err:     { bg: "hsl(0 90% 95%)",   fg: "hsl(0 72% 40%)",   dot: "hsl(0 78% 55%)" },
  info:    { bg: "hsl(var(--avep-primary-soft))", fg: "hsl(var(--avep-primary))", dot: "hsl(var(--avep-primary))" },
  neutral: { bg: "hsl(var(--avep-surface-muted))", fg: "hsl(var(--avep-foreground-muted))", dot: "hsl(var(--avep-foreground-subtle))" },
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
  { children: React.ReactNode; variant?: "primary" | "ghost" | "soft"; onClick?: () => void; icon?: React.ComponentType<{ className?: string }>; title?: string }) {
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

/* -------------------------------- data -------------------------------- */

interface Req {
  id: string; statement: string; quality: number; status: "Excellent" | "Needs Review" | "Ambiguous" | "Critical";
  risk: "high" | "med" | "low"; owner: string; discipline: string; severity?: "critical" | "high" | "med";
  finding?: string; suggestion?: string; source?: string; standard?: string;
}

const REQUIREMENTS: Req[] = [
  { id: "REQ-1042", statement: "The DMA controller shall support scatter-gather descriptor chains up to 512 entries.", quality: 88, status: "Needs Review", risk: "med", owner: "P. Nair",     discipline: "Architecture", severity: "high",     finding: "Missing boundary condition when chain > 512", suggestion: "Add overflow behavior: assert IRQ_ERR and halt fetch.", source: "DDMAC-SPEC-v2.4 §4.2", standard: "AXI" },
  { id: "REQ-1058", statement: "The controller shall respond quickly to completion events.",                          quality: 42, status: "Ambiguous",    risk: "high", owner: "M. Rossi",    discipline: "RTL",          severity: "critical", finding: "'Quickly' has no measurable timing.",           suggestion: "The DMA controller shall acknowledge descriptor completion within 12 clock cycles after receipt of the completion interrupt.", source: "DDMAC-SPEC-v2.4 §5.1", standard: "Internal" },
  { id: "REQ-1063", statement: "IRQ coalescing hit-count must not underflow under back-pressure.",                    quality: 96, status: "Excellent",    risk: "low",  owner: "D. Okafor",   discipline: "Verification", severity: "med",      finding: "None", suggestion: "-", source: "DDMAC-SPEC-v2.4 §6.3", standard: "AMBA" },
  { id: "REQ-1071", statement: "Register writes complete within a reasonable APB window.",                            quality: 55, status: "Needs Review", risk: "med",  owner: "K. Zhou",     discipline: "Interface",    severity: "high",     finding: "'Reasonable' is unverifiable.", suggestion: "Register writes shall complete within 3 APB PCLK cycles of PSEL assertion.", source: "DDMAC-SPEC-v2.4 §3.4", standard: "AMBA" },
  { id: "REQ-1084", statement: "MAC RX shall handle frame length errors.",                                            quality: 61, status: "Needs Review", risk: "med",  owner: "H. Tanaka",   discipline: "Interface",    severity: "med",      finding: "Missing action on error (assert / drop / count).", suggestion: "MAC RX shall assert INT_RX_LEN_ERR and drop the offending frame on FCS mismatch or length > 9000B.", source: "MAC-SPEC-v1.3 §7", standard: "IEEE 802.3" },
  { id: "REQ-1091", statement: "CTRL.soft_reset self-clears after assertion.",                                        quality: 48, status: "Critical",     risk: "high", owner: "L. Tran",     discipline: "RTL",          severity: "critical", finding: "Missing asynchronous reset behavior; clock domain unspecified.", suggestion: "CTRL.soft_reset shall self-clear after 4 aclk cycles, synchronized to aresetn deassertion.", source: "DDMAC-SPEC-v2.4 §3.1", standard: "Internal" },
  { id: "REQ-1102", statement: "Descriptor sequence tags shall be monotonic per ring.",                               quality: 92, status: "Excellent",    risk: "low",  owner: "D. Okafor",   discipline: "Verification", severity: "med",      finding: "None", suggestion: "-", source: "DDMAC-SPEC-v2.4 §4.5", standard: "Internal" },
  { id: "REQ-1117", statement: "The controller shall be secure against unauthorized access.",                         quality: 38, status: "Ambiguous",    risk: "high", owner: "B. Cohen",    discipline: "Security",     severity: "critical", finding: "No threat model, no specific control identified.", suggestion: "CSR write access requires SEC.privilege == 1; else return APB SLVERR and log to SEC_AUDIT_FIFO.", source: "SEC-REQ-v0.9 §2", standard: "NIST" },
  { id: "REQ-1128", statement: "AXI fetch tolerates back-pressure.",                                                  quality: 66, status: "Needs Review", risk: "med",  owner: "K. Zhou",     discipline: "Interface",    severity: "high",     finding: "Missing quantified tolerance window.", suggestion: "AXI AR fetch shall tolerate ARREADY deassertion for ≤128 aclk cycles without loss.", source: "DDMAC-SPEC-v2.4 §4.8", standard: "AXI" },
  { id: "REQ-1135", statement: "Completion coalescing threshold is configurable.",                                    quality: 90, status: "Excellent",    risk: "low",  owner: "M. Rossi",    discipline: "Architecture", severity: "med",      finding: "None", suggestion: "-", source: "DDMAC-SPEC-v2.4 §6.1", standard: "Internal" },
  { id: "REQ-1146", statement: "Descriptor ring wrap preserves ordering.",                                            quality: 94, status: "Excellent",    risk: "low",  owner: "P. Nair",     discipline: "Architecture", severity: "med",      finding: "None", suggestion: "-", source: "DDMAC-SPEC-v2.4 §4.6", standard: "Internal" },
  { id: "REQ-1158", statement: "wr_rsp_pending shall never exceed the outstanding limit.",                            quality: 91, status: "Excellent",    risk: "low",  owner: "D. Okafor",   discipline: "Verification", severity: "med",      finding: "None", suggestion: "-", source: "DDMAC-SPEC-v2.4 §4.9", standard: "AXI" },
  { id: "REQ-1169", statement: "Firmware boot flag shall be readable and writable.",                                  quality: 52, status: "Needs Review", risk: "med",  owner: "S. Park",     discipline: "Firmware",     severity: "high",     finding: "Conflicts with REQ-1117 (privileged CSR).", suggestion: "BOOT_FLAG is RO from unprivileged agents; RW only when SEC.privilege == 1.", source: "FW-SPEC-v0.4 §1", standard: "Internal" },
];

const DISCIPLINES = ["Architecture", "RTL", "Verification", "Security", "Interface", "Performance", "Compliance", "Manufacturing", "Firmware", "System"] as const;

const AI_TIMELINE = [
  { t: "0s",   tone: "warn" as const, msg: "Ambiguous timing detected in REQ-1058 ('quickly')" },
  { t: "2s",   tone: "err"  as const, msg: "Missing reset behavior in REQ-1091" },
  { t: "5s",   tone: "warn" as const, msg: "Undefined timeout window in REQ-1128" },
  { t: "8s",   tone: "info" as const, msg: "Duplicate candidate: REQ-1042 ↔ REQ-1135 (semantic overlap 71%)" },
  { t: "11s",  tone: "warn" as const, msg: "Unverifiable wording in REQ-1071 ('reasonable')" },
  { t: "14s",  tone: "warn" as const, msg: "Missing boundary condition in REQ-1042 (chain > 512)" },
  { t: "17s",  tone: "err"  as const, msg: "Conflicting security requirement REQ-1169 ↔ REQ-1117" },
  { t: "20s",  tone: "ok"   as const, msg: "New clarification opened: CLR-0037 assigned to RTL" },
];

const FINDING_CATEGORIES = [
  { k: "Ambiguous",              n: 12, tone: "warn" as const },
  { k: "Contradictions",         n: 4,  tone: "err"  as const },
  { k: "Duplicates",             n: 7,  tone: "warn" as const },
  { k: "Missing Units",          n: 9,  tone: "warn" as const },
  { k: "Boundary Conditions",    n: 6,  tone: "warn" as const },
  { k: "Unresolved Dependencies",n: 5,  tone: "warn" as const },
  { k: "Unverifiable Language",  n: 3,  tone: "err"  as const },
  { k: "Missing Security",       n: 4,  tone: "err"  as const },
];

const AI_CHECKS = [
  "Ambiguity","Missing Timing","Missing Units","Missing Ranges","Missing Reset Behavior",
  "Missing Clock Domain","Missing Security Conditions","Missing Error Handling","Undefined Acronyms",
  "Passive Language","Duplicate Requirement","Contradiction","Dependency Missing","Interface Mismatch",
  "Undefined States","Missing Acceptance Criteria","Verification Gap",
];

const REVIEWERS = [
  { role: "Architecture", name: "P. Nair",    approved: 41, comments: 12, open: 4, pct: 88 },
  { role: "RTL",          name: "M. Rossi",   approved: 37, comments: 9,  open: 6, pct: 79 },
  { role: "Verification", name: "D. Okafor",  approved: 44, comments: 15, open: 2, pct: 94 },
  { role: "Security",     name: "B. Cohen",   approved: 22, comments: 7,  open: 5, pct: 71 },
  { role: "Interface",    name: "K. Zhou",    approved: 19, comments: 6,  open: 3, pct: 82 },
  { role: "Firmware",     name: "S. Park",    approved: 8,  comments: 3,  open: 2, pct: 66 },
];

const STANDARDS = ["PCIe", "AXI", "AMBA", "IEEE 802.3", "ISO 26262", "IEC 61508", "NIST", "Internal"];

const RADAR = [
  { k: "Atomicity",    v: 92 },
  { k: "Clarity",      v: 87 },
  { k: "Consistency",  v: 90 },
  { k: "Completeness", v: 84 },
  { k: "Traceability", v: 96 },
  { k: "Testability",  v: 89 },
  { k: "Verifiability",v: 93 },
  { k: "Specificity",  v: 82 },
];

const CONFIDENCE_HISTOGRAM = [
  { bucket: "70-75%", n: 4 },
  { bucket: "75-80%", n: 8 },
  { bucket: "80-85%", n: 14 },
  { bucket: "85-90%", n: 27 },
  { bucket: "90-95%", n: 56 },
  { bucket: "95-100%",n: 77 },
];

/* --------------------------- small building blocks ---------------------- */

function Kpi({ label, value, hint, tone = "info", suffix = "" }:
  { label: string; value: number; hint: string; tone?: Tone; suffix?: string }) {
  const v = useCounter(value);
  const s = toneMap[tone];
  return (
    <div className="p-3.5" style={card} title={hint}>
      <div style={label2xs}>{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <div style={{ fontSize: "var(--avep-text-2xl)", fontWeight: 700, color: s.fg, lineHeight: 1.1 }}>
          {suffix === "%" ? v.toFixed(1) : Math.round(v)}
        </div>
        <span style={{ fontSize: "var(--avep-text-md)", color: "hsl(var(--avep-foreground-subtle))" }}>{suffix}</span>
      </div>
      <div style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>{hint}</div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, hint, right }:
  { icon: React.ComponentType<{ className?: string }>; title: string; hint?: string; right?: React.ReactNode }) {
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

/* ------------------------------- charts ------------------------------- */

function RadarChart({ data }: { data: { k: string; v: number }[] }) {
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
    <svg viewBox="0 0 260 260" width="100%" role="img" aria-label="Requirement Quality Gauge radar chart">
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
        const lx = cx + (x - cx) * 1.16;
        const ly = cy + (y - cy) * 1.16;
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

function Treemap({ items }: { items: { k: string; n: number; tone: Tone }[] }) {
  const total = items.reduce((a, b) => a + b.n, 0);
  let x = 0;
  return (
    <div className="relative rounded overflow-hidden" style={{ height: 140, border: "1px solid hsl(var(--avep-border))" }}>
      {items.map((it) => {
        const w = (it.n / total) * 100;
        const s = toneMap[it.tone];
        const left = x; x += w;
        return (
          <div key={it.k} title={`${it.k}: ${it.n}`}
            className="absolute top-0 h-full flex flex-col items-start justify-end p-1.5 transition-opacity hover:opacity-80"
            style={{ left: `${left}%`, width: `${w}%`, background: s.bg, borderRight: "1px solid white" }}>
            <div style={{ fontSize: "var(--avep-text-2xs)", fontWeight: 600, color: s.fg }}>{it.k}</div>
            <div style={{ fontSize: "var(--avep-text-md)", fontWeight: 700, color: s.fg }}>{it.n}</div>
          </div>
        );
      })}
    </div>
  );
}

function ConfidenceHistogram({ data }: { data: { bucket: string; n: number }[] }) {
  const max = Math.max(...data.map((d) => d.n));
  return (
    <div className="flex items-end gap-1.5 h-24">
      {data.map((d) => (
        <div key={d.bucket} className="flex-1 flex flex-col items-center gap-1" title={`${d.bucket}: ${d.n} reqs`}>
          <div className="w-full rounded-t" style={{
            height: `${(d.n / max) * 100}%`,
            background: "hsl(var(--avep-primary))",
            opacity: 0.35 + (parseInt(d.bucket) - 70) / 60,
          }} />
          <div style={{ fontSize: 9, color: "hsl(var(--avep-foreground-subtle))" }}>{d.bucket}</div>
        </div>
      ))}
    </div>
  );
}

function DependencyGraph() {
  // A tiny, curated network (7 nodes) that visualizes duplicate/conflict/depends-on edges.
  const nodes = [
    { id: "REQ-1042", x: 70,  y: 40,  tone: "warn" as Tone },
    { id: "REQ-1135", x: 200, y: 30,  tone: "ok"   as Tone },
    { id: "REQ-1058", x: 60,  y: 130, tone: "err"  as Tone },
    { id: "REQ-1091", x: 180, y: 130, tone: "err"  as Tone },
    { id: "REQ-1117", x: 300, y: 60,  tone: "err"  as Tone },
    { id: "REQ-1169", x: 300, y: 160, tone: "warn" as Tone },
    { id: "REQ-1128", x: 120, y: 210, tone: "warn" as Tone },
  ];
  const edges = [
    { s: "REQ-1042", t: "REQ-1135", kind: "Duplicate?", tone: "warn" as Tone },
    { s: "REQ-1058", t: "REQ-1091", kind: "Depends On", tone: "info" as Tone },
    { s: "REQ-1117", t: "REQ-1169", kind: "Conflicts",  tone: "err"  as Tone },
    { s: "REQ-1042", t: "REQ-1128", kind: "Derived",    tone: "info" as Tone },
    { s: "REQ-1091", t: "REQ-1128", kind: "Allocates",  tone: "info" as Tone },
  ];
  const at = (id: string) => nodes.find((n) => n.id === id)!;
  return (
    <svg viewBox="0 0 380 250" width="100%" style={{ height: 230 }} role="img" aria-label="Requirement dependency graph">
      {edges.map((e, i) => {
        const a = at(e.s), b = at(e.t);
        const c = toneMap[e.tone];
        return (
          <g key={i}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={c.dot} strokeWidth={1.4} strokeDasharray={e.tone === "warn" ? "3 3" : "0"} />
            <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 3} fontSize={8} textAnchor="middle" fill="hsl(var(--avep-foreground-subtle))">{e.kind}</text>
          </g>
        );
      })}
      {nodes.map((n) => {
        const c = toneMap[n.tone];
        return (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r={16} fill={c.bg} stroke={c.dot} strokeWidth={1.5} />
            <text x={n.x} y={n.y + 3} fontSize={8.5} textAnchor="middle" fill={c.fg} fontWeight={600}>{n.id.slice(-4)}</text>
          </g>
        );
      })}
    </svg>
  );
}

function SankeyReviewFlow() {
  const stages = [
    { k: "Requirement",  n: 186, tone: "info" as Tone },
    { k: "Architecture", n: 178, tone: "info" as Tone },
    { k: "RTL",          n: 171, tone: "info" as Tone },
    { k: "Verification", n: 164, tone: "info" as Tone },
    { k: "Simulation",   n: 158, tone: "warn" as Tone },
    { k: "Approval",     n: 149, tone: "ok"   as Tone },
  ];
  const max = stages[0].n;
  return (
    <div className="flex items-stretch gap-1">
      {stages.map((s, i) => {
        const c = toneMap[s.tone];
        const h = (s.n / max) * 80 + 20;
        return (
          <div key={s.k} className="flex-1 flex flex-col items-center">
            <div className="w-full rounded" style={{ height: h, background: c.bg, borderTop: `2px solid ${c.dot}` }} />
            <div className="mt-1" style={{ fontSize: "var(--avep-text-2xs)", fontWeight: 600, color: c.fg }}>{s.n}</div>
            <div style={{ fontSize: 9, color: "hsl(var(--avep-foreground-subtle))" }}>{s.k}</div>
            {i < stages.length - 1 && <div className="hidden" />}
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------- page -------------------------------- */

export default function RequirementsQualityWorkspace() {
  const [selected, setSelected] = useState<Req | null>(null);
  const [disciplineFilter, setDisciplineFilter] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [streamIdx, setStreamIdx] = useState(3);
  const [reviewRunning, setReviewRunning] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setStreamIdx((i) => Math.min(AI_TIMELINE.length, i + 1)), 2500);
    return () => clearInterval(id);
  }, []);

  const rows = useMemo(() => REQUIREMENTS.filter((r) => {
    if (disciplineFilter.size && !disciplineFilter.has(r.discipline)) return false;
    if (search && !(`${r.id} ${r.statement}`.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  }), [disciplineFilter, search]);

  const toneForStatus = (s: Req["status"]): Tone =>
    s === "Excellent" ? "ok" : s === "Needs Review" ? "warn" : "err";
  const toneForRisk = (r: Req["risk"]): Tone => r === "high" ? "err" : r === "med" ? "warn" : "ok";

  const toggleDiscipline = (d: string) =>
    setDisciplineFilter((prev) => {
      const n = new Set(prev);
      n.has(d) ? n.delete(d) : n.add(d);
      return n;
    });

  const runReview = () => {
    setReviewRunning(true);
    setStreamIdx(0);
    setTimeout(() => setReviewRunning(false), 6000);
  };

  return (
    <div className="flex flex-col gap-4 p-4" style={{ background: "hsl(var(--avep-canvas))", minHeight: "100%" }}>
      {/* Breadcrumb */}
      <nav aria-label="Workflow breadcrumb" className="flex items-center gap-1.5 flex-wrap"
        style={{ fontSize: "var(--avep-text-xs)", color: "hsl(var(--avep-foreground-subtle))" }}>
        <span>Engineering Context</span>
        <ChevronRight className="h-3 w-3" />
        <span>Requirements Intake</span>
        <ChevronRight className="h-3 w-3" />
        <span style={{ color: "hsl(var(--avep-primary))", fontWeight: 600 }}>Requirements Quality</span>
        <ChevronRight className="h-3 w-3" />
        <span>Architecture</span>
      </nav>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" style={{ color: "hsl(var(--avep-primary))" }} />
            <h1 style={{ fontSize: "var(--avep-text-xl)", fontWeight: 700 }}>Requirements Quality Workspace</h1>
            <Badge tone="info">AVEP.020</Badge>
          </div>
          <p className="mt-1 max-w-3xl" style={{ fontSize: "var(--avep-text-sm)", color: "hsl(var(--avep-foreground-muted))" }}>
            Identify ambiguity, contradictions, missing engineering information, and implementation risk before architecture begins.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Btn variant="primary" icon={Sparkles} onClick={runReview} title="Trigger a full-corpus AI quality review">
            {reviewRunning ? "Running…" : "Run AI Review"}
          </Btn>
          <Btn variant="soft" icon={MessageSquare} title="Compile all open findings into a prioritized clarification queue">Generate Clarification Queue</Btn>
          <Btn icon={Users} title="Route findings to reviewers by discipline">Assign Reviewers</Btn>
          <Btn icon={CheckCircle2} title="Promote passing requirements to the authoritative baseline">Approve Requirements</Btn>
          <Btn icon={Download} title="Export findings as CSV for offline review">Export Findings</Btn>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi label="Requirements Reviewed" value={186} hint="Ingested and evaluated by AI" tone="info" />
        <Kpi label="Requirements Passing"  value={171} hint="Meets all engineering quality gates" tone="ok" />
        <Kpi label="Quality Score"         value={94.8} suffix="%" hint="Composite of 8 dimensions" tone="ok" />
        <Kpi label="Clarifications Required" value={15} hint="Blocked by ambiguity, gaps, or conflicts" tone="warn" />
      </div>

      {/* Three-column workspace */}
      <div className="grid grid-cols-12 gap-3">
        {/* LEFT PANEL */}
        <div className="col-span-12 xl:col-span-3 flex flex-col gap-3">
          <div className="p-3" style={card}>
            <SectionHeader icon={AlertTriangle} title="Engineering Review Queue" hint="Highest severity first" />
            <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1">
              {REQUIREMENTS.filter((r) => r.status !== "Excellent").map((r) => (
                <button key={r.id} type="button" onClick={() => setSelected(r)}
                  className="text-left rounded-md p-2.5 transition-colors hover:bg-black/[0.03]"
                  style={{ border: "1px solid hsl(var(--avep-border))", background: "hsl(var(--avep-surface))" }}>
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: "var(--avep-text-sm)", fontWeight: 600 }}>{r.id}</span>
                    <Badge tone={r.severity === "critical" ? "err" : r.severity === "high" ? "warn" : "neutral"}>
                      {r.severity ?? "med"}
                    </Badge>
                  </div>
                  <div className="mt-0.5 line-clamp-2" style={{ fontSize: "var(--avep-text-xs)", color: "hsl(var(--avep-foreground-muted))" }}>
                    {r.statement}
                  </div>
                  <div className="mt-1.5 flex items-center gap-1 flex-wrap">
                    <Badge tone={toneForStatus(r.status)}>{r.status}</Badge>
                    <Badge tone="neutral">{r.discipline}</Badge>
                    <span style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>
                      · {r.owner} · Due Today
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-3" style={card}>
            <SectionHeader icon={Filter} title="Engineering Discipline Filter" hint="Multi-select" />
            <div className="flex flex-wrap gap-1.5">
              {DISCIPLINES.map((d) => {
                const on = disciplineFilter.has(d);
                return (
                  <button key={d} type="button" onClick={() => toggleDiscipline(d)}
                    className="px-2 py-1 rounded-md transition-colors"
                    style={{
                      fontSize: "var(--avep-text-2xs)",
                      fontWeight: 600,
                      border: `1px solid ${on ? "hsl(var(--avep-primary))" : "hsl(var(--avep-border))"}`,
                      background: on ? "hsl(var(--avep-primary-soft))" : "hsl(var(--avep-surface))",
                      color: on ? "hsl(var(--avep-primary))" : "hsl(var(--avep-foreground-muted))",
                    }}>
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3" style={card}>
            <SectionHeader icon={BookOpen} title="Engineering Standards" hint="Referenced by corpus" />
            <div className="flex flex-col gap-1.5">
              {STANDARDS.map((s) => {
                const count = REQUIREMENTS.filter((r) => r.standard === s).length;
                return (
                  <div key={s} className="flex items-center justify-between">
                    <span style={{ fontSize: "var(--avep-text-xs)" }}>{s}</span>
                    <Badge tone={count > 0 ? "info" : "neutral"}>{count}</Badge>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CENTER PANEL */}
        <div className="col-span-12 xl:col-span-6 flex flex-col gap-3">
          <div className="p-3" style={card}>
            <SectionHeader icon={Sparkles} title="AI Requirement Analysis" hint="Hover a score for reasoning"
              right={
                <div className="flex items-center gap-1.5 rounded-md px-2 h-7"
                  style={{ background: "hsl(var(--avep-surface-muted))", border: "1px solid hsl(var(--avep-border))" }}>
                  <Search className="h-3.5 w-3.5" style={{ color: "hsl(var(--avep-foreground-subtle))" }} />
                  <input value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search requirements…"
                    className="bg-transparent outline-none"
                    style={{ fontSize: "var(--avep-text-xs)", width: 180 }} />
                </div>
              } />
            <div className="overflow-x-auto rounded" style={{ border: "1px solid hsl(var(--avep-border))" }}>
              <table className="w-full" style={{ fontSize: "var(--avep-text-xs)" }}>
                <thead>
                  <tr style={{ background: "hsl(var(--avep-surface-muted))", color: "hsl(var(--avep-foreground-subtle))" }}>
                    <th className="text-left px-2 py-1.5" style={label2xs}>Req ID</th>
                    <th className="text-left px-2 py-1.5" style={label2xs}>Statement</th>
                    <th className="text-left px-2 py-1.5" style={label2xs}>Quality</th>
                    <th className="text-left px-2 py-1.5" style={label2xs}>Status</th>
                    <th className="text-left px-2 py-1.5" style={label2xs}>Risk</th>
                    <th className="text-left px-2 py-1.5" style={label2xs}>Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} onClick={() => setSelected(r)}
                      className="cursor-pointer hover:bg-black/[0.02] border-t"
                      style={{ borderColor: "hsl(var(--avep-border))" }}>
                      <td className="px-2 py-1.5 font-mono" style={{ fontWeight: 600 }}>{r.id}</td>
                      <td className="px-2 py-1.5 max-w-[280px] truncate" title={r.finding && r.status !== "Excellent" ? `AI: ${r.finding}` : r.statement}>
                        {r.statement}
                      </td>
                      <td className="px-2 py-1.5">
                        <div className="flex items-center gap-1.5" title={r.finding}>
                          <span style={{
                            fontWeight: 700,
                            color: r.quality >= 85 ? toneMap.ok.fg : r.quality >= 60 ? toneMap.warn.fg : toneMap.err.fg,
                          }}>{r.quality}</span>
                          <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--avep-surface-muted))" }}>
                            <div style={{
                              width: `${r.quality}%`, height: "100%",
                              background: r.quality >= 85 ? toneMap.ok.dot : r.quality >= 60 ? toneMap.warn.dot : toneMap.err.dot,
                            }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-1.5"><Badge tone={toneForStatus(r.status)}>{r.status}</Badge></td>
                      <td className="px-2 py-1.5"><Badge tone={toneForRisk(r.risk)}>{r.risk}</Badge></td>
                      <td className="px-2 py-1.5" style={{ color: "hsl(var(--avep-foreground-muted))" }}>{r.owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-1.5 flex items-center gap-3" style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: toneMap.ok.dot }} /> Excellent ≥ 85</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: toneMap.warn.dot }} /> Needs Review 60–84</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: toneMap.err.dot }} /> Critical &lt; 60</span>
            </div>
          </div>

          <div className="p-3" style={card}>
            <SectionHeader icon={Activity} title="AI Findings Timeline" hint="Streaming activity from the AI quality engine" />
            <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto pr-1">
              {AI_TIMELINE.slice(0, streamIdx).map((e, i) => {
                const c = toneMap[e.tone];
                return (
                  <div key={i} className="flex items-start gap-2 rounded-md px-2 py-1.5 animate-fade-in"
                    style={{ border: "1px solid hsl(var(--avep-border))", background: "hsl(var(--avep-surface))" }}>
                    <span className="mt-1 h-2 w-2 rounded-full shrink-0" style={{ background: c.dot }} />
                    <div className="min-w-0 flex-1">
                      <div style={{ fontSize: "var(--avep-text-xs)" }}>{e.msg}</div>
                    </div>
                    <span style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>{e.t}</span>
                  </div>
                );
              })}
              {streamIdx < AI_TIMELINE.length && (
                <div className="flex items-center gap-2 px-2 py-1" style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>
                  <Clock className="h-3 w-3" /> AI engine analyzing corpus…
                </div>
              )}
            </div>
          </div>

          <div className="p-3" style={card}>
            <SectionHeader icon={Zap} title="Suggested Rewrite" hint="AI-proposed engineering-grade rewrite" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-md p-2.5" style={{ background: toneMap.err.bg, border: `1px solid ${toneMap.err.dot}` }}>
                <div style={label2xs}>Original — REQ-1058</div>
                <div className="mt-1" style={{ fontSize: "var(--avep-text-sm)", color: toneMap.err.fg }}>
                  "The controller shall respond quickly."
                </div>
              </div>
              <div className="rounded-md p-2.5" style={{ background: toneMap.ok.bg, border: `1px solid ${toneMap.ok.dot}` }}>
                <div style={label2xs}>AI Suggestion</div>
                <div className="mt-1" style={{ fontSize: "var(--avep-text-sm)", color: toneMap.ok.fg }}>
                  "The DMA controller shall acknowledge descriptor completion within 12 clock cycles after receipt of the completion interrupt."
                </div>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between flex-wrap gap-2">
              <div style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>
                Adds measurable timing · Improves verification · Removes ambiguity
              </div>
              <div className="flex items-center gap-1.5">
                <Btn variant="primary" icon={CheckCircle2}>Architect Approves</Btn>
                <Btn icon={MessageSquare}>Comment</Btn>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="col-span-12 xl:col-span-3 flex flex-col gap-3">
          <div className="p-3" style={card}>
            <SectionHeader icon={TrendingUp} title="Requirement Quality Gauge" hint="Goal: 95+ across all dimensions" />
            <RadarChart data={RADAR} />
          </div>

          <div className="p-3" style={card}>
            <SectionHeader icon={AlertTriangle} title="AI Findings Summary" hint="Hover for engineering meaning" />
            <div className="grid grid-cols-2 gap-2">
              {FINDING_CATEGORIES.map((f) => {
                const c = toneMap[f.tone];
                return (
                  <div key={f.k} className="rounded-md p-2" title={`${f.k}: ${f.n} findings`}
                    style={{ border: "1px solid hsl(var(--avep-border))", background: c.bg }}>
                    <div style={{ fontSize: "var(--avep-text-2xs)", fontWeight: 600, color: c.fg }}>{f.k}</div>
                    <div style={{ fontSize: "var(--avep-text-lg)", fontWeight: 700, color: c.fg, lineHeight: 1.1 }}>{f.n}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3" style={card}>
            <SectionHeader icon={HelpCircle} title="AI Confidence Distribution" hint="98.2% average" />
            <ConfidenceHistogram data={CONFIDENCE_HISTOGRAM} />
            <div className="mt-2 pt-2 border-t" style={{ borderColor: "hsl(var(--avep-border))" }}>
              <div style={label2xs}>Lowest Confidence</div>
              <ul className="mt-1 flex flex-col gap-1">
                {REQUIREMENTS.slice().sort((a, b) => a.quality - b.quality).slice(0, 4).map((r) => (
                  <li key={r.id} className="flex justify-between" style={{ fontSize: "var(--avep-text-xs)" }}>
                    <span className="font-mono">{r.id}</span>
                    <span style={{ color: toneMap.err.fg }}>{r.quality}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Clarification Queue */}
      <div className="p-3" style={card}>
        <SectionHeader icon={MessageSquare} title="Clarification Queue" hint="Prioritized, discipline-routed, AI-recommended"
          right={<Btn variant="soft" icon={Users}>Assign All</Btn>} />
        <div className="overflow-x-auto rounded" style={{ border: "1px solid hsl(var(--avep-border))" }}>
          <table className="w-full" style={{ fontSize: "var(--avep-text-xs)" }}>
            <thead>
              <tr style={{ background: "hsl(var(--avep-surface-muted))" }}>
                {["Priority", "Requirement", "Finding", "AI Recommendation", "Owner", "Discipline", "Due", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-2 py-1.5" style={label2xs}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {REQUIREMENTS.filter((r) => r.status !== "Excellent").map((r) => (
                <tr key={r.id} className="border-t" style={{ borderColor: "hsl(var(--avep-border))" }}>
                  <td className="px-2 py-1.5"><Badge tone={r.severity === "critical" ? "err" : r.severity === "high" ? "warn" : "neutral"}>
                    {r.severity === "critical" ? "Critical" : r.severity === "high" ? "High" : "Medium"}
                  </Badge></td>
                  <td className="px-2 py-1.5 font-mono">{r.id}</td>
                  <td className="px-2 py-1.5 max-w-[220px] truncate" title={r.finding}>{r.finding}</td>
                  <td className="px-2 py-1.5 max-w-[280px] truncate" title={r.suggestion}>{r.suggestion}</td>
                  <td className="px-2 py-1.5">{r.owner}</td>
                  <td className="px-2 py-1.5"><Badge tone="info">{r.discipline}</Badge></td>
                  <td className="px-2 py-1.5" style={{ color: "hsl(var(--avep-foreground-muted))" }}>Today</td>
                  <td className="px-2 py-1.5"><Badge tone="warn">Open</Badge></td>
                  <td className="px-2 py-1.5">
                    <div className="flex items-center gap-1">
                      <button className="px-1.5 py-0.5 rounded hover:bg-black/[0.04]" title="Assign" style={{ fontSize: "var(--avep-text-2xs)", border: "1px solid hsl(var(--avep-border))" }}>Assign</button>
                      <button className="px-1.5 py-0.5 rounded hover:bg-black/[0.04]" title="Approve" style={{ fontSize: "var(--avep-text-2xs)", border: "1px solid hsl(var(--avep-border))", color: toneMap.ok.fg }}>Approve</button>
                      <button className="px-1.5 py-0.5 rounded hover:bg-black/[0.04]" title="Reject" style={{ fontSize: "var(--avep-text-2xs)", border: "1px solid hsl(var(--avep-border))", color: toneMap.err.fg }}>Reject</button>
                      <button className="px-1.5 py-0.5 rounded hover:bg-black/[0.04]" title="Escalate" style={{ fontSize: "var(--avep-text-2xs)", border: "1px solid hsl(var(--avep-border))" }}>Escalate</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Quality Categories + Reviewers */}
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-7 p-3" style={card}>
          <SectionHeader icon={ShieldCheck} title="AI Quality Categories" hint="Continuous checks across the corpus" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
            {AI_CHECKS.map((c) => (
              <div key={c} className="flex items-center gap-1.5 rounded-md px-2 py-1.5"
                style={{ border: "1px solid hsl(var(--avep-border))", fontSize: "var(--avep-text-xs)" }}>
                <CheckCircle2 className="h-3.5 w-3.5" style={{ color: toneMap.ok.dot }} />
                <span>{c}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-12 lg:col-span-5 p-3" style={card}>
          <SectionHeader icon={Users} title="Engineering Collaboration" hint="Reviewer status by discipline" />
          <div className="flex flex-col gap-2">
            {REVIEWERS.map((r) => (
              <div key={r.role} className="flex items-center gap-2 rounded-md p-2"
                style={{ border: "1px solid hsl(var(--avep-border))" }}>
                <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "hsl(var(--avep-primary-soft))", color: "hsl(var(--avep-primary))", fontSize: "var(--avep-text-xs)", fontWeight: 700 }}>
                  {r.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: "var(--avep-text-sm)", fontWeight: 600 }}>{r.role}</span>
                    <span style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>{r.name}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2" style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-muted))" }}>
                    <span>✓ {r.approved}</span>
                    <span>💬 {r.comments}</span>
                    <span>◎ {r.open} open</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--avep-surface-muted))" }}>
                    <div style={{ width: `${r.pct}%`, height: "100%", background: r.pct >= 85 ? toneMap.ok.dot : toneMap.warn.dot }} />
                  </div>
                </div>
                <div className="w-10 text-right" style={{ fontSize: "var(--avep-text-xs)", fontWeight: 700 }}>{r.pct}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Graph + Heatmap + Sankey */}
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-5 p-3" style={card}>
          <SectionHeader icon={Network} title="Requirement Relationship Graph" hint="Duplicates · Depends On · Conflicts · Derived From · Allocates To" />
          <DependencyGraph />
        </div>
        <div className="col-span-12 lg:col-span-4 p-3" style={card}>
          <SectionHeader icon={Layers} title="Requirement Risk Heatmap" hint="Treemap by risk category" />
          <Treemap items={[
            { k: "High Risk",   n: 22, tone: "err" },
            { k: "Medium Risk", n: 48, tone: "warn" },
            { k: "Low Risk",    n: 112, tone: "ok" },
            { k: "Unknown",     n: 4,  tone: "neutral" },
          ]} />
          <div className="mt-2" style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>
            Hover a block to inspect risk contributors.
          </div>
        </div>
        <div className="col-span-12 lg:col-span-3 p-3" style={card}>
          <SectionHeader icon={GitBranch} title="Requirement → Approval Flow" hint="Volume through review stages" />
          <SankeyReviewFlow />
        </div>
      </div>

      {/* Coverage Matrix */}
      <div className="p-3" style={card}>
        <SectionHeader icon={Cpu} title="Requirement Coverage Matrix" hint="Allocation across engineering disciplines" />
        <div className="overflow-x-auto rounded" style={{ border: "1px solid hsl(var(--avep-border))" }}>
          <table className="w-full" style={{ fontSize: "var(--avep-text-xs)" }}>
            <thead>
              <tr style={{ background: "hsl(var(--avep-surface-muted))" }}>
                <th className="text-left px-2 py-1.5" style={label2xs}>Requirement</th>
                {["Architecture", "RTL", "Verification", "Simulation", "Formal", "Coverage", "Security"].map((c) => (
                  <th key={c} className="text-center px-2 py-1.5" style={label2xs}>{c}</th>
                ))}
                <th className="text-left px-2 py-1.5" style={label2xs}>Status</th>
              </tr>
            </thead>
            <tbody>
              {REQUIREMENTS.slice(0, 10).map((r) => {
                const cells = [
                  r.discipline === "Architecture" || Math.random() > 0.3,
                  r.discipline === "RTL" || r.id.endsWith("2") || r.id.endsWith("8"),
                  r.discipline === "Verification" || r.quality > 80,
                  r.quality > 70,
                  r.discipline === "Verification" && r.quality > 85,
                  r.quality > 75,
                  r.discipline === "Security",
                ];
                return (
                  <tr key={r.id} className="border-t" style={{ borderColor: "hsl(var(--avep-border))" }}>
                    <td className="px-2 py-1.5 font-mono">{r.id}</td>
                    {cells.map((v, i) => (
                      <td key={i} className="text-center px-2 py-1.5">
                        <span className="inline-block h-2.5 w-2.5 rounded-full"
                          style={{ background: v ? toneMap.ok.dot : "hsl(var(--avep-surface-muted))", border: `1px solid ${v ? toneMap.ok.dot : "hsl(var(--avep-border))"}` }} />
                      </td>
                    ))}
                    <td className="px-2 py-1.5"><Badge tone={toneForStatus(r.status)}>{r.status}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Engineering Review Timeline */}
      <div className="p-3" style={card}>
        <SectionHeader icon={Radio} title="Engineering Review Timeline" hint="AI review → discipline reviews → approval" />
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { k: "AI Review",           pct: 100, tone: "ok"   as Tone },
            { k: "Architecture Review", pct: 88,  tone: "ok"   as Tone },
            { k: "Security Review",     pct: 71,  tone: "warn" as Tone },
            { k: "Verification Review", pct: 94,  tone: "ok"   as Tone },
            { k: "Interface Review",    pct: 82,  tone: "warn" as Tone },
            { k: "Approval",            pct: 66,  tone: "warn" as Tone },
          ].map((s, i, arr) => {
            const c = toneMap[s.tone];
            return (
              <div key={s.k} className="flex items-center gap-2">
                <div className="rounded-md px-2.5 py-1.5" style={{ border: `1px solid ${c.dot}`, background: c.bg }}>
                  <div style={{ fontSize: "var(--avep-text-2xs)", fontWeight: 600, color: c.fg }}>{s.k}</div>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--avep-surface))" }}>
                      <div style={{ width: `${s.pct}%`, height: "100%", background: c.dot }} />
                    </div>
                    <span style={{ fontSize: "var(--avep-text-2xs)", fontWeight: 700, color: c.fg }}>{s.pct}%</span>
                  </div>
                </div>
                {i < arr.length - 1 && <ArrowRight className="h-3.5 w-3.5" style={{ color: "hsl(var(--avep-foreground-subtle))" }} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Requirement Inspector Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex" role="dialog" aria-label="Requirement Inspector">
          <button type="button" onClick={() => setSelected(null)}
            className="flex-1 bg-black/30" aria-label="Close inspector" />
          <div className="w-full max-w-xl h-full overflow-y-auto animate-slide-in-right p-4 flex flex-col gap-3"
            style={{ background: "hsl(var(--avep-surface))", borderLeft: "1px solid hsl(var(--avep-border))" }}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono" style={{ fontSize: "var(--avep-text-md)", fontWeight: 700 }}>{selected.id}</span>
                  <Badge tone={toneForStatus(selected.status)}>{selected.status}</Badge>
                  <Badge tone="info">{selected.discipline}</Badge>
                </div>
                <div className="mt-1" style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>
                  Source: {selected.source} · Owner: {selected.owner}
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-1 rounded hover:bg-black/[0.04]" aria-label="Close">
                <XCircle className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-md p-2.5" style={{ border: "1px solid hsl(var(--avep-border))" }}>
              <div style={label2xs}>Original Requirement</div>
              <div className="mt-1" style={{ fontSize: "var(--avep-text-sm)" }}>{selected.statement}</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-md p-2" style={{ border: "1px solid hsl(var(--avep-border))" }}>
                <div style={label2xs}>Quality Score</div>
                <div style={{ fontSize: "var(--avep-text-xl)", fontWeight: 700 }}>{selected.quality}</div>
              </div>
              <div className="rounded-md p-2" style={{ border: "1px solid hsl(var(--avep-border))" }}>
                <div style={label2xs}>Risk</div>
                <div className="mt-1"><Badge tone={toneForRisk(selected.risk)}>{selected.risk}</Badge></div>
              </div>
            </div>

            <div className="rounded-md p-2.5" style={{ border: `1px solid ${toneMap.warn.dot}`, background: toneMap.warn.bg }}>
              <div style={label2xs}>Quality Findings</div>
              <div className="mt-1" style={{ fontSize: "var(--avep-text-sm)", color: toneMap.warn.fg }}>{selected.finding || "None"}</div>
            </div>

            {selected.suggestion && selected.suggestion !== "-" && (
              <div className="rounded-md p-2.5" style={{ border: `1px solid ${toneMap.ok.dot}`, background: toneMap.ok.bg }}>
                <div style={label2xs}>AI Suggested Rewrite</div>
                <div className="mt-1" style={{ fontSize: "var(--avep-text-sm)", color: toneMap.ok.fg }}>{selected.suggestion}</div>
              </div>
            )}

            <div className="rounded-md p-2.5" style={{ border: "1px solid hsl(var(--avep-border))" }}>
              <div style={label2xs}>AI Explanation</div>
              <ul className="mt-1 list-disc pl-4 flex flex-col gap-0.5" style={{ fontSize: "var(--avep-text-xs)", color: "hsl(var(--avep-foreground-muted))" }}>
                <li>Detected against 17 engineering quality checks.</li>
                <li>Cross-referenced with {selected.standard} standard.</li>
                <li>Suggested rewrite optimized for measurability and testability.</li>
              </ul>
            </div>

            <div className="rounded-md p-2.5" style={{ border: "1px solid hsl(var(--avep-border))" }}>
              <div style={label2xs}>Linked Requirements</div>
              <div className="mt-1 flex flex-wrap gap-1">
                {["REQ-1042", "REQ-1128", "REQ-1117"].filter((x) => x !== selected.id).map((x) => (
                  <Badge key={x} tone="info">{x}</Badge>
                ))}
              </div>
            </div>

            <div className="rounded-md p-2.5" style={{ border: "1px solid hsl(var(--avep-border))" }}>
              <div style={label2xs}>Approval History</div>
              <ul className="mt-1 flex flex-col gap-1" style={{ fontSize: "var(--avep-text-xs)", color: "hsl(var(--avep-foreground-muted))" }}>
                <li>· AI review completed — 12 min ago</li>
                <li>· Assigned to {selected.owner} — 8 min ago</li>
                <li>· Awaiting architect approval</li>
              </ul>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <Btn variant="primary" icon={CheckCircle2}>Approve</Btn>
              <Btn icon={MessageSquare}>Comment</Btn>
              <Btn icon={Users}>Reassign</Btn>
              <Btn icon={AlertTriangle}>Escalate</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
