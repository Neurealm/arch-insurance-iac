import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, LayoutDashboard } from "lucide-react";
import { AppShell } from "@/components/eoc/AppShell";
import { Button } from "@/components/ui/button";
import img from "@/assets/shx-solution-design.png";

export default function ShxSolutionDesign() {
  const nav = useNavigate();
  return (
    <AppShell>
      <header className="bg-card border-b border-border">
        <div className="px-8 pt-5 pb-4 flex items-start gap-6">
          <div className="flex-1 min-w-0">
            <button onClick={() => nav("/coworkers/it-carve-out-and-separation")} className="text-xs text-muted-foreground inline-flex items-center gap-1 hover:text-foreground mb-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to IT Carve-Out
            </button>
            <h1 className="text-[24px] font-bold tracking-tight text-foreground leading-tight">
              Security Hygiene & Exposure Reduction Coworker — <span className="text-slate-700">Solution Design</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              How it operates: triggers, systems & data inputs, the digital coworker core, decisions, actions, governance, and outcomes.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 mt-1">
            <Button onClick={() => nav("/coworkers/it-carve-out-and-separation/shx/overview")} variant="outline" className="h-10 px-4 font-semibold">
              <FileText className="h-4 w-4" /> Overview
            </Button>
            <Button onClick={() => nav("/coworkers/it-carve-out-and-separation/shx/operational-dashboard")} className="h-10 px-4 font-semibold bg-navy hover:bg-navy/90 text-white">
              <LayoutDashboard className="h-4 w-4" /> Operational Dashboard
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 px-8 py-6 animate-fade-in">
        <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-sm)] overflow-hidden">
          <img src={img} alt="Security Hygiene & Exposure Reduction Coworker — Solution Design" className="w-full h-auto block" />
        </div>
      </main>
    </AppShell>
  );
}
