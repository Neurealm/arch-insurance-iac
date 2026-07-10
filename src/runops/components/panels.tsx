// Panels used by right-drawer content and page detail surfaces.

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, X } from "lucide-react";
import { StatusIndicator, ConfidenceIndicator, AutonomyIndicator } from "./indicators";
import { tones, type StatusTone, type Autonomy } from "./variants";
import { useState } from "react";

/* ---------------------------- Entity Quick View ----------------------- */

export interface QuickViewField { label: string; value: React.ReactNode }

export function EntityQuickView({
  eyebrow, title, subtitle, status, fields, footer, className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  status?: { tone: StatusTone; label?: string };
  fields?: QuickViewField[];
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded border border-slate-200 bg-white p-3", className)}>
      {eyebrow && <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{eyebrow}</div>}
      <div className="mt-0.5 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {status && <StatusIndicator {...status} />}
      </div>
      {subtitle && <div className="mt-0.5 text-xs text-slate-600">{subtitle}</div>}
      {fields && (
        <dl className="mt-2 grid grid-cols-2 gap-2 text-xs">
          {fields.map((f) => (
            <div key={f.label}>
              <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{f.label}</dt>
              <dd className="text-slate-800">{f.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {footer && <div className="mt-2 border-t border-slate-100 pt-2 text-xs text-slate-600">{footer}</div>}
    </section>
  );
}

/* ------------------------------ Evidence ------------------------------ */

export interface Evidence {
  id: string;
  title: string;
  source: string;
  snippet: string;
  ref?: string;
  supports?: "supports" | "contradicts" | "neutral";
}

export function EvidenceCitation({
  evidence, className,
}: { evidence: Evidence; className?: string }) {
  const tone: StatusTone = evidence.supports === "supports" ? "healthy"
    : evidence.supports === "contradicts" ? "failure" : "neutral";
  const spec = tones[tone];
  return (
    <figure className={cn("rounded border border-slate-200 bg-slate-50 p-2 text-xs", className)}>
      <figcaption className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase text-slate-500">
        <span>{evidence.source}</span>
        <span className={cn("rounded px-1", spec.chip)}>{evidence.supports ?? "reference"}</span>
      </figcaption>
      <div className="font-medium text-slate-900">{evidence.title}</div>
      <blockquote className="mt-1 border-l-2 border-slate-300 pl-2 text-slate-700">
        {evidence.snippet}
      </blockquote>
      {evidence.ref && <div className="mt-1 text-[10px] font-mono text-slate-500">{evidence.ref}</div>}
    </figure>
  );
}

export function EvidencePanel({
  items, className, title = "Evidence",
}: { items: Evidence[]; className?: string; title?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{title}</div>
      {items.map((e) => <EvidenceCitation key={e.id} evidence={e} />)}
    </div>
  );
}

/* ------------------------------ Approval ------------------------------ */

export interface ApprovalPanelProps {
  approvalId: string;
  requestedBy: string;
  requestedAt: string;
  reason: string;
  state: "Pending" | "Approved" | "Denied";
  onApprove?: () => void;
  onDeny?: (reason: string) => void;
  className?: string;
}

export function ApprovalPanel({
  approvalId, requestedBy, requestedAt, reason, state, onApprove, onDeny, className,
}: ApprovalPanelProps) {
  const [denyReason, setDenyReason] = useState("");
  const tone: StatusTone = state === "Approved" ? "success" : state === "Denied" ? "failure" : "pending";
  return (
    <section className={cn("rounded border border-slate-200 bg-white p-3", className)} aria-label={`Approval ${approvalId}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Approval {approvalId}</div>
          <div className="text-xs text-slate-600">Requested by {requestedBy} · {requestedAt}</div>
        </div>
        <StatusIndicator tone={tone} label={state} />
      </div>
      <p className="mt-2 text-xs text-slate-800">{reason}</p>
      {state === "Pending" && (
        <div className="mt-3 space-y-2">
          <Textarea
            value={denyReason}
            onChange={(e) => setDenyReason(e.target.value)}
            placeholder="Denial reason (required to deny)"
            className="min-h-[60px] text-xs"
            aria-label="Denial reason"
          />
          <div className="flex justify-end gap-2">
            <Button
              size="sm" variant="outline"
              disabled={!onDeny || !denyReason.trim()}
              onClick={() => onDeny?.(denyReason.trim())}
            >
              <X className="mr-1 h-3.5 w-3.5" /> Deny
            </Button>
            <Button size="sm" disabled={!onApprove} onClick={() => onApprove?.()}>
              <Check className="mr-1 h-3.5 w-3.5" /> Approve
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

/* --------------------------- Decision / Remediation ------------------- */

export interface Decision {
  id: string;
  title: string;
  conclusion: string;
  confidence: number;
  supporting: string[];
  contradicting: string[];
  nextActions?: string[];
}

export function DecisionCard({ decision, primary, className }: { decision: Decision; primary?: boolean; className?: string }) {
  return (
    <article className={cn("rounded border p-3", primary ? "border-indigo-300 bg-indigo-50/40" : "border-slate-200 bg-white", className)}>
      <header className="flex items-start justify-between gap-2">
        <div>
          {primary && <div className="text-[10px] font-semibold uppercase tracking-wide text-indigo-700">Recommended</div>}
          <h4 className="text-sm font-semibold text-slate-900">{decision.title}</h4>
        </div>
        <ConfidenceIndicator value={decision.confidence} />
      </header>
      <p className="mt-1 text-xs text-slate-700">{decision.conclusion}</p>
      <div className="mt-2 grid gap-2 md:grid-cols-2">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">Supports</div>
          <ul className="mt-0.5 list-disc space-y-0.5 pl-4 text-xs text-slate-700">
            {decision.supporting.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-rose-700">Contradicts</div>
          <ul className="mt-0.5 list-disc space-y-0.5 pl-4 text-xs text-slate-700">
            {decision.contradicting.length > 0 ? decision.contradicting.map((s, i) => <li key={i}>{s}</li>) : <li className="list-none text-slate-500">None recorded</li>}
          </ul>
        </div>
      </div>
      {decision.nextActions && decision.nextActions.length > 0 && (
        <div className="mt-2">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Next actions</div>
          <ul className="mt-0.5 list-disc space-y-0.5 pl-4 text-xs text-slate-700">
            {decision.nextActions.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}
    </article>
  );
}

export function RemediationComparison({
  options, className,
}: { options: Decision[]; className?: string }) {
  return (
    <div className={cn("grid gap-3 md:grid-cols-2", className)} role="group" aria-label="Remediation options">
      {options.map((o, i) => <DecisionCard key={o.id} decision={o} primary={i === 0} />)}
    </div>
  );
}

/* --------------------------- Digital worker ---------------------------- */

export interface DigitalWorkerCardProps {
  id: string;
  name: string;
  role: string;
  status: "Idle" | "Investigating" | "Recommending" | "Executing" | "Validating";
  autonomy: Autonomy;
  className?: string;
}

export function DigitalWorkerCard({ id, name, role, status, autonomy, className }: DigitalWorkerCardProps) {
  const tone: StatusTone = status === "Idle" ? "neutral"
    : status === "Investigating" ? "at-risk"
    : status === "Recommending"  ? "connected"
    : status === "Executing"     ? "recovering"
    : "success";
  return (
    <article className={cn("rounded border border-slate-200 bg-white p-3", className)} aria-label={`Digital worker ${name}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono text-slate-500">{id}</div>
          <div className="text-sm font-semibold text-slate-900">{name}</div>
          <div className="text-xs text-slate-600">{role}</div>
        </div>
        <StatusIndicator tone={tone} label={status} />
      </div>
      <div className="mt-2"><AutonomyIndicator level={autonomy} /></div>
    </article>
  );
}

export function WorkerActivityPanel({
  entries, className,
}: {
  entries: { id: string; at: string; workerId: string; message: string }[];
  className?: string;
}) {
  return (
    <div className={cn("rounded border border-slate-200 bg-white", className)}>
      <div className="border-b border-slate-100 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        Worker activity
      </div>
      <ul className="divide-y divide-slate-100">
        {entries.map((e) => (
          <li key={e.id} className="flex items-baseline gap-2 px-3 py-1.5 text-xs">
            <span className="font-mono text-[11px] text-slate-500">{e.at}</span>
            <span className="font-medium text-slate-800">{e.workerId}</span>
            <span className="text-slate-700">{e.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------------------- Audit trail ----------------------------- */

export function AuditTrail({
  entries, className,
}: {
  entries: { id: string; at: string; actor: string; action: string; target: string; detail?: string }[];
  className?: string;
}) {
  return (
    <div className={cn("rounded border border-slate-200 bg-white", className)}>
      <div className="border-b border-slate-100 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        Audit trail
      </div>
      <ul className="divide-y divide-slate-100" aria-label="Audit trail">
        {entries.map((e) => (
          <li key={e.id} className="grid grid-cols-[80px_120px_1fr] gap-2 px-3 py-1.5 text-xs">
            <span className="font-mono text-[11px] text-slate-500">{e.at}</span>
            <span className="truncate text-slate-700">{e.actor}</span>
            <span className="text-slate-800">
              <span className="font-medium">{e.action}</span>
              <span className="text-slate-500"> · {e.target}</span>
              {e.detail && <span className="ml-1 text-slate-500">— {e.detail}</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* --------------------------- Before / After --------------------------- */

export function BeforeAfterComparison({
  before, after, label = "Before / After", className,
}: {
  before: { label: string; value: React.ReactNode }[];
  after:  { label: string; value: React.ReactNode }[];
  label?: string;
  className?: string;
}) {
  return (
    <section className={cn("rounded border border-slate-200 bg-white p-3", className)} aria-label={label}>
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 grid grid-cols-2 gap-3 text-xs">
        <div>
          <div className="mb-1 text-[10px] font-semibold uppercase text-slate-500">Before</div>
          <dl className="space-y-1">
            {before.map((r) => (
              <div key={r.label} className="flex justify-between gap-2">
                <dt className="text-slate-600">{r.label}</dt>
                <dd className="font-medium text-slate-800">{r.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <div className="mb-1 text-[10px] font-semibold uppercase text-emerald-700">After</div>
          <dl className="space-y-1">
            {after.map((r) => (
              <div key={r.label} className="flex justify-between gap-2">
                <dt className="text-slate-600">{r.label}</dt>
                <dd className="font-medium text-slate-900">{r.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

/* --------------------------- Comment thread --------------------------- */

export interface Comment { id: string; at: string; author: string; body: string }

export function CommentThread({
  comments, onSubmit, className,
}: { comments: Comment[]; onSubmit?: (body: string) => void; className?: string }) {
  const [body, setBody] = useState("");
  return (
    <section className={cn("rounded border border-slate-200 bg-white p-3", className)} aria-label="Comments">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Comments</div>
      <ul className="mt-2 space-y-2">
        {comments.map((c) => (
          <li key={c.id} className="rounded bg-slate-50 p-2 text-xs">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-semibold text-slate-800">{c.author}</span>
              <span className="font-mono text-[10px] text-slate-500">{c.at}</span>
            </div>
            <p className="mt-1 text-slate-700">{c.body}</p>
          </li>
        ))}
      </ul>
      {onSubmit && (
        <form
          className="mt-3 space-y-2"
          onSubmit={(e) => { e.preventDefault(); if (body.trim()) { onSubmit(body.trim()); setBody(""); } }}
        >
          <Textarea aria-label="New comment" value={body} onChange={(e) => setBody(e.target.value)} className="min-h-[60px] text-xs" placeholder="Add a comment…" />
          <div className="flex justify-end"><Button size="sm" type="submit" disabled={!body.trim()}>Post</Button></div>
        </form>
      )}
    </section>
  );
}
