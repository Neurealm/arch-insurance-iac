/**
 * ConnectedAiProvider — placeholder marker interface.
 *
 * Concrete implementation will call an AI gateway. Live AI is DISABLED by
 * default; constructing without the `liveAi` feature flag MUST throw.
 */

import type { AiProvider } from "@/runops/providers/AiProvider";

export interface ConnectedAiProviderConfig {
  gatewayUrl: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface ConnectedAiProvider extends AiProvider {
  readonly kind: "connected";
  readonly config: ConnectedAiProviderConfig;
  healthCheck(): Promise<{ ok: boolean; latencyMs: number }>;
}
