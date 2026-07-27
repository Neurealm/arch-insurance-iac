import React from "react";
import { CaeFaultContext } from "./featureFlags";

type State = { hasError: boolean };

/**
 * Global error handling for Contextual Audio Enrichment.
 *
 * Audio is an enrichment layer: a fault inside the audio controller must never
 * take down a NeuGAIN.io module. If anything in the provider subtree throws,
 * this boundary hard-stops speech and re-renders the application with an inert
 * audio controller, so every page keeps working without narration.
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
      <CaeFaultContext.Provider value={true}><span>FALLBACK</span>{this.props.children}</CaeFaultContext.Provider>
    );
  }
}
