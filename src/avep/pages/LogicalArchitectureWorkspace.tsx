import { useEffect, useMemo, useRef, useState } from "react";
import {
  Cpu, Sparkles, ShieldCheck, Download, Search, ChevronRight, ChevronDown,
  AlertTriangle, CheckCircle2, XCircle, Activity, Layers, Radio, Zap,
  Boxes, FolderTree, BadgeCheck, ArrowRight, Wand2, Link2, Clock, RefreshCw,
  Send, Lock, GitBranch, HardDrive, X,
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

function Btn({
  children, variant = "ghost", onClick, icon: Icon, title,
}: {
  children: React.ReactNode; variant?: "primary" | "ghost" | "soft" | "ai";
  onClick?: () => void; icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>; title?: string;
}) {
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

function Section({
  title, icon: Icon, subtitle, right, children,
}: {
  title: string; icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  subtitle?: string; right?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div style={card}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}>
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4" style={{ color: "hsl(var(--avep-primary))" }} />}
          <div>
            <div style={{ fontSize: "var(--avep-text-sm)", fontWeight: 600, color: "hsl(var(--avep-foreground))" }}>{title}</div>
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

type Block = {
  id: string;
  name: string;
  role: string;
  clock: string;
  reset: string;
  security: "Secure" | "NonSecure" | "Mixed";
  privilege: "User" | "Supervisor" | "Machine";
  status: "Validated" | "Draft" | "Review";
  requirements: string[];
  x: number; y: number; w: number; h: number;
  color: string;
};

const BLOCKS: Block[] = [
  { id: "b-dma-sched",  name: "DMA Scheduler",         role: "Arbitration & QoS",       clock: "DMA_CLK", reset: "DMA Reset",    security: "Secure",    privilege: "Supervisor", status: "Validated", requirements: ["REQ-1021","REQ-1044"], x:  40, y:  60, w: 160, h: 72, color: "222 78% 36%" },
  { id: "b-desc",       name: "Descriptor Engine",     role: "Descriptor fetch/parse",  clock: "ACLK",    reset: "DMA Reset",    security: "Secure",    privilege: "Supervisor", status: "Validated", requirements: ["REQ-1021","REQ-1082"], x: 240, y:  60, w: 170, h: 72, color: "222 78% 36%" },
  { id: "b-axi",        name: "AXI Master",            role: "AXI4 outbound bus",       clock: "ACLK",    reset: "Global Reset", security: "Secure",    privilege: "Machine",    status: "Validated", requirements: ["REQ-1105"],           x: 450, y:  60, w: 150, h: 72, color: "194 92% 34%" },
  { id: "b-mem",        name: "Memory Manager",        role: "Bus master → DDR",        clock: "ACLK",    reset: "Global Reset", security: "Secure",    privilege: "Machine",    status: "Review",    requirements: ["REQ-1110"],           x: 640, y:  60, w: 160, h: 72, color: "194 92% 34%" },
  { id: "b-irq",        name: "Interrupt Controller",  role: "Coalescing & routing",    clock: "PCLK",    reset: "Global Reset", security: "NonSecure", privilege: "Supervisor", status: "Validated", requirements: ["REQ-1150","REQ-1151"], x: 840, y:  60, w: 170, h: 72, color: "222 78% 36%" },

  { id: "b-security",   name: "Security Engine",       role: "Privilege & isolation",   clock: "ACLK",    reset: "Global Reset", security: "Secure",    privilege: "Machine",    status: "Validated", requirements: ["REQ-1220"],           x:  40, y: 180, w: 160, h: 72, color: "268 78% 45%" },
  { id: "b-reg",        name: "Register Controller",   role: "APB CSR",                 clock: "PCLK",    reset: "Global Reset", security: "Mixed",     privilege: "Supervisor", status: "Validated", requirements: ["REQ-1300"],           x: 240, y: 180, w: 170, h: 72, color: "222 78% 36%" },
  { id: "b-clk",        name: "Clock Controller",      role: "Gate/divide/CDC",         clock: "ACLK",    reset: "Global Reset", security: "Secure",    privilege: "Machine",    status: "Validated", requirements: ["REQ-1400"],           x: 450, y: 180, w: 150, h: 72, color: "194 92% 34%" },
  { id: "b-rst",        name: "Reset Controller",      role: "Async reset synth",       clock: "ACLK",    reset: "Global Reset", security: "Secure",    privilege: "Machine",    status: "Draft",     requirements: ["REQ-1410"],           x: 640, y: 180, w: 160, h: 72, color: "194 92% 34%" },
  { id: "b-ecc",        name: "ECC Controller",        role: "SECDED ECC",              clock: "ACLK",    reset: "DMA Reset",    security: "Secure",    privilege: "Machine",    status: "Validated", requirements: ["REQ-1520"],           x: 840, y: 180, w: 170, h: 72, color: "268 78% 45%" },

  { id: "b-config",     name: "Configuration Manager", role: "Boot/param load",         clock: "PCLK",    reset: "Global Reset", security: "Mixed",     privilege: "Supervisor", status: "Review",    requirements: ["REQ-1620"],           x: 140, y: 300, w: 180, h: 72, color: "222 78% 36%" },
  { id: "b-pwr",        name: "Power Controller",      role: "PMU handshake",           clock: "PCLK",    reset: "Global Reset", security: "Secure",    privilege: "Machine",    status: "Draft",     requirements: ["REQ-1710"],           x: 360, y: 300, w: 170, h: 72, color: "194 92% 34%" },
];

type EdgeKind = "AXI" | "APB" | "Interrupt" | "Clock" | "Reset" | "DMA" | "Config" | "Data";
const EDGE_COLOR: Record<EdgeKind, string> = {
  AXI:       "222 78% 46%",
  APB:       "194 92% 40%",
  Interrupt: "0 78% 55%",
  Clock:     "268 78% 55%",
  Reset:     "35 92% 52%",
  DMA:       "222 78% 36%",
  Config:    "220 12% 45%",
  Data:      "142 65% 42%",
};

type Conn = { from: string; to: string; kind: EdgeKind; bw?: string; latency?: string };
const CONNS: Conn[] = [
  { from: "b-desc",     to: "b-dma-sched", kind: "DMA",       bw: "32 GB/s", latency: "3 clk" },
  { from: "b-dma-sched",to: "b-axi",       kind: "AXI",       bw: "32 GB/s", latency: "1 clk" },
  { from: "b-axi",      to: "b-mem",       kind: "AXI",       bw: "32 GB/s", latency: "12 clk" },
  { from: "b-mem",      to: "b-irq",       kind: "Interrupt", bw: "—",       latency: "2 clk" },
  { from: "b-reg",      to: "b-dma-sched", kind: "Config",    bw: "—",       latency: "1 clk" },
  { from: "b-reg",      to: "b-irq",       kind: "Config",    bw: "—",       latency: "1 clk" },
  { from: "b-security", to: "b-dma-sched", kind: "Config",    bw: "—",       latency: "1 clk" },
  { from: "b-clk",      to: "b-desc",      kind: "Clock" },
  { from: "b-clk",      to: "b-axi",       kind: "Clock" },
  { from: "b-clk",      to: "b-mem",       kind: "Clock" },
  { from: "b-rst",      to: "b-dma-sched", kind: "Reset" },
  { from: "b-rst",      to: "b-desc",      kind: "Reset" },
  { from: "b-ecc",      to: "b-mem",       kind: "Data",      bw: "32 GB/s", latency: "1 clk" },
  { from: "b-config",   to: "b-reg",       kind: "Config" },
  { from: "b-pwr",      to: "b-clk",       kind: "Config" },
];

const INTERFACES = [
  { id: "AXI-M0",  proto: "AXI4",     clk: "ACLK", rst: "ARESETN",  sec: "Secure",    owner: "L. Tran",    status: "Validated", bw: "32 GB/s", src: "AXI Master",       dst: "Memory Manager" },
  { id: "AXI-M1",  proto: "AXI4",     clk: "ACLK", rst: "ARESETN",  sec: "Secure",    owner: "H. Tanaka",  status: "Validated", bw: "16 GB/s", src: "Descriptor Engine",dst: "AXI Master" },
  { id: "APB-CFG", proto: "APB",      clk: "PCLK", rst: "PRESETN",  sec: "Mixed",     owner: "B. Cohen",   status: "Validated", bw: "128 MB/s",src: "Register Controller", dst: "DMA Scheduler" },
  { id: "IRQ-BUS", proto: "Custom",   clk: "PCLK", rst: "PRESETN",  sec: "NonSecure", owner: "H. Tanaka",  status: "Validated", bw: "—",       src: "Interrupt Ctrl",   dst: "SoC IRQ" },
  { id: "CDC-01",  proto: "Handshake",clk: "cross",rst: "async",    sec: "Secure",    owner: "L. Tran",    status: "Warning",   bw: "—",       src: "PCLK domain",      dst: "ACLK domain" },
  { id: "ECC-BUS", proto: "Custom",   clk: "ACLK", rst: "ARESETN",  sec: "Secure",    owner: "D. Okafor",  status: "Validated", bw: "32 GB/s", src: "ECC Controller",   dst: "Memory Manager" },
];

const REGISTERS = [
  { name: "DMA_CTRL",     addr: "0x0000", w: 32, reset: "0x00000000", priv: "Supervisor", access: "RW",  owner: "L. Tran",   status: "Validated", fields: 6,
    detail: [{ name: "EN", bits: "[0]", access: "RW", reset: "0" }, { name: "SOFT_RST", bits: "[1]", access: "W1C", reset: "0" }, { name: "MODE", bits: "[7:4]", access: "RW", reset: "0x0" }] },
  { name: "DMA_STATUS",   addr: "0x0004", w: 32, reset: "0x00000001", priv: "Supervisor", access: "RO",  owner: "L. Tran",   status: "Validated", fields: 5, detail: [] },
  { name: "IRQ_MASK",     addr: "0x0300", w: 32, reset: "0xFFFFFFFF", priv: "Supervisor", access: "RW",  owner: "H. Tanaka", status: "Validated", fields: 32, detail: [] },
  { name: "IRQ_STATUS",   addr: "0x0304", w: 32, reset: "0x00000000", priv: "Supervisor", access: "W1C", priv2: "", owner: "H. Tanaka", status: "Warning",  fields: 32, detail: [] },
  { name: "RING_BASE",    addr: "0x0100", w: 64, reset: "0x00000000", priv: "Machine",    access: "RW",  owner: "B. Cohen",  status: "Validated", fields: 1, detail: [] },
  { name: "RING_HEAD",    addr: "0x0108", w: 32, reset: "0x00000000", priv: "Supervisor", access: "RW",  owner: "B. Cohen",  status: "Validated", fields: 1, detail: [] },
  { name: "RING_TAIL",    addr: "0x010C", w: 32, reset: "0x00000000", priv: "Supervisor", access: "RO",  owner: "B. Cohen",  status: "Validated", fields: 1, detail: [] },
  { name: "CMPL_THRESH",  addr: "0x0200", w: 32, reset: "0x00000020", priv: "Supervisor", access: "RW",  owner: "D. Okafor", status: "Validated", fields: 2, detail: [] },
  { name: "SEC_CFG",      addr: "0x0400", w: 32, reset: "0x00000000", priv: "Machine",    access: "RW",  owner: "P. Nair",   status: "Conflict",  fields: 4, detail: [] },
] as const;

const FINDINGS = [
  { kind: "Missing Register",    tone: "warn" as const, title: "SEC_CFG is referenced by Security Engine but not exposed on APB",  detail: "Add SEC_CFG mirror at 0x0404 to allow supervisor read of active security profile." },
  { kind: "Clock Crossing",      tone: "warn" as const, title: "PCLK → ACLK unsafe handshake on CDC-01", detail: "Insert 2-flop synchronizer + gray-coded pointer between Register Controller and DMA Scheduler." },
  { kind: "Reset Inconsistency", tone: "err"  as const, title: "Reset Controller drains DMA before Descriptor Engine",  detail: "Sequence DMA Reset after Descriptor Engine drain to avoid stale outstanding beats." },
  { kind: "Privilege Violation", tone: "err"  as const, title: "IRQ_STATUS writable at Supervisor",     detail: "Restrict to W1C at Machine mode to prevent forged completions." },
  { kind: "Undefined Interface", tone: "warn" as const, title: "ECC-BUS has no error escalation path",  detail: "Route uncorrectable ECC to Interrupt Controller sideband." },
  { kind: "Register Conflict",   tone: "err"  as const, title: "SEC_CFG and DMA_CTRL both claim reset 0x0000_0000 at overlapping mask",  detail: "Reassign SEC_CFG.MODE field bits [15:12]." },
];

const CLOCK_DOMAINS = [
  { name: "ACLK",    freq: "800 MHz", blocks: 6, color: "222 78% 46%" },
  { name: "PCLK",    freq: "200 MHz", blocks: 3, color: "194 92% 40%" },
  { name: "DMA_CLK", freq: "600 MHz", blocks: 2, color: "268 78% 55%" },
];
const RESET_DOMAINS = [
  { name: "Global Reset", scope: "Full IP",       blocks: 7, color: "35 92% 52%" },
  { name: "DMA Reset",    scope: "DMA subsystem", blocks: 3, color: "0 78% 55%" },
  { name: "Local Reset",  scope: "CSR mirrors",   blocks: 2, color: "142 65% 42%" },
];

const APPROVERS = [
  { role: "IP Architect",                        who: "Linh Tran",    status: "Approved", ts: "2h ago" },
  { role: "Hardware/Software Interface Lead",    who: "Hiro Tanaka",  status: "Pending",  ts: "—" },
  { role: "Verification Lead",                   who: "Priya Nair",   status: "Approved", ts: "5h ago" },
  { role: "Security Architect",                  who: "Diane Okafor", status: "Approved", ts: "1d ago" },
  { role: "Firmware Lead",                       who: "Marco Rossi",  status: "Pending",  ts: "—" },
];

const HW_SW_CONTRACTS = [
  { title: "Firmware API",           note: "24 exported functions, v2.4",              linked: "Register Controller" },
  { title: "Interrupt Mapping",      note: "32 vectors, MSI-X aware",                  linked: "Interrupt Controller" },
  { title: "DMA Descriptor Format",  note: "128-bit, seq_tag + priv_bit",              linked: "Descriptor Engine" },
  { title: "Memory Layout",          note: "4 KiB pages, guard band 256 B",            linked: "Memory Manager" },
  { title: "Register Access Model",  note: "APB, atomic RMW via SEC_CFG.MODE",         linked: "Register Controller" },
  { title: "Version Compatibility",  note: "v2.3 → v2.4 backward, v2.5 breaking",      linked: "Configuration Manager" },
];

/* --------------------------- explorer tree data --------------------------- */

const TREE = {
  name: "Program · NGEN-24",
  children: [{
    name: "SoC · PANW-Edge",
    children: [{
      name: "DDMAC IP · v2.4",
      children: BLOCKS.map((b) => ({ name: b.name, blockId: b.id })),
    }],
  }],
};

/* ================================ PAGE ================================== */

export default function LogicalArchitectureWorkspace() {
  const [selected, setSelected] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<number | null>(null);
  const [inspector, setInspector] = useState<string | null>(null);
  const [expandedReg, setExpandedReg] = useState<string | null>(null);
  const [treeQuery, setTreeQuery] = useState("");
  const [genState, setGenState] = useState<"idle"|"running"|"done">("idle");

  // Animated KPI counters
  const kpis = useAnimatedKpis({ blocks: 18, interfaces: 46, registers: 212, health: 98.6 });

  const filteredBlocks = useMemo(
    () => BLOCKS.filter((b) => !treeQuery || b.name.toLowerCase().includes(treeQuery.toLowerCase())),
    [treeQuery],
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Badge tone="info"><Cpu className="h-3 w-3" /> AVEP.040</Badge>
            <Badge tone="ai"><Sparkles className="h-3 w-3" /> AI Architecture Copilot</Badge>
            <Badge tone="accent"><GitBranch className="h-3 w-3" /> feat/ddmac-v2.4</Badge>
          </div>
          <h1 style={{ fontSize: "var(--avep-text-3xl)", fontWeight: 700, letterSpacing: "var(--avep-tracking-tight)", color: "hsl(var(--avep-foreground))", marginTop: 6 }}>
            Logical Architecture Workspace
          </h1>
          <p style={{ fontSize: "var(--avep-text-sm)", color: "hsl(var(--avep-foreground-muted))", maxWidth: 900, marginTop: 4 }}>
            Model logical components, interfaces, registers, clock/reset domains, and hardware/software contracts while
            maintaining architectural consistency across the DDMAC IP.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Btn icon={Wand2} variant="ai" onClick={() => { setGenState("running"); setTimeout(() => setGenState("done"), 1600); }}>
            {genState === "running" ? "Generating…" : "Generate Architecture"}
          </Btn>
          <Btn icon={Link2}>Validate Interfaces</Btn>
          <Btn icon={Layers}>Validate Register Model</Btn>
          <Btn icon={RefreshCw}>Synchronize Architecture</Btn>
          <Btn icon={Send} variant="primary">Submit for Approval</Btn>
        </div>
      </div>

      {/* Workflow strip */}
      <WorkflowStrip current="Logical Architecture" />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Logical Blocks"    value={kpis.blocks}     suffix=""  icon={Boxes}       tone="info" />
        <Kpi label="Interfaces"        value={kpis.interfaces} suffix=""  icon={Link2}       tone="accent" />
        <Kpi label="Registers"         value={kpis.registers}  suffix=""  icon={Layers}      tone="ai" />
        <Kpi label="Architecture Health" value={kpis.health}   suffix="%" icon={Activity}    tone="ok" precision={1} />
      </div>

      {/* Main 3-col */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "minmax(240px, 300px) 1fr minmax(280px, 340px)" }}>
        {/* LEFT */}
        <div className="flex flex-col gap-3">
          <Section title="Architecture Explorer" icon={FolderTree} subtitle="Program → SoC → DDMAC IP">
            <div className="relative mb-2">
              <Search className="h-3.5 w-3.5 absolute left-2 top-1/2 -translate-y-1/2" style={{ color: "hsl(var(--avep-foreground-subtle))" }} />
              <input value={treeQuery} onChange={(e) => setTreeQuery(e.target.value)} placeholder="Search blocks…"
                className="w-full pl-7 pr-2 h-8 rounded-md outline-none"
                style={{ background: "hsl(var(--avep-surface-muted))", border: "1px solid hsl(var(--avep-border))", fontSize: "var(--avep-text-sm)" }} />
            </div>
            <Tree
              node={TREE}
              filteredBlockIds={new Set(filteredBlocks.map((b) => b.id))}
              onPick={(id) => setSelected(id)}
              selected={selected}
            />
          </Section>

          <Section title="Requirements Allocation" icon={CheckCircle2} subtitle="186 of 194 allocated">
            <div className="flex items-center justify-between mb-2">
              <span style={label2xs}>Requirement → Block → %</span>
              <Badge tone="warn">8 unallocated</Badge>
            </div>
            <ul className="flex flex-col gap-1">
              {[
                { r: "REQ-1021", b: "Descriptor Engine",     pct: 100, tone: "ok" as const },
                { r: "REQ-1044", b: "DMA Scheduler",         pct: 100, tone: "ok" as const },
                { r: "REQ-1105", b: "AXI Master",            pct: 100, tone: "ok" as const },
                { r: "REQ-1150", b: "Interrupt Controller",  pct: 100, tone: "ok" as const },
                { r: "REQ-1220", b: "Security Engine",       pct: 100, tone: "ok" as const },
                { r: "REQ-1300", b: "Register Controller",   pct:  80, tone: "warn" as const },
                { r: "REQ-1520", b: "ECC Controller",        pct: 100, tone: "ok" as const },
                { r: "REQ-1710", b: "Power Controller",      pct:  60, tone: "warn" as const },
                { r: "REQ-1822", b: "—",                     pct:   0, tone: "err" as const },
              ].map((row) => (
                <li key={row.r} className="flex items-center justify-between text-[13px] px-2 py-1.5 rounded" style={{ background: row.tone === "err" ? "hsl(0 90% 97%)" : "transparent" }}>
                  <span style={{ fontFamily: "var(--avep-font-mono)", color: "hsl(var(--avep-foreground))" }}>{row.r}</span>
                  <span style={{ color: "hsl(var(--avep-foreground-muted))" }} className="truncate max-w-[110px]">{row.b}</span>
                  <Badge tone={row.tone}>{row.pct}%</Badge>
                </li>
              ))}
            </ul>
          </Section>
        </div>

        {/* CENTER */}
        <div className="flex flex-col gap-3">
          <Section
            title="Interactive Architecture Canvas"
            icon={Cpu}
            subtitle="Double-click a block to open Architecture Inspector"
            right={<LegendChips />}
          >
            <ArchitectureCanvas
              selected={selected}
              onSelect={setSelected}
              onOpen={(id) => setInspector(id)}
              hoveredEdge={hoveredEdge}
              setHoveredEdge={setHoveredEdge}
            />
          </Section>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            <Section title="Interface Contracts" icon={Link2} subtitle="46 interfaces · 4 findings">
              <InterfaceTable />
            </Section>
            <Section title="Clock & Reset Domain Viewer" icon={Radio} subtitle="14 clock · 8 reset domains">
              <ClockResetViewer />
            </Section>
          </div>

          <Section title="Register Definition" icon={Layers} subtitle="212 registers · 896 fields">
            <RegisterTable expandedReg={expandedReg} setExpandedReg={setExpandedReg} />
          </Section>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            <Section title="Register Map" icon={HardDrive} subtitle="0x0000 → 0x0FFF">
              <RegisterMap />
            </Section>
            <Section title="Register Semantics" icon={ShieldCheck} subtitle="AI-validated register policy">
              <RegisterSemantics />
            </Section>
          </div>

          <Section title="Requirement Mapping" icon={ArrowRight} subtitle="Requirement → Block → Interface → Register → RTL → Verification">
            <RequirementSankey />
          </Section>

          <Section title="Interface Consistency Checker" icon={CheckCircle2} subtitle="Bidirectional protocol reconciliation">
            <InterfaceChecker />
          </Section>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            <Section title="Hardware / Software Contracts" icon={Layers}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {HW_SW_CONTRACTS.map((c) => (
                  <div key={c.title} className="p-3 rounded-md" style={{ background: "hsl(var(--avep-surface-muted))", border: "1px solid hsl(var(--avep-border))" }}>
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: "var(--avep-text-sm)", fontWeight: 600 }}>{c.title}</span>
                      <Badge tone="info">v2.4</Badge>
                    </div>
                    <div style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-muted))", marginTop: 4 }}>{c.note}</div>
                    <div style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-primary))", marginTop: 6 }}>
                      Linked → {c.linked}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="AI Dependency Analysis" icon={Sparkles} subtitle="Cross-cutting engineering dependencies">
              <DependencyList />
            </Section>
          </div>

          <Section title="Architecture Version Timeline" icon={Clock} subtitle="Requirement Allocation → RTL Ready">
            <VersionTimeline />
          </Section>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-3">
          <Section title="Architecture Health" icon={Activity} subtitle="Overall 98.6%">
            <HealthGauge value={98.6} />
            <div className="mt-3 flex flex-col gap-1.5">
              {[
                { l: "Requirements Allocation", v: 96, tone: "ok" as const },
                { l: "Interface Consistency",   v: 98, tone: "ok" as const },
                { l: "Register Synchronization",v: 97, tone: "ok" as const },
                { l: "Clock Domains",           v: 92, tone: "warn" as const },
                { l: "Reset Domains",           v: 94, tone: "warn" as const },
                { l: "Security",                v: 99, tone: "ok" as const },
                { l: "Privilege",               v: 95, tone: "ok" as const },
                { l: "Isolation",               v: 100,tone: "ok" as const },
                { l: "Error Handling",          v: 93, tone: "warn" as const },
              ].map((r) => (
                <div key={r.l} className="flex items-center gap-2" title={`${r.l} — AI-scored across allocated requirements`}>
                  <div className="flex-1">
                    <div className="flex justify-between" style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-muted))" }}>
                      <span>{r.l}</span><span>{r.v}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--avep-surface-muted))" }}>
                      <div className="h-full" style={{ width: `${r.v}%`, background: `hsl(${toneMap[r.tone].dot})`, transition: "width 800ms ease" }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="AI Architecture Findings" icon={Sparkles} subtitle="8 findings · 3 critical">
            <ul className="flex flex-col gap-2">
              {FINDINGS.map((f, i) => (
                <li key={i} className="p-2.5 rounded-md hover:shadow-sm transition-shadow" style={{ background: toneMap[f.tone].bg, border: `1px solid hsl(${toneMap[f.tone].dot} / 0.25)` }} title={f.detail}>
                  <div className="flex items-center gap-1.5">
                    {f.tone === "err" ? <XCircle className="h-3.5 w-3.5" style={{ color: toneMap.err.fg }} /> : <AlertTriangle className="h-3.5 w-3.5" style={{ color: toneMap.warn.fg }} />}
                    <span style={{ fontSize: "var(--avep-text-2xs)", fontWeight: 700, color: toneMap[f.tone].fg, letterSpacing: "var(--avep-tracking-wide)", textTransform: "uppercase" }}>{f.kind}</span>
                  </div>
                  <div style={{ fontSize: "var(--avep-text-sm)", fontWeight: 500, color: "hsl(var(--avep-foreground))", marginTop: 4 }}>{f.title}</div>
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
          </Section>

          <Section title="AI Recommendations" icon={Sparkles} subtitle="With engineering rationale">
            <Recommendations />
          </Section>
        </div>
      </div>

      {inspector && (
        <ArchitectureInspector blockId={inspector} onClose={() => setInspector(null)} />
      )}
    </div>
  );
}

/* ============================== Sub-components =========================== */

function Users(props: React.SVGProps<SVGSVGElement>) {
  return <BadgeCheck {...props} />; // safe fallback: reuse existing lucide
}

function useAnimatedKpis(target: { blocks: number; interfaces: number; registers: number; health: number }) {
  const [v, setV] = useState({ blocks: 0, interfaces: 0, registers: 0, health: 0 });
  useEffect(() => {
    const start = performance.now();
    const dur = 900;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setV({
        blocks: Math.round(target.blocks * e),
        interfaces: Math.round(target.interfaces * e),
        registers: Math.round(target.registers * e),
        health: +(target.health * e).toFixed(1),
      });
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target.blocks, target.interfaces, target.registers, target.health]);
  return v;
}

function Kpi({ label, value, suffix, icon: Icon, tone, precision = 0 }: { label: string; value: number; suffix: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; tone: Tone; precision?: number }) {
  const s = toneMap[tone];
  return (
    <div className="p-4" style={card} title={`${label} — synchronized from architecture graph`}>
      <div className="flex items-center justify-between">
        <span style={label2xs}>{label}</span>
        <span className="h-7 w-7 grid place-items-center rounded-md" style={{ background: s.bg, color: s.fg }}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span style={{ fontSize: "var(--avep-text-3xl)", fontWeight: 700, letterSpacing: "var(--avep-tracking-tight)", color: "hsl(var(--avep-foreground))" }}>
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
    "Engineering Traceability", "Logical Architecture", "RTL Generation",
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
                  fontSize: "var(--avep-text-xs)",
                  fontWeight: active ? 700 : 500,
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

function Tree({ node, onPick, selected, filteredBlockIds, depth = 0 }: { node: any; onPick: (id: string) => void; selected: string | null; filteredBlockIds: Set<string>; depth?: number }) {
  const [open, setOpen] = useState(true);
  const hasChildren = !!node.children?.length;
  const isBlock = !!node.blockId;
  if (isBlock && !filteredBlockIds.has(node.blockId)) return null;
  return (
    <div>
      <div
        className={`flex items-center gap-1 py-1 pr-1 rounded cursor-pointer ${selected === node.blockId ? "font-semibold" : ""}`}
        style={{
          paddingLeft: 4 + depth * 12,
          background: selected === node.blockId ? "hsl(var(--avep-primary-soft))" : "transparent",
          color: selected === node.blockId ? "hsl(var(--avep-primary))" : "hsl(var(--avep-foreground))",
          fontSize: "var(--avep-text-sm)",
        }}
        onClick={() => { if (isBlock) onPick(node.blockId); else setOpen((o) => !o); }}
        title={isBlock ? `Block · click to focus` : ""}
      >
        {hasChildren ? (open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />) : <span className="h-3.5 w-3.5" />}
        {isBlock ? <Boxes className="h-3.5 w-3.5" style={{ color: "hsl(var(--avep-accent))" }} /> : <FolderTree className="h-3.5 w-3.5" style={{ color: "hsl(var(--avep-foreground-subtle))" }} />}
        <span className="truncate">{node.name}</span>
      </div>
      {hasChildren && open && (
        <div>
          {node.children.map((c: any, i: number) => (
            <Tree key={i} node={c} onPick={onPick} selected={selected} filteredBlockIds={filteredBlockIds} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function LegendChips() {
  const items: { k: EdgeKind; l: string }[] = [
    { k: "AXI", l: "AXI" }, { k: "APB", l: "APB" }, { k: "Interrupt", l: "IRQ" },
    { k: "Clock", l: "Clock" }, { k: "Reset", l: "Reset" }, { k: "Config", l: "Config" }, { k: "Data", l: "Data" },
  ];
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((i) => (
        <span key={i.k} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded"
          style={{ background: "hsl(var(--avep-surface-muted))", fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-muted))" }}>
          <span className="h-2 w-4 rounded-sm" style={{ background: `hsl(${EDGE_COLOR[i.k]})` }} />
          {i.l}
        </span>
      ))}
    </div>
  );
}

/* ------------------------- Architecture Canvas SVG ------------------------ */

function ArchitectureCanvas({
  selected, onSelect, onOpen, hoveredEdge, setHoveredEdge,
}: {
  selected: string | null; onSelect: (id: string) => void; onOpen: (id: string) => void;
  hoveredEdge: number | null; setHoveredEdge: (n: number | null) => void;
}) {
  const [tip, setTip] = useState<{ x: number; y: number; kind: string; bw?: string; latency?: string } | null>(null);
  const [drawn, setDrawn] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setDrawn((d) => (d >= BLOCKS.length + CONNS.length ? d : d + 1)), 40);
    return () => clearInterval(id);
  }, []);
  const anchor = (b: Block, side: "l" | "r" | "t" | "b") => {
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    if (side === "l") return { x: b.x, y: cy };
    if (side === "r") return { x: b.x + b.w, y: cy };
    if (side === "t") return { x: cx, y: b.y };
    return { x: cx, y: b.y + b.h };
  };
  const sideFor = (a: Block, b: Block): "l"|"r"|"t"|"b" => {
    if (Math.abs(a.y - b.y) < 40) return a.x < b.x ? "r" : "l";
    return a.y < b.y ? "b" : "t";
  };

  return (
    <div className="relative rounded-md" style={{ background: "linear-gradient(180deg, hsl(210 30% 99%), hsl(214 24% 96%))", border: "1px solid hsl(var(--avep-border))", overflow: "hidden" }}>
      <svg viewBox="0 0 1060 400" width="100%" height="440" role="img" aria-label="Interactive logical architecture diagram">
        <defs>
          {Object.entries(EDGE_COLOR).map(([k, c]) => (
            <marker key={k} id={`arrow-${k}`} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill={`hsl(${c})`} />
            </marker>
          ))}
          <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="hsl(214 24% 92%)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="1060" height="400" fill="url(#grid)" />

        {/* Clock domain overlays */}
        <rect x="20" y="42" width="820" height="108" rx="8" fill="hsl(222 78% 46% / 0.04)" stroke="hsl(222 78% 46% / 0.25)" strokeDasharray="4 4" />
        <text x="30" y="56" fontSize="10" fill="hsl(222 78% 46%)" fontFamily="var(--avep-font-mono)">ACLK domain · 800MHz</text>

        <rect x="220" y="162" width="200" height="108" rx="8" fill="hsl(194 92% 40% / 0.04)" stroke="hsl(194 92% 40% / 0.25)" strokeDasharray="4 4" />
        <text x="230" y="176" fontSize="10" fill="hsl(194 92% 40%)" fontFamily="var(--avep-font-mono)">PCLK domain · 200MHz</text>

        {/* Edges */}
        {CONNS.map((c, i) => {
          const a = BLOCKS.find((b) => b.id === c.from)!;
          const b = BLOCKS.find((bb) => bb.id === c.to)!;
          const s1 = sideFor(a, b), s2 = sideFor(b, a);
          const p1 = anchor(a, s1), p2 = anchor(b, s2);
          const mx = (p1.x + p2.x) / 2;
          const d = `M ${p1.x} ${p1.y} C ${mx} ${p1.y}, ${mx} ${p2.y}, ${p2.x} ${p2.y}`;
          const color = EDGE_COLOR[c.kind];
          const isHi = hoveredEdge === i;
          const visible = drawn >= BLOCKS.length + i;
          return (
            <g key={i} opacity={visible ? 1 : 0} style={{ transition: "opacity 300ms" }}>
              <path
                d={d}
                fill="none"
                stroke={`hsl(${color})`}
                strokeWidth={isHi ? 3 : 1.5}
                strokeDasharray={c.kind === "Clock" || c.kind === "Reset" ? "4 3" : undefined}
                markerEnd={`url(#arrow-${c.kind})`}
                onMouseEnter={(e) => { setHoveredEdge(i); setTip({ x: (e as any).nativeEvent.offsetX, y: (e as any).nativeEvent.offsetY, kind: c.kind, bw: c.bw, latency: c.latency }); }}
                onMouseLeave={() => { setHoveredEdge(null); setTip(null); }}
                style={{ cursor: "pointer" }}
              />
              {c.kind === "AXI" && (
                <circle r="3" fill={`hsl(${color})`}>
                  <animateMotion dur="3.2s" repeatCount="indefinite" path={d} />
                </circle>
              )}
              {c.kind === "DMA" && (
                <circle r="3" fill={`hsl(${color})`}>
                  <animateMotion dur="2.6s" repeatCount="indefinite" path={d} />
                </circle>
              )}
            </g>
          );
        })}

        {/* Blocks */}
        {BLOCKS.map((b, i) => {
          const visible = drawn >= i;
          const isSel = selected === b.id;
          return (
            <g key={b.id} opacity={visible ? 1 : 0}
              onClick={() => onSelect(b.id)}
              onDoubleClick={() => onOpen(b.id)}
              onKeyDown={(e) => e.key === "Enter" && onOpen(b.id)}
              tabIndex={0}
              role="button"
              aria-label={`${b.name} — ${b.role}`}
              style={{ transition: "opacity 300ms", cursor: "pointer" }}
            >
              <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="8"
                fill="hsl(0 0% 100%)"
                stroke={isSel ? `hsl(${b.color})` : "hsl(var(--avep-border))"}
                strokeWidth={isSel ? 2.5 : 1}
                filter="drop-shadow(0 1px 2px rgba(15,23,42,0.06))" />
              <rect x={b.x} y={b.y} width="4" height={b.h} rx="8" fill={`hsl(${b.color})`} />
              <text x={b.x + 14} y={b.y + 22} fontSize="12" fontWeight="600" fill="hsl(222 33% 12%)">{b.name}</text>
              <text x={b.x + 14} y={b.y + 38} fontSize="10" fill="hsl(220 12% 40%)">{b.role}</text>
              <text x={b.x + 14} y={b.y + 56} fontSize="9.5" fontFamily="var(--avep-font-mono)" fill="hsl(220 10% 55%)">{b.clock} · {b.reset}</text>
              <circle cx={b.x + b.w - 12} cy={b.y + 12} r="4"
                fill={b.status === "Validated" ? "hsl(142 65% 42%)" : b.status === "Review" ? "hsl(35 92% 52%)" : "hsl(220 12% 60%)"} />
              {b.security === "Secure" && (
                <g>
                  <rect x={b.x + b.w - 34} y={b.y + b.h - 20} width="26" height="14" rx="3" fill="hsl(268 78% 55% / 0.12)" />
                  <text x={b.x + b.w - 21} y={b.y + b.h - 10} fontSize="8.5" textAnchor="middle" fill="hsl(268 78% 45%)" fontWeight="600">SEC</text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
      {tip && (
        <div className="pointer-events-none absolute px-2 py-1 rounded shadow-md"
          style={{ left: tip.x + 12, top: tip.y + 12, background: "hsl(var(--avep-foreground))", color: "hsl(var(--avep-primary-foreground))", fontSize: "var(--avep-text-2xs)" }}>
          <div style={{ fontWeight: 700 }}>{tip.kind}</div>
          {tip.bw && <div>BW: {tip.bw}</div>}
          {tip.latency && <div>Latency: {tip.latency}</div>}
        </div>
      )}
    </div>
  );
}

/* ------------------------------- tables ---------------------------------- */

function InterfaceTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr style={{ color: "hsl(var(--avep-foreground-subtle))", fontSize: "var(--avep-text-2xs)", textTransform: "uppercase", letterSpacing: "var(--avep-tracking-wide)" }}>
            {["Interface","Protocol","Clock","Reset","Security","Owner","Status","Bandwidth"].map((h) => (
              <th key={h} className="text-left py-1.5 pr-3 font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {INTERFACES.map((i) => (
            <tr key={i.id} className="border-t" style={{ borderColor: "hsl(var(--avep-border))" }} title={`${i.src} ↔ ${i.dst}`}>
              <td className="py-1.5 pr-3" style={{ fontFamily: "var(--avep-font-mono)" }}>{i.id}</td>
              <td className="py-1.5 pr-3">{i.proto}</td>
              <td className="py-1.5 pr-3" style={{ fontFamily: "var(--avep-font-mono)" }}>{i.clk}</td>
              <td className="py-1.5 pr-3" style={{ fontFamily: "var(--avep-font-mono)" }}>{i.rst}</td>
              <td className="py-1.5 pr-3"><Badge tone={i.sec === "Secure" ? "info" : i.sec === "Mixed" ? "warn" : "neutral"}>{i.sec}</Badge></td>
              <td className="py-1.5 pr-3">{i.owner}</td>
              <td className="py-1.5 pr-3"><Badge tone={i.status === "Validated" ? "ok" : "warn"}>{i.status}</Badge></td>
              <td className="py-1.5 pr-3" style={{ fontFamily: "var(--avep-font-mono)" }}>{i.bw}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RegisterTable({ expandedReg, setExpandedReg }: { expandedReg: string | null; setExpandedReg: (s: string | null) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr style={{ color: "hsl(var(--avep-foreground-subtle))", fontSize: "var(--avep-text-2xs)", textTransform: "uppercase", letterSpacing: "var(--avep-tracking-wide)" }}>
            {["","Register","Address","W","Reset","Privilege","Access","Owner","Status","Fields"].map((h) => (
              <th key={h} className="text-left py-1.5 pr-3 font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {REGISTERS.map((r) => {
            const open = expandedReg === r.name;
            return (
              <>
                <tr key={r.name} className="border-t cursor-pointer" style={{ borderColor: "hsl(var(--avep-border))" }} onClick={() => setExpandedReg(open ? null : r.name)}>
                  <td className="py-1.5 pr-2">{open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}</td>
                  <td className="py-1.5 pr-3" style={{ fontFamily: "var(--avep-font-mono)", fontWeight: 600 }}>{r.name}</td>
                  <td className="py-1.5 pr-3" style={{ fontFamily: "var(--avep-font-mono)" }}>{r.addr}</td>
                  <td className="py-1.5 pr-3">{r.w}</td>
                  <td className="py-1.5 pr-3" style={{ fontFamily: "var(--avep-font-mono)" }}>{r.reset}</td>
                  <td className="py-1.5 pr-3">{r.priv}</td>
                  <td className="py-1.5 pr-3">{r.access}</td>
                  <td className="py-1.5 pr-3">{r.owner}</td>
                  <td className="py-1.5 pr-3"><Badge tone={r.status === "Validated" ? "ok" : r.status === "Warning" ? "warn" : "err"}>{r.status}</Badge></td>
                  <td className="py-1.5 pr-3">{r.fields}</td>
                </tr>
                {open && r.detail.length > 0 && (
                  <tr key={r.name + "-x"} style={{ background: "hsl(var(--avep-surface-muted))" }}>
                    <td colSpan={10} className="px-4 py-2">
                      <div className="grid grid-cols-3 gap-2">
                        {r.detail.map((f) => (
                          <div key={f.name} className="p-2 rounded" style={{ background: "hsl(var(--avep-surface))", border: "1px solid hsl(var(--avep-border))" }}>
                            <div style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>{f.bits}</div>
                            <div style={{ fontSize: "var(--avep-text-sm)", fontWeight: 600, fontFamily: "var(--avep-font-mono)" }}>{f.name}</div>
                            <div style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-muted))" }}>{f.access} · reset {f.reset}</div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* --------------------------- Clock/Reset viewer --------------------------- */

function ClockResetViewer() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <div style={label2xs} className="mb-1.5">Clock Domains</div>
        <div className="flex flex-col gap-1.5">
          {CLOCK_DOMAINS.map((d) => (
            <div key={d.name} className="flex items-center gap-2 p-2 rounded" style={{ background: "hsl(var(--avep-surface-muted))" }} title={`${d.blocks} blocks on ${d.name}`}>
              <span className="h-6 w-6 grid place-items-center rounded-full" style={{ background: `hsl(${d.color} / 0.12)` }}>
                <Zap className="h-3.5 w-3.5" style={{ color: `hsl(${d.color})` }} />
              </span>
              <div className="flex-1 min-w-0">
                <div style={{ fontSize: "var(--avep-text-sm)", fontWeight: 600, fontFamily: "var(--avep-font-mono)" }}>{d.name}</div>
                <div style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-muted))" }}>{d.freq} · {d.blocks} blocks</div>
              </div>
              <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: `hsl(${d.color})` }} />
            </div>
          ))}
        </div>
        <div className="mt-2 p-2 rounded" style={{ background: toneMap.warn.bg, border: `1px solid hsl(${toneMap.warn.dot} / 0.3)` }}>
          <div className="flex items-center gap-1.5" style={{ fontSize: "var(--avep-text-2xs)", color: toneMap.warn.fg, fontWeight: 700 }}>
            <AlertTriangle className="h-3.5 w-3.5" /> 2 CDC crossings need synchronizers
          </div>
        </div>
      </div>
      <div>
        <div style={label2xs} className="mb-1.5">Reset Domains</div>
        <div className="flex flex-col gap-1.5">
          {RESET_DOMAINS.map((d) => (
            <div key={d.name} className="flex items-center gap-2 p-2 rounded" style={{ background: "hsl(var(--avep-surface-muted))" }} title={`${d.blocks} blocks reset by ${d.name}`}>
              <span className="h-6 w-6 grid place-items-center rounded-full" style={{ background: `hsl(${d.color} / 0.12)` }}>
                <RefreshCw className="h-3.5 w-3.5" style={{ color: `hsl(${d.color})` }} />
              </span>
              <div className="flex-1 min-w-0">
                <div style={{ fontSize: "var(--avep-text-sm)", fontWeight: 600, fontFamily: "var(--avep-font-mono)" }}>{d.name}</div>
                <div style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-muted))" }}>{d.scope} · {d.blocks} blocks</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* --------------------------- Register semantics --------------------------- */

function RegisterSemantics() {
  const checks = [
    { l: "Reset values",       s: "ok"   as const, note: "212 / 212 defined" },
    { l: "Reserved bits",      s: "ok"   as const, note: "All marked RES0" },
    { l: "Read/write policy",  s: "ok"   as const, note: "No ambiguous access" },
    { l: "Privilege",          s: "warn" as const, note: "IRQ_STATUS accessible at Supervisor" },
    { l: "Side effects",       s: "ok"   as const, note: "Documented on 34 registers" },
    { l: "Atomic updates",     s: "ok"   as const, note: "RMW guards in place" },
    { l: "Alignment",          s: "ok"   as const, note: "64-bit registers 8B aligned" },
    { l: "Address conflicts",  s: "err"  as const, note: "SEC_CFG overlaps DMA_CTRL mask" },
    { l: "Missing descriptions",s:"ok"   as const, note: "3 auto-drafted by AI" },
  ];
  return (
    <ul className="flex flex-col gap-1.5">
      {checks.map((c) => (
        <li key={c.l} className="flex items-center justify-between px-2 py-1.5 rounded" style={{ background: "hsl(var(--avep-surface-muted))" }} title={c.note}>
          <span className="flex items-center gap-2" style={{ fontSize: "var(--avep-text-sm)" }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: toneMap[c.s].dot }} />
            {c.l}
          </span>
          <Badge tone={c.s}>{c.s === "ok" ? "Pass" : c.s === "warn" ? "Warn" : "Fail"}</Badge>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------ register map ------------------------------ */

function RegisterMap() {
  const cells = Array.from({ length: 64 }).map((_, i) => {
    const addr = i * 64;
    const busy = [0, 1, 4, 5, 6, 7, 16, 24, 32, 48, 49].includes(i);
    const conflict = i === 32;
    return { i, addr, busy, conflict };
  });
  return (
    <div>
      <div className="grid grid-cols-8 gap-1">
        {cells.map((c) => (
          <div key={c.i} className={`aspect-square rounded ${c.conflict ? "animate-pulse" : ""}`}
            title={`0x${c.addr.toString(16).padStart(4, "0").toUpperCase()} — ${c.conflict ? "conflict" : c.busy ? "in-use" : "free"}`}
            style={{
              background: c.conflict ? "hsl(0 90% 90%)" : c.busy ? "hsl(var(--avep-primary-soft))" : "hsl(var(--avep-surface-muted))",
              border: `1px solid hsl(${c.conflict ? "0 78% 55%" : c.busy ? "222 78% 46% / 0.25" : "var(--avep-border)"})`,
            }} />
        ))}
      </div>
      <div className="flex items-center gap-3 mt-2" style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-muted))" }}>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded" style={{ background: "hsl(var(--avep-primary-soft))" }} />In-use</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded" style={{ background: "hsl(0 90% 90%)" }} />Conflict</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded" style={{ background: "hsl(var(--avep-surface-muted))" }} />Free</span>
      </div>
    </div>
  );
}

/* ---------------------------- Requirement Sankey -------------------------- */

function RequirementSankey() {
  const cols = ["Requirement", "Block", "Interface", "Register", "RTL", "Verification"];
  const flows = [
    { r: "REQ-1021", b: "Descriptor Engine", i: "AXI-M1",  reg: "RING_BASE",  rtl: "descriptor_fetch.sv", v: "test-ring-wrap-01" },
    { r: "REQ-1044", b: "DMA Scheduler",     i: "APB-CFG", reg: "DMA_CTRL",   rtl: "dma_sched.sv",        v: "test-arb-01" },
    { r: "REQ-1150", b: "Interrupt Ctrl",    i: "IRQ-BUS", reg: "IRQ_MASK",   rtl: "irq_coalescer.sv",    v: "test-irq-01" },
    { r: "REQ-1220", b: "Security Engine",   i: "APB-CFG", reg: "SEC_CFG",    rtl: "sec_engine.sv",       v: "test-sec-01" },
    { r: "REQ-1520", b: "ECC Controller",    i: "ECC-BUS", reg: "—",          rtl: "ecc_ctrl.sv",         v: "test-ecc-01" },
  ];
  return (
    <div className="overflow-x-auto">
      <div className="grid" style={{ gridTemplateColumns: "repeat(6, minmax(130px, 1fr))", gap: 6, minWidth: 780 }}>
        {cols.map((c) => (<div key={c} style={{ ...label2xs }}>{c}</div>))}
        {flows.map((f, i) => (
          <>
            <SankeyCell key={`r${i}`} v={f.r} tone="info" />
            <SankeyArrow />
            <SankeyCell v={f.b} tone="accent" />
            <SankeyArrow />
            <SankeyCell v={f.i} tone="info" />
            <SankeyArrow />
            <SankeyCell v={f.reg} tone="ai" />
            <SankeyArrow />
            <SankeyCell v={f.rtl} tone="neutral" mono />
            <SankeyArrow />
            <SankeyCell v={f.v} tone="ok" mono />
          </>
        ))}
      </div>
      <div style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-muted))", marginTop: 8 }}>
        Live flow — packets animate along AXI edges in the canvas above.
      </div>
    </div>
  );
}
function SankeyCell({ v, tone, mono }: { v: string; tone: Tone; mono?: boolean }) {
  const s = toneMap[tone];
  return (
    <div className="px-2 py-1.5 rounded-md" style={{ background: s.bg, color: s.fg, fontSize: "var(--avep-text-xs)", fontWeight: 600, fontFamily: mono ? "var(--avep-font-mono)" : undefined }}>
      {v}
    </div>
  );
}
function SankeyArrow() {
  return <div className="grid place-items-center"><ArrowRight className="h-3.5 w-3.5" style={{ color: "hsl(var(--avep-foreground-subtle))" }} /></div>;
}

/* ------------------------ interface consistency --------------------------- */

function InterfaceChecker() {
  const rows = [
    { s: "AXI Master.axi_m0", d: "Memory Manager.axi_s0",       proto: "AXI4",   v: "1.0", sig: 32, mism: 0, fix: "—" },
    { s: "Descriptor.axi_m1", d: "AXI Master.axi_s1",           proto: "AXI4",   v: "1.0", sig: 32, mism: 0, fix: "—" },
    { s: "Register.apb",      d: "DMA Scheduler.apb_s",         proto: "APB",    v: "3.0", sig: 12, mism: 1, fix: "Add PPROT[2:0] to consumer" },
    { s: "Interrupt.irq_bus", d: "SoC IRQ.irq_in",              proto: "Custom", v: "0.9", sig: 34, mism: 2, fix: "Align vector count 32→34" },
    { s: "ECC.ecc_bus",       d: "Memory Manager.ecc_s",        proto: "Custom", v: "1.0", sig: 8,  mism: 0, fix: "—" },
  ];
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr style={{ color: "hsl(var(--avep-foreground-subtle))", fontSize: "var(--avep-text-2xs)", textTransform: "uppercase", letterSpacing: "var(--avep-tracking-wide)" }}>
            {["Source","Destination","Protocol","Version","Signals","Mismatch","Suggested Fix",""].map((h) => (
              <th key={h} className="text-left py-1.5 pr-3 font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t" style={{ borderColor: "hsl(var(--avep-border))" }}>
              <td className="py-1.5 pr-3" style={{ fontFamily: "var(--avep-font-mono)" }}>{r.s}</td>
              <td className="py-1.5 pr-3" style={{ fontFamily: "var(--avep-font-mono)" }}>{r.d}</td>
              <td className="py-1.5 pr-3">{r.proto}</td>
              <td className="py-1.5 pr-3" style={{ fontFamily: "var(--avep-font-mono)" }}>{r.v}</td>
              <td className="py-1.5 pr-3">{r.sig}</td>
              <td className="py-1.5 pr-3"><Badge tone={r.mism === 0 ? "ok" : r.mism === 1 ? "warn" : "err"}>{r.mism}</Badge></td>
              <td className="py-1.5 pr-3" style={{ color: "hsl(var(--avep-foreground-muted))" }}>{r.fix}</td>
              <td className="py-1.5 pr-3"><Btn variant={r.mism ? "primary" : "ghost"} icon={CheckCircle2}>{r.mism ? "Apply Fix" : "Validated"}</Btn></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* --------------------------- Dependency analysis -------------------------- */

function DependencyList() {
  const rows = [
    { k: "Clock",     src: "PCLK → ACLK",             note: "Register Controller drives DMA Scheduler across domains", tone: "warn" as const },
    { k: "Reset",     src: "Global → DMA Reset",      note: "DMA Reset must deassert 4 cycles after Global",           tone: "info" as const },
    { k: "Power",     src: "PMU → Clock Ctrl",        note: "Clock gating requires PMU handshake ack",                 tone: "info" as const },
    { k: "Security",  src: "Security Eng → All",      note: "Privilege gating enforced by SEC_CFG.MODE",               tone: "info" as const },
    { k: "Privilege", src: "IRQ_STATUS",              note: "Currently writable at Supervisor — recommend Machine",    tone: "err"  as const },
    { k: "Isolation", src: "Secure ↔ NonSecure",      note: "APB bridge enforces NS filter",                            tone: "ok"   as const },
    { k: "ECC",       src: "ECC → Memory",            note: "SECDED covers 64+8 bits",                                  tone: "ok"   as const },
    { k: "Error",     src: "ECC uncorrectable",       note: "No escalation path to IRQ controller — add sideband",     tone: "warn" as const },
  ];
  return (
    <ul className="flex flex-col gap-1.5">
      {rows.map((r) => (
        <li key={r.k + r.src} className="p-2 rounded" style={{ background: toneMap[r.tone].bg }} title={r.note}>
          <div className="flex items-center justify-between">
            <span style={{ fontSize: "var(--avep-text-2xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "var(--avep-tracking-wide)", color: toneMap[r.tone].fg }}>{r.k}</span>
            <span style={{ fontSize: "var(--avep-text-2xs)", color: toneMap[r.tone].fg, fontFamily: "var(--avep-font-mono)" }}>{r.src}</span>
          </div>
          <div style={{ fontSize: "var(--avep-text-xs)", color: "hsl(var(--avep-foreground-muted))", marginTop: 2 }}>{r.note}</div>
        </li>
      ))}
    </ul>
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
        <div style={{ fontSize: "var(--avep-text-sm)", fontWeight: 600 }}>Live architecture score</div>
        <div style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-muted))" }}>Composite of 9 engineering dimensions, refreshed every 30s</div>
      </div>
    </div>
  );
}

/* ------------------------------- Timeline --------------------------------- */

function VersionTimeline() {
  const steps = [
    { t: "Requirement Allocation", who: "AI + L. Tran",   ts: "Nov 12", state: "done"    as const },
    { t: "Architecture Draft",     who: "L. Tran",        ts: "Nov 15", state: "done"    as const },
    { t: "Peer Review",            who: "H. Tanaka",      ts: "Nov 18", state: "done"    as const },
    { t: "AI Validation",          who: "AVEP Copilot",   ts: "Nov 19", state: "done"    as const },
    { t: "Approval",               who: "3 of 5",         ts: "In progress", state: "active" as const },
    { t: "RTL Ready",              who: "—",              ts: "Pending", state: "todo"   as const },
  ];
  return (
    <div className="flex items-stretch gap-1">
      {steps.map((s, i) => (
        <div key={s.t} className="flex-1 min-w-[130px]">
          <div className="h-1.5 rounded-full" style={{
            background: s.state === "done" ? "hsl(var(--avep-pass))" : s.state === "active" ? "hsl(var(--avep-primary))" : "hsl(var(--avep-surface-muted))",
          }} />
          <div className="mt-2">
            <div className="flex items-center gap-1.5">
              <span className="h-4 w-4 grid place-items-center rounded-full"
                style={{ background: s.state === "done" ? "hsl(var(--avep-pass-soft))" : s.state === "active" ? "hsl(var(--avep-primary-soft))" : "hsl(var(--avep-surface-muted))",
                  color: s.state === "done" ? "hsl(var(--avep-pass))" : s.state === "active" ? "hsl(var(--avep-primary))" : "hsl(var(--avep-foreground-subtle))" }}>
                {s.state === "done" ? <CheckCircle2 className="h-3 w-3" /> : s.state === "active" ? <Activity className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
              </span>
              <span style={{ fontSize: "var(--avep-text-xs)", fontWeight: 600 }}>{s.t}</span>
            </div>
            <div style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-muted))", marginTop: 2 }}>{s.who}</div>
            <div style={{ fontSize: "var(--avep-text-2xs)", color: "hsl(var(--avep-foreground-subtle))" }}>{s.ts}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------- Recommendations ----------------------------- */

function Recommendations() {
  const items = [
    { t: "Consolidate Reset Controller + Clock Controller",  conf: 82, why: "Both operate on ACLK domain and share 87% of state; consolidation reduces CDC crossings by 2." },
    { t: "Coalesce IRQ_STATUS + IRQ_LATCH into unified W1C", conf: 78, why: "Redundant read semantics; unification simplifies firmware and removes 1 privilege violation." },
    { t: "Introduce SEC_CFG mirror at APB",                  conf: 91, why: "Enables supervisor read of active security profile without invoking Machine trap." },
    { t: "Move ECC uncorrectable path to IRQ sideband",      conf: 88, why: "Prevents silent data drop and adds observability for verification checkers." },
    { t: "Down-clock PCLK during idle ring",                 conf: 71, why: "Reduces static power ~8 mW; requires PMU handshake update." },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((it, i) => (
        <li key={i} className="rounded-md" style={{ background: "hsl(var(--avep-ai-soft))", border: "1px solid hsl(var(--avep-ai) / 0.2)" }}>
          <button className="w-full flex items-center justify-between px-2.5 py-2 text-left" onClick={() => setOpen(open === i ? null : i)}>
            <span className="flex items-center gap-2" style={{ fontSize: "var(--avep-text-sm)", fontWeight: 600, color: "hsl(var(--avep-foreground))" }}>
              <Sparkles className="h-3.5 w-3.5" style={{ color: "hsl(var(--avep-ai))" }} />
              {it.t}
            </span>
            <span className="flex items-center gap-2">
              <Badge tone="ai">{it.conf}% conf.</Badge>
              {open === i ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            </span>
          </button>
          {open === i && (
            <div className="px-2.5 pb-2" style={{ fontSize: "var(--avep-text-xs)", color: "hsl(var(--avep-foreground-muted))" }}>
              {it.why}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

/* --------------------------- Inspector drawer ----------------------------- */

function ArchitectureInspector({ blockId, onClose }: { blockId: string; onClose: () => void }) {
  const b = BLOCKS.find((x) => x.id === blockId);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  if (!b) return null;
  const interfaces = INTERFACES.filter((i) => i.src.toLowerCase().includes(b.name.toLowerCase()) || i.dst.toLowerCase().includes(b.name.toLowerCase()));
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-label={`${b.name} architecture inspector`}>
      <div className="absolute inset-0" style={{ background: "hsl(222 33% 12% / 0.35)" }} onClick={onClose} />
      <div ref={ref} tabIndex={-1} className="absolute top-0 right-0 h-full w-full max-w-[560px] overflow-auto"
        style={{ background: "hsl(var(--avep-surface))", boxShadow: "-24px 0 48px -12px hsl(222 33% 12% / 0.25)" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "hsl(var(--avep-border))" }}>
          <div>
            <div style={label2xs}>Architecture Inspector</div>
            <div style={{ fontSize: "var(--avep-text-xl)", fontWeight: 700 }}>{b.name}</div>
            <div style={{ fontSize: "var(--avep-text-xs)", color: "hsl(var(--avep-foreground-muted))" }}>{b.role}</div>
          </div>
          <button onClick={onClose} className="h-8 w-8 grid place-items-center rounded-md hover:bg-slate-100" aria-label="Close inspector">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2">
            <InfoTile l="Clock Domain"   v={b.clock} icon={Zap} />
            <InfoTile l="Reset Domain"   v={b.reset} icon={RefreshCw} />
            <InfoTile l="Security"       v={b.security} icon={Lock} />
            <InfoTile l="Privilege"      v={b.privilege} icon={ShieldCheck} />
          </div>

          <div>
            <div style={label2xs} className="mb-1.5">Allocated Requirements</div>
            <div className="flex flex-wrap gap-1.5">
              {b.requirements.map((r) => <Badge key={r} tone="info">{r}</Badge>)}
            </div>
          </div>

          <div>
            <div style={label2xs} className="mb-1.5">Interfaces</div>
            <ul className="flex flex-col gap-1">
              {interfaces.length ? interfaces.map((i) => (
                <li key={i.id} className="flex items-center justify-between px-2 py-1.5 rounded" style={{ background: "hsl(var(--avep-surface-muted))", fontSize: "var(--avep-text-sm)" }}>
                  <span style={{ fontFamily: "var(--avep-font-mono)" }}>{i.id}</span>
                  <span style={{ color: "hsl(var(--avep-foreground-muted))" }}>{i.proto} · {i.bw}</span>
                  <Badge tone={i.status === "Validated" ? "ok" : "warn"}>{i.status}</Badge>
                </li>
              )) : <div style={{ fontSize: "var(--avep-text-xs)", color: "hsl(var(--avep-foreground-muted))" }}>No direct interfaces.</div>}
            </ul>
          </div>

          <div>
            <div style={label2xs} className="mb-1.5">RTL Mapping</div>
            <div className="p-2 rounded" style={{ background: "hsl(var(--avep-surface-muted))", fontFamily: "var(--avep-font-mono)", fontSize: "var(--avep-text-xs)" }}>
              rtl/{b.name.toLowerCase().replace(/\s+/g, "_")}.sv
            </div>
          </div>

          <div>
            <div style={label2xs} className="mb-1.5">Verification Mapping</div>
            <ul className="flex flex-col gap-1" style={{ fontSize: "var(--avep-text-sm)" }}>
              <li className="flex justify-between"><span>Coverage plan</span><Badge tone="ok">Linked</Badge></li>
              <li className="flex justify-between"><span>Formal assertions</span><Badge tone="ok">14</Badge></li>
              <li className="flex justify-between"><span>Directed tests</span><Badge tone="info">8</Badge></li>
            </ul>
          </div>

          <div>
            <div style={label2xs} className="mb-1.5">Approval History</div>
            <ol className="flex flex-col gap-1.5">
              {APPROVERS.slice(0, 4).map((a) => (
                <li key={a.role} className="flex items-center justify-between text-[13px]">
                  <span>{a.role} · <span style={{ color: "hsl(var(--avep-foreground-muted))" }}>{a.who}</span></span>
                  <Badge tone={a.status === "Approved" ? "ok" : "warn"}>{a.status}</Badge>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex gap-2">
            <Btn variant="primary" icon={Send}>Submit for Approval</Btn>
            <Btn icon={Download}>Export JSON</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoTile({ l, v, icon: Icon }: { l: string; v: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }) {
  return (
    <div className="p-2.5 rounded-md" style={{ background: "hsl(var(--avep-surface-muted))" }}>
      <div className="flex items-center gap-1.5" style={label2xs}>
        <Icon className="h-3.5 w-3.5" style={{ color: "hsl(var(--avep-primary))" }} /> {l}
      </div>
      <div style={{ fontSize: "var(--avep-text-sm)", fontWeight: 600, marginTop: 2, fontFamily: "var(--avep-font-mono)" }}>{v}</div>
    </div>
  );
}
