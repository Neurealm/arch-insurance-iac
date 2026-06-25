import { SemiShell } from "../../features/semiconductor/components/SemiShell";

const CLAIMS = [
  { cap: "Specific humanoid robot manufacturer", status: "red" },
  { cap: "Specific humanoid robot model", status: "red" },
  { cap: "Texas Instruments production integration", status: "red" },
  { cap: "Live Isaac Sim customer deployment", status: "red" },
  { cap: "Live Metropolis customer deployment", status: "red" },
  { cap: "Direct Rockwell control integration", status: "red" },
  { cap: "Measured customer production outcomes", status: "red" },
  { cap: "RTD & dispatch experience", status: "amber" },
  { cap: "Vision scaling experience", status: "amber" },
  { cap: "Agentic RunOps experience", status: "green" },
  { cap: "Energy optimization experience", status: "amber" },
  { cap: "Semiconductor manufacturing experience", status: "amber" },
];

const TALKING = [
  "Anchor in the reference factory — all numbers are synthetic, the capability is real.",
  "Compound event is the demo spine; everything else hangs from it.",
  "Show the Command Center → Twin → Flow → Vision → Ops Intel → Utilities → KG → PoV arc.",
  "Default to Human Approval Required; never imply direct writes to production controllers.",
  "Position vision content as scale + governance, not defect detection.",
  "Position utilities as production-aware optimization, not OT replacement.",
];

const QUESTIONS = [
  "What is the most painful cross-domain incident in the last 90 days?",
  "Which approvals slow you down the most today?",
  "Where is vision deployment scale held back — model ops or edge fleet?",
  "What does 'evidence' need to look like for your auditors?",
  "Which platforms are non-negotiable in the target architecture?",
];

const tone = (s: string) => s === "green" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
  : s === "amber" ? "bg-amber-50 text-amber-800 border-amber-200"
  : "bg-red-50 text-red-700 border-red-200";

export default function Facilitator() {
  return (
    <SemiShell>
      <div className="p-4 lg:p-6 space-y-4">
        <header>
          <h1 className="text-2xl font-bold">Facilitator Mode — Internal</h1>
          <p className="text-sm text-muted-foreground">Not visible in customer-facing navigation. Use to track claim readiness, talking points, decisions.</p>
        </header>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="px-3 py-2 border-b border-border text-sm font-semibold">Claim Readiness</div>
            <table className="w-full text-xs">
              <tbody>
                {CLAIMS.map(c => (
                  <tr key={c.cap} className="border-t border-border">
                    <td className="px-3 py-1.5">{c.cap}</td>
                    <td className="px-3 py-1.5 text-right">
                      <span className={`inline-flex px-2 py-0.5 rounded border text-[10px] font-medium uppercase ${tone(c.status)}`}>{c.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-3 py-2 text-[11px] text-amber-800 bg-amber-50 border-t border-amber-200">
              Red items must never appear as validated claims on customer-facing pages. Update via the credential evidence library before promoting.
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-3">
              <div className="text-sm font-semibold mb-1">Guided Talking Points</div>
              <ul className="text-[12px] space-y-1 list-disc pl-4">{TALKING.map(t => <li key={t}>{t}</li>)}</ul>
            </div>
            <div className="rounded-lg border border-border bg-card p-3">
              <div className="text-sm font-semibold mb-1">Questions to Ask</div>
              <ul className="text-[12px] space-y-1 list-disc pl-4">{QUESTIONS.map(t => <li key={t}>{t}</li>)}</ul>
            </div>
            <div className="rounded-lg border border-border bg-card p-3">
              <div className="text-sm font-semibold mb-1">Participant Notes</div>
              <textarea className="w-full h-28 text-xs border border-border rounded p-2 bg-background" placeholder="Capture decisions, parking lot items, follow-ups..." />
            </div>
          </div>
        </div>
      </div>
    </SemiShell>
  );
}
