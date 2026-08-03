import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { classifyUnregistered } from "@/modules/classification";
import { discoverCandidateModules } from "@/modules/candidates";
import { runGovernance } from "@/modules/governance";
import { SHARED_CAPABILITIES } from "@/modules/shared/sharedCapabilities";
import { PLATFORM_CAPABILITIES } from "@/modules/platform/platformCapabilities";
import { SRE_CAPABILITY_HIERARCHY } from "@/modules/sre/capabilityHierarchy";
import type { CandidateReadiness, GovernanceSeverity } from "@/modules/classificationTypes";

export type Stage3View =
  | "classification"
  | "candidates"
  | "shared"
  | "platform"
  | "capability-tree"
  | "governance";

const READINESS_TONE: Record<CandidateReadiness, string> = {
  "ready-to-register": "bg-primary/10 text-primary border-primary/20",
  "register-with-warnings": "bg-accent text-accent-foreground border-border",
  "requires-architecture-cleanup": "bg-destructive/10 text-destructive border-destructive/20",
  "requires-product-owner-review": "bg-muted text-muted-foreground border-border",
  "insufficient-evidence": "bg-muted text-muted-foreground border-dashed border-border",
};

const SEVERITY_TONE: Record<GovernanceSeverity, string> = {
  error: "bg-destructive/10 text-destructive border-destructive/20",
  warning: "bg-accent text-accent-foreground border-border",
  info: "bg-muted text-muted-foreground border-border",
};

const LEVEL_INDENT: Record<string, string> = {
  domain: "pl-0",
  capability: "pl-4",
  "sub-capability": "pl-8",
  feature: "pl-12",
};

function Meta({ label, values }: { label: string; values: readonly string[] }) {
  if (!values.length) return null;
  return (
    <p className="text-xs text-muted-foreground">
      <span className="font-medium text-foreground">{label}:</span> {values.join(", ")}
    </p>
  );
}

function ClassificationView() {
  const report = useMemo(() => classifyUnregistered(), []);
  const [kind, setKind] = useState("all");
  const [confidence, setConfidence] = useState("all");
  const [search, setSearch] = useState("");

  const items = report.items.filter(
    (i) =>
      (kind === "all" || i.classification === kind) &&
      (confidence === "all" || i.confidence === confidence) &&
      (!search || i.ref.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by path"
          className="max-w-xs"
        />
        <Select value={kind} onValueChange={setKind}>
          <SelectTrigger className="w-56"><SelectValue placeholder="Classification" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All classifications</SelectItem>
            {Object.keys(report.byClassification).map((k) => (
              <SelectItem key={k} value={k}>
                {k} ({report.byClassification[k as keyof typeof report.byClassification]})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={confidence} onValueChange={setConfidence}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Confidence" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All confidence</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground">
        {items.length} of {report.items.length} items · {report.humanReviewCount} need human review ·{" "}
        {report.unableToDetermineCount} unable to determine
      </p>

      <div className="space-y-2">
        {items.slice(0, 300).map((item) => (
          <div key={item.itemId} className="rounded-lg border border-border bg-card px-3 py-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-foreground">{item.ref}</span>
              <Badge variant="outline">{item.classification}</Badge>
              <Badge variant="outline">{item.ownershipClassification}</Badge>
              <Badge variant="outline">{item.confidence} confidence</Badge>
              {item.humanReviewRequired && <Badge variant="outline">review required</Badge>}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Recommended action: {item.recommendedAction}
              {item.likelyOwner ? ` · likely owner: ${item.likelyOwner}` : ""}
            </p>
            <Meta label="Evidence" values={item.evidence} />
          </div>
        ))}
        {items.length > 300 && (
          <p className="text-xs text-muted-foreground">Showing the first 300 matches.</p>
        )}
      </div>
    </div>
  );
}

function CandidatesView() {
  const candidates = useMemo(() => discoverCandidateModules(), []);
  const [readiness, setReadiness] = useState("all");
  const shown = candidates.filter((c) => readiness === "all" || c.readiness === readiness);

  return (
    <div className="space-y-4">
      <Select value={readiness} onValueChange={setReadiness}>
        <SelectTrigger className="w-72"><SelectValue placeholder="Readiness" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All readiness states</SelectItem>
          {Object.keys(READINESS_TONE).map((r) => (
            <SelectItem key={r} value={r}>{r}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {shown.map((c) => (
        <Card key={c.proposedModuleId}>
          <CardHeader className="pb-2">
            <CardTitle className="flex flex-wrap items-center gap-2 text-base">
              {c.proposedName}
              <Badge variant="outline" className={READINESS_TONE[c.readiness]}>{c.readiness}</Badge>
              <Badge variant="outline">{c.confidence} confidence</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground">{c.businessPurpose}</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground md:grid-cols-4">
              <span>{c.metrics.routeCount} routes</span>
              <span>{c.metrics.fileCount} files</span>
              <span>{c.metrics.navigationCount} nav entries</span>
              <span>{c.metrics.supabaseFileCount} data-access files</span>
            </div>
            <Meta label="Capabilities" values={c.majorCapabilities} />
            <Meta label="Database entities" values={c.databaseEntities} />
            <Meta label="Evidence" values={c.evidence} />
            <Meta label="Boundary risks" values={c.boundaryRisks} />
            <Meta label="Shared dependencies" values={c.sharedDependencies} />
            <Meta label="Platform dependencies" values={c.platformDependencies} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SharedView() {
  return (
    <div className="space-y-3">
      {SHARED_CAPABILITIES.map((c) => (
        <Card key={c.sharedCapabilityId}>
          <CardHeader className="pb-2">
            <CardTitle className="flex flex-wrap items-center gap-2 text-base">
              {c.name}
              <Badge variant="outline">{c.status}</Badge>
              <Badge variant="outline">{c.maturity}</Badge>
              <Badge variant="outline">owner: {c.primaryOwner}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground">{c.description}</p>
            <Meta label="Consumers" values={c.consumingModules} />
            <Meta label="Source" values={c.sourcePaths} />
            <Meta label="Database entities" values={c.databaseEntities} />
            <Meta label="Evidence" values={c.evidence} />
            <Meta label="Known limitations" values={c.knownLimitations} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function PlatformView() {
  return (
    <div className="space-y-3">
      {PLATFORM_CAPABILITIES.map((c) => (
        <Card key={c.platformCapabilityId}>
          <CardHeader className="pb-2">
            <CardTitle className="flex flex-wrap items-center gap-2 text-base">
              {c.name}
              <Badge variant="outline">{c.status}</Badge>
              <Badge variant="outline">{c.maturity}</Badge>
              {c.frequentlyMiscounted && <Badge variant="outline">never a module capability</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground">{c.description}</p>
            <Meta label="Source" values={c.sourcePaths} />
            <Meta label="Edge functions" values={c.apis} />
            <Meta label="Database entities" values={c.databaseEntities} />
            <Meta label="Evidence" values={c.evidence} />
            <Meta label="Known limitations" values={c.knownLimitations} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CapabilityTreeView() {
  const nodes = SRE_CAPABILITY_HIERARCHY.nodes;
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        {SRE_CAPABILITY_HIERARCHY.moduleId} · {nodes.length} nodes across four levels. Stage 1
        capability IDs are preserved via supersedes links.
      </p>
      {nodes.map((n) => (
        <div
          key={n.capabilityId}
          className={`rounded-lg border border-border bg-card px-3 py-2 ${LEVEL_INDENT[n.level] ?? ""}`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-foreground">{n.name}</span>
            <Badge variant="outline">{n.level}</Badge>
            <Badge variant="outline">{n.implementationClassification}</Badge>
            <Badge variant="outline">{n.evidenceStrength}</Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{n.description}</p>
          <Meta label="Routes" values={n.relatedRoutes} />
          <Meta label="Limitations" values={n.knownLimitations} />
          {n.supersedesCapabilityId && (
            <p className="text-xs text-muted-foreground">Supersedes {n.supersedesCapabilityId}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function GovernanceView() {
  const report = useMemo(() => runGovernance(), []);
  const [severity, setSeverity] = useState("all");
  const findings = report.findings.filter((f) => severity === "all" || f.severity === severity);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={severity} onValueChange={setSeverity}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Severity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All severities</SelectItem>
            <SelectItem value="error">Errors</SelectItem>
            <SelectItem value="warning">Warnings</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">
          {report.errorCount} errors · {report.warningCount} warnings · {report.infoCount} info ·{" "}
          {report.blocksRelease ? "release review required" : "no release blockers"}
        </span>
      </div>

      <div className="space-y-2">
        {findings.slice(0, 300).map((f, i) => (
          <div key={`${f.ruleId}-${f.subject}-${i}`} className="rounded-lg border border-border bg-card px-3 py-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={SEVERITY_TONE[f.severity]}>{f.severity}</Badge>
              <span className="font-mono text-xs text-muted-foreground">{f.ruleId}</span>
              {f.moduleId && <Badge variant="outline">{f.moduleId}</Badge>}
            </div>
            <p className="mt-1 text-sm text-foreground">{f.message}</p>
            <p className="text-xs text-muted-foreground">{f.remediation}</p>
          </div>
        ))}
        {findings.length > 300 && (
          <p className="text-xs text-muted-foreground">Showing the first 300 findings.</p>
        )}
      </div>
    </div>
  );
}

export default function ModuleRegistryStage3({ view }: { view: Stage3View }) {
  switch (view) {
    case "classification":
      return <ClassificationView />;
    case "candidates":
      return <CandidatesView />;
    case "shared":
      return <SharedView />;
    case "platform":
      return <PlatformView />;
    case "capability-tree":
      return <CapabilityTreeView />;
    case "governance":
      return <GovernanceView />;
    default:
      return null;
  }
}
