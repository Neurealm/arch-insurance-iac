import React, { useCallback, useMemo, useState } from "react";
import { CaeFaultContext } from "./featureFlags";
import {
  ContextualAudioContext,
  createInertContextualAudioValue,
  ContextualAudioProvider,
} from "./ContextualAudioProvider";

type BoundaryProps = { children: React.ReactNode; onFault: (error: unknown) => void };
type BoundaryState = { hasError: boolean };

/**
 * Catches faults raised anywhere inside the Contextual Audio subtree.
 *
 * On fault it renders nothing and notifies its owner, which then re-renders the
 * application without the audio provider. Audio is an enrichment layer, so a
 * fault must never take a NeuGAIN.io module down with it.
 */
export class ContextualAudioErrorBoundary extends React.Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { hasError: false };

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown): void {
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* the engine may throw while cancelling; ignore */
    }
    // eslint-disable-next-line no-console
    console.error("[CAE] contextual audio boundary caught error", error);
    this.props.onFault(error);
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

/**
 * The single approved global mount for Contextual Audio Enrichment.
 *
 * Composes the boundary and the provider so application shells cannot get the
 * order wrong. If the audio controller faults, the provider is dropped and every
 * consumer receives an inert controller: pages keep rendering, nothing speaks.
 */
export function ContextualAudioRoot({ children }: { children: React.ReactNode }) {
  const [faulted, setFaulted] = useState(false);
  const onFault = useCallback(() => setFaulted(true), []);
  const inertValue = useMemo(() => createInertContextualAudioValue(), []);

  if (faulted) {
    return (
      <CaeFaultContext.Provider value={true}>
        <ContextualAudioContext.Provider value={inertValue}>
          {children}
        </ContextualAudioContext.Provider>
      </CaeFaultContext.Provider>
    );
  }

  return (
    <ContextualAudioErrorBoundary onFault={onFault}>
      <ContextualAudioProvider>{children}</ContextualAudioProvider>
    </ContextualAudioErrorBoundary>
  );
}
