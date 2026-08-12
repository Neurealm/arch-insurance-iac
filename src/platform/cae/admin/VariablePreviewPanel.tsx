/**
 * Author-facing resolved preview for dynamic variables.
 *
 * Shows the narrative exactly as it will read and speak once resolved, and
 * warns about unavailable, disabled, malformed, unknown, or unauthorised
 * variables before the author submits the version for review.
 */
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { resolveVariables } from "../variables/resolve";
import type { CaeVariableContext, CaeVariableDefinition, CaeVariableRegistry } from "../variables/types";

type Props = {
  sourceText: string;
  spokenSource: string;
  registry: CaeVariableRegistry;
  definitions: CaeVariableDefinition[];
  context: CaeVariableContext;
};

export function VariablePreviewPanel({ sourceText, spokenSource, registry, definitions, context }: Props) {
  const display = resolveVariables(sourceText, registry, context);
  const spoken = resolveVariables(spokenSource, registry, context);
  const issues = [...display.diagnostics, ...spoken.diagnostics]
    .filter((d) => d.code !== "resolved")
    .filter((d, i, all) => all.findIndex((x) => x.token === d.token && x.code === d.code) === i);
  const referenced = [...new Set([...display.resolvedKeys, ...spoken.resolvedKeys])];
  const hasTokens = display.diagnostics.length > 0 || spoken.diagnostics.length > 0;

  return (
    <div className="space-y-3">
      <div>
        <span className="text-xs font-medium text-foreground">Dynamic variables</span>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {!hasTokens && <span className="text-xs text-muted-foreground">None referenced.</span>}
          {referenced.map((key) => (
            <Badge key={key} variant="secondary">{`{{${key}}}`}</Badge>
          ))}
          {issues.map((issue) => (
            <Badge key={`${issue.token}-${issue.code}`} variant="outline" className="border-destructive text-destructive">
              {issue.token} · {issue.code.replace(/_/g, " ")}
            </Badge>
          ))}
        </div>
        {definitions.length > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            Approved: {definitions
              .filter((d) => d.isEnabled && d.isAuthorized)
              .map((d) => `{{${d.variableKey}}}`)
              .join(", ") || "none available to you in this workspace"}
          </p>
        )}
      </div>

      {issues.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>Review these variables before publishing</AlertTitle>
          <AlertDescription>
            <ul className="list-disc space-y-1 pl-4 text-xs">
              {issues.map((issue) => (
                <li key={`${issue.token}-${issue.code}`}>{issue.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {hasTokens && issues.length === 0 && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
          Every referenced variable is registered, enabled, and available to you.
        </p>
      )}

      {hasTokens && (
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-md border border-border bg-muted/30 p-3">
            <p className="text-xs font-medium text-foreground">Resolved written preview</p>
            <p className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">{display.displayText}</p>
          </div>
          <div className="rounded-md border border-border bg-muted/30 p-3">
            <p className="text-xs font-medium text-foreground">Resolved spoken preview</p>
            <p className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">{spoken.spokenText}</p>
          </div>
        </div>
      )}
    </div>
  );
}
