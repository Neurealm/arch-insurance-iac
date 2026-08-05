import { useState } from "react";
import { AtcShell, PageHeader, PriBadge, Card } from "./shared";
import { MANUAL_REVIEW, CATEGORY_DIST, PERF_SERIES, CATEGORIZATION_RULES } from "./data";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";
import { Sparkles, Play, Pause, RotateCcw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const THRESHOLDS = [
  { pri: "P1", value: 100, note: "Always require human review" },
  { pri: "P2", value: 92,  note: "Manual review below threshold" },
  { pri: "P3", value: 85,  note: "Manual review below threshold" },
  { pri: "P4", value: 78,  note: "Manual review below threshold" },
];

export default function AutoConfig() {
  const [threshold, setThreshold] = useState(85);
  const [enabled, setEnabled] = useState(true);

  // Simulation: assume tickets with confidence < threshold are manual review
  // For demo: linear estimate off 86% auto-rate at 85% threshold
  const projectedAuto = Math.max(50, Math.min(97, 86 + (85 - threshold) * 0.9));
  const projectedManual = 100 - projectedAuto;
  const projectedAccuracy = Math.max(90, Math.min(98, 94.7 - (85 - threshold) * 0.12));
  const hoursSaved = Math.round(3542 * (projectedAuto / 86));

  return (
    <AtcShell activeNav="auto" breadcrumb="Auto Categorization">
      <PageHeader title="Auto Categorization" subtitle="AI model status, thresholds, manual review queue, and simulation." />

      <div className="px-6 pb-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4 flex flex-wrap items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-indigo/10 text-indigo grid place-items-center"><Sparkles className="h-5 w-5" /></div>
          <div className="min-w-0">
            <div className="text-[13px] font-bold">Categorizer v2.3</div>
            <div className="text-[11px] text-slate-500">Model deployed May 28, 2026 · 18,842 tickets processed · 94.7% accuracy</div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setEnabled(!enabled)} className={cn("inline-flex items-center gap-1.5 h-8 px-3 rounded text-[11px] font-semibold border", enabled ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-600")}>
              {enabled ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />} {enabled ? "Automation ON" : "Automation Paused"}
            </button>
            <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded border border-slate-200 text-[11px] font-semibold hover:bg-slate-50"><RotateCcw className="h-3.5 w-3.5" /> Rollback Model</button>
          </div>
        </div>
      </div>

      <div className="px-6 pb-4 grid grid-cols-12 gap-4">
        <Card title="Confidence Threshold" subtitle="Simulate the effect of the auto-categorize threshold on volume and accuracy." className="col-span-12 xl:col-span-7">
          <div className="space-y-3">
            <div className="flex items-baseline gap-3">
              <div className="text-[42px] font-bold text-indigo leading-none">{threshold}<span className="text-[18px] text-slate-500">%</span></div>
              <div className="text-[11px] text-slate-500">Confidence threshold to auto-categorize</div>
            </div>
            <input type="range" min={60} max={99} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className="w-full accent-indigo" />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>60% (aggressive)</span><span>85% (default)</span><span>99% (conservative)</span>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-3">
              <div className="rounded border border-slate-200 p-2 text-center">
                <div className="text-[10px] text-slate-500">Auto-rate</div>
                <div className="text-[18px] font-bold text-emerald-600">{projectedAuto.toFixed(0)}%</div>
              </div>
              <div className="rounded border border-slate-200 p-2 text-center">
                <div className="text-[10px] text-slate-500">Manual review</div>
                <div className="text-[18px] font-bold text-amber-600">{projectedManual.toFixed(0)}%</div>
              </div>
              <div className="rounded border border-slate-200 p-2 text-center">
                <div className="text-[10px] text-slate-500">Est. accuracy</div>
                <div className="text-[18px] font-bold text-indigo">{projectedAccuracy.toFixed(1)}%</div>
              </div>
              <div className="rounded border border-slate-200 p-2 text-center">
                <div className="text-[10px] text-slate-500">Agent hrs saved</div>
                <div className="text-[18px] font-bold text-slate-900">{hoursSaved.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-[11px] font-semibold text-slate-700 mb-2">Priority-specific thresholds</div>
            <ul className="space-y-1.5 text-[11px]">
              {THRESHOLDS.map((t) => (
                <li key={t.pri} className="flex items-center gap-2 p-2 rounded border border-slate-100">
                  <PriBadge p={t.pri} />
                  <span className="flex-1 text-slate-700">{t.note}</span>
                  <span className="font-mono text-slate-900 font-semibold">{t.value === 100 ? "Never auto" : `≥ ${t.value}%`}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card title="Manual Review Queue" subtitle="Awaiting human decision. AI-suggested reviewers included." className="col-span-12 xl:col-span-5">
          <ul className="space-y-2 -mt-1">
            {MANUAL_REVIEW.map((m) => (
              <li key={m.id} className="p-2 rounded border border-slate-100 hover:bg-slate-50">
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="font-mono text-slate-700">{m.id}</span>
                  <PriBadge p={m.pri} />
                  <span className="ml-auto font-mono text-[10px] text-amber-600">{m.conf}% confidence</span>
                </div>
                <div className="mt-0.5 text-[11px] text-slate-800 font-semibold">{m.desc}</div>
                <div className="text-[10px] text-slate-500">Reason: {m.reason}</div>
                <div className="mt-2 flex items-center gap-1">
                  <button className="inline-flex items-center gap-1 h-6 px-2 rounded bg-emerald-600 text-white text-[10px] font-semibold hover:bg-emerald-700"><CheckCircle2 className="h-3 w-3" /> Approve</button>
                  <button className="inline-flex items-center gap-1 h-6 px-2 rounded border border-slate-200 text-[10px] font-semibold hover:bg-slate-50">Correct</button>
                  <button className="inline-flex items-center gap-1 h-6 px-2 rounded border border-slate-200 text-[10px] font-semibold hover:bg-slate-50">Assign</button>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Model Accuracy Trend" subtitle="Target ≥ 95%" className="col-span-12 xl:col-span-6">
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={PERF_SERIES}>
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
                <XAxis dataKey="d" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis domain={[80, 100]} stroke="#64748b" fontSize={10} tickLine={false} width={36} unit="%" />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                <ReferenceLine y={95} stroke="#10b981" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Category Drift Watch" subtitle="Categories where prediction confidence has shifted." className="col-span-12 xl:col-span-6">
          <ul className="space-y-2 -mt-1">
            {CATEGORY_DIST.map((c, i) => {
              const drift = [0.04, 0.06, 0.18, 0.05, 0.09, 0.03][i] ?? 0.05;
              const warn = drift > 0.1;
              return (
                <li key={c.name} className="flex items-center gap-2 text-[11px]">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <span className="flex-1 text-slate-800">{c.name}</span>
                  <span className="font-mono text-slate-600">drift {drift.toFixed(2)}</span>
                  {warn ? (
                    <span className="inline-flex items-center gap-1 text-amber-600 font-semibold"><AlertTriangle className="h-3 w-3" /> Investigate</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold"><CheckCircle2 className="h-3 w-3" /> Stable</span>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>

        <Card title="Active Rules (Top 5)" className="col-span-12">
          <table className="w-full text-left text-[11px] -mx-4">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2 font-semibold">Rule</th>
                <th className="px-3 py-2 font-semibold">Category</th>
                <th className="px-3 py-2 font-semibold">Group</th>
                <th className="px-3 py-2 font-semibold text-right">Matches (30d)</th>
                <th className="px-3 py-2 font-semibold text-right">Precision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {CATEGORIZATION_RULES.slice(0, 5).map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 font-semibold text-slate-800">{r.name} <span className="text-slate-400 font-mono text-[10px]">{r.id}</span></td>
                  <td className="px-3 py-2 text-slate-700">{r.category}</td>
                  <td className="px-3 py-2 text-slate-600">{r.group}</td>
                  <td className="px-3 py-2 text-right font-mono">{r.matches.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right font-mono text-emerald-600">{r.precision}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </AtcShell>
  );
}
