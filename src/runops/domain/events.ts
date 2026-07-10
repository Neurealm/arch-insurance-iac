/**
 * Domain event definitions and a minimal publish/subscribe bus.
 * Every OperationsProvider mutation publishes exactly one DomainEvent.
 */

import type {
  ApprovalId, ChangeId, DomainEventId, ExecutionId, IncidentId,
  IsoTimestamp, NotificationId, PostmortemId, RunbookId, RunbookVersionId,
  ScenarioStageId, StepExecutionId, UserId,
} from "@/runops/domain/models";

export type DomainEvent =
  | { id: DomainEventId; at: IsoTimestamp; kind: "IncidentDeclared";      incidentId: IncidentId }
  | { id: DomainEventId; at: IsoTimestamp; kind: "IncidentStateChanged";  incidentId: IncidentId; from: string; to: string }
  | { id: DomainEventId; at: IsoTimestamp; kind: "IncidentResolved";      incidentId: IncidentId }
  | { id: DomainEventId; at: IsoTimestamp; kind: "ApprovalRequested";     approvalId: ApprovalId; runbookId: RunbookId }
  | { id: DomainEventId; at: IsoTimestamp; kind: "ApprovalApproved";      approvalId: ApprovalId; decidedByUserId?: UserId }
  | { id: DomainEventId; at: IsoTimestamp; kind: "ApprovalDenied";        approvalId: ApprovalId; reason: string }
  | { id: DomainEventId; at: IsoTimestamp; kind: "ExecutionStarted";      executionId: ExecutionId }
  | { id: DomainEventId; at: IsoTimestamp; kind: "ExecutionCompleted";    executionId: ExecutionId }
  | { id: DomainEventId; at: IsoTimestamp; kind: "ExecutionFailed";       executionId: ExecutionId; reason: string }
  | { id: DomainEventId; at: IsoTimestamp; kind: "StepExecutionUpdated";  stepExecutionId: StepExecutionId; to: string }
  | { id: DomainEventId; at: IsoTimestamp; kind: "RunbookVersionCreated"; runbookId: RunbookId; versionId: RunbookVersionId }
  | { id: DomainEventId; at: IsoTimestamp; kind: "RunbookCertified";      runbookId: RunbookId; versionId: RunbookVersionId }
  | { id: DomainEventId; at: IsoTimestamp; kind: "ChangeDeployed";        changeId: ChangeId }
  | { id: DomainEventId; at: IsoTimestamp; kind: "ChangeReverted";        changeId: ChangeId }
  | { id: DomainEventId; at: IsoTimestamp; kind: "PostmortemPublished";   postmortemId: PostmortemId }
  | { id: DomainEventId; at: IsoTimestamp; kind: "NotificationPushed";    notificationId: NotificationId }
  | { id: DomainEventId; at: IsoTimestamp; kind: "ScenarioStageAdvanced"; stageId: ScenarioStageId; index: number };

export type DomainEventKind = DomainEvent["kind"];

export type DomainEventHandler = (event: DomainEvent) => void;

export interface DomainEventBus {
  publish(event: DomainEvent): void;
  subscribe(handler: DomainEventHandler): () => void;
  subscribeKind(kind: DomainEventKind, handler: DomainEventHandler): () => void;
  recent(limit?: number): readonly DomainEvent[];
}

export function createDomainEventBus(): DomainEventBus {
  const handlers = new Set<DomainEventHandler>();
  const kindHandlers = new Map<DomainEventKind, Set<DomainEventHandler>>();
  const history: DomainEvent[] = [];
  const HISTORY_LIMIT = 200;

  return {
    publish(event) {
      history.push(event);
      if (history.length > HISTORY_LIMIT) history.splice(0, history.length - HISTORY_LIMIT);
      handlers.forEach((h) => h(event));
      const kh = kindHandlers.get(event.kind);
      if (kh) kh.forEach((h) => h(event));
    },
    subscribe(handler) {
      handlers.add(handler);
      return () => handlers.delete(handler);
    },
    subscribeKind(kind, handler) {
      let set = kindHandlers.get(kind);
      if (!set) { set = new Set(); kindHandlers.set(kind, set); }
      set.add(handler);
      return () => { set?.delete(handler); };
    },
    recent(limit = 50) {
      return history.slice(-limit);
    },
  };
}
