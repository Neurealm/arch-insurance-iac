import {
  Bell, Users, ShieldCheck, Clock, Timer, AlertTriangle, Activity,
  Target, CheckCircle2, Info, Brain, Network, Lightbulb,
  TrendingDown, Gauge, Trophy,
} from "lucide-react";
import { AppShell } from "@/components/eoc/AppShell";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
} from "recharts";

const KpiCard = ({ icon: Icon, iconBg, iconColor, label, value, delta, deltaTone = "pos" }: any) => (
  <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
    <div className="flex items-start gap-4">
      <div className={`h-14 w-14 rounded-2xl ${iconBg} grid place-items-center shrink-0`}>
        <Icon className={`h-7 w-7 ${iconColor}`} strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-semibold text-slate-600 leading-tight">{label}</div>
        <div className="text-[32px] font-extrabold tracking-tight text-slate-900 leading-none mt-2">{value}</div>
      </div>
    </div>
    <div className={`text-[11.5px] font-semibold mt-3 ${deltaTone === "pos" ? "text-emerald-600" : "text-rose-600"}`}>
      ↑ {delta}
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

const Row = ({ label, value, valueClass = "text-indigo-600" }: any) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
    <span className="text-[12.5px] text-slate-700">{label}</span>
    <span className={`text-[12.5px] font-bold ${valueClass}`}>{value}</span>
  </div>
);

const OutcomeRow = ({ icon: Icon, label, value, pct, color = "bg-emerald-500", valueClass = "text-emerald-600" }: any) => (
  <div className="grid grid-cols-[20px_1fr_auto] items-center gap-3 py-2.5">
    <Icon className="h-4 w-4 text-slate-500" />
    <div>
      <div className="text-[12.5px] text-slate-700 mb-1">{label}</div>
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
    <span className={`text-[13px] font-bold ${valueClass}`}>{value}</span>
  </div>
);

const ConfidenceDonut = ({ value = 87 }: { value?: number }) => {
  const r = 46, c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <div className="relative h-32 w-32">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={r} stroke="#e2e8f0" strokeWidth="10" fill="none" />
        <circle cx="60" cy="60" r={r} stroke="#10b981" strokeWidth="10" fill="none"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-[26px] font-extrabold text-slate-900 leading-none">{value}%</div>
          <div className="text-[10px] font-semibold text-emerald-600 mt-0.5">High</div>
        </div>
      </div>
    </div>
  );
};

const sevPill = (s: string) => {
  const map: Record<string, string> = {
    High: "bg-rose-100 text-rose-700",
    Medium: "bg-amber-100 text-amber-700",
    Low: "bg-sky-100 text-sky-700",
  };
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${map[s]}`}>{s}</span>;
};
const effortPill = (s: string) => {
  const map: Record<string, string> = {
    "Low Effort": "bg-sky-100 text-sky-700",
    "Medium Effort": "bg-amber-100 text-amber-700",
    "High Effort": "bg-rose-100 text-rose-700",
  };
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${map[s]}`}>{s}</span>;
};

const volumeData = [
  { name: "Checkout", today: 46, yest: 41, avg: 39 },
  { name: "Auth",     today: 38, yest: 33, avg: 31 },
  { name: "Search",   today: 14, yest: 12, avg: 11 },
];

const causes = [
  { n: 1, label: "Network policy / firewall change", pct: 34 },
  { n: 2, label: "Azure routing / NSG issue",        pct: 27 },
  { n: 3, label: "DNS resolution failure",           pct: 16 },
  { n: 4, label: "Load balancer health probe fail",  pct: 13 },
  { n: 5, label: "Endpoint connectivity issue",      pct: 10 },
];

const actions = [
  { n: 1, label: "Roll back latest firewall rule change",         sev: "High",   eff: "Low Effort" },
  { n: 2, label: "Validate Azure NSG and route table alignment",   sev: "High",   eff: "Low Effort" },
  { n: 3, label: "Run packet path verification",                   sev: "Medium", eff: "Medium Effort" },
  { n: 4, label: "Notify service owner and impacted business team", sev: "Medium", eff: "Low Effort" },
  { n: 5, label: "Open guided handoff to network engineer",        sev: "Low",    eff: "High Effort" },
];

export default function SloSlaSliMonitoring() {
  return (
    <AppShell>
      <div className="min-h-screen bg-slate-50">
        <div className="px-6 py-5 max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-[34px] font-extrabold tracking-tight text-slate-900 leading-tight">
                Digital Co-Worker Dashboard
              </h1>
              <span className="text-[12px] font-semibold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">SRE</span>
              <span className="text-[12px] font-semibold px-2.5 py-1 rounded-md bg-teal-50 text-teal-700 border border-teal-100">Multi-Cloud</span>
              <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Active
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-[15px] font-semibold text-slate-700">SLO / SLA / SLI Monitoring & Breach Prediction</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">SRE</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700">Multi-Cloud</span>
            </div>
            <p className="text-[12.5px] text-slate-500 mt-1.5 max-w-4xl">
              Reads SLIs, error budgets, dependency graphs, and recent deployments to forecast SLO breaches and recommend preventive actions.
            </p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            <KpiCard icon={Bell}          iconBg="bg-indigo-50"  iconColor="text-indigo-600"  label="Open Incidents"    value="24"     delta="+4 vs yesterday" />
            <KpiCard icon={Users}         iconBg="bg-orange-50"  iconColor="text-orange-500"  label="P1 / P2 in Queue"  value="3 / 7"  delta="-2 / -1 vs yesterday" />
            <KpiCard icon={ShieldCheck}   iconBg="bg-emerald-50" iconColor="text-emerald-600" label="RCA Confidence"    value="87%"    delta="+6% vs yesterday" />
            <KpiCard icon={Clock}         iconBg="bg-violet-50"  iconColor="text-violet-600"  label="MTTA"              value="4 min"  delta="-1 min vs yesterday" />
            <KpiCard icon={Timer}         iconBg="bg-teal-50"    iconColor="text-teal-600"    label="MTTR"              value="38 min" delta="-6 min vs yesterday" />
            <KpiCard icon={AlertTriangle} iconBg="bg-rose-50"    iconColor="text-rose-500"    label="SLA at Risk"       value="2"      delta="+1 vs yesterday" deltaTone="neg" />
          </div>

          {/* Middle row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
            <Section icon={Activity} iconColor="text-indigo-600" title="Signal Intake & Context" className="lg:col-span-3">
              <Row label="Alerts Ingested Today" value="1,248" />
              <Row label="Tickets Correlated"    value="186" />
              <Row label="CMDB Relationships"    value="92%" />
              <Row label="Recent Changes"        value="43" />
              <div className="flex items-start justify-between gap-3 py-2">
                <span className="text-[12.5px] text-slate-700">Monitoring Sources</span>
                <span className="text-[11.5px] font-semibold text-slate-700 text-right">Network, Azure Monitor,<br/>Service Desk, CMDB</span>
              </div>
              <div className="rounded-lg bg-indigo-50/70 border border-indigo-100 p-3 mt-3 flex gap-2">
                <Info className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                <p className="text-[11.5px] text-indigo-900 leading-snug">
                  The co-worker continuously correlates machine signals with service context, ownership, dependencies, and change history.
                </p>
              </div>
            </Section>

            <Section icon={Target} iconColor="text-indigo-600" title="Current SLO Focus" className="lg:col-span-6">
              <div className="flex gap-4">
                <div className="flex-1 grid grid-cols-3 gap-x-4 gap-y-2 text-[12.5px]">
                  <div className="text-slate-500">SLO ID:</div>
                  <div className="col-span-2 font-bold text-indigo-600">SLO-CHKOUT-AVAIL-99.95</div>
                  <div className="text-slate-500">Service:</div>
                  <div className="col-span-2 font-bold text-indigo-600">Customer Policy Portal</div>
                  <div className="text-slate-500">Business Impact:</div>
                  <div className="col-span-2 text-slate-800">Intermittent user timeouts affecting quote retrieval</div>
                  <div className="text-slate-500">Affected Users:</div>
                  <div className="col-span-2 text-slate-800">~1,200 users</div>
                  <div className="text-slate-500">Domain:</div>
                  <div className="col-span-2 text-emerald-600 font-semibold">Network + Azure</div>
                </div>
                <div className="flex flex-col items-center shrink-0">
                  <div className="text-[11px] font-semibold text-slate-500 mb-2">Confidence</div>
                  <ConfidenceDonut value={87} />
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-emerald-50/70 border border-emerald-100 p-3 flex gap-2">
                <Lightbulb className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[12px] font-bold text-emerald-800">Likely Root Cause:</div>
                  <div className="text-[12px] text-emerald-900">Recent Azure firewall rule change causing intermittent packet drops to application gateway.</div>
                </div>
              </div>
              <div className="mt-2 rounded-lg bg-indigo-50/70 border border-indigo-100 p-3 flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[12px] font-bold text-indigo-800">Recommended Next Action:</div>
                  <div className="text-[12px] text-indigo-900">Validate firewall rule set, roll back latest change, verify packet flow, and notify application owner.</div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-[11px] font-semibold">
                {[
                  { l: "Detect",    t: "09:12", c: "bg-indigo-500",  I: Activity },
                  { l: "Correlate", t: "09:15", c: "bg-indigo-500",  I: Network },
                  { l: "Analyze",   t: "09:19", c: "bg-indigo-500",  I: Brain },
                  { l: "Recommend", t: "09:22", c: "bg-emerald-500", I: CheckCircle2 },
                ].map((s, i, arr) => (
                  <div key={s.l} className="flex-1 flex items-center">
                    <div className="flex flex-col items-center">
                      <span className={`h-7 w-7 rounded-full ${s.c} text-white grid place-items-center`}>
                        <s.I className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-slate-700 mt-1">{s.l}</span>
                      <span className="text-slate-400 text-[10px]">{s.t}</span>
                    </div>
                    {i < arr.length - 1 && <div className="flex-1 h-px bg-slate-200 mx-1" />}
                  </div>
                ))}
              </div>
            </Section>

            <Section icon={Trophy} iconColor="text-amber-500" title="SLA & Customer Outcomes" className="lg:col-span-3">
              <div className="divide-y divide-slate-100">
                <OutcomeRow icon={ShieldCheck}  label="SLA Compliance Today"        value="96.8%"   pct={96.8} />
                <OutcomeRow icon={Clock}        label="P1 Response SLA"             value="100%"    pct={100} />
                <OutcomeRow icon={Timer}        label="P2 Resolution SLA"           value="94%"     pct={94} />
                <OutcomeRow icon={Gauge}        label="Estimated Downtime Avoided"  value="6.5 hrs" pct={75} valueClass="text-indigo-600" color="bg-indigo-500" />
                <OutcomeRow icon={Users}        label="Tickets Deflected by Triage" value="31%"     pct={31} valueClass="text-indigo-600" color="bg-indigo-500" />
                <OutcomeRow icon={CheckCircle2} label="Escalations Prevented"       value="14"      pct={56} valueClass="text-indigo-600" color="bg-indigo-500" />
              </div>
              <div className="rounded-lg bg-indigo-50/70 border border-indigo-100 p-3 mt-3 flex gap-2">
                <Info className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                <p className="text-[11.5px] text-indigo-900 leading-snug">
                  Measures focus on customer impact, faster restoration, and reduction of avoidable escalations.
                </p>
              </div>
            </Section>
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
            <Section title="Incident Volume by Domain" className="lg:col-span-4">
              <div className="flex items-center gap-3 text-[10.5px] mb-2">
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 bg-indigo-500 rounded-sm" />Today</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 bg-indigo-200 rounded-sm" />Yesterday</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-0.5 border-t border-dashed border-slate-400" />7-Day Avg</span>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeData} margin={{ top: 10, right: 4, left: -10, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="today" fill="#6366f1" radius={[4,4,0,0]} />
                    <Bar dataKey="yest"  fill="#c7d2fe" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[11px] text-center text-slate-500 mt-1">Volume captured across correlated incidents</p>
            </Section>

            <Section icon={TrendingDown} iconColor="text-violet-600" title="Top Suspected Root Causes" className="lg:col-span-4">
              <div className="space-y-2.5">
                {causes.map((c) => (
                  <div key={c.n} className="flex items-center gap-3">
                    <span className="h-6 w-6 rounded-md bg-violet-100 text-violet-700 grid place-items-center text-[11px] font-bold shrink-0">{c.n}</span>
                    <span className="text-[12.5px] text-slate-800 flex-1">{c.label}</span>
                    <div className="w-28 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-violet-500" style={{ width: `${c.pct * 2}%` }} />
                    </div>
                    <span className="text-[12px] font-bold text-slate-700 w-8 text-right">{c.pct}%</span>
                  </div>
                ))}
              </div>
              <div className="rounded-lg bg-indigo-50/70 border border-indigo-100 p-3 mt-3 flex gap-2">
                <Info className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                <p className="text-[11.5px] text-indigo-900 leading-snug">
                  Root-cause patterns are learned from telemetry, past incidents, and recent environmental changes.
                </p>
              </div>
            </Section>

            <Section icon={CheckCircle2} iconColor="text-emerald-600" title="Recommended Next Actions" className="lg:col-span-4">
              <div className="space-y-1.5">
                {actions.map((a) => (
                  <div key={a.n} className="flex items-center gap-2 py-1.5 border-b border-slate-100 last:border-0">
                    <span className="h-6 w-6 rounded-md bg-emerald-100 text-emerald-700 grid place-items-center text-[11px] font-bold shrink-0">{a.n}</span>
                    <span className="text-[12px] text-slate-800 flex-1">{a.label}</span>
                    {sevPill(a.sev)}
                    {effortPill(a.eff)}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 text-[10px] mt-3 flex-wrap">
                <span className="font-semibold text-slate-600">Severity:</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" />High</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" />Medium</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-sky-500" />Low</span>
                <span className="font-semibold text-slate-600 ml-2">Effort:</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-sky-500" />Low</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" />Medium</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" />High</span>
              </div>
            </Section>
          </div>

          {/* How it works */}
          <Section icon={Brain} iconColor="text-indigo-600" title="How the Digital Co-Worker Works" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { n: 1, t: "Detect",       d: "Ingests alerts, events, and ticket signals in real time.",                                  c: "text-sky-600",     bg: "bg-sky-50",     Icon: Activity },
                { n: 2, t: "Correlate",    d: "Links incidents to CI relationships, services, owners, and recent changes.",               c: "text-teal-600",    bg: "bg-teal-50",    Icon: Network },
                { n: 3, t: "Reason",       d: "Suggests likely cause with confidence scoring across Network and Azure domains.",          c: "text-violet-600",  bg: "bg-violet-50",  Icon: Lightbulb },
                { n: 4, t: "Guide Action", d: "Recommends next best action to restore service faster and protect SLA performance.",        c: "text-emerald-600", bg: "bg-emerald-50", Icon: CheckCircle2 },
              ].map((s, i, arr) => (
                <div key={s.n} className="relative">
                  <div className="rounded-xl border border-slate-200 p-4 bg-white">
                    <div className={`h-10 w-10 rounded-full ${s.bg} grid place-items-center mb-2`}>
                      <s.Icon className={`h-5 w-5 ${s.c}`} />
                    </div>
                    <div className={`text-[13px] font-bold ${s.c}`}>{s.n} {s.t}</div>
                    <p className="text-[12px] text-slate-600 mt-1 leading-snug">{s.d}</p>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 text-slate-300">→</div>
                  )}
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </AppShell>
  );
}