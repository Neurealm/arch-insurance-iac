import { useMemo, useState } from "react";
import {
  FileCode2, GitBranch, ShieldCheck, AlertTriangle, CheckCircle2, XCircle,
  Cpu, Layers, ListChecks, FileText, Sparkles, Search, Download, GitCompare,
  Play, ChevronRight, Info, Lock, Clock, Activity, MessageSquare,
} from "lucide-react";

/**
 * AVEP.P2.RTL.001 — RTL Generation Studio
 * Phase 2, Build and Verify | Step 7, Implement RTL
 */

type Severity = "blocking" | "major" | "advisory";
type ReqStatus = "approved" | "clarification" | "draft";

const REQUIREMENTS: Array<{
  id: string; text: string; status: ReqStatus; priority: string; owner: string; source: string; classification?: string;
  lines?: number[];
}> = [
  { id: "REQ-DDMAC-142", text: "The descriptor engine shall reject descriptors whose payload length exceeds the configured maximum transfer length (strict greater-than; length == max is legal).", status: "approved", priority: "Safety critical", owner: "DMA Architecture", source: "DDMAC MAS §4.7.3", lines: [29, 30, 31, 32, 56, 57, 58] },
  { id: "REQ-DDMAC-143", text: "The descriptor engine shall assert desc_error within two clock cycles following detection of an invalid descriptor.", status: "clarification", priority: "High", owner: "DMA Architecture", source: "DDMAC MAS §4.7.4", lines: [12, 74, 75, 76, 77] },
  { id: "REQ-SEC-088",   text: "Privileged descriptors shall be accepted only when priv_mode is asserted.", status: "approved", priority: "Security critical", owner: "Security Architecture", source: "DDMAC Security Spec 2.1 §3.2", classification: "Security", lines: [10, 34, 35, 36, 37, 38, 60, 61, 62] },
  { id: "REQ-DDMAC-144", text: "Descriptor validation shall complete within three clock cycles under nominal load.", status: "approved", priority: "Performance", owner: "DMA Architecture", source: "DDMAC MAS §5.1", lines: [47, 55, 69] },
];

const ARCH_SOURCES = [
  { id: "ARCH-FSM-04", name: "Descriptor validation FSM", version: "3.2", status: "approved" },
  { id: "ARCH-DDMAC-01", name: "DDMAC logical architecture", version: "3.2", status: "approved" },
  { id: "IF-AXI4-M", name: "AXI4 master interface contract", version: "3.2", status: "approved" },
  { id: "IF-APB-REG", name: "APB register interface contract", version: "3.2", status: "approved" },
  { id: "CLK-RST-01", name: "Clock and reset domain model", version: "1.7", status: "approved" },
  { id: "ERR-INT-02", name: "Error and interrupt handling", version: "2.3", status: "approved" },
];

const REGISTERS = [
  { name: "DDMAC_CFG",     offset: "0x000", access: "RW",  reset: "0x00000000" },
  { name: "MAX_XFER_LEN",  offset: "0x004", access: "RW",  reset: "0x00001000" },
  { name: "DESC_STATUS",   offset: "0x010", access: "RO",  reset: "0x00000000" },
  { name: "ERR_STATUS",    offset: "0x014", access: "W1C", reset: "0x00000000" },
  { name: "INT_ENABLE",    offset: "0x020", access: "RW",  reset: "0x00000000" },
  { name: "INT_STATUS",    offset: "0x024", access: "RO",  reset: "0x00000000" },
];

const CODING_STANDARDS = [
  "Nonblocking assignments for sequential logic",
  "Explicit reset state",
  "No inferred latches",
  "One clock domain per sequential process",
  "Parameterized widths",
  "No implicit nets",
  "Synthesis-safe constructs only",
  "Assertions placed outside synthesizable logic",
];

const REUSED_PATTERNS = [
  "APB register access template",
  "Descriptor validation pattern",
  "Error capture pattern",
  "Interrupt aggregation pattern",
  "Parameterized FIFO wrapper",
];

const FINDINGS: Array<{ id: string; severity: Severity; category: string; message: string; lines: number[]; source?: string; }> = [
  { id: "F-001", severity: "blocking", category: "Requirement Ambiguity", message: "REQ-DDMAC-143 does not define whether the two-cycle response begins at signal assertion, sampling, or completion of interface acceptance.", lines: [12, 74, 76], source: "REQ-DDMAC-143" },
  { id: "F-002", severity: "major",    category: "Clock Domain",         message: "priv_mode clock-domain ownership is not explicitly documented in the APB register interface contract.", lines: [10, 34, 38], source: "IF-APB-REG" },
  { id: "F-003", severity: "major",    category: "Error Priority",       message: "Error code priority is inferred (length_error over privilege_error) when both fire simultaneously; not stated in spec.", lines: [56, 57, 60, 61] },
  { id: "F-004", severity: "advisory", category: "State Machine",        message: "State machine can be simplified, but the explicit VALIDATE state improves traceability and reviewability.", lines: [16, 21, 47, 55] },
  { id: "F-005", severity: "advisory", category: "Coverage",             message: "Consider explicit coverage points for back-to-back invalid descriptors and the length == max boundary (cg_len_boundary.cross_at_max).", lines: [] },
  { id: "F-006", severity: "major",    category: "Reset",                message: "Reset behavior for err_code_q and state_q not covered by an SVA property; recommend p_reset_returns_idle.", lines: [87, 88, 89, 90] },
  { id: "F-007", severity: "advisory", category: "Naming",               message: "Consider replacing raw 3'b001 / 3'b010 error codes with a package enum (ddmac_err_e) for reviewability.", lines: [57, 61] },
];

const ASSUMPTIONS = [
  { id: "ASM-017", text: "Descriptor detection occurs when desc_valid is sampled high", source: "REQ-DDMAC-143", risk: "High", owner: "Verification Lead + Architect" },
  { id: "ASM-018", text: "Error response may assert in the cycle after VALIDATE",       source: "ARCH-FSM-04",  risk: "Medium", owner: "RTL Lead" },
  { id: "ASM-019", text: "priv_mode is synchronous to clk",                              source: "IF-APB-REG",    risk: "Medium", owner: "Interface Owner" },
  { id: "ASM-020", text: "Reset clears pending error state",                             source: "CLK-RST-01",    risk: "Low",    owner: "RTL Reviewer" },
];

const RTL_CODE = `module ddmac_descriptor_validator #(
    parameter int LEN_WIDTH = 16
) (
    input  logic                 clk,
    input  logic                 rst_n,
    input  logic                 desc_valid,
    input  logic [LEN_WIDTH-1:0] desc_length,
    input  logic [LEN_WIDTH-1:0] max_transfer_length,
    input  logic                 privileged_request,
    input  logic                 priv_mode,
    output logic                 desc_accept,
    output logic                 desc_error,
    output logic [2:0]           error_code
);

    typedef enum logic [1:0] {
        IDLE,
        VALIDATE,
        ACCEPT,
        REJECT
    } validator_state_e;

    validator_state_e state_q, state_d;
    logic [2:0]       err_code_q, err_code_d;

    logic length_error;
    logic privilege_error;

    // REQ-DDMAC-142 — strict '>' (fixes DEF-DV-219; length == max is legal)
    assign length_error =
        desc_valid &&
        (desc_length > max_transfer_length);

    // REQ-SEC-088 — privileged descriptors require priv_mode
    assign privilege_error =
        desc_valid &&
        privileged_request &&
        !priv_mode;

    always_comb begin
        state_d     = state_q;
        err_code_d  = err_code_q;
        desc_accept = 1'b0;
        desc_error  = 1'b0;
        error_code  = err_code_q;

        unique case (state_q)
            IDLE: begin
                if (desc_valid) begin
                    state_d    = VALIDATE;
                    err_code_d = 3'b000;
                end
            end

            VALIDATE: begin
                if (length_error) begin
                    err_code_d = 3'b001;
                    state_d    = REJECT;
                end
                else if (privilege_error) begin
                    err_code_d = 3'b010;
                    state_d    = REJECT;
                end
                else begin
                    state_d = ACCEPT;
                end
            end

            ACCEPT: begin
                desc_accept = 1'b1;
                state_d     = IDLE;
            end

            REJECT: begin
                // REQ-DDMAC-143 — assert desc_error with latched error_code
                desc_error = 1'b1;
                error_code = err_code_q;
                state_d    = IDLE;
            end

            default: begin
                state_d = IDLE;
            end
        endcase
    end

    always_ff @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            state_q    <= IDLE;
            err_code_q <= 3'b000;
        end
        else begin
            state_q    <= state_d;
            err_code_q <= err_code_d;
        end
    end

endmodule`;

const RTL_LINES = RTL_CODE.split("\n");

const LINE_BADGES: Record<number, string[]> = {
  10: ["REQ-SEC-088"],
  12: ["REQ-DDMAC-143"],
  16: ["ARCH-FSM-04"], 21: ["ARCH-FSM-04"],
  23: ["ARCH-FSM-04"],
  29: ["REQ-DDMAC-142"], 30: ["REQ-DDMAC-142"], 31: ["REQ-DDMAC-142"], 32: ["REQ-DDMAC-142", "REG:MAX_XFER_LEN"],
  34: ["REQ-SEC-088"], 35: ["REQ-SEC-088"], 36: ["REQ-SEC-088"], 37: ["REQ-SEC-088"], 38: ["REQ-SEC-088"],
  47: ["ARCH-FSM-04"],
  56: ["REQ-DDMAC-142"], 57: ["REQ-DDMAC-142"], 58: ["REQ-DDMAC-142"],
  60: ["REQ-SEC-088"], 61: ["REQ-SEC-088"], 62: ["REQ-SEC-088"],
  74: ["REQ-DDMAC-143"], 75: ["REQ-DDMAC-143"], 76: ["REQ-DDMAC-143"], 77: ["REQ-DDMAC-143"],
  87: ["CLK-RST-01"], 88: ["CLK-RST-01"], 89: ["CLK-RST-01"], 90: ["CLK-RST-01"],
};

const GENERATED_FILES = [
  { path: "rtl/ddmac_descriptor_validator.sv", type: "SystemVerilog", lines: 98, status: "Generated", findings: 4 },
  { path: "rtl/ddmac_descriptor_guard.sv",     type: "SystemVerilog", lines: 64, status: "Generated", findings: 0 },
  { path: "rtl/ddmac_error_capture.sv",        type: "SystemVerilog", lines: 118, status: "Generated", findings: 2 },
  { path: "rtl/ddmac_interrupt_logic.sv",      type: "SystemVerilog", lines: 174, status: "Generated", findings: 1 },
  { path: "rtl/ddmac_pkg.sv",                  type: "SV Package",    lines: 42, status: "Generated", findings: 0 },
  { path: "assertions/ddmac_descriptor_validator_sva.sv", type: "SVA", lines: 46, status: "Proposed", findings: 0 },
  { path: "docs/ddmac_descriptor_validator.md", type: "Markdown",     lines: 14, status: "Generated", findings: 0 },
];

const GEN_LOG = [
  { t: "12:04:11", event: "Source context locked to rtl_baseline_3.2.17 @ feature/descriptor-ring-fix off release/2.4" },
  { t: "12:04:12", event: "24 approved inputs loaded (18 requirements, 6 architecture, 4 interfaces, 12 registers)" },
  { t: "12:04:12", event: "1 unresolved requirement detected: REQ-DDMAC-143 (clarification pending)" },
  { t: "12:04:13", event: "Coding standards profile ddmac.rtl.v3 applied" },
  { t: "12:04:13", event: "3 reused patterns selected (APB access, descriptor validation, error capture)" },
  { t: "12:04:19", event: "RTL proposal generated — 486 lines across 4 files + 1 SVA + 1 doc" },
  { t: "12:04:20", event: "42 traceability links established (REQ↔ARCH↔RTL↔TEST↔COVER)" },
  { t: "12:04:24", event: "Static prechecks completed (0 lint blockers, 3 advisories)" },
  { t: "12:04:25", event: "Validation plan proposed (28 sim tests, 5 formal candidates, 6 coverage groups)" },
  { t: "12:04:25", event: "Proposal submitted for engineering review — AWAITING_REVIEW" },
];

const REVIEWERS = [
  { role: "RTL Design Lead",     name: "L. Tran",     status: "pending" },
  { role: "IP Architect",        name: "H. Tanaka",   status: "pending" },
  { role: "Verification Lead",   name: "B. Cohen",    status: "pending" },
  { role: "Interface Owner",     name: "A. Ramirez",  status: "acknowledged" },
];

// ---------- Small primitives ----------

const border = "1px solid hsl(var(--avep-border))";
const surface: React.CSSProperties = { background: "hsl(var(--avep-surface))", border };
const surfaceMuted: React.CSSProperties = { background: "hsl(var(--avep-surface-muted))", border };

function Chip({ children, tone = "neutral", mono = false }: { children: React.ReactNode; tone?: "neutral" | "pass" | "warn" | "fail" | "info" | "ai" | "accent"; mono?: boolean; }) {
  const map: Record<string, { bg: string; fg: string }> = {
    neutral: { bg: "hsl(var(--avep-surface-muted))", fg: "hsl(var(--avep-foreground-muted))" },
    pass:    { bg: "hsl(var(--avep-pass-soft))",     fg: "hsl(var(--avep-pass))" },
    warn:    { bg: "hsl(var(--avep-warn-soft))",     fg: "hsl(var(--avep-warn))" },
    fail:    { bg: "hsl(var(--avep-fail-soft))",     fg: "hsl(var(--avep-fail))" },
    info:    { bg: "hsl(var(--avep-info-soft))",     fg: "hsl(var(--avep-info))" },
    ai:      { bg: "hsl(var(--avep-ai-soft))",       fg: "hsl(var(--avep-ai))" },
    accent:  { bg: "hsl(var(--avep-accent-soft))",   fg: "hsl(var(--avep-accent))" },
  };
  const c = map[tone];
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded"
      style={{
        background: c.bg, color: c.fg, fontSize: "var(--avep-text-2xs)",
        fontWeight: 600, letterSpacing: "var(--avep-tracking-wide)",
        fontFamily: mono ? "var(--avep-font-mono)" : undefined,
      }}
    >
      {children}
    </span>
  );
}

function Card({ title, right, children, dense = false }: { title?: React.ReactNode; right?: React.ReactNode; children: React.ReactNode; dense?: boolean; }) {
  return (
    <section className="rounded-md" style={surface}>
      {title && (
        <header
          className="flex items-center justify-between px-3 py-2 border-b"
          style={{ borderColor: "hsl(var(--avep-border))" }}
        >
          <h3 className="font-semibold" style={{ fontSize: "var(--avep-text-sm)" }}>{title}</h3>
          {right}
        </header>
      )}
      <div className={dense ? "p-2" : "p-3"}>{children}</div>
    </section>
  );
}

function Kpi({ label, value, hint, tone = "neutral", onClick }: { label: string; value: React.ReactNode; hint?: string; tone?: "neutral" | "pass" | "warn" | "fail" | "ai"; onClick?: () => void; }) {
  const toneColor: Record<string, string> = {
    neutral: "hsl(var(--avep-foreground))",
    pass: "hsl(var(--avep-pass))", warn: "hsl(var(--avep-warn))",
    fail: "hsl(var(--avep-fail))", ai: "hsl(var(--avep-ai))",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md p-3 text-left hover:shadow-sm transition-shadow"
      style={{ ...surface, cursor: onClick ? "pointer" : "default" }}
    >
      <div style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))", textTransform: "uppercase", letterSpacing: "var(--avep-tracking-wide)" }}>
        {label}
      </div>
      <div className="mt-1 font-semibold" style={{ fontSize: "var(--avep-text-2xl)", color: toneColor[tone], fontFamily: "var(--avep-font-mono)" }}>
        {value}
      </div>
      {hint && (
        <div className="mt-0.5" style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-muted))" }}>
          {hint}
        </div>
      )}
    </button>
  );
}

// ---------- Page ----------

const TABS = ["Proposed RTL", "Baseline Comparison", "Generated Files", "Traceability", "Assumptions", "Validation Plan", "Generation Log"] as const;
type Tab = typeof TABS[number];

export default function RtlGenerationStudio() {
  const [tab, setTab] = useState<Tab>("Proposed RTL");
  const [selectedReq, setSelectedReq] = useState<string | null>("REQ-DDMAC-142");
  const [selectedFinding, setSelectedFinding] = useState<string | null>(null);
  const [diffMode, setDiffMode] = useState<"Semantic" | "Line" | "Requirement" | "Register" | "Interface">("Semantic");
  const [assumptions, setAssumptions] = useState(() =>
    ASSUMPTIONS.map((a) => ({ ...a, disposition: null as null | "accepted" | "rejected" | "clarify" })),
  );
  const [logEntries, setLogEntries] = useState(GEN_LOG);
  const [confirmAcceptOpen, setConfirmAcceptOpen] = useState(false);
  const [guidedStep, setGuidedStep] = useState<number | null>(null);
  const [showSourceDrawer, setShowSourceDrawer] = useState(false);

  const blockingCount = FINDINGS.filter((f) => f.severity === "blocking").length;
  const majorCount    = FINDINGS.filter((f) => f.severity === "major").length;
  const advisoryCount = FINDINGS.filter((f) => f.severity === "advisory").length;

  const highlightedLines = useMemo(() => {
    if (selectedFinding) {
      const f = FINDINGS.find((x) => x.id === selectedFinding);
      return new Set(f?.lines ?? []);
    }
    if (selectedReq) {
      const r = REQUIREMENTS.find((x) => x.id === selectedReq);
      return new Set(r?.lines ?? []);
    }
    return new Set<number>();
  }, [selectedReq, selectedFinding]);

  function appendLog(event: string) {
    const t = new Date().toLocaleTimeString("en-US", { hour12: false });
    setLogEntries((prev) => [...prev, { t, event }]);
  }

  function disposeAssumption(id: string, disposition: "accepted" | "rejected" | "clarify") {
    setAssumptions((prev) => prev.map((a) => (a.id === id ? { ...a, disposition } : a)));
    appendLog(`Assumption ${id} dispositioned as ${disposition}`);
  }

  return (
    <div className="flex flex-col gap-4 pb-24" style={{ color: "hsl(var(--avep-foreground))" }}>
      {/* Engineering summary + KPIs */}
      <section className="rounded-md p-4" style={surface}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Chip tone="info" mono>AVEP.P2.RTL.001</Chip>
              <Chip tone="accent">Phase 2 · Build and Verify</Chip>
              <Chip tone="neutral">Step 7 · Implement RTL</Chip>
              <Chip tone="pass"><Lock className="h-3 w-3" /> Controlled Context</Chip>
            </div>
            <h1 className="mt-2 font-semibold" style={{ fontSize: "var(--avep-text-2xl)", letterSpacing: "var(--avep-tracking-tight)" }}>
              RTL Generation Studio
            </h1>
            <p className="mt-1 max-w-3xl" style={{ fontSize: "var(--avep-text-sm)", color: "hsl(var(--avep-foreground-muted))" }}>
              Generate a traceable RTL proposal from approved requirements, architecture, interfaces, register models, and coding standards, then place the proposal under qualified engineering review.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { setGuidedStep(1); appendLog("Guided engineering review started"); }}
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 hover:opacity-90"
              style={{ background: "hsl(var(--avep-ai))", color: "hsl(var(--avep-ai-foreground))", fontSize: "var(--avep-text-xs)", fontWeight: 600 }}
            >
              <Sparkles className="h-3.5 w-3.5" /> Start Guided Engineering Review
            </button>
          </div>
        </div>

        <div
          className="mt-3 rounded-md px-3 py-2 flex items-start gap-2"
          style={{ background: "hsl(var(--avep-primary-soft))", border: "1px solid hsl(var(--avep-primary) / 0.2)" }}
        >
          <Info className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "hsl(var(--avep-primary))" }} />
          <div style={{ fontSize: "var(--avep-text-xs)", color: "hsl(var(--avep-foreground-muted))" }}>
            <span className="font-semibold" style={{ color: "hsl(var(--avep-primary))" }}>What this workspace proves — </span>
            AVEP accelerates repeatable RTL authoring while preserving design authority, source traceability, code review, version control, and downstream verification controls. The AI generates a reviewable proposal; qualified engineers accept, modify, or reject it.
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          <Kpi label="Source Readiness" value="96%" hint="24 of 25 required sources approved" tone="pass" onClick={() => setShowSourceDrawer(true)} />
          <Kpi label="Requirement Coverage" value="18 / 19" hint="1 unresolved timing condition" tone="warn" onClick={() => { setTab("Traceability"); }} />
          <Kpi label="Generated RTL" value="486" hint="lines across 4 proposed files" />
          <Kpi label="Review Findings" value={FINDINGS.length} hint={`${blockingCount} blocking · ${majorCount} major · ${advisoryCount} advisory`} tone="fail" />
          <Kpi label="AI Confidence" value="87%" hint="Recommendation signal — not proof" tone="ai" />
        </div>
      </section>

      {/* Three-column workspace */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "260px minmax(0,1fr) 320px" }}>
        {/* LEFT — Approved Source Context */}
        <aside className="flex flex-col gap-3">
          <Card
            title={<span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" style={{ color: "hsl(var(--avep-primary))" }} /> Approved Source Context</span>}
            right={<Chip tone="pass" mono>rtl_baseline_3.2.17</Chip>}
          >
            <div className="flex flex-col gap-3">
              <SourceGroup icon={<ListChecks className="h-3.5 w-3.5" />} title="Requirements" count={`${REQUIREMENTS.length} / 19`}>
                {REQUIREMENTS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => { setSelectedReq(r.id); setSelectedFinding(null); appendLog(`Filtered to ${r.id}`); }}
                    className="w-full text-left rounded px-2 py-1.5 hover:bg-black/[0.03]"
                    style={{
                      background: selectedReq === r.id ? "hsl(var(--avep-primary-soft))" : "transparent",
                      borderLeft: `2px solid ${r.status === "approved" ? "hsl(var(--avep-pass))" : "hsl(var(--avep-warn))"}`,
                    }}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold" style={{ fontFamily: "var(--avep-font-mono)", fontSize: "var(--avep-text-2xs)" }}>{r.id}</span>
                      <Chip tone={r.status === "approved" ? "pass" : "warn"}>
                        {r.status === "approved" ? "Approved" : "Clarification"}
                      </Chip>
                    </div>
                    <div className="mt-0.5 line-clamp-2" style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-muted))" }}>{r.text}</div>
                  </button>
                ))}
              </SourceGroup>

              <SourceGroup icon={<Cpu className="h-3.5 w-3.5" />} title="Architecture Sources" count={`${ARCH_SOURCES.length} / 6`}>
                {ARCH_SOURCES.map((s) => (
                  <SourceRow key={s.id} id={s.id} label={s.name} tone="pass" meta={`v${s.version}`} />
                ))}
              </SourceGroup>

              <SourceGroup icon={<Layers className="h-3.5 w-3.5" />} title="Register Model" count={`${REGISTERS.length} / 12`}>
                {REGISTERS.map((r) => (
                  <div key={r.name} className="flex items-center justify-between rounded px-2 py-1" style={{ fontSize: "var(--avep-text-2xs)" }}>
                    <span style={{ fontFamily: "var(--avep-font-mono)" }} className="font-semibold">{r.name}</span>
                    <span style={{ fontFamily: "var(--avep-font-mono)", color: "hsl(var(--avep-foreground-muted))" }}>
                      {r.offset} · {r.access}
                    </span>
                  </div>
                ))}
              </SourceGroup>

              <SourceGroup icon={<ShieldCheck className="h-3.5 w-3.5" />} title="Coding Standards" count={`${CODING_STANDARDS.length} / 8`}>
                {CODING_STANDARDS.map((c) => (
                  <div key={c} className="flex items-start gap-1.5 px-2 py-0.5" style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-muted))" }}>
                    <CheckCircle2 className="h-3 w-3 mt-0.5 shrink-0" style={{ color: "hsl(var(--avep-pass))" }} />
                    <span>{c}</span>
                  </div>
                ))}
              </SourceGroup>

              <SourceGroup icon={<GitBranch className="h-3.5 w-3.5" />} title="Reused IP & Patterns" count={`${REUSED_PATTERNS.length} / 3`}>
                {REUSED_PATTERNS.map((p) => (
                  <div key={p} className="px-2 py-0.5" style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-muted))" }}>· {p}</div>
                ))}
              </SourceGroup>
            </div>
          </Card>
        </aside>

        {/* CENTER — Editor / Tabs */}
        <section className="flex flex-col gap-3 min-w-0">
          <div className="rounded-md" style={surface}>
            <div className="flex items-center gap-0.5 px-2 pt-2 border-b overflow-x-auto" style={{ borderColor: "hsl(var(--avep-border))" }}>
              {TABS.map((t) => {
                const active = tab === t;
                return (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className="px-3 py-1.5 rounded-t-md whitespace-nowrap"
                    style={{
                      fontSize: "var(--avep-text-xs)",
                      fontWeight: active ? 600 : 500,
                      color: active ? "hsl(var(--avep-primary))" : "hsl(var(--avep-foreground-muted))",
                      background: active ? "hsl(var(--avep-primary-soft))" : "transparent",
                      borderBottom: active ? "2px solid hsl(var(--avep-primary))" : "2px solid transparent",
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>

            {tab === "Proposed RTL" && (
              <ProposedRtl
                highlighted={highlightedLines}
                onLineClick={(n) => {
                  const badges = LINE_BADGES[n];
                  if (badges?.length) {
                    const first = badges[0];
                    if (first.startsWith("REQ")) setSelectedReq(first);
                    appendLog(`Line ${n} annotated by ${badges.join(", ")}`);
                  }
                }}
                findings={FINDINGS}
                selectedFinding={selectedFinding}
                onSelectFinding={setSelectedFinding}
              />
            )}
            {tab === "Baseline Comparison" && <BaselineDiff mode={diffMode} onModeChange={setDiffMode} />}
            {tab === "Generated Files" && <GeneratedFiles />}
            {tab === "Traceability" && <TraceabilityView selectedReq={selectedReq} />}
            {tab === "Assumptions" && <AssumptionsTable rows={assumptions} onDispose={disposeAssumption} />}
            {tab === "Validation Plan" && <ValidationPlan />}
            {tab === "Generation Log" && <GenerationLog rows={logEntries} />}
          </div>
        </section>

        {/* RIGHT — AI Engineering Evidence */}
        <aside className="flex flex-col gap-3">
          <Card
            title={<span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" style={{ color: "hsl(var(--avep-ai))" }} /> AI Engineering Evidence</span>}
            right={<Chip tone="ai">Advisory</Chip>}
          >
            <div className="rounded-md p-2.5" style={{ background: "hsl(var(--avep-ai-soft))" }}>
              <div className="flex items-center justify-between">
                <span style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-ai))", fontWeight: 700, letterSpacing: "var(--avep-tracking-wide)" }}>RECOMMENDATION</span>
                <Chip tone="warn">Review with conditions</Chip>
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-semibold" style={{ fontSize: "var(--avep-text-2xl)", color: "hsl(var(--avep-ai))", fontFamily: "var(--avep-font-mono)" }}>87%</span>
                <span style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-muted))" }}>confidence · advisory only</span>
              </div>
              <p className="mt-1.5" style={{ fontSize: "var(--avep-text-xs)", color: "hsl(var(--avep-foreground-muted))" }}>
                The proposed implementation is consistent with the approved descriptor length and privilege requirements. One material ambiguity remains regarding the definition of descriptor detection and the required two-cycle error response window.
              </p>
            </div>
          </Card>

          <Card title="Source Completeness">
            <ul className="flex flex-col gap-1">
              {[
                { k: "Requirements", v: "18 / 19", ok: false },
                { k: "Architecture", v: "6 / 6",   ok: true },
                { k: "Interfaces",   v: "4 / 4",   ok: true },
                { k: "Registers",    v: "12 / 12", ok: true },
                { k: "Coding standards", v: "8 / 8", ok: true },
                { k: "Reused IP",    v: "3 / 3",   ok: true },
              ].map((r) => (
                <li key={r.k} className="flex items-center justify-between" style={{ fontSize: "var(--avep-text-xs)" }}>
                  <span style={{ color: "hsl(var(--avep-foreground-muted))" }}>{r.k}</span>
                  <span className="flex items-center gap-1" style={{ fontFamily: "var(--avep-font-mono)", fontWeight: 600 }}>
                    {r.v}
                    {r.ok
                      ? <CheckCircle2 className="h-3 w-3" style={{ color: "hsl(var(--avep-pass))" }} />
                      : <AlertTriangle className="h-3 w-3" style={{ color: "hsl(var(--avep-warn))" }} />}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="AI Identified Risks">
            <ul className="flex flex-col gap-2">
              {FINDINGS.slice(0, 4).map((f) => (
                <li key={f.id}>
                  <button
                    onClick={() => { setSelectedFinding(f.id); setTab("Proposed RTL"); }}
                    className="w-full text-left rounded-md p-2 hover:opacity-90"
                    style={{
                      background:
                        f.severity === "blocking" ? "hsl(var(--avep-fail-soft))" :
                        f.severity === "major"    ? "hsl(var(--avep-warn-soft))" :
                                                     "hsl(var(--avep-info-soft))",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <Chip tone={f.severity === "blocking" ? "fail" : f.severity === "major" ? "warn" : "info"}>
                        {f.severity.toUpperCase()}
                      </Chip>
                      <span style={{ fontSize: "var(--avep-text-2xs)", fontFamily: "var(--avep-font-mono)", color: "hsl(var(--avep-foreground-muted))" }}>
                        {f.id}
                      </span>
                    </div>
                    <div className="mt-1" style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground))" }}>
                      {f.message}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Recommended Reviewer Actions">
            <ol className="flex flex-col gap-1" style={{ fontSize: "var(--avep-text-xs)", color: "hsl(var(--avep-foreground-muted))" }}>
              {[
                "Clarify error timing boundary (REQ-DDMAC-143)",
                "Confirm priv_mode clock-domain synchronization",
                "Approve error priority behavior",
                "Review generated SVA assertions",
                "Execute lint and synthesis elaboration",
                "Approve targeted verification scope",
              ].map((a, i) => (
                <li key={i} className="flex items-start gap-1.5"><ChevronRight className="h-3 w-3 mt-0.5 shrink-0" style={{ color: "hsl(var(--avep-primary))" }} />{a}</li>
              ))}
            </ol>
          </Card>

          <Card title="Expected Downstream Impact">
            <div className="grid grid-cols-2 gap-1.5" style={{ fontSize: "var(--avep-text-2xs)" }}>
              {[
                ["RTL files affected", "4"], ["Interface contracts", "1"],
                ["Register definitions", "0"], ["Tests recommended", "8"],
                ["Formal properties", "5"],   ["Coverage objectives", "6"],
                ["Regression scope", "Targeted"], ["Compute demand", "Low–Mod"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between rounded px-1.5 py-1" style={{ background: "hsl(var(--avep-surface-muted))" }}>
                  <span style={{ color: "hsl(var(--avep-foreground-muted))" }}>{k}</span>
                  <span style={{ fontFamily: "var(--avep-font-mono)", fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 flex items-start gap-1" style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-warn))" }}>
              <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
              Predicted impact is advisory and must be confirmed through engineering analysis and execution evidence.
            </p>
          </Card>
        </aside>
      </div>

      {/* Persistent bottom action bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-30 border-t px-4 py-2.5 flex items-center gap-3 flex-wrap"
        style={{ background: "hsl(var(--avep-surface))", borderColor: "hsl(var(--avep-border))", boxShadow: "0 -4px 12px hsl(220 40% 10% / 0.05)" }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <Chip tone="warn"><Clock className="h-3 w-3" /> Awaiting qualified review</Chip>
          <Chip tone="fail">{blockingCount} blocking</Chip>
          <span style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-muted))" }}>
            Reviewers: {REVIEWERS.map((r) => `${r.role}`).join(" · ")}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <ActionBtn onClick={() => appendLog("Clarification request opened")} icon={<MessageSquare className="h-3.5 w-3.5" />}>Request Clarification</ActionBtn>
          <ActionBtn onClick={() => appendLog("Human revision started")} icon={<FileText className="h-3.5 w-3.5" />}>Modify Proposal</ActionBtn>
          <ActionBtn onClick={() => appendLog("Proposal rejected")} icon={<XCircle className="h-3.5 w-3.5" />} tone="fail">Reject Proposal</ActionBtn>
          <ActionBtn onClick={() => setConfirmAcceptOpen(true)} icon={<Play className="h-3.5 w-3.5" />} tone="primary">Accept for Validation</ActionBtn>
          <ActionBtn
            onClick={() => {}}
            disabled={blockingCount > 0}
            icon={<CheckCircle2 className="h-3.5 w-3.5" />}
            tone="pass"
            title={blockingCount > 0 ? "Blocked by open findings" : "All conditions satisfied"}
          >
            Accept as Reviewed Baseline
          </ActionBtn>
        </div>
      </div>

      {/* Modals / Drawers */}
      {confirmAcceptOpen && (
        <Modal onClose={() => setConfirmAcceptOpen(false)} title="Accept for controlled validation">
          <p style={{ fontSize: "var(--avep-text-sm)", color: "hsl(var(--avep-foreground-muted))" }}>
            You are accepting this RTL proposal for lint, elaboration, formal analysis, and targeted simulation.
            This action does not approve the RTL baseline or authorize production commit.
          </p>
          <ul className="mt-3 flex flex-col gap-1" style={{ fontSize: "var(--avep-text-xs)", color: "hsl(var(--avep-foreground-muted))" }}>
            <li>· Decision owner: RTL Design Lead</li>
            <li>· Blocking findings must be resolved before baseline acceptance</li>
            <li>· Repository commit requires a separate authorized action</li>
          </ul>
          <div className="mt-4 flex justify-end gap-2">
            <ActionBtn onClick={() => setConfirmAcceptOpen(false)} icon={null}>Cancel</ActionBtn>
            <ActionBtn
              onClick={() => { setConfirmAcceptOpen(false); appendLog("Proposal accepted for controlled validation"); }}
              icon={<CheckCircle2 className="h-3.5 w-3.5" />}
              tone="primary"
            >
              Confirm and Advance
            </ActionBtn>
          </div>
        </Modal>
      )}

      {showSourceDrawer && (
        <Drawer onClose={() => setShowSourceDrawer(false)} title="Source Readiness">
          <table className="w-full" style={{ fontSize: "var(--avep-text-xs)" }}>
            <thead>
              <tr style={{ color: "hsl(var(--avep-foreground-subtle))", textAlign: "left" }}>
                <th className="py-1">Class</th><th>Required</th><th>Present</th><th>Approved</th><th>Owner</th><th>Version</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Requirements","19","19","18","DMA Arch","3.2"],
                ["Architecture","6","6","6","Chip Arch","3.2"],
                ["Interfaces","4","4","4","IF Owners","3.2"],
                ["Registers","12","12","12","CSR Owner","3.2"],
                ["Clock/Reset","1","1","1","Physical","1.7"],
                ["Security model","1","1","1","Security","2.1"],
                ["Coding standards","8","8","8","RTL Guild","v3"],
                ["Reused IP","3","3","3","IP Reuse","—"],
                ["Verification intent","1","1","1","Verif Lead","0.9"],
                ["Prior baseline","1","1","1","Release","3.2.16"],
              ].map((r) => (
                <tr key={r[0]} className="border-t" style={{ borderColor: "hsl(var(--avep-border))" }}>
                  {r.map((c, i) => <td key={i} className="py-1" style={i > 0 ? { fontFamily: "var(--avep-font-mono)" } : undefined}>{c}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </Drawer>
      )}

      {guidedStep !== null && (
        <GuidedOverlay
          step={guidedStep}
          onNext={() => setGuidedStep((s) => (s === null ? null : s < 7 ? s + 1 : null))}
          onClose={() => setGuidedStep(null)}
        />
      )}
    </div>
  );
}

// ---------- Sub-components ----------

function SourceGroup({ icon, title, count, children }: { icon: React.ReactNode; title: string; count: string; children: React.ReactNode; }) {
  return (
    <div>
      <div className="flex items-center justify-between px-1 pb-1">
        <span className="flex items-center gap-1.5 font-semibold" style={{ fontSize: "var(--avep-text-2xs)", textTransform: "uppercase", letterSpacing: "var(--avep-tracking-wide)", color: "hsl(var(--avep-foreground-muted))" }}>
          {icon}{title}
        </span>
        <span style={{ fontSize: "var(--avep-text-2xs)", fontFamily: "var(--avep-font-mono)", color: "hsl(var(--avep-foreground-subtle))" }}>{count}</span>
      </div>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

function SourceRow({ id, label, meta, tone = "pass" }: { id: string; label: string; meta?: string; tone?: "pass" | "warn"; }) {
  return (
    <div className="flex items-center justify-between rounded px-2 py-1" style={{ fontSize: "var(--avep-text-2xs)" }}>
      <div className="min-w-0 truncate">
        <span className="font-semibold" style={{ fontFamily: "var(--avep-font-mono)" }}>{id}</span>
        <span className="ml-1.5" style={{ color: "hsl(var(--avep-foreground-muted))" }}>{label}</span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {meta && <span style={{ fontFamily: "var(--avep-font-mono)", color: "hsl(var(--avep-foreground-subtle))" }}>{meta}</span>}
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: tone === "pass" ? "hsl(var(--avep-pass))" : "hsl(var(--avep-warn))" }}
        />
      </div>
    </div>
  );
}

function ProposedRtl({
  highlighted, onLineClick, findings, selectedFinding, onSelectFinding,
}: {
  highlighted: Set<number>;
  onLineClick: (n: number) => void;
  findings: typeof FINDINGS;
  selectedFinding: string | null;
  onSelectFinding: (id: string | null) => void;
}) {
  return (
    <div className="grid gap-0" style={{ gridTemplateColumns: "minmax(0,1fr) 260px" }}>
      <div className="flex flex-col">
        {/* editor toolbar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: "hsl(var(--avep-border))", background: "hsl(var(--avep-surface-muted))" }}>
          <FileCode2 className="h-3.5 w-3.5" style={{ color: "hsl(var(--avep-primary))" }} />
          <span className="font-semibold" style={{ fontFamily: "var(--avep-font-mono)", fontSize: "var(--avep-text-xs)" }}>
            rtl/ddmac_descriptor_validator.sv
          </span>
          <Chip tone="info" mono>SystemVerilog</Chip>
          <Chip tone="ai">AI Proposed</Chip>
          <div className="ml-auto flex items-center gap-1">
            <IconBtn title="Search"><Search className="h-3.5 w-3.5" /></IconBtn>
            <IconBtn title="Diff view"><GitCompare className="h-3.5 w-3.5" /></IconBtn>
            <IconBtn title="Download"><Download className="h-3.5 w-3.5" /></IconBtn>
            <IconBtn title="Open in repository"><GitBranch className="h-3.5 w-3.5" /></IconBtn>
          </div>
        </div>
        {/* code */}
        <div className="overflow-auto" style={{ maxHeight: 640, background: "hsl(var(--avep-surface))" }}>
          <table className="w-full" style={{ fontFamily: "var(--avep-font-mono)", fontSize: "var(--avep-text-xs)", tabSize: 4 }}>
            <tbody>
              {RTL_LINES.map((raw, idx) => {
                const n = idx + 1;
                const isHi = highlighted.has(n);
                const badges = LINE_BADGES[n];
                return (
                  <tr
                    key={n}
                    onClick={() => onLineClick(n)}
                    style={{
                      background: isHi ? "hsl(var(--avep-warn-soft))" : "transparent",
                      cursor: "pointer",
                    }}
                    className="hover:bg-black/[0.02]"
                  >
                    <td className="pl-3 pr-2 text-right select-none" style={{ color: "hsl(var(--avep-foreground-subtle))", width: 40, borderRight: "1px solid hsl(var(--avep-border))" }}>
                      {n}
                    </td>
                    <td className="pl-3 pr-2 whitespace-pre" style={{ color: "hsl(var(--avep-foreground))" }}>
                      <span dangerouslySetInnerHTML={{ __html: highlightSv(raw) }} />
                    </td>
                    <td className="pr-3 py-0" style={{ width: 1, whiteSpace: "nowrap" }}>
                      {badges && (
                        <span className="inline-flex gap-1">
                          {badges.map((b) => (
                            <span
                              key={b}
                              className="px-1 rounded"
                              style={{
                                fontSize: "10px",
                                fontFamily: "var(--avep-font-mono)",
                                background: b.startsWith("REQ") ? "hsl(var(--avep-primary-soft))" :
                                            b.startsWith("ARCH") ? "hsl(var(--avep-accent-soft))" :
                                            "hsl(var(--avep-ai-soft))",
                                color: b.startsWith("REQ") ? "hsl(var(--avep-primary))" :
                                       b.startsWith("ARCH") ? "hsl(var(--avep-accent))" :
                                       "hsl(var(--avep-ai))",
                              }}
                            >
                              {b}
                            </span>
                          ))}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* findings side rail */}
      <div className="border-l flex flex-col" style={{ borderColor: "hsl(var(--avep-border))" }}>
        <div className="px-3 py-2 border-b flex items-center justify-between" style={{ borderColor: "hsl(var(--avep-border))", background: "hsl(var(--avep-surface-muted))" }}>
          <span className="font-semibold" style={{ fontSize: "var(--avep-text-xs)" }}>Findings ({findings.length})</span>
          {selectedFinding && (
            <button onClick={() => onSelectFinding(null)} className="underline" style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-muted))" }}>
              Clear
            </button>
          )}
        </div>
        <div className="overflow-auto p-2 flex flex-col gap-1.5" style={{ maxHeight: 640 }}>
          {findings.map((f) => {
            const active = selectedFinding === f.id;
            const tone: "fail" | "warn" | "info" = f.severity === "blocking" ? "fail" : f.severity === "major" ? "warn" : "info";
            return (
              <button
                key={f.id}
                onClick={() => onSelectFinding(active ? null : f.id)}
                className="text-left rounded-md p-2"
                style={{
                  border: `1px solid ${active ? "hsl(var(--avep-primary))" : "hsl(var(--avep-border))"}`,
                  background: active ? "hsl(var(--avep-primary-soft))" : "hsl(var(--avep-surface))",
                }}
              >
                <div className="flex items-center justify-between">
                  <Chip tone={tone}>{f.severity}</Chip>
                  <span style={{ fontSize: "var(--avep-text-2xs)", fontFamily: "var(--avep-font-mono)", color: "hsl(var(--avep-foreground-muted))" }}>{f.id}</span>
                </div>
                <div className="mt-1" style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground))" }}>{f.message}</div>
                <div className="mt-1" style={{ fontSize: "10px", color: "hsl(var(--avep-foreground-subtle))" }}>
                  {f.category} {f.lines.length > 0 && `· L${f.lines.join(", L")}`}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function highlightSv(raw: string): string {
  const esc = raw.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const kw = /\b(module|endmodule|parameter|int|input|output|logic|typedef|enum|always_comb|always_ff|posedge|negedge|begin|end|if|else|unique|case|endcase|default|assign)\b/g;
  const num = /(\b\d+'[bhd][0-9a-fA-F_]+|\b\d+\b)/g;
  return esc
    .replace(kw, '<span style="color:hsl(222 78% 36%);font-weight:600">$1</span>')
    .replace(num, '<span style="color:hsl(194 92% 32%)">$1</span>');
}

function BaselineDiff({ mode, onModeChange }: { mode: string; onModeChange: (m: never) => void; }) {
  const modes = ["Semantic", "Line", "Requirement", "Register", "Interface"];
  const summary = [
    { label: "Lines added",       value: "42", tone: "pass" as const },
    { label: "Lines modified",    value: "17", tone: "warn" as const },
    { label: "Lines removed",     value: "8",  tone: "fail" as const },
    { label: "New assertions",    value: "3",  tone: "ai" as const },
    { label: "Interfaces unchanged", value: "2", tone: "info" as const },
    { label: "Unresolved timing", value: "1",  tone: "warn" as const },
  ];
  return (
    <div className="p-3 flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span style={{ fontSize: "var(--avep-text-xs)", color: "hsl(var(--avep-foreground-muted))" }}>Diff view:</span>
        {modes.map((m) => (
          <button
            key={m}
            onClick={() => onModeChange(m as never)}
            className="px-2 py-1 rounded-md"
            style={{
              fontSize: "var(--avep-text-2xs)",
              fontWeight: 600,
              background: mode === m ? "hsl(var(--avep-primary))" : "hsl(var(--avep-surface-muted))",
              color: mode === m ? "hsl(var(--avep-primary-foreground))" : "hsl(var(--avep-foreground-muted))",
            }}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {summary.map((s) => (
          <div key={s.label} className="rounded p-2" style={{ background: "hsl(var(--avep-surface-muted))" }}>
            <div style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-muted))" }}>{s.label}</div>
            <div className="mt-0.5 font-semibold" style={{ fontSize: "var(--avep-text-lg)", fontFamily: "var(--avep-font-mono)" }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {(["Baseline · rtl_3.2.17 (pre-fix, DEF-DV-219)", "Proposed · 3.2.18-rc1 · feature/descriptor-ring-fix"] as const).map((title, col) => (
          <div key={title} className="rounded-md overflow-hidden" style={{ border }}>
            <div className="px-3 py-1.5 border-b flex items-center justify-between"
                 style={{ borderColor: "hsl(var(--avep-border))", background: col === 0 ? "hsl(var(--avep-surface-muted))" : "hsl(var(--avep-primary-soft))" }}>
              <span className="font-semibold" style={{ fontSize: "var(--avep-text-xs)", fontFamily: "var(--avep-font-mono)" }}>{title}</span>
              <Chip tone={col === 0 ? "fail" : "ai"}>{col === 0 ? "Buggy (>=)" : "Proposal (>)"}</Chip>
            </div>
            <pre className="p-2 overflow-auto" style={{ fontFamily: "var(--avep-font-mono)", fontSize: "10.5px", lineHeight: 1.5, maxHeight: 360 }}>
{col === 0
? `// ddmac_descriptor_validator.sv:214  (baseline rtl_3.2.17)
assign length_error =
    desc_valid &&
    (desc_length >= max_transfer_length);   // DEF-DV-219: inclusive
                                            // rejects legal length == max
// VALIDATE branch:
if (length_error) begin
  err_code_d = 3'b001;
  state_d    = REJECT;
end
// (no privilege check in 3.2.17)`
: `// ddmac_descriptor_validator.sv:214  (proposed 3.2.18-rc1)
assign length_error =
    desc_valid &&
    (desc_length > max_transfer_length);    // REQ-DDMAC-142: strict '>'
                                            // length == max is legal
// VALIDATE branch:
if (length_error) begin
  err_code_d = 3'b001;                      // length violation
  state_d    = REJECT;
end
else if (privilege_error) begin
  err_code_d = 3'b010;                      // + REQ-SEC-088
  state_d    = REJECT;
end`}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}

function GeneratedFiles() {
  return (
    <div className="p-3">
      <table className="w-full" style={{ fontSize: "var(--avep-text-xs)" }}>
        <thead>
          <tr style={{ color: "hsl(var(--avep-foreground-subtle))", textAlign: "left" }}>
            <th className="py-1.5">Path</th><th>Type</th><th className="text-right">Lines</th><th>Status</th><th className="text-right">Findings</th><th className="text-right">Last generated</th>
          </tr>
        </thead>
        <tbody>
          {GENERATED_FILES.map((f) => (
            <tr key={f.path} className="border-t hover:bg-black/[0.02]" style={{ borderColor: "hsl(var(--avep-border))" }}>
              <td className="py-1.5" style={{ fontFamily: "var(--avep-font-mono)" }}>{f.path}</td>
              <td>{f.type}</td>
              <td className="text-right" style={{ fontFamily: "var(--avep-font-mono)" }}>{f.lines}</td>
              <td><Chip tone={f.status === "Generated" ? "pass" : "info"}>{f.status}</Chip></td>
              <td className="text-right" style={{ fontFamily: "var(--avep-font-mono)" }}>{f.findings}</td>
              <td className="text-right" style={{ fontFamily: "var(--avep-font-mono)", color: "hsl(var(--avep-foreground-muted))" }}>12:04:19</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TraceabilityView({ selectedReq }: { selectedReq: string | null }) {
  const chain = [
    { label: selectedReq ?? "REQ-DDMAC-142", kind: "Requirement" },
    { label: "ARCH-FSM-04",   kind: "Architecture" },
    { label: "MAX_XFER_LEN",  kind: "Register" },
    { label: "ddmac_descriptor_validator.sv", kind: "RTL File" },
    { label: "length_error",  kind: "Signal" },
    { label: "ASSERT_DESC_LENGTH_001", kind: "Assertion" },
    { label: "TEST_DESC_OVERSIZE_017", kind: "Test" },
    { label: "COVER_DESC_ERROR_004", kind: "Coverage" },
  ];
  return (
    <div className="p-3 flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <Chip tone="info">Trace filter: {selectedReq ?? "All"}</Chip>
        <Chip tone="pass">Complete</Chip>
        <Chip tone="warn">Missing downstream test</Chip>
        <Chip tone="fail">Broken link</Chip>
        <Chip tone="ai">AI inferred</Chip>
        <Chip tone="neutral">Human confirmed</Chip>
      </div>
      <div className="rounded-md p-3 overflow-x-auto" style={surfaceMuted}>
        <div className="flex items-center gap-2 min-w-max">
          {chain.map((n, i) => (
            <div key={n.label} className="flex items-center gap-2">
              <div className="rounded-md px-2.5 py-1.5" style={{ background: "hsl(var(--avep-surface))", border }}>
                <div style={{ fontSize: "10px", color: "hsl(var(--avep-foreground-subtle))", textTransform: "uppercase", letterSpacing: "var(--avep-tracking-wide)" }}>{n.kind}</div>
                <div className="mt-0.5 font-semibold" style={{ fontFamily: "var(--avep-font-mono)", fontSize: "var(--avep-text-xs)" }}>{n.label}</div>
              </div>
              {i < chain.length - 1 && <ChevronRight className="h-3 w-3 shrink-0" style={{ color: "hsl(var(--avep-foreground-subtle))" }} />}
            </div>
          ))}
        </div>
      </div>
      <table className="w-full" style={{ fontSize: "var(--avep-text-xs)" }}>
        <thead>
          <tr style={{ color: "hsl(var(--avep-foreground-subtle))", textAlign: "left" }}>
            <th className="py-1.5">Requirement</th><th>Coverage</th><th>Assertions</th><th>Tests</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {REQUIREMENTS.map((r) => (
            <tr key={r.id} className="border-t" style={{ borderColor: "hsl(var(--avep-border))" }}>
              <td className="py-1.5" style={{ fontFamily: "var(--avep-font-mono)" }}>{r.id}</td>
              <td>3 objectives</td>
              <td>{r.status === "approved" ? "2 SVA" : "—"}</td>
              <td>{r.status === "approved" ? "4 tests" : "0 tests"}</td>
              <td>
                {r.status === "approved" ? <Chip tone="pass">Traced</Chip> : <Chip tone="warn">Ambiguous</Chip>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AssumptionsTable({
  rows,
  onDispose,
}: {
  rows: Array<{ id: string; text: string; source: string; risk: string; owner: string; disposition: null | "accepted" | "rejected" | "clarify" }>;
  onDispose: (id: string, d: "accepted" | "rejected" | "clarify") => void;
}) {
  return (
    <div className="p-3">
      <table className="w-full" style={{ fontSize: "var(--avep-text-xs)" }}>
        <thead>
          <tr style={{ color: "hsl(var(--avep-foreground-subtle))", textAlign: "left" }}>
            <th className="py-1.5">ID</th><th>Assumption</th><th>Source</th><th>Risk</th><th>Required decision</th><th>Disposition</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => (
            <tr key={a.id} className="border-t align-top" style={{ borderColor: "hsl(var(--avep-border))" }}>
              <td className="py-1.5" style={{ fontFamily: "var(--avep-font-mono)" }}>{a.id}</td>
              <td className="max-w-md">{a.text}</td>
              <td style={{ fontFamily: "var(--avep-font-mono)" }}>{a.source}</td>
              <td><Chip tone={a.risk === "High" ? "fail" : a.risk === "Medium" ? "warn" : "info"}>{a.risk}</Chip></td>
              <td>{a.owner}</td>
              <td>
                {a.disposition ? (
                  <Chip tone={a.disposition === "accepted" ? "pass" : a.disposition === "rejected" ? "fail" : "warn"}>
                    {a.disposition}
                  </Chip>
                ) : (
                  <div className="flex gap-1">
                    <MiniBtn onClick={() => onDispose(a.id, "accepted")}>Accept</MiniBtn>
                    <MiniBtn onClick={() => onDispose(a.id, "clarify")}>Clarify</MiniBtn>
                    <MiniBtn onClick={() => onDispose(a.id, "rejected")} tone="fail">Reject</MiniBtn>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ValidationPlan() {
  const groups: Array<{ title: string; icon: React.ReactNode; tone: "info" | "ai" | "accent" | "pass"; items: string[] }> = [
    { title: "Static checks", icon: <ShieldCheck className="h-3.5 w-3.5" />, tone: "info", items: [
      "Lint (RTL rules v3)", "CDC analysis", "RDC analysis", "Reset analysis", "Synthesis elaboration", "Coding standard compliance",
    ]},
    { title: "Simulation tests", icon: <Play className="h-3.5 w-3.5" />, tone: "accent", items: [
      "Valid descriptor accepted", "Oversized descriptor rejected", "Privileged request rejected without priv",
      "Error asserted within approved timing boundary", "Reset during validation",
      "Consecutive invalid descriptors", "Boundary transfer length", "Maximum parameter width",
    ]},
    { title: "Formal candidates", icon: <Sparkles className="h-3.5 w-3.5" />, tone: "ai", items: [
      "Invalid descriptor never accepted", "Valid descriptor eventually produces accept",
      "Never accepted and rejected simultaneously", "Error code consistent with detected error",
      "Reset returns state machine to IDLE",
    ]},
    { title: "Coverage objectives", icon: <Activity className="h-3.5 w-3.5" />, tone: "pass", items: [
      "All state transitions", "Length boundary values", "Privilege combinations",
      "Reset in each state", "Error code values", "Back-to-back descriptor behavior",
    ]},
  ];
  return (
    <div className="p-3 flex flex-col gap-3">
      <div className="rounded-md px-3 py-2" style={{ background: "hsl(var(--avep-warn-soft))", border: "1px solid hsl(var(--avep-warn) / 0.2)" }}>
        <span className="font-semibold" style={{ fontSize: "var(--avep-text-xs)", color: "hsl(var(--avep-warn))" }}>
          Proposed validation scope — awaiting verification approval
        </span>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {groups.map((g) => (
          <div key={g.title} className="rounded-md" style={surface}>
            <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}>
              <span className="flex items-center gap-1.5 font-semibold" style={{ fontSize: "var(--avep-text-xs)" }}>{g.icon}{g.title}</span>
              <Chip tone={g.tone}>{g.items.length} items</Chip>
            </div>
            <ul className="p-2 flex flex-col gap-1">
              {g.items.map((it) => (
                <li key={it} className="flex items-center justify-between rounded px-2 py-1 hover:bg-black/[0.03]" style={{ fontSize: "var(--avep-text-xs)" }}>
                  <span style={{ color: "hsl(var(--avep-foreground-muted))" }}>{it}</span>
                  <div className="flex gap-1">
                    <MiniBtn onClick={() => {}}>Approve</MiniBtn>
                    <MiniBtn onClick={() => {}} tone="warn">Return</MiniBtn>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function GenerationLog({ rows }: { rows: Array<{ t: string; event: string }> }) {
  return (
    <div className="p-3 flex flex-col gap-3">
      <div className="grid md:grid-cols-4 gap-2 rounded-md p-2" style={surfaceMuted}>
        {[
          ["Model", "avep-rtl-authoring-2.4"],
          ["Skill", "ddmac.rtl.v3"],
          ["Prompt", "prompt.rtl.gen.v18"],
          ["Timestamp", "2026-07-21 12:04:19"],
          ["Input hash", "sha256:9f2c…4e11"],
          ["Output hash", "sha256:a71b…88e2"],
          ["Reviewer", "L. Tran (pending)"],
          ["Reproducible", "Yes"],
        ].map(([k, v]) => (
          <div key={k}>
            <div style={{ fontSize: "10px", color: "hsl(var(--avep-foreground-subtle))", textTransform: "uppercase", letterSpacing: "var(--avep-tracking-wide)" }}>{k}</div>
            <div style={{ fontSize: "var(--avep-text-xs)", fontFamily: "var(--avep-font-mono)" }}>{v}</div>
          </div>
        ))}
      </div>
      <ol className="flex flex-col gap-1">
        {rows.map((r, i) => (
          <li key={i} className="flex items-start gap-2 rounded px-2 py-1" style={{ fontSize: "var(--avep-text-xs)", background: i % 2 ? "transparent" : "hsl(var(--avep-surface-muted))" }}>
            <span style={{ fontFamily: "var(--avep-font-mono)", color: "hsl(var(--avep-foreground-subtle))", minWidth: 70 }}>{r.t}</span>
            <span style={{ color: "hsl(var(--avep-foreground-muted))" }}>{r.event}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ActionBtn({
  children, onClick, icon, tone = "neutral", disabled, title,
}: {
  children: React.ReactNode; onClick: () => void; icon: React.ReactNode;
  tone?: "neutral" | "primary" | "pass" | "fail"; disabled?: boolean; title?: string;
}) {
  const styles: Record<string, React.CSSProperties> = {
    neutral: { background: "hsl(var(--avep-surface))", color: "hsl(var(--avep-foreground))", border: "1px solid hsl(var(--avep-border))" },
    primary: { background: "hsl(var(--avep-primary))", color: "hsl(var(--avep-primary-foreground))" },
    pass:    { background: "hsl(var(--avep-pass))",    color: "#fff" },
    fail:    { background: "hsl(var(--avep-fail-soft))", color: "hsl(var(--avep-fail))", border: "1px solid hsl(var(--avep-fail) / 0.3)" },
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
      style={{ ...styles[tone], fontSize: "var(--avep-text-xs)", fontWeight: 600 }}
    >
      {icon}{children}
    </button>
  );
}

function IconBtn({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <button
      type="button"
      title={title}
      className="h-6 w-6 inline-flex items-center justify-center rounded hover:bg-black/[0.05]"
      style={{ color: "hsl(var(--avep-foreground-muted))" }}
    >
      {children}
    </button>
  );
}

function MiniBtn({ children, onClick, tone = "neutral" }: { children: React.ReactNode; onClick: () => void; tone?: "neutral" | "warn" | "fail" }) {
  const map: Record<string, React.CSSProperties> = {
    neutral: { background: "hsl(var(--avep-surface-muted))", color: "hsl(var(--avep-foreground))" },
    warn:    { background: "hsl(var(--avep-warn-soft))", color: "hsl(var(--avep-warn))" },
    fail:    { background: "hsl(var(--avep-fail-soft))", color: "hsl(var(--avep-fail))" },
  };
  return (
    <button
      onClick={onClick}
      className="rounded px-1.5 py-0.5 hover:opacity-90"
      style={{ ...map[tone], fontSize: "10px", fontWeight: 600 }}
    >
      {children}
    </button>
  );
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: "hsl(220 30% 10% / 0.35)" }} onClick={onClose}>
      <div className="rounded-md w-full max-w-lg p-4" style={surface} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold" style={{ fontSize: "var(--avep-text-md)" }}>{title}</h3>
          <button onClick={onClose} aria-label="Close" className="h-6 w-6 rounded hover:bg-black/[0.05]">
            <XCircle className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
}

function Drawer({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-40" style={{ background: "hsl(220 30% 10% / 0.35)" }} onClick={onClose}>
      <div className="absolute right-0 top-0 h-full w-full max-w-xl p-4 overflow-auto" style={surface} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold" style={{ fontSize: "var(--avep-text-md)" }}>{title}</h3>
          <button onClick={onClose} aria-label="Close" className="h-6 w-6 rounded hover:bg-black/[0.05]">
            <XCircle className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}

function GuidedOverlay({ step, onNext, onClose }: { step: number; onNext: () => void; onClose: () => void }) {
  const steps = [
    { title: "Step 1 — Confirm Controlled Context",     text: "Generation begins only after the engineering context is locked to the correct IP, revision, branch, and approved source baseline." },
    { title: "Step 2 — Inspect Approved Inputs",        text: "The proposal is grounded in controlled engineering sources rather than an isolated natural language prompt." },
    { title: "Step 3 — Review Generated RTL",           text: "Every material RTL construct is linked to its originating engineering intent." },
    { title: "Step 4 — Expose Uncertainty",             text: "AI explicitly identifies ambiguity rather than silently converting it into implementation behavior." },
    { title: "Step 5 — Compare with Baseline",          text: "Reviewers can distinguish new logic, inferred behavior, reused patterns, and baseline changes." },
    { title: "Step 6 — Review Validation Scope",        text: "Generated RTL is accompanied by a proportionate static, simulation, formal, and coverage plan." },
    { title: "Step 7 — Preserve Human Authority",       text: "The RTL design lead and designated reviewers retain authority to modify, reject, or accept the proposal for validation." },
  ];
  const s = steps[Math.min(step - 1, steps.length - 1)];
  return (
    <div className="fixed bottom-20 right-4 z-40 rounded-md p-3 max-w-sm shadow-lg" style={{ ...surface, border: "1px solid hsl(var(--avep-ai) / 0.4)" }}>
      <div className="flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5" style={{ color: "hsl(var(--avep-ai))" }} />
        <span className="font-semibold" style={{ fontSize: "var(--avep-text-sm)" }}>{s.title}</span>
      </div>
      <p className="mt-1.5" style={{ fontSize: "var(--avep-text-xs)", color: "hsl(var(--avep-foreground-muted))" }}>{s.text}</p>
      <div className="mt-2 flex items-center justify-between">
        <span style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>Step {Math.min(step, 7)} of 7</span>
        <div className="flex gap-1">
          <MiniBtn onClick={onClose}>Exit</MiniBtn>
          <button
            onClick={step >= 7 ? onClose : onNext}
            className="rounded px-2 py-0.5"
            style={{ background: "hsl(var(--avep-ai))", color: "hsl(var(--avep-ai-foreground))", fontSize: "10px", fontWeight: 700 }}
          >
            {step >= 7 ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
