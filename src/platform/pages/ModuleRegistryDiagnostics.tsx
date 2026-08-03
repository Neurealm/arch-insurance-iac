import { lazy, Suspense, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { getModules, validateRegistry } from "@/modules/registry";
import { reconcileRoutes } from "@/modules/routeOwnership";
import { summarizeEvidence } from "@/modules/evidence";
import type { RouteOwnershipClass } from "@/modules/routeTypes";

/** The unregistered report pulls in the full inventory — load it on demand. */
const UnregisteredPanel = lazy(() => import("./ModuleRegistryUnregistered"));

const OWNERSHIP_TONE: Record<RouteOwnershipClass, string> = {
  "module-owned": "bg-primary/10 text-primary border-primary/20",
  shared: "bg-accent text-accent-foreground border-border",
  "platform-owned": "bg-muted text-muted-foreground border-border",
  unregistered: "bg-destructive/10 text-destructive border-destructive/20",
  "ownership-conflict": "bg-destructive/15 text-destructive border-destructive/30",
  "unable-to-verify": "bg-muted text-muted-foreground border-dashed border-border",
};

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <div className="text-2xl font-semibold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

export default function ModuleRegistryDiagnostics() {
  const modules = getModules();
  const routeReport = useMemo(() => reconcileRoutes(), []);
  const registryReport = useMemo(() => validateRegistry(), []);
  const evidence = useMemo(() => summarizeEvidence(), []);
  const [filter, setFilter] = useState("");

  const rows = routeReport.routes.filter((r) =>
    filter
      ? r.route.path.toLowerCase().includes(filter.toLowerCase()) ||
        (r.moduleId ?? "").toLowerCase().includes(filter.toLowerCase())
      : true,
  );

  const findings = [...registryReport.findings, ...routeReport.findings];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-foreground">Module Registry Diagnostics</h1>
        <p className="text-sm text-muted-foreground">
          Internal architecture view. Reconciles declared module manifests against the real
          application route table and implementation inventory.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
        <Stat label="Registered modules" value={modules.length} />
        <Stat label="Application routes" value={routeReport.counts.total} />
        <Stat label="Module-owned" value={routeReport.counts.byOwnership["module-owned"]} />
        <Stat label="Unregistered" value={routeReport.counts.unregistered} />
        <Stat label="Ownership conflicts" value={routeReport.counts.conflicts} />
        <Stat label="Missing references" value={routeReport.counts.missingPages} />
      </div>

      <Tabs defaultValue="modules">
        <TabsList>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="routes">Routes</TabsTrigger>
          <TabsTrigger value="findings">Findings</TabsTrigger>
          <TabsTrigger value="unregistered">Unregistered</TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="space-y-3 pt-4">
          {modules.map((m) => (
            <Card key={m.identity.moduleId}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  {m.identity.name}
                  <Badge variant="outline">{m.identity.moduleId}</Badge>
                  <Badge variant="secondary">{m.identity.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-muted-foreground">
                <p>{m.identity.description}</p>
                <p>
                  {m.boundaries.routes.length} routes · {m.boundaries.pageIds.length} pages ·{" "}
                  {m.capabilities.length} capabilities · owners: {m.identity.productOwner} /{" "}
                  {m.identity.technicalOwner}
                </p>
                {m.identity.moduleId === "sre" && (
                  <p>
                    Evidence: strongest {evidence.strongest}; highest justifiable status{" "}
                    {evidence.maxJustifiableStatus} across {evidence.recordCount} traced pages.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="routes" className="space-y-3 pt-4">
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by path or module…"
            className="max-w-sm"
          />
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Path</th>
                  <th className="px-3 py-2">Owner</th>
                  <th className="px-3 py-2">Ownership</th>
                  <th className="px-3 py-2">Page</th>
                  <th className="px-3 py-2">Nav</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 400).map((r, i) => (
                  <tr key={`${r.route.path}-${i}`} className="border-t border-border">
                    <td className="px-3 py-1.5 font-mono text-xs">{r.route.path}</td>
                    <td className="px-3 py-1.5">{r.moduleId ?? "—"}</td>
                    <td className="px-3 py-1.5">
                      <span
                        className={`rounded border px-1.5 py-0.5 text-[11px] ${OWNERSHIP_TONE[r.ownership]}`}
                      >
                        {r.ownership}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 font-mono text-[11px] text-muted-foreground">
                      {r.route.componentFile ?? r.route.redirectTo ?? "—"}
                    </td>
                    <td className="px-3 py-1.5 text-xs text-muted-foreground">
                      {r.navigationEntries.length > 0 ? "yes" : r.reachable ? "inherited" : "none"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="findings" className="pt-4">
          <div className="space-y-2">
            {findings.slice(0, 300).map((f, i) => (
              <div key={i} className="rounded-md border border-border px-3 py-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{f.severity}</Badge>
                  <span className="font-mono text-xs text-muted-foreground">{f.ruleId}</span>
                </div>
                <p className="mt-1 text-muted-foreground">{f.message}</p>
              </div>
            ))}
            {findings.length === 0 && (
              <p className="text-sm text-muted-foreground">No findings.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="unregistered" className="pt-4">
          <Suspense fallback={<p className="text-sm text-muted-foreground">Loading inventory…</p>}>
            <UnregisteredPanel />
          </Suspense>
        </TabsContent>

        {STAGE3_TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="pt-4">
            <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
              <Stage3Panel view={tab.view} />
            </Suspense>
          </TabsContent>
        ))}
      </Tabs>

    </div>
  );
}
