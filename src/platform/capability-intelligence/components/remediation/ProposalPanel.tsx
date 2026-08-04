import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { StatusBadge } from "@/platform/components/StatusBadge";
import { EmptyState } from "@/platform/components/States";
import { confidenceLabel } from "../../presentation";
import { severityTone, validationLabel, validationTone } from "../../remediationPresentation";
import type {
  ChangeProposal,
  ParameterBinding,
  ParameterDefinition,
  ProposalConflict,
  ValidationResult,
} from "@/modules/graph/simulation/index";

const UNBOUND = "__unbound__";

/**
 * Stage 2 — inspect the generated proposals, bind the parameters the engine
 * refused to invent, and read the static validation verdict.
 */
export function ProposalPanel({
  proposals,
  selectedId,
  proposal,
  bindings,
  unresolvedParameters,
  validation,
  conflicts,
  onSelectProposal,
  onBind,
  onClearBindings,
  busy,
}: {
  proposals: readonly ChangeProposal[];
  selectedId: string | null;
  proposal: ChangeProposal | null;
  bindings: ParameterBinding;
  unresolvedParameters: readonly string[];
  validation: ValidationResult | null;
  conflicts: readonly ProposalConflict[];
  onSelectProposal: (id: string) => void;
  onBind: (name: string, value: string) => void;
  onClearBindings: () => void;
  busy: boolean;
}) {
  if (busy) {
    return <p className="text-sm text-muted-foreground">Generating proposals from the recommendation…</p>;
  }
  if (proposals.length === 0) {
    return (
      <EmptyState
        title="No proposal could be generated"
        description="The remediation policy produced no parameterised change for this recommendation. This is a transparency outcome, not a failure: the engine never invents ownership or registration facts it cannot derive from the graph."
      />
    );
  }

  return (
    <div className="space-y-4">
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

      {proposal && (
        <div className="space-y-4">
          <ParameterEditor
            parameters={proposal.parameters}
            bindings={bindings}
            unresolved={unresolvedParameters}
            onBind={onBind}
            onClear={onClearBindings}
          />
          <ChangeList proposal={proposal} />
          {validation && <ValidationSummary validation={validation} />}
          {conflicts.length > 0 && <ConflictList conflicts={conflicts} />}
        </div>
      )}
    </div>
  );
}

function ParameterEditor({
  parameters,
  bindings,
  unresolved,
  onBind,
  onClear,
}: {
  parameters: readonly ParameterDefinition[];
  bindings: ParameterBinding;
  unresolved: readonly string[];
  onBind: (name: string, value: string) => void;
  onClear: () => void;
}) {
  if (parameters.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        This proposal requires no operator parameters: every value is derived from the graph.
      </p>
    );
  }
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Required parameters</CardTitle>
        <p className="text-xs text-muted-foreground">
          The engine never invents ownership. Where a value cannot be derived deterministically it is
          surfaced here with the graph-derived candidates and their support scores.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {parameters.map((param) => {
          const value = bindings[param.name] ?? param.defaultValue ?? "";
          const options = param.candidates.length
            ? param.candidates
            : param.allowedValues.map((v) => ({ value: v, label: v, support: 0, evidence: [] }));
          const missing = unresolved.includes(param.name);
          return (
            <div key={param.name} className="space-y-1" data-testid="proposal-parameter">
              <div className="flex flex-wrap items-center gap-2">
                <label className="font-mono text-xs text-foreground" htmlFor={`param-${param.name}`}>
                  {param.name}
                </label>
                <StatusBadge value={param.type} tone="neutral" label={param.type} />
                {param.required && <StatusBadge value="required" tone="info" label="Required" />}
                {missing && <StatusBadge value="unresolved" tone="warning" label="Unresolved" />}
              </div>
              <p className="text-[11px] text-muted-foreground">{param.description}</p>
              {options.length === 0 ? (
                <p className="text-[11px] text-muted-foreground">
                  No candidate value exists in the graph. This proposal cannot be completed without a
                  governance decision recorded outside this workspace.
                </p>
              ) : (
                <Select
                  value={value || UNBOUND}
                  onValueChange={(v) => onBind(param.name, v === UNBOUND ? "" : v)}
                >
                  <SelectTrigger id={`param-${param.name}`} aria-label={`Value for ${param.name}`}>
                    <SelectValue placeholder="Choose a candidate" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    <SelectItem value={UNBOUND}>Leave unresolved</SelectItem>
                    {options.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                        {c.support ? ` — support ${c.support}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {param.constraints.length > 0 && (
                <ul className="list-disc pl-5 text-[11px] text-muted-foreground">
                  {param.constraints.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
        {Object.keys(bindings).length > 0 && (
          <Button size="sm" variant="outline" onClick={onClear}>
            Clear parameter values
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function ChangeList({ proposal }: { proposal: ChangeProposal }) {
  return (
    <Accordion type="single" collapsible defaultValue="changes">
      <AccordionItem value="changes">
        <AccordionTrigger className="text-sm">
          Proposed changes ({proposal.changes.length})
        </AccordionTrigger>
        <AccordionContent>
          <ol className="space-y-2">
            {proposal.changes.map((c) => (
              <li key={c.id} className="rounded border border-border p-2" data-testid="proposed-change">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge value={c.operation} tone="info" label={c.operation} />
                  <span className="font-mono text-[11px] text-muted-foreground">{c.target.id}</span>
                  {!c.reversible && <StatusBadge value="irreversible" tone="warning" label="No deterministic inverse" />}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{c.rationale.statement}</p>
                {c.requiredParameters.length > 0 && (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Requires: {c.requiredParameters.join(", ")}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function ValidationSummary({ validation }: { validation: ValidationResult }) {
  return (
    <Card data-testid="proposal-validation" data-outcome={validation.outcome}>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-sm">Validation</CardTitle>
          <StatusBadge
            value={validation.outcome}
            tone={validationTone(validation.outcome)}
            label={validationLabel(validation.outcome)}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {validation.missingParameters.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Missing parameters: {validation.missingParameters.join(", ")}
          </p>
        )}
        {validation.issues.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No structural, endpoint-policy, cycle or duplication issue was raised by the{" "}
            {validation.rulesApplied.length} rules applied.
          </p>
        ) : (
          <ul className="space-y-1">
            {validation.issues.map((issue, i) => (
              <li key={`${issue.ruleId}-${i}`} className="flex flex-wrap items-start gap-2 text-xs">
                <StatusBadge value={issue.severity} tone={severityTone(issue.severity)} label={issue.severity} />
                <span className="font-mono text-[11px] text-muted-foreground">{issue.ruleId}</span>
                <span className="text-muted-foreground">{issue.message}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
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
