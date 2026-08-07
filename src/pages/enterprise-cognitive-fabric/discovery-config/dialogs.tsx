import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { StatusBadge } from "../command-center/panels";
import {
  dryRunSteps, fmt, processingDestinations, ruleAttributes, ruleOperators, ruleTypes,
  seedPlatformConfigs, seedScopeEntries,
  type DiscoveryConfiguration, type DiscoveryPreview, type DiscoveryRule, type DraftState,
  type DryRunResult, type RuleCondition, type RuleType,
} from "./data";

/* ------------------------------------------------------------ rule builder */

const emptyRule = (): DiscoveryRule => ({
  id: `RULE-${Math.floor(2000 + Math.random() * 7000)}`,
  configurationId: "DISC-CFG-001",
  name: "",
  ruleType: "Include",
  scope: "Enterprise",
  sourcePlatform: "All Platforms",
  contentType: "All",
  conditions: [{ id: "c1", attribute: "Content Type", operator: "equals", value: "", join: "AND", group: 0 }],
  action: "Discover Full Content",
  priority: 100,
  owner: "Enterprise Architecture",
  effectiveDate: new Date().toISOString().slice(0, 10),
  expirationDate: null,
  processingEligibility: ["Evidence Vault"],
  enabled: true,
  previewMatchCount: 0,
});

function humanSummary(rule: DiscoveryRule) {
  const verb =
    rule.ruleType === "Include" ? "Include" : rule.ruleType === "Exclude" ? "Exclude"
      : rule.ruleType === "Restrict" ? "Restrict" : rule.ruleType === "Prioritize" ? "Prioritize"
        : rule.ruleType;
  const conds = rule.conditions
    .filter((c) => c.value)
    .map((c, i) => `${i > 0 ? `${c.join} ` : ""}${c.attribute} ${c.operator} ${c.value}`)
    .join(" ");
  const target = rule.contentType === "All" ? "content" : `${rule.contentType.toLowerCase()} records`;
  return `${verb} ${target} on ${rule.sourcePlatform}${conds ? ` where ${conds}` : ""}. Action: ${rule.action}. Priority ${rule.priority}.`;
}

export function RuleBuilderDialog({
  open, onOpenChange, initial, onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: DiscoveryRule | null;
  onSave: (r: DiscoveryRule) => void;
}) {
  const [rule, setRule] = useState<DiscoveryRule>(initial ?? emptyRule());
  useEffect(() => { if (open) setRule(initial ? { ...initial, conditions: initial.conditions.map((c) => ({ ...c })) } : emptyRule()); }, [open, initial]);

  const matchCount = useMemo(() => {
    const base = 4200 + rule.conditions.filter((c) => c.value).length * 3100;
    const typeFactor = rule.ruleType === "Exclude" ? 6.4 : rule.ruleType === "Restrict" ? 3.1 : 1.8;
    return Math.round(base * typeFactor + rule.priority * 12);
  }, [rule]);

  const setCondition = (id: string, patch: Partial<RuleCondition>) =>
    setRule((r) => ({ ...r, conditions: r.conditions.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px]">{initial ? "Edit Discovery Rule" : "New Discovery Rule"}</DialogTitle>
          <DialogDescription className="text-[12px]">
            Rules govern what discovery may include, exclude, restrict, prioritize, or sample.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-[11px] font-medium text-slate-600">Rule Name</span>
            <Input value={rule.name} onChange={(e) => setRule({ ...rule, name: e.target.value })} className="mt-1 h-8 text-[12px]" placeholder="Include approved architecture decision records" />
          </label>
          <label className="block">
            <span className="text-[11px] font-medium text-slate-600">Rule Type</span>
            <Select value={rule.ruleType} onValueChange={(v) => setRule({ ...rule, ruleType: v as RuleType })}>
              <SelectTrigger className="mt-1 h-8 text-[12px]"><SelectValue /></SelectTrigger>
              <SelectContent>{ruleTypes.map((t) => <SelectItem key={t} value={t} className="text-[12px]">{t}</SelectItem>)}</SelectContent>
            </Select>
          </label>
          <label className="block">
            <span className="text-[11px] font-medium text-slate-600">Scope</span>
            <Select value={rule.scope} onValueChange={(v) => setRule({ ...rule, scope: v })}>
              <SelectTrigger className="mt-1 h-8 text-[12px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Enterprise" className="text-[12px]">Enterprise</SelectItem>
                {Array.from(new Set(seedScopeEntries.filter((s) => s.scopeType === "Business Unit" || s.scopeType === "Knowledge Domain").map((s) => s.scopeName)))
                  .map((s) => <SelectItem key={s} value={s} className="text-[12px]">{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </label>
          <label className="block">
            <span className="text-[11px] font-medium text-slate-600">Source Platform</span>
            <Select value={rule.sourcePlatform} onValueChange={(v) => setRule({ ...rule, sourcePlatform: v })}>
              <SelectTrigger className="mt-1 h-8 text-[12px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All Platforms" className="text-[12px]">All Platforms</SelectItem>
                {seedPlatformConfigs.map((p) => <SelectItem key={p.id} value={p.platform} className="text-[12px]">{p.platform}</SelectItem>)}
              </SelectContent>
            </Select>
          </label>
          <label className="block">
            <span className="text-[11px] font-medium text-slate-600">Content Type</span>
            <Input value={rule.contentType} onChange={(e) => setRule({ ...rule, contentType: e.target.value })} className="mt-1 h-8 text-[12px]" />
          </label>
        </div>

        <fieldset className="rounded-lg border border-slate-200 p-2.5">
          <legend className="px-1 text-[11px] font-semibold text-slate-700">Conditions</legend>
          <div className="space-y-1.5">
            {rule.conditions.map((c, i) => (
              <div key={c.id} className="flex flex-wrap items-center gap-1.5">
                {i > 0 && (
                  <Select value={c.join} onValueChange={(v) => setCondition(c.id, { join: v as "AND" })}>
                    <SelectTrigger className="h-7 w-[72px] text-[11px]" aria-label="Join operator"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AND" className="text-[12px]">AND</SelectItem>
                      <SelectItem value="OR" className="text-[12px]">OR</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                <Select value={c.attribute} onValueChange={(v) => setCondition(c.id, { attribute: v })}>
                  <SelectTrigger className="h-7 w-[168px] text-[11px]" aria-label="Metadata attribute"><SelectValue /></SelectTrigger>
                  <SelectContent>{ruleAttributes.map((a) => <SelectItem key={a} value={a} className="text-[12px]">{a}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={c.operator} onValueChange={(v) => setCondition(c.id, { operator: v })}>
                  <SelectTrigger className="h-7 w-[118px] text-[11px]" aria-label="Operator"><SelectValue /></SelectTrigger>
                  <SelectContent>{ruleOperators.map((o) => <SelectItem key={o} value={o} className="text-[12px]">{o}</SelectItem>)}</SelectContent>
                </Select>
                <Input
                  value={c.value}
                  onChange={(e) => setCondition(c.id, { value: e.target.value })}
                  placeholder="Value"
                  className="h-7 w-[180px] text-[11px]"
                  aria-label="Condition value"
                />
                <Select value={String(c.group)} onValueChange={(v) => setCondition(c.id, { group: Number(v) })}>
                  <SelectTrigger className="h-7 w-[92px] text-[11px]" aria-label="Condition group"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2].map((g) => <SelectItem key={g} value={String(g)} className="text-[12px]">Group {g + 1}</SelectItem>)}
                  </SelectContent>
                </Select>
                {rule.conditions.length > 1 && (
                  <Button size="sm" variant="ghost" className="h-7 text-[11px]"
                    onClick={() => setRule({ ...rule, conditions: rule.conditions.filter((x) => x.id !== c.id) })}>
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button
            size="sm" variant="outline" className="mt-2 h-7 text-[11px]"
            onClick={() => setRule({
              ...rule,
              conditions: [...rule.conditions, { id: `c${rule.conditions.length + 1}-${Date.now()}`, attribute: "Knowledge Domain", operator: "equals", value: "", join: "AND", group: 0 }],
            })}
          >
            Add condition
          </Button>
        </fieldset>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-[11px] font-medium text-slate-600">Action</span>
            <Input value={rule.action} onChange={(e) => setRule({ ...rule, action: e.target.value })} className="mt-1 h-8 text-[12px]" />
          </label>
          <label className="block">
            <span className="text-[11px] font-medium text-slate-600">Priority</span>
            <Input type="number" value={rule.priority} onChange={(e) => setRule({ ...rule, priority: Number(e.target.value) })} className="mt-1 h-8 text-[12px]" />
          </label>
          <label className="block">
            <span className="text-[11px] font-medium text-slate-600">Owner</span>
            <Input value={rule.owner} onChange={(e) => setRule({ ...rule, owner: e.target.value })} className="mt-1 h-8 text-[12px]" />
          </label>
          <label className="block">
            <span className="text-[11px] font-medium text-slate-600">Effective Date</span>
            <Input type="date" value={rule.effectiveDate} onChange={(e) => setRule({ ...rule, effectiveDate: e.target.value })} className="mt-1 h-8 text-[12px]" />
          </label>
          <label className="block">
            <span className="text-[11px] font-medium text-slate-600">Expiration Date (optional)</span>
            <Input type="date" value={rule.expirationDate ?? ""} onChange={(e) => setRule({ ...rule, expirationDate: e.target.value || null })} className="mt-1 h-8 text-[12px]" />
          </label>
          <div className="sm:col-span-2">
            <span className="text-[11px] font-medium text-slate-600">Processing Eligibility</span>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {["Evidence Vault", ...processingDestinations.slice(1)].map((d) => {
                const on = rule.processingEligibility.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setRule({
                      ...rule,
                      processingEligibility: on ? rule.processingEligibility.filter((x) => x !== d) : [...rule.processingEligibility, d],
                    })}
                    className={cn("rounded-md border px-2 py-1 text-[10.5px] font-medium",
                      on ? "border-blue-300 bg-blue-50 text-blue-800" : "border-slate-200 text-slate-600 hover:bg-slate-50")}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
          <div className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Rule summary</div>
          <p className="mt-1 text-[12px] text-slate-800">{humanSummary(rule)}</p>
          <p className="mt-1 text-[11px] text-slate-600">Preview match count: <strong>{matchCount.toLocaleString()}</strong> artifacts (deterministic estimate)</p>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" className="h-8 text-[12px]" disabled={!rule.name}
            onClick={() => { onSave({ ...rule, previewMatchCount: matchCount }); onOpenChange(false); }}>
            Save Rule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------ dry run */

export function DryRunDialog({
  open, onOpenChange, result, running, step, onOpenResults, onOpenRules, onOpenWarnings, onSaveDraft,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  result: DryRunResult | null;
  running: boolean;
  step: number;
  onOpenResults: () => void;
  onOpenRules: () => void;
  onOpenWarnings: () => void;
  onSaveDraft: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Dry Run Discovery</DialogTitle>
          <DialogDescription className="text-[12px]">
            Safe deterministic preview. Dry Run never changes Source Registry, Connector Health, or downstream ECF modules.
          </DialogDescription>
        </DialogHeader>

        <ol className="space-y-1" aria-label="Dry run steps">
          {dryRunSteps.map((s, i) => {
            const state = i < step ? "done" : i === step && running ? "active" : "pending";
            return (
              <li key={s} className="flex items-center gap-2 text-[12px]">
                {state === "done" ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                  : state === "active" ? <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" aria-hidden />
                    : <span className="h-3.5 w-3.5 rounded-full border border-slate-300" aria-hidden />}
                <span className={cn(state === "pending" ? "text-slate-400" : "text-slate-800")}>{s}</span>
              </li>
            );
          })}
        </ol>
        <Progress value={(step / dryRunSteps.length) * 100} className="h-1.5" aria-label="Dry run progress" />

        {result && !running && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                ["Matched Sources", String(result.matchedSources)],
                ["Excluded Sources", String(result.excludedSources)],
                ["Restricted Sources", String(result.restrictedSources)],
                ["Estimated Artifacts", fmt(result.estimatedArtifacts)],
              ].map(([l, v]) => (
                <div key={l} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5">
                  <div className="text-[10px] uppercase tracking-wide text-slate-500">{l}</div>
                  <div className="text-[14px] font-semibold text-slate-900">{v}</div>
                </div>
              ))}
            </div>
            {[
              ["Rule Conflicts", result.ruleConflicts.map((c) => c.message)],
              ["Ownership Gaps", result.ownershipGaps],
              ["Residency Gaps", result.residencyGaps],
              ["Permission Warnings", result.permissionWarnings],
              ["Processing Warnings", result.processingWarnings],
            ].map(([label, items]) => (
              <div key={label as string}>
                <div className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">
                  {label as string} ({(items as string[]).length})
                </div>
                {(items as string[]).length === 0 ? (
                  <p className="text-[11.5px] text-slate-500">None detected</p>
                ) : (
                  <ul className="mt-0.5 space-y-0.5">
                    {(items as string[]).map((m) => (
                      <li key={m} className="flex items-start gap-1.5 text-[11.5px] text-slate-700">
                        <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" aria-hidden />{m}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            <p className="flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-[11.5px] text-emerald-800">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> {result.completedAt}
            </p>
          </div>
        )}

        <DialogFooter className="flex-wrap gap-1.5">
          <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={onOpenResults} disabled={!result}>Open Results</Button>
          <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={onOpenRules}>Open Rules</Button>
          <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={onOpenWarnings}>Open Warnings</Button>
          <Button size="sm" className="h-8 text-[12px]" onClick={onSaveDraft}>Save Draft</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------------------------------- configuration detail */

export function ConfigurationDetailDrawer({
  open, onOpenChange, config, draft, preview,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  config: DiscoveryConfiguration | null;
  draft: DraftState;
  preview: DiscoveryPreview;
}) {
  if (!config) return null;
  const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-1.5">
      <span className="text-[11px] text-slate-500">{label}</span>
      <span className="text-right text-[11.5px] font-medium text-slate-800">{value}</span>
    </div>
  );
  const List = ({ items }: { items: string[] }) => (
    <div className="flex flex-wrap gap-1">
      {items.length ? items.map((i) => <StatusBadge key={i} tone="slate">{i}</StatusBadge>) : <span className="text-[11px] text-slate-400">None</span>}
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="text-[15px]">{config.name}</SheetTitle>
          <SheetDescription className="text-[12px]">{config.description}</SheetDescription>
        </SheetHeader>
        <Tabs defaultValue="overview" className="mt-3">
          <TabsList className="flex h-auto flex-wrap justify-start gap-1 bg-slate-100 p-1">
            {["Overview", "Scope", "Sources", "Rules", "Permissions", "Authority & Freshness", "Cadence",
              "Change Detection", "Processing Handoffs", "Preview", "History"].map((t) => (
                <TabsTrigger key={t} value={t.toLowerCase()} className="text-[11px]">{t}</TabsTrigger>
              ))}
          </TabsList>

          <TabsContent value="overview" className="mt-3">
            <Row label="Configuration" value={config.id} />
            <Row label="Scope" value={config.scopeType} />
            <Row label="Owner" value={config.owner} />
            <Row label="Version" value={config.version} />
            <Row label="Environment" value={config.environment} />
            <Row label="Status" value={<StatusBadge tone={config.status === "Active" ? "green" : config.status === "Draft" ? "slate" : "amber"}>{config.status}</StatusBadge>} />
            <Row label="Created" value={config.createdAt} />
            <Row label="Modified" value={config.updatedAt} />
            <Row label="Projected Discovery Volume" value={fmt(config.projectedVolume)} />
          </TabsContent>

          <TabsContent value="scope" className="mt-3 space-y-2">
            {[["Business Units", config.businessUnitIds], ["Teams", config.teamIds], ["Knowledge Domains", config.knowledgeDomainIds],
            ["Products", config.productIds], ["Services", config.serviceIds], ["Systems", config.systemIds],
            ["Customer Journeys", config.customerJourneyIds], ["Regions", config.regionIds], ["Environments", config.environmentIds]].map(([l, v]) => (
              <div key={l as string}>
                <div className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">{l as string}</div>
                <div className="mt-1"><List items={v as string[]} /></div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="sources" className="mt-3 space-y-2">
            <div>
              <div className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Included Source Platforms</div>
              <div className="mt-1"><List items={seedPlatformConfigs.filter((p) => draft.platforms[p.id]?.enabled && !draft.platforms[p.id]?.restricted).map((p) => p.platform)} /></div>
            </div>
            <div>
              <div className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Restricted Source Platforms</div>
              <div className="mt-1"><List items={seedPlatformConfigs.filter((p) => draft.platforms[p.id]?.restricted).map((p) => p.platform)} /></div>
            </div>
            <div>
              <div className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Explicitly Excluded Sources</div>
              <div className="mt-1"><List items={seedPlatformConfigs.filter((p) => !draft.platforms[p.id]?.enabled).map((p) => p.platform)} /></div>
            </div>
            <div>
              <div className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Included Source Types</div>
              <div className="mt-1"><List items={["Collection", "Space", "Project", "Repository", "Library", "Approved Channel"]} /></div>
            </div>
          </TabsContent>

          <TabsContent value="rules" className="mt-3 space-y-2">
            {(["Include", "Exclude", "Prioritize", "Sample", "Stop Traversal"] as const).map((t) => (
              <div key={t}>
                <div className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">{t} rules</div>
                <ul className="mt-0.5 space-y-0.5">
                  {draft.rules.filter((r) => r.ruleType === t).map((r) => (
                    <li key={r.id} className="text-[11.5px] text-slate-700">{r.id} · {r.name}</li>
                  ))}
                  {!draft.rules.some((r) => r.ruleType === t) && <li className="text-[11px] text-slate-400">None</li>}
                </ul>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="permissions" className="mt-3">
            <Row label="Permission Inheritance" value="Source → Collection → Folder → Artifact → Evidence → Derived" />
            <Row label="Preserve Source ACL" value={draft.permission.preserveSourceAcl ? "Enabled" : "Disabled"} />
            <Row label="Access Classification" value={config.accessClassification} />
            <Row label="Restricted Content Behavior" value={draft.permission.metadataOnlyWhenRestricted ? "Metadata only" : "Withheld"} />
          </TabsContent>

          <TabsContent value="authority & freshness" className="mt-3">
            {draft.authority.sourceTypeMappings.slice(0, 6).map((m) => <Row key={m.sourceType} label={m.sourceType} value={m.authority} />)}
            {draft.freshness.slice(0, 5).map((f) => <Row key={f.id} label={`${f.sourceType} freshness`} value={f.freshnessSla} />)}
            <Row label="Stale source behavior" value="Flag for rediscovery and downstream freshness warning" />
          </TabsContent>

          <TabsContent value="cadence" className="mt-3">
            <Row label="Mode" value={draft.cadence.mode} />
            <Row label="Schedule" value={draft.cadence.incrementalSchedule} />
            <Row label="Incremental Trigger" value="Supported source change events" />
            <Row label="Event Trigger" value={draft.cadence.eventTriggers.join(", ")} />
            <Row label="Full reconciliation" value={draft.cadence.fullSchedule} />
          </TabsContent>

          <TabsContent value="change detection" className="mt-3">
            {draft.changeDetection.map((c) => <Row key={c.id} label={c.triggerType} value={c.triggerDiscovery} />)}
          </TabsContent>

          <TabsContent value="processing handoffs" className="mt-3">
            {draft.handoffs.map((h) => (
              <Row key={h.id} label={h.destination} value={h.enabled ? `${h.authorityRequirement} · threshold ${h.qualityThreshold}` : "Disabled"} />
            ))}
          </TabsContent>

          <TabsContent value="preview" className="mt-3">
            <Row label="Sources evaluated" value={preview.sourcesEvaluated} />
            <Row label="Sources included" value={preview.includedSources} />
            <Row label="Artifacts discoverable" value={fmt(preview.discoverableArtifacts)} />
            <Row label="Projected ingestion volume" value={fmt(preview.projectedIngestionVolume)} />
            <Row label="Warnings" value={preview.warnings.length} />
            <Row label="Blocking issues" value={preview.blockingIssues.length} />
          </TabsContent>

          <TabsContent value="history" className="mt-3">
            <Row label="Created" value={`${config.createdAt} · ${config.owner}`} />
            <Row label="Modified" value={`${config.updatedAt} · ${config.owner}`} />
            <Row label="Validated" value="Validation arrives with configuration governance" />
            <Row label="Activated" value={config.status === "Active" ? `${config.updatedAt} · ${config.environment}` : "Not activated"} />
            <p className="mt-2 text-[11px] text-slate-500">
              Full version history, comparison, and approval records arrive with configuration governance.
            </p>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

/* --------------------------------------------------- new / clone dialog */

export function NewConfigurationDialog({
  open, onOpenChange, mode, sourceName, onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "new" | "clone";
  sourceName?: string;
  onCreate: (name: string, description: string, scopeType: string) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [scopeType, setScopeType] = useState("Business Unit");
  useEffect(() => {
    if (open) {
      setName(mode === "clone" && sourceName ? `${sourceName} (copy)` : "");
      setDescription("");
      setScopeType("Business Unit");
    }
  }, [open, mode, sourceName]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[15px]">{mode === "clone" ? "Clone Configuration" : "New Discovery Configuration"}</DialogTitle>
          <DialogDescription className="text-[12px]">
            New configurations start as drafts. Approval and activation arrive with configuration governance.
          </DialogDescription>
        </DialogHeader>
        <label className="block">
          <span className="text-[11px] font-medium text-slate-600">Configuration name</span>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 h-8 text-[12px]" />
        </label>
        <label className="block">
          <span className="text-[11px] font-medium text-slate-600">Description</span>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 text-[12px]" rows={3} />
        </label>
        <label className="block">
          <span className="text-[11px] font-medium text-slate-600">Scope type</span>
          <Select value={scopeType} onValueChange={setScopeType}>
            <SelectTrigger className="mt-1 h-8 text-[12px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Enterprise", "Business Unit", "Domain", "Team Group", "Policy Domain"].map((s) => (
                <SelectItem key={s} value={s} className="text-[12px]">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <DialogFooter>
          <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" className="h-8 text-[12px]" disabled={!name} onClick={() => { onCreate(name, description, scopeType); onOpenChange(false); }}>
            Create Draft
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------------------------------------------------- rule test */

export function RuleTestDialog({
  open, onOpenChange, rule,
}: { open: boolean; onOpenChange: (v: boolean) => void; rule: DiscoveryRule | null }) {
  if (!rule) return null;
  const sampleRows = [
    { source: "Architecture Repository / payments-adr", type: "Architecture Decision", result: rule.ruleType === "Exclude" ? "Excluded" : "Matched" },
    { source: "Confluence / Reliability Runbooks", type: "Runbook", result: rule.ruleType === "Require Owner" ? "Held for owner" : "Evaluated" },
    { source: "Google Drive / Personal drive", type: "Document", result: "Excluded by RULE-1002" },
    { source: "Policy Repository / Access Control Standard", type: "Policy", result: rule.ruleType === "Prioritize" ? "Primary Candidate" : "Evaluated" },
  ];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Test rule · {rule.id}</DialogTitle>
          <DialogDescription className="text-[12px]">
            Deterministic rule evaluation against the demonstration source sample. No discovery is executed.
          </DialogDescription>
        </DialogHeader>
        <p className="text-[12px] text-slate-700">{humanSummary(rule)}</p>
        <table className="w-full text-[11.5px]">
          <caption className="sr-only">Rule test sample</caption>
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th scope="col" className="px-2 py-1 text-left font-medium">Sample source</th>
              <th scope="col" className="px-2 py-1 text-left font-medium">Content type</th>
              <th scope="col" className="px-2 py-1 text-left font-medium">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sampleRows.map((r) => (
              <tr key={r.source}>
                <td className="px-2 py-1 text-slate-800">{r.source}</td>
                <td className="px-2 py-1 text-slate-600">{r.type}</td>
                <td className="px-2 py-1 text-slate-700">{r.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-[11.5px] text-slate-600">
          Estimated matches: <strong>{rule.previewMatchCount.toLocaleString()}</strong> artifacts.
        </p>
        <DialogFooter>
          <Button size="sm" className="h-8 text-[12px]" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------- source scope detail */

export function SourceScopeDetailDrawer({
  open, onOpenChange, platformId, draft, preview, onToggleRestrict, onDepthChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  platformId: string | null;
  draft: DraftState;
  preview: DiscoveryPreview;
  onToggleRestrict: (id: string) => void;
  onDepthChange: (id: string, d: 1 | 2 | 3 | 99) => void;
}) {
  const platform = seedPlatformConfigs.find((p) => p.id === platformId) ?? null;
  if (!platform) return null;
  const d = draft.platforms[platform.id];
  const totalShare = seedPlatformConfigs.reduce((s, p) => s + p.artifactShare, 0);
  const estimated = Math.round(preview.discoverableArtifacts * (d.enabled ? platform.artifactShare / totalShare : 0));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-[15px]">{platform.platform}</SheetTitle>
          <SheetDescription className="text-[12px]">{platform.scopeLabel} · synthetic demonstration source</SheetDescription>
        </SheetHeader>
        <Tabs defaultValue="scope" className="mt-3">
          <TabsList className="flex h-auto flex-wrap justify-start gap-1 bg-slate-100 p-1">
            {["Scope", "Content Types", "Permissions", "Authority", "Cadence", "Exclusions", "Preview"].map((t) => (
              <TabsTrigger key={t} value={t.toLowerCase()} className="text-[11px]">{t}</TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="scope" className="mt-3 space-y-1.5 text-[12px] text-slate-700">
            <p>{platform.sourceCount} source containers in scope: collections, projects, spaces, repositories, channels, and libraries as applicable.</p>
            <div className="flex items-center justify-between gap-2 rounded-md border border-slate-200 px-2 py-1.5">
              <span>Restricted handling</span>
              <Switch checked={d.restricted} onCheckedChange={() => onToggleRestrict(platform.id)} aria-label="Restricted handling" />
            </div>
            <div className="flex items-center justify-between gap-2 rounded-md border border-slate-200 px-2 py-1.5">
              <span>Discovery depth</span>
              <Select value={String(d.depth)} onValueChange={(v) => onDepthChange(platform.id, Number(v) as 3)}>
                <SelectTrigger className="h-7 w-[112px] text-[11px]" aria-label="Discovery depth"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1" className="text-[12px]">Depth 1</SelectItem>
                  <SelectItem value="2" className="text-[12px]">Depth 2</SelectItem>
                  <SelectItem value="3" className="text-[12px]">Depth 3</SelectItem>
                  <SelectItem value="99" className="text-[12px]">Unlimited</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          <TabsContent value="content types" className="mt-3 text-[12px] text-slate-700">
            <div className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Allowed</div>
            <div className="mt-1 flex flex-wrap gap-1">{platform.contentTypes.map((c) => <StatusBadge key={c} tone="green">{c}</StatusBadge>)}</div>
            <div className="mt-2 text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Excluded</div>
            <div className="mt-1 flex flex-wrap gap-1"><StatusBadge tone="red">Secrets</StatusBadge><StatusBadge tone="red">Credentials</StatusBadge><StatusBadge tone="red">Temporary files</StatusBadge></div>
          </TabsContent>
          <TabsContent value="permissions" className="mt-3 text-[12px] text-slate-700">
            <p>Permission mode: <strong>{d.permissionMode}</strong></p>
            <p className="mt-1">Source ACLs are preserved and inherited restrictions are carried into evidence and derived records.</p>
          </TabsContent>
          <TabsContent value="authority" className="mt-3 text-[12px] text-slate-700">
            <p>Default source authority: <strong>{d.authority}</strong></p>
            <p className="mt-1">Content specific overrides are applied from the Content Type Discovery Policy.</p>
          </TabsContent>
          <TabsContent value="cadence" className="mt-3 text-[12px] text-slate-700">
            <p>{d.cadenceOverride === "Inherited" ? `Inherited from enterprise cadence: ${draft.cadence.incrementalSchedule}` : `Source override: ${d.cadenceOverride}`}</p>
          </TabsContent>
          <TabsContent value="exclusions" className="mt-3 text-[12px] text-slate-700">
            <ul className="list-disc space-y-0.5 pl-4">
              {draft.rules.filter((r) => r.ruleType === "Exclude" && (r.sourcePlatform === platform.platform || r.sourcePlatform === "All Platforms"))
                .map((r) => <li key={r.id}>{r.id} · {r.name}</li>)}
            </ul>
          </TabsContent>
          <TabsContent value="preview" className="mt-3 text-[12px] text-slate-700">
            <p>Estimated records for this source platform: <strong>{fmt(estimated)}</strong></p>
            <p className="mt-1 text-slate-500">Estimate updates when scope, depth, content types, or rules change.</p>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
