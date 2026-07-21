import { useEffect, useMemo, useRef, useState } from "react";
import {
  FileText, Sparkles, ShieldCheck, Download, Search, ChevronRight, ChevronDown,
  AlertTriangle, CheckCircle2, XCircle, Activity, Layers, BadgeCheck, ArrowRight,
  Wand2, Link2, Clock, Send, GitBranch, BookOpen, TestTube, Target, Radio,
  FileCheck2, ClipboardList, Code2, PlayCircle, X, Users, MessageSquare,
} from "lucide-react";

/* ------------------------------ shared tokens ----------------------------- */

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

type Tone = "ok" | "warn" | "err" | "info" | "neutral" | "accent" | "ai";
const toneMap: Record<Tone, { bg: string; fg: string; dot: string }> = {
  ok:      { bg: "hsl(142 70% 94%)", fg: "hsl(142 65% 28%)", dot: "hsl(142 65% 42%)" },
  warn:    { bg: "hsl(38 100% 92%)", fg: "hsl(28 85% 34%)",  dot: "hsl(35 92% 52%)" },
  err:     { bg: "hsl(0 90% 95%)",   fg: "hsl(0 72% 40%)",   dot: "hsl(0 78% 55%)" },
  info:    { bg: "hsl(var(--avep-primary-soft))", fg: "hsl(var(--avep-primary))", dot: "hsl(var(--avep-primary))" },
  neutral: { bg: "hsl(var(--avep-surface-muted))", fg: "hsl(var(--avep-foreground-muted))", dot: "hsl(var(--avep-foreground-subtle))" },
  accent:  { bg: "hsl(var(--avep-accent-soft))", fg: "hsl(var(--avep-accent))", dot: "hsl(var(--avep-accent))" },
  ai:      { bg: "hsl(var(--avep-ai-soft))", fg: "hsl(var(--avep-ai))", dot: "hsl(var(--avep-ai))" },
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
  { children: React.ReactNode; variant?: "primary" | "ghost" | "soft" | "ai"; onClick?: () => void; icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>; title?: string }) {
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: "hsl(var(--avep-primary))", color: "hsl(var(--avep-primary-foreground))", border: "1px solid hsl(var(--avep-primary))" },
    soft:    { background: "hsl(var(--avep-primary-soft))", color: "hsl(var(--avep-primary))", border: "1px solid hsl(var(--avep-primary-soft))" },
    ghost:   { background: "hsl(var(--avep-surface))", color: "hsl(var(--avep-foreground))", border: "1px solid hsl(var(--avep-border))" },
    ai:      { background: "hsl(var(--avep-ai))", color: "hsl(var(--avep-ai-foreground))", border: "1px solid hsl(var(--avep-ai))" },
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

function Section({ title, icon: Icon, subtitle, right, children }:
  { title: string; icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>; subtitle?: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={card}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}>
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4" style={{ color: "hsl(var(--avep-primary))" }} />}
          <div>
            <div style={{ fontSize: "var(--avep-text-sm)", fontWeight: 600 }}>{title}</div>
            {subtitle && <div style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>{subtitle}</div>}
          </div>
        </div>
        {right}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

/* --------------------------------- data ---------------------------------- */

type DocNode = { name: string; status?: "done" | "review" | "draft" | "gap"; children?: DocNode[]; id?: string };

const DOCUMENT_TREE: DocNode[] = [
  { name: "Engineering Specification", children: [
    { name: "Architecture Overview",   id: "spec-arch",   status: "done"   },
    { name: "Functional Description",  id: "spec-func",   status: "done"   },
    { name: "Interfaces",              id: "spec-if",     status: "done"   },
    { name: "Register Model",          id: "spec-reg",    status: "done"   },
    { name: "Clock Domains",           id: "spec-clk",    status: "review" },
    { name: "Reset Strategy",          id: "spec-rst",    status: "done"   },
    { name: "Security Model",          id: "spec-sec",    status: "done"   },
    { name: "Error Handling",          id: "spec-err",    status: "gap"    },
    { name: "Performance",             id: "spec-perf",   status: "review" },
  ] },
  { name: "Technical Reference Manual", children: [
    { name: "Register Programming",    id: "trm-reg",     status: "done"   },
    { name: "Initialization",          id: "trm-init",    status: "done"   },
    { name: "Interrupts",              id: "trm-irq",     status: "review" },
    { name: "DMA Operation",           id: "trm-dma",     status: "done"   },
    { name: "Configuration",           id: "trm-cfg",     status: "draft"  },
  ] },
  { name: "Verification Plan", children: [
    { name: "Verification Strategy",   id: "vp-strat",    status: "done"   },
    { name: "Coverage Goals",          id: "vp-cov",      status: "done"   },
    { name: "Assertions",              id: "vp-asrt",     status: "review" },
    { name: "Formal",                  id: "vp-formal",   status: "done"   },
    { name: "Regression",              id: "vp-regr",     status: "done"   },
    { name: "Acceptance Criteria",     id: "vp-acc",      status: "review" },
  ] },
  { name: "Test Plan", children: [
    { name: "Directed Tests",          id: "tp-dir",      status: "done"   },
    { name: "Random Tests",            id: "tp-rand",     status: "done"   },
    { name: "Corner Cases",            id: "tp-corner",   status: "review" },
    { name: "Negative Tests",          id: "tp-neg",      status: "draft"  },
    { name: "Performance Tests",       id: "tp-perf",     status: "done"   },
    { name: "Compliance Tests",        id: "tp-comp",     status: "review" },
  ] },
];

const AI_FEED = [
  { t: "Generating Interface Specification",     req: "REQ-1105", ok: true  },
  { t: "Building Register Chapter",              req: "REQ-1300", ok: true  },
  { t: "Creating Acceptance Criteria",           req: "REQ-1021", ok: true  },
  { t: "Linking Verification Objectives",        req: "REQ-1220", ok: true  },
  { t: "Adding Source Citations",                req: "—",        ok: true  },
  { t: "Generating Formal Candidates",           req: "REQ-1150", ok: true  },
  { t: "Completeness Validation Passed",         req: "—",        ok: true  },
];

const FINDINGS = [
  { kind: "Missing Acceptance Criteria",   tone: "warn" as const, title: "REQ-1710 has no measurable pass criterion",             detail: "Suggest: 'IRQ_STATUS updates within 4 PCLK cycles of vector assertion, verified by directed test.'" },
  { kind: "Coverage Gap",                  tone: "warn" as const, title: "Descriptor wrap boundary lacks functional coverage",     detail: "Add cross-cover of RING_HEAD wrap × outstanding beats ∈ {0,1,127,128}." },
  { kind: "Unmapped Requirement",          tone: "err"  as const, title: "REQ-1822 not linked to any specification section",       detail: "Route to Error Handling chapter — matches error-escalation semantic cluster." },
  { kind: "Incomplete Register Description", tone: "warn" as const, title: "SEC_CFG.MODE bit-field description missing",           detail: "AI drafted 4-bit encoding table; awaiting Security Architect review." },
  { kind: "Missing Error Case",            tone: "err"  as const, title: "ECC uncorrectable path not covered in T Plan",           detail: "Add negative test tp-neg-ecc-uc, mapped to REQ-1520 acceptance criterion." },
  { kind: "Formal Candidate Detected",     tone: "ai"   as const, title: "DMA Scheduler arbitration is a fairness candidate",      detail: "State-space 2^12 · property: no requester starves > 64 cycles. Confidence 96%." },
  { kind: "Duplicate Section",             tone: "info" as const, title: "'Clock Domains' appears in Spec and TRM",                detail: "Consolidate: keep authoritative in Spec, cross-reference from TRM." },
];

const VERIF_MATRIX = [
  { req: "REQ-1021", method: "Sim + Formal",   sim: true,  formal: true,  asrt: true,  dir: true,  rand: true,  cov: "100%", owner: "P. Nair",   status: "Complete" as const },
  { req: "REQ-1044", method: "Sim",            sim: true,  formal: false, asrt: true,  dir: true,  rand: true,  cov: "94%",  owner: "M. Rossi",  status: "In Progress" as const },
  { req: "REQ-1105", method: "Sim + Formal",   sim: true,  formal: true,  asrt: true,  dir: true,  rand: false, cov: "97%",  owner: "K. Zhou",   status: "Complete" as const },
  { req: "REQ-1150", method: "Formal",         sim: false, formal: true,  asrt: true,  dir: false, rand: false, cov: "100%", owner: "D. Okafor", status: "Complete" as const },
  { req: "REQ-1220", method: "Sim + Review",   sim: true,  formal: false, asrt: true,  dir: true,  rand: false, cov: "89%",  owner: "P. Nair",   status: "Review" as const },
  { req: "REQ-1300", method: "Sim",            sim: true,  formal: false, asrt: true,  dir: true,  rand: true,  cov: "92%",  owner: "M. Rossi",  status: "In Progress" as const },
  { req: "REQ-1520", method: "Sim + Formal",   sim: true,  formal: true,  asrt: true,  dir: true,  rand: false, cov: "95%",  owner: "D. Okafor", status: "Complete" as const },
  { req: "REQ-1710", method: "Sim",            sim: true,  formal: false, asrt: false, dir: true,  rand: false, cov: "62%",  owner: "H. Tanaka", status: "Gap" as const },
];

const TEST_CATEGORIES = [
  { name: "Smoke",       count:  12, runtime: "3m",   reqs:  6, cov: 100, icon: PlayCircle },
  { name: "Functional",  count:  96, runtime: "42m",  reqs: 42, cov:  98, icon: TestTube },
  { name: "Boundary",    count:  38, runtime: "18m",  reqs: 24, cov:  94, icon: Target },
  { name: "Performance", count:  74, runtime: "3h 10m", reqs: 18, cov:  91, icon: Activity },
  { name: "Stress",      count:  22, runtime: "6h 40m", reqs: 14, cov:  88, icon: Radio },
  { name: "Security",    count:  42, runtime: "1h 20m", reqs: 21, cov:  96, icon: ShieldCheck },
  { name: "Negative",    count:  56, runtime: "38m",  reqs: 32, cov:  84, icon: XCircle },
  { name: "Regression",  count: 148, runtime: "12h",  reqs: 96, cov:  99, icon: GitBranch },
  { name: "Random",      count: 148, runtime: "9h 30m", reqs: 82, cov:  93, icon: Sparkles },
  { name: "Formal",      count: 128, runtime: "5h 20m", reqs: 46, cov: 100, icon: ShieldCheck },
];

const FORMAL_CANDIDATES = [
  { name: "DMA Arbitration Fairness",    reason: "Round-robin FSM · 12 state bits",     confidence: 96, props: ["G(req_i -> F<64 grant_i)","!starve"] },
  { name: "Deadlock Freedom (AXI)",      reason: "Handshake network complexity",         confidence: 98, props: ["G(F(!axi_stall))","liveness"] },
  { name: "Descriptor Seq Monotonic",    reason: "Wrap arithmetic, 2^32 modulo",         confidence: 94, props: ["G(seq_next == seq + 1 || seq_wrap)"] },
  { name: "IRQ Coalescing No-Underflow", reason: "Counter with W1C clear",               confidence: 99, props: ["G(cnt >= 0)","!underflow"] },
  { name: "Register Access Atomicity",   reason: "APB RMW + side-effects",               confidence: 91, props: ["atomic(APB.write)","!torn_read"] },
];

const ACCEPTANCE = [
  { req: "REQ-1021", stmt: "Descriptor ring wrap preserves ordering across 10⁶ transactions",     method: "Sim + Formal", pass: "0 order violations, 100% cov", evidence: "test-ring-wrap-01, formal-seq-01", approve: "Approved" as const },
  { req: "REQ-1044", stmt: "DMA Scheduler grants every requester within 64 cycles under load",     method: "Formal",       pass: "SVA passes, no counterexample",  evidence: "formal-arb-01",           approve: "Pending" as const },
  { req: "REQ-1150", stmt: "IRQ coalescing counter never underflows",                              method: "Formal",       pass: "Property proven",                evidence: "formal-irq-01",           approve: "Approved" as const },
  { req: "REQ-1220", stmt: "SEC_CFG changes require Machine-mode privilege",                       method: "Sim",          pass: "Directed neg-test passes",        evidence: "test-sec-01",             approve: "Approved" as const },
  { req: "REQ-1520", stmt: "ECC SECDED detects 2-bit, corrects 1-bit within 1 cycle",              method: "Sim + Formal", pass: "100% fault-injection cov",        evidence: "test-ecc-01, formal-ecc-01", approve: "Approved" as const },
  { req: "REQ-1710", stmt: "IRQ_STATUS updates within 4 PCLK of vector assertion",                 method: "Sim",          pass: "Directed test measures ≤ 4",      evidence: "—",                       approve: "Draft" as const },
];

const APPROVERS = [
  { role: "Design Authority",   who: "Linh Tran",    status: "Approved" as const, ts: "3h ago" },
  { role: "Verification Lead",  who: "Priya Nair",   status: "Pending"  as const, ts: "—" },
  { role: "Firmware Lead",      who: "Marco Rossi",  status: "Approved" as const, ts: "8h ago" },
  { role: "Security Architect", who: "Diane Okafor", status: "Approved" as const, ts: "1d ago" },
];

/* ================================ PAGE =================================== */

export default function EngineeringSpecVerificationWorkspace() {
  const [activeDoc, setActiveDoc] = useState<string>("spec-if");
  const [tab, setTab] = useState<"spec"|"trm"|"vp"|"tp"|"cov">("spec");
  const [treeQuery, setTreeQuery] = useState("");
  const [reasoning, setReasoning] = useState<null | { section: string }>(null);
  const [genState, setGenState] = useState<"idle"|"running"|"done">("idle");

  const kpis = useAnimatedKpis({ sections: 42, verif: 612, cov: 486, ready: 97.8 });

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Badge tone="info"><FileText className="h-3 w-3" /> AVEP.050</Badge>
            <Badge tone="ai"><Sparkles className="h-3 w-3" /> AI Authoring Studio</Badge>
            <Badge tone="accent"><GitBranch className="h-3 w-3" /> feat/ddmac-v2.4</Badge>
          </div>
          <h1 style={{ fontSize: "var(--avep-text-3xl)", fontWeight: 700, letterSpacing: "var(--avep-tracking-tight)", marginTop: 6 }}>
            Engineering Specification &amp; Verification Workspace
          </h1>
          <p style={{ fontSize: "var(--avep-text-sm)", color: "hsl(var(--avep-foreground-muted))", maxWidth: 940, marginTop: 4 }}>
            Create synchronized engineering documentation and verification strategies directly from approved architecture and requirements.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Btn icon={Wand2} variant="ai" onClick={() => { setGenState("running"); setTimeout(() => setGenState("done"), 1600); }}>
            {genState === "running" ? "Generating…" : "Generate Specification"}
          </Btn>
          <Btn icon={ClipboardList}>Generate Verification Plan</Btn>
          <Btn icon={TestTube}>Generate Test Plan</Btn>
          <Btn icon={Target}>Generate Coverage Strategy</Btn>
          <Btn icon={BookOpen}>Generate TRM</Btn>
          <Btn icon={Send} variant="primary">Submit for Approval</Btn>
        </div>
      </div>

      <WorkflowStrip current="Specification & Verification" />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Specification Sections"   value={kpis.sections}  suffix=""  icon={FileText}       tone="info" />
        <Kpi label="Verification Objectives"  value={kpis.verif}     suffix=""  icon={ClipboardList}  tone="accent" />
        <Kpi label="Coverage Objectives"      value={kpis.cov}       suffix=""  icon={Target}         tone="ai" />
        <Kpi label="Authoring Readiness"      value={kpis.ready}     suffix="%" icon={Activity}       tone="ok" precision={1} />
      </div>

      {/* 3-col main */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "minmax(240px, 300px) 1fr minmax(280px, 340px)" }}>
        {/* LEFT */}
        <div className="flex flex-col gap-3">
          <Section title="Engineering Document Navigator" icon={BookOpen} subtitle="42 sections · 18 TRM chapters">
            <div className="relative mb-2">
              <Search className="h-3.5 w-3.5 absolute left-2 top-1/2 -translate-y-1/2" style={{ color: "hsl(var(--avep-foreground-subtle))" }} />
              <input value={treeQuery} onChange={(e) => setTreeQuery(e.target.value)} placeholder="Search documents…"
                className="w-full pl-7 pr-2 h-8 rounded-md outline-none"
                style={{ background: "hsl(var(--avep-surface-muted))", border: "1px solid hsl(var(--avep-border))", fontSize: "var(--avep-text-sm)" }} />
            </div>
            <DocTree nodes={DOCUMENT_TREE} query={treeQuery} active={activeDoc} onPick={(id, top) => { setActiveDoc(id); setTab(top); }} />
          </Section>

          <Section title="Source Traceability" icon={Link2} subtitle="Provenance for the current section">
            <SourceTraceability />
          </Section>

          <Section title="Live AI Authoring Feed" icon={Sparkles} subtitle="Streaming activity">
            <LiveFeed />
          </Section>
        </div>

        {/* CENTER */}
        <div className="flex flex-col gap-3">
          <Section
            title="AI Authoring Workspace"
            icon={Wand2}
            subtitle="Hover any paragraph to reveal originating requirements and architecture"
            right={<Tabs value={tab} onChange={setTab} />}
          >
            <DocumentPreview tab={tab} activeDoc={activeDoc} onExplain={(s) => setReasoning({ section: s })} />
          </Section>

          <Section title="Requirement-to-Document Traceability" icon={ArrowRight}
            subtitle="Requirement → Section → Verification Objective → Test → Coverage → Acceptance">
            <TraceabilitySankey />
          </Section>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            <Section title="Coverage Strategy" icon={Target} subtitle="486 objectives · live rollup">
              <CoverageDashboard />
            </Section>
            <Section title="Formal Verification Candidates" icon={ShieldCheck} subtitle="128 candidates ranked by confidence">
              <FormalCandidates onExplain={(name) => setReasoning({ section: name })} />
            </Section>
          </div>

          <Section title="Verification Strategy Matrix" icon={ClipboardList} subtitle="Requirement × verification method">
            <VerificationMatrix />
          </Section>

          <Section title="Test Plan Generator" icon={TestTube} subtitle="10 categories · 764 tests">
            <TestPlan />
          </Section>

          <Section title="Acceptance Criteria Builder" icon={FileCheck2} subtitle="Editable · AI suggestions inline">
            <AcceptanceTable />
          </Section>

          <Section title="Technical Reference Manual — Preview" icon={BookOpen} subtitle="ToC · rendered chapter">
            <TrmSplit />
          </Section>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-3">
          <Section title="Documentation Health" icon={Activity} subtitle="Overall 97.8%">
            <HealthGauge value={97.8} />
            <div className="mt-3 flex flex-col gap-1.5">
              {[
                { l: "Completeness",         v: 98, tone: "ok"   as const },
                { l: "Traceability",         v: 99, tone: "ok"   as const },
                { l: "Coverage",             v: 96, tone: "ok"   as const },
                { l: "Consistency",          v: 97, tone: "ok"   as const },
                { l: "Readability",          v: 94, tone: "warn" as const },
                { l: "Verification Mapping", v: 98, tone: "ok"   as const },
                { l: "Approval Readiness",   v: 92, tone: "warn" as const },
              ].map((r) => (
                <div key={r.l} title={`${r.l} — composite AI + engineer signal`}>
                  <div className="flex justify-between" style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-muted))" }}>
                    <span>{r.l}</span><span>{r.v}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--avep-surface-muted))" }}>
                    <div className="h-full" style={{ width: `${r.v}%`, background: `hsl(${toneMap[r.tone].dot})`, transition: "width 800ms ease" }} />
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="AI Findings" icon={Sparkles} subtitle="7 findings · 2 critical">
            <ul className="flex flex-col gap-2">
              {FINDINGS.map((f, i) => (
                <li key={i} className="p-2.5 rounded-md" style={{ background: toneMap[f.tone].bg, border: `1px solid hsl(${toneMap[f.tone].dot} / 0.25)` }} title={f.detail}>
                  <div className="flex items-center gap-1.5">
                    {f.tone === "err" ? <XCircle className="h-3.5 w-3.5" style={{ color: toneMap.err.fg }} /> :
                     f.tone === "ai"  ? <Sparkles className="h-3.5 w-3.5" style={{ color: toneMap.ai.fg }} /> :
                                        <AlertTriangle className="h-3.5 w-3.5" style={{ color: toneMap[f.tone].fg }} />}
                    <span style={{ fontSize: "var(--avep-text-2xs)", fontWeight: 700, color: toneMap[f.tone].fg, letterSpacing: "var(--avep-tracking-wide)", textTransform: "uppercase" }}>{f.kind}</span>
                  </div>
                  <div style={{ fontSize: "var(--avep-text-sm)", fontWeight: 500, marginTop: 4 }}>{f.title}</div>
                  <div style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-muted))", marginTop: 2 }}>{f.detail}</div>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Collaboration" icon={Users} subtitle="Approvals & activity">
            <ul className="flex flex-col gap-1.5">
              {APPROVERS.map((a) => (
                <li key={a.role} className="flex items-center justify-between text-[13px]">
                  <div className="min-w-0">
                    <div className="truncate" style={{ fontWeight: 500 }}>{a.role}</div>
                    <div style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-muted))" }}>{a.who} · {a.ts}</div>
                  </div>
                  <Badge tone={a.status === "Approved" ? "ok" : "warn"}>{a.status === "Approved" ? <BadgeCheck className="h-3 w-3" /> : <Clock className="h-3 w-3" />}{a.status}</Badge>
                </li>
              ))}
            </ul>
            <div className="mt-3 pt-3 border-t" style={{ borderColor: "hsl(var(--avep-border))" }}>
              <div style={label2xs} className="mb-1.5">Open Comments</div>
              <div className="flex flex-col gap-1.5" style={{ fontSize: "var(--avep-text-xs)" }}>
                <div className="p-2 rounded" style={{ background: "hsl(var(--avep-surface-muted))" }}>
                  <div className="flex items-center gap-1.5"><MessageSquare className="h-3 w-3" /><b>P. Nair</b> on §Coverage Goals</div>
                  <div style={{ color: "hsl(var(--avep-foreground-muted))", marginTop: 2 }}>Please split ECC coverage into detect vs correct sub-goals.</div>
                </div>
                <div className="p-2 rounded" style={{ background: "hsl(var(--avep-surface-muted))" }}>
                  <div className="flex items-center gap-1.5"><MessageSquare className="h-3 w-3" /><b>D. Okafor</b> on §Security Model</div>
                  <div style={{ color: "hsl(var(--avep-foreground-muted))", marginTop: 2 }}>Cite REQ-1220 explicitly in privilege paragraph.</div>
                </div>
              </div>
            </div>
          </Section>
        </div>
      </div>

      {reasoning && <ReasoningDrawer section={reasoning.section} onClose={() => setReasoning(null)} />}
    </div>
  );
}

/* ============================ Reusables ================================== */

function useAnimatedKpis(target: { sections: number; verif: number; cov: number; ready: number }) {
  const [v, setV] = useState({ sections: 0, verif: 0, cov: 0, ready: 0 });
  useEffect(() => {
    const start = performance.now(); const dur = 900;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur); const e = 1 - Math.pow(1 - p, 3);
      setV({
        sections: Math.round(target.sections * e),
        verif: Math.round(target.verif * e),
        cov: Math.round(target.cov * e),
        ready: +(target.ready * e).toFixed(1),
      });
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target.sections, target.verif, target.cov, target.ready]);
  return v;
}

function Kpi({ label, value, suffix, icon: Icon, tone, precision = 0 }:
  { label: string; value: number; suffix: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; tone: Tone; precision?: number }) {
  const s = toneMap[tone];
  return (
    <div className="p-4" style={card}>
      <div className="flex items-center justify-between">
        <span style={label2xs}>{label}</span>
        <span className="h-7 w-7 grid place-items-center rounded-md" style={{ background: s.bg, color: s.fg }}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span style={{ fontSize: "var(--avep-text-3xl)", fontWeight: 700, letterSpacing: "var(--avep-tracking-tight)" }}>
          {precision ? value.toFixed(precision) : value}
        </span>
        {suffix && <span style={{ fontSize: "var(--avep-text-sm)", color: "hsl(var(--avep-foreground-muted))" }}>{suffix}</span>}
      </div>
    </div>
  );
}

function WorkflowStrip({ current }: { current: string }) {
  const steps = [
    "Engineering Context", "Requirements Intake", "Requirements Quality",
    "Engineering Traceability", "Logical Architecture", "Specification & Verification", "RTL Generation",
  ];
  return (
    <div className="p-3" style={card}>
      <div className="flex items-center flex-wrap gap-1">
        {steps.map((s, i) => {
          const active = s === current;
          const done = steps.indexOf(current) > i;
          return (
            <div key={s} className="flex items-center gap-1">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md"
                style={{
                  background: active ? "hsl(var(--avep-primary))" : done ? "hsl(var(--avep-primary-soft))" : "hsl(var(--avep-surface-muted))",
                  color: active ? "hsl(var(--avep-primary-foreground))" : done ? "hsl(var(--avep-primary))" : "hsl(var(--avep-foreground-muted))",
                  fontSize: "var(--avep-text-xs)", fontWeight: active ? 700 : 500,
                }}>
                <span className="h-4 w-4 grid place-items-center rounded-full"
                  style={{ background: active ? "hsl(var(--avep-primary-foreground) / 0.2)" : "transparent", fontSize: 10 }}>{i + 1}</span>
                {s}
              </div>
              {i < steps.length - 1 && <ChevronRight className="h-3.5 w-3.5" style={{ color: "hsl(var(--avep-foreground-subtle))" }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* --------------------------- Document Navigator --------------------------- */

function DocTree({ nodes, query, active, onPick }:
  { nodes: DocNode[]; query: string; active: string; onPick: (id: string, top: "spec"|"trm"|"vp"|"tp"|"cov") => void }) {
  const topMap: Record<string, "spec"|"trm"|"vp"|"tp"|"cov"> = {
    "Engineering Specification": "spec",
    "Technical Reference Manual": "trm",
    "Verification Plan": "vp",
    "Test Plan": "tp",
  };
  return (
    <ul className="flex flex-col gap-1">
      {nodes.map((n) => {
        const top = topMap[n.name] ?? "spec";
        return <DocBranch key={n.name} node={n} query={query} active={active} onPick={(id) => onPick(id, top)} />;
      })}
    </ul>
  );
}

function DocBranch({ node, query, active, onPick, depth = 0 }:
  { node: DocNode; query: string; active: string; onPick: (id: string) => void; depth?: number }) {
  const [open, setOpen] = useState(true);
  const has = !!node.children?.length;
  const matches = (n: DocNode): boolean =>
    !query || n.name.toLowerCase().includes(query.toLowerCase()) || (n.children?.some(matches) ?? false);
  if (!matches(node)) return null;

  const statusTone: Record<string, Tone> = { done: "ok", review: "warn", draft: "info", gap: "err" };
  return (
    <li>
      <div
        className="flex items-center gap-1 py-1 pr-1 rounded cursor-pointer"
        style={{
          paddingLeft: 4 + depth * 12,
          background: active === node.id ? "hsl(var(--avep-primary-soft))" : "transparent",
          color: active === node.id ? "hsl(var(--avep-primary))" : "hsl(var(--avep-foreground))",
          fontSize: "var(--avep-text-sm)",
          fontWeight: active === node.id ? 600 : 500,
        }}
        onClick={() => { if (node.id) onPick(node.id); else setOpen((o) => !o); }}
      >
        {has ? (open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />) : <span className="h-3.5 w-3.5" />}
        {has ? <BookOpen className="h-3.5 w-3.5" style={{ color: "hsl(var(--avep-foreground-subtle))" }} /> : <FileText className="h-3.5 w-3.5" style={{ color: "hsl(var(--avep-accent))" }} />}
        <span className="flex-1 truncate">{node.name}</span>
        {node.status && <span className="h-1.5 w-1.5 rounded-full" style={{ background: toneMap[statusTone[node.status]].dot }} title={node.status} />}
      </div>
      {has && open && (
        <ul>
          {node.children!.map((c) => (<DocBranch key={c.name} node={c} query={query} active={active} onPick={onPick} depth={depth + 1} />))}
        </ul>
      )}
    </li>
  );
}

function SourceTraceability() {
  const rows = [
    { l: "Requirements", n: "REQ-1021, REQ-1044, REQ-1105", conf: 98, complete: 96 },
    { l: "Architecture", n: "Descriptor Engine, AXI Master", conf: 99, complete: 100 },
    { l: "Registers",    n: "RING_BASE, RING_HEAD, DMA_CTRL", conf: 97, complete: 100 },
    { l: "Interfaces",   n: "AXI-M0, AXI-M1, APB-CFG",       conf: 96, complete: 94 },
    { l: "Evidence",     n: "test-ring-wrap-01, formal-seq-01", conf: 94, complete: 92 },
  ];
  return (
    <ul className="flex flex-col gap-1.5">
      {rows.map((r) => (
        <li key={r.l} className="p-2 rounded" style={{ background: "hsl(var(--avep-surface-muted))" }} title={`${r.l} sources for the active section`}>
          <div className="flex items-center justify-between">
            <span style={{ fontSize: "var(--avep-text-2xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "var(--avep-tracking-wide)", color: "hsl(var(--avep-foreground-subtle))" }}>{r.l}</span>
            <Badge tone={r.complete >= 95 ? "ok" : "warn"}>{r.complete}% complete</Badge>
          </div>
          <div style={{ fontSize: "var(--avep-text-xs)", fontFamily: "var(--avep-font-mono)", color: "hsl(var(--avep-foreground))", marginTop: 2 }}>{r.n}</div>
          <div className="mt-1 h-1 rounded-full" style={{ background: "hsl(var(--avep-surface))" }}>
            <div className="h-full rounded-full" style={{ width: `${r.conf}%`, background: "hsl(var(--avep-primary))" }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function LiveFeed() {
  const [items, setItems] = useState(AI_FEED.slice(0, 3));
  useEffect(() => {
    let i = 3;
    const id = setInterval(() => {
      setItems((prev) => {
        const next = AI_FEED[i % AI_FEED.length];
        i++;
        return [...prev.slice(-6), next];
      });
    }, 1400);
    return () => clearInterval(id);
  }, []);
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((it, i) => (
        <li key={i} className="flex items-center gap-2 px-2 py-1.5 rounded" style={{ background: "hsl(var(--avep-ai-soft))", fontSize: "var(--avep-text-xs)" }}>
          <Sparkles className="h-3.5 w-3.5" style={{ color: "hsl(var(--avep-ai))" }} />
          <span className="flex-1 truncate">{it.t}</span>
          <span style={{ fontFamily: "var(--avep-font-mono)", color: "hsl(var(--avep-foreground-muted))" }}>{it.req}</span>
          <CheckCircle2 className="h-3.5 w-3.5" style={{ color: toneMap.ok.dot }} />
        </li>
      ))}
    </ul>
  );
}

/* --------------------------- Center: Tabs & Doc --------------------------- */

function Tabs({ value, onChange }: { value: "spec"|"trm"|"vp"|"tp"|"cov"; onChange: (v: any) => void }) {
  const tabs: { id: any; label: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }[] = [
    { id: "spec", label: "Specification",     icon: FileText },
    { id: "trm",  label: "TRM",               icon: BookOpen },
    { id: "vp",   label: "Verification Plan", icon: ClipboardList },
    { id: "tp",   label: "Test Plan",         icon: TestTube },
    { id: "cov",  label: "Coverage Strategy", icon: Target },
  ];
  return (
    <div className="flex items-center gap-1 p-1 rounded-md" style={{ background: "hsl(var(--avep-surface-muted))" }}>
      {tabs.map((t) => {
        const active = value === t.id;
        return (
          <button key={t.id} onClick={() => onChange(t.id)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded"
            style={{
              background: active ? "hsl(var(--avep-surface))" : "transparent",
              color: active ? "hsl(var(--avep-primary))" : "hsl(var(--avep-foreground-muted))",
              fontSize: "var(--avep-text-xs)", fontWeight: 600,
              boxShadow: active ? "0 1px 2px rgba(15,23,42,0.06)" : "none",
            }}>
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function DocumentPreview({ tab, activeDoc, onExplain }:
  { tab: "spec"|"trm"|"vp"|"tp"|"cov"; activeDoc: string; onExplain: (s: string) => void }) {
  const paragraphs = usePreview(tab, activeDoc);
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: "1fr" }}>
      <div className="flex items-center gap-2">
        <Badge tone="info">§ {sectionTitle(activeDoc)}</Badge>
        <Badge tone="ai"><Sparkles className="h-3 w-3" /> AI Draft</Badge>
        <Badge tone="ok">v0.7</Badge>
        <div className="ml-auto flex items-center gap-1.5">
          <Btn icon={MessageSquare} title="Comment">Comment</Btn>
          <Btn icon={Sparkles} variant="ai" onClick={() => onExplain(sectionTitle(activeDoc))}>Explain</Btn>
        </div>
      </div>
      <div className="p-5 rounded-md" style={{ background: "hsl(var(--avep-surface))", border: "1px solid hsl(var(--avep-border))" }}>
        <h2 style={{ fontSize: "var(--avep-text-xl)", fontWeight: 700, letterSpacing: "var(--avep-tracking-tight)" }}>{sectionTitle(activeDoc)}</h2>
        <p style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))", marginTop: 2 }}>
          Generated from approved requirements &amp; architecture · every paragraph is provenance-linked.
        </p>
        <div className="mt-4 flex flex-col gap-3">
          {paragraphs.map((p, i) => (
            <ProvenanceParagraph key={i} text={p.text} sources={p.sources} />
          ))}
          <CodeBlock title="Example — register access" code={REG_EXAMPLE_CODE} />
          <RegisterTableInline />
        </div>
      </div>
    </div>
  );
}

function sectionTitle(id: string) {
  const map: Record<string, string> = {
    "spec-arch": "Architecture Overview", "spec-func": "Functional Description",
    "spec-if":   "Interfaces",            "spec-reg":  "Register Model",
    "spec-clk":  "Clock Domains",         "spec-rst":  "Reset Strategy",
    "spec-sec":  "Security Model",        "spec-err":  "Error Handling", "spec-perf": "Performance",
    "trm-reg":   "Register Programming",  "trm-init":  "Initialization", "trm-irq": "Interrupts",
    "trm-dma":   "DMA Operation",         "trm-cfg":   "Configuration",
    "vp-strat":  "Verification Strategy", "vp-cov":    "Coverage Goals","vp-asrt":"Assertions",
    "vp-formal": "Formal",                "vp-regr":   "Regression",    "vp-acc": "Acceptance Criteria",
    "tp-dir":    "Directed Tests",        "tp-rand":   "Random Tests",  "tp-corner":"Corner Cases",
    "tp-neg":    "Negative Tests",        "tp-perf":   "Performance Tests","tp-comp":"Compliance Tests",
  };
  return map[id] ?? "Section";
}

function usePreview(_tab: string, _activeDoc: string) {
  return [
    { text: "The DDMAC IP exposes an AXI4 master interface (AXI-M0) at 512-bit datapath and 800 MHz, servicing outbound descriptor and payload traffic to system memory.", sources: ["REQ-1021","REQ-1105","AXI-M0","AXI Master"] },
    { text: "Descriptor fetches are ordered per ring; sequence tags are monotonic modulo 2³² and preserved across ring wrap. Outstanding beats never exceed the configured limit.", sources: ["REQ-1021","Descriptor Engine","RING_BASE"] },
    { text: "Interrupt coalescing operates on PCLK with a Machine-mode-writable IRQ_MASK. The status vector is W1C at Supervisor mode; underflow is formally prohibited.", sources: ["REQ-1150","Interrupt Controller","IRQ_MASK","IRQ_STATUS"] },
    { text: "Security posture is enforced by the Security Engine via SEC_CFG.MODE; privilege downgrade requires Machine-mode intervention. Non-secure agents cannot observe secure descriptor payloads.", sources: ["REQ-1220","Security Engine","SEC_CFG"] },
  ];
}

const REG_EXAMPLE_CODE = `// Initialize DMA ring — TRM §3.2
write32(DMA_BASE + 0x0100, ring_phys_addr);   // RING_BASE
write32(DMA_BASE + 0x0104, 0);                // RING_HEAD
write32(DMA_BASE + 0x0200, 0x20);             // CMPL_THRESH = 32
write32(DMA_BASE + 0x0000, 0x1);              // DMA_CTRL.EN = 1`;

function ProvenanceParagraph({ text, sources }: { text: string; sources: string[] }) {
  const [hover, setHover] = useState(false);
  return (
    <div className="relative"
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        padding: "8px 10px", borderRadius: 6,
        background: hover ? "hsl(var(--avep-primary-soft) / 0.55)" : "transparent",
        borderLeft: `3px solid hsl(var(--avep-primary) / ${hover ? 1 : 0.35})`,
        transition: "background 200ms",
      }}>
      <p style={{ fontSize: "var(--avep-text-sm)", lineHeight: "var(--avep-leading-relaxed)", color: "hsl(var(--avep-foreground))" }}>{text}</p>
      {hover && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          <span style={{ ...label2xs, textTransform: "none", letterSpacing: 0 }}>Sources:</span>
          {sources.map((s) => (
            <span key={s} className="px-1.5 py-0.5 rounded" style={{ background: "hsl(var(--avep-surface))", border: "1px solid hsl(var(--avep-border))", fontSize: "var(--avep-text-2xs)", fontFamily: "var(--avep-font-mono)" }}>{s}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function CodeBlock({ title, code }: { title: string; code: string }) {
  return (
    <div className="rounded-md overflow-hidden" style={{ border: "1px solid hsl(var(--avep-border))" }}>
      <div className="flex items-center justify-between px-3 py-1.5" style={{ background: "hsl(var(--avep-surface-muted))" }}>
        <div className="flex items-center gap-1.5" style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-muted))" }}>
          <Code2 className="h-3.5 w-3.5" /> {title}
        </div>
        <Badge tone="ai">AI Example</Badge>
      </div>
      <pre style={{ margin: 0, padding: 12, background: "hsl(222 33% 12%)", color: "hsl(210 40% 96%)", fontSize: "var(--avep-text-xs)", fontFamily: "var(--avep-font-mono)", overflowX: "auto" }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

function RegisterTableInline() {
  const rows = [
    { addr: "0x0000", name: "DMA_CTRL",  w: 32, reset: "0x00000000", access: "RW",  desc: "Global enable, soft reset" },
    { addr: "0x0004", name: "DMA_STATUS",w: 32, reset: "0x00000001", access: "RO",  desc: "Ready & error flags" },
    { addr: "0x0100", name: "RING_BASE", w: 64, reset: "0x00000000", access: "RW",  desc: "Descriptor ring base pointer" },
    { addr: "0x0200", name: "CMPL_THRESH",w:32, reset: "0x00000020", access: "RW",  desc: "Completion coalescing threshold" },
    { addr: "0x0300", name: "IRQ_MASK",  w: 32, reset: "0xFFFFFFFF", access: "RW",  desc: "Interrupt mask" },
  ];
  return (
    <div className="overflow-x-auto rounded-md" style={{ border: "1px solid hsl(var(--avep-border))" }}>
      <table className="w-full text-[12.5px]">
        <thead style={{ background: "hsl(var(--avep-surface-muted))" }}>
          <tr style={{ color: "hsl(var(--avep-foreground-subtle))", fontSize: "var(--avep-text-2xs)", textTransform: "uppercase", letterSpacing: "var(--avep-tracking-wide)" }}>
            {["Address","Register","W","Reset","Access","Description"].map((h) => (
              <th key={h} className="text-left py-1.5 px-3 font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-t" style={{ borderColor: "hsl(var(--avep-border))" }}>
              <td className="py-1.5 px-3" style={{ fontFamily: "var(--avep-font-mono)" }}>{r.addr}</td>
              <td className="py-1.5 px-3" style={{ fontFamily: "var(--avep-font-mono)", fontWeight: 600 }}>{r.name}</td>
              <td className="py-1.5 px-3">{r.w}</td>
              <td className="py-1.5 px-3" style={{ fontFamily: "var(--avep-font-mono)" }}>{r.reset}</td>
              <td className="py-1.5 px-3">{r.access}</td>
              <td className="py-1.5 px-3" style={{ color: "hsl(var(--avep-foreground-muted))" }}>{r.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* --------------------------- Traceability Sankey -------------------------- */

function TraceabilitySankey() {
  const cols = ["Requirement", "Section", "Verification Obj.", "Test Category", "Coverage Goal", "Acceptance"];
  const flows = [
    { r: "REQ-1021", s: "Register Model",         v: "VO-018", t: "Directed",   c: "func_ring_wrap",  a: "AC-021 Approved" },
    { r: "REQ-1044", s: "Arbitration",             v: "VO-044", t: "Formal",     c: "arb_fairness",     a: "AC-044 Pending" },
    { r: "REQ-1150", s: "Interrupts",              v: "VO-150", t: "Formal",     c: "irq_no_underflow", a: "AC-150 Approved" },
    { r: "REQ-1220", s: "Security Model",          v: "VO-220", t: "Negative",   c: "sec_priv_gate",    a: "AC-220 Approved" },
    { r: "REQ-1520", s: "Error Handling",          v: "VO-520", t: "Fault Inj.", c: "ecc_secded",       a: "AC-520 Approved" },
    { r: "REQ-1710", s: "Performance",             v: "VO-710", t: "Directed",   c: "irq_latency",      a: "AC-710 Draft"    },
  ];
  return (
    <div className="overflow-x-auto">
      <div className="grid" style={{ gridTemplateColumns: "repeat(6, minmax(130px, 1fr))", gap: 6, minWidth: 820 }}>
        {cols.map((c) => (<div key={c} style={label2xs}>{c}</div>))}
        {flows.map((f, i) => (
          <div key={i} style={{ display: "contents" }}>
            <SankeyCell v={f.r} tone="info" mono />
            <SankeyCell v={f.s} tone="accent" />
            <SankeyCell v={f.v} tone="info" mono />
            <SankeyCell v={f.t} tone="ai" />
            <SankeyCell v={f.c} tone="neutral" mono />
            <SankeyCell v={f.a} tone={f.a.endsWith("Approved") ? "ok" : f.a.endsWith("Pending") ? "warn" : "neutral"} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SankeyCell({ v, tone, mono }: { v: string; tone: Tone; mono?: boolean }) {
  const s = toneMap[tone];
  return (
    <div className="px-2 py-1.5 rounded-md flex items-center gap-1.5"
      style={{ background: s.bg, color: s.fg, fontSize: "var(--avep-text-xs)", fontWeight: 600, fontFamily: mono ? "var(--avep-font-mono)" : undefined }}>
      <ArrowRight className="h-3 w-3 opacity-60" />
      <span className="truncate">{v}</span>
    </div>
  );
}

/* --------------------------- Coverage Dashboard --------------------------- */

function CoverageDashboard() {
  const metrics = [
    { l: "Functional Coverage", v: 98,  target: 95, color: "222 78% 46%" },
    { l: "Code Coverage Goal",  v: 95,  target: 95, color: "194 92% 40%" },
    { l: "Assertion Coverage",  v: 100, target: 100, color: "142 65% 42%" },
    { l: "Formal Candidates",   v: 128, target: 130, color: "268 78% 55%", raw: true },
    { l: "Regression Groups",   v: 24,  target: 24,  color: "35 92% 52%",  raw: true },
  ];
  return (
    <div className="grid grid-cols-2 gap-2">
      {metrics.map((m) => (
        <div key={m.l} className="p-2.5 rounded-md" style={{ background: "hsl(var(--avep-surface-muted))" }} title={`${m.l} target ${m.target}${m.raw ? "" : "%"}`}>
          <div className="flex items-center justify-between">
            <span style={label2xs}>{m.l}</span>
            <span style={{ fontSize: "var(--avep-text-lg)", fontWeight: 700, color: `hsl(${m.color})` }}>
              {m.raw ? m.v : `${m.v}%`}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--avep-surface))" }}>
            <div className="h-full rounded-full" style={{
              width: `${Math.min(100, m.raw ? (m.v / m.target) * 100 : m.v)}%`,
              background: `hsl(${m.color})`, transition: "width 900ms ease",
            }} />
          </div>
        </div>
      ))}
      <div className="p-2.5 rounded-md col-span-2" style={{ background: "hsl(var(--avep-primary-soft))" }}>
        <div className="flex items-center gap-2" style={{ fontSize: "var(--avep-text-xs)", color: "hsl(var(--avep-primary))", fontWeight: 600 }}>
          <Sparkles className="h-3.5 w-3.5" />
          AI proposes 12 additional coverage points to close 2 gaps: ecc-uc-path, arb-tie-break.
        </div>
      </div>
    </div>
  );
}

/* --------------------------- Formal candidates ---------------------------- */

function FormalCandidates({ onExplain }: { onExplain: (name: string) => void }) {
  return (
    <ul className="flex flex-col gap-2">
      {FORMAL_CANDIDATES.map((c) => (
        <li key={c.name} className="p-2.5 rounded-md" style={{ background: "hsl(var(--avep-ai-soft))", border: "1px solid hsl(var(--avep-ai) / 0.2)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" style={{ color: "hsl(var(--avep-ai))" }} />
              <span style={{ fontSize: "var(--avep-text-sm)", fontWeight: 600 }}>{c.name}</span>
            </div>
            <Badge tone="ai">{c.confidence}%</Badge>
          </div>
          <div style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-muted))", marginTop: 3 }}>{c.reason}</div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {c.props.map((p) => (
              <span key={p} className="px-1.5 py-0.5 rounded" style={{ background: "hsl(var(--avep-surface))", border: "1px solid hsl(var(--avep-border))", fontSize: "var(--avep-text-2xs)", fontFamily: "var(--avep-font-mono)" }}>{p}</span>
            ))}
          </div>
          <div className="mt-1.5">
            <button onClick={() => onExplain(c.name)}
              className="inline-flex items-center gap-1 text-[11px]" style={{ color: "hsl(var(--avep-primary))", fontWeight: 600 }}>
              <Sparkles className="h-3 w-3" /> Explain reasoning
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* --------------------------- Verification matrix -------------------------- */

function VerificationMatrix() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr style={{ color: "hsl(var(--avep-foreground-subtle))", fontSize: "var(--avep-text-2xs)", textTransform: "uppercase", letterSpacing: "var(--avep-tracking-wide)" }}>
            {["Requirement","Method","Sim","Formal","Assertion","Directed","Random","Coverage","Owner","Status"].map((h) => (
              <th key={h} className="text-left py-1.5 pr-3 font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {VERIF_MATRIX.map((r) => (
            <tr key={r.req} className="border-t" style={{ borderColor: "hsl(var(--avep-border))" }}>
              <td className="py-1.5 pr-3" style={{ fontFamily: "var(--avep-font-mono)" }}>{r.req}</td>
              <td className="py-1.5 pr-3">{r.method}</td>
              <td className="py-1.5 pr-3"><Tick on={r.sim} /></td>
              <td className="py-1.5 pr-3"><Tick on={r.formal} /></td>
              <td className="py-1.5 pr-3"><Tick on={r.asrt} /></td>
              <td className="py-1.5 pr-3"><Tick on={r.dir} /></td>
              <td className="py-1.5 pr-3"><Tick on={r.rand} /></td>
              <td className="py-1.5 pr-3" style={{ fontFamily: "var(--avep-font-mono)" }}>{r.cov}</td>
              <td className="py-1.5 pr-3">{r.owner}</td>
              <td className="py-1.5 pr-3">
                <Badge tone={r.status === "Complete" ? "ok" : r.status === "In Progress" ? "info" : r.status === "Review" ? "warn" : "err"}>{r.status}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function Tick({ on }: { on: boolean }) {
  return on ? <CheckCircle2 className="h-4 w-4" style={{ color: toneMap.ok.dot }} />
           : <span className="h-1 w-3 inline-block rounded" style={{ background: "hsl(var(--avep-border))" }} />;
}

/* ------------------------------ Test plan --------------------------------- */

function TestPlan() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2">
      {TEST_CATEGORIES.map((c) => (
        <div key={c.name} className="p-3 rounded-md" style={{ background: "hsl(var(--avep-surface-muted))", border: "1px solid hsl(var(--avep-border))" }} title={`${c.count} tests · ${c.reqs} requirements`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <c.icon className="h-4 w-4" style={{ color: "hsl(var(--avep-primary))" }} />
              <span style={{ fontSize: "var(--avep-text-sm)", fontWeight: 600 }}>{c.name}</span>
            </div>
            <Badge tone={c.cov >= 95 ? "ok" : c.cov >= 88 ? "warn" : "err"}>{c.cov}%</Badge>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <Stat l="Tests" v={c.count} />
            <Stat l="Runtime" v={c.runtime} />
            <Stat l="Reqs" v={c.reqs} />
          </div>
          <div className="mt-1.5 h-1 rounded-full" style={{ background: "hsl(var(--avep-surface))" }}>
            <div className="h-full rounded-full" style={{ width: `${c.cov}%`, background: `hsl(var(--avep-primary))` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
function Stat({ l, v }: { l: string; v: string | number }) {
  return (
    <div>
      <div style={label2xs}>{l}</div>
      <div style={{ fontSize: "var(--avep-text-sm)", fontWeight: 600, fontFamily: "var(--avep-font-mono)" }}>{v}</div>
    </div>
  );
}

/* -------------------------- Acceptance criteria -------------------------- */

function AcceptanceTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr style={{ color: "hsl(var(--avep-foreground-subtle))", fontSize: "var(--avep-text-2xs)", textTransform: "uppercase", letterSpacing: "var(--avep-tracking-wide)" }}>
            {["Requirement","Acceptance Statement","Method","Pass Criteria","Evidence","Approval"].map((h) => (
              <th key={h} className="text-left py-1.5 pr-3 font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ACCEPTANCE.map((a) => (
            <tr key={a.req} className="border-t" style={{ borderColor: "hsl(var(--avep-border))" }}>
              <td className="py-1.5 pr-3" style={{ fontFamily: "var(--avep-font-mono)" }}>{a.req}</td>
              <td className="py-1.5 pr-3">{a.stmt}</td>
              <td className="py-1.5 pr-3">{a.method}</td>
              <td className="py-1.5 pr-3" style={{ color: "hsl(var(--avep-foreground-muted))" }}>{a.pass}</td>
              <td className="py-1.5 pr-3" style={{ fontFamily: "var(--avep-font-mono)" }}>{a.evidence}</td>
              <td className="py-1.5 pr-3">
                <Badge tone={a.approve === "Approved" ? "ok" : a.approve === "Pending" ? "warn" : "info"}>{a.approve}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* -------------------------------- TRM split ------------------------------- */

function TrmSplit() {
  const toc = [
    "1. Overview",
    "2. Address Map",
    "3. Initialization",
    "  3.1 Reset Sequencing",
    "  3.2 Ring Setup",
    "4. DMA Operation",
    "5. Interrupts",
    "6. Security",
    "7. Errors & Recovery",
  ];
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: "220px 1fr" }}>
      <div className="p-3 rounded-md" style={{ background: "hsl(var(--avep-surface-muted))" }}>
        <div style={label2xs} className="mb-1.5">Table of Contents</div>
        <ul className="flex flex-col gap-0.5" style={{ fontSize: "var(--avep-text-xs)", fontFamily: "var(--avep-font-mono)" }}>
          {toc.map((l) => <li key={l} className={l.startsWith("  ") ? "pl-3 text-slate-500" : "text-slate-800"}>{l}</li>)}
        </ul>
      </div>
      <div className="p-4 rounded-md" style={{ background: "hsl(var(--avep-surface))", border: "1px solid hsl(var(--avep-border))" }}>
        <h3 style={{ fontSize: "var(--avep-text-lg)", fontWeight: 700 }}>3.2 Ring Setup</h3>
        <p style={{ fontSize: "var(--avep-text-sm)", color: "hsl(var(--avep-foreground-muted))", marginTop: 4 }}>
          Program the descriptor ring by writing the physical base address, resetting head/tail, and configuring the completion threshold.
          The controller must be disabled prior to base updates.
        </p>
        <CodeBlock title="Firmware — ring setup" code={REG_EXAMPLE_CODE} />
        <div className="mt-3 flex items-center gap-2" style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>
          <Link2 className="h-3 w-3" /> Cross-refs: §2 Address Map · §4 DMA Operation · REQ-1021 · RING_BASE
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Health gauge ------------------------------ */

function HealthGauge({ value }: { value: number }) {
  const r = 46, c = 2 * Math.PI * r;
  const off = c * (1 - value / 100);
  return (
    <div className="flex items-center gap-3">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="hsl(var(--avep-surface-muted))" strokeWidth="10" />
        <circle cx="60" cy="60" r={r} fill="none" stroke="hsl(var(--avep-pass))" strokeWidth="10"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" transform="rotate(-90 60 60)"
          style={{ transition: "stroke-dashoffset 1200ms ease" }} />
        <text x="60" y="60" textAnchor="middle" dominantBaseline="central" fontSize="22" fontWeight="700" fill="hsl(var(--avep-foreground))">{value}%</text>
      </svg>
      <div className="flex-1">
        <div style={{ fontSize: "var(--avep-text-sm)", fontWeight: 600 }}>Live authoring score</div>
        <div style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-muted))" }}>Composite of 7 documentation dimensions</div>
      </div>
    </div>
  );
}

/* -------------------------- AI Reasoning Drawer --------------------------- */

function ReasoningDrawer({ section, onClose }: { section: string; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-label={`AI reasoning — ${section}`}>
      <div className="absolute inset-0" style={{ background: "hsl(222 33% 12% / 0.35)" }} onClick={onClose} />
      <div ref={ref} tabIndex={-1} className="absolute top-0 right-0 h-full w-full max-w-[520px] overflow-auto"
        style={{ background: "hsl(var(--avep-surface))", boxShadow: "-24px 0 48px -12px hsl(222 33% 12% / 0.25)" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}>
          <div>
            <div style={label2xs}>AI Reasoning</div>
            <div style={{ fontSize: "var(--avep-text-xl)", fontWeight: 700 }}>{section}</div>
          </div>
          <button onClick={onClose} className="h-8 w-8 grid place-items-center rounded-md hover:bg-slate-100" aria-label="Close reasoning">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 flex flex-col gap-3" style={{ fontSize: "var(--avep-text-sm)" }}>
          <Block title="Why this section was generated">
            Section synthesizes 4 approved requirements and 3 architecture blocks under the "Interfaces & Registers" cluster.
            Traceability graph reports 96% source coverage; language optimized for engineering density.
          </Block>
          <Block title="Requirements used">
            <div className="flex flex-wrap gap-1"><Badge tone="info">REQ-1021</Badge><Badge tone="info">REQ-1105</Badge><Badge tone="info">REQ-1150</Badge><Badge tone="info">REQ-1220</Badge></div>
          </Block>
          <Block title="Architecture references">
            <div className="flex flex-wrap gap-1"><Badge tone="accent">AXI Master</Badge><Badge tone="accent">Descriptor Engine</Badge><Badge tone="accent">Interrupt Controller</Badge></div>
          </Block>
          <Block title="Confidence"><Badge tone="ai">96%</Badge> — cross-checked against 3 evidence artifacts.</Block>
          <Block title="Missing information">SEC_CFG.MODE bit-field table pending Security Architect review.</Block>
          <Block title="Alternative wording">
            "Interrupt coalescing operates on PCLK; IRQ_MASK is Machine-writable and IRQ_STATUS is W1C at Supervisor."
          </Block>
          <Block title="Suggested improvements">Cite REQ-1220 explicitly in privilege paragraph; add cross-ref to TRM §5.</Block>
          <div className="flex gap-2 mt-2">
            <Btn variant="primary" icon={CheckCircle2}>Accept</Btn>
            <Btn icon={Wand2} variant="ai">Regenerate</Btn>
            <Btn icon={Download}>Export</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-3 rounded" style={{ background: "hsl(var(--avep-surface-muted))" }}>
      <div style={label2xs} className="mb-1">{title}</div>
      <div>{children}</div>
    </div>
  );
}
