import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/platform/components/StatusBadge";
import { EmptyState } from "@/platform/components/States";
import { confidenceLabel } from "../../presentation";
import { severityTone } from "../../remediationPresentation";
import type { ChangeProposal, ProposalConflict } from "@/modules/graph/simulation/index";
import type { ProposalStatus } from "../../RemediationWorkspaceProvider";

const STATUS_LABEL: Record<ProposalStatus, string> = {
  "not-generated": "Not generated",
  generating: "Generating",
  generated: "Generated",
  empty: "No proposal available",
  failed: "Generation failed",
};

/**
 * Stage 2 — explicitly generate the proposal set for the selected
 * recommendation, then choose the proposal to work with.
 *
 * Nothing is generated on arrival. The engine is reached only when the
 * operator asks for it, so opening the workspace costs one graph analysis and
 * no proposal synthesis at all.
 */
export function ProposalPanel({
  proposals,
  status,
  selectedId,
  conflicts,
  recommendationTitle,
  onGenerate,
  onSelectProposal,
  busy,
}: {
  proposals: readonly ChangeProposal[];
  status: ProposalStatus;
  selectedId: string | null;
  conflicts: readonly ProposalConflict[];
  recommendationTitle: string | null;
  onGenerate: () => void;
  onSelectProposal: (id: string) => void;
  busy: boolean;
}) {
  return (
    <div className="space-y-4" data-testid="proposal-stage" data-status={status}>
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={onGenerate} disabled={busy || !recommendationTitle} data-testid="generate-proposals">
          {busy
            ? "Generating…"
            : proposals.length > 0
              ? "Regenerate proposals"
              : "Generate remediation proposals"}
        </Button>
        <StatusBadge
          value={status}
          tone={status === "generated" ? "positive" : status === "failed" ? "critical" : status === "empty" ? "warning" : "neutral"}
          label={STATUS_LABEL[status]}
        />
      </div>

      {status === "not-generated" && (
        <p className="text-xs text-muted-foreground" data-testid="generation-explainer">
          No proposal has been generated yet. Generating will ask the simulation engine to derive
          parameterised change proposals for
          {recommendationTitle ? ` “${recommendationTitle}”` : " the selected recommendation"}. It
          reads the canonical graph only: nothing is written, simulated or planned by this step, and
          the workspace never generates on your behalf.
        </p>
      )}

      {busy && (
        <p className="text-sm text-muted-foreground" data-testid="generation-loading">
          Generating proposals from the recommendation…
        </p>
      )}

      {status === "empty" && !busy && (
        <EmptyState
          title="No proposal could be generated"
          description="The remediation policy produced no parameterised change for this recommendation. This is a transparency outcome, not a failure: the engine never invents ownership or registration facts it cannot derive from the graph."
        />
      )}

      {proposals.length > 0 && !busy && (
        <ul className="space-y-2" data-testid="proposal-options">
          {proposals.map((p) => {
            const active = p.id === selectedId;
            return (
              <li key={p.id}>
                <Card data-selected={active} className={active ? "border-primary" : undefined}>
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge value={p.kind} tone="info" label={p.kind} />
                      <StatusBadge value={p.variant} tone="neutral" label={`Variant: ${p.variant}`} />
                      <StatusBadge value={p.priority} label={`Priority: ${p.priority}`} />
                      <StatusBadge
                        value={p.confidence}
                        tone="neutral"
                        label={`Confidence: ${confidenceLabel(p.confidence)}`}
                      />
                      {p.incomplete && <StatusBadge value="incomplete" tone="warning" label="Needs parameters" />}
                      {!p.reversible && <StatusBadge value="irreversible" tone="warning" label="Not reversible" />}
                      <span className="ml-auto font-mono text-[11px] text-muted-foreground">{p.id}</span>
                    </div>
                    <CardTitle className="pt-1 text-sm">{p.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-xs text-muted-foreground">{p.summary}</p>
                    <div className="text-[11px] text-muted-foreground">
                      {p.changes.length} proposed change(s) · complexity {p.complexity}
                      {p.alternativeProposalIds.length > 0 &&
                        ` · ${p.alternativeProposalIds.length} mutually exclusive alternative(s)`}
                    </div>
                    <Button
                      size="sm"
                      variant={active ? "default" : "outline"}
                      onClick={() => onSelectProposal(p.id)}
                      aria-pressed={active}
                    >
                      {active ? "Selected" : "Work with this proposal"}
                    </Button>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      {conflicts.length > 0 && !busy && <ConflictList conflicts={conflicts} />}
    </div>
  );
}

function ConflictList({ conflicts }: { conflicts: readonly ProposalConflict[] }) {
  return (
    <Card data-testid="proposal-conflicts">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Conflicts ({conflicts.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {conflicts.map((c) => (
            <li key={c.id} className="rounded border border-border p-2 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge value={c.severity} tone={severityTone(c.severity)} label={c.severity} />
                <StatusBadge value={c.type} tone="neutral" label={c.type} />
              </div>
              <p className="mt-1 text-muted-foreground">{c.explanation}</p>
              {c.resolutionOptions.length > 0 && (
                <ul className="mt-1 list-disc pl-5 text-[11px] text-muted-foreground">
                  {c.resolutionOptions.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
