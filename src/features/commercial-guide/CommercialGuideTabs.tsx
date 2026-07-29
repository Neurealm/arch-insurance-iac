import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import type { CommercialGuideContent } from "./types";
import { useCommercialGuide } from "./CommercialGuideProvider";
import { CommercialGuideSection, GuideList, GuideParagraph, GuidePending } from "./CommercialGuideSection";
import { CommercialRelationshipMap } from "./CommercialRelationshipMap";
import { CommercialGuideWorkflow } from "./CommercialGuideWorkflow";
import { CommercialGuideRaci } from "./CommercialGuideRaci";
import { CommercialGuideInterpretation } from "./CommercialGuideInterpretation";
import { CommercialGuideWorkedExample } from "./CommercialGuideWorkedExample";
import { CommercialGuideFaq } from "./CommercialGuideFaq";
import { CommercialGuideGlossary } from "./CommercialGuideGlossary";
import { CommercialGuideRelatedPages } from "./CommercialGuideRelatedPages";
import { FALLBACK_WARNING } from "./content/fallback";

export function CommercialGuideTabs({ guide }: { guide: CommercialGuideContent }) {
  const { mode, setOpen } = useCommercialGuide();
  const practitioner = mode === "practitioner" || mode === "administrator";
  const administrator = mode === "administrator";

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
        <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
        <TabsTrigger value="how-it-works" className="text-xs">How It Works</TabsTrigger>
        <TabsTrigger value="how-to-use" className="text-xs">How To Use It</TabsTrigger>
        <TabsTrigger value="interpretation" className="text-xs">Interpretation &amp; Training</TabsTrigger>
      </TabsList>

      {guide.isFallback && (
        <div className="mt-3 flex gap-2 rounded-md border border-border bg-muted/50 px-3 py-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <div className="text-xs">
            <p className="font-medium text-foreground">Training content pending validation</p>
            <p className="text-muted-foreground">{FALLBACK_WARNING}</p>
          </div>
        </div>
      )}

      {/* OVERVIEW */}
      <TabsContent value="overview" className="mt-2">
        <CommercialGuideSection id="why-exists" title="Why This Page Exists" targetId={guide.showOnPageTargets[0]?.targetId} targetLabel={guide.pageTitle}>
          <GuideParagraph text={guide.purpose} />
        </CommercialGuideSection>
        <CommercialGuideSection id="represents" title="What This Page Represents">
          <GuideParagraph text={guide.represents} empty="Representation pending validation" />
        </CommercialGuideSection>
        <CommercialGuideSection id="why-matters" title="Why This Matters">
          <GuideParagraph text={guide.whyItMatters} empty="Business significance pending validation" />
        </CommercialGuideSection>
        <CommercialGuideSection id="module-fit" title="How It Fits Into the Commercial Module">
          <GuideParagraph text={guide.moduleConnection} empty="Module connection pending validation" />
          <CommercialRelationshipMap relationship={guide.relationship} />
        </CommercialGuideSection>
        <CommercialGuideSection id="questions" title="Questions Answered">
          <GuideList items={guide.questionsAnswered} empty="Key questions pending validation" />
        </CommercialGuideSection>
        <CommercialGuideSection id="lifecycle" title="Lifecycle Placement">
          {guide.lifecycleStages.length === 0 ? (
            <GuidePending label="Lifecycle placement pending validation" />
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {guide.lifecycleStages.map((s) => (
                <Badge key={s} variant="secondary" className="text-[11px]">{s}</Badge>
              ))}
            </div>
          )}
        </CommercialGuideSection>
        <CommercialGuideSection id="prerequisites" title="Prerequisites">
          {guide.prerequisites.length === 0 ? (
            <GuidePending label="Prerequisites pending validation" />
          ) : (
            <ul className="space-y-1 text-xs text-muted-foreground">
              {guide.prerequisites.map((p) => (
                <li key={p.id}>
                  <span className="font-medium text-foreground">{p.label}</span>
                  {p.detail ? ` — ${p.detail}` : ""}
                </li>
              ))}
            </ul>
          )}
          <p className="text-[11px] text-muted-foreground">Guidance only — not technically enforced.</p>
        </CommercialGuideSection>
        <CommercialGuideSection id="ownership" title="Ownership">
          <OwnershipBlock guide={guide} />
        </CommercialGuideSection>
        <CommercialGuideSection id="expected-outcome" title="Expected Outcome">
          <GuideParagraph text={guide.expectedOutcome} empty="Expected outcome pending validation" />
        </CommercialGuideSection>
        {mode === "executive" && (
          <>
            <CommercialGuideSection id="exec-confidence" title="Model Confidence &amp; Commercial Readiness">
              <ConfidenceBlock guide={guide} />
            </CommercialGuideSection>
            <CommercialGuideSection id="exec-decisions" title="Decisions Supported">
              <DecisionsBlock guide={guide} />
            </CommercialGuideSection>
            <CommercialGuideSection id="exec-risks" title="Key Risks">
              <GuideList items={guide.keyRisks} empty="Key risks pending validation" />
            </CommercialGuideSection>
            <CommercialGuideSection id="exec-takeaway" title="Executive Takeaway">
              <GuideParagraph text={guide.executiveTakeaway} empty="Executive takeaway pending validation" />
            </CommercialGuideSection>
          </>
        )}
      </TabsContent>

      {/* HOW IT WORKS */}
      <TabsContent value="how-it-works" className="mt-2">
        {!practitioner ? (
          <ModeNotice area="How It Works" />
        ) : (
          <>
            <CommercialGuideSection id="showing" title="What the Page Is Showing">
              <GuideParagraph text={guide.represents} empty="Page content summary pending validation" />
            </CommercialGuideSection>
            <CommercialGuideSection id="sections" title="Page Sections Explained">
              {guide.sections.length === 0 ? (
                <GuidePending label="Page sections pending validation" />
              ) : (
                <div className="space-y-2">
                  {guide.sections.map((s) => (
                    <div key={s.id} className="rounded-md border border-border px-3 py-2">
                      <p className="text-sm font-medium text-foreground">{s.title}</p>
                      <p className="text-xs text-muted-foreground">{s.explanation}</p>
                    </div>
                  ))}
                </div>
              )}
            </CommercialGuideSection>
            <CommercialGuideSection id="inputs" title="Primary Inputs">
              {guide.inputs.length === 0 ? (
                <GuidePending label="Inputs pending validation" />
              ) : (
                <ul className="space-y-1 text-xs">
                  {guide.inputs.map((i) => (
                    <li key={i.id}>
                      <span className="font-medium text-foreground">{i.label}</span>
                      <span className="text-muted-foreground"> — {i.description}</span>
                      {i.owner && <span className="text-muted-foreground"> (Owner: {i.owner})</span>}
                    </li>
                  ))}
                </ul>
              )}
            </CommercialGuideSection>
            <CommercialGuideSection id="calc" title="Calculation and Business Logic">
              <GuideList items={guide.calculationLogic} empty="Calculation logic pending validation" />
            </CommercialGuideSection>
            <CommercialGuideSection id="outputs" title="Primary Outputs">
              {guide.outputs.length === 0 ? (
                <GuidePending label="Outputs pending validation" />
              ) : (
                <ul className="space-y-1 text-xs">
                  {guide.outputs.map((o) => (
                    <li key={o.id}>
                      <span className="font-medium text-foreground">{o.label}</span>
                      <span className="text-muted-foreground"> — {o.description}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CommercialGuideSection>
            <CommercialGuideSection id="rules" title="Business Rules">
              {guide.businessRules.length === 0 ? (
                <GuidePending label="Business rules pending validation" />
              ) : (
                <ul className="space-y-1 text-xs">
                  {guide.businessRules.map((r) => (
                    <li key={r.id}>
                      <span className="font-medium text-foreground">{r.rule}</span>
                      <span className="text-muted-foreground"> — {r.explanation}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CommercialGuideSection>
            <CommercialGuideSection id="upstream" title="Upstream Dependencies">
              <GuideList items={guide.relationship.receivesFrom} empty="Upstream dependencies pending validation" />
            </CommercialGuideSection>
            <CommercialGuideSection id="downstream" title="Downstream Impacts">
              <GuideList items={guide.relationship.feeds} empty="Downstream impacts pending validation" />
            </CommercialGuideSection>
            <CommercialGuideSection id="if-changes" title="What Happens If This Changes">
              {guide.downstreamImpacts.length === 0 ? (
                <GuidePending label="Change impact pending validation" />
              ) : (
                <ul className="space-y-1 text-xs">
                  {guide.downstreamImpacts.map((d) => (
                    <li key={d.area}>
                      <span className="font-medium text-foreground">{d.area}</span>
                      <span className="text-muted-foreground"> — {d.effect}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CommercialGuideSection>
            <CommercialGuideSection id="confidence" title="Model Confidence &amp; Commercial Readiness">
              <ConfidenceBlock guide={guide} />
            </CommercialGuideSection>
            {administrator && (
              <CommercialGuideSection id="data-quality" title="Data Sources, Quality &amp; Change Control">
                <div className="space-y-2 text-xs">
                  <div>
                    <p className="font-medium text-foreground">Data sources</p>
                    <GuideList items={guide.dataQuality.dataSources} empty="Data sources pending validation" />
                  </div>
                  <p><span className="font-medium text-foreground">Update frequency:</span> {guide.dataQuality.updateFrequency}</p>
                  <div>
                    <p className="font-medium text-foreground">Known data gaps</p>
                    <GuideList items={guide.dataQuality.knownGaps} empty="Known gaps pending validation" />
                  </div>
                  <p><span className="font-medium text-foreground">Change control:</span> {guide.dataQuality.changeControl}</p>
                  {guide.dataQuality.lineage && (
                    <p><span className="font-medium text-foreground">Source &amp; lineage:</span> {guide.dataQuality.lineage}</p>
                  )}
                  <div>
                    <p className="font-medium text-foreground">Show on Page targets</p>
                    {guide.showOnPageTargets.length === 0 ? (
                      <GuidePending label="No targets configured" />
                    ) : (
                      <ul className="list-disc pl-4 text-muted-foreground">
                        {guide.showOnPageTargets.map((t) => (
                          <li key={t.targetId}><code>{t.targetId}</code> — {t.label}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </CommercialGuideSection>
            )}
          </>
        )}
      </TabsContent>

      {/* HOW TO USE IT */}
      <TabsContent value="how-to-use" className="mt-2">
        {!practitioner ? (
          <ModeNotice area="How To Use It" />
        ) : (
          <>
            <CommercialGuideSection id="workflow" title="Recommended Workflow">
              <CommercialGuideWorkflow steps={guide.workflow} />
            </CommercialGuideSection>
            <CommercialGuideSection id="actions" title="Actions Available">
              <GuideList items={guide.actionsAvailable} empty="Available actions pending validation" />
            </CommercialGuideSection>
            <CommercialGuideSection id="activities" title="Required Team Activities">
              {guide.teamActivities.length === 0 ? (
                <GuidePending label="Team activities pending validation" />
              ) : (
                <ul className="space-y-1 text-xs">
                  {guide.teamActivities.map((t) => (
                    <li key={t.id}>
                      <span className="font-medium text-foreground">{t.activity}</span>
                      <span className="text-muted-foreground"> — {t.role}{t.cadence ? `, ${t.cadence}` : ""}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CommercialGuideSection>
            <CommercialGuideSection id="roles" title="Roles and Responsibilities">
              {guide.roles.length === 0 ? (
                <GuidePending label="Roles pending validation" />
              ) : (
                <ul className="space-y-1 text-xs">
                  {guide.roles.map((r) => (
                    <li key={r.role}>
                      <span className="font-medium text-foreground">{r.role}</span>
                      <span className="text-muted-foreground"> — {r.responsibility}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CommercialGuideSection>
            <CommercialGuideSection id="raci" title="Mini RACI">
              <CommercialGuideRaci raci={guide.raci} />
            </CommercialGuideSection>
            <CommercialGuideSection id="reviews" title="Review Requirements">
              <GuideList items={guide.reviewRequirements} empty="Review requirements pending validation" />
            </CommercialGuideSection>
            <CommercialGuideSection id="approvals" title="Approval Requirements">
              <GuideList items={guide.approvalRequirements} empty="Approval requirements pending validation" />
            </CommercialGuideSection>
            <CommercialGuideSection id="decisions" title="Decisions Supported">
              <DecisionsBlock guide={guide} />
            </CommercialGuideSection>
            <CommercialGuideSection id="next" title="What To Do Next">
              <GuideList items={guide.whatToDoNext} empty="Next steps pending validation" />
            </CommercialGuideSection>
            <CommercialGuideSection id="related" title="Related Pages">
              <CommercialGuideRelatedPages pages={guide.relatedPages} onNavigate={() => setOpen(false)} />
            </CommercialGuideSection>
          </>
        )}
      </TabsContent>

      {/* INTERPRETATION & TRAINING */}
      <TabsContent value="interpretation" className="mt-2">
        {!practitioner ? (
          <ModeNotice area="Interpretation &amp; Training" />
        ) : (
          <>
            <CommercialGuideSection id="interpret" title="How To Interpret Results">
              <CommercialGuideInterpretation interpretation={guide.interpretation} />
            </CommercialGuideSection>
            <CommercialGuideSection id="mistakes" title="Common Mistakes">
              {guide.commonMistakes.length === 0 ? (
                <GuidePending label="Common mistakes pending validation" />
              ) : (
                <ul className="space-y-1 text-xs">
                  {guide.commonMistakes.map((m) => (
                    <li key={m.id}>
                      <span className="font-medium text-foreground">{m.description}</span>
                      <span className="text-muted-foreground"> — {m.correction}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CommercialGuideSection>
            <CommercialGuideSection id="best-practices" title="Commercial Best Practices">
              <GuideList items={guide.bestPractices} empty="Best practices pending validation" />
            </CommercialGuideSection>
            <CommercialGuideSection id="example" title="Worked Example">
              <CommercialGuideWorkedExample examples={guide.workedExamples} />
            </CommercialGuideSection>
            <CommercialGuideSection id="faqs" title="FAQs">
              <CommercialGuideFaq faqs={guide.faqs} />
            </CommercialGuideSection>
            <CommercialGuideSection id="glossary" title="Key Terms">
              <CommercialGuideGlossary glossary={guide.glossary} />
            </CommercialGuideSection>
            <CommercialGuideSection id="takeaway" title="Executive Takeaway">
              <GuideParagraph text={guide.executiveTakeaway} empty="Executive takeaway pending validation" />
            </CommercialGuideSection>
          </>
        )}
      </TabsContent>
    </Tabs>
  );
}

function ModeNotice({ area }: { area: string }) {
  return (
    <p className="rounded-md border border-dashed border-border px-3 py-3 text-xs text-muted-foreground">
      {area} detail is available in Practitioner and Administrator modes. Switch Guide Mode in the header to view it.
    </p>
  );
}

function OwnershipBlock({ guide }: { guide: CommercialGuideContent }) {
  const o = guide.ownership;
  const rows: [string, string | undefined][] = [
    ["Business Owner", o.businessOwner],
    ["Commercial Owner", o.commercialOwner],
    ["Technical Owner", o.technicalOwner],
    ["Executive Approver", o.executiveApprover],
    ["Primary Users", o.primaryUsers?.join(", ")],
    ["Consumers of the Output", o.consumersOfOutput?.join(", ")],
  ];
  const present = rows.filter(([, v]) => v);
  if (present.length === 0) return <GuidePending label="Ownership pending validation" />;
  return (
    <dl className="grid grid-cols-1 gap-1 text-xs sm:grid-cols-2">
      {present.map(([k, v]) => (
        <div key={k}>
          <dt className="font-medium text-foreground">{k}</dt>
          <dd className="text-muted-foreground">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function ConfidenceBlock({ guide }: { guide: CommercialGuideContent }) {
  return (
    <div className="space-y-2 text-xs">
      <p>
        <span className="font-medium text-foreground">Model confidence:</span>{" "}
        <Badge variant="outline">{guide.modelConfidence}</Badge>
      </p>
      {guide.confidenceBasis.length > 0 && (
        <p className="text-muted-foreground">Basis: {guide.confidenceBasis.join(", ")}</p>
      )}
      <p className="text-muted-foreground">{guide.confidenceGuidance}</p>
      <p>
        <span className="font-medium text-foreground">Commercial readiness:</span>{" "}
        <Badge variant="outline">{guide.commercialReadiness}</Badge>
      </p>
      <GuideList items={guide.readinessCriteria} empty="Readiness criteria pending validation" />
      <p className="text-[11px] text-muted-foreground">
        Illustrative guidance only — these values are authored training content, not a calculated production score.
      </p>
    </div>
  );
}

function DecisionsBlock({ guide }: { guide: CommercialGuideContent }) {
  if (guide.decisions.length === 0) return <GuidePending label="Decisions supported pending validation" />;
  return (
    <ul className="space-y-1 text-xs">
      {guide.decisions.map((d) => (
        <li key={d.id}>
          <span className="font-medium text-foreground">{d.decision}</span>
          {d.decidedBy && <span className="text-muted-foreground"> — {d.decidedBy}</span>}
          {d.evidence && <span className="text-muted-foreground"> · Evidence: {d.evidence}</span>}
        </li>
      ))}
    </ul>
  );
}
