import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Ban, Inbox, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground" role="status" aria-live="polite">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
        <Inbox className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
        <div className="text-sm font-medium text-foreground">{title}</div>
        {description && <p className="max-w-md text-xs text-muted-foreground">{description}</p>}
        {action}
      </CardContent>
    </Card>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const message = error instanceof Error ? error.message : "Something went wrong.";
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-2 py-8 text-center" role="alert">
        <AlertTriangle className="h-8 w-8 text-destructive" aria-hidden="true" />
        <div className="text-sm font-medium text-foreground">We couldn't load this section</div>
        <p className="max-w-md text-xs text-muted-foreground">{sanitizeError(message)}</p>
        {onRetry && <Button size="sm" variant="outline" onClick={onRetry}>Try again</Button>}
      </CardContent>
    </Card>
  );
}

export function ForbiddenState({ permission }: { permission?: string }) {
  return (
    <main className="min-h-[60vh] grid place-items-center px-6" role="alert" aria-labelledby="forbidden-title">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <Ban className="h-10 w-10 text-destructive" aria-hidden="true" />
          <h1 id="forbidden-title" className="text-lg font-semibold text-foreground">Access denied</h1>
          <p className="text-sm text-muted-foreground">
            You don't have permission to view this page.
            {permission && <> Required: <span className="font-mono text-xs">{permission}</span>.</>}
          </p>
          <div className="flex gap-2">
            <Button asChild variant="outline"><Link to="/platform">Back to platform</Link></Button>
            <Button asChild><Link to="/app">Home</Link></Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

/** Strips PostgREST/PG noise from server errors before showing to end users. */
export function sanitizeError(message: string): string {
  if (!message) return "Unexpected error.";
  const stripped = message
    .replace(/^permission denied for [^:]+:\s*/i, "")
    .replace(/^ERROR:\s*/i, "")
    .replace(/\bSQLSTATE\b[^)]*\)/gi, "")
    .replace(/\bnew row violates row-level security policy.*$/i, "You are not allowed to perform this action.")
    .replace(/\bduplicate key value violates unique constraint.*$/i, "That value is already in use.")
    .trim();
  return stripped || "Unexpected error.";
}
