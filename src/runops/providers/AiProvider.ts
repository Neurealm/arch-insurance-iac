/**
 * AiProvider — the contract every page uses for AI-mediated tasks.
 *
 * Two implementations are planned:
 *   - DemoAiProvider       (deterministic scripted responses)
 *   - ConnectedAiProvider  (backed by a live model gateway — placeholder)
 */

import { createContext, useContext } from "react";
import type { IncidentId, RunbookId, ServiceId } from "@/runops/domain/models";
import type { ProviderResponse } from "@/runops/domain/results";
import type { FeatureFlags } from "@/runops/domain/featureFlags";

export interface AiRecommendation {
  id: string;
  title: string;
  conclusion: string;
  supportingEvidence: readonly string[];
  contradictoryEvidence: readonly string[];
  confidence: number;
  uncertainty: string;
  sources: readonly string[];
  nextActions: readonly string[];
}

export interface AiAnswer {
  question: string;
  answer: string;
  citations: readonly string[];
  confidence: number;
}

export interface AiIncidentSummary {
  incidentId: IncidentId;
  headline: string;
  narrative: string;
  keyFacts: readonly string[];
  openQuestions: readonly string[];
}

export interface AiRunbookDraft {
  title: string;
  serviceId: ServiceId;
  steps: ReadonlyArray<{
    key: string;
    label: string;
    description: string;
    kind: "diagnose" | "mitigate" | "validate" | "rollback";
  }>;
  rationale: string;
}

export interface AiPostmortemDraft {
  incidentId: IncidentId;
  summary: string;
  contributingFactors: readonly string[];
  whatWorked: readonly string[];
  whatDidNot: readonly string[];
  correctiveActions: ReadonlyArray<{ title: string; owner: string }>;
}

export interface AiCommunicationDraft {
  channel: "Status Page" | "Email" | "Chat" | "Executive Brief" | "Customer Notice";
  audience: string;
  subject: string;
  body: string;
}

export interface AiKnowledgeHit {
  id: string;
  title: string;
  snippet: string;
  ref: string;
  score: number;
}

export interface AiProvider {
  readonly kind: "demo" | "connected";
  readonly flags: FeatureFlags;

  answerOperationalQuestion(input: { question: string; scope?: { serviceId?: ServiceId; incidentId?: IncidentId } }):
    Promise<ProviderResponse<AiAnswer>>;

  summarizeIncident(input: { incidentId: IncidentId }):
    Promise<ProviderResponse<AiIncidentSummary>>;

  draftRunbook(input: { serviceId: ServiceId; goal: string }):
    Promise<ProviderResponse<AiRunbookDraft>>;

  draftPostmortem(input: { incidentId: IncidentId }):
    Promise<ProviderResponse<AiPostmortemDraft>>;

  explainRecommendation(input: { recommendationId: string }):
    Promise<ProviderResponse<AiAnswer>>;

  draftCommunication(input: { incidentId: IncidentId; audience: string; channel: AiCommunicationDraft["channel"] }):
    Promise<ProviderResponse<AiCommunicationDraft>>;

  searchKnowledge(input: { query: string; serviceId?: ServiceId }):
    Promise<ProviderResponse<readonly AiKnowledgeHit[]>>;

  getPrimaryRecommendation(input: { incidentId: IncidentId }):
    Promise<ProviderResponse<AiRecommendation>>;

  getAlternativeRecommendations(input: { incidentId: IncidentId }):
    Promise<ProviderResponse<readonly AiRecommendation[]>>;
}

/* --------------------------- React glue --------------------------- */

export const AiProviderContext = createContext<AiProvider | null>(null);

export function useAiProvider(): AiProvider {
  const ctx = useContext(AiProviderContext);
  if (!ctx) throw new Error("useAiProvider must be used within an AiProvider");
  return ctx;
}

/** Alias kept for the "useAi" naming requested in the spec. */
export const useAiApi = useAiProvider;

/** Registry of recommendations by id (in-memory lookup surface). */
export interface RecommendationRegistry {
  get(id: string): AiRecommendation | undefined;
}
