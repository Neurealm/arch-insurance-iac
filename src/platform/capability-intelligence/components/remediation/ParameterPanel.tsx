import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { StatusBadge } from "@/platform/components/StatusBadge";
import { BoundedList } from "./BoundedList";
import type {
  ChangeProposal,
  ParameterBinding,
  ParameterDefinition,
} from "@/modules/graph/simulation/index";

const UNBOUND = "__unbound__";

/**
 * Stage 3 — resolve the parameters the engine refused to invent.
 *
 * Binding a value is a pure proposal transform: it produces a bound copy and
 * marks every downstream result stale. It never validates and never simulates.
 */
export function ParameterPanel({
  proposal,
  bindings,
  unresolvedParameters,
  onBind,
  onClearBindings,
}: {
  proposal: ChangeProposal | null;
  bindings: ParameterBinding;
  unresolvedParameters: readonly string[];
  onBind: (name: string, value: string) => void;
  onClearBindings: () => void;
}) {
  if (!proposal) {
    return (
      <p className="text-xs text-muted-foreground">
        Select a proposal to see the parameters it requires.
      </p>
    );
  }

  return (
    <div className="space-y-4" data-testid="parameter-stage" data-unresolved={unresolvedParameters.length}>
      <ParameterEditor
        parameters={proposal.parameters}
        bindings={bindings}
        unresolved={unresolvedParameters}
        onBind={onBind}
        onClear={onClearBindings}
      />
      <ChangeList proposal={proposal} />
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
      <p className="text-xs text-muted-foreground" data-testid="no-parameters">
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
          {unresolved.length > 0 && (
            <>
              {" "}
              <span data-testid="unresolved-parameter-notice">
                {unresolved.length} required parameter{unresolved.length === 1 ? " is" : "s are"}{" "}
                unresolved, so this proposal cannot be validated as executable or simulated.
              </span>
            </>
          )}
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
    <Accordion type="single" collapsible>
      <AccordionItem value="changes">
        <AccordionTrigger className="text-sm">
          Proposed changes ({proposal.changes.length})
        </AccordionTrigger>
        <AccordionContent>
          <BoundedList
            items={proposal.changes}
            label="proposed changes"
            testId="proposed-changes"
            ordered
            keyFor={(c) => c.id}
            renderItem={(c) => (
              <div className="rounded border border-border p-2" data-testid="proposed-change">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge value={c.operation} tone="info" label={c.operation} />
                  <span className="font-mono text-[11px] text-muted-foreground">{c.target.id}</span>
                  {!c.reversible && (
                    <StatusBadge value="irreversible" tone="warning" label="No deterministic inverse" />
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{c.rationale.statement}</p>
                {c.requiredParameters.length > 0 && (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Requires: {c.requiredParameters.join(", ")}
                  </p>
                )}
              </div>
            )}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
