import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useOperations } from "@/runops/state/RunOpsProviders";
import {
  getTenantRecord, tenantRecords, resolvePresentation, validateTenantProfile,
} from "@/runops/profiles";
import type { TenantProfileRecord, ValidationFinding } from "@/runops/profiles/types";

function severityIcon(sev: ValidationFinding["severity"]) {
  if (sev === "error")   return <XCircle className="h-3.5 w-3.5 text-rose-600" />;
  if (sev === "warning") return <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />;
  return <Info className="h-3.5 w-3.5 text-slate-500" />;
}

function StatusPill({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10.5px] font-medium text-emerald-800">
      <CheckCircle2 className="h-3 w-3" /> Valid
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full border border-rose-300 bg-rose-50 px-2 py-0.5 text-[10.5px] font-medium text-rose-800">
      <XCircle className="h-3 w-3" /> Issues
    </span>
  );
}

function ProfileSummaryRow({
  record,
  onOpen,
  selected,
}: {
  record: TenantProfileRecord;
  onOpen: () => void;
  selected: boolean;
}) {
  const report = useMemo(() => validateTenantProfile(record), [record]);
  const p = record.profile;
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "w-full rounded-md border px-3 py-2 text-left transition-colors",
        selected ? "border-slate-900 bg-slate-50" : "border-slate-200 bg-white hover:bg-slate-50",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[12.5px] font-medium text-slate-900">{p.displayName}</span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-600">
            {record.industry.name}
          </span>
          <span className={cn(
            "rounded-full border px-2 py-0.5 text-[10px] font-medium",
            p.profileState === "Active" ? "border-emerald-300 bg-emerald-50 text-emerald-800"
              : p.profileState === "Deactivated" ? "border-slate-300 bg-slate-50 text-slate-700"
              : "border-amber-300 bg-amber-50 text-amber-800",
          )}>
            {p.profileState}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill ok={report.ok} />
          <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-700">
            Completeness {report.completenessPercent}%
          </span>
        </div>
      </div>
      <div className="mt-1 text-[11px] text-slate-500 line-clamp-1">{p.businessDescription}</div>
    </button>
  );
}

function LabelValue({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-2.5">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-0.5 text-[12px] text-slate-900">{value}</div>
    </div>
  );
}

export default function TenantProfileManager() {
  const { role, tenant, setTenant } = useOperations();
  const [openId, setOpenId] = useState<string>(tenant.id);

  const record = useMemo(() => getTenantRecord(openId), [openId]);
  const presentation = useMemo(
    () => resolvePresentation(record.profile, record.industry),
    [record],
  );
  const report = useMemo(() => validateTenantProfile(record), [record]);

  const authorized = role === "Platform Engineer" || role === "Demo Controller" || role === "Auditor";

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[18px] font-semibold text-slate-900">Tenant Profile Manager</h1>
          <p className="text-[12px] text-slate-600">
            Review and manage industry profiles, guardrails, standards mappings, and data completeness for every registered tenant.
            Screen never exposes secrets or live credentials.
          </p>
        </div>
        {!authorized && (
          <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-800">
            Read-only for role: {role}
          </span>
        )}
      </header>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[280px_1fr]">
        <aside className="space-y-2">
          {tenantRecords.map((r) => (
            <ProfileSummaryRow
              key={r.profile.tenantId}
              record={r}
              selected={openId === r.profile.tenantId}
              onOpen={() => setOpenId(r.profile.tenantId)}
            />
          ))}
        </aside>

        <section className="rounded-md border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-slate-900">{record.profile.displayName}</span>
              <Badge variant="outline" className="text-[10px]">{record.industry.name}</Badge>
              <Badge variant="outline" className="text-[10px]">v{record.profile.profileVersion}</Badge>
              {presentation.isSyntheticDemo && (
                <Badge className="bg-amber-100 text-[10px] text-amber-900 hover:bg-amber-100">Synthetic demo</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <StatusPill ok={report.ok} />
              <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10.5px] text-slate-700">
                Completeness {report.completenessPercent}%
              </span>
              <button
                type="button"
                disabled={!authorized || tenant.id === openId}
                onClick={() => setTenant(openId)}
                className={cn(
                  "rounded border px-2 py-1 text-[11px] font-medium",
                  !authorized || tenant.id === openId
                    ? "border-slate-200 bg-slate-50 text-slate-400"
                    : "border-slate-900 bg-slate-900 text-white hover:bg-slate-800",
                )}
                title={tenant.id === openId ? "Already the active tenant" : "Switch to this tenant"}
              >
                {tenant.id === openId ? "Active tenant" : "Switch to this tenant"}
              </button>
            </div>
          </div>

          <Tabs defaultValue="business" className="p-3">
            <TabsList className="flex flex-wrap gap-1">
              <TabsTrigger value="business">Business Context</TabsTrigger>
              <TabsTrigger value="terminology">Terminology</TabsTrigger>
              <TabsTrigger value="services">Services & Components</TabsTrigger>
              <TabsTrigger value="metrics">Metrics & SLOs</TabsTrigger>
              <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
              <TabsTrigger value="runbooks">Runbooks</TabsTrigger>
              <TabsTrigger value="workers">Workers</TabsTrigger>
              <TabsTrigger value="policies">Policies & Guardrails</TabsTrigger>
              <TabsTrigger value="connectors">Connectors</TabsTrigger>
              <TabsTrigger value="standards">Standards Mappings</TabsTrigger>
              <TabsTrigger value="completeness">Completeness</TabsTrigger>
              <TabsTrigger value="integrity">Integrity</TabsTrigger>
            </TabsList>

            <TabsContent value="business" className="mt-3 grid gap-2 md:grid-cols-2">
              <LabelValue label="Display name" value={record.profile.displayName} />
              <LabelValue label="Short name"   value={record.profile.shortName} />
              <LabelValue label="Industry"     value={record.industry.name} />
              <LabelValue label="Operating model" value={record.profile.operatingModel} />
              <LabelValue label="Operating hours" value={record.profile.operatingHours} />
              <LabelValue label="Geographic scope" value={record.profile.geographicScope} />
              <LabelValue label="Data classification" value={record.profile.dataClassification} />
              <LabelValue label="Scenario mode" value={record.profile.scenarioMode} />
              <div className="md:col-span-2">
                <LabelValue label="Business description" value={record.profile.businessDescription} />
              </div>
              <div className="md:col-span-2">
                <LabelValue label="Synthetic data notice" value={record.profile.syntheticDataNotice} />
              </div>
              <div className="md:col-span-2">
                <LabelValue label="Operational priorities" value={record.profile.operationalPriorities.join(" · ")} />
              </div>
              <div className="md:col-span-2">
                <LabelValue label="Compliance context (mappings only)" value={record.profile.complianceContext.join(" · ")} />
              </div>
            </TabsContent>

            <TabsContent value="terminology" className="mt-3 grid gap-2 md:grid-cols-2">
              <LabelValue label="Journey label"       value={presentation.journeyLabel} />
              <LabelValue label="Service label"       value={presentation.serviceLabel} />
              <LabelValue label="Component label"     value={presentation.componentLabel} />
              <LabelValue label="Incident label"      value={presentation.incidentLabel} />
              <LabelValue label="Impact label"        value={presentation.impactLabel} />
              <LabelValue label="SLO label"           value={presentation.sloLabel} />
              <LabelValue label="Error-budget label"  value={presentation.errorBudgetLabel} />
              <div className="md:col-span-2">
                <LabelValue
                  label="Glossary"
                  value={
                    <ul className="mt-1 space-y-1 text-[11.5px] text-slate-700">
                      {presentation.glossary.map((g) => (
                        <li key={g.term}><b>{g.term}</b>{g.expansion ? ` (${g.expansion})` : ""} — {g.definition}</li>
                      ))}
                    </ul>
                  }
                />
              </div>
            </TabsContent>

            <TabsContent value="services" className="mt-3 space-y-2">
              {record.bundle.services.map((s) => (
                <div key={s.id} className="rounded border border-slate-200 bg-white p-2">
                  <div className="flex items-center justify-between gap-2 text-[12px]">
                    <span className="font-medium text-slate-900">{s.name}</span>
                    <span className="text-[10.5px] text-slate-500">{s.tier} · {s.environment} · {s.region}</span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-600">Components: {s.componentIds.length}</div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="metrics" className="mt-3 space-y-2">
              <div className="text-[11px] text-slate-500">Default metric definitions from the industry profile:</div>
              <ul className="grid gap-1 md:grid-cols-2">
                {presentation.metricDefinitions.map((m) => (
                  <li key={m.id} className="rounded border border-slate-200 bg-white p-2 text-[11.5px]">
                    <b>{m.name}</b> <span className="text-slate-500">({m.unit})</span>
                    <div className="text-slate-600">{m.description}</div>
                    <div className="text-slate-400">Source: {m.source}</div>
                  </li>
                ))}
              </ul>
              <div className="mt-3 text-[11px] text-slate-500">SLOs:</div>
              <ul className="grid gap-1">
                {record.bundle.slos.map((s) => (
                  <li key={s.id} className="rounded border border-slate-200 bg-white p-2 text-[11.5px]">
                    <b>{s.name}</b> · target {s.target}% · current {s.current}% · budget {s.errorBudgetRemaining}% · window {s.window}
                  </li>
                ))}
              </ul>
            </TabsContent>

            <TabsContent value="scenarios" className="mt-3">
              <LabelValue
                label="Default scenario / story"
                value={`${record.profile.defaultScenarioId} · ${record.profile.defaultStoryId}`}
              />
              <ol className="mt-3 space-y-1 text-[11.5px] text-slate-700">
                {record.bundle.scenarioStages.map((st) => (
                  <li key={st.index} className="rounded border border-slate-200 bg-white p-1.5">
                    <span className="text-slate-500">Stage {st.index}:</span> {st.label}
                  </li>
                ))}
              </ol>
            </TabsContent>

            <TabsContent value="runbooks" className="mt-3 space-y-1">
              {record.bundle.runbooksList.map((r) => (
                <div key={r.id} className="rounded border border-slate-200 bg-white p-2 text-[11.5px]">
                  <div className="flex items-center justify-between">
                    <b>{r.id} · {r.title}</b>
                    <span className="text-slate-500">{r.state} · {r.autonomy} · fitness {r.fitnessScore}</span>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="workers" className="mt-3 space-y-1">
              {record.bundle.digitalWorkers.map((w) => (
                <div key={w.id} className="rounded border border-slate-200 bg-white p-2 text-[11.5px]">
                  <b>{w.id}</b> — {w.role}
                  <span className="ml-2 text-slate-500">Authority: {w.autonomy}</span>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="policies" className="mt-3 space-y-2">
              {presentation.hardGuardrails.map((g) => (
                <div key={g.id} className="rounded border border-rose-300 bg-rose-50/40 p-2 text-[11.5px]">
                  <div className="flex items-center gap-1 font-medium text-rose-900">
                    <ShieldCheck className="h-3.5 w-3.5" /> {g.title}
                  </div>
                  <div className="mt-0.5 text-slate-800">{g.rule}</div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="connectors" className="mt-3 space-y-1">
              {record.bundle.connectors.map((c) => (
                <div key={c.id} className="rounded border border-slate-200 bg-white p-2 text-[11.5px]">
                  <b>{c.name}</b>
                  <span className="ml-2 text-slate-500">{c.kind} · {c.status} · {c.freshness}</span>
                </div>
              ))}
              <div className="text-[10.5px] text-slate-500">All non-generic connectors are synthetic simulators.</div>
            </TabsContent>

            <TabsContent value="standards" className="mt-3 space-y-2">
              {presentation.standardsMappings.map((s) => (
                <div key={s.id} className="rounded border border-slate-200 bg-white p-2 text-[11.5px]">
                  <b>{s.framework}</b> — {s.control}
                  <div className="text-slate-600">{s.note}</div>
                  <div className="text-slate-400">Applies to: {s.appliesTo} · Kind: {s.kind}</div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="completeness" className="mt-3 space-y-2">
              <div className="rounded border border-slate-200 bg-white p-2 text-[12px]">
                <div className="flex items-center gap-2">
                  <StatusPill ok={report.ok} />
                  <span>Overall completeness {report.completenessPercent}%</span>
                  <span className="ml-auto text-[10.5px] text-slate-500">
                    18 dimensions · drill in for missing elements
                  </span>
                </div>
              </div>
              <ul className="grid gap-2 md:grid-cols-2">
                {report.dimensions.map((d) => (
                  <li key={d.key} className="rounded border border-slate-200 bg-white p-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12px] font-medium text-slate-900">{d.label}</span>
                      <span className={cn(
                        "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                        d.ok ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                             : "border-amber-300 bg-amber-50 text-amber-800",
                      )}>{d.score}%</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={cn(
                          "h-full",
                          d.score >= 85 ? "bg-emerald-500" :
                          d.score >= 70 ? "bg-emerald-400" :
                          d.score >= 50 ? "bg-amber-400" : "bg-rose-500",
                        )}
                        style={{ width: `${d.score}%` }}
                      />
                    </div>
                    <div className="mt-1 text-[11px] text-slate-600">{d.detail}</div>
                    {d.missing.length > 0 && (
                      <ul className="mt-1 space-y-0.5 text-[10.5px] text-rose-700">
                        {d.missing.map((m, i) => (
                          <li key={i}>• {m}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </TabsContent>

            <TabsContent value="integrity" className="mt-3 space-y-2">
              <div className="rounded border border-slate-200 bg-white p-2 text-[12px]">
                <div className="flex items-center gap-2">
                  <StatusPill ok={report.ok} />
                  <span>Completeness {report.completenessPercent}%</span>
                </div>
              </div>
              {report.findings.length === 0 ? (
                <div className="rounded border border-emerald-300 bg-emerald-50 p-2 text-[12px] text-emerald-900">
                  No integrity issues detected.
                </div>
              ) : (
                <ul className="space-y-1">
                  {report.findings.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 rounded border border-slate-200 bg-white p-2 text-[11.5px]">
                      {severityIcon(f.severity)}
                      <div>
                        <div className="font-medium text-slate-900">{f.code}</div>
                        <div className="text-slate-600">{f.message}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </div>

      <footer className="text-[11px] text-slate-500">
        <Link to="/runops/platform" className="hover:text-slate-800">← Platform Administration</Link>
      </footer>
    </div>
  );
}
