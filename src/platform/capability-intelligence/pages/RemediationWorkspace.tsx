import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/platform/components/StatusBadge";
import { EmptyState, ErrorState } from "@/platform/components/States";
import { useCapabilityIntelligence } from "../CapabilityIntelligenceProvider";
import {
  REMEDIATION_STAGES,
  REMEDIATION_STAGE_LABELS,
  RemediationWorkspaceProvider,
  useOptionalRemediationWorkspace,
  useRemediationWorkspace,
  type RemediationStage,
  type StageState,
} from "../RemediationWorkspaceProvider";

import { RecommendationPicker } from "../components/remediation/RecommendationPicker";
import { ProposalPanel } from "../components/remediation/ProposalPanel";
import { ParameterPanel } from "../components/remediation/ParameterPanel";
import { ValidationPanel } from "../components/remediation/ValidationPanel";
import { SimulationPanel } from "../components/remediation/SimulationPanel";
import { AlternativesPanel } from "../components/remediation/AlternativesPanel";
import { ChangePlanPanel } from "../components/remediation/ChangePlanPanel";
import { DETERMINISM_NOTICE, READ_ONLY_NOTICE } from "../remediationPresentation";
import { reviewLink } from "../review/reviewLink";


const STAGE_DESCRIPTION: Readonly<Record<RemediationStage, string>> = {
  recommendation: "Choose the advisory recommendation you want to work through.",
  proposals:
    "Ask the engine to derive parameterised remediation proposals. Nothing is generated until you ask.",
  parameters:
    "Supply the values the engine refuses to invent. Every change here marks later results stale.",
  validation:
    "Run the engine's validation rules. The classification it returns is the only thing that authorises a simulation.",
  simulation:
    "Apply the validated proposal to an isolated virtual overlay and read the metric, resolution and regression outcome.",
  alternatives:
    "Where the remediation has mutually exclusive variants, assess and compare the comparable ones side by side.",
  "change-plan":
    "Turn the simulated proposal into a controlled, reviewable change specification.",
};

const STAGE_TONE: Record<StageState, "neutral" | "positive" | "info" | "warning" | "critical"> = {
  complete: "positive",
  available: "info",
  blocked: "critical",
  stale: "warning",
  locked: "neutral",
};

/**
 * Screen 4 — Simulation and Change Planning workspace. Planning-only.
 *
 * Stage 3.5.4.4 moved the provider up to the remediation route layout so this
 * screen and the Change Review Readiness screen share one session. The screen
 * still mounts its own provider when rendered without an ancestor one (a direct
 * unit render), but never a second one on top of an existing session.
 */
export default function RemediationWorkspace() {
  const existing = useOptionalRemediationWorkspace();
  const { snapshot } = useCapabilityIntelligence();
  if (existing) return <WorkspaceBody />;
  if (!snapshot) return <EmptyState title="No analysis available" />;
  return (
    <RemediationWorkspaceProvider recommendations={snapshot.intelligence.recommendations}>
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
      {/* Polite region: successful completions only. */}
      <p className="sr-only" role="status" aria-live="polite" data-testid="remediation-announcement">
        {workspace.announcement}
      </p>
      {/* Polite region: a single summarised blocker, never fifty of them. */}
      <p
        className="sr-only"
        role="status"
        aria-live="polite"
        data-testid="remediation-blocker-announcement"
      >
        {workspace.blockerAnnouncement}
      </p>
      {/* Assertive region: engine failures only. Never ordinary status. */}
      <p className="sr-only" role="alert" data-testid="remediation-error-announcement">
        {workspace.errorAnnouncement}
      </p>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-base">Remediation workspace</CardTitle>
            <StatusBadge value="planning-only" tone="neutral" label="Planning only" />
            <StatusBadge value="deterministic" tone="neutral" label="Deterministic" />
            <StatusBadge value="read-only" tone="neutral" label="Read only" />
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
          {workspace.selectionSource === "default" && workspace.recommendation && (
            <p data-testid="selection-source">
              {workspace.unknownRecommendationParam
                ? `No recommendation matches “${workspace.unknownRecommendationParam}”. Showing the highest-priority recommendation instead.`
                : "No recommendation was named in the link. Showing the highest-priority recommendation."}
            </p>
          )}
        </CardContent>
      </Card>

      <StageProgress />

      {workspace.error != null && (
        <div data-testid="workspace-error">
          <ErrorState error={workspace.error} onRetry={workspace.retry} />
        </div>
      )}

      <Stage stage="recommendation">
        <RecommendationPicker
          recommendations={recommendations}
          selectedId={workspace.recommendation?.id ?? null}
          onSelect={workspace.selectRecommendation}
          disabled={workspace.busy !== null}
        />
      </Stage>

      <Stage stage="proposals">
        <ProposalPanel
          proposals={workspace.proposals}
          status={workspace.proposalStatus}
          selectedId={workspace.proposal?.id ?? null}
          conflicts={workspace.conflicts}
          recommendationTitle={workspace.recommendation?.title ?? null}
          onGenerate={workspace.generateProposals}
          onSelectProposal={workspace.selectProposal}
          busy={workspace.busy === "proposals"}
        />
      </Stage>

      <Stage stage="parameters">
        <ParameterPanel
          proposal={workspace.proposal}
          bindings={workspace.bindings}
          unresolvedParameters={workspace.unresolvedParameters}
          onBind={workspace.setBinding}
          onClearBindings={workspace.clearBindings}
        />
      </Stage>

      <Stage stage="validation">
        <ValidationPanel
          validation={workspace.validation}
          status={workspace.validationStatus}
          canValidate={workspace.proposal !== null}
          busy={workspace.busy === "validation"}
          onValidate={workspace.validateProposal}
        />
      </Stage>

      <Stage stage="simulation">
        <SimulationPanel
          simulation={workspace.simulation}
          eligibility={workspace.simulationEligibility}
          busy={workspace.busy === "simulation"}
          stale={workspace.simulationStale}
          onRun={workspace.runSimulation}
        />
      </Stage>

      <Stage stage="alternatives">
        <AlternativesPanel
          alternatives={workspace.alternatives}
          eligibility={workspace.alternativeEligibility}
          assessed={workspace.alternativesAssessed}
          selectedIds={workspace.selectedAlternativeIds}
          comparison={workspace.comparison}
          comparisonEligibility={workspace.comparisonEligibility}
          busy={workspace.busy === "alternatives" || workspace.busy === "validation"}
          stale={workspace.comparisonStale}
          onAssess={workspace.assessAlternatives}
          onToggle={workspace.toggleAlternative}
          onCompare={workspace.runAlternativeComparison}
        />
      </Stage>

      <Stage stage="change-plan">
        <ChangePlanPanel
          plan={workspace.plan}
          drift={workspace.drift}
          eligibility={workspace.planEligibility}
          busy={workspace.busy === "plan"}
          stale={workspace.planStale}
          onBuild={workspace.buildChangePlan}
          reviewHref={reviewLink(workspace.recommendation?.id ?? null)}
        />

      </Stage>
    </div>
  );
}

/** Compact, accessible progress summary of the seven-stage workflow. */
function StageProgress() {
  const { stageStates, activeStage } = useRemediationWorkspace();
  return (
    <ol className="flex flex-wrap gap-2" aria-label="Remediation workflow progress" data-testid="stage-progress">
      {REMEDIATION_STAGES.map((stage) => {
        const state = stageStates[stage];
        const current = stage === activeStage;
        return (
          <li key={stage} data-stage={stage} data-state={state} aria-current={current ? "step" : undefined}>
            <StatusBadge
              value={state}
              tone={STAGE_TONE[state]}
              label={`${REMEDIATION_STAGE_LABELS[stage]} — ${state}${current ? " (current)" : ""}`}
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
            <StatusBadge value={state} tone={STAGE_TONE[state]} label={state} />
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
