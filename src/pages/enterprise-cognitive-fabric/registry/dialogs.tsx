import { useEffect, useMemo, useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Row } from "../pipeline/panels";
import { download, nf, sourcesToCsv, sourcesToYaml } from "./panels";
import {
  duplicateComparison, filterOptions, makeRegisteredSource,
  type AccessClassification, type AuthorityLevel, type SourceRegistryRecord,
} from "./data";

function Choices({ options, value, onChange, cols = 3, label }: {
  options: readonly string[]; value: string; onChange: (v: string) => void; cols?: number; label?: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cn("grid gap-1.5", cols === 2 ? "sm:grid-cols-2" : "grid-cols-2 sm:grid-cols-3")}>
      {options.map((o) => (
        <button
          key={o} type="button" role="radio" aria-checked={value === o} onClick={() => onChange(o)}
          className={cn(
            "rounded-md border px-2.5 py-2 text-left text-[12px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
            value === o ? "border-blue-400 bg-blue-50 text-blue-800" : "border-slate-200 text-slate-700 hover:bg-slate-50",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function Field({ id, label, value, onChange, placeholder }: {
  id: string; label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="grid gap-1">
      <Label htmlFor={id} className="text-[11px] text-slate-600">{label}</Label>
      <Input id={id} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="h-8 text-[12px]" />
    </div>
  );
}

function Picker({ id, label, options, value, onChange }: {
  id: string; label: string; options: string[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="grid gap-1">
      <Label htmlFor={id} className="text-[11px] text-slate-600">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="h-8 text-[12px]"><SelectValue /></SelectTrigger>
        <SelectContent>{options.map((o) => <SelectItem key={o} value={o} className="text-[12px]">{o}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}

/* --------------------------- register source ------------------------------ */

const METHODS = ["Register discovered source", "Register source manually", "Import registry records", "Clone existing configuration"];
const AUTHORITIES: AuthorityLevel[] = ["Primary", "Supporting", "Historical", "Reference", "Unconfirmed"];
const CLASSIFICATIONS: AccessClassification[] = ["Public", "Internal", "Confidential", "Restricted", "Highly Restricted"];
const REGISTER_STEPS = [
  "Validating source", "Checking duplicates", "Resolving ownership", "Validating access",
  "Applying classification", "Creating registry record", "Linking connector", "Creating review task", "Completed",
];

export function RegisterSourceDialog({ open, onOpenChange, nextIndex, onRegistered }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  nextIndex: number;
  onRegistered: (record: SourceRegistryRecord, followUp: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [method, setMethod] = useState(METHODS[0]);
  const [name, setName] = useState("Customer Advisory Notes");
  const [description, setDescription] = useState("Advisory board notes covering customer commitments and escalation themes.");
  const [category, setCategory] = useState("Documents");
  const [platform, setPlatform] = useState("Confluence Cloud");
  const [environment, setEnvironment] = useState("Production");
  const [businessUnit, setBusinessUnit] = useState("Customer Operations");
  const [region, setRegion] = useState("North America");
  const [residency, setResidency] = useState("United States");
  const [businessOwner, setBusinessOwner] = useState("Customer Support");
  const [technicalOwner, setTechnicalOwner] = useState("Collaboration Platforms");
  const [steward, setSteward] = useState("Dana Whitfield");
  const [securityOwner, setSecurityOwner] = useState("Security Engineering");
  const [complianceOwner, setComplianceOwner] = useState("Enterprise Compliance");
  const [teams, setTeams] = useState("Customer Support, Architecture Office");
  const [domains, setDomains] = useState("Customer Support");
  const [capabilities, setCapabilities] = useState("Customer Care");
  const [journeys, setJourneys] = useState("Issue Report to Resolution");
  const [products, setProducts] = useState("Support Desk");
  const [stakeholders, setStakeholders] = useState("");
  const [purpose, setPurpose] = useState("Capture advisory commitments as decision evidence.");
  const [authority, setAuthority] = useState<AuthorityLevel>("Supporting");
  const [authoritativeFor, setAuthoritativeFor] = useState("Customer commitments");
  const [conflicting, setConflicting] = useState("None identified");
  const [rank, setRank] = useState("2");
  const [classification, setClassification] = useState<AccessClassification>("Internal");
  const [regulatory, setRegulatory] = useState("None");
  const [retention, setRetention] = useState("5 years");
  const [legalHold, setLegalHold] = useState(false);
  const [allowedUse, setAllowedUse] = useState("Condition extraction");
  const [restrictedUse, setRestrictedUse] = useState("External distribution");
  const [connector, setConnector] = useState("Confluence Cloud connector");
  const [authMethod, setAuthMethod] = useState("OAuth 2.0");
  const [scope, setScope] = useState("Space read");
  const [discoveryMode, setDiscoveryMode] = useState("Incremental");
  const [schedule, setSchedule] = useState("Hourly");
  const [includedPaths, setIncludedPaths] = useState("/spaces/advisory");
  const [excludedPaths, setExcludedPaths] = useState("/spaces/advisory/drafts");
  const [artifactTypes, setArtifactTypes] = useState("Pages, Attachments");
  const [historical, setHistorical] = useState(true);
  const [metadataReq, setMetadataReq] = useState("Owner, Title, Last modified");
  const [freshnessThreshold, setFreshnessThreshold] = useState("30 days");
  const [ownershipThreshold, setOwnershipThreshold] = useState("80");
  const [authorityThreshold, setAuthorityThreshold] = useState("75");
  const [cadence, setCadence] = useState("Quarterly");
  const [approvalOwner, setApprovalOwner] = useState("Jane Smith");
  const [progress, setProgress] = useState(-1);

  useEffect(() => { if (!open) { setStep(0); setProgress(-1); } }, [open]);
  useEffect(() => {
    if (progress < 0 || progress >= REGISTER_STEPS.length - 1) return;
    const t = window.setTimeout(() => setProgress((p) => p + 1), 420);
    return () => window.clearTimeout(t);
  }, [progress]);

  const record = useMemo(
    () =>
      makeRegisteredSource({
        sourceName: name, description, category, platform, environment, businessUnit, region,
        dataResidency: residency, businessOwner, technicalOwner, authorityLevel: authority,
        accessClassification: classification, discoveryMode,
        knowledgeDomains: domains.split(",").map((d) => d.trim()).filter(Boolean),
        index: nextIndex,
      }),
    [name, description, category, platform, environment, businessUnit, region, residency, businessOwner, technicalOwner, authority, classification, discoveryMode, domains, nextIndex],
  );

  const titles = [
    "Registration Method", "Source Identity", "Ownership", "Business Context", "Authority",
    "Access and Governance", "Discovery Configuration", "Quality and Review", "Review", "Register",
  ];

  const complete = progress === REGISTER_STEPS.length - 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-[16px]">Register Source — Step {step + 1} of 10: {titles[step]}</DialogTitle>
          <DialogDescription className="text-[12px]">Add a governed knowledge source to the Enterprise Source Registry.</DialogDescription>
        </DialogHeader>
        <Progress value={((step + 1) / 10) * 100} className="h-1.5" />

        <div className="space-y-2.5 py-1">
          {step === 0 && <Choices options={METHODS} value={method} onChange={setMethod} cols={2} label="Registration method" />}

          {step === 1 && (
            <div className="grid gap-2 sm:grid-cols-2">
              <Field id="rs-name" label="Source name" value={name} onChange={setName} />
              <Picker id="rs-cat" label="Category" options={filterOptions.sourceCategory.slice(1)} value={category} onChange={setCategory} />
              <div className="sm:col-span-2 grid gap-1">
                <Label htmlFor="rs-desc" className="text-[11px] text-slate-600">Description</Label>
                <Textarea id="rs-desc" value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[56px] text-[12px]" />
              </div>
              <Picker id="rs-plat" label="Platform" options={filterOptions.platform.slice(1)} value={platform} onChange={setPlatform} />
              <Picker id="rs-env" label="Environment" options={filterOptions.environment.slice(1)} value={environment} onChange={setEnvironment} />
              <Picker id="rs-bu" label="Business unit" options={filterOptions.businessUnit.slice(1)} value={businessUnit} onChange={setBusinessUnit} />
              <Picker id="rs-region" label="Region" options={filterOptions.region.slice(1)} value={region} onChange={setRegion} />
              <Picker id="rs-res" label="Data residency" options={filterOptions.dataResidency.slice(1)} value={residency} onChange={setResidency} />
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-2 sm:grid-cols-2">
              <Field id="rs-bo" label="Business owner" value={businessOwner} onChange={setBusinessOwner} />
              <Field id="rs-to" label="Technical owner" value={technicalOwner} onChange={setTechnicalOwner} />
              <Field id="rs-ds" label="Data steward" value={steward} onChange={setSteward} />
              <Field id="rs-so" label="Security owner" value={securityOwner} onChange={setSecurityOwner} />
              <Field id="rs-co" label="Compliance owner" value={complianceOwner} onChange={setComplianceOwner} />
              <Field id="rs-teams" label="Teams represented" value={teams} onChange={setTeams} />
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-2 sm:grid-cols-2">
              <Field id="rs-dom" label="Knowledge domains" value={domains} onChange={setDomains} />
              <Field id="rs-cap" label="Business capabilities" value={capabilities} onChange={setCapabilities} />
              <Field id="rs-jour" label="Customer journeys" value={journeys} onChange={setJourneys} />
              <Field id="rs-prod" label="Products and services" value={products} onChange={setProducts} />
              <Field id="rs-stake" label="External stakeholders" value={stakeholders} onChange={setStakeholders} placeholder="None" />
              <Field id="rs-purpose" label="Source purpose" value={purpose} onChange={setPurpose} />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-2">
              <Choices options={AUTHORITIES} value={authority} onChange={(v) => setAuthority(v as AuthorityLevel)} label="Authority level" />
              <div className="grid gap-2 sm:grid-cols-2">
                <Field id="rs-af" label="Authoritative for" value={authoritativeFor} onChange={setAuthoritativeFor} />
                <Field id="rs-cs" label="Conflicting sources" value={conflicting} onChange={setConflicting} />
                <Field id="rs-rank" label="Source ranking" value={rank} onChange={setRank} />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-2">
              <Choices options={CLASSIFICATIONS} value={classification} onChange={(v) => setClassification(v as AccessClassification)} label="Access classification" />
              <div className="grid gap-2 sm:grid-cols-2">
                <Field id="rs-reg" label="Regulatory scope" value={regulatory} onChange={setRegulatory} />
                <Field id="rs-ret" label="Retention policy" value={retention} onChange={setRetention} />
                <Field id="rs-au" label="Allowed use" value={allowedUse} onChange={setAllowedUse} />
                <Field id="rs-ru" label="Restricted use" value={restrictedUse} onChange={setRestrictedUse} />
              </div>
              <label className="flex items-center gap-2 text-[12px] text-slate-700">
                <Checkbox checked={legalHold} onCheckedChange={(v) => setLegalHold(Boolean(v))} aria-label="Legal hold" className="h-3.5 w-3.5" />
                Legal hold applies to this source
              </label>
            </div>
          )}

          {step === 6 && (
            <div className="grid gap-2 sm:grid-cols-2">
              <Field id="rs-con" label="Connector" value={connector} onChange={setConnector} />
              <Field id="rs-auth" label="Authentication method" value={authMethod} onChange={setAuthMethod} />
              <Field id="rs-scope" label="Authorization scope" value={scope} onChange={setScope} />
              <Picker id="rs-mode" label="Discovery mode" options={["Incremental", "Scheduled", "Streaming", "Event driven", "Full scan"]} value={discoveryMode} onChange={setDiscoveryMode} />
              <Picker id="rs-sched" label="Schedule" options={["Continuous", "Every 15 minutes", "Hourly", "Every 6 hours", "Daily", "Weekly"]} value={schedule} onChange={setSchedule} />
              <Field id="rs-inc" label="Included paths" value={includedPaths} onChange={setIncludedPaths} />
              <Field id="rs-exc" label="Excluded paths" value={excludedPaths} onChange={setExcludedPaths} />
              <Field id="rs-types" label="Included artifact types" value={artifactTypes} onChange={setArtifactTypes} />
              <label className="flex items-center gap-2 text-[12px] text-slate-700">
                <Checkbox checked={historical} onCheckedChange={(v) => setHistorical(Boolean(v))} aria-label="Include historical content" className="h-3.5 w-3.5" />
                Include historical content
              </label>
            </div>
          )}

          {step === 7 && (
            <div className="grid gap-2 sm:grid-cols-2">
              <Field id="rs-meta" label="Minimum metadata requirements" value={metadataReq} onChange={setMetadataReq} />
              <Field id="rs-fresh" label="Freshness threshold" value={freshnessThreshold} onChange={setFreshnessThreshold} />
              <Field id="rs-ownt" label="Ownership confidence threshold" value={ownershipThreshold} onChange={setOwnershipThreshold} />
              <Field id="rs-autht" label="Authority confidence threshold" value={authorityThreshold} onChange={setAuthorityThreshold} />
              <Picker id="rs-cad" label="Review cadence" options={["Monthly", "Quarterly", "Semi-annual", "Annual"]} value={cadence} onChange={setCadence} />
              <Field id="rs-appr" label="Approval owner" value={approvalOwner} onChange={setApprovalOwner} />
            </div>
          )}

          {step === 8 && (
            <div className="space-y-2">
              <dl className="grid gap-x-6 sm:grid-cols-2">
                {([
                  ["Method", method], ["Source name", name], ["Category", category], ["Platform", platform],
                  ["Environment", environment], ["Business unit", businessUnit], ["Region", region],
                  ["Data residency", residency], ["Business owner", businessOwner], ["Technical owner", technicalOwner],
                  ["Teams", teams], ["Knowledge domains", domains], ["Authority", authority],
                  ["Access classification", classification], ["Retention", retention],
                  ["Discovery mode", discoveryMode], ["Schedule", schedule], ["Review cadence", cadence],
                  ["Approval owner", approvalOwner],
                ] as [string, string][]).map(([k, v]) => <Row key={k} label={k} value={v} />)}
              </dl>
              <ul className="space-y-1 rounded-md border border-amber-200 bg-amber-50 p-2 text-[11.5px] text-amber-800">
                <li>Potential duplicate: 34 percent similarity with Support Knowledge Base.</li>
                <li>Owner missing: no backup business owner assigned.</li>
                <li>Permission conflict: none detected for the requested scope.</li>
                <li>Authority conflict: Supporting authority overlaps one Primary source.</li>
                <li>Low estimated coverage: initial relationship coverage is estimated at 40 percent.</li>
              </ul>
            </div>
          )}

          {step === 9 && (
            <div className="space-y-2">
              <Progress value={((progress + 1) / REGISTER_STEPS.length) * 100} className="h-1.5" />
              <ul aria-live="polite" className="space-y-1">
                {REGISTER_STEPS.map((s, i) => (
                  <li key={s} className={cn("text-[12px]", i <= progress ? "text-slate-800" : "text-slate-400")}>
                    {i < progress ? "✓ " : i === progress ? "• " : "  "}{s}
                  </li>
                ))}
              </ul>
              {complete && (
                <div className="flex flex-wrap gap-1.5">
                  {["View Source Record", "Run Initial Discovery", "Submit for Approval", "Register Another Source", "Close"].map((a) => (
                    <Button
                      key={a} size="sm" variant={a === "View Source Record" ? "default" : "outline"} className="h-7 text-[11px]"
                      onClick={() => {
                        onRegistered(record, a);
                        if (a === "Register Another Source") { setStep(0); setProgress(-1); return; }
                        onOpenChange(false);
                      }}
                    >
                      {a}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {step < 9 && (
          <DialogFooter className="gap-1.5">
            <Button variant="outline" size="sm" className="h-8 text-[12px]" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Back</Button>
            {step < 8 ? (
              <Button size="sm" className="h-8 text-[12px]" disabled={step === 1 && !name.trim()} onClick={() => setStep((s) => s + 1)}>Next</Button>
            ) : (
              <Button size="sm" className="h-8 text-[12px]" onClick={() => { setStep(9); setProgress(0); }}>Register Source</Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------- duplicate comparison --------------------------- */

const DUPLICATE_ACTIONS = ["Keep Both", "Mark as Related", "Mark Duplicate", "Merge Registry Records", "Deprecate One Source", "Request Human Review"];

export function DuplicateComparisonDialog({ open, onOpenChange, onResolve, onMerge }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  onResolve: (action: string) => void; onMerge: () => void;
}) {
  const { left, right } = duplicateComparison;
  const rows: [string, string, string][] = [
    ["Source ID", left.id, right.id],
    ["Source name", left.sourceName, right.sourceName],
    ["Platform", left.platform, right.platform],
    ["Owner", left.owner, right.owner],
    ["Teams", String(left.teams), String(right.teams)],
    ["Domains", left.domains, right.domains],
    ["Artifacts", nf(left.artifacts), nf(right.artifacts)],
    ["Authority", left.authority, right.authority],
    ["Approval state", left.approvalState, right.approvalState],
    ["Freshness", left.freshness, right.freshness],
    ["Quality", String(left.quality), String(right.quality)],
    ["Conditions extracted", nf(left.conditions), nf(right.conditions)],
    ["Personas dependent", String(left.personas), String(right.personas)],
    ["Decision references", String(left.decisions), String(right.decisions)],
  ];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-[16px]">Duplicate Comparison</DialogTitle>
          <DialogDescription className="text-[12px]">
            Semantic similarity 86 percent · Artifact overlap 71 percent · Condition overlap 82 percent · Ownership conflict Yes · Authority conflict Yes
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11.5px]">
            <caption className="sr-only">Side by side duplicate source comparison</caption>
            <thead>
              <tr className="border-b border-slate-200 text-[10.5px] uppercase text-slate-500">
                <th scope="col" className="py-1 pr-3">Attribute</th>
                <th scope="col" className="py-1 pr-3">{left.sourceName}</th>
                <th scope="col" className="py-1">{right.sourceName}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([k, a, b]) => (
                <tr key={k} className="border-b border-slate-100">
                  <th scope="row" className="py-1 pr-3 text-left font-normal text-slate-500">{k}</th>
                  <td className="py-1 pr-3 font-medium text-slate-800">{a}</td>
                  <td className={cn("py-1 font-medium", a === b ? "text-slate-800" : "text-amber-700")}>{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <DialogFooter className="flex-wrap gap-1.5">
          {DUPLICATE_ACTIONS.map((a) => (
            <Button
              key={a} size="sm" variant={a === "Merge Registry Records" ? "default" : "outline"} className="h-8 text-[11.5px]"
              onClick={() => {
                if (a === "Merge Registry Records") { onOpenChange(false); onMerge(); return; }
                onResolve(a);
                onOpenChange(false);
              }}
            >
              {a}
            </Button>
          ))}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------- merge ------------------------------------ */

export function MergeSourcesDialog({ open, onOpenChange, onComplete }: {
  open: boolean; onOpenChange: (v: boolean) => void; onComplete: (surviving: string, reason: string) => void;
}) {
  const { left, right } = duplicateComparison;
  const [surviving, setSurviving] = useState(left.id);
  const [ownership, setOwnership] = useState(left.owner);
  const [authority, setAuthority] = useState(left.authority);
  const [classification, setClassification] = useState("Internal");
  const [keep, setKeep] = useState<string[]>(["Artifact lineage", "Conditions", "Relationships", "Historical references", "Aliases"]);
  const [redirect, setRedirect] = useState("Redirect queries to surviving source");
  const [reason, setReason] = useState("");
  const [confirm, setConfirm] = useState(false);

  useEffect(() => { if (!open) { setReason(""); setConfirm(false); } }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-[16px]">Merge Registry Records</DialogTitle>
          <DialogDescription className="text-[12px]">Merging is audited and updates downstream lineage, conditions, and persona references.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2.5">
          <div><div className="mb-1 text-[11px] font-medium text-slate-600">Surviving source</div>
            <Choices options={[left.id, right.id]} value={surviving} onChange={setSurviving} cols={2} label="Surviving source" /></div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Picker id="mg-own" label="Ownership" options={[left.owner, right.owner]} value={ownership} onChange={setOwnership} />
            <Picker id="mg-auth" label="Authority" options={["Primary", "Supporting", "Reference", "Unconfirmed"]} value={authority} onChange={setAuthority} />
            <Picker id="mg-class" label="Classification" options={["Internal", "Confidential", "Restricted"]} value={classification} onChange={setClassification} />
            <Picker id="mg-redirect" label="Redirect behavior" options={["Redirect queries to surviving source", "Return both with precedence", "No redirect"]} value={redirect} onChange={setRedirect} />
          </div>
          <div className="grid gap-1 sm:grid-cols-2">
            {["Artifact lineage", "Conditions", "Relationships", "Historical references", "Aliases"].map((k) => (
              <label key={k} className="flex items-center gap-2 text-[12px] text-slate-700">
                <Checkbox
                  checked={keep.includes(k)} aria-label={`Retain ${k}`}
                  onCheckedChange={(v) => setKeep((cur) => (v ? [...cur, k] : cur.filter((x) => x !== k)))}
                  className="h-3.5 w-3.5"
                />
                Retain {k.toLowerCase()}
              </label>
            ))}
          </div>
          <div className="grid gap-1">
            <Label htmlFor="mg-reason" className="text-[11px] text-slate-600">Change reason (required)</Label>
            <Textarea id="mg-reason" value={reason} onChange={(e) => setReason(e.target.value)} className="min-h-[52px] text-[12px]" />
          </div>
          <label className="flex items-center gap-2 text-[12px] text-slate-700">
            <Checkbox checked={confirm} onCheckedChange={(v) => setConfirm(Boolean(v))} aria-label="Confirm merge" className="h-3.5 w-3.5" />
            I understand this merge affects 1 persona and 12 decision references.
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            size="sm" className="h-8 text-[12px]" disabled={!reason.trim() || !confirm}
            onClick={() => { onComplete(surviving, reason); onOpenChange(false); }}
          >
            Merge Records
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ----------------------------- reconciliation ------------------------------ */

const RECON_SCOPES = ["Full Registry", "Selected Sources", "Business Unit", "Team", "Knowledge Domain", "Source Category"];
const RECON_CHECKS = [
  "Duplicate sources", "Ownership conflicts", "Authority conflicts", "Permission drift", "Classification drift",
  "Connector configuration drift", "Missing team mappings", "Missing domain mappings", "Stale sources",
  "Inactive sources", "Orphaned registry records", "Broken lineage", "Quality threshold violations",
];
const RECON_STEPS = [
  "Loading registry", "Comparing sources", "Resolving identities", "Checking ownership", "Checking authority",
  "Checking access", "Validating relationships", "Calculating quality", "Generating exceptions", "Completed",
];

export interface ReconciliationResult {
  sourcesEvaluated: number; relationshipsEvaluated: number; duplicatesIdentified: number;
  ownershipConflicts: number; authorityConflicts: number; permissionIssues: number;
  staleSources: number; relationshipsRepaired: number; reviewTasksCreated: number;
}

export function ReconcileRegistryDialog({ open, onOpenChange, selectedCount, onProgress, onComplete, onOpenExceptions }: {
  open: boolean; onOpenChange: (v: boolean) => void; selectedCount: number;
  onProgress: (label: string) => void;
  onComplete: (r: ReconciliationResult) => void;
  onOpenExceptions: () => void;
}) {
  const [scope, setScope] = useState(RECON_SCOPES[0]);
  const [checks, setChecks] = useState<string[]>(RECON_CHECKS);
  const [step, setStep] = useState(-1);

  useEffect(() => { if (!open) setStep(-1); }, [open]);
  useEffect(() => {
    if (step < 0 || step >= RECON_STEPS.length - 1) return;
    const t = window.setTimeout(() => {
      setStep((s) => {
        const next = s + 1;
        onProgress(RECON_STEPS[next]);
        return next;
      });
    }, 480);
    return () => window.clearTimeout(t);
  }, [step, onProgress]);

  const sourcesEvaluated = scope === "Selected Sources" ? Math.max(selectedCount, 1) : 147;
  const result: ReconciliationResult = {
    sourcesEvaluated,
    relationshipsEvaluated: sourcesEvaluated * 358,
    duplicatesIdentified: 2, ownershipConflicts: 3, authorityConflicts: 2, permissionIssues: 1,
    staleSources: 3, relationshipsRepaired: 214, reviewTasksCreated: 5,
  };
  const done = step === RECON_STEPS.length - 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-[16px]">Reconcile Registry</DialogTitle>
          <DialogDescription className="text-[12px]">Compare registered sources against the current enterprise state.</DialogDescription>
        </DialogHeader>

        {step < 0 ? (
          <div className="space-y-2.5">
            <Choices options={RECON_SCOPES} value={scope} onChange={setScope} cols={2} label="Reconciliation scope" />
            <div className="grid gap-1 sm:grid-cols-2">
              {RECON_CHECKS.map((c) => (
                <label key={c} className="flex items-center gap-2 text-[11.5px] text-slate-700">
                  <Checkbox
                    checked={checks.includes(c)} aria-label={c}
                    onCheckedChange={(v) => setChecks((cur) => (v ? [...cur, c] : cur.filter((x) => x !== c)))}
                    className="h-3.5 w-3.5"
                  />
                  {c}
                </label>
              ))}
            </div>
            <dl className="grid gap-x-6 sm:grid-cols-2">
              <Row label="Sources evaluated" value={nf(sourcesEvaluated)} />
              <Row label="Relationships evaluated" value={nf(sourcesEvaluated * 358)} />
              <Row label="Expected duration" value="about 3 minutes" />
              <Row label="Potential review tasks" value="5" />
            </dl>
          </div>
        ) : (
          <div className="space-y-2">
            <Progress value={((step + 1) / RECON_STEPS.length) * 100} className="h-1.5" />
            <ul aria-live="polite" className="space-y-1">
              {RECON_STEPS.map((s, i) => (
                <li key={s} className={cn("text-[12px]", i <= step ? "text-slate-800" : "text-slate-400")}>
                  {i < step ? "✓ " : i === step ? "• " : "  "}{s}
                </li>
              ))}
            </ul>
            {done && (
              <>
                <dl className="grid gap-x-6 sm:grid-cols-2">
                  <Row label="Sources evaluated" value={nf(result.sourcesEvaluated)} />
                  <Row label="Duplicates identified" value={String(result.duplicatesIdentified)} />
                  <Row label="Ownership conflicts" value={String(result.ownershipConflicts)} />
                  <Row label="Authority conflicts" value={String(result.authorityConflicts)} />
                  <Row label="Permission issues" value={String(result.permissionIssues)} />
                  <Row label="Stale sources" value={String(result.staleSources)} />
                  <Row label="Relationships repaired" value={String(result.relationshipsRepaired)} />
                  <Row label="Review tasks created" value={String(result.reviewTasksCreated)} />
                </dl>
                <div className="flex flex-wrap gap-1.5">
                  <Button size="sm" className="h-7 text-[11px]" onClick={() => { onComplete(result); onOpenChange(false); }}>View Results</Button>
                  <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => { onComplete(result); toast.success("Automatic corrections applied to 214 relationships"); onOpenChange(false); }}>Apply Automatic Corrections</Button>
                  <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => { onComplete(result); onOpenChange(false); onOpenExceptions(); }}>Review Exceptions</Button>
                  <Button
                    size="sm" variant="outline" className="h-7 text-[11px]"
                    onClick={() => download("registry-reconciliation-report.json", JSON.stringify({ scope, checks, ...result }, null, 2), "application/json")}
                  >
                    Export Reconciliation Report
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => { onComplete(result); onOpenChange(false); }}>Close</Button>
                </div>
              </>
            )}
          </div>
        )}

        {step < 0 && (
          <DialogFooter>
            <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button size="sm" className="h-8 text-[12px]" onClick={() => { setStep(0); onProgress(RECON_STEPS[0]); }}>Start Reconciliation</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------------- export ---------------------------------- */

const FORMATS = ["CSV", "JSON", "YAML", "PDF Summary", "Presentation Snapshot"];
const SCOPES = ["Current Filtered View", "Selected Sources", "Approved Sources", "Pending Review", "Restricted Sources", "Full Registry"];
const INCLUDES = ["Ownership", "Governance", "Connector Status", "Artifact Counts", "Relationships", "Quality Metrics", "Exceptions", "Audit History", "Lineage"];

export function ExportRegistryDialog({ open, onOpenChange, rows, selectedIds, payload }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  rows: SourceRegistryRecord[]; selectedIds: string[]; payload: Record<string, unknown>;
}) {
  const [format, setFormat] = useState("CSV");
  const [scope, setScope] = useState(SCOPES[0]);
  const [includes, setIncludes] = useState<string[]>(["Ownership", "Governance", "Quality Metrics"]);
  const [progress, setProgress] = useState(-1);

  useEffect(() => { if (!open) setProgress(-1); }, [open]);
  useEffect(() => {
    if (progress < 0 || progress >= 100) return;
    const t = window.setTimeout(() => setProgress((p) => Math.min(100, p + 25)), 180);
    return () => window.clearTimeout(t);
  }, [progress]);

  const scoped = useMemo(() => {
    if (scope === "Selected Sources") return rows.filter((r) => selectedIds.includes(r.id));
    if (scope === "Approved Sources") return rows.filter((r) => r.approvalState === "Approved");
    if (scope === "Pending Review") return rows.filter((r) => r.approvalState === "Pending Review" || r.approvalState === "Review Required");
    if (scope === "Restricted Sources") return rows.filter((r) => r.accessClassification === "Restricted" || r.accessClassification === "Highly Restricted");
    return rows;
  }, [scope, rows, selectedIds]);

  const run = () => {
    setProgress(0);
    if (format === "CSV") download("source-registry.csv", sourcesToCsv(scoped), "text/csv");
    else if (format === "JSON") download("source-registry.json", JSON.stringify({ scope, includes, sources: scoped, ...payload }, null, 2), "application/json");
    else if (format === "YAML") download("source-registry.yaml", sourcesToYaml(scoped), "text/yaml");
    toast.success(`${format} export generated for ${scoped.length} sources`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[16px]">Export Registry</DialogTitle>
          <DialogDescription className="text-[12px]">Generate a governed export of the source registry.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2.5">
          <div><div className="mb-1 text-[11px] font-medium text-slate-600">Format</div><Choices options={FORMATS} value={format} onChange={setFormat} cols={2} label="Export format" /></div>
          <div><div className="mb-1 text-[11px] font-medium text-slate-600">Scope</div><Choices options={SCOPES} value={scope} onChange={setScope} cols={2} label="Export scope" /></div>
          <div className="grid gap-1 sm:grid-cols-2">
            {INCLUDES.map((i) => (
              <label key={i} className="flex items-center gap-2 text-[11.5px] text-slate-700">
                <Checkbox
                  checked={includes.includes(i)} aria-label={`Include ${i}`}
                  onCheckedChange={(v) => setIncludes((cur) => (v ? [...cur, i] : cur.filter((x) => x !== i)))}
                  className="h-3.5 w-3.5"
                />
                Include {i.toLowerCase()}
              </label>
            ))}
          </div>
          <p className="text-[11px] text-slate-500">{scoped.length} sources will be exported.</p>
          {progress >= 0 && (
            <div aria-live="polite">
              <Progress value={progress} className="h-1.5" />
              <p className="mt-1 text-[11px] text-slate-500">{progress >= 100 ? "Export complete." : "Generating export…"}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => onOpenChange(false)}>Close</Button>
          <Button size="sm" className="h-8 text-[12px]" onClick={run}>Generate Export</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------------- import ---------------------------------- */

const IMPORT_STEPS = ["Upload file", "Map columns", "Validate records", "Preview changes"];

export function ImportRegistryDialog({ open, onOpenChange, onImport }: {
  open: boolean; onOpenChange: (v: boolean) => void; onImport: (mode: string, count: number) => void;
}) {
  const [step, setStep] = useState(0);
  const [format, setFormat] = useState("CSV");
  const [fileName, setFileName] = useState("");
  const [mapping, setMapping] = useState<Record<string, string>>({
    "Source Name": "sourceName", Platform: "platform", Owner: "businessOwner", Classification: "accessClassification",
  });

  useEffect(() => { if (!open) { setStep(0); setFileName(""); } }, [open]);

  const records = 24;
  const issues = [
    { type: "Duplicate detected", count: 2, detail: "Match existing registry records by name and platform" },
    { type: "Missing owner", count: 3, detail: "Business owner column is empty" },
    { type: "Invalid classification", count: 1, detail: "Value 'Secret' is not an approved classification" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-[16px]">Import Registry — {IMPORT_STEPS[step]}</DialogTitle>
          <DialogDescription className="text-[12px]">Bulk load registry records from CSV, JSON, or YAML.</DialogDescription>
        </DialogHeader>
        <Progress value={((step + 1) / IMPORT_STEPS.length) * 100} className="h-1.5" />

        <div className="space-y-2.5">
          {step === 0 && (
            <>
              <Choices options={["CSV", "JSON", "YAML"]} value={format} onChange={setFormat} label="Import format" />
              <div className="grid gap-1">
                <Label htmlFor="imp-file" className="text-[11px] text-slate-600">File</Label>
                <Input
                  id="imp-file" type="file" className="h-8 text-[12px]"
                  onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
                />
                <p className="text-[11px] text-slate-500">{fileName || "No file selected. A simulated file will be used for the demonstration."}</p>
              </div>
            </>
          )}
          {step === 1 && (
            <div className="space-y-1.5">
              {Object.entries(mapping).map(([col, field]) => (
                <div key={col} className="grid grid-cols-2 items-center gap-2">
                  <span className="text-[12px] text-slate-700">{col}</span>
                  <Picker
                    id={`map-${col}`} label="" value={field}
                    options={["sourceName", "platform", "businessOwner", "technicalOwner", "accessClassification", "category", "ignore"]}
                    onChange={(v) => setMapping((m) => ({ ...m, [col]: v }))}
                  />
                </div>
              ))}
            </div>
          )}
          {step === 2 && (
            <ul className="space-y-1">
              {issues.map((i) => (
                <li key={i.type} className="rounded-md border border-amber-200 bg-amber-50 p-2 text-[11.5px] text-amber-800">
                  {i.type} — {i.count} records. {i.detail}
                </li>
              ))}
              <li className="rounded-md border border-emerald-200 bg-emerald-50 p-2 text-[11.5px] text-emerald-800">
                {records - issues.reduce((a, b) => a + b.count, 0)} records validated with no issues.
              </li>
            </ul>
          )}
          {step === 3 && (
            <dl>
              <Row label="Records in file" value={String(records)} />
              <Row label="New sources" value="18" />
              <Row label="Updates to existing sources" value="4" />
              <Row label="Records blocked by validation" value="2" />
              <Row label="Review tasks that will be created" value="6" />
            </dl>
          )}
        </div>

        <DialogFooter className="gap-1.5">
          <Button variant="outline" size="sm" className="h-8 text-[12px]" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Back</Button>
          {step < 3 ? (
            <Button size="sm" className="h-8 text-[12px]" onClick={() => setStep((s) => s + 1)}>Next</Button>
          ) : (
            <>
              <Button size="sm" variant="outline" className="h-8 text-[12px]" onClick={() => { onImport("Draft", 18); onOpenChange(false); }}>Import as Draft</Button>
              <Button size="sm" className="h-8 text-[12px]" onClick={() => { onImport("Submitted for Review", 18); onOpenChange(false); }}>Import and Submit for Review</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------ bulk confirm ------------------------------- */

export function BulkActionDialog({ action, count, personaImpact, onOpenChange, onConfirm }: {
  action: string | null; count: number; personaImpact: number;
  onOpenChange: (v: boolean) => void; onConfirm: (action: string, value: string) => void;
}) {
  const [value, setValue] = useState("");
  useEffect(() => { setValue(""); }, [action]);
  if (!action) return null;

  const needsValue = ["Assign Owner", "Assign Technical Owner", "Apply Classification", "Apply Retention Policy", "Change Review Date"].includes(action);

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[16px]">{action}</DialogTitle>
          <DialogDescription className="text-[12px]">
            This action affects {count} source{count === 1 ? "" : "s"} and {personaImpact} downstream persona{personaImpact === 1 ? "" : "s"}.
          </DialogDescription>
        </DialogHeader>
        {needsValue && (
          <Field id="bulk-value" label={action === "Apply Classification" ? "Classification" : action === "Change Review Date" ? "Review date" : action === "Apply Retention Policy" ? "Retention policy" : "Owner"} value={value} onChange={setValue} />
        )}
        <DialogFooter>
          <Button variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" className="h-8 text-[12px]" disabled={needsValue && !value.trim()} onClick={() => { onConfirm(action, value); onOpenChange(false); }}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
