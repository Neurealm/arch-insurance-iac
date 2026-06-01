import { Sparkles, ArrowRight } from "lucide-react";

export function AIInsightRibbon() {
  return (
    <div className="rounded-2xl border border-ai/20 bg-gradient-to-r from-ai-soft via-accent to-ai-soft px-5 py-4 flex items-center gap-4 shadow-[var(--shadow-sm)]">
      <span className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo to-ai grid place-items-center text-white shrink-0 shadow-[var(--shadow-md)]">
        <Sparkles className="h-5 w-5" />
      </span>
      <p className="flex-1 text-sm text-foreground">
        <span className="font-bold text-ai">AI Insight:</span>{" "}
        Identity Service degradation is the top risk impacting{" "}
        <span className="font-semibold text-status-critical">2 critical business services</span>. Recommended action available.
      </p>
      <button className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-card border border-ai/30 text-ai font-semibold text-sm hover:bg-ai hover:text-ai-foreground transition-colors">
        View Recommendation
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}