// Main dashboard for the Agentic AI IAM administration plane: KPI strip,
// identity posture, identity-type and permission-category distribution, recent
// access decisions with full explainability, risk findings, policy change log
// and top entities by effective permission count.

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Panel, KpiCard, KV, SubHead, StatePill, RichTip, Btn, EmptyState, type DrawerTab, InspectDrawer,
} from "./parts";
import {
  ACCESS_EVENTS, IDENTITY_TYPES, KPIS, PERMISSION_CATEGORIES, POLICY_CHANGES, POSTURE,
  RISK_FINDINGS, TOP_ENTITIES, DEFINITIONS, ADMIN_ROLES, CAPABILITY_REASON, riskTone,
  type AdminRoleId,
} from "./data";
import {
  accessDecisionTabs, categoryTabs, conflictTabs, delegationTabs, entityTabs, explainAccessTabs,
  identityTypeTabs, kpiTabs, policyChangeTabs, postureTabs, reviewTabs, riskTabs, roleTabs, serviceTabs, Bar,
} from "./drawers";
import { GlobalSearch, PolicySimulator } from "./panels";

type Drawer = { objectType: string; name: string; status?: string; tone?: "ok" | "warn" | "bad"; tabs: DrawerTab[] } | null;

export default function IamAdminOverview() {
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [sim, setSim] = useState(false);
  const [role, setRole] = useState<AdminRoleId>("iam-admin");
  const [typeFilter, setTypeFilter] = useState("All");
  const [resultFilter, setResultFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");

  const caps = ADMIN_ROLES.find((r) => r.id === role)!;
  const can = (c: string) => caps.can.includes(c);

  const openRole = () => setDrawer({
    objectType: "Role / Digital Coworker Access Role", name: "Claims Analyzer", status: "Active", tone: "ok",
    tabs: roleTabs((s) => setDrawer({ objectType: "Permission Service", name: s, tabs: serviceTabs(s) })),
  });

  const events = useMemo(() => ACCESS_EVENTS.filter((e) =>
    (typeFilter === "All" || e.entityType === typeFilter) &&
    (resultFilter === "All" || e.result === resultFilter) &&
    (riskFilter === "All" || e.risk === riskFilter)), [typeFilter, resultFilter, riskFilter]);

  const openSearch = (target: string) => {
    if (target === "role") return openRole();
    if (target === "credentials") return setDrawer({ objectType: "Identity Class", name: "Service Accounts", tabs: identityTypeTabs(IDENTITY_TYPES[2]) });
    const [kind, id] = target.split(":");
    if (kind === "event") { const e = ACCESS_EVENTS.find((x) => x.id === id); if (e) return setDrawer({ objectType: "Access Decision", name: e.id, status: e.result, tone: e.result === "Success" ? "ok" : "bad", tabs: accessDecisionTabs(e) }); }
    if (kind === "risk") { const f = RISK_FINDINGS.find((x) => x.id === id); if (f) return setDrawer({ objectType: "Risk Finding", name: f.entity, status: `${f.risk} risk`, tone: riskTone(f.risk) === "muted" ? "ok" : riskTone(f.risk) as any, tabs: riskTabs(f) }); }
    if (kind === "policy") { const p = POLICY_CHANGES.find((x) => x.id === id); if (p) return setDrawer({ objectType: "Access Policy Change", name: p.policy, status: p.version, tone: "ok", tabs: policyChangeTabs(p) }); }
    if (kind === "entity") { const e = TOP_ENTITIES.find((x) => x.id === id); if (e) return setDrawer({ objectType: "Entity Permissions", name: e.entity, tabs: entityTabs(e) }); }
    if (kind === "category") { const c = PERMISSION_CATEGORIES.find((x) => x.id === id); if (c) return setDrawer({ objectType: "Permission Category", name: c.label, tabs: categoryTabs(c) }); }
  };

  return (
    <div className="space-y-4">
      {/* control bar */}
      <div className="flex flex-wrap items-center gap-2">
        <GlobalSearch onSelect={(i) => openSearch(i.target)} />
        <Btn onClick={() => setSim(true)}>Simulate Access</Btn>
        <Btn onClick={() => setDrawer({ objectType: "Delegated Authority", name: "Delegation & JIT Privilege", tabs: delegationTabs() })}>Delegation &amp; JIT</Btn>
        <Btn onClick={() => setDrawer({ objectType: "Access Review", name: "Digital Coworkers · Quarterly Review", status: "96% complete", tone: "ok", tabs: reviewTabs() })}>Access Reviews</Btn>
        <Btn onClick={() => setDrawer({ objectType: "Reference", name: "IAM Definitions", tabs: [{ id: "d", label: "Definitions", content: <KV rows={DEFINITIONS} /> }] })}>Definitions</Btn>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-[11px] text-slate-500">Administrative role</span>
          <select aria-label="Administrative role" value={role} onChange={(e) => setRole(e.target.value as AdminRoleId)}
            className="h-8 rounded-md border border-slate-200 bg-white px-2 text-[12px] text-slate-700">
            {ADMIN_ROLES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {KPIS.map((k) => (
          <KpiCard key={k.id} label={k.label} value={k.value} secondary={k.secondary} change={k.change}
            tip={{ term: k.label, definition: k.definition, rows: k.rows, why: k.why }}
            onClick={() => setDrawer({ objectType: "Identity Inventory", name: k.drawerTitle, tabs: kpiTabs(k) })} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        {/* posture */}
        <Panel title="Identity & Access Posture" subtitle="Tenant-configured composite score, recomputed hourly"
          actions={<Btn onClick={() => setDrawer({ objectType: "Posture Score", name: "Identity & Access Posture", status: POSTURE.status, tone: "ok", tabs: postureTabs() })}>Inspect</Btn>}>
          <div className="flex items-center gap-4">
            <Donut score={POSTURE.score} segments={POSTURE.segments} />
            <div className="min-w-0 flex-1 space-y-1">
              {POSTURE.segments.map((s) => (
                <button key={s.id} onClick={() => setDrawer({ objectType: "Posture Segment", name: s.label, status: `${s.pct}% of identities`, tone: "ok", tabs: [{ id: "c", label: "Criteria", content: <p className="text-[11.5px] leading-relaxed text-slate-700">{s.criteria}</p> }] })}
                  className="flex w-full items-center gap-2 rounded px-1 py-0.5 text-left hover:bg-slate-50">
                  <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                  <span className="flex-1 text-[11.5px] text-slate-700">{s.label}</span>
                  <span className="text-[11.5px] tabular-nums text-slate-900">{s.pct}%</span>
                </button>
              ))}
            </div>
          </div>
          <SubHead>Contributing components</SubHead>
          <div className="space-y-1.5">
            {POSTURE.components.slice(0, 5).map((c) => (
              <RichTip key={c.id} as="div" tip={{ term: c.label, definition: c.note, rows: [["Component score", String(c.value)]], why: "Each component is weighted into the tenant posture score." }}>
                <div>
                  <div className="flex justify-between text-[11.5px] text-slate-700"><span>{c.label}</span><span className="tabular-nums">{c.value}</span></div>
                  <Bar value={c.value} tone={c.value >= 90 ? "#059669" : c.value >= 85 ? "#2563EB" : "#D97706"} />
                </div>
              </RichTip>
            ))}
          </div>
        </Panel>

        {/* distributions */}
        <div className="space-y-4">
          <Panel title="Access by Identity Type" subtitle="Click a class to inspect inventory, posture and credential method">
            <div className="space-y-2">
              {IDENTITY_TYPES.map((t) => (
                <button key={t.id} onClick={() => setDrawer({ objectType: "Identity Class", name: t.label, status: `${t.count} identities`, tone: "ok", tabs: identityTypeTabs(t) })}
                  className="w-full rounded px-1 py-0.5 text-left hover:bg-slate-50">
                  <div className="flex justify-between text-[11.5px] text-slate-700">
                    <span>{t.label}</span>
                    <span className="tabular-nums text-slate-900">{t.count} · avg {t.avgPermissions} perms</span>
                  </div>
                  <Bar value={(t.count / 342) * 100} />
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Permissions by Category" subtitle="Taxonomy of what identities may do, and where the boundary sits">
            <div className="grid gap-2 sm:grid-cols-2">
              {PERMISSION_CATEGORIES.map((c) => (
                <button key={c.id} onClick={() => setDrawer({ objectType: "Permission Category", name: c.label, status: `${c.pct}% of grants`, tone: "ok", tabs: categoryTabs(c) })}
                  className="rounded border border-slate-200 px-2.5 py-2 text-left hover:border-slate-300 hover:bg-slate-50">
                  <div className="flex justify-between text-[11.5px] font-medium text-slate-800"><span>{c.label}</span><span className="tabular-nums">{c.pct}%</span></div>
                  <Bar value={c.pct * 3} />
                  <div className="mt-1 line-clamp-2 text-[11px] text-slate-500">{c.definition}</div>
                </button>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      {/* conflict banner */}
      <button onClick={() => setDrawer({ objectType: "Policy Conflict", name: "Remediation Engineer · production modify", status: "Deny in force", tone: "bad", tabs: conflictTabs() })}
        className="flex w-full flex-wrap items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-left hover:border-amber-400">
        <StatePill tone="warn" label="2 policy conflicts" />
        <span className="text-[12px] text-amber-900">
          Role entitlement allows production Kubernetes modification while the runtime policy requires an incident workflow approval. Deny is in force.
        </span>
        <span className="ml-auto text-[11.5px] font-medium text-amber-800">Inspect conflict →</span>
      </button>

      {/* recent access activity */}
      <Panel title="Recent Access Activity" subtitle="Every row is a retained authorization decision with a full attribute snapshot"
        actions={
          <div className="flex flex-wrap items-center gap-1.5">
            <select aria-label="Filter identity type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
              className="h-7 rounded border border-slate-200 bg-white px-1.5 text-[11.5px] text-slate-700">
              {["All", "Digital Coworker", "Human User", "Service Account", "API Client", "Workload Identity"].map((o) => <option key={o}>{o}</option>)}
            </select>
            <select aria-label="Filter result" value={resultFilter} onChange={(e) => setResultFilter(e.target.value)}
              className="h-7 rounded border border-slate-200 bg-white px-1.5 text-[11.5px] text-slate-700">
              {["All", "Success", "Denied"].map((o) => <option key={o}>{o}</option>)}
            </select>
            <select aria-label="Filter risk" value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}
              className="h-7 rounded border border-slate-200 bg-white px-1.5 text-[11.5px] text-slate-700">
              {["All", "Low", "Medium", "High"].map((o) => <option key={o}>{o}</option>)}
            </select>
            <Btn onClick={() => toast.success("Access decision export queued", { description: "Decision records export with attribute snapshots and correlation identifiers." })}>Export</Btn>
          </div>
        } bodyClassName="p-0">
        {events.length === 0 ? (
          <div className="p-4"><EmptyState title="No decisions match these filters" body="Adjust the identity type, result or risk filter to see retained authorization decisions." cta="Reset filters" onCta={() => { setTypeFilter("All"); setResultFilter("All"); setRiskFilter("All"); }} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-[12px]">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  {["Time", "Identity", "Type", "Action", "Resource", "Policy", "Risk", "Result", ""].map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-3 py-1.5 text-slate-500">{e.time.split(" ").slice(-1)[0]}</td>
                    <td className="px-3 py-1.5">
                      <button className="text-blue-700 underline-offset-2 hover:underline"
                        onClick={() => e.entity === "Claims Analyzer" ? openRole() : setDrawer({ objectType: "Access Decision", name: e.id, status: e.result, tone: e.result === "Success" ? "ok" : "bad", tabs: accessDecisionTabs(e) })}>
                        {e.entity}
                      </button>
                    </td>
                    <td className="px-3 py-1.5 text-slate-600">{e.entityType}</td>
                    <td className="px-3 py-1.5 text-slate-700">{e.action}</td>
                    <td className="max-w-[240px] truncate px-3 py-1.5 text-slate-600" title={e.resource}>{e.resource}</td>
                    <td className="px-3 py-1.5 text-slate-600">{e.policy}</td>
                    <td className="px-3 py-1.5"><StatePill tone={riskTone(e.risk)} label={e.risk} /></td>
                    <td className="px-3 py-1.5"><StatePill tone={e.result === "Success" ? "ok" : "bad"} label={e.result} /></td>
                    <td className="whitespace-nowrap px-3 py-1.5 text-right">
                      <Btn onClick={() => setDrawer({ objectType: "Access Decision", name: e.id, status: e.decision.outcome, tone: e.result === "Success" ? "ok" : "bad", tabs: accessDecisionTabs(e) })}>Inspect</Btn>
                      <Btn onClick={() => setDrawer({ objectType: "Explainability", name: `Why ${e.entity} was ${e.result === "Success" ? "allowed" : "denied"}`, tabs: explainAccessTabs(e) })}>Explain</Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* risk findings */}
        <Panel title="Identity Risk Findings" subtitle="Ownership, breadth, dormancy and credential posture exceptions">
          <div className="space-y-1.5">
            {RISK_FINDINGS.map((f) => (
              <div key={f.id} className="rounded border border-slate-200 px-2.5 py-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[12.5px] font-medium text-slate-800">{f.entity}</span>
                  <StatePill tone={riskTone(f.risk)} label={`${f.risk} risk`} />
                  <span className="text-[11px] text-slate-500">{f.entityType}</span>
                  <Btn className="ml-auto" onClick={() => setDrawer({ objectType: "Risk Finding", name: f.entity, status: f.issue, tone: riskTone(f.risk) === "muted" ? "warn" : riskTone(f.risk) as any, tabs: riskTabs(f) })}>Inspect</Btn>
                </div>
                <div className="mt-0.5 text-[11.5px] text-slate-600">{f.issue}</div>
                <div className="text-[11px] text-slate-500">Owner {f.owner} · review {f.reviewDue} · last access {f.lastAccess}</div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {["Assign Owner", "Reduce Scope", "Suspend"].map((a) => (
                    <Btn key={a} disabled={!can("edit")} title={can("edit") ? undefined : CAPABILITY_REASON.edit}
                      onClick={() => toast.success(`${a} proposed`, { description: `${a} for ${f.entity} recorded. Change requires reviewer approval.` })}>{a}</Btn>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* policy changes */}
        <Panel title="Recent Access Policy Changes" subtitle="Versioned policy changes with field-level differences">
          <div className="space-y-1.5">
            {POLICY_CHANGES.map((p) => (
              <button key={p.id} onClick={() => setDrawer({ objectType: "Access Policy Change", name: p.policy, status: p.version, tone: "ok", tabs: policyChangeTabs(p) })}
                className="w-full rounded border border-slate-200 px-2.5 py-2 text-left hover:border-slate-300 hover:bg-slate-50">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[12.5px] font-medium text-slate-800">{p.policy}</span>
                  <StatePill tone={p.change === "Deprecated" ? "muted" : "ok"} label={p.change} />
                  <span className="ml-auto text-[11px] tabular-nums text-slate-500">{p.version}</span>
                </div>
                <div className="mt-0.5 text-[11.5px] text-slate-600">{p.reason}</div>
                <div className="text-[11px] text-slate-500">{p.by} · {p.time}</div>
              </button>
            ))}
          </div>
          <SubHead>Governance</SubHead>
          <div className="flex flex-wrap gap-1.5">
            <Btn disabled={!can("create")} title={can("create") ? undefined : CAPABILITY_REASON.create}
              onClick={() => toast.info("Create access policy", { description: "Define subject, action, resource, condition and effect, then simulate before activation." })}>Create Policy</Btn>
            <Btn disabled={!can("approve")} title={can("approve") ? undefined : CAPABILITY_REASON.approve}
              onClick={() => toast.success("Policy change approved", { description: "Cloud Infrastructure Policy v12 approved for activation." })}>Approve Pending Change</Btn>
            <Btn onClick={() => setSim(true)}>Simulate Before Activation</Btn>
          </div>
        </Panel>
      </div>

      {/* top entities */}
      <Panel title="Top Entities by Effective Permission Count" subtitle="Permission count alone is not risk; breadth, severity and usage qualify it" bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-[12px]">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <tr>{["Entity", "Type", "Effective", "Privileged", "Unused 90d", "Last review", ""].map((h) => (
                <th key={h} className="px-3 py-2 text-left font-semibold">{h}</th>))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {TOP_ENTITIES.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-3 py-1.5 font-medium text-slate-800">{r.entity}</td>
                  <td className="px-3 py-1.5 text-slate-600">{r.type}</td>
                  <td className="px-3 py-1.5 tabular-nums text-slate-800">{r.effective}</td>
                  <td className="px-3 py-1.5 tabular-nums text-slate-800">{r.privileged}</td>
                  <td className="px-3 py-1.5 tabular-nums text-slate-800">{r.unused}</td>
                  <td className="px-3 py-1.5 text-slate-600">{r.lastReview}</td>
                  <td className="px-3 py-1.5 text-right">
                    <Btn onClick={() => setDrawer({ objectType: "Entity Permissions", name: r.entity, status: `${r.effective} effective permissions`, tone: "ok", tabs: entityTabs(r) })}>Inspect</Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <PolicySimulator open={sim} onClose={() => setSim(false)} />
      <InspectDrawer open={!!drawer} onClose={() => setDrawer(null)} objectType={drawer?.objectType ?? ""}
        name={drawer?.name ?? ""} status={drawer?.status} statusTone={drawer?.tone ?? "ok"} tabs={drawer?.tabs ?? []} />
    </div>
  );
}

function Donut({ score, segments }: { score: number; segments: { id: string; pct: number; color: string }[] }) {
  const r = 46, c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg viewBox="0 0 120 120" className="h-[132px] w-[132px] shrink-0" role="img" aria-label={`Identity posture score ${score}`}>
      <circle cx="60" cy="60" r={r} fill="none" stroke="#E2E8F0" strokeWidth="14" />
      {segments.map((s) => {
        const len = (s.pct / 100) * c;
        const el = (
          <circle key={s.id} cx="60" cy="60" r={r} fill="none" stroke={s.color} strokeWidth="14"
            strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} transform="rotate(-90 60 60)" />
        );
        offset += len;
        return el;
      })}
      <text x="60" y="58" textAnchor="middle" className="fill-slate-900 text-[24px] font-semibold">{score}</text>
      <text x="60" y="74" textAnchor="middle" className="fill-slate-500 text-[9px]">POSTURE SCORE</text>
    </svg>
  );
}
