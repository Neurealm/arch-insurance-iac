/**
 * RunOps feature flags. Connected Mode and real-infrastructure actions are
 * disabled by default and MUST remain so unless explicitly enabled by an
 * operator with the appropriate governance.
 */

export interface FeatureFlags {
  demoMode: boolean;
  connectedMode: boolean;
  liveAi: boolean;
  autonomousExecution: boolean;
  externalPublishing: boolean;
  realInfrastructureActions: boolean;
}

export const defaultFeatureFlags: FeatureFlags = Object.freeze({
  demoMode: true,
  connectedMode: false,
  liveAi: false,
  autonomousExecution: false,
  externalPublishing: false,
  realInfrastructureActions: false,
});

export type FeatureFlagKey = keyof FeatureFlags;

export function assertFlagEnabled(flags: FeatureFlags, key: FeatureFlagKey): void {
  if (!flags[key]) {
    throw new Error(`Feature flag "${key}" is disabled.`);
  }
}
