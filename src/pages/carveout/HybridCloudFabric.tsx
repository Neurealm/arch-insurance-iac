import { DashShell, KPI, Outcome, Section } from "@/components/carveout/DashShell";
import {
  Globe, CheckCircle2, AlertTriangle, CloudUpload, Activity, ShieldCheck, Users,
  Building2, Cloud, Network, Info, Lock, Gauge, Eye,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend,
} from "recharts";

const kpis: KPI[] = [
  { label: "Total Connections",       value: "18",     sub: "6 On-Prem Sites | 2 Clouds", subColor: "text-slate-600",   icon: Globe,        color: "text-blue-600",    bg: "bg-blue-50" },
  { label: "Healthy Connections",     value: "16",     sub: "89%",                        subColor: "text-emerald-600", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Degraded Connections",    value: "2",      sub: "11%",                        subColor: "text-amber-600",   icon: AlertTriangle,color: "text-amber-600",   bg: "bg-amber-50" },
  { label: "Total Throughput (All Links)", value: "12.4 Gbps", sub: "+18% vs last 7 days", subColor: "text-emerald-600", icon: CloudUpload, color: "text-blue-600",    bg: "bg-blue-50" },
  { label: "Avg. Latency (All Links)",     value: "28 ms",     sub: "-5 ms vs last 7 days", subColor: "text-emerald-600", icon: Activity,    color: "text-violet-600",  bg: "bg-violet-50" },
  { label: "Security Status",         value: "Compliant", sub: "100%",                   subColor: "text-emerald-600", icon: ShieldCheck,  color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Identity Integration",    value: "Healthy",   sub: "All systems operational",subColor: "text-emerald-600", icon: Users,        color: "text-emerald-600", bg: "bg-emerald-50" },
];

const wwh = {
  what: [
    "Connectivity between data centers and cloud (VPN, ExpressRoute, Direct Connect)",
    "Traffic flows between hybrid environments",
    "Latency and throughput metrics",
    "Integration with identity and application layers",
  ],
  why: ["Hybrid is the operating model for the foreseeable future. This dashboard ensures reliable, secure, and high-performance integration across on-prem and cloud to support applications and users everywhere."],
  how: [
    "Monitor and visualize all hybrid connectivity links and services",
    "Track traffic flows, performance, and experience in real time",
    "Correlate identity and application integration health",
    "Proactively detect issues and provide remediation insights",
  ],
};

const outcomes: Outcome[] = [
  { icon: Info,        color: "text-blue-600",    title: "KEY TAKEAWAY", l1: "Our hybrid connectivity fabric is secure, high-performing, and fully integrated across on-prem and cloud. It delivers the reliability and visibility needed to run critical applications and modernize at your pace." },
  { icon: Lock,        color: "text-slate-700",   title: "SECURE",       l1: "End-to-end encryption" },
  { icon: ShieldCheck, color: "text-emerald-600", title: "RELIABLE",     l1: "99.99% link availability" },
  { icon: Gauge,       color: "text-blue-600",    title: "PERFORMANT",   l1: "Optimized routing" },
  { icon: Eye,         color: "text-violet-600",  title: "VISIBLE",      l1: "End-to-end observability" },
];

const sites = [
  { name: "US East DC",  loc: "Ashland, MA" },
  { name: "US West DC",  loc: "Pleasanton, CA" },
  { name: "EMEA DC",     loc: "Manchester, UK" },
  { name: "APAC DC",     loc: "Singapore" },
];

const links = [
  { n: "US East DC – Azure East US",   t: "ExpressRoute",  f: "US East DC", to: "Azure East US",     s: "ok",   tp: "2.1 Gbps", lat: "18 ms" },
  { n: "US East DC – AWS us-east-1",   t: "Direct Connect", f: "US East DC", to: "AWS us-east-1",    s: "ok",   tp: "1.8 Gbps", lat: "20 ms" },
  { n: "US West DC – Azure West US",   t: "ExpressRoute",  f: "US West DC", to: "Azure West US",     s: "ok",   tp: "1.6 Gbps", lat: "22 ms" },
  { n: "US West DC – AWS us-west-2",   t: "Direct Connect", f: "US West DC", to: "AWS us-west-2",    s: "ok",   tp: "1.2 Gbps", lat: "23 ms" },
  { n: "EMEA DC – Azure West Europe",  t: "ExpressRoute",  f: "EMEA DC",    to: "Azure West Europe", s: "warn", tp: "1.1 Gbps", lat: "41 ms" },
  { n: "EMEA DC – AWS eu-central-1",   t: "Direct Connect", f: "EMEA DC",    to: "AWS eu-central-1", s: "ok",   tp: "0.9 Gbps", lat: "39 ms" },
  { n: "APAC DC – Azure Southeast Asia", t: "ExpressRoute", f: "APAC DC",   to: "Azure Southeast Asia", s: "ok", tp: "1.0 Gbps", lat: "47 ms" },
  { n: "APAC DC – AWS ap-southeast-2", t: "Direct Connect", f: "APAC DC",    to: "AWS ap-southeast-2", s: "warn", tp: "0.7 Gbps", lat: "52 ms" },
  { n: "Site-to-Site VPN (Global)",    t: "IPsec VPN",     f: "All Sites",  to: "Clouds",            s: "ok",   tp: "2.0 Gbps", lat: "55 ms" },
];

const flows = [
  { src: "US East DC", dst: "Azure East US",      tb: "2.8 TB", pct: 22 },
  { src: "US West DC", dst: "AWS us-west-2",      tb: "2.3 TB", pct: 18 },
  { src: "EMEA DC",    dst: "Azure West Europe",  tb: "1.9 TB", pct: 15 },
  { src: "US East DC", dst: "AWS us-east-1",      tb: "1.6 TB", pct: 13 },
  { src: "APAC DC",    dst: "AWS ap-southeast-2", tb: "1.2 TB", pct: 9  },
  { src: "EMEA DC",    dst: "AWS eu-central-1",   tb: "0.9 TB", pct: 7  },
  { src: "APAC DC",    dst: "Azure Southeast Asia", tb: "0.8 TB", pct: 6 },
  { src: "Other",      dst: "Other",              tb: "0.9 TB", pct: 7  },
];

const perf = Array.from({ length: 7 }, (_, i) => {
  const day = `May ${9 + i}`;
  return {
    day,
    Throughput: 10 + Math.round(Math.sin(i / 1.6) * 3 + i * 0.3),
    Latency:    30 + Math.round(Math.cos(i / 1.4) * 6),
  };
});

const identity = [
  { s: "Azure AD",                st: "Healthy", sync: "1 min ago", note: "All systems operational" },
  { s: "AWS IAM Identity Center", st: "Healthy", sync: "2 min ago", note: "All systems operational" },
  { s: "On-Prem AD",              st: "Healthy", sync: "1 min ago", note: "Replication healthy" },
  { s: "Okta",                    st: "Healthy", sync: "2 min ago", note: "SSO and provisioning OK" },
];

const apps = [
  { tier: "CRM",            st: "Healthy",  sc: "text-emerald-600", ux: 98, dep: "All Healthy",          dc: "text-emerald-600", bar: "hsl(142 71% 45%)" },
  { tier: "ERP",            st: "Healthy",  sc: "text-emerald-600", ux: 96, dep: "All Healthy",          dc: "text-emerald-600", bar: "hsl(142 71% 45%)" },
  { tier: "Data & Analytics", st: "Degraded", sc: "text-amber-600", ux: 91, dep: "1 Dependency Warning", dc: "text-amber-600",   bar: "hsl(38 92% 50%)" },
  { tier: "PLM",            st: "Healthy",  sc: "text-emerald-600", ux: 97, dep: "All Healthy",          dc: "text-emerald-600", bar: "hsl(142 71% 45%)" },
  { tier: "Collaboration",  st: "Healthy",  sc: "text-emerald-600", ux: 99, dep: "All Healthy",          dc: "text-emerald-600", bar: "hsl(142 71% 45%)" },
];

const alerts = [
  { i: AlertTriangle, c: "text-amber-600",   t: "High latency detected on APAC DC – AWS ap-southeast-2", sub: "Latency: 52 ms",       time: "10:24 AM" },
  { i: Info,          c: "text-blue-600",    t: "Throughput high on US East DC – Azure East US",        sub: "Throughput: 2.1 Gbps", time: "9:48 AM" },
  { i: CheckCircle2,  c: "text-emerald-600", t: "All identity services operational",                    sub: "",                     time: "9:15 AM" },
];

const StatusDot = ({ s }: { s: string }) =>
  s === "ok" ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 inline" /> :
  s === "warn" ? <AlertTriangle className="h-3.5 w-3.5 text-amber-600 inline" /> :
  <span className="text-slate-400">—</span>;

export default function HybridCloudFabric() {
  return (
    <DashShell
      title="HYBRID CLOUD CONNECTIVITY & INTEGRATION FABRIC"
      subtitle="Seamless, secure, and performant connectivity between on-premises environments and cloud platforms"
      wwh={wwh}
      kpis={kpis}
      outcomes={outcomes}
    >
      {/* Row 1: Topology + Links + Top Talkers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Section title="Hybrid Connectivity Topology" className="lg:col-span-4">
          <div className="relative min-h-[300px]">
            {/* SVG curved connection lines (behind cards) */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 400 300"
              preserveAspectRatio="none"
              style={{ zIndex: 0 }}
            >
              {/* Left cards right-edge ~ x=170 ; Core left-edge ~ x=185, right-edge ~ x=215 ; Right cards left-edge ~ x=232 */}
              {/* On-Prem -> Network Core */}
              <path d="M 170,48 C 178,48 178,150 185,150" stroke="hsl(142 71% 45%)" strokeWidth="1.6" fill="none" />
              <path d="M 170,108 C 180,108 180,150 185,150" stroke="hsl(217 91% 60%)" strokeWidth="1.6" fill="none" />
              <path d="M 170,168 C 180,168 180,150 185,150" stroke="hsl(142 71% 45%)" strokeWidth="1.6" fill="none" />
              <path d="M 170,228 C 178,228 178,150 185,150" stroke="hsl(217 91% 60%)" strokeWidth="1.6" fill="none" />
              {/* Core -> Cloud (Azure top, AWS bottom) */}
              <path d="M 215,144 C 224,144 224,80 232,80" stroke="hsl(142 71% 45%)" strokeWidth="1.6" fill="none" />
              <path d="M 215,150 C 224,150 224,86 232,86" stroke="hsl(271 76% 60%)" strokeWidth="1.4" fill="none" strokeDasharray="4 3" />
              <path d="M 215,156 C 224,156 224,210 232,210" stroke="hsl(217 91% 60%)" strokeWidth="1.6" fill="none" />
              <path d="M 215,162 C 224,162 224,216 232,216" stroke="hsl(330 81% 60%)" strokeWidth="1.4" fill="none" strokeDasharray="4 3" />
            </svg>

            <div className="relative grid grid-cols-12 gap-3 items-center h-[300px]" style={{ zIndex: 1 }}>
              <div className="col-span-5 space-y-2">
                <div className="text-[10px] font-bold text-slate-700 mb-1">On-Premises Data Centers</div>
                {sites.map((s) => (
                  <div key={s.name} className="flex items-center gap-2 px-2 py-1.5 border border-slate-200 rounded-lg bg-white text-[10px] shadow-sm">
                    <Building2 className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 leading-tight">{s.name}</div>
                      <div className="text-slate-500 leading-tight text-[9px]">{s.loc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="col-span-2 grid place-items-center">
                <div className="h-14 w-14 rounded-lg bg-blue-50 border border-blue-300 grid place-items-center shadow-sm">
                  <Network className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-[10px] text-slate-700 font-semibold mt-1.5 text-center">Network Core</div>
              </div>
              <div className="col-span-5 space-y-3">
                <div className="text-[10px] font-bold text-slate-700 mb-1 text-right">Cloud Platforms</div>
                <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
                  <div className="flex items-start gap-2">
                    <Cloud className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <div className="text-[11px] font-bold text-slate-900">Microsoft Azure</div>
                      <div className="text-[9px] text-slate-500">East US, West Europe</div>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
                  <div className="flex items-start gap-2">
                    <Cloud className="h-4 w-4 text-amber-600 mt-0.5" />
                    <div>
                      <div className="text-[11px] font-bold text-slate-900">Amazon Web Services</div>
                      <div className="text-[9px] text-slate-500 leading-tight">US East (N. Virginia),<br/>EU (Frankfurt),<br/>APAC (Sydney)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] mt-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5"><span className="h-0.5 w-5" style={{ background: "hsl(142 71% 45%)" }} />ExpressRoute</div>
            <div className="flex items-center gap-1.5"><span className="h-0.5 w-5" style={{ background: "hsl(217 91% 60%)" }} />AWS Direct Connect</div>
            <div className="flex items-center gap-1.5"><svg width="20" height="2"><line x1="0" y1="1" x2="20" y2="1" stroke="hsl(217 91% 60%)" strokeWidth="1.5" strokeDasharray="3 2"/></svg>IPsec VPN</div>
            <div className="flex items-center gap-1.5"><svg width="20" height="2"><line x1="0" y1="1" x2="20" y2="1" stroke="hsl(330 81% 60%)" strokeWidth="1.5" strokeDasharray="3 2"/></svg>Internet (Optimized)</div>
          </div>
        </Section>

        <Section title="Connectivity Links Overview" className="lg:col-span-4">
          <table className="w-full text-[10px]">
            <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-1.5">Connection Name</th>
                <th className="text-left py-1.5">Type</th>
                <th className="text-left py-1.5">From</th>
                <th className="text-left py-1.5">To</th>
                <th className="text-center py-1.5">Status</th>
                <th className="text-right py-1.5">Throughput</th>
                <th className="text-right py-1.5">Latency</th>
              </tr>
            </thead>
            <tbody>
              {links.map((l) => (
                <tr key={l.n} className="border-b border-slate-100">
                  <td className="py-1 font-medium text-slate-900 leading-tight">{l.n}</td>
                  <td className="py-1 text-slate-600">{l.t}</td>
                  <td className="py-1 text-slate-600">{l.f}</td>
                  <td className="py-1 text-slate-600">{l.to}</td>
                  <td className="py-1 text-center"><StatusDot s={l.s} /></td>
                  <td className="py-1 text-right text-slate-700">{l.tp}</td>
                  <td className="py-1 text-right text-slate-700">{l.lat}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <a className="text-[11px] text-blue-600 font-medium mt-2 inline-block">View all connections →</a>
        </Section>

        <Section title="Traffic Flows (Top Talkers)" className="lg:col-span-4">
          <table className="w-full text-[10px]">
            <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-1.5">Source</th>
                <th className="text-left py-1.5">Destination</th>
                <th className="text-right py-1.5">Data Transfer (7D)</th>
                <th className="text-left py-1.5 pl-2">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {flows.map((f) => (
                <tr key={f.src + f.dst} className="border-b border-slate-100">
                  <td className="py-1.5 font-medium text-slate-900">{f.src}</td>
                  <td className="py-1.5 text-slate-600">{f.dst}</td>
                  <td className="py-1.5 text-right text-slate-700">{f.tb}</td>
                  <td className="py-1.5 pl-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-[60px]">
                        <div className="h-full rounded-full" style={{ width: `${f.pct * 4}%`, background: "hsl(217 91% 60%)" }} />
                      </div>
                      <span className="font-semibold text-slate-900 w-8 text-right">{f.pct}%</span>
                    </div>
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-slate-200">
                <td className="py-1.5 font-bold text-slate-900" colSpan={2}>Total (7 Days)</td>
                <td className="py-1.5 text-right font-bold text-slate-900">12.4 TB</td>
                <td className="py-1.5 pl-2 font-bold text-slate-900">100%</td>
              </tr>
            </tbody>
          </table>
        </Section>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
        <Section title="Performance Trends (All Links)" className="lg:col-span-3">
          <div className="h-48">
            <ResponsiveContainer>
              <LineChart data={perf} margin={{ top: 5, right: 0, left: -10, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fontSize: 9 }} />
                <YAxis yAxisId="l" tick={{ fontSize: 9 }} label={{ value: "Throughput (Gbps)", angle: -90, position: "insideLeft", fontSize: 9, fill: "#64748b" }} />
                <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 9 }} label={{ value: "Latency (ms)", angle: 90, position: "insideRight", fontSize: 9, fill: "#64748b" }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 9 }} />
                <Line yAxisId="l" type="monotone" dataKey="Throughput" name="Throughput (Gbps)" stroke="hsl(217 91% 60%)" strokeWidth={2} dot={{ r: 2 }} />
                <Line yAxisId="r" type="monotone" dataKey="Latency"    name="Latency (ms)"    stroke="hsl(262 83% 58%)" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section title="Identity Integration Health" className="lg:col-span-3">
          <table className="w-full text-[10px]">
            <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-1.5">Service</th>
                <th className="text-left py-1.5">Status</th>
                <th className="text-left py-1.5">Last Sync</th>
                <th className="text-left py-1.5">Notes</th>
              </tr>
            </thead>
            <tbody>
              {identity.map((r) => (
                <tr key={r.s} className="border-b border-slate-100">
                  <td className="py-1.5 font-medium text-slate-900">{r.s}</td>
                  <td className="py-1.5"><span className="inline-flex items-center gap-1 text-emerald-700 font-semibold"><CheckCircle2 className="h-3 w-3" />{r.st}</span></td>
                  <td className="py-1.5 text-slate-600">{r.sync}</td>
                  <td className="py-1.5 text-slate-600">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <a className="text-[11px] text-blue-600 font-medium mt-2 inline-block">View identity dashboard →</a>
        </Section>

        <Section title="Application Integration Health" className="lg:col-span-3">
          <table className="w-full text-[10px]">
            <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-1.5">Application Tier</th>
                <th className="text-left py-1.5">Status</th>
                <th className="text-left py-1.5 pl-1">User Experience (7D)</th>
                <th className="text-left py-1.5">Dependencies</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a.tier} className="border-b border-slate-100">
                  <td className="py-1.5 font-medium text-slate-900">{a.tier}</td>
                  <td className="py-1.5"><span className={`inline-flex items-center gap-1 font-semibold ${a.sc}`}>{a.st === "Healthy" ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}{a.st}</span></td>
                  <td className="py-1.5 pl-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-900 w-7 text-[10px]">{a.ux}%</span>
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-[50px]">
                        <div className="h-full rounded-full" style={{ width: `${a.ux}%`, background: a.bar }} />
                      </div>
                    </div>
                  </td>
                  <td className={`py-1.5 ${a.dc} font-medium`}>{a.dep}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <a className="text-[11px] text-blue-600 font-medium mt-2 inline-block">View application dashboard →</a>
        </Section>

        <Section title="Integration Fabric Alerts" className="lg:col-span-3">
          <div className="space-y-2.5">
            {alerts.map((a) => {
              const Icon = a.i;
              return (
                <div key={a.t} className="flex items-start gap-2 text-[11px]">
                  <Icon className={`h-4 w-4 ${a.c} shrink-0 mt-0.5`} />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-slate-900 leading-tight">{a.t}</div>
                    {a.sub && <div className="text-slate-500 text-[10px] leading-tight">{a.sub}</div>}
                  </div>
                  <div className="text-[10px] text-slate-500 shrink-0">{a.time}</div>
                </div>
              );
            })}
          </div>
          <a className="text-[11px] text-blue-600 font-medium mt-3 inline-block">View all alerts →</a>
        </Section>
      </div>
    </DashShell>
  );
}
