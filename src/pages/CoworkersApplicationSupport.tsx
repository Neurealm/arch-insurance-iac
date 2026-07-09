import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/eoc/AppShell";
import {
  Bot, CheckCircle, Rocket, Activity, Clock, Award, DollarSign, Star, Search,
  Database, Workflow, GitBranch, Sparkles, Shield, Network,
} from "lucide-react";

type Tag = "Big Data & Platform" | "Integration & APIs" | "Data Pipelines";

type Coworker = {
  name: string;
  tag: Tag;
  badge: "Popular" | "New";
  icon: any;
  color: string;
  bg: string;
  desc: string;
  caps: string[];
  impact: { l: string; v: string; up?: boolean }[];
  integrations: string[];
};

const coworkers: Coworker[] = [
  {
    name: "Hadoop Health Precheck Agent",
    tag: "Big Data & Platform",
    badge: "Popular",
    icon: Database,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    desc: "Runs pre-batch health checks across Hadoop clusters — HDFS, YARN, Hive, and edge nodes — to prevent job failures before they start.",
    caps: [
      "Validates HDFS capacity, block health, and NameNode state",
      "Checks YARN queue capacity and RM/NM health",
      "Verifies Hive metastore, Ranger, and Kerberos tickets",
      "Auto-opens tickets with remediation runbooks",
    ],
    impact: [
      { l: "Failed Jobs", v: "↓ 62%" },
      { l: "SLA Adherence", v: "↑ 99.4%", up: true },
    ],
    integrations: ["Cloudera", "Hortonworks", "ServiceNow"],
  },
  {
    name: "Integration Monitoring Agent",
    tag: "Integration & APIs",
    badge: "Popular",
    icon: Workflow,
    color: "text-blue-600",
    bg: "bg-blue-50",
    desc: "Continuously monitors integration flows across ESB, iPaaS, and API gateways — correlating latency, error rates, and payload anomalies.",
    caps: [
      "End-to-end tracing across MuleSoft / Boomi / Kafka",
      "Detects schema drift and payload anomalies",
      "Correlates upstream/downstream failures",
      "Auto-notifies owners with root-cause context",
    ],
    impact: [
      { l: "MTTD", v: "↓ 71%" },
      { l: "Uptime", v: "↑ 99.95%", up: true },
    ],
    integrations: ["MuleSoft", "Boomi", "Kafka", "Apigee"],
  },
  {
    name: "ETL Pipeline Trace Co-worker",
    tag: "Data Pipelines",
    badge: "New",
    icon: GitBranch,
    color: "text-violet-600",
    bg: "bg-violet-50",
    desc: "Traces ETL pipelines end-to-end across ingestion, transformation, and load — pinpointing the exact stage, dataset, and row-level failure.",
    caps: [
      "Lineage-aware pipeline tracing (Airflow, ADF, Informatica)",
      "Identifies failing task, dataset, and record",
      "Suggests replay and backfill strategy",
      "Publishes SLA & data freshness scorecards",
    ],
    impact: [
      { l: "RCA Time", v: "↓ 78%" },
      { l: "Data Freshness", v: "↑ 96%", up: true },
    ],
    integrations: ["Airflow", "Informatica", "Azure Data Factory", "dbt"],
  },
];

const categories = ["All Categories", "Big Data & Platform", "Integration & APIs", "Data Pipelines"];

const tagColor: Record<Tag, string> = {
  "Big Data & Platform": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Integration & APIs": "bg-blue-50 text-blue-700 border-blue-200",
  "Data Pipelines": "bg-violet-50 text-violet-700 border-violet-200",
};

const kpis = [
  { icon: Bot, label: "Total Coworkers", value: "3", sub: "Available", color: "text-blue-600", bg: "bg-blue-50" },
  { icon: CheckCircle, label: "Active Coworkers", value: "3", sub: "Running", color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: Rocket, label: "Checks Executed (24h)", value: "1,284", sub: "↑ 22% vs last 24h", color: "text-amber-600", bg: "bg-amber-50" },
  { icon: Activity, label: "Issues Resolved (24h)", value: "196", sub: "↑ 31% vs last 24h", color: "text-violet-600", bg: "bg-violet-50" },
  { icon: Clock, label: "Avg. Time Saved (24h)", value: "92 hrs", sub: "↓ 38% vs last 7 days", color: "text-blue-600", bg: "bg-blue-50" },
  { icon: Award, label: "Success Rate (30 Days)", value: "98.9%", sub: "Excellent", color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: DollarSign, label: "Estimated Savings (MTD)", value: "$118K", sub: "↑ 17% vs last month", color: "text-amber-600", bg: "bg-amber-50" },
  { icon: Star, label: "Average Rating", value: "4.8 / 5", sub: "★★★★★", color: "text-violet-600", bg: "bg-violet-50" },
];

export default function CoworkersApplicationSupport() {
  const [activeCat, setActiveCat] = useState("All Categories");
  const filtered = activeCat === "All Categories" ? coworkers : coworkers.filter((c) => c.tag === activeCat);

  return (
    <AppShell>
      <main className="flex-1 px-6 py-5 bg-slate-50/50 animate-fade-in min-w-0">
        <div className="mb-5">
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 uppercase">
            Digital Coworker Marketplace – <span className="text-slate-700">Application Support</span>
          </h1>
          <p className="text-sm italic text-slate-600 mt-1">
            Deploy AI coworkers that keep big-data platforms, integrations, and ETL pipelines healthy 24x7.
          </p>
        </div>

        {/* WWH */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {[
            { tone: "blue", title: "WHAT", subtitle: "What this marketplace shows", items: [
              "Digital coworker profiles for Application Support",
              "Coverage across Hadoop, integrations, and ETL pipelines",
              "Capabilities, use cases, and measurable outcomes",
              "Ratings and usage metrics from real deployments",
            ]},
            { tone: "green", title: "WHY", subtitle: "Why it matters", items: [
              "Prevent batch and pipeline failures before they impact SLAs",
              "Cut integration incident MTTR with AI-driven correlation",
              "Reduce manual L2/L3 toil across data platforms",
              "Improve data freshness, quality, and trust",
            ]},
            { tone: "purple", title: "HOW", subtitle: "How it works", items: [
              "Browse coworkers by capability or platform",
              "View details, impact, and integrations before deploying",
              "One-click deploy with guardrails and approval workflows",
              "Monitor performance and continuously optimize",
            ]},
          ].map((c) => {
            const tones: any = {
              blue: { bg: "bg-blue-50", border: "border-l-blue-500", title: "text-blue-700", icon: "text-blue-600" },
              green: { bg: "bg-emerald-50", border: "border-l-emerald-500", title: "text-emerald-700", icon: "text-emerald-600" },
              purple: { bg: "bg-violet-50", border: "border-l-violet-500", title: "text-violet-700", icon: "text-violet-600" },
            };
            const t = tones[c.tone];
            return (
              <div key={c.title} className={`rounded-xl border border-slate-200 border-l-4 ${t.border} ${t.bg} p-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className={`h-5 w-5 ${t.icon}`} />
                  <span className={`font-bold text-sm ${t.title}`}>{c.title}</span>
                  <span className="text-xs text-slate-600">– {c.subtitle}</span>
                </div>
                <ul className="text-[12px] text-slate-700 space-y-1 list-disc list-inside leading-relaxed">
                  {c.items.map((i) => <li key={i}>{i}</li>)}
                </ul>
              </div>
            );
          })}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-4">
          {kpis.map((k) => {
            const Icon = k.icon;
            return (
              <div key={k.label} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="flex items-start gap-2">
                  <div className={`h-8 w-8 rounded-lg ${k.bg} ${k.color} grid place-items-center shrink-0`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-medium text-slate-500 truncate">{k.label}</div>
                    <div className="text-xl font-bold text-slate-900 leading-tight truncate">{k.value}</div>
                  </div>
                </div>
                <div className="mt-1 text-[10px] text-slate-500">{k.sub}</div>
              </div>
            );
          })}
        </div>

        {/* Filters + cards */}
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
          <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm h-fit">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold tracking-wide uppercase text-slate-700">Filter Coworkers</div>
              <button onClick={() => setActiveCat("All Categories")} className="text-[10px] text-blue-600 font-semibold">Clear All</button>
            </div>
            <div className="text-[11px] font-semibold text-slate-700 mb-1">Category</div>
            <div className="space-y-1 mb-4">
              {categories.map((c) => (
                <label key={c} className="flex items-center gap-2 text-[11px] text-slate-700 cursor-pointer">
                  <input type="radio" name="cat" checked={activeCat === c} onChange={() => setActiveCat(c)} className="h-3 w-3" />
                  {c}
                </label>
              ))}
            </div>
            <div className="text-[11px] font-semibold text-slate-700 mb-1">Deployment Type</div>
            <div className="space-y-1 mb-4">
              {["Cloud", "On-Prem", "Hybrid"].map((d) => (
                <label key={d} className="flex items-center gap-2 text-[11px] text-slate-700">
                  <input type="checkbox" className="h-3 w-3" /> {d}
                </label>
              ))}
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded-lg">Apply Filters</button>
            <div className="text-[10px] text-center text-slate-500 mt-2">{filtered.length} results</div>
          </aside>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                <input className="w-full pl-7 pr-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white" placeholder="Search coworkers..." />
              </div>
              <select className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700">
                <option>Sort by: Most Popular</option>
              </select>
              <button className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-blue-50 text-blue-700 font-semibold">Grid</button>
              <button className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700">List</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((c) => {
                const Icon = c.icon;
                return (
                  <article key={c.name} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col">
                    <div className="flex items-start gap-2">
                      <div className={`h-10 w-10 rounded-lg ${c.bg} ${c.color} grid place-items-center shrink-0`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-bold text-slate-900 truncate">{c.name}</h3>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${c.badge === "Popular" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-blue-50 text-blue-700 border border-blue-200"}`}>{c.badge}</span>
                        </div>
                        <span className={`mt-1 inline-flex text-[10px] font-semibold px-1.5 py-0.5 rounded border ${tagColor[c.tag]}`}>{c.tag}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 mt-2 leading-snug">{c.desc}</p>

                    <div className="mt-3">
                      <div className="text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-1">Key Capabilities</div>
                      <ul className="text-[11px] text-slate-700 space-y-0.5 list-disc list-inside leading-snug">
                        {c.caps.map((cap) => <li key={cap}>{cap}</li>)}
                      </ul>
                    </div>

                    <div className="mt-3">
                      <div className="text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-1">Impact</div>
                      <div className="flex items-center gap-3">
                        {c.impact.map((i) => (
                          <div key={i.l} className="text-[11px]">
                            <span className="font-bold text-emerald-600">{i.v}</span>{" "}
                            <span className="text-slate-600">{i.l}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-1">Integrations</div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {c.integrations.map((i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">{i}</span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 mt-3 border-t border-slate-100">
                      <button className="flex-1 text-xs font-semibold rounded-lg py-1.5 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
                        View Details
                      </button>
                      <button className="flex-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-1.5">Deploy</button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer strip */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 px-4 py-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-white grid place-items-center"><Bot className="h-5 w-5 text-blue-600" /></div>
            <div className="flex-1">
              <div className="text-[12px] font-bold text-blue-700">Not sure which coworker to choose?</div>
              <div className="text-[11px] text-slate-700">Answer a few questions and we'll recommend the best coworkers for your environment.</div>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-lg whitespace-nowrap">Get Recommendations</button>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { i: CheckCircle, c: "text-emerald-600", t: "Pre-built & Ready", s: "Deployed in minutes" },
              { i: Shield, c: "text-blue-600", t: "Secure by Design", s: "Guardrails, approvals and audit trails" },
              { i: Network, c: "text-violet-600", t: "Works with Your Stack", s: "Integrates with your tools and platforms" },
              { i: Activity, c: "text-amber-600", t: "Continuously Improving", s: "Learns, adapts, and gets smarter over time" },
            ].map((f) => {
              const Icon = f.i;
              return (
                <div key={f.t} className="flex items-start gap-2">
                  <Icon className={`h-5 w-5 ${f.c} shrink-0`} />
                  <div>
                    <div className="text-[11px] font-bold text-slate-800 leading-tight">{f.t}</div>
                    <div className="text-[10px] text-slate-600 leading-snug">{f.s}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </AppShell>
  );
}
