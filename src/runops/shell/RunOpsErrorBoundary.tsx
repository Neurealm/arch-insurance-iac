import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface State { hasError: boolean; message?: string; }

/**
 * Application-level error boundary for the RunOps shell.
 * Renders a scoped error surface without unmounting the AppShell.
 */
export class RunOpsErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(err: unknown): State {
    return { hasError: true, message: err instanceof Error ? err.message : "Unknown error" };
  }

  componentDidCatch(err: unknown): void {
    // eslint-disable-next-line no-console
    console.error("[RunOps] boundary caught error", err);
  }

  reset = (): void => this.setState({ hasError: false, message: undefined });

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="mx-auto max-w-2xl p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-[13px] font-semibold">Something went wrong in this view.</span>
          </div>
          <p className="mt-2 text-[12.5px] text-red-900/80">
            {this.state.message ?? "An unexpected error was captured by the RunOps error boundary."}
          </p>
          <div className="mt-4 flex gap-2">
            <Button size="sm" onClick={this.reset}>Try again</Button>
            <Button size="sm" variant="outline" asChild>
              <Link to="/runops">Back to Command Center</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
