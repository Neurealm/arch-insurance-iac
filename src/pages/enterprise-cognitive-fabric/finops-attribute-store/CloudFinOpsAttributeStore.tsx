/**
 * Cloud FinOps Persona Attribute Store
 * Route: /enterprise-cognitive-fabric/modeling-memory/cloud-finops-attribute-store
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Drawer, Pill } from "../persona-studio/primitives";
import {
  ActivityPanel, ApplicabilityIndexPanel, AttributeDetail, AttributeRegistryPanel,
  DecompositionPanel, EvaluationContractPanel, KpiRow, PolicyRegistryPanel,
  PublicationPanel, RelationshipGraphPanel, RetrievalSimulatorPanel, SourceDocumentPanel,
  StorageSchemaPanel, StoreArchitecturePanel, ValidationPanel, WorkTypeMatrixPanel, emptyFilters, toneForState,
  type RegistryFilters,
} from "./panels";
import {
  attributes as seedAttributes, attributeById, decompositionStages, demoScenarios, kpis as seedKpis,
  personaIdentity, policyBindings as seedPolicy, runCandidateRetrieval, seedActivity, storySteps,
  validationIssues as seedIssues, workTypeMappings,
  type ActivityEntry, type PersonaAttribute, type RetrievalCandidate, type StoreStatus, type ValidationIssue,
} from "./data";

const STAGES = [
  { id: "source", label: "Source Document" },
  { id: "decomposition", label: "Attribute Decomposition" },
  { id: "registry", label: "Structured Attribute Registry" },
  { id: "relationships", label: "Relationships & Applicability" },
  { id: "publication", label: "Publication Preview" },
] as const;
type StageId = typeof STAGES[number]["id"];

const now = () =>
  new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export default function CloudFinOpsAttributeStore() {
  const [stage, setStage] = useState<StageId>("registry");
  const [status, setStatus] = useState<StoreStatus>("Ready to Publish");
  const [filters, setFilters] = useState<RegistryFilters>(emptyFilters);
  const [density, setDensity] = useState<"compact" | "standard">("compact");
  const [hiddenColumns, setHidden] = useState<Set<string>>(new Set(["subject", "condition", "base", "target", "operator"]));
  const [selected, setSelected] = useState<PersonaAttribute | null>(null);
  const [policy, setPolicy] = useState(seedPolicy);
  const [issues, setIssues] = useState<ValidationIssue[]>(seedIssues);
  const [activity, setActivity] = useState<ActivityEntry[]>(seedActivity);
  const [candidates, setCandidates] = useState<RetrievalCandidate[] | null>(null);
  const [kpiFocus, setKpiFocus] = useState<string | null>(null);
  const [publishStep, setPublishStep] = useState<number | null>(null);
  const [publishedAt, setPublishedAt] = useState<string | undefined>();
  const [storyStep, setStoryStep] = useState<number | null>(null);
  const [scenario, setScenario] = useState("healthy");
  const [banner, setBanner] = useState<string | null>(null);
  const [announce, setAnnounce] = useState("");
  const [decomposing, setDecomposing] = useState(false);
  const [structureOpen, setStructureOpen] = useState(false);
  const [stageDetail, setStageDetail] = useState<string | null>(null);
  const [idFilter, setIdFilter] = useState<string[] | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => () => { timers.current.forEach((t) => window.clearTimeout(t)); }, []);

  const log = useCallback((text: string) => {
    setActivity((a) => [{ time: now(), text }, ...a].slice(0, 40));
  }, []);

  const scenarioDef = demoScenarios.find((s) => s.id === scenario);

  const kpis = useMemo(() => seedKpis.map((k) => {
    const override = scenarioDef?.kpiOverrides[k.id];
    return override ? { ...k, value: override } : k;
  }), [scenarioDef]);

  const unresolvedPolicy = policy.filter((p) => p.status === "Unresolved").length;
  const criticalErrors = issues.filter((i) => i.severity === "Critical" && i.status !== "Resolved").length;

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return seedAttributes.filter((a) => {
      if (idFilter && !idFilter.includes(a.id)) return false;
      if (q && ![a.id, a.name, a.statement, a.category, a.primaryType, a.policyVariable ?? "", a.applicability.workTypes.join(" ")]
        .join(" ").toLowerCase().includes(q)) return false;
      if (filters.category !== "All" && a.category !== filters.category) return false;
      if (filters.type !== "All" && a.primaryType !== filters.type) return false;
      if (filters.severity !== "All" && a.severity !== filters.severity) return false;
      if (filters.response !== "All" && a.defaultResponse !== filters.response) return false;
      if (filters.evidence === "Has required evidence" && !a.evidence.some((e) => e.required)) return false;
      if (filters.evidence === "No required evidence" && a.evidence.some((e) => e.required)) return false;
      if (filters.policy === "Bound" && !a.policyVariable) return false;
      if (filters.policy === "Unbound" && a.policyVariable) return false;
      if (filters.policy === "Unresolved") {
        const b = policy.find((p) => p.variable === a.policyVariable);
        if (!b || b.status !== "Unresolved") return false;
      }
      if (filters.applicability !== "All" && !a.applicability.workTypes.includes(filters.applicability)) return false;
      if (filters.confidence === "≥ 0.95" && a.confidence < 0.95) return false;
      if (filters.confidence === "0.90 – 0.95" && (a.confidence < 0.9 || a.confidence >= 0.95)) return false;
      if (filters.confidence === "< 0.90" && a.confidence >= 0.9) return false;
      if (filters.validation !== "All" && a.validationState !== filters.validation) return false;
      if (filters.version !== "All" && a.version !== filters.version) return false;
      return true;
    });
  }, [filters, policy, idFilter]);

  const openAttribute = useCallback((idOrAttr: string | PersonaAttribute) => {
    const a = typeof idOrAttr === "string" ? attributeById(idOrAttr) : idOrAttr;
    if (!a) return;
    setSelected(a);
    setAnnounce(`Attribute ${a.id} ${a.name} opened`);
  }, []);

  const handleKpi = (id: string) => {
    setKpiFocus(id === kpiFocus ? null : id);
    setIdFilter(null);
    if (id === "hard") setFilters({ ...emptyFilters, severity: "Critical" });
    else if (id === "policy") setFilters({ ...emptyFilters, policy: "Unresolved" });
    else if (id === "evidence") setFilters({ ...emptyFilters, evidence: "Has required evidence" });
    else setFilters(emptyFilters);
    setStage("registry");
  };

  const runDecomposition = () => {
    setDecomposing(true);
    setStatus("Decomposing");
    log("Decomposition run started");
    setAnnounce("Decomposition started");
    const t = window.setTimeout(() => {
      setDecomposing(false);
      setStatus("Ready to Publish");
      log("Decomposition complete — 82 atomic attributes produced");
      setAnnounce("Decomposition complete");
    }, 1600);
    timers.current.push(t);
  };

  const bindPolicy = (variable: string, next: string) => {
    setPolicy((ps) => ps.map((p) => p.variable === variable
      ? { ...p, status: next === "Bound" ? "Bound" : "Unresolved", currentValue: next === "Bound" ? p.currentValue === "Unresolved" ? "Policy bound (demo)" : p.currentValue : "Unresolved", demoValue: next === "Bound" }
      : p));
    log(`${variable} ${next === "Bound" ? "bound" : "unbound"}`);
    setAnnounce(`${variable} ${next === "Bound" ? "bound" : "unbound"}`);
  };

  const resolveIssue = (id: string, s: ValidationIssue["status"]) => {
    setIssues((xs) => xs.map((i) => (i.id === id ? { ...i, status: s } : i)));
    log(`Validation issue ${id} marked ${s}`);
    setAnnounce(`Validation issue ${id} ${s}`);
  };

  const publish = () => {
    if (criticalErrors > 0) return;
    setPublishStep(0);
    setAnnounce("Publication started");
    for (let i = 1; i <= 13; i += 1) {
      const t = window.setTimeout(() => {
        setPublishStep(i === 13 ? null : i);
        if (i === 13) {
          setStatus("Published");
          const stamp = now();
          setPublishedAt(stamp);
          log("Attribute store version 1.0 published to governed consumers");
          setAnnounce("Attribute store published");
        }
      }, i * 220);
      timers.current.push(t);
    }
  };

  const applyScenario = (id: string) => {
    const s = demoScenarios.find((x) => x.id === id);
    if (!s) return;
    setScenario(id);
    setStatus(s.storeStatus);
    setBanner(s.banner);
    setPolicy(seedPolicy);
    setIssues(id === "reset" ? seedIssues : seedIssues.slice(0, Math.max(1, seedIssues.length + (s.validationDelta ?? 0))));
    setPublishedAt(id === "published" ? now() : undefined);
    log(s.activity);
    setAnnounce(`${s.name} scenario applied`);
  };

  const exportJson = (name: string, payload: unknown) => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
    log(`Governed export created: ${name}`);
  };

  const story = storyStep !== null ? storySteps[storyStep] : null;
  useEffect(() => {
    if (!story) return;
    const el = document.getElementById(story.target);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    setAnnounce(`Demo story step ${(storyStep ?? 0) + 1}: ${story.caption}`);
  }, [story, storyStep]);

  const spotlight = (id: string) => story?.target === id;

  const kubernetesMapping = workTypeMappings.find((w) => w.workType === "Kubernetes Change");

  return (
    <div className="space-y-3 p-3 lg:p-4">
      <p aria-live="polite" className="sr-only">{announce}</p>

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-[11px] text-slate-500">
        <ol className="flex flex-wrap items-center gap-1">
          <li><Link className="hover:text-blue-700" to="/">Home</Link></li>
          <li aria-hidden>/</li>
          <li><Link className="hover:text-blue-700" to="/enterprise-cognitive-fabric">Enterprise Cognitive Fabric</Link></li>
          <li aria-hidden>/</li>
          <li>Modeling &amp; Memory</li>
          <li aria-hidden>/</li>
          <li><Link className="hover:text-blue-700" to="/enterprise-cognitive-fabric/persona-studio/team-persona-library">Team Persona Library</Link></li>
          <li aria-hidden>/</li>
          <li>Cloud FinOps Persona</li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="font-medium text-slate-700">Persona Attribute Store</li>
        </ol>
      </nav>

      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-600">Modeling &amp; Memory</p>
          <h1 className="text-[18px] font-semibold text-slate-900">Cloud FinOps Persona Attribute Store</h1>
          <p className="text-[12px] text-slate-600">
            Convert the Cloud FinOps Stakeholder Attribute Sheet into structured, addressable enterprise decision context
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <Pill label={`Status: ${status}`} tone={toneForState(status)} />
            <Pill label={`Persona Version ${personaIdentity.personaId === "FINOPS CLOUD 001" ? "1.0" : "1.0"}`} tone="slate" />
            <Pill label="Attribute Store Version 1.0 Draft" tone="slate" />
            <Pill label={`${unresolvedPolicy} unresolved policy bindings`} tone={unresolvedPolicy ? "amber" : "green"} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Button size="sm" variant="outline" className="h-8 text-[11.5px]" onClick={() => setStructureOpen(true)}>Source Document</Button>
          <Button size="sm" variant="outline" className="h-8 text-[11.5px]" onClick={runDecomposition}>Run Decomposition</Button>
          <Button size="sm" variant="outline" className="h-8 text-[11.5px]" onClick={() => { setStage("publication"); log("Attribute validation run"); setAnnounce("Validation complete"); }}>Validate Attributes</Button>
          <Button size="sm" className="h-8 bg-amber-400 text-[11.5px] text-slate-900 hover:bg-amber-300" onClick={publish} disabled={criticalErrors > 0}>Publish Attribute Store</Button>
          <Button size="sm" variant="outline" className="h-8 text-[11.5px]" onClick={() => exportJson("cloud-finops-attribute-store.json", { persona: personaIdentity, attributes: seedAttributes })}>Export JSON</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="h-8 text-[11.5px]">More</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-[420px] overflow-auto">
              <DropdownMenuLabel className="text-[11px]">Demo Story</DropdownMenuLabel>
              <DropdownMenuItem className="text-[11.5px]" onSelect={() => setStoryStep(0)}>Start Demo Story</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-[11px]">Demo Scenarios</DropdownMenuLabel>
              {demoScenarios.map((s) => (
                <DropdownMenuItem key={s.id} className="text-[11.5px]" onSelect={() => applyScenario(s.id)}>{s.name}</DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-[11.5px]" onSelect={() => exportJson("finops-policy-bindings.json", policy)}>Governed Export — Policy Bindings</DropdownMenuItem>
              <DropdownMenuItem className="text-[11.5px]" onSelect={() => exportJson("finops-validation.json", issues)}>Governed Export — Validation</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {banner && (
        <div role="status" className="flex items-start justify-between gap-2 rounded-lg border border-blue-200 bg-blue-50 p-2 text-[11.5px] text-blue-800">
          <span>{banner}</span>
          <button type="button" className="text-[11px] underline" onClick={() => setBanner(null)}>Dismiss</button>
        </div>
      )}

      <KpiRow kpis={kpis} active={kpiFocus} onSelect={(k) => handleKpi(k.id)} />

      <Tabs value={stage} onValueChange={(v) => setStage(v as StageId)}>
        <TabsList className="flex h-auto flex-wrap justify-start gap-1 bg-slate-100">
          {STAGES.map((s, i) => (
            <TabsTrigger key={s.id} value={s.id} className="text-[11.5px]">Stage {i + 1} · {s.label}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {idFilter && (
        <div className="flex items-center gap-2 text-[11px] text-slate-600">
          <Pill label={`Filtered to ${idFilter.length} candidate attributes`} tone="blue" />
          <button type="button" className="underline" onClick={() => setIdFilter(null)}>Clear candidate filter</button>
        </div>
      )}

      {stage === "source" && (
        <SourceDocumentPanel spotlight={spotlight("panel-source")} onRunDecomposition={runDecomposition} onOpenStructure={() => setStructureOpen(true)} />
      )}

      {stage === "decomposition" && (
        <DecompositionPanel spotlight={spotlight("panel-decomposition")} running={decomposing} onInspect={(id) => setStageDetail(id)} />
      )}

      {stage === "registry" && (
        <AttributeRegistryPanel
          attributes={filtered} filters={filters} onFilters={setFilters} onOpen={openAttribute}
          density={density} onDensity={setDensity} spotlight={spotlight("panel-registry")}
          hidden={hiddenColumns}
          onToggleColumn={(k) => setHidden((h) => { const n = new Set(h); n.has(k) ? n.delete(k) : n.add(k); return n; })}
          onExport={() => exportJson("finops-attribute-view.json", filtered)}
        />
      )}

      {stage === "relationships" && (
        <div className="space-y-3">
          <WorkTypePanelWrapper onSelect={(ids, workType) => { setIdFilter(ids); setStage("registry"); log(`Work type ${workType} candidate set applied`); }} spotlight={spotlight("panel-worktype")} />
          <ApplicabilityIndexPanel spotlight={spotlight("panel-applicability")} onSelect={(ids) => { setIdFilter(ids); setStage("registry"); }} />
          <RelationshipGraphPanel spotlight={spotlight("panel-graph")} onSelectAttribute={openAttribute} />
        </div>
      )}

      {stage === "publication" && (
        <div className="space-y-3">
          <ValidationPanel issues={issues} onResolve={resolveIssue} onOpenAttribute={openAttribute} spotlight={spotlight("panel-validation")} />
          <PublicationPanel
            status={status} unresolved={unresolvedPolicy} criticalErrors={criticalErrors}
            onPublish={publish} publishStep={publishStep} spotlight={spotlight("panel-publication")} publishedAt={publishedAt}
          />
        </div>
      )}

      {/* Always-available lower workbench */}
      <PolicyRegistryPanel bindings={policy} onBind={bindPolicy} spotlight={spotlight("panel-policy")} />
      <RetrievalSimulatorPanel
        spotlight={spotlight("panel-simulator")}
        candidates={candidates}
        onOpenAttribute={openAttribute}
        onRun={(input) => {
          const result = runCandidateRetrieval(input);
          setCandidates(result);
          log(`Candidate retrieval returned ${result.length} attributes for ${input.workType}`);
          setAnnounce(`${result.length} candidate attributes retrieved. Candidate retrieval is not final impact determination.`);
        }}
      />
      <EvaluationContractPanel spotlight={spotlight("panel-contract")} />
      <StoreArchitecturePanel spotlight={spotlight("panel-architecture")} />
      <StorageSchemaPanel />
      <ActivityPanel activity={activity} />

      <p className="text-[10.5px] text-slate-400">
        Kubernetes Change minimum considerations: {kubernetesMapping?.minimumAttributeSet.join(" · ")} — candidate routing only.
      </p>

      {/* Attribute detail drawer */}
      <Drawer
        open={!!selected} onOpenChange={(v) => { if (!v) setSelected(null); }}
        wide
        title={selected ? `${selected.id} — ${selected.name}` : ""}
        description={selected?.statement}
      >
        {selected && <AttributeDetail attribute={selected} onBind={(v) => bindPolicy(v, "Bound")} />}
      </Drawer>

      {/* Parsed structure drawer */}
      <Drawer open={structureOpen} onOpenChange={setStructureOpen} title="Parsed source structure" description="Sections extracted from the Stakeholder Attribute Sheet">
        <ul className="space-y-1 text-[11.5px] text-slate-700">
          {decompositionStages.map((s) => (
            <li key={s.id} className="rounded border border-slate-200 px-2 py-1">
              <span className="font-semibold">{s.name}</span> — {s.detail}
            </li>
          ))}
        </ul>
      </Drawer>

      {/* Stage detail drawer */}
      <Drawer
        open={!!stageDetail} onOpenChange={(v) => { if (!v) setStageDetail(null); }}
        title={decompositionStages.find((s) => s.id === stageDetail)?.name ?? ""}
        description={decompositionStages.find((s) => s.id === stageDetail)?.detail}
      >
        <p className="text-[11.5px] text-slate-600">
          Records at this stage are inspected against atomicity, classification, and provenance rules before promotion to the canonical store.
        </p>
      </Drawer>

      {/* Demo story */}
      {story && (
        <div role="dialog" aria-label="Demo story" className="fixed bottom-3 left-1/2 z-50 w-[min(680px,92vw)] -translate-x-1/2 rounded-xl border border-slate-300 bg-white p-3 shadow-lg motion-reduce:transition-none">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Demo story — step {(storyStep ?? 0) + 1} of {storySteps.length}
            </span>
            <Button size="sm" variant="ghost" className="h-6 text-[11px]" onClick={() => setStoryStep(null)}>Exit Story</Button>
          </div>
          <p className="mt-1 text-[12.5px] text-slate-800">{story.caption}</p>
          <p className="mt-1 text-[11px] italic text-slate-500">Presenter note: {story.notes}</p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="h-1 flex-1 rounded bg-slate-200">
              <div className="h-1 rounded bg-blue-600" style={{ width: `${(((storyStep ?? 0) + 1) / storySteps.length) * 100}%` }} />
            </div>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" disabled={(storyStep ?? 0) === 0} onClick={() => setStoryStep((s) => Math.max(0, (s ?? 0) - 1))}>Previous</Button>
            <Button
              size="sm" className="h-7 text-[11px]"
              onClick={() => {
                const next = (storyStep ?? 0) + 1;
                if (next >= storySteps.length) { setStoryStep(null); return; }
                setStoryStep(next);
                if (next === 2) openAttribute("FOP-029");
                if (next === 4) setStage("relationships");
                if (next === 5) setCandidates(runCandidateRetrieval({ workType: "Kubernetes Change", environment: "Production", scaleDirection: "Increase", architectureChange: "Yes", recurringSpendChange: "Yes", commitmentInteraction: "Unknown" }));
                if (next === 9) setStage("publication");
              }}
            >{(storyStep ?? 0) === storySteps.length - 1 ? "Finish" : "Next"}</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function WorkTypePanelWrapper({ onSelect, spotlight }: { onSelect: (ids: string[], workType: string) => void; spotlight?: boolean }) {
  const [selectedWorkType, setSelectedWorkType] = useState<string | null>("Kubernetes Change");
  return (
    <WorkTypeMatrixPanel
      spotlight={spotlight}
      selected={selectedWorkType}
      onSelect={(w) => {
        setSelectedWorkType(w);
        const m = workTypeMappings.find((x) => x.workType === w);
        if (m) onSelect(m.triggeredAttributes, w);
      }}
    />
  );
}
