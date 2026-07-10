/**
 * Common response envelopes for OperationsProvider reads and mutations.
 */

import type { AuditEvent } from "@/runops/domain/models";
import type { DomainEvent } from "@/runops/domain/events";

/** Provenance describes where data came from and how fresh it is. */
export interface Provenance {
  /** Provider identifier: "demo" | "connected:<connector>" */
  source: string;
  /** ISO timestamp when this snapshot was captured. */
  capturedAt: string;
  /** True when the snapshot is older than the provider's freshness contract. */
  stale: boolean;
  /** Optional cache TTL hint in seconds. */
  ttlSeconds?: number;
  /** Optional upstream identifiers used for traceability. */
  upstreamRefs?: readonly string[];
}

/** Envelope for every read from OperationsProvider. */
export interface ProviderResponse<T> {
  data: T;
  provenance: Provenance;
}

/**
 * Envelope for every mutation from OperationsProvider.
 * Contains the updated entity, the emitted audit + domain events, any
 * related entity updates that flowed from the mutation, and a short
 * user-friendly outcome message.
 */
export interface MutationResult<TEntity, TRelated = unknown> {
  entity: TEntity;
  audit: AuditEvent;
  event: DomainEvent;
  related: readonly TRelated[];
  message: string;
  provenance: Provenance;
}
