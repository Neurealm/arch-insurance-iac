import { DashShell, KPI, Outcome, Section } from "@/components/carveout/DashShell";
import {
  CloudUpload, Users, Globe, Network, ShieldCheck, FileCheck, CheckCircle2,
  Search, ChevronDown, ChevronRight, Plus, Server, Cloud, Lock, Eye, Database,
  Cpu, Activity, Tag, DollarSign, FileText,
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useState } from "react";
import worldMap from "@/assets/world-map.png";

const kpis: KPI[] = [
  { label: "Landing Zones",          value: "6",      sub: "3 Azure | 3 AWS",              icon: CloudUpload, color: "text-blue-600",    bg: "bg-blue-50" },
  { label: "Accounts / Subscriptions", value: "24",   sub: "12 Azure | 12 AWS",            icon: Users,       color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Regions",                value: "14",     sub: "7 Azure | 7 AWS",              icon: Globe,       color: "text-violet-600",  bg: "bg-violet-50" },
  { label: "Network Connections",    value: "28",     sub: "ExpressRoute / Direct Connect",icon: Network,     color: "text-cyan-600",    bg: "bg-cyan-50" },
  { label: "Identities (Total)",     value: "18,642", sub: "Synced via Entra ID / IAM",    icon: Users,       color: "text-amber-600",   bg: "bg-amber-50" },
  { label: "Active Policies",        value: "156",    sub: "Guardrails Enforced",          icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Policy Compliance",      value: "96%",    sub: "+3% vs last 7 days",  subColor: "text-emerald-600", icon: FileCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
];

const wwh = {
  what: [
    "Landing zones (Azure, AWS) and account/subscription structure",
    "Identity, networking, and security baseline architecture",
    "Governance policies and guardrails",
    "Multi-cloud architecture design",
  ],
  why: ["A standardized, secure, and well-governed foundation ensures cloud adoption at scale with control, compliance, and operational consistency."],
  how: [
    "Centralized view of landing zones and accounts",
    "Architecture blueprints and reference designs",
    "Policy guardrails and compliance enforcement",
    "Drill-down from landing zone → account → services → policies",
  ],
};

const outcomes: Outcome[] = [
  { icon: CheckCircle2, color: "text-blue-600", title: "STANDARDIZED. GOVERNED. SECURE. SCALABLE.", l1: "Our landing zone framework ensures consistent architecture, strong security, and compliant cloud operations across Azure and AWS." },
];

type LZ = { name: string; sub: string; subs: string; region: string; provider: "azure" | "aws"; children?: { name: string }[] };
const azureZones: LZ[] = [
  { name: "AZ-LZ-PROD",     sub: "Production",     subs: "Subs: 4", region: "Region: 7", provider: "azure", children: [
    { name: "AZ-PROD-NET" }, { name: "AZ-PROD-APP" }, { name: "AZ-PROD-DATA" }, { name: "AZ-PROD-SHARED" }, { name: "AZ-PROD-MGMT" },
  ]},
  { name: "AZ-LZ-NONPROD",  sub: "Non-Production", subs: "Subs: 4", region: "Region: 7", provider: "azure" },
  { name: "AZ-LZ-PLATFORM", sub: "Shared Services",subs: "Subs: 4", region: "Region: 7", provider: "azure" },
];
const awsZones: LZ[] = [
  { name: "AWS-LZ-PROD",     sub: "Production",     subs: "Accts: 4", region: "Region: 7", provider: "aws", children: [
    { name: "AWS-PROD-NET" }, { name: "AWS-PROD-APP" }, { name: "AWS-PROD-DATA" }, { name: "AWS-PROD-MGMT" },
  ]},
  { name: "AWS-LZ-NONPROD",  sub: "Non-Production", subs: "Accts: 4", region: "Region: 7", provider: "aws" },
  { name: "AWS-LZ-PLATFORM", sub: "Shared Services",subs: "Accts: 4", region: "Region: 7", provider: "aws" },
];

const policies = [
  { n: "Allowed Regions",     cat: "Governance",     scope: "All",      comp: "100%" },
  { n: "Require Tagging",     cat: "Cost Management",scope: "All",      comp: "98%" },
  { n: "Allowed VM Sizes",    cat: "Security",       scope: "Workload", comp: "95%" },
  { n: "Public IP Restriction",cat: "Security",      scope: "Prod",     comp: "100%" },
  { n: "Encryption at Rest",  cat: "Security",       scope: "All",      comp: "100%" },
  { n: "Backup Policy",       cat: "Resiliency",     scope: "All",      comp: "93%" },
  { n: "Log Retention",       cat: "Governance",     scope: "All",      comp: "97%" },
  { n: "MFA for Privileged",  cat: "Identity",       scope: "All",      comp: "100%" },
];

const archHealth = [
  { l: "Security",   v: "96%", icon: ShieldCheck, c: "text-emerald-600" },
  { l: "Networking", v: "94%", icon: Network,     c: "text-blue-600" },
  { l: "Identity",   v: "98%", icon: Users,       c: "text-violet-600" },
  { l: "Compliance", v: "95%", icon: FileCheck,   c: "text-emerald-600" },
  { l: "Cost Mgmt",  v: "92%", icon: DollarSign,  c: "text-amber-600" },
];

const recentChanges = [
  { d: "May 12, 2025 10:15 AM", c: "Added Subnet to Hub VNet",   lz: "AZ-LZ-PLATFORM", impact: "Low",    ic: "text-emerald-700" },
  { d: "May 12, 2025 09:42 AM", c: "Enabled AWS Backup Policy",  lz: "AWS-LZ-PROD",    impact: "Medium", ic: "text-amber-700" },
  { d: "May 11, 2025 04:18 PM", c: "Updated NSG Rule",           lz: "AZ-LZ-PROD",     impact: "Low",    ic: "text-emerald-700" },
  { d: "May 11, 2025 11:03 AM", c: "Added New Account",          lz: "AWS-LZ-NONPROD", impact: "Low",    ic: "text-emerald-700" },
];

const distribution = [
  { name: "Azure", value: 12, color: "hsl(217 91% 60%)" },
  { name: "AWS",   value: 12, color: "hsl(33 91% 55%)" },
];

const guardrails = [
  { l: "Naming Standards",   icon: FileText },
  { l: "Tagging Standards",  icon: Tag },
  { l: "Security Baselines", icon: ShieldCheck },
  { l: "Cost Management",    icon: DollarSign },
  { l: "Compliance Controls",icon: FileCheck },
];

function LzNode({ z }: { z: LZ }) {
  const [open, setOpen] = useState(z.children ? true : false);
  const ProviderIcon = z.provider === "azure" ? Cloud : Server;
  return (
    <div>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-1.5 py-1 text-[11px] hover:bg-slate-50 rounded px-1">
        {z.children ? (open ? <ChevronDown className="h-3 w-3 text-slate-500" /> : <ChevronRight className="h-3 w-3 text-slate-500" />) : <span className="w-3" />}
        <ProviderIcon className={`h-3 w-3 ${z.provider === "azure" ? "text-blue-600" : "text-amber-600"}`} />
        <span className="font-semibold text-slate-900">{z.name}</span>
        <span className="text-slate-500">({z.sub})</span>
        <span className="ml-auto text-[9px] text-slate-500">{z.subs} | {z.region}</span>
      </button>
      {open && z.children && (
        <div className="ml-5 border-l border-slate-200 pl-2 space-y-0.5">
          {z.children.map((c) => (
            <div key={c.name} className="flex items-center gap-1.5 text-[10px] text-slate-700 py-0.5">
              <Database className="h-2.5 w-2.5 text-slate-400" />{c.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const ServiceBox = ({ icon: Icon, label }: { icon: any; label: string }) => (
  <div className="flex flex-col items-center gap-1 px-2 py-1.5 rounded border border-slate-200 bg-white">
    <Icon className="h-4 w-4 text-blue-600" />
    <span className="text-[9px] font-semibold text-slate-700 text-center leading-tight">{label}</span>
  </div>
);

export default function LandingZone() {
  return (
    <DashShell
      title="CLOUD ARCHITECTURE & LANDING ZONE CONTROL PLANE"
      subtitle="Architectural authority and governance across Azure and AWS landing zones"
      wwh={wwh}
      kpis={kpis}
      outcomes={outcomes}
    >
      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Landing Zones tree */}
        <Section title="Landing Zones & Accounts" className="lg:col-span-3">
          <div className="relative mb-2">
            <Search className="h-3 w-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
            <input className="w-full pl-7 pr-2 py-1.5 text-[11px] border border-slate-200 rounded-lg" placeholder="Search landing zones, accounts..." />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-700"><Cloud className="h-3 w-3" />Azure (3 Landing Zones)</div>
            {azureZones.map((z) => <LzNode key={z.name} z={z} />)}
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 mt-2"><Server className="h-3 w-3" />AWS (3 Landing Zones)</div>
            {awsZones.map((z) => <LzNode key={z.name} z={z} />)}
          </div>
          <button className="mt-3 flex items-center gap-1 text-[11px] text-blue-600 font-medium"><Plus className="h-3 w-3" />Create Landing Zone</button>
        </Section>

        {/* Reference Architecture */}
        <Section title="Reference Architecture Overview (Multi-Cloud)" className="lg:col-span-6">
          <div className="grid grid-cols-12 gap-3 items-stretch">
            {/* On-prem column */}
            <div className="col-span-3 flex flex-col">
              <div className="text-[10px] font-bold text-slate-700 mb-2 text-center bg-slate-100 py-1 rounded">On-Premises / Data Centers</div>
              <div className="flex-1 flex flex-col justify-around gap-2">
                {["Corporate Data Center","Branch Locations","Partners / Vendors"].map((l) => (
                  <div key={l} className="flex items-center gap-2 px-2 py-3 border border-slate-200 rounded bg-white text-[10px]">
                    <Server className="h-4 w-4 text-slate-500 shrink-0" /><span className="text-slate-700 leading-tight">{l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Center: Cloud zones with arrows */}
            <div className="col-span-6 flex flex-col gap-2">
              <div className="flex-1 rounded-lg border border-blue-200 bg-blue-50/50 p-2 flex flex-col">
                <div className="text-[10px] font-bold text-blue-700 text-center mb-1.5">Azure Landing Zones</div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[{i:Cpu,l:"Management (Platform)"},{i:Network,l:"Connectivity"},{i:Activity,l:"Workload"}].map((b) => (
                    <div key={b.l} className="rounded bg-white border border-blue-100 p-2 text-center">
                      <b.i className="h-4 w-4 text-blue-600 mx-auto" />
                      <div className="text-[9px] font-bold text-slate-800 mt-0.5 leading-tight">{b.l}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-1 mt-2 text-[8px] text-slate-600 text-center">
                  <div>Identity<br/>Mgmt<br/>Monitoring</div>
                  <div>Hub VNet<br/>Firewall<br/>DNS</div>
                  <div>Apps<br/>Data<br/>Services</div>
                </div>
              </div>
              <div className="flex-1 rounded-lg border border-amber-200 bg-amber-50/50 p-2 flex flex-col">
                <div className="text-[10px] font-bold text-amber-700 text-center mb-1.5">AWS Landing Zones</div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[{i:Cpu,l:"Management (Platform)"},{i:Network,l:"Connectivity"},{i:Activity,l:"Workload"}].map((b) => (
                    <div key={b.l} className="rounded bg-white border border-amber-100 p-2 text-center">
                      <b.i className="h-4 w-4 text-amber-600 mx-auto" />
                      <div className="text-[9px] font-bold text-slate-800 mt-0.5 leading-tight">{b.l}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-1 mt-2 text-[8px] text-slate-600 text-center">
                  <div>IAM<br/>Organizations<br/>CloudWatch</div>
                  <div>Transit Gateway<br/>Firewall<br/>Route 53</div>
                  <div>Apps<br/>Data<br/>Services</div>
                </div>
              </div>
              <div className="flex items-center justify-around text-[9px] text-slate-600 pt-1">
                <span className="text-blue-700 font-semibold">← ExpressRoute</span>
                <span className="text-amber-700 font-semibold">← Direct Connect</span>
              </div>
            </div>

            {/* Shared services */}
            <div className="col-span-3 flex flex-col">
              <div className="text-[10px] font-bold text-slate-700 mb-2 text-center bg-slate-100 py-1 rounded">Shared Services</div>
              <div className="flex-1 flex flex-col justify-between gap-1.5">
                {[
                  {i:Users,l:"Identity",s:"Entra ID / IAM"},
                  {i:ShieldCheck,l:"Security",s:"SIEM / Defender"},
                  {i:Eye,l:"Observability",s:"Logs / Metrics"},
                  {i:Database,l:"Backup & DR",s:"Cross-Region"},
                  {i:Activity,l:"Automation",s:"IaC / Pipelines"},
                ].map((s) => (
                  <div key={s.l} className="flex items-center gap-2 px-2 py-1.5 border border-slate-200 rounded bg-white flex-1">
                    <s.i className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-slate-800 leading-tight">{s.l}</div>
                      <div className="text-[8px] text-slate-500 leading-tight">{s.s}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-slate-50 border border-slate-200 p-2.5">
            <div className="text-[10px] font-bold text-slate-700 text-center mb-1.5">Governance & Policy Guardrails (Applied Across All Landing Zones)</div>
            <div className="flex flex-wrap items-center justify-between gap-3 px-2">
              {guardrails.map((g) => (
                <div key={g.l} className="flex items-center gap-1 text-[10px] text-slate-700">
                  <g.icon className="h-3 w-3 text-emerald-600" />{g.l}
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Policies + Architecture Health */}
        <Section title="Governance Policies & Guardrails" action="View All Policies →" className="lg:col-span-3">
          <div className="flex gap-3 text-[10px] border-b border-slate-200 mb-2">
            <button className="font-bold text-blue-600 border-b-2 border-blue-600 pb-1">Active Policies</button>
            <button className="text-slate-500 pb-1">Policy Initiatives</button>
          </div>
          <table className="w-full text-[10px]">
            <thead className="text-[8px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-1">Policy Name</th>
                <th className="text-left py-1">Category</th>
                <th className="text-left py-1">Scope</th>
                <th className="text-right py-1">Compliance</th>
                <th className="text-right py-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {policies.map((p) => (
                <tr key={p.n} className="border-b border-slate-100">
                  <td className="py-1 font-medium text-slate-900">{p.n}</td>
                  <td className="py-1 text-slate-600">{p.cat}</td>
                  <td className="py-1 text-slate-600">{p.scope}</td>
                  <td className="py-1 text-right text-slate-700">{p.comp}</td>
                  <td className="py-1 text-right"><span className="inline-flex items-center gap-0.5 text-emerald-700"><CheckCircle2 className="h-2.5 w-2.5" />Compliant</span></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-900">Architecture Health</span>
              <a className="text-[10px] text-blue-600 font-medium">View Details →</a>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {archHealth.map((a) => {
                const Icon = a.icon;
                return (
                  <div key={a.l} className="rounded-lg border border-slate-200 p-1.5 text-center">
                    <Icon className={`h-3 w-3 ${a.c} mx-auto`} />
                    <div className="text-[8px] text-slate-500 mt-0.5 leading-tight">{a.l}</div>
                    <div className="text-xs font-bold text-slate-900">{a.v}</div>
                    <div className="text-[8px] text-emerald-600">Healthy</div>
                  </div>
                );
              })}
            </div>
          </div>
        </Section>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
        <Section title="Multi-Cloud Distribution" className="lg:col-span-2">
          <div className="relative h-40">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={distribution} dataKey="value" nameKey="name" innerRadius={36} outerRadius={62} paddingAngle={2}>
                  {distribution.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 grid place-items-center pointer-events-none">
              <div className="text-center">
                <div className="text-base font-bold text-slate-900">24</div>
                <div className="text-[9px] text-slate-500">Total<br/>Accounts / Subs</div>
              </div>
            </div>
          </div>
          <div className="space-y-1 text-[11px]">
            {distribution.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm" style={{ background: d.color }} />
                <span className="text-slate-700">{d.name}</span>
                <span className="ml-auto font-semibold text-slate-900">{d.value} (50%)</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Region Coverage" className="lg:col-span-3">
          <div className="relative w-full aspect-[16/9] bg-slate-50 rounded overflow-hidden">
            <img src={worldMap} alt="World map" className="absolute inset-0 w-full h-full object-cover opacity-90" />
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9px] mt-2">
            <div className="flex items-center gap-1"><span className="h-2 w-3 bg-blue-700" />7+ Regions</div>
            <div className="flex items-center gap-1"><span className="h-2 w-3 bg-blue-500" />4 - 6 Regions</div>
            <div className="flex items-center gap-1"><span className="h-2 w-3 bg-blue-300" />1 - 3 Regions</div>
            <div className="flex items-center gap-1"><span className="h-2 w-3 bg-slate-200" />No Presence</div>
          </div>
        </Section>

        <Section title="Identity & Access Overview" className="lg:col-span-3">
          <div className="grid grid-cols-2 gap-2">
            {[
              { i: Users,       l: "Total Identities",      v: "18,642", c: "text-blue-600",    bg: "bg-blue-50" },
              { i: Lock,        l: "Privileged Identities", v: "1,256",  c: "text-violet-600",  bg: "bg-violet-50" },
              { i: ShieldCheck, l: "MFA Enabled",           v: "98%",    c: "text-emerald-600", bg: "bg-emerald-50" },
              { i: FileCheck,   l: "Access Reviews",        v: "100%", sub: "(On Track)", c: "text-amber-600",   bg: "bg-amber-50" },
            ].map((s) => {
              const Icon = s.i;
              return (
                <div key={s.l} className="rounded-lg border border-slate-200 p-2">
                  <div className={`h-7 w-7 rounded ${s.bg} ${s.c} grid place-items-center mb-1`}><Icon className="h-3.5 w-3.5" /></div>
                  <div className="text-base font-bold text-slate-900">{s.v} {s.sub && <span className="text-[9px] font-normal text-slate-500">{s.sub}</span>}</div>
                  <div className="text-[10px] text-slate-500">{s.l}</div>
                </div>
              );
            })}
          </div>
        </Section>

        <Section title="Recent Architecture Changes" action="View All →" className="lg:col-span-4">
          <table className="w-full text-[10px]">
            <thead className="text-[9px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="text-left py-1.5">Date / Time</th>
                <th className="text-left py-1.5">Change</th>
                <th className="text-left py-1.5">Landing Zone</th>
                <th className="text-right py-1.5">Impact</th>
              </tr>
            </thead>
            <tbody>
              {recentChanges.map((r) => (
                <tr key={r.d + r.c} className="border-b border-slate-100">
                  <td className="py-1.5 text-slate-600">{r.d}</td>
                  <td className="py-1.5 font-medium text-slate-900">{r.c}</td>
                  <td className="py-1.5 text-slate-700">{r.lz}</td>
                  <td className={`py-1.5 text-right font-semibold ${r.ic}`}>{r.impact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      </div>
    </DashShell>
  );
}
