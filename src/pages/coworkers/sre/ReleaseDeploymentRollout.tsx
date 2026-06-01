import { useNavigate } from "react-router-dom";
import {
  Calendar, AlertTriangle, ShieldCheck, Clock, Moon, Gauge,
  Activity, Cloud, Network, Database, FileText, ListChecks,
  CheckCircle2, Users, ChevronRight, Info, Target, Search, Rocket,
  Settings as SettingsIcon, Download, Link2, ScanLine,
} from "lucide-react";
import { AppShell } from "@/components/eoc/AppShell";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  PieChart, Pie,
} from "recharts";

/* ---------- helpers ---------- */
const KpiCard = ({
  icon: Icon, iconBg, iconColor, label, value, delta, deltaTone = "pos",
}: any) => (
  <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
    <div className="flex items-start gap-3">
      <div className={`h-10 w-10 rounded-lg ${iconBg} grid place-items-center shrink-0`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div className="min-w-0">
        <div className="text-[11.5px] font-semibold text-slate-500 leading-tight">{label}</div>
        <div className="text-[26px] font-extrabold tracking-tight text-slate-900 leading-none mt-1.5">{value}</div>
        <div className={`text-[10.5px] font-semibold mt-1 ${deltaTone === "pos" ? "text-emerald-600" : "text-rose-600"}`}>
          {deltaTone === "pos" ? "↑" : "↓"} {delta}
        </div>
      </div>
    </div>
  </div>
);

const Section = ({ icon: Icon, iconColor, title, children, className = "" }: any) => (
  <section className={`rounded-xl bg-white border border-slate-200 p-4 shadow-sm ${className}`}>
    <div className="flex items-center gap-2 mb-3">
      {Icon && <Icon className={`h-4 w-4 ${iconColor}`} />}
      <h3 className="text-[14px] font-bold text-slate-800">{title}</h3>
    </div>
    {children}
  </section>
);

/* ---------- data ---------- */
const kpis = [
  { icon: Calendar, iconBg: "bg-blue-50", iconColor: "text-blue-600", label: "Upcoming Changes", value: "42", delta: "+6 vs yesterday" },
  { icon: AlertTriangle, iconBg: "bg-amber-50", iconColor: "text-amber-600", label: "High-Risk Changes", value: "8", delta: "-2 vs yesterday", deltaTone: "pos" },
  { icon: ShieldCheck, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", label: "Risk Prediction Accuracy", value: "91%", delta: "+4% vs yesterday" },
  { icon: Clock, iconBg: "bg-violet-50", iconColor: "text-violet-600", label: "Rollback Ready", value: "88%", delta: "+5% vs yesterday" },
  { icon: Moon, iconBg: "bg-indigo-50", iconColor: "text-indigo-600", label: "Blackout Conflicts", value: "3", delta: "+1 vs yesterday", deltaTone: "neg" },
  { icon: Gauge, iconBg: "bg-rose-50", iconColor: "text-rose-600", label: "Potential SLA Impact", value: "2 services", delta: "-1 vs yesterday", deltaTone: "pos" },
];

const signals = [
  { icon: Activity, color: "text-blue-600", label: "Dynatrace Events Ingested", value: "1,126" },
  { icon: Activity, color: "text-amber-600", label: "SolarWinds Alerts Correlated", value: "264" },
  { icon: Activity, color: "text-orange-600", label: "ThousandEyes Path Degradations", value: "18" },
  { icon: Activity, color: "text-emerald-600", label: "Splunk / Cribl Log Patterns Matched", value: "94" },
  { icon: Cloud, color: "text-sky-600", label: "Cloud & Network Changes Analyzed", value: "42" },
  { icon: Database, color: "text-violet-600", label: "CMDB Dependency Coverage", value: "93%" },
  { icon: FileText, color: "text-slate-600", label: "Known Problems Cross-Checked", value: "27" },
  { icon: ListChecks, color: "text-indigo-600", label: "Rollback Plans Available", value: "88%" },
];

const slaRows = [
  { icon: CheckCircle2, color: "text-emerald-600", label: "Change Success Rate", value: 97.2, display: "97.2%", bar: "bg-emerald-500" },
  { icon: FileText, color: "text-emerald-600", label: "Changes Within Blackout Policy", value: 95, display: "95%", bar: "bg-emerald-500" },
  { icon: ShieldCheck, color: "text-emerald-600", label: "Rollback Plan Coverage", value: 88, display: "88%", bar: "bg-emerald-500" },
  { icon: Activity, color: "text-blue-600", label: "Estimated Incidents Prevented", value: 70, display: "11", bar: "bg-blue-500" },
  { icon: AlertTriangle, color: "text-blue-600", label: "Emergency Changes Avoided", value: 45, display: "6", bar: "bg-blue-500" },
  { icon: Users, color: "text-violet-600", label: "Customer-Facing Services Protected", value: 80, display: "14", bar: "bg-violet-500" },
];

const domainData = [
  { d: "Network", upcoming: 20, approved: 17, avg: 16 },
  { d: "Azure", upcoming: 16, approved: 14, avg: 13 },
  { d: "End-User\nConnectivity", upcoming: 6, approved: 5, avg: 4 },
];

const riskContribs = [
  { n: 1, label: "Dependency / upstream service overlap", pct: 29 },
  { n: 2, label: "Incomplete rollback plan", pct: 23 },
  { n: 3, label: "Recent related incident history", pct: 19 },
  { n: 4, label: "Blackout window conflict", pct: 16 },
  { n: 5, label: "Known problem adjacency", pct: 13 },
];

const safeguards = [
  { n: 1, label: "Validate rollback plan with named owner", sev: "High", sevTone: "bg-rose-100 text-rose-700", effort: "Low Effort", effortTone: "bg-emerald-100 text-emerald-700" },
  { n: 2, label: "Run pre-change dependency path verification", sev: "High", sevTone: "bg-rose-100 text-rose-700", effort: "Medium Effort", effortTone: "bg-amber-100 text-amber-700" },
  { n: 3, label: "Shift execution outside protected blackout period", sev: "Medium", sevTone: "bg-amber-100 text-amber-700", effort: "Medium Effort", effortTone: "bg-amber-100 text-amber-700" },
  { n: 4, label: "Add stakeholder approval from impacted service owner", sev: "Medium", sevTone: "bg-amber-100 text-amber-700", effort: "Low Effort", effortTone: "bg-emerald-100 text-emerald-700" },
  { n: 5, label: "Open guided handoff to network engineer for guarded release", sev: "Low", sevTone: "bg-emerald-100 text-emerald-700", effort: "High Effort", effortTone: "bg-rose-100 text-rose-700" },
];

const steps = [
  { n: 1, icon: ScanLine, color: "text-blue-600", bg: "bg-blue-50", ring: "ring-blue-100", title: "Detect", desc: "Ingests telemetry, alerts, logs, and scheduled changes in real time." },
  { n: 2, icon: Link2, color: "text-teal-600", bg: "bg-teal-50", ring: "ring-teal-100", title: "Correlate", desc: "Links changes to CI relationships, recent incidents, blackout windows, and service dependencies." },
  { n: 3, icon: SettingsIcon, color: "text-violet-600", bg: "bg-violet-50", ring: "ring-violet-100", title: "Assess Risk", desc: "Scores change risk using signals from observability, CMDB, known problems, and rollback readiness." },
  { n: 4, icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50", ring: "ring-emerald-100", title: "Guide Action", desc: "Recommends safer execution steps to reduce failed change and protect customer outcomes." },
];

const RiskGauge = () => {
  const pct = 82;
  const data = [{ name: "v", value: pct }, { name: "r", value: 100 - pct }];
  return (
    <div className="relative h-[170px] w-[170px] mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={62} outerRadius={82} stroke="none" startAngle={90} endAngle={-270}>
            <Cell fill="hsl(0 84% 60%)" />
            <Cell fill="hsl(0 0% 92%)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 grid place-items-center pointer-events-none text-center">
        <div>
          <div className="text-[28px] font-extrabold text-slate-900 leading-none">{pct}%</div>
          <div className="text-[11px] font-semibold text-rose-600 mt-1">High</div>
        </div>
      </div>
    </div>
  );
};

/* ---------- page ---------- */
export default function ReleaseDeploymentRollout() {
  const nav = useNavigate();
  return (
    <AppShell>
      <main className="flex-1 bg-slate-50/60 px-5 py-5 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <button onClick={() => nav("/coworkers/site-reliability-engineering")} className="text-[11px] text-slate-500 hover:text-slate-800 mb-1 inline-flex items-center gap-1">
              ← Back to SRE Coworkers
            </button>
            <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900 leading-tight">Digital Co-Worker Dashboard</h1>
            <div className="flex items-center gap-2 mt-1.5">
              <h2 className="text-[15px] font-semibold text-slate-700">Change-Risk Intelligence</h2>
              <span className="inline-flex items-center text-[10.5px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 ring-1 ring-blue-100">Infrastructure</span>
              <span className="inline-flex items-center text-[10.5px] font-semibold px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 ring-1 ring-sky-100">Cloud</span>
              <span className="inline-flex items-center text-[10.5px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1" /> Active
              </span>
            </div>
            <p className="text-[12px] text-slate-500 mt-2 max-w-[1100px]">
              Correlates Dynatrace, SolarWinds, ThousandEyes, Splunk/Cribl, cloud logs, network alerts, change records, CMDB context, known problems,
              blackout windows, dependency maps, and rollback plans to predict change risk and recommend safer execution.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white text-[12px] font-semibold text-slate-700 hover:bg-slate-50">
              <Download className="h-3.5 w-3.5" /> Export
            </button>
            <button className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-[12px] font-semibold text-white shadow-sm">
              <Rocket className="h-3.5 w-3.5" /> Open Console
            </button>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {kpis.map((k) => <KpiCard key={k.label} {...k} />)}
        </div>

        {/* Top 3-col: Signals | Current Change | SLA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mt-3">
          <Section icon={Activity} iconColor="text-blue-600" title="Signal Intake & Context">
            <ul className="space-y-2.5">
              {signals.map((s) => (
                <li key={s.label} className="flex items-center justify-between gap-3 text-[12px]">
                  <span className="inline-flex items-center gap-2 min-w-0">
                    <s.icon className={`h-3.5 w-3.5 ${s.color} shrink-0`} />
                    <span className="text-slate-700 truncate">{s.label}</span>
                  </span>
                  <span className="text-blue-600 font-bold tabular-nums">{s.value}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 rounded-lg bg-blue-50/60 border border-blue-100 p-2.5 text-[11px] text-slate-600 flex gap-2">
              <Info className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
              <span>The co-worker continuously correlates telemetry, change intent, service dependencies, past incidents, blackout policies, and rollback readiness before a change window begins.</span>
            </div>
          </Section>

          <Section icon={Target} iconColor="text-blue-600" title="Current Change Focus">
            <div className="grid grid-cols-3 gap-3">
              <dl className="col-span-2 space-y-2 text-[11.5px]">
                <Row k="Change ID:" v={<span className="text-blue-600 font-semibold">CHG-48172</span>} />
                <Row k="Service:" v={<span className="text-blue-600 font-semibold">Customer Policy Portal</span>} />
                <Row k="Planned Window:" v="Sat 10:00 PM — 11:30 PM" />
                <Row k="Change Type:" v="Azure firewall and route policy update" />
                <Row k="Business Impact if Failed:" v="Potential quote retrieval disruption across customer web traffic" />
                <Row k="Affected Users:" v="~1,400 users" />
                <Row k="Domain:" v={<span className="text-blue-600 font-semibold">Network + Azure</span>} />
              </dl>
              <div className="col-span-1">
                <div className="text-[10.5px] font-semibold text-slate-500 text-center mb-1">Predicted Risk</div>
                <RiskGauge />
              </div>
            </div>

            <div className="mt-3 rounded-lg bg-amber-50/70 border border-amber-200 p-2.5 text-[11px] text-slate-700 flex gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span><span className="font-bold text-amber-700">Top Risk Drivers:</span> Recent incident on related gateway, dependency on shared application path, partial rollback documentation, and overlap with preferred business freeze policy.</span>
            </div>
            <div className="mt-2 rounded-lg bg-blue-50/70 border border-blue-200 p-2.5 text-[11px] text-slate-700 flex gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
              <span><span className="font-bold text-blue-700">Recommended Next Action:</span> Move to guarded execution, validate rollback path, confirm dependency owner approval, and complete pre-change network path verification.</span>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px]">
              {[
                { i: Download, l: "Ingest", t: "08:45" },
                { i: Link2, l: "Correlate", t: "08:49" },
                { i: Search, l: "Assess", t: "08:53" },
                { i: CheckCircle2, l: "Recommend", t: "08:56" },
              ].map((s, idx, arr) => (
                <div key={s.l} className="flex items-center gap-2 flex-1">
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="h-7 w-7 rounded-full bg-blue-50 ring-1 ring-blue-200 grid place-items-center">
                      <s.i className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <div className="text-[10px] font-semibold text-slate-700">{s.l}</div>
                    <div className="text-[9.5px] text-slate-500">{s.t}</div>
                  </div>
                  {idx < arr.length - 1 && <div className="flex-1 border-t border-dashed border-slate-300 mb-5" />}
                </div>
              ))}
            </div>
          </Section>

          <Section icon={Users} iconColor="text-violet-600" title="SLA & Customer Outcomes">
            <ul className="space-y-3">
              {slaRows.map((r) => (
                <li key={r.label} className="text-[11.5px]">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="inline-flex items-center gap-2 min-w-0">
                      <r.icon className={`h-3.5 w-3.5 ${r.color} shrink-0`} />
                      <span className="text-slate-700 truncate">{r.label}</span>
                    </span>
                    <span className="text-slate-900 font-bold tabular-nums">{r.display}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full ${r.bar}`} style={{ width: `${r.value}%` }} />
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-3 rounded-lg bg-violet-50/60 border border-violet-100 p-2.5 text-[11px] text-slate-600 flex gap-2">
              <Info className="h-3.5 w-3.5 text-violet-600 shrink-0 mt-0.5" />
              <span>These measures focus on reducing failed change, protecting business hours, and avoiding service-impacting incidents.</span>
            </div>
          </Section>
        </div>

        {/* Middle 3-col */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mt-3">
          <Section icon={Activity} iconColor="text-blue-600" title="Change Volume by Domain">
            <div className="flex items-center gap-4 text-[10.5px] text-slate-500 mb-1">
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-blue-600" />Upcoming</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-blue-300" />Approved</span>
              <span className="inline-flex items-center gap-1"><span className="h-0.5 w-4 border-t border-dashed border-blue-400" />7-Day Avg</span>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={domainData} barGap={6}>
                  <XAxis dataKey="d" tick={{ fontSize: 10 }} interval={0} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="upcoming" fill="hsl(217 91% 60%)" radius={[3,3,0,0]} />
                  <Bar dataKey="approved" fill="hsl(213 94% 78%)" radius={[3,3,0,0]} />
                  <Bar dataKey="avg" fill="hsl(217 91% 60% / .25)" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[10.5px] text-slate-500 text-center mt-1">Volume of planned changes across monitored domains.</div>
          </Section>

          <Section icon={ShieldCheck} iconColor="text-violet-600" title="Top Risk Contributors">
            <ul className="space-y-2.5">
              {riskContribs.map((r) => (
                <li key={r.n} className="text-[11.5px]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="h-5 w-5 rounded-full bg-violet-100 text-violet-700 grid place-items-center text-[10px] font-bold shrink-0">{r.n}</span>
                    <span className="text-slate-700 flex-1 truncate">{r.label}</span>
                    <span className="text-slate-900 font-bold tabular-nums">{r.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-violet-500" style={{ width: `${r.pct * 2.5}%`, maxWidth: "100%" }} />
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-3 rounded-lg bg-violet-50/60 border border-violet-100 p-2.5 text-[11px] text-slate-600 flex gap-2">
              <Info className="h-3.5 w-3.5 text-violet-600 shrink-0 mt-0.5" />
              <span>Risk patterns are learned from telemetry, incident history, CMDB relationships, and change outcomes.</span>
            </div>
          </Section>

          <Section icon={ShieldCheck} iconColor="text-emerald-600" title="Recommended Safeguards">
            <ul className="space-y-1.5">
              {safeguards.map((s) => (
                <li key={s.n} className="flex items-center gap-2 text-[11.5px] py-1.5 border-b border-slate-100 last:border-0">
                  <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 grid place-items-center text-[10px] font-bold shrink-0">{s.n}</span>
                  <span className="text-slate-700 flex-1 truncate">{s.label}</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${s.sevTone}`}>{s.sev}</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${s.effortTone}`}>{s.effort}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-[10.5px] text-slate-600">
              <span className="font-semibold">Severity:</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" />High</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" />Medium</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />Low</span>
              <span className="font-semibold ml-2">Effort:</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />Low Effort</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" />Medium Effort</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" />High Effort</span>
            </div>
          </Section>
        </div>

        {/* How it works */}
        <Section icon={SettingsIcon} iconColor="text-blue-600" title="How the Digital Co-Worker Works" className="mt-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {steps.map((s, idx) => (
              <div key={s.n} className="relative">
                <div className="rounded-xl border border-slate-200 p-3 flex items-start gap-3 bg-white">
                  <div className={`h-12 w-12 rounded-full ${s.bg} ring-4 ${s.ring} grid place-items-center shrink-0`}>
                    <s.icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10.5px] font-bold text-slate-500">{s.n}  <span className={`${s.color}`}>{s.title}</span></div>
                    <div className="text-[11.5px] text-slate-600 leading-snug mt-0.5">{s.desc}</div>
                  </div>
                </div>
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 w-4 border-t border-dashed border-slate-300" />
                )}
              </div>
            ))}
          </div>
        </Section>
      </main>
    </AppShell>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2">
      <dt className="text-slate-500">{k}</dt>
      <dd className="text-slate-800 font-medium">{v}</dd>
    </div>
  );
}