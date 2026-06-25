import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutGrid, Boxes, Network, Wrench, Scale, Factory, Sparkles, Gavel, Brain,
  Gauge, Lightbulb, GitBranch, Share2, BookOpen, Target as TargetIcon, Users,
  UserCheck, FlaskConical, MessageSquare, Layers,
} from "lucide-react";

export const SEAD_RAIL = [
  { icon: LayoutGrid, label: "Command\nCenter", to: "/sead/command-center" },
  { icon: Boxes, label: "Digital Twin", to: "/sead/equipment-health-intelligence" },
  { icon: Network, label: "Cross-Domain", to: "/sead/cross-domain-context-twin" },
  { icon: Wrench, label: "Decision\nSim", to: "/sead/maintenance-decision-simulator" },
  { icon: Scale, label: "Simulation\nComparison", to: "/sead/simulation-comparison" },
  { icon: Factory, label: "Factory\nImpact", to: "/sead/factory-impact-simulator" },
  { icon: Sparkles, label: "Decision\nCenter", to: "/sead/ai-maintenance-decision-center" },
  { icon: Gavel, label: "Human\nGovernance", to: "/sead/human-governance-center" },
  { icon: Brain, label: "AI Reasoning", to: "/sead/ai-reasoning-playback" },
  { icon: Gauge, label: "Confidence\nExplorer", to: "/sead/confidence-explorer" },
  { icon: Lightbulb, label: "Explainability", to: "/sead/explainability" },
  { icon: GitBranch, label: "What If", to: "/sead/what-if" },
  { icon: Share2, label: "Knowledge\nGraph", to: "/sead/knowledge-graph" },
  { icon: BookOpen, label: "Operational\nLearning", to: "/sead/operational-learning" },
  { icon: TargetIcon, label: "Outcome\nTracker", to: "/sead/outcome-tracker" },
  { icon: Users, label: "Multi-Agent\nCollaboration", to: "/sead/multi-agent-collaboration" },
  { icon: UserCheck, label: "Human-\nin-the-Loop", to: "/sead/human-in-the-loop" },
  { icon: FlaskConical, label: "Engineering\nSandbox", to: "/sead/engineering-sandbox" },
  { icon: MessageSquare, label: "Digital Coworker\nConversation", to: "/sead/digital-coworker-conversation" },
  { icon: Layers, label: "IoT→AI\nArchitecture", to: "/sead/iot-ai-architecture" },
];

export function SeadRail() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  return (
    <aside className="w-[84px] shrink-0 border-r border-white/[0.06] bg-white/[0.015] py-3 flex flex-col items-center gap-0.5 overflow-y-auto max-h-screen sticky top-0 self-start">
      {SEAD_RAIL.map((r) => {
        const active = pathname === r.to;
        const Icon = r.icon;
        return (
          <button
            key={r.to}
            onClick={() => nav(r.to)}
            title={r.label.replace("\n", " ")}
            className={`group relative w-[72px] py-2.5 rounded-lg flex flex-col items-center gap-1 transition ${
              active
                ? "bg-sky-500/10 text-sky-300 ring-1 ring-sky-400/30 shadow-[0_0_24px_-12px_rgba(56,189,248,0.8)]"
                : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Icon className="h-[18px] w-[18px]" />
            <span className="text-[9.5px] leading-tight text-center px-1 whitespace-pre-line">{r.label}</span>
            {active && (
              <motion.span
                layoutId="sead-rail-indicator"
                className="absolute left-0 top-2 bottom-2 w-[2.5px] rounded-r bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.9)]"
              />
            )}
          </button>
        );
      })}
    </aside>
  );
}

export default SeadRail;
