import { useEffect, useMemo, useState } from "react";
import {
  Upload, Link2, Sparkles, ShieldCheck, FileText, FileSpreadsheet, Mail,
  BookOpen, FileCode2, Database, Cloud, GitBranch, Layers, AlertTriangle,
  CheckCircle2, Clock, Search, Filter, Download, ChevronRight, Cpu,
  Activity, Network, TrendingUp, XCircle, HelpCircle,
} from "lucide-react";

/* --------------------------- tokens & helpers --------------------------- */

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

function Badge({ tone = "neutral", children }: { tone?: "ok" | "warn" | "err" | "info" | "neutral"; children: React.ReactNode }) {
  const map: Record<string, { bg: string; fg: string }> = {
    ok:      { bg: "hsl(142 70% 94%)", fg: "hsl(142 65% 28%)" },
    warn:    { bg: "hsl(38 100% 92%)", fg: "hsl(28 85% 34%)" },
    err:     { bg: "hsl(0 90% 95%)",   fg: "hsl(0 72% 40%)" },
    info:    { bg: "hsl(var(--avep-primary-soft))", fg: "hsl(var(--avep-primary))" },
    neutral: { bg: "hsl(var(--avep-surface-muted))", fg: "hsl(var(--avep-foreground-muted))" },
  };
  const s = map[tone];
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded"
      style={{ background: s.bg, color: s.fg, fontSize: "var(--avep-text-2xs)", fontWeight: 600 }}
    >
      {children}
    </span>
  );
}

function useCounter(target: number, ms = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / ms);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

/* --------------------------------- data --------------------------------- */

const SOURCE_TYPES = [
  { id: "doors",       label: "IBM DOORS",             icon: Database },
  { id: "polarion",    label: "Polarion",              icon: Database },
  { id: "jama",        label: "Jama",                  icon: Database },
  { id: "confluence",  label: "Confluence",            icon: BookOpen },
  { id: "word",        label: "Microsoft Word",        icon: FileText },
  { id: "pdf",         label: "PDF",                   icon: FileText },
  { id: "excel",       label: "Excel",                 icon: FileSpreadsheet },
  { id: "email",       label: "Email",                 icon: Mail },
  { id: "priorip",     label: "Prior IP Docs",         icon: Cpu },
  { id: "customer",    label: "Customer Specs",        icon: FileText },
  { id: "arch",        label: "Architecture Docs",     icon: Layers },
  { id: "standards",   label: "Standards",             icon: ShieldCheck },
  { id: "md",          label: "Markdown",              icon: FileCode2 },
  { id: "txt",         label: "Text Files",            icon: FileCode2 },
] as const;

const CONNECTORS = [
  { name: "Confluence",     status: "Connected"    as const },
  { name: "Git",            status: "Connected"    as const },
  { name: "SharePoint",     status: "Connected"    as const },
  { name: "OneDrive",       status: "Pending"      as const },
  { name: "Google Drive",   status: "Connected"    as const },
  { name: "Jira",           status: "Connected"    as const },
  { name: "Azure DevOps",   status: "Pending"      as const },
  { name: "DOORS",          status: "Connected"    as const },
  { name: "Polarion",       status: "Disconnected" as const },
  { name: "Jama",           status: "Disconnected" as const },
];

const PIPELINE = [
  "Upload", "OCR", "Language Detection", "Document Parsing",
  "Requirement Detection", "Classification", "Normalization",
  "Conflict Detection", "Deduplication", "Record Generation",
  "Human Review", "Approved",
];

const STREAM_TEXTS = [
  "Requirement detected in DDMAC-SPEC-v2.4 §4.3.1",
  "Duplicate found: REQ-1042 ≈ REQ-1088",
  "Terminology normalized: 'Controller' → 'DMA Controller'",
  "Conflicting statement identified in REQ-1045 ⇄ REQ-1082",
  "New interface requirement extracted (AXI4)",
  "Requirement classified as Timing",
  "Passive language flagged in REQ-1113",
  "Missing acceptance criteria in REQ-1121",
  "Ambiguous term 'reasonable latency' — clarify",
  "Provenance signed with SHA-256 checksum",
];

const CLASSIFICATION = [
  { k: "Functional",     v: 42, c: "hsl(220 85% 55%)" },
  { k: "Interface",      v: 96, c: "hsl(185 75% 45%)" },
  { k: "Performance",    v: 18, c: "hsl(265 70% 60%)" },
  { k: "Timing",         v: 26, c: "hsl(28 90% 55%)" },
  { k: "Safety",         v: 8,  c: "hsl(0 72% 55%)" },
  { k: "Security",       v: 12, c: "hsl(340 75% 55%)" },
  { k: "Compliance",     v: 17, c: "hsl(200 70% 45%)" },
  { k: "Manufacturing",  v: 9,  c: "hsl(140 55% 45%)" },
  { k: "Verification",   v: 23, c: "hsl(160 65% 40%)" },
  { k: "Documentation",  v: 5,  c: "hsl(220 15% 55%)" },
];

const EXTRACTED = [
  { id: "REQ-1042", src: "DDMAC-SPEC-v2.4",    text: "The DMA engine shall support scatter-gather mode.",             type: "Functional",  prio: "High",     conf: 98, status: "Validated" as const },
  { id: "REQ-1043", src: "DDMAC-SPEC-v2.4",    text: "AXI fetch shall tolerate back-pressure of up to 128 cycles.",   type: "Interface",   prio: "High",     conf: 96, status: "Validated" as const },
  { id: "REQ-1044", src: "MAC-IF-v1.2",        text: "MAC TX PHY handshake latency shall not exceed 12 cycles.",      type: "Timing",      prio: "High",     conf: 94, status: "Validated" as const },
  { id: "REQ-1045", src: "PERF-BUDGET-2026",   text: "End-to-end descriptor completion under 220ns at 1GHz.",         type: "Performance", prio: "Critical", conf: 88, status: "Needs Review" as const },
  { id: "REQ-1046", src: "SEC-REVIEW-Q3",      text: "Register writes to CTRL must require privilege level ≥ 2.",     type: "Security",    prio: "High",     conf: 92, status: "Pending" as const },
  { id: "REQ-1047", src: "COMPLIANCE-PCIE-6",  text: "Completion coalescing shall meet PCIe 6.0 §6.2 ordering.",      type: "Compliance",  prio: "Critical", conf: 97, status: "Validated" as const },
  { id: "REQ-1048", src: "CUSTOMER-PAN-01",    text: "IRQ_MASK power-on default shall be all-masked.",                type: "Functional",  prio: "Low",      conf: 99, status: "Validated" as const },
  { id: "REQ-1049", src: "ARCH-DDMAC-DRAFT",   text: "Descriptor sequence tags shall be monotonic per ring.",         type: "Functional",  prio: "High",     conf: 95, status: "Validated" as const },
];

const REPO_ROWS = [
  { id: "REQ-1042", title: "Scatter-gather DMA support",             type: "Functional",  prio: "High",     src: "DDMAC-SPEC-v2.4",   conf: 98, status: "Approved" as const, owner: "P. Nair",     ver: "Sim",    rtl: "High",   ai: 94 },
  { id: "REQ-1043", title: "AXI back-pressure tolerance ≤128 cyc",   type: "Interface",   prio: "High",     src: "DDMAC-SPEC-v2.4",   conf: 96, status: "Approved" as const, owner: "K. Zhou",     ver: "Sim",    rtl: "High",   ai: 92 },
  { id: "REQ-1044", title: "MAC TX PHY handshake ≤12 cyc",           type: "Timing",      prio: "High",     src: "MAC-IF-v1.2",       conf: 94, status: "Approved" as const, owner: "B. Cohen",    ver: "Sim",    rtl: "Med",    ai: 90 },
  { id: "REQ-1045", title: "Descriptor completion ≤220ns @1GHz",     type: "Performance", prio: "Critical", src: "PERF-BUDGET-2026",  conf: 88, status: "Conflict" as const, owner: "D. Okafor",   ver: "Formal", rtl: "High",   ai: 78 },
  { id: "REQ-1046", title: "CTRL privilege gate",                    type: "Security",    prio: "High",     src: "SEC-REVIEW-Q3",     conf: 92, status: "Pending"  as const, owner: "L. Tran",     ver: "Review", rtl: "Low",    ai: 86 },
  { id: "REQ-1047", title: "PCIe 6.0 §6.2 ordering compliance",      type: "Compliance",  prio: "Critical", src: "COMPLIANCE-PCIE-6", conf: 97, status: "Approved" as const, owner: "M. Rossi",    ver: "Sim",    rtl: "High",   ai: 95 },
  { id: "REQ-1048", title: "IRQ_MASK POR default masked",            type: "Functional",  prio: "Low",      src: "CUSTOMER-PAN-01",   conf: 99, status: "Approved" as const, owner: "L. Tran",     ver: "Review", rtl: "Low",    ai: 96 },
  { id: "REQ-1049", title: "Monotonic descriptor sequence tags",     type: "Functional",  prio: "High",     src: "ARCH-DDMAC-DRAFT",  conf: 95, status: "Approved" as const, owner: "D. Okafor",   ver: "Formal", rtl: "Med",    ai: 91 },
  { id: "REQ-1082", title: "Descriptor completion ≤180ns @1GHz",     type: "Performance", prio: "Critical", src: "CUSTOMER-PAN-02",   conf: 84, status: "Conflict" as const, owner: "D. Okafor",   ver: "Formal", rtl: "High",   ai: 74 },
  { id: "REQ-1113", title: "Reset behavior after power collapse",    type: "Functional",  prio: "Medium",   src: "DDMAC-SPEC-v2.4",   conf: 81, status: "Needs Review" as const, owner: "P. Nair", ver: "Sim",    rtl: "Med",    ai: 79 },
  { id: "REQ-1121", title: "Coalescing threshold configurable",      type: "Configurability" as any, prio: "Medium", src: "DDMAC-SPEC-v2.4", conf: 90, status: "Approved" as const, owner: "M. Rossi", ver: "Sim", rtl: "Med",   ai: 88 },
  { id: "REQ-1155", title: "wr_rsp_pending outstanding bound",       type: "Functional",  prio: "Critical", src: "ARCH-DDMAC-DRAFT",  conf: 93, status: "Approved" as const, owner: "D. Okafor",   ver: "Formal", rtl: "High",   ai: 92 },
];

const AI_INSIGHTS = [
  { sev: "err"  as const, kind: "Conflicting Requirements",        note: "REQ-1045 vs REQ-1082 — timing budget mismatch (220ns vs 180ns)." },
  { sev: "warn" as const, kind: "Duplicate Requirements",          note: "11 near-duplicates detected across 4 source documents." },
  { sev: "warn" as const, kind: "Missing Acceptance Criteria",     note: "REQ-1121 lacks measurable acceptance criteria." },
  { sev: "warn" as const, kind: "Passive Language",                note: "9 requirements use passive voice — rewrite recommended." },
  { sev: "info" as const, kind: "Undefined Terms",                 note: "'reasonable latency', 'sufficient bandwidth' — clarify." },
  { sev: "info" as const, kind: "Undefined Acronyms",              note: "'DPC', 'CSF' not present in engineering glossary." },
  { sev: "warn" as const, kind: "Missing Units",                   note: "3 timing requirements omit ns/µs/cycles." },
  { sev: "info" as const, kind: "Inconsistent Naming",             note: "'Descriptor Ring' vs 'Queue' vs 'FIFO' used interchangeably." },
];

const RADAR_AXES = [
  { k: "Completeness", v: 92 },
  { k: "Consistency",  v: 88 },
  { k: "Traceability", v: 96 },
  { k: "Specificity",  v: 84 },
  { k: "Testability",  v: 90 },
  { k: "Atomicity",    v: 87 },
  { k: "Ambiguity",    v: 82 },
];

/* --------------------------------- ui bits ------------------------------ */

function KpiCard({ label, value, suffix, sub }: { label: string; value: number; suffix?: string; sub?: string }) {
  const v = useCounter(value, 1100);
  return (
    <div className="p-4" style={card}>
      <div style={label2xs}>{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span style={{ fontSize: "var(--avep-text-2xl)", fontWeight: 700, letterSpacing: "-0.02em" }}>
          {v.toLocaleString()}
        </span>
        {suffix && <span style={{ fontSize: "var(--avep-text-md)", color: "hsl(var(--avep-foreground-muted))" }}>{suffix}</span>}
      </div>
      {sub && (
        <div className="mt-1" style={{ fontSize: "var(--avep-text-xs)", color: "hsl(var(--avep-foreground-subtle))" }}>{sub}</div>
      )}
    </div>
  );
}

function HeaderBtn({ icon: Icon, children, primary }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode; primary?: boolean }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 px-2.5 h-8 rounded-md transition-colors hover:opacity-90"
      style={{
        background: primary ? "hsl(var(--avep-primary))" : "hsl(var(--avep-surface))",
        color: primary ? "hsl(var(--avep-primary-foreground))" : "hsl(var(--avep-foreground))",
        border: primary ? "1px solid hsl(var(--avep-primary))" : "1px solid hsl(var(--avep-border))",
        fontSize: "var(--avep-text-sm)",
        fontWeight: 600,
      }}
    >
      <Icon className="h-3.5 w-3.5" />
      {children}
    </button>
  );
}

/* --------------------------- classification pie ------------------------- */

function PieChart() {
  const total = CLASSIFICATION.reduce((s, c) => s + c.v, 0);
  const R = 70, cx = 90, cy = 90;
  let a = -Math.PI / 2;
  const arcs = CLASSIFICATION.map((c) => {
    const ang = (c.v / total) * Math.PI * 2;
    const x1 = cx + R * Math.cos(a);
    const y1 = cy + R * Math.sin(a);
    const x2 = cx + R * Math.cos(a + ang);
    const y2 = cy + R * Math.sin(a + ang);
    const large = ang > Math.PI ? 1 : 0;
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} Z`;
    a += ang;
    return { d, ...c };
  });
  return (
    <div className="flex items-center gap-3">
      <svg width="180" height="180" viewBox="0 0 180 180" aria-label="Requirement classification pie chart">
        {arcs.map((a, i) => (
          <path key={i} d={a.d} fill={a.c} stroke="white" strokeWidth={1}>
            <title>{a.k}: {a.v} ({Math.round((a.v / total) * 100)}%)</title>
          </path>
        ))}
        <circle cx={cx} cy={cy} r={34} fill="white" />
        <text x={cx} y={cy - 2} textAnchor="middle" fontSize="18" fontWeight="700" fill="hsl(220 20% 20%)">{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="9" fill="hsl(220 10% 45%)">requirements</text>
      </svg>
      <div className="grid grid-cols-1 gap-1 text-[11px]">
        {CLASSIFICATION.map((c) => (
          <div key={c.k} className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-sm" style={{ background: c.c }} />
            <span style={{ color: "hsl(var(--avep-foreground-muted))" }}>{c.k}</span>
            <span className="ml-auto font-mono" style={{ color: "hsl(var(--avep-foreground))" }}>{c.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --------------------------- radar quality gauge ------------------------ */

function Radar() {
  const cx = 130, cy = 130, R = 100;
  const n = RADAR_AXES.length;
  const pts = RADAR_AXES.map((a, i) => {
    const ang = (i / n) * Math.PI * 2 - Math.PI / 2;
    const r = (a.v / 100) * R;
    return [cx + r * Math.cos(ang), cy + r * Math.sin(ang)];
  });
  const axisPts = RADAR_AXES.map((_, i) => {
    const ang = (i / n) * Math.PI * 2 - Math.PI / 2;
    return [cx + R * Math.cos(ang), cy + R * Math.sin(ang)];
  });
  return (
    <svg width="260" height="260" viewBox="0 0 260 260" aria-label="Requirement quality radar">
      {[0.25, 0.5, 0.75, 1].map((f, i) => (
        <polygon
          key={i}
          points={axisPts.map(([x, y]) => `${cx + (x - cx) * f},${cy + (y - cy) * f}`).join(" ")}
          fill="none"
          stroke="hsl(var(--avep-border))"
        />
      ))}
      {axisPts.map(([x, y], i) => (
        <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="hsl(var(--avep-border))" />
      ))}
      <polygon
        points={pts.map(([x, y]) => `${x},${y}`).join(" ")}
        fill="hsl(var(--avep-primary) / 0.18)"
        stroke="hsl(var(--avep-primary))"
        strokeWidth={2}
      />
      {RADAR_AXES.map((a, i) => {
        const ang = (i / n) * Math.PI * 2 - Math.PI / 2;
        const x = cx + (R + 14) * Math.cos(ang);
        const y = cy + (R + 14) * Math.sin(ang);
        return (
          <text key={a.k} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="hsl(220 15% 35%)">
            {a.k}
          </text>
        );
      })}
    </svg>
  );
}

/* -------------------------------- page ---------------------------------- */

export default function RequirementsIntakeWorkspace() {
  const [streamIdx, setStreamIdx] = useState(0);
  const [pipelineIdx, setPipelineIdx] = useState(4);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  useEffect(() => {
    const t = setInterval(() => setStreamIdx((i) => (i + 1) % STREAM_TEXTS.length), 3000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const t = setInterval(() => setPipelineIdx((i) => (i + 1) % PIPELINE.length), 2200);
    return () => clearInterval(t);
  }, []);

  const feed = useMemo(() => {
    const out: string[] = [];
    for (let i = 0; i < 6; i++) out.push(STREAM_TEXTS[(streamIdx - i + STREAM_TEXTS.length) % STREAM_TEXTS.length]);
    return out;
  }, [streamIdx]);

  const filteredRepo = useMemo(() => {
    return REPO_ROWS.filter((r) => {
      const okQ = !query ||
        r.id.toLowerCase().includes(query.toLowerCase()) ||
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.src.toLowerCase().includes(query.toLowerCase());
      const okS = statusFilter === "All" || r.status === statusFilter;
      return okQ && okS;
    });
  }, [query, statusFilter]);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span style={label2xs}>AVEP.010</span>
            <span style={{ ...label2xs, color: "hsl(var(--avep-accent))" }}>Requirements Intake</span>
          </div>
          <h1 style={{ fontSize: "var(--avep-text-2xl)", fontWeight: 700, letterSpacing: "-0.02em" }}>
            Requirements Intake Workspace
          </h1>
          <p className="mt-1" style={{ fontSize: "var(--avep-text-sm)", color: "hsl(var(--avep-foreground-muted))", maxWidth: 780 }}>
            Transform heterogeneous engineering artifacts into governed, traceable engineering requirements — with full provenance, classification, conflict detection, and human-in-the-loop validation.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <HeaderBtn icon={Upload}>Upload Sources</HeaderBtn>
          <HeaderBtn icon={Link2}>Connect Repository</HeaderBtn>
          <HeaderBtn icon={Sparkles} primary>Run AI Extraction</HeaderBtn>
          <HeaderBtn icon={ShieldCheck}>Validate Intake</HeaderBtn>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Engineering Sources" value={18} sub="4 repositories · 14 uploads" />
        <KpiCard label="Requirements Extracted" value={186} sub="42 arch · 96 interface · 26 timing" />
        <KpiCard label="AI Classification Confidence" value={98} suffix=".4%" sub="9 need review · 6 conflicts" />
        <KpiCard label="Human Validation" value={94} suffix="% Complete" sub="163 of 186 approved" />
      </div>

      {/* Three-column main */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
        {/* LEFT */}
        <div className="xl:col-span-3 flex flex-col gap-3">
          {/* Upload zone */}
          <div className="p-4" style={card}>
            <div style={label2xs}>Engineering Sources</div>
            <div
              className="mt-2 rounded-md border-2 border-dashed p-5 flex flex-col items-center text-center gap-1.5"
              style={{ borderColor: "hsl(var(--avep-primary))", background: "hsl(var(--avep-primary-soft) / 0.4)" }}
            >
              <Upload className="h-6 w-6" style={{ color: "hsl(var(--avep-primary))" }} />
              <div style={{ fontSize: "var(--avep-text-sm)", fontWeight: 600 }}>Drop engineering artifacts here</div>
              <div style={{ fontSize: "var(--avep-text-xs)", color: "hsl(var(--avep-foreground-muted))" }}>
                DOCX · PDF · XLSX · MD · DOORS · Polarion · Jama
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              {SOURCE_TYPES.map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.id}
                    className="group flex items-center gap-1.5 px-2 py-1.5 rounded border cursor-default"
                    style={{ borderColor: "hsl(var(--avep-border))", background: "hsl(var(--avep-surface-muted))" }}
                    title={`${s.label} · signed provenance · SHA-256 checksum`}
                  >
                    <Icon className="h-3.5 w-3.5" style={{ color: "hsl(var(--avep-primary))" }} />
                    <span style={{ fontSize: "var(--avep-text-xs)" }}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Connectors */}
          <div className="p-4" style={card}>
            <div style={label2xs}>Repository Connectors</div>
            <div className="mt-2 flex flex-col gap-1.5">
              {CONNECTORS.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center gap-2 px-2 py-1.5 rounded border"
                  style={{ borderColor: "hsl(var(--avep-border))" }}
                >
                  <Cloud className="h-3.5 w-3.5" style={{ color: "hsl(var(--avep-foreground-subtle))" }} />
                  <span style={{ fontSize: "var(--avep-text-sm)", fontWeight: 500 }}>{c.name}</span>
                  <span className="ml-auto">
                    <Badge tone={c.status === "Connected" ? "ok" : c.status === "Pending" ? "warn" : "err"}>
                      {c.status}
                    </Badge>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER */}
        <div className="xl:col-span-6 flex flex-col gap-3">
          {/* Pipeline */}
          <div className="p-4" style={card}>
            <div className="flex items-center justify-between">
              <div style={label2xs}>AI Extraction Pipeline</div>
              <span style={{ fontSize: "var(--avep-text-xs)", color: "hsl(var(--avep-foreground-muted))" }}>
                Stage {pipelineIdx + 1} / {PIPELINE.length}
              </span>
            </div>
            <div className="mt-3 overflow-x-auto">
              <div className="flex items-center gap-1 min-w-max">
                {PIPELINE.map((s, i) => {
                  const done = i < pipelineIdx;
                  const active = i === pipelineIdx;
                  return (
                    <div key={s} className="flex items-center">
                      <div
                        className="flex flex-col items-center gap-1 px-2 py-1.5 rounded-md border transition-all"
                        style={{
                          minWidth: 96,
                          borderColor: active ? "hsl(var(--avep-primary))" : done ? "hsl(142 60% 60%)" : "hsl(var(--avep-border))",
                          background: active ? "hsl(var(--avep-primary-soft))" : done ? "hsl(142 70% 96%)" : "hsl(var(--avep-surface))",
                        }}
                        title={`${s} — mean runtime ${(0.6 + i * 0.2).toFixed(1)}s`}
                      >
                        {done ? <CheckCircle2 className="h-3.5 w-3.5" style={{ color: "hsl(142 65% 35%)" }} />
                              : active ? <Activity className="h-3.5 w-3.5 animate-pulse" style={{ color: "hsl(var(--avep-primary))" }} />
                              : <Clock className="h-3.5 w-3.5" style={{ color: "hsl(var(--avep-foreground-subtle))" }} />}
                        <span style={{ fontSize: "var(--avep-text-2xs)", fontWeight: 600, textAlign: "center" }}>{s}</span>
                        <div className="h-1 w-full rounded-full" style={{ background: "hsl(var(--avep-surface-muted))" }}>
                          <div
                            className="h-1 rounded-full transition-all"
                            style={{
                              width: done ? "100%" : active ? "60%" : "0%",
                              background: done ? "hsl(142 60% 50%)" : "hsl(var(--avep-primary))",
                            }}
                          />
                        </div>
                      </div>
                      {i < PIPELINE.length - 1 && (
                        <ChevronRight className="h-3.5 w-3.5 mx-0.5 shrink-0" style={{ color: "hsl(var(--avep-foreground-subtle))" }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Live extraction + AI feed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="lg:col-span-2 p-4" style={card}>
              <div className="flex items-center justify-between">
                <div style={label2xs}>Live Requirement Extraction</div>
                <span className="inline-flex items-center gap-1" style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(142 65% 35%)" }}>
                  <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "hsl(142 65% 45%)" }} />
                  Streaming
                </span>
              </div>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full" style={{ fontSize: "var(--avep-text-xs)" }}>
                  <thead>
                    <tr style={{ color: "hsl(var(--avep-foreground-subtle))", textAlign: "left" }}>
                      <th className="py-1.5 pr-2">ID</th>
                      <th className="py-1.5 pr-2">Source</th>
                      <th className="py-1.5 pr-2">Original Text</th>
                      <th className="py-1.5 pr-2">Type</th>
                      <th className="py-1.5 pr-2">Prio</th>
                      <th className="py-1.5 pr-2">Conf</th>
                      <th className="py-1.5 pr-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {EXTRACTED.map((r) => (
                      <tr key={r.id} className="border-t" style={{ borderColor: "hsl(var(--avep-border))" }} title={r.text}>
                        <td className="py-1.5 pr-2 font-mono">{r.id}</td>
                        <td className="py-1.5 pr-2" style={{ color: "hsl(var(--avep-foreground-muted))" }}>{r.src}</td>
                        <td className="py-1.5 pr-2 max-w-[280px] truncate">{r.text}</td>
                        <td className="py-1.5 pr-2">{r.type}</td>
                        <td className="py-1.5 pr-2">{r.prio}</td>
                        <td className="py-1.5 pr-2 font-mono">{r.conf}%</td>
                        <td className="py-1.5 pr-2">
                          <Badge tone={r.status === "Validated" ? "ok" : r.status === "Needs Review" ? "warn" : "info"}>
                            {r.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4" style={card}>
              <div style={label2xs}>AI Activity Feed</div>
              <div className="mt-2 flex flex-col gap-1.5">
                {feed.map((t, i) => (
                  <div
                    key={`${t}-${i}-${streamIdx}`}
                    className="flex items-start gap-2 px-2 py-1.5 rounded animate-fade-in"
                    style={{
                      background: i === 0 ? "hsl(var(--avep-primary-soft))" : "hsl(var(--avep-surface-muted))",
                      opacity: 1 - i * 0.13,
                    }}
                  >
                    <Sparkles className="h-3 w-3 mt-0.5 shrink-0" style={{ color: "hsl(var(--avep-primary))" }} />
                    <span style={{ fontSize: "var(--avep-text-xs)" }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Provenance */}
          <div className="p-4" style={card}>
            <div className="flex items-center justify-between">
              <div style={label2xs}>Engineering Provenance</div>
              <Badge tone="ok"><ShieldCheck className="h-3 w-3" /> Signed</Badge>
            </div>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2" style={{ fontSize: "var(--avep-text-xs)" }}>
              {[
                ["Source Document", "DDMAC-SPEC-v2.4.docx"],
                ["Page / Paragraph", "p. 42 · §4.3.1"],
                ["Revision", "2.4.7"],
                ["Author", "P. Nair"],
                ["Timestamp", "2026-07-19 14:22 UTC"],
                ["Repository", "confluence://ddmac/spec"],
                ["Checksum", "sha256:9f2a…c481"],
                ["Signature", "AVEP-Prov · valid"],
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={label2xs}>{k}</div>
                  <div className="font-mono" style={{ color: "hsl(var(--avep-foreground))" }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="xl:col-span-3 flex flex-col gap-3">
          {/* Classification pie */}
          <div className="p-4" style={card}>
            <div style={label2xs}>AI Classification Summary</div>
            <div className="mt-2"><PieChart /></div>
          </div>

          {/* Validation queue */}
          <div className="p-4" style={card}>
            <div style={label2xs}>Human Validation Queue</div>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {[
                { k: "Pending", n: 14, t: "info" as const, i: Clock },
                { k: "Approved", n: 163, t: "ok" as const, i: CheckCircle2 },
                { k: "Rejected", n: 3, t: "err" as const, i: XCircle },
                { k: "Needs Clarification", n: 9, t: "warn" as const, i: HelpCircle },
              ].map((q) => {
                const Icon = q.i;
                return (
                  <div key={q.k} className="p-2 rounded border" style={{ borderColor: "hsl(var(--avep-border))" }}>
                    <div className="flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5" />
                      <span style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-muted))" }}>{q.k}</span>
                    </div>
                    <div className="mt-0.5 flex items-baseline gap-1">
                      <span style={{ fontSize: "var(--avep-text-lg)", fontWeight: 700 }}>{q.n}</span>
                      <span style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>reviewer: D. Okafor</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Terminology normalization */}
          <div className="p-4" style={card}>
            <div style={label2xs}>Terminology Normalization</div>
            <div className="mt-2 flex flex-col gap-1.5" style={{ fontSize: "var(--avep-text-xs)" }}>
              {[
                ["Controller", "DMA Controller"],
                ["Queue", "Descriptor Ring"],
                ["Packet", "Frame"],
                ["FIFO", "Descriptor Ring"],
              ].map(([o, n]) => (
                <div key={o} className="flex items-center gap-2 px-2 py-1 rounded" style={{ background: "hsl(var(--avep-surface-muted))" }}>
                  <span className="font-mono line-through" style={{ color: "hsl(var(--avep-foreground-subtle))" }}>{o}</span>
                  <ChevronRight className="h-3 w-3" />
                  <span className="font-mono font-semibold" style={{ color: "hsl(var(--avep-primary))" }}>{n}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Canonical Requirements Repository */}
      <div className="p-4" style={card}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div style={label2xs}>Canonical Requirements Repository</div>
            <div style={{ fontSize: "var(--avep-text-sm)", color: "hsl(var(--avep-foreground-muted))" }}>
              186 governed requirements · fully traceable · ready for architecture handoff
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 px-2 h-8 rounded-md border" style={{ borderColor: "hsl(var(--avep-border))" }}>
              <Search className="h-3.5 w-3.5" style={{ color: "hsl(var(--avep-foreground-subtle))" }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search REQ ID, title, source…"
                className="bg-transparent outline-none"
                style={{ fontSize: "var(--avep-text-sm)", width: 220 }}
                aria-label="Search requirements"
              />
            </div>
            <div className="flex items-center gap-1 px-2 h-8 rounded-md border" style={{ borderColor: "hsl(var(--avep-border))" }}>
              <Filter className="h-3.5 w-3.5" style={{ color: "hsl(var(--avep-foreground-subtle))" }} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent outline-none"
                style={{ fontSize: "var(--avep-text-sm)" }}
                aria-label="Filter by status"
              >
                {["All", "Approved", "Pending", "Needs Review", "Conflict"].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <HeaderBtn icon={CheckCircle2}>Bulk Approve</HeaderBtn>
            <HeaderBtn icon={Download}>Export</HeaderBtn>
          </div>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full" style={{ fontSize: "var(--avep-text-xs)" }}>
            <thead>
              <tr style={{ color: "hsl(var(--avep-foreground-subtle))", textAlign: "left" }}>
                {["ID", "Title", "Type", "Priority", "Source", "Conf", "Status", "Owner", "Verify", "RTL Impact", "AI Score", "Trace"].map((h) => (
                  <th key={h} className="py-1.5 pr-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRepo.map((r) => (
                <tr key={r.id} className="border-t hover:bg-black/[0.02]" style={{ borderColor: "hsl(var(--avep-border))" }}>
                  <td className="py-2 pr-2 font-mono font-semibold">{r.id}</td>
                  <td className="py-2 pr-2">{r.title}</td>
                  <td className="py-2 pr-2"><Badge tone="info">{r.type}</Badge></td>
                  <td className="py-2 pr-2">
                    <Badge tone={r.prio === "Critical" ? "err" : r.prio === "High" ? "warn" : "neutral"}>{r.prio}</Badge>
                  </td>
                  <td className="py-2 pr-2 font-mono" style={{ color: "hsl(var(--avep-foreground-muted))" }}>{r.src}</td>
                  <td className="py-2 pr-2 font-mono">{r.conf}%</td>
                  <td className="py-2 pr-2">
                    <Badge tone={r.status === "Approved" ? "ok" : r.status === "Conflict" ? "err" : r.status === "Pending" ? "info" : "warn"}>
                      {r.status}
                    </Badge>
                  </td>
                  <td className="py-2 pr-2">{r.owner}</td>
                  <td className="py-2 pr-2">{r.ver}</td>
                  <td className="py-2 pr-2">
                    <Badge tone={r.rtl === "High" ? "warn" : r.rtl === "Med" ? "info" : "neutral"}>{r.rtl}</Badge>
                  </td>
                  <td className="py-2 pr-2 font-mono">{r.ai}</td>
                  <td className="py-2 pr-2">
                    <span className="inline-flex items-center gap-0.5" style={{ color: "hsl(var(--avep-primary))" }}>
                      <Network className="h-3 w-3" /> link
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom analytics */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
        {/* Insights */}
        <div className="xl:col-span-4 p-4" style={card}>
          <div className="flex items-center justify-between">
            <div style={label2xs}>AI Insights Panel</div>
            <Badge tone="warn"><AlertTriangle className="h-3 w-3" /> 8 findings</Badge>
          </div>
          <div className="mt-2 flex flex-col gap-1.5">
            {AI_INSIGHTS.map((ins) => (
              <div key={ins.kind} className="p-2 rounded border" style={{ borderColor: "hsl(var(--avep-border))" }}>
                <div className="flex items-center gap-2">
                  <Badge tone={ins.sev}>{ins.sev === "err" ? "Critical" : ins.sev === "warn" ? "Warning" : "Info"}</Badge>
                  <span style={{ fontSize: "var(--avep-text-sm)", fontWeight: 600 }}>{ins.kind}</span>
                </div>
                <div className="mt-1" style={{ fontSize: "var(--avep-text-xs)", color: "hsl(var(--avep-foreground-muted))" }}>
                  {ins.note}
                </div>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <button className="px-2 py-0.5 rounded text-white" style={{ background: "hsl(var(--avep-primary))", fontSize: "var(--avep-text-2xs)", fontWeight: 600 }}>
                    Resolve
                  </button>
                  <button className="px-2 py-0.5 rounded border" style={{ borderColor: "hsl(var(--avep-border))", fontSize: "var(--avep-text-2xs)" }}>
                    Escalate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quality radar */}
        <div className="xl:col-span-4 p-4 flex flex-col items-center" style={card}>
          <div className="w-full flex items-center justify-between">
            <div style={label2xs}>Requirement Quality Gauge</div>
            <Badge tone="ok"><TrendingUp className="h-3 w-3" /> 88 / 100</Badge>
          </div>
          <Radar />
          <div style={{ fontSize: "var(--avep-text-xs)", color: "hsl(var(--avep-foreground-muted))" }}>
            Goal: 90+ on every axis before architecture handoff.
          </div>
        </div>

        {/* Conflict + relationship graph */}
        <div className="xl:col-span-4 flex flex-col gap-3">
          <div className="p-4" style={card}>
            <div className="flex items-center justify-between">
              <div style={label2xs}>Requirement Conflict</div>
              <Badge tone="err">Timing mismatch</Badge>
            </div>
            <div className="mt-2" style={{ fontSize: "var(--avep-text-sm)" }}>
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold">REQ-1045</span>
                <span style={{ color: "hsl(var(--avep-foreground-subtle))" }}>conflicts with</span>
                <span className="font-mono font-semibold">REQ-1082</span>
              </div>
              <div className="mt-1" style={{ fontSize: "var(--avep-text-xs)", color: "hsl(var(--avep-foreground-muted))" }}>
                220ns budget (PERF-BUDGET-2026) vs 180ns budget (CUSTOMER-PAN-02).
              </div>
              <div className="mt-2 p-2 rounded" style={{ background: "hsl(var(--avep-primary-soft))" }}>
                <div style={{ ...label2xs, color: "hsl(var(--avep-primary))" }}>AI Recommendation</div>
                <div style={{ fontSize: "var(--avep-text-xs)" }}>
                  Adopt 180ns and escalate to program review; supersede REQ-1045 with pointer.
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <button className="px-2 py-0.5 rounded text-white" style={{ background: "hsl(142 65% 40%)", fontSize: "var(--avep-text-2xs)", fontWeight: 600 }}>Accept</button>
                <button className="px-2 py-0.5 rounded border" style={{ borderColor: "hsl(var(--avep-border))", fontSize: "var(--avep-text-2xs)" }}>Reject</button>
                <button className="px-2 py-0.5 rounded border" style={{ borderColor: "hsl(var(--avep-border))", fontSize: "var(--avep-text-2xs)" }}>Escalate</button>
              </div>
            </div>
          </div>

          <div className="p-4" style={card}>
            <div style={label2xs}>Requirement Relationship Graph</div>
            <svg viewBox="0 0 320 180" className="mt-2 w-full h-40">
              {[
                { id: "REQ-1042", x: 40,  y: 40 },
                { id: "REQ-1043", x: 160, y: 30 },
                { id: "REQ-1049", x: 280, y: 50 },
                { id: "REQ-1045", x: 80,  y: 130 },
                { id: "REQ-1082", x: 210, y: 140 },
                { id: "REQ-1155", x: 160, y: 90 },
              ].map((n, i, arr) => (
                <g key={n.id}>
                  {i > 0 && (
                    <line
                      x1={arr[i - 1].x} y1={arr[i - 1].y}
                      x2={n.x} y2={n.y}
                      stroke="hsl(var(--avep-border))"
                      strokeDasharray={i === 3 ? "3 3" : undefined}
                    />
                  )}
                </g>
              ))}
              <line x1={80} y1={130} x2={210} y2={140} stroke="hsl(0 72% 55%)" strokeWidth={2}>
                <title>Conflicts with</title>
              </line>
              {[
                { id: "REQ-1042", x: 40,  y: 40 },
                { id: "REQ-1043", x: 160, y: 30 },
                { id: "REQ-1049", x: 280, y: 50 },
                { id: "REQ-1045", x: 80,  y: 130, tone: "err" },
                { id: "REQ-1082", x: 210, y: 140, tone: "err" },
                { id: "REQ-1155", x: 160, y: 90 },
              ].map((n: any) => (
                <g key={n.id}>
                  <circle cx={n.x} cy={n.y} r={16} fill={n.tone === "err" ? "hsl(0 90% 95%)" : "hsl(var(--avep-primary-soft))"}
                          stroke={n.tone === "err" ? "hsl(0 72% 55%)" : "hsl(var(--avep-primary))"} />
                  <text x={n.x} y={n.y + 3} textAnchor="middle" fontSize="8" fontFamily="monospace" fill="hsl(220 20% 25%)">
                    {n.id.replace("REQ-", "")}
                  </text>
                </g>
              ))}
            </svg>
            <div className="flex items-center gap-3" style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-muted))" }}>
              <span className="flex items-center gap-1"><span className="h-2 w-3 rounded-sm" style={{ background: "hsl(var(--avep-primary))" }} /> Derived From</span>
              <span className="flex items-center gap-1"><span className="h-2 w-3 rounded-sm" style={{ background: "hsl(0 72% 55%)" }} /> Conflicts</span>
              <span className="flex items-center gap-1"><span className="h-2 w-3 rounded-sm border border-dashed" /> Depends On</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sankey flow */}
      <div className="p-4" style={card}>
        <div className="flex items-center justify-between">
          <div style={label2xs}>Requirement Flow · Document → Signoff</div>
          <span style={{ fontSize: "var(--avep-text-xs)", color: "hsl(var(--avep-foreground-muted))" }}>
            Every requirement retains provenance across the entire design lifecycle.
          </span>
        </div>
        <div className="mt-2 grid grid-cols-6 gap-1.5">
          {["Document", "Requirement", "Architecture", "RTL", "Verification", "Signoff"].map((s, i) => (
            <div key={s} className="p-2 rounded flex flex-col items-center" style={{ background: `hsl(220 85% ${94 - i * 5}%)` }}>
              <span style={{ fontSize: "var(--avep-text-2xs)", fontWeight: 600, color: "hsl(220 60% 25%)" }}>{s}</span>
              <span className="font-mono" style={{ fontSize: "var(--avep-text-md)", fontWeight: 700, color: "hsl(220 60% 20%)" }}>
                {[18, 186, 42, 96, 149, 132][i]}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 h-2 rounded-full overflow-hidden flex" style={{ background: "hsl(var(--avep-surface-muted))" }}>
          {CLASSIFICATION.map((c) => (
            <div key={c.k} title={`${c.k}: ${c.v}`} style={{ background: c.c, width: `${(c.v / CLASSIFICATION.reduce((s, x) => s + x.v, 0)) * 100}%` }} />
          ))}
        </div>
      </div>

      {/* AI Reasoning */}
      <div className="p-4" style={card}>
        <div className="flex items-center justify-between">
          <div style={label2xs}>AI Reasoning · REQ-1045</div>
          <Badge tone="info"><GitBranch className="h-3 w-3" /> Traceable</Badge>
        </div>
        <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3" style={{ fontSize: "var(--avep-text-xs)" }}>
          <div>
            <div style={label2xs}>Why extracted</div>
            <p style={{ color: "hsl(var(--avep-foreground-muted))", lineHeight: 1.55 }}>
              Detected as an atomic "shall" statement in PERF-BUDGET-2026 §3.1 with quantifiable acceptance criteria and target timing.
            </p>
          </div>
          <div>
            <div style={label2xs}>Why classified as Performance</div>
            <p style={{ color: "hsl(var(--avep-foreground-muted))", lineHeight: 1.55 }}>
              Contains latency budget, physical unit (ns), and clock reference. Downstream matches perf verification harness patterns.
            </p>
          </div>
          <div>
            <div style={label2xs}>Downstream impact</div>
            <p style={{ color: "hsl(var(--avep-foreground-muted))", lineHeight: 1.55 }}>
              RTL: DMA completion pipeline · Verification: perf_regress_p95 harness · Signoff: STA corner review at 1GHz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
