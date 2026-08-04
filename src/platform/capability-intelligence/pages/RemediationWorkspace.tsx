import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/platform/components/StatusBadge";
import { EmptyState, ErrorState } from "@/platform/components/States";
import { useCapabilityIntelligence } from "../CapabilityIntelligenceProvider";
import {
  REMEDIATION_STAGES,
  REMEDIATION_STAGE_LABELS,
  RemediationWorkspaceProvider,
  useRemediationWorkspace,
  type RemediationStage,
} from "../RemediationWorkspaceProvider";
import { RecommendationPicker } from "../components/remediation/RecommendationPicker";
import { ProposalPanel } from "../components/remediation/ProposalPanel";
import { SimulationPanel } from "../components/remediation/SimulationPanel";
import { AlternativesPanel } from "../components/remediation/AlternativesPanel";
import { ChangePlanPanel } from "../components/remediation/ChangePlanPanel";
import { DETERMINISM_NOTICE, READ_ONLY_NOTICE } from "../remediationPresentation";

const STAGE_DESCRIPTION: Readonly<Record<RemediationStage, string>> = {
  recommendation: "Choose the advisory recommendation you want to work through.",
  proposal:
    "Review the parameterised proposals the engine derived, and supply any value it refused to invent.",
  simulation:
    "Apply the proposal to an isolated virtual overlay and read the metric, resolution and regression outcome.",
  alternatives:
    "Where the remediation has mutually exclusive variants, compare them side by side.",
  "change-plan":
    "Turn the simulated proposal into a controlled, reviewable change specification.",
};

/** Screen 4 — Simulation and Change Planning workspace. Planning-only. */
export default function RemediationWorkspace() {
  return (
    <RemediationWorkspaceProvider>
      <WorkspaceBody />
    </RemediationWorkspaceProvider>
  );
}

function WorkspaceBody() {
  const { snapshot } = useCapabilityIntelligence();
  const workspace = useRemediationWorkspace();

  if (!snapshot) return <EmptyState title="No analysis available" />;

  const recommendations = snapshot.intelligence.recommendations;

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-base">Remediation workspace</CardTitle>
            <StatusBadge value="planning-only" tone="neutral" label="Planning only" />
            <StatusBadge value="deterministic" tone="neutral" label="Deterministic" />
            {workspace.recommendation && (
              <Button size="sm" variant="outline" className="ml-auto" onClick={workspace.reset}>
                Start over
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-1 text-xs text-muted-foreground">
          <p>{READ_ONLY_NOTICE}</p>
          <p>{DETERMINISM_NOTICE}</p>
          <p className="font-mono text-[11px]">Canonical graph hash: {workspace.canonicalGraphHash}</p>
        </CardContent>
      </Card>

      <StageProgress />

      {workspace.error != null && <ErrorState error={workspace.error} />}

      <Stage stage="recommendation">
        <RecommendationPicker
          recommendations={recommendations}
          selectedId={workspace.recommendation?.id ?? null}
          onSelect={workspace.selectRecommendation}
          disabled={workspace.busy === "proposals"}
        />
      </Stage>

      <Stage stage="proposal">
        <ProposalPanel
          proposals={workspace.proposals}
          selectedId={workspace.proposal?.id ?? null}
          proposal={workspace.proposal}
          bindings={workspace.bindings}
          unresolvedParameters={workspace.unresolvedParameters}
          validation={workspace.validation}
          conflicts={workspace.conflicts}
          onSelectProposal={workspace.selectProposal}
          onBind={workspace.setBinding}
          onClearBindings={workspace.clearBindings}
          busy={workspace.busy === "proposals"}
        />
      </Stage>

      <Stage stage="simulation">
        <SimulationPanel
          simulation={workspace.simulation}
          canRun={workspace.proposal !== null}
          busy={workspace.busy === "simulation"}
          onRun={workspace.runSimulation}
        />
      </Stage>

      <Stage stage="alternatives">
        <AlternativesPanel
          alternatives={workspace.alternatives}
          comparison={workspace.comparison}
          busy={workspace.busy === "alternatives"}
          onCompare={workspace.runAlternativeComparison}
        />
      </Stage>

      <Stage stage="change-plan">
        <ChangePlanPanel
          plan={workspace.plan}
          drift={workspace.drift}
          canBuild={workspace.simulation !== null}
          busy={workspace.busy === "plan"}
          onBuild={workspace.buildChangePlan}
        />
      </Stage>
    </div>
  );
}

/** Compact, accessible progress summary of the five-stage workflow. */
function StageProgress() {
  const { stageStates, activeStage } = useRemediationWorkspace();
  return (
    <ol className="flex flex-wrap gap-2" aria-label="Remediation workflow progress" data-testid="stage-progress">
      {REMEDIATION_STAGES.map((stage) => {
        const state = stageStates[stage];
        return (
          <li key={stage} data-stage={stage} data-state={state}>
            <StatusBadge
              value={state}
              tone={state === "complete" ? "positive" : state === "available" ? "info" : "neutral"}
              label={`${REMEDIATION_STAGE_LABELS[stage]}${stage === activeStage ? " (current)" : ""}`}
            />
          </li>
        );
      })}
    </ol>
  );
}

/**
 * One workflow stage. Later stages are visible but explain what they need,
 * so the operator always understands the path rather than facing hidden UI.
 */
function Stage({ stage, children }: { stage: RemediationStage; children: React.ReactNode }) {
  const { stageStates } = useRemediationWorkspace();
  const state = stageStates[stage];
  const locked = state === "locked";
  return (
    <section aria-labelledby={`stage-${stage}`} data-testid={`stage-${stage}`} data-state={state}>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle id={`stage-${stage}`} className="text-sm">
              {REMEDIATION_STAGE_LABELS[stage]}
            </CardTitle>
            <StatusBadge
              value={state}
              tone={state === "complete" ? "positive" : state === "available" ? "info" : "neutral"}
              label={state}
            />
          </div>
          <p className="text-xs text-muted-foreground">{STAGE_DESCRIPTION[stage]}</p>
        </CardHeader>
        <CardContent>
          {locked ? (
            <p className="text-xs text-muted-foreground">
              Complete the previous step to continue.
            </p>
          ) : (
            children
          )}
        </CardContent>
      </Card>
    </section>
  );
}
