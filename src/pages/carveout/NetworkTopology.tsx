import { DashShell, KPI, Outcome, Section, StatusPill } from "@/components/carveout/DashShell";
import {
  Globe, Building2, Cloud, Network, Link2, ShieldCheck, AlertTriangle,
  Server, Database, ChevronRight, Zap, Layers, Shuffle, Box,
  Radio, MapPin, ArrowRight,
} from "lucide-react";
import worldMap from "@/assets/world-regions-map.png";

const kpis: KPI[] = [
  { label: "Total Sites", value: "77", sub: "Across 24 Countries", subColor: "text-slate-500", icon: Globe, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Data Centers", value: "6", sub: "3 Regions", subColor: "text-slate-500", icon: Building2, color: "text-slate-700", bg: "bg-slate-100" },
  { label: "Cloud Regions", value: "8", sub: "3 Providers", subColor: "text-slate-500", icon: Cloud, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Network Devices", value: "1,248", sub: "Online: 1,172 (94%)", subColor: "text-emerald-600", icon: Network, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "WAN Links", value: "186", sub: "Healthy: 172 (92%)", subColor: "text-emerald-600", icon: Link2, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Redundancy Coverage", value: "98.3%", sub: "Meets Design Target", subColor: "text-emerald-600", icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Critical Alerts", value: "3", sub: "1 High, 2 Medium", subColor: "text-red-600", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
];

const regionMarkers = [
  { name: "NORTH AMERICA", sites: 18, x: 20, y: 30, color: "bg-blue-600" },
  { name: "EUROPE", sites: 21, x: 48, y: 26, color: "bg-blue-600" },
  { name: "ASIA PACIFIC", sites: 20, x: 76, y: 38, color: "bg-blue-600" },
  { name: "LATIN AMERICA", sites: 9, x: 30, y: 68, color: "bg-blue-600" },
  { name: "MIDDLE EAST & AFRICA", sites: 9, x: 55, y: 56, color: "bg-blue-600" },
];

const legend = [
  { l: "Core PoP", c: "bg-blue-600" },
  { l: "Regional Hub", c: "bg-cyan-500" },
  { l: "Edge Site", c: "bg-slate-400" },
  { l: "Data Center", c: "bg-slate-700" },
  { l: "Cloud Region", c: "bg-violet-500" },
];

const linkLegend = [
  { l: "MPLS", c: "bg-slate-700" },
  { l: "SD-WAN", c: "bg-emerald-500" },
  { l: "Internet", c: "bg-blue-500" },
  { l: "Cloud Connect", c: "bg-violet-500" },
];

const designAttrs = [
  { icon: Box, l: "Design Model", v: "Hybrid Mesh" },
  { icon: Shuffle, l: "Resilience", v: "Multi-Region" },
  { icon: Zap, l: "Traffic Steering", v: "Application Aware" },
  { icon: Layers, l: "Segmentation", v: "Policy Driven" },
];

const resilience = [
  { icon: Globe, title: "Multi-Region Core", v: "3 Core Regions", sub: "Active-Active" },
  { icon: Shuffle, title: "Dual Transport", v: "SD-WAN + MPLS", sub: "Automatic Failover" },
  { icon: ShieldCheck, title: "Edge Redundancy", v: "HA CPE / Devices", sub: "99.99% Target" },
  { icon: Network, title: "Path Diversity", v: "Multiple Paths", sub: "Per Application" },
];

const trafficFlows = [
  { from: "Branch Sites", fSub: "77 Sites", to: "Applications", tSub: "120+", color: "stroke-emerald-400" },
  { from: "Data Centers", fSub: "6 Sites", to: "SaaS / Internet", tSub: "Breakout", color: "stroke-blue-400" },
  { from: "Cloud Regions", fSub: "8 Regions", to: "Partner / External", tSub: "Networks", color: "stroke-violet-400" },
];

const topApps = [
  { app: "Microsoft 365", type: "SaaS", path: "Internet Breakout" },
  { app: "SAP S/4HANA", type: "Enterprise", path: "MPLS / SD-WAN" },
  { app: "Workday", type: "SaaS", path: "Internet Breakout" },
  { app: "Salesforce", type: "SaaS", path: "Internet Breakout" },
  { app: "Data Warehouse", type: "Enterprise", path: "MPLS / Private Link" },
];

const drillRecent = [
  { region: "Europe", site: "Frankfurt-01", device: "ISR-4451-X", path: "Frankfurt-01 → AWS (eu-central-1)", status: "Healthy" },
  { region: "Asia Pacific", site: "Singapore-03", device: "CPE-SGX-02", path: "Singapore-03 → Internet Breakout", status: "Healthy" },
  { region: "North America", site: "New York-02", device: "PA-5220", path: "New York-02 → Microsoft 365", status: "Degraded" },
  { region: "Latin America", site: "Sao Paulo-02", device: "ISR-4431", path: "Sao Paulo-02 → MPLS Backbone", status: "Healthy" },
];

const pathHops = [
  { name: "CPE-SGX-02", sub: "(Edge)", icon: Server },
  { name: "SD-WAN Edge", sub: "(Singapore)", icon: Network },
  { name: "ISP-1", sub: "(Local Breakout)", icon: Globe },
  { name: "Internet", sub: "(Global)", icon: Cloud },
  { name: "Microsoft 365", sub: "(SaaS)", icon: Box },
];

const pathStats = [
  { l: "Path Status", v: "Healthy", ok: true },
  { l: "Latency", v: "28 ms" },
  { l: "Jitter", v: "3 ms" },
  { l: "Packet Loss", v: "0.02%" },
  { l: "Uptime", v: "99.98%" },
];

const wwh = {
  what: [
    "Global network topology (core, edge, cloud, data centers)",
    "WAN architecture: SD-WAN, MPLS, Internet Breakout",
    "Redundancy and high availability design",
    "Traffic flows between sites, data centers, cloud and applications",
    "Drill-down from region → site → device → path",
  ],
  why: [
    "Provides design authority and full network visibility",
    "Ensures resilient, secure and independent network operations",
    "Optimizes performance with right traffic steering and path selection",
    "Reduces risk with redundancy, segmentation and clear dependencies",
    "Accelerates troubleshooting and change impact analysis",
  ],
  how: [
    "Automated discovery and topology modeling across hybrid environments",
    "Real-time telemetry, path analytics and dependency mapping",
    "Policy-driven architecture with embedded best practices",
    "Intent-based design with continuous validation and compliance",
    "Seamless drill-down for faster decision making and execution",
  ],
};

const outcomes: Outcome[] = [
  { icon: Zap, color: "text-blue-600", title: "High Performance", l1: "Application-aware routing" },
  { icon: ShieldCheck, color: "text-emerald-600", title: "Highly Resilient", l1: "Multi-path, auto-failover" },
  { icon: ShieldCheck, color: "text-violet-600", title: "Secure by Design", l1: "Zero Trust, segmentation" },
  { icon: Globe, color: "text-blue-600", title: "Global Scale", l1: "77 sites, 6 DCs, 8 cloud regions" },
  { icon: Cloud, color: "text-slate-700", title: "Operational Excellence", l1: "Real-time visibility and control" },
];

export default function NetworkTopology() {
  return (
    <DashShell
      title="NETWORK TOPOLOGY &"
      highlight="ARCHITECTURE CONTROL PLANE"
      subtitle="Global network architecture, traffic flows, and resilience design — built for independence, performance, and scale."
      wwh={wwh}
      kpis={kpis}
      outcomes={outcomes}
    >
      {/* Row 1: Topology + WAN + Resilience + Key Flows */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Topology map */}
        <div className="lg:col-span-6">
          <Section title="Global Network Topology">
            <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden bg-slate-50">
              <img src={worldMap} alt="World topology" className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale" />
              {/* SVG links */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <line x1="20" y1="30" x2="48" y2="26" stroke="hsl(217 91% 60%)" strokeWidth="0.3" strokeDasharray="1 1" />
                <line x1="48" y1="26" x2="76" y2="38" stroke="hsl(142 71% 45%)" strokeWidth="0.3" strokeDasharray="1 1" />
                <line x1="20" y1="30" x2="30" y2="68" stroke="hsl(38 92% 50%)" strokeWidth="0.3" />
                <line x1="48" y1="26" x2="55" y2="56" stroke="hsl(262 83% 58%)" strokeWidth="0.3" />
                <line x1="76" y1="38" x2="55" y2="56" stroke="hsl(217 91% 60%)" strokeWidth="0.3" strokeDasharray="1 1" />
                <line x1="20" y1="30" x2="76" y2="38" stroke="hsl(38 92% 50%)" strokeWidth="0.3" />
              </svg>
              {/* Region markers */}
              {regionMarkers.map((r) => (
                <div key={r.name} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${r.x}%`, top: `${r.y}%` }}>
                  <div className="rounded-md bg-white shadow border border-slate-200 px-2 py-1 text-center min-w-[78px]">
                    <div className="text-[9px] font-bold text-slate-800">{r.name}</div>
                    <div className="text-[9px] text-slate-600">{r.sites} Sites</div>
                  </div>
                  <div className={`mx-auto mt-1 h-3 w-3 rounded-full ${r.color} ring-2 ring-white shadow`} />
                </div>
              ))}
              {/* Legend overlay */}
              <div className="absolute left-2 bottom-2 bg-white/95 rounded-md border border-slate-200 p-2 text-[9px] space-y-0.5">
                <div className="font-bold text-slate-700 mb-1">LEGEND</div>
                {legend.map((l) => (
                  <div key={l.l} className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${l.c}`} />
                    <span className="text-slate-700">{l.l}</span>
                  </div>
                ))}
                <div className="border-t border-slate-200 my-1" />
                {linkLegend.map((l) => (
                  <div key={l.l} className="flex items-center gap-1.5">
                    <span className={`h-0.5 w-3 ${l.c}`} />
                    <span className="text-slate-700">{l.l}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* design attributes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
              {designAttrs.map((d) => {
                const Icon = d.icon;
                return (
                  <div key={d.l} className="rounded-lg border border-slate-200 p-2 flex items-center gap-2">
                    <div className="h-7 w-7 rounded-md bg-blue-50 text-blue-600 grid place-items-center"><Icon className="h-4 w-4" /></div>
                    <div>
                      <div className="text-[10px] text-slate-500">{d.l}</div>
                      <div className="text-xs font-semibold text-slate-800">{d.v}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        </div>

        {/* WAN Architecture */}
        <div className="lg:col-span-2">
          <Section title="WAN Architecture">
            <div className="flex flex-col items-center gap-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-center w-full">
                <Cloud className="h-6 w-6 mx-auto text-slate-600" />
                <div className="text-xs font-bold text-slate-800">Core Network</div>
                <div className="text-[10px] text-slate-500">Multi-Region Backbone</div>
              </div>
              <div className="grid grid-cols-2 gap-2 w-full">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-center">
                  <Network className="h-5 w-5 mx-auto text-emerald-600" />
                  <div className="text-[10px] font-bold text-slate-800">SD-WAN Overlay</div>
                  <div className="text-[9px] text-slate-500">Primary Transport</div>
                </div>
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-2 text-center">
                  <Radio className="h-5 w-5 mx-auto text-blue-600" />
                  <div className="text-[10px] font-bold text-slate-800">MPLS</div>
                  <div className="text-[9px] text-slate-500">Private Transport</div>
                </div>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-center w-full">
                <Globe className="h-5 w-5 mx-auto text-amber-600" />
                <div className="text-[10px] font-bold text-slate-800">Internet Breakout</div>
                <div className="text-[9px] text-slate-500">Local / Regional</div>
              </div>
              <div className="grid grid-cols-3 gap-2 w-full text-center text-[10px]">
                <div className="rounded border border-slate-200 p-1.5 font-semibold text-slate-700">Azure</div>
                <div className="rounded border border-slate-200 p-1.5 font-semibold text-slate-700">AWS</div>
                <div className="rounded border border-slate-200 p-1.5 font-semibold text-slate-700">Google Cloud</div>
              </div>
              <div className="grid grid-cols-3 gap-1 text-center text-[10px] w-full mt-1">
                <div><div className="font-bold text-slate-800">62</div><div className="text-slate-500">SD-WAN (81%)</div></div>
                <div><div className="font-bold text-slate-800">51</div><div className="text-slate-500">MPLS (66%)</div></div>
                <div><div className="font-bold text-slate-800">54</div><div className="text-slate-500">Breakout (70%)</div></div>
              </div>
            </div>
          </Section>
        </div>

        {/* Redundancy */}
        <div className="lg:col-span-2">
          <Section title="Redundancy & Resilience Design">
            <div className="space-y-3">
              {resilience.map((r) => {
                const Icon = r.icon;
                return (
                  <div key={r.title} className="flex items-start gap-2">
                    <div className="h-8 w-8 rounded-md bg-blue-50 text-blue-600 grid place-items-center shrink-0"><Icon className="h-4 w-4" /></div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-800">{r.title}</div>
                      <div className="text-[10px] text-slate-700">{r.v}</div>
                      <div className="text-[10px] text-emerald-600 font-medium">{r.sub}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        </div>

        {/* Key Traffic Flows */}
        <div className="lg:col-span-2">
          <Section title="Key Traffic Flows">
            <div className="space-y-2 text-[10px]">
              {trafficFlows.map((f) => (
                <div key={f.from} className="grid grid-cols-2 gap-1 items-center">
                  <div className="rounded border border-slate-200 p-1.5">
                    <div className="font-semibold text-slate-800">{f.from}</div>
                    <div className="text-slate-500">{f.fSub}</div>
                  </div>
                  <div className="rounded border border-slate-200 p-1.5">
                    <div className="font-semibold text-slate-800">{f.to}</div>
                    <div className="text-slate-500">{f.tSub}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <div className="text-[10px] font-bold text-slate-700 mb-1">Top Application Traffic</div>
              <table className="w-full text-[10px]">
                <thead className="text-slate-500">
                  <tr><th className="text-left py-1">Application</th><th className="text-left py-1">Type</th><th className="text-left py-1">Primary Path</th></tr>
                </thead>
                <tbody>
                  {topApps.map((a) => (
                    <tr key={a.app} className="border-t border-slate-100">
                      <td className="py-1 font-medium text-slate-800">{a.app}</td>
                      <td className="py-1 text-slate-600">{a.type}</td>
                      <td className="py-1 text-slate-600">{a.path}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </div>
      </div>

      {/* Row 2: Drill-down navigator + Quick Drill-Down + Path Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
        <div className="lg:col-span-3">
          <Section title="Drill-Down Navigator">
            <div className="text-[11px] text-slate-500 mb-3">Select a level to drill down</div>
            <div className="flex items-center gap-2">
              {[
                { i: Globe, l: "1. Region" },
                { i: Building2, l: "2. Site" },
                { i: Server, l: "3. Device" },
                { i: Network, l: "4. Path" },
              ].map((s, idx, arr) => {
                const I = s.i;
                return (
                  <div key={s.l} className="flex items-center gap-1">
                    <div className="rounded-lg border border-slate-200 p-2 w-16 text-center">
                      <I className="h-5 w-5 mx-auto text-blue-600" />
                      <div className="text-[10px] font-medium text-slate-700 mt-1">{s.l}</div>
                    </div>
                    {idx < arr.length - 1 && <ArrowRight className="h-3 w-3 text-slate-400" />}
                  </div>
                );
              })}
            </div>
          </Section>
        </div>

        <div className="lg:col-span-4">
          <Section title="Quick Drill-Down (Recent)">
            <table className="w-full text-[11px]">
              <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="text-left py-1.5">Region</th>
                  <th className="text-left py-1.5">Site</th>
                  <th className="text-left py-1.5">Device</th>
                  <th className="text-left py-1.5">Path / Destination</th>
                  <th className="text-left py-1.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {drillRecent.map((d, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-2 text-slate-700">{d.region}</td>
                    <td className="py-2 font-medium text-slate-800">{d.site}</td>
                    <td className="py-2 text-slate-700 font-mono text-[10px]">{d.device}</td>
                    <td className="py-2 text-slate-700">{d.path}</td>
                    <td className="py-2"><StatusPill status={d.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        </div>

        <div className="lg:col-span-5">
          <Section title="Path Visualization (Example)">
            <div className="flex items-center gap-1 overflow-x-auto pb-2">
              {pathHops.map((h, i) => {
                const I = h.icon;
                return (
                  <div key={h.name} className="flex items-center gap-1 shrink-0">
                    <div className="text-center w-20">
                      <div className="h-10 w-10 mx-auto rounded-full bg-blue-50 border border-blue-200 grid place-items-center"><I className="h-5 w-5 text-blue-600" /></div>
                      <div className="text-[10px] font-semibold text-slate-800 mt-1 truncate">{h.name}</div>
                      <div className="text-[9px] text-slate-500">{h.sub}</div>
                    </div>
                    {i < pathHops.length - 1 && <ChevronRight className="h-4 w-4 text-emerald-500 shrink-0" />}
                  </div>
                );
              })}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
              {pathStats.map((s) => (
                <div key={s.l} className="flex justify-between border-b border-slate-100 py-1">
                  <span className="text-slate-600">{s.l}</span>
                  <span className={`font-semibold ${s.ok ? "text-emerald-700" : "text-slate-800"}`}>{s.v}</span>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </DashShell>
  );
}
