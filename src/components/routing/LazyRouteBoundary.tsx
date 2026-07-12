import React, { Suspense } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface State {
  hasError: boolean;
  message?: string;
}

/**
 * Route-scoped error boundary for React.lazy chunks.
 *
 * Sits between the auth/tenant guards and <Suspense>: if a lazy chunk fails
 * to download (offline, 404 after redeploy, corrupt bundle) we render a
 * scoped surface instead of blanking the whole shell. Application shell,
 * Auth/Tenant guards, and the router itself remain mounted above us.
 */
class LazyRouteErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { hasError: false };

  static getDerivedStateFromError(err: unknown): State {
    return {
      hasError: true,
      message: err instanceof Error ? err.message : "Unknown error",
    };
  }

  componentDidCatch(err: unknown): void {
    console.error("[LazyRouteBoundary] caught error", err);
  }

  reset = (): void => this.setState({ hasError: false, message: undefined });

  render() {
    if (!this.state.hasError) return this.props.children;
    return <LazyRouteErrorSurface message={this.state.message} onRetry={this.reset} />;
  }
}

function LazyRouteErrorSurface({
  message,
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  const navigate = useNavigate();
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="mx-auto max-w-2xl p-8"
    >
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-2 text-red-800">
          <AlertTriangle className="h-4 w-4" aria-hidden />
          <span className="text-[13px] font-semibold">
            This view failed to load.
          </span>
        </div>
        <p className="mt-2 text-[12.5px] text-red-900/80">
          {message ??
            "A required code chunk could not be downloaded. Check your connection and try again."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" onClick={onRetry}>
            Retry
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate(-1)}>
            Go back
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link to="/runops">RunOps home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Accessible Suspense fallback used while a lazy route chunk downloads.
 * Keeps the outer application shell visible and avoids layout shift by
 * occupying the outlet with a small, centered pending indicator.
 * Honors prefers-reduced-motion via the `motion-safe:` variant.
 */
export function LazyRouteFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="flex min-h-[40vh] w-full items-center justify-center p-8"
    >
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Loader2
          className="h-4 w-4 motion-safe:animate-spin"
          aria-hidden
        />
        <span>Loading view…</span>
      </div>
    </div>
  );
}

/**
 * Composite wrapper: error boundary + Suspense with a visible fallback.
 * Auth/tenant guards must sit OUTSIDE this component so unauthorized content
 * never flashes.
 */
export function LazyRouteBoundary({ children }: { children: React.ReactNode }) {
  return (
    <LazyRouteErrorBoundary>
      <Suspense fallback={<LazyRouteFallback />}>{children}</Suspense>
    </LazyRouteErrorBoundary>
  );
}
