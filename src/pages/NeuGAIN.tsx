import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Layers, Cloud, Network, FileText, PlayCircle, Workflow, Bot, GitBranch, Target, Zap, Activity, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/eoc/AppShell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import overview from "@/assets/neugain-overview.png";
import architecture from "@/assets/neugain-architecture.png";
import saasArchitecture from "@/assets/neugain-saas-architecture.png";
import PlatformOverview from "@/components/neugain/PlatformOverview";

const tabs = [
  { id: "overview", label: "neuGAIN Platform Overview", desc: "End-to-end OS for Digital Coworkers", icon: Layers, img: overview },
  { id: "saas-arch", label: "neuGAIN Platform · SaaS Solution Architecture", desc: "Full-stack SaaS reference architecture", icon: Workflow, img: saasArchitecture },
  { id: "arch", label: "neuGAIN Platform · Operational Architecture", desc: "How agents reason and act", icon: Network, img: architecture },
];

const NeuGAIN = () => {
  const nav = useNavigate();
  const [active, setActive] = useState(tabs[0].id);
  const current = tabs.find((t) => t.id === active)!;

  // Live "last updated" tick so it still feels live without altering the image
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Live KPI data
  const [kpis, setKpis] = useState(() => ({
    coworkers: 128,
    workflows: 356,
    success: 97.6,
    coverage: 74,
    health: 98,
    trend: Array.from({ length: 16 }, (_, i) => ({ v: 80 + Math.round(Math.sin(i / 2) * 6 + Math.random() * 8) })),
  }));
  useEffect(() => {
    const id = setInterval(() => {
      setKpis((k) => ({
        coworkers: Math.max(110, k.coworkers + Math.round((Math.random() - 0.45) * 4)),
        workflows: Math.max(280, k.workflows + Math.round((Math.random() - 0.4) * 12)),
        success: Math.min(99.9, Math.max(95, +(k.success + (Math.random() - 0.5) * 0.3).toFixed(1))),
        coverage: Math.min(95, Math.max(60, k.coverage + Math.round((Math.random() - 0.5) * 2))),
        health: Math.min(100, Math.max(90, k.health + Math.round((Math.random() - 0.5) * 2))),
        trend: [...k.trend.slice(1), { v: 80 + Math.round(Math.random() * 18) }],
      }));
    }, 2200);
    return () => clearInterval(id);
  }, []);

  const kpiCards = [
    { icon: Bot, label: "Active Digital Coworkers", value: kpis.coworkers.toString(), delta: "▲ 12%", tone: "text-status-healthy" },
    { icon: GitBranch, label: "Workflows Running", value: kpis.workflows.toString(), delta: "Live", tone: "text-indigo" },
    { icon: Target, label: "Success Rate (24h)", value: `${kpis.success}%`, delta: "▲ 2.1%", tone: "text-status-healthy" },
    { icon: Zap, label: "Automation Coverage", value: `${kpis.coverage}%`, delta: "▲ 5%", tone: "text-status-healthy" },
    { icon: Activity, label: "System Health", value: `${kpis.health}/100`, delta: "", tone: "text-status-healthy", spark: true },
  ];

  return (
    <AppShell>
      <header className="bg-card border-b border-border">
        <div className="px-8 pt-5 pb-5 flex items-start gap-6">
          <div className="flex-1 min-w-0">
            <button onClick={() => nav("/coworkers")} className="text-xs text-muted-foreground inline-flex items-center gap-1 hover:text-foreground mb-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Digital Coworkers
            </button>
            <h1 className="text-[26px] font-bold tracking-tight text-foreground leading-tight">RunOps neuGAIN</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              The end-to-end operating system for Digital Coworkers — trusted by design, built to run.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 mt-1">
            <Button variant="outline" className="h-10 font-semibold">
              <FileText className="h-4 w-4" /> Export Brief
            </Button>
            <Button className="h-10 font-semibold bg-crimson hover:bg-crimson/90 text-crimson-foreground">
              <PlayCircle className="h-4 w-4" /> Launch Tour
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        <aside className="w-64 shrink-0 border-r border-border bg-card/40 p-3 space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1.5">
            neuGAIN Pages
          </div>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={cn(
                "w-full text-left rounded-lg p-3 transition-colors flex items-start gap-3 border",
                active === t.id
                  ? "bg-indigo/10 border-indigo/30 text-foreground"
                  : "border-transparent hover:bg-secondary/60 text-foreground/80"
              )}
            >
              <div className={cn(
                "h-8 w-8 rounded-md grid place-items-center shrink-0",
                active === t.id ? "bg-indigo text-indigo-foreground" : "bg-secondary text-foreground/70"
              )}>
                <t.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-bold leading-tight">{t.label}</div>
                <div className="text-[10.5px] text-muted-foreground mt-0.5 leading-snug">{t.desc}</div>
              </div>
            </button>
          ))}

          <div className="mt-4 rounded-lg border border-border bg-secondary/40 p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Platform Status</div>
            <div className="mt-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-status-healthy animate-pulse" />
              <span className="text-xs font-bold">All Systems Operational</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-1 tabular-nums">
              Updated {now.toLocaleTimeString()}
            </div>
          </div>
        </aside>

        <main className="flex-1 px-6 py-6 overflow-auto animate-fade-in min-w-0">
          <div className="bg-card rounded-xl border border-border p-3 shadow-[var(--shadow-sm)]">
            <img
              src={current.img}
              alt={current.label}
              loading="eager"
              decoding="sync"
              className="w-full h-auto rounded-lg"
              style={{ imageRendering: "auto" }}
            />
          </div>
        </main>
      </div>
    </AppShell>
  );
};

export default NeuGAIN;
