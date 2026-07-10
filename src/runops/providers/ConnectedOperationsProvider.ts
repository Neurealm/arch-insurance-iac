/**
 * ConnectedOperationsProvider — placeholder marker interface.
 *
 * A concrete implementation will be wired when Connected Mode ships. It must
 * satisfy OperationsProvider and additionally expose configuration hooks for
 * connector credentials, live event streaming, and infrastructure adapters.
 *
 * Connected Mode is DISABLED by default. Constructing this provider without
 * the corresponding feature flag enabled MUST throw FeatureDisabledError.
 */

import type { OperationsProvider } from "@/runops/providers/OperationsProvider";
import type { ConnectorId } from "@/runops/domain/models";

export interface ConnectedOperationsProviderConfig {
  gatewayUrl: string;
  enabledConnectorIds: readonly ConnectorId[];
  liveEventsEnabled: boolean;
  realInfrastructureActionsEnabled: boolean;
}

export interface ConnectedOperationsProvider extends OperationsProvider {
  readonly kind: "connected";
  readonly config: ConnectedOperationsProviderConfig;
  /** Verify connectivity to all enabled connectors. */
  healthCheck(): Promise<{ ok: boolean; failing: readonly ConnectorId[] }>;
}
