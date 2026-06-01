import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Bell, HelpCircle, Loader2, Save, Bot, Rocket } from "lucide-react";
import { AppShell } from "@/components/eoc/AppShell";
import { Stepper, type Step } from "@/components/eoc/wizard/Stepper";
import { Step1Mission } from "@/components/eoc/wizard/Step1Mission";
import { Step2Integrations } from "@/components/eoc/wizard/Step2Integrations";
import { Step3Data } from "@/components/eoc/wizard/Step3Data";
import { Step4Governance } from "@/components/eoc/wizard/Step4Governance";
import { Step5Playbooks } from "@/components/eoc/wizard/Step5Playbooks";
import { Step6Validation } from "@/components/eoc/wizard/Step6Validation";
import { StepReadiness } from "@/components/eoc/wizard/StepReadiness";
import { Button } from "@/components/ui/button";
import { useUserProfile } from "@/hooks/useUserProfile";

const steps: Step[] = [
  { id: 1, title: "Mission & Scope", subtitle: "Define objectives & scope" },
  { id: 2, title: "Integrations", subtitle: "Connect your ecosystem" },
  { id: 3, title: "Data & Signals", subtitle: "Map & normalize data" },
  { id: 4, title: "Governance", subtitle: "Policies & guardrails" },
  { id: 5, title: "Playbooks", subtitle: "Automation & runbooks" },
  { id: 6, title: "Validation", subtitle: "Test & validate" },
];

const TOTAL_STEPS = steps.length; // 6 wizard steps
const SUMMARY_STEP = TOTAL_STEPS + 1; // Final summary / launch page

const launchPhases = [
  "Provisioning Agent…",
  "Validating integrations…",
  "Loading runbooks & guardrails…",
  "Spinning up coworker runtime…",
  "Connecting to Live Operations Console…",
];

const DeployCoworker = () => {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const target = searchParams.get("target");
  const [current, setCurrent] = useState(1);
  const [launching, setLaunching] = useState(false);
  const { initials, displayName } = useUserProfile();
  const [phase, setPhase] = useState(0);

  const next = () => {
    if (current < SUMMARY_STEP) setCurrent((c) => c + 1);
  };
  const prev = () => {
    if (current > 1) setCurrent((c) => c - 1);
  };

  const handleLaunch = async () => {
    setLaunching(true);
    setPhase(0);
    for (let i = 0; i < launchPhases.length; i++) {
      await new Promise((r) => setTimeout(r, 850));
      setPhase(i + 1);
    }
    await new Promise((r) => setTimeout(r, 400));
    if (target === "release-deployment-rollout") {
      nav("/coworkers/site-reliability-engineering/release-deployment-rollout");
    } else if (target === "slo-sla-sli") {
      nav("/coworkers/site-reliability-engineering/slo-sla-sli-monitoring");
    } else if (target === "privileged-access") {
      nav("/coworkers/identity-access-management/privileged-access");
    } else {
      nav("/operations");
    }
  };

  return (
    <AppShell>
      {/* Header */}
      <header className="bg-card border-b border-border px-8 py-4">
        <div className="flex items-center justify-between gap-6">
          <div>
            <h1 className="text-[22px] font-bold tracking-tight">Deploy Digital Coworker</h1>
            <p className="text-xs text-muted-foreground">EOC Command Orchestrator</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-base font-bold tracking-tight">
                {current > TOTAL_STEPS ? (
                  <span className="text-status-healthy">Final Summary</span>
                ) : (
                  <>Step <span className="text-indigo">{current}</span> of {TOTAL_STEPS}</>
                )}
              </div>
              <div className="h-2 w-56 rounded-full bg-secondary mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-indigo transition-all"
                  style={{ width: `${(Math.min(current, TOTAL_STEPS) / TOTAL_STEPS) * 100}%` }}
                />
              </div>
            </div>
            <button className="h-9 w-9 rounded-full grid place-items-center hover:bg-secondary"><HelpCircle className="h-4 w-4 text-muted-foreground" /></button>
            <button className="h-9 w-9 rounded-full grid place-items-center hover:bg-secondary relative">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="absolute top-1 right-1.5 h-4 w-4 rounded-full bg-status-critical text-white text-[9px] font-bold grid place-items-center">7</span>
            </button>
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo to-ai grid place-items-center text-white text-xs font-bold" title={displayName}>{initials}</div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div className="flex-1"><Stepper steps={steps} current={Math.min(current, TOTAL_STEPS)} /></div>
          <Button variant="outline" size="sm" className="font-semibold shrink-0">
            <Save className="h-3.5 w-3.5" /> Save Draft
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-8 py-6 pb-28 animate-fade-in">
        {current === 1 && <Step1Mission />}
        {current === 2 && <Step2Integrations />}
        {current === 3 && <Step3Data />}
        {current === 4 && <Step4Governance />}
        {current === 5 && <Step5Playbooks />}
        {current === 6 && <Step6Validation />}
        {current === SUMMARY_STEP && <StepReadiness onLaunch={handleLaunch} />}
      </main>

      {/* Sticky footer */}
      <footer className="sticky bottom-0 bg-card/95 backdrop-blur border-t border-border px-8 py-3 flex items-center justify-between z-20">
        <Button variant="outline" onClick={current === 1 ? () => nav("/coworkers") : prev} className="font-semibold">
          <ArrowLeft className="h-4 w-4" /> {current === 1 ? "Cancel" : `Previous: ${steps[current - 2]?.title ?? steps[TOTAL_STEPS - 1].title}`}
        </Button>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="font-semibold" onClick={() => nav("/coworkers")}>Save & Exit</Button>
          {current < TOTAL_STEPS ? (
            <Button onClick={next} className="bg-indigo hover:bg-indigo/90 text-indigo-foreground font-semibold">
              Next: {steps[current]?.title} <ArrowRight className="h-4 w-4" />
            </Button>
          ) : current === TOTAL_STEPS ? (
            <Button onClick={next} className="bg-indigo hover:bg-indigo/90 text-indigo-foreground font-semibold">
              Review & Launch <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleLaunch} className="bg-crimson hover:bg-crimson/90 text-crimson-foreground font-semibold">
              <Rocket className="h-4 w-4" /> Launch Digital Coworker
            </Button>
          )}
        </div>
      </footer>

      {/* Launch overlay */}
      {launching && (
        <div className="fixed inset-0 z-50 bg-navy/85 backdrop-blur-md grid place-items-center animate-fade-in">
          <div className="bg-card rounded-3xl p-10 max-w-md w-full mx-4 shadow-[var(--shadow-lg)] text-center">
            <div className="relative h-20 w-20 mx-auto mb-5">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo to-ai grid place-items-center">
                <Bot className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -inset-2 rounded-3xl border-2 border-indigo/40 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold mb-1">Launching EOC Command Orchestrator</h3>
            <p className="text-sm text-muted-foreground mb-5">Provisioning your digital coworker for production.</p>
            <ul className="space-y-2 text-left">
              {launchPhases.map((p, i) => (
                <li key={p} className="flex items-center gap-3 text-sm">
                  {i < phase ? (
                    <span className="h-5 w-5 rounded-full bg-status-healthy text-white grid place-items-center text-[10px] font-bold">✓</span>
                  ) : i === phase ? (
                    <Loader2 className="h-5 w-5 text-indigo animate-spin" />
                  ) : (
                    <span className="h-5 w-5 rounded-full border-2 border-border" />
                  )}
                  <span className={i <= phase ? "font-semibold" : "text-muted-foreground"}>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </AppShell>
  );
};

export default DeployCoworker;