import React from "react";
import { CaeFaultContext } from "./featureFlags";
import { ContextualAudioContext, createInertContextualAudioValue, ContextualAudioProvider } from "./ContextualAudioProvider";

type State = { hasError: boolean };

/**
 * Global error handling for Contextual Audio Enrichment.
 *
 * Audio is an enrichment layer: a fault inside the audio controller must never
 * take down a NeuGAIN.io module. When the audio subtree throws, this boundary
 * hard-stops speech and re-renders the application WITHOUT the audio provider,
 * supplying an inert controller instead. Every page keeps rendering; only
 * narration is lost, and no further speech can start.
 */
export class ContextualAudioErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown): void {
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* engine may throw while cancelling; ignore */
    }
    // eslint-disable-next-line no-console
    console.error("[CAE] contextual audio boundary caught error", error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <CaeFaultContext.Provider value={true}>
        <ContextualAudioContext.Provider value={createInertContextualAudioValue()}>
          {this.props.children}
        </ContextualAudioContext.Provider>
      </CaeFaultContext.Provider>
    );
  }
}

/**
 * The single approved global mount for Contextual Audio Enrichment.
 *
 * Composes the boundary and the provider so application shells cannot get the
 * order wrong. On fault the provider is dropped entirely and consumers receive
 * an inert controller.
 */
export function ContextualAudioRoot({ children }: { children: React.ReactNode }) {
  return (
    <ContextualAudioErrorBoundary>
      <ContextualAudioProvider>{children}</ContextualAudioProvider>
    </ContextualAudioErrorBoundary>
  );
}
