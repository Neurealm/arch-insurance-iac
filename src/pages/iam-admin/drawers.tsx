// Drawer content builders for the Agentic AI IAM administration plane. Every
// object class (identity, role, permission, policy, decision, risk finding,
// review, credential) resolves to a set of inspection tabs.

import { toast } from "sonner";
import { KV, SubHead, Bullets, StatePill, Btn, type DrawerTab } from "./parts";
import {
  ACCESS_EVENTS, CREDENTIALS, DELEGATIONS, JIT_REQUEST, POSTURE, REVIEW_SUMMARY, ROLE,
  SESSION_CONTROLS, TOOL_GOVERNANCE, riskTone,
  type AccessEvent, type EntityPermissionRow, type IdentityTypeRow, type Kpi,
  type PermissionCategory, type PolicyChange, type RiskFinding,
} from "./data";
import { effectTone } from "./parts";

/* ------------------------------ small pieces ------------------------------ */

export function CheckList({ checks }: { checks: { label: string; result: string }[] }) {
  return (
    <ul className="divide-y divide-slate-100 rounded border border-slate-200">
      {checks.map((c) => (
        <li key={c.label} className="flex items-center justify-between gap-3 px-2.5 py-1.5">
          <span className="text-[11.5px] text-slate-700">{c.label}</span>
          <StatePill tone={c.result === "PASS" ? "ok" : c.result === "FAIL" ? "bad" : "muted"} label={c.result} />
        </li>
      ))}
    </ul>
  );
}

export function Bar({ value, tone = "#2563EB" }: { value: number; tone?: string }) {
  return (
    <div className="h-1.5 w-full rounded bg-slate-100">
      <div className="h-1.5 rounded" style={{ width: `${Math.min(100, value)}%`, background: tone }} />
    </div>
  );
}

function Timeline({ rows }: { rows: { time: string; actor: string; event: string }[] }) {
  return (
    <ol className="space-y-2">
      {rows.map((r) => (
        <li key={r.time + r.event} className="border-l-2 border-slate-200 pl-3">
          <div className="text-[11px] text-slate-500">{r.time} · {r.actor}</div>
          <div className="text-[11.5px] text-slate-800">{r.event}</div>
        </li>
      ))}
    </ol>
  );
}

function copy(id: string) {
  navigator.clipboard?.writeText(id);
  toast.success("Copied to clipboard", { description: id });
}

/* --------------------------- access decision ------------------------------ */

export function accessDecisionTabs(e: AccessEvent): DrawerTab[] {
  const d = e.decision;
  return [
    {
      id: "overview", label: "Overview", content: (
        <div>
          <div className="mb-2"><StatePill tone={e.result === "Success" ? "ok" : "bad"} label={d.outcome} /></div>
          <KV rows={[
            ["Decision ID", e.id], ["Timestamp", e.time], ["Identity", e.entity], ["Identity type", e.entityType],
            ["Requested action", e.action], ["Requested resource", e.resource], ["Policy", e.policy],
            ["Source / region", e.source], ["Risk", e.risk], ["Correlation ID", e.correlation],
          ]} />
          <SubHead>Why this decision was reached</SubHead>
          <p className="text-[11.5px] leading-relaxed text-slate-700">{d.reason}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Btn onClick={() => toast.info("Explain Access", { description: d.reason })}>Explain Decision</Btn>
            <Btn onClick={() => toast.info("Policy", { description: `${e.policy} governs this request.` })}>View Policy</Btn>
            <Btn onClick={() => toast.info("Role", { description: `${d.role} supplied the candidate entitlement.` })}>View Role</Btn>
            <Btn onClick={() => copy(e.id)}>Copy Decision ID</Btn>
          </div>
        </div>
      ),
    },
    { id: "identity", label: "Identity", content: (
      <KV rows={[["Identity", e.entity], ["Type", e.entityType], ["Lifecycle state", d.identityStatus], ["Role", d.role],
        ["Credential", d.credential], ["Session age", d.sessionAge], ["Environment", d.environment], ["Region", d.region]]} />
    ) },
    { id: "permissions", label: "Permissions", content: (
      <div>
        <SubHead>Effective permission supplied by role</SubHead>
        <KV rows={[["Role", d.role], ["Granted action", e.action], ["Resource scope", e.resource], ["Explicit denies", "Write, Delete on this prefix"]]} />
        <SubHead>Effective permission calculation</SubHead>
        <Bullets items={[
          `Role grant supplies ${e.action} on the requested resource class.`,
          "No conflicting direct grant present.",
          "Explicit deny set removes mutating actions.",
          "Policy conditions narrow the resource scope at request time.",
        ]} />
      </div>
    ) },
    { id: "policy", label: "Policy Evaluation", content: (
      <div>
        <CheckList checks={d.checks} />
        <div className="mt-3"><StatePill tone={e.result === "Success" ? "ok" : "bad"} label={`Final decision: ${d.outcome}`} /></div>
      </div>
    ) },
    { id: "attributes", label: "Attributes", content: (
      <div>
        <SubHead>Identity attributes</SubHead>
        <KV rows={[["Type", e.entityType], ["Role", d.role], ["Trust tier", "Platform Managed"], ["Owner", "Resolved"]]} />
        <SubHead>Resource attributes</SubHead>
        <KV rows={[["Classification", d.classification], ["Environment", d.environment], ["Region", d.region]]} />
        <SubHead>Runtime attributes</SubHead>
        <KV rows={[["Session age", d.sessionAge], ["Delegation", d.delegation], ["Approval", d.approval], ["Risk", e.risk]]} />
      </div>
    ) },
    { id: "session", label: "Session", content: <KV rows={SESSION_CONTROLS} /> },
    { id: "evidence", label: "Evidence", content: (
      <Bullets items={[
        `Decision record ${e.id} retained with full attribute snapshot.`,
        `Correlation ID ${e.correlation} links the request to workflow and execution telemetry.`,
        "Credential issuance record retained by the identity service.",
        "Policy version in force at evaluation time is pinned to the decision.",
      ]} />
    ) },
    { id: "history", label: "History", content: (
      <Timeline rows={[
        { time: e.time, actor: e.entity, event: `${e.action} on ${e.resource} → ${d.outcome}` },
        { time: "Earlier today", actor: "Identity Service", event: `Credential issued: ${d.credential}` },
        { time: "May 12, 2026", actor: "Ravi N.", event: `Policy ${e.policy} updated (session ceiling reduced)` },
      ]} />
    ) },
  ];
}

export function explainAccessTabs(e: AccessEvent): DrawerTab[] {
  const d = e.decision;
  return [
    { id: "explain", label: "Explain Access", content: (
      <div>
        <KV rows={[
          ["Who requested access", `${e.entity} (${e.entityType})`],
          ["What was requested", `${e.action} on ${e.resource}`],
          ["Role supplying permission", d.role],
          ["Policies applied", e.policy],
          ["Attributes evaluated", `${d.checks.length} conditions across identity, resource and runtime`],
          ["Delegated privilege", d.delegation],
          ["Approval required", d.approval],
          ["Credential used", d.credential],
          ["Session", d.sessionAge],
          ["Decision", d.outcome],
        ]} />
        <SubHead>Reasoning</SubHead>
        <p className="text-[11.5px] leading-relaxed text-slate-700">{d.reason}</p>
      </div>
    ) },
    { id: "eval", label: "Evaluation", content: <CheckList checks={d.checks} /> },
  ];
}

/* --------------------------------- role ----------------------------------- */

export function roleTabs(onService: (s: string) => void): DrawerTab[] {
  const r = ROLE;
  return [
    { id: "overview", label: "Overview", content: (
      <div>
        <p className="text-[11.5px] leading-relaxed text-slate-700">{r.description}</p>
        <SubHead>Configuration</SubHead>
        <KV rows={[
          ["Role ID", r.id], ["Role type", r.roleType], ["Trust required", r.trustRequired],
          ["Maximum session", r.maxSession], ["Allowed environment", r.environments], ["Allowed region", r.regions],
          ["Data classification ceiling", r.classificationCeiling], ["Privileged execution", r.privilegedExecution],
          ["Human delegation", r.humanDelegation], ["Version", r.version], ["Created", r.created], ["Updated", r.updated],
        ]} />
        <SubHead>Assigned entities (1)</SubHead>
        {r.assignedEntities.map((a) => (
          <div key={a.name} className="flex items-center justify-between rounded border border-slate-200 px-2.5 py-1.5">
            <div><div className="text-[12px] font-medium text-slate-800">{a.name}</div>
              <div className="text-[11px] text-slate-500">{a.type} · {a.environment}</div></div>
            <Btn onClick={() => toast.info("Digital coworker identity", { description: `${a.name} is the only entity assigned this role.` })}>View</Btn>
          </div>
        ))}
      </div>
    ) },
    { id: "permissions", label: "Permissions", content: (
      <div>
        <div className="grid grid-cols-4 gap-2">
          {([["Total", r.totals.permissions], ["Allow", r.totals.allow], ["Deny", r.totals.deny], ["Services", r.totals.services]] as [string, number][]).map(([k, v]) => (
            <div key={k} className="rounded border border-slate-200 px-2 py-1.5">
              <div className="text-[10px] uppercase tracking-wide text-slate-500">{k}</div>
              <div className="text-[15px] font-semibold tabular-nums text-slate-900">{v}</div>
            </div>
          ))}
        </div>
        <SubHead>By permission class</SubHead>
        <div className="space-y-1.5">
          {r.groups.map((g) => (
            <div key={g.label}>
              <div className="flex justify-between text-[11.5px] text-slate-700"><span>{g.label}</span><span className="tabular-nums">{g.count}</span></div>
              <Bar value={(g.count / 42) * 100} />
            </div>
          ))}
        </div>
        <SubHead>Top permission services</SubHead>
        <div className="space-y-1">
          {r.services.map((s) => (
            <button key={s.name} onClick={() => onService(s.name)}
              className="flex w-full items-center justify-between rounded px-2 py-1 text-left text-[11.5px] text-blue-700 hover:bg-slate-50">
              <span className="underline-offset-2 hover:underline">{s.name}</span>
              <span className="tabular-nums text-slate-700">{s.count}</span>
            </button>
          ))}
        </div>
      </div>
    ) },
    { id: "entities", label: "Entities", content: (
      <KV rows={[["Claims Analyzer", "Digital Coworker · Production"], ["Assignment source", "Direct role assignment"], ["Assigned by", "Ravi N."], ["Assigned", "Apr 10, 2025"]]} />
    ) },
    { id: "policies", label: "Policies", content: (
      <div className="space-y-1.5">
        {r.attachedPolicies.map((p) => (
          <div key={p.name} className="flex items-center justify-between rounded border border-slate-200 px-2.5 py-1.5">
            <span className="text-[11.5px] text-slate-800">{p.name}</span>
            <StatePill tone="ok" label={p.state} />
          </div>
        ))}
        <SubHead>Model capability entitlement</SubHead>
        <div className="space-y-1">
          {r.modelCapabilities.map((m) => (
            <div key={m.label} className="flex items-center justify-between gap-2 rounded border border-slate-200 px-2.5 py-1.5">
              <span className="text-[11.5px] text-slate-700">{m.label}</span>
              <StatePill tone={effectTone(m.state)} label={m.state} />
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
          IAM determines whether this identity may request the capability. The LLM + Model Routing layer determines which
          approved model handles the request.
        </p>
      </div>
    ) },
    { id: "constraints", label: "Constraints", content: (
      <div>
        <SubHead>Data domain access</SubHead>
        <div className="space-y-1">
          {r.dataDomains.map((d) => (
            <div key={d.domain} className="flex items-center justify-between rounded border border-slate-200 px-2.5 py-1.5">
              <span className="text-[11.5px] text-slate-700">{d.domain}</span>
              <span className={`text-[11px] font-medium ${d.access.startsWith("Denied") ? "text-red-700" : "text-slate-800"}`}>{d.access}</span>
            </div>
          ))}
        </div>
        <SubHead>Session and token controls</SubHead>
        <KV rows={SESSION_CONTROLS} />
      </div>
    ) },
    { id: "usage", label: "Usage", content: (
      <div>
        <KV rows={r.usage} />
        <SubHead>Unused permission analysis</SubHead>
        <KV rows={[["Permission", "dynamodb:PutItem"], ["Last used", "Never"], ["Assigned", "184 days"], ["Recommendation", "Remove"], ["Confidence", "High"]]} />
        <p className="mt-1.5 text-[11px] leading-relaxed text-slate-600">
          No execution path or workflow requires this action. Permissions are never removed automatically without an approved remediation policy.
        </p>
        <div className="mt-2"><Btn variant="primary" onClick={() => toast.success("Remediation proposal opened", { description: "Remove dynamodb:PutItem from Claims Analyzer (requires reviewer approval)." })}>Review Recommendation</Btn></div>
      </div>
    ) },
    { id: "history", label: "History", content: (
      <div>
        <Timeline rows={r.history} />
        <SubHead>Versioning</SubHead>
        <KV rows={[["v8", "Active since May 12, 2026"], ["v9", "Draft · resource narrowed, session reduced"]]} />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {["Compare", "Clone", "Promote", "Rollback", "Deprecate"].map((a) => (
            <Btn key={a} onClick={() => toast.info(`${a} role version`, { description: `${a} requested for ${r.name} v9 draft.` })}>{a}</Btn>
          ))}
        </div>
      </div>
    ) },
  ];
}

export function serviceTabs(service: string): DrawerTab[] {
  const g = ROLE.granular[service];
  if (!g) {
    return [{ id: "s", label: "Permissions", content: (
      <p className="text-[11.5px] text-slate-600">Granular action detail for {service} is administered in the Roles &amp; Permissions section.</p>
    ) }];
  }
  return [
    { id: "allowed", label: "Allowed", content: (
      <div>
        <SubHead>Allowed actions</SubHead>
        <Bullets items={g.allowed} />
        <SubHead>Resources</SubHead>
        <Bullets items={g.resources} />
      </div>
    ) },
    { id: "denied", label: "Denied", content: <Bullets items={g.denied} /> },
    { id: "conditions", label: "Conditions", content: <Bullets items={g.conditions} /> },
    { id: "calc", label: "Effective", content: <Bullets items={g.calculation} /> },
  ];
}

/* ------------------------------ other objects ----------------------------- */

export function kpiTabs(k: Kpi): DrawerTab[] {
  return [
    { id: "summary", label: "Summary", content: (
      <div>
        <p className="text-[11.5px] leading-relaxed text-slate-700">{k.definition}</p>
        <SubHead>Breakdown</SubHead>
        <KV rows={k.rows} />
        <SubHead>Why it matters</SubHead>
        <p className="text-[11.5px] leading-relaxed text-slate-700">{k.why}</p>
      </div>
    ) },
    { id: "actions", label: "Actions", content: (
      <div className="flex flex-wrap gap-1.5">
        {["Open filtered inventory", "Export inventory", "Start review campaign"].map((a) => (
          <Btn key={a} onClick={() => toast.info(a, { description: `${a} for ${k.label}.` })}>{a}</Btn>
        ))}
      </div>
    ) },
  ];
}

export function postureTabs(): DrawerTab[] {
  return [
    { id: "score", label: "Score", content: (
      <div>
        <p className="text-[11.5px] leading-relaxed text-slate-700">
          {POSTURE.score} is a tenant-configured posture score, not an absolute security rating. Weights and thresholds are
          configurable per tenant and are recomputed hourly.
        </p>
        <SubHead>Components</SubHead>
        <div className="space-y-2">
          {POSTURE.components.map((c) => (
            <div key={c.id}>
              <div className="flex justify-between text-[11.5px] text-slate-700"><span>{c.label}</span><span className="tabular-nums">{c.value}</span></div>
              <Bar value={c.value} tone={c.value >= 90 ? "#059669" : c.value >= 85 ? "#2563EB" : "#D97706"} />
              <div className="mt-0.5 text-[11px] text-slate-500">{c.note}</div>
            </div>
          ))}
        </div>
      </div>
    ) },
    { id: "segments", label: "Segments", content: (
      <div className="space-y-1.5">
        {POSTURE.segments.map((s) => (
          <div key={s.id} className="rounded border border-slate-200 px-2.5 py-2">
            <div className="flex justify-between text-[11.5px] font-medium text-slate-800"><span>{s.label}</span><span>{s.pct}%</span></div>
            <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">{s.criteria}</p>
          </div>
        ))}
      </div>
    ) },
  ];
}

export function identityTypeTabs(r: IdentityTypeRow): DrawerTab[] {
  return [
    { id: "inventory", label: "Inventory", content: (
      <div>
        <p className="text-[11.5px] leading-relaxed text-slate-700">{r.note}</p>
        <KV rows={[["Total", String(r.count)], ["Active", String(r.active)], ["Suspended", String(r.suspended)],
          ["High risk", String(r.highRisk)], ["Review required", String(r.reviewRequired)],
          ["Average permissions", String(r.avgPermissions)], ["Last review", r.lastReview]]} />
      </div>
    ) },
    { id: "credentials", label: "Credentials", content: (
      <div className="space-y-1.5">
        {CREDENTIALS.map((c) => (
          <div key={c.identity} className="rounded border border-slate-200 px-2.5 py-2">
            <div className="flex items-center justify-between"><span className="text-[12px] font-medium text-slate-800">{c.identity}</span>
              <StatePill tone={riskTone(c.risk)} label={`${c.risk} credential risk`} /></div>
            <div className="mt-1 text-[11px] text-slate-600">{c.type} · issuer {c.issuer} · audience {c.audience}</div>
            <div className="text-[11px] text-slate-500">Expires {c.expires} · rotation {c.rotation} · persistent secret {c.persistent} · privileged {c.privileged}</div>
          </div>
        ))}
        <p className="text-[11px] text-slate-500">Credential values are never displayed. Only posture metadata is retained.</p>
      </div>
    ) },
  ];
}

export function categoryTabs(c: PermissionCategory): DrawerTab[] {
  return [
    { id: "taxonomy", label: "Taxonomy", content: (
      <div>
        <p className="text-[11.5px] leading-relaxed text-slate-700">{c.definition}</p>
        <SubHead>Subcategories</SubHead>
        <div className="space-y-1">
          {c.subcategories.map((s) => (
            <div key={s.label} className="rounded border border-slate-200 px-2.5 py-1.5">
              <div className="text-[11.5px] font-medium text-slate-800">{s.label}</div>
              <div className="text-[11px] text-slate-600">{s.note}</div>
            </div>
          ))}
        </div>
      </div>
    ) },
    { id: "boundary", label: "Boundary", content: (
      <p className="text-[11.5px] leading-relaxed text-slate-700">{c.boundary}</p>
    ) },
  ];
}

export function riskTabs(f: RiskFinding): DrawerTab[] {
  return [
    { id: "finding", label: "Finding", content: (
      <div>
        <div className="mb-2"><StatePill tone={riskTone(f.risk)} label={`${f.risk} risk`} /></div>
        <KV rows={[["Finding ID", f.id], ["Entity", f.entity], ["Entity type", f.entityType], ["Issue", f.issue],
          ["Owner", f.owner], ["Review due", f.reviewDue], ["Last access", f.lastAccess]]} />
        <SubHead>Why it was detected</SubHead>
        <p className="text-[11.5px] leading-relaxed text-slate-700">{f.detected}</p>
        <SubHead>Why it matters</SubHead>
        <p className="text-[11.5px] leading-relaxed text-slate-700">{f.why}</p>
      </div>
    ) },
    { id: "permissions", label: "Permissions", content: <Bullets items={f.permissions} /> },
    { id: "remediation", label: "Remediation", content: (
      <div>
        <p className="text-[11.5px] leading-relaxed text-slate-700">{f.remediation}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {["Assign Owner", "Reduce Scope", "Suspend Identity", "Create Exception"].map((a) => (
            <Btn key={a} onClick={() => toast.success(a, { description: `${a} requested for ${f.entity}. Change requires reviewer approval.` })}>{a}</Btn>
          ))}
        </div>
      </div>
    ) },
  ];
}

export function policyChangeTabs(p: PolicyChange): DrawerTab[] {
  return [
    { id: "change", label: "Change", content: (
      <div>
        <KV rows={[["Change ID", p.id], ["Policy", p.policy], ["Change", p.change], ["Version", p.version], ["Changed by", p.by], ["Time", p.time], ["Ticket / reason", p.reason]]} />
        <SubHead>Field-level difference</SubHead>
        <div className="space-y-1">
          {p.diff.map(([f, o, n]) => (
            <div key={f} className="rounded border border-slate-200 px-2.5 py-1.5">
              <div className="text-[11.5px] font-medium text-slate-800">{f}</div>
              <div className="text-[11px] text-red-700 line-through">{o}</div>
              <div className="text-[11px] text-emerald-700">{n}</div>
            </div>
          ))}
        </div>
      </div>
    ) },
    { id: "structure", label: "Policy Structure", content: (
      <div>
        <SubHead>Human readable</SubHead>
        <p className="text-[11.5px] leading-relaxed text-slate-700">
          IF identity.type = DigitalCoworker AND identity.role = ClaimsAnalyzer AND resource.domain = Claims AND
          resource.classification &lt;= Confidential AND runtime.region = US AND runtime.sessionAge &lt; 60m THEN ALLOW Read.
        </p>
        <SubHead>JSON representation</SubHead>
        <pre className="overflow-x-auto rounded border border-slate-200 bg-slate-50 p-2 text-[10.5px] leading-relaxed text-slate-700">
{`{
  "subject": { "identity.type": "DigitalCoworker", "identity.role": "ClaimsAnalyzer" },
  "action": ["Read"],
  "resource": { "domain": "Claims", "classification": { "lte": "Confidential" } },
  "condition": { "runtime.region": ["US"], "runtime.sessionAge": { "lt": "60m" },
                 "request.origin": "neugain.io ContextService" },
  "effect": "ALLOW",
  "priority": 40
}`}
        </pre>
      </div>
    ) },
    { id: "history", label: "History", content: (
      <Timeline rows={[{ time: p.time, actor: p.by, event: `${p.change} · ${p.version}` },
        { time: "Apr 22, 2026", actor: "Access Review", event: "Policy certified by Claims Operations" }]} />
    ) },
  ];
}

export function entityTabs(r: EntityPermissionRow): DrawerTab[] {
  return [
    { id: "effective", label: "Effective Permissions", content: (
      <div>
        <KV rows={[["Entity", r.entity], ["Type", r.type], ["Effective permissions", String(r.effective)],
          ["Privileged permissions", String(r.privileged)], ["Unused (90d)", String(r.unused)], ["Last review", r.lastReview]]} />
        <SubHead>Qualifiers</SubHead>
        <KV rows={[["Permission breadth", r.breadth], ["Privilege severity", r.severity], ["Recent usage", r.usage]]} />
        <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
          Permission count alone does not imply risk. Severity, usage and ownership qualify the finding.
        </p>
      </div>
    ) },
    { id: "reduce", label: "Scope Reduction", content: (
      <div>
        <Bullets items={[
          `${r.unused} permissions have no recorded use in the last 90 days.`,
          "Reduction proposals require reviewer approval before any grant is modified.",
          "Privileged permissions are proposed for conversion to JIT elevation first.",
        ]} />
        <div className="mt-2"><Btn variant="primary" onClick={() => toast.success("Scope reduction proposal created", { description: `${r.unused} unused permissions proposed for removal from ${r.entity}.` })}>Propose Scope Reduction</Btn></div>
      </div>
    ) },
  ];
}

export function reviewTabs(): DrawerTab[] {
  return [
    { id: "campaign", label: "Campaign", content: (
      <div>
        <KV rows={[["Campaign", REVIEW_SUMMARY.campaign], ["Total reviews", String(REVIEW_SUMMARY.total)],
          ["Completed", `${REVIEW_SUMMARY.completed} (96%)`], ["In progress", `${REVIEW_SUMMARY.inProgress} (4%)`],
          ["Overdue", String(REVIEW_SUMMARY.overdue)], ["Exceptions", String(REVIEW_SUMMARY.exceptions)],
          ["Next review due", REVIEW_SUMMARY.nextDue]]} />
        <SubHead>Review types</SubHead>
        <Bullets items={[...REVIEW_SUMMARY.types]} />
      </div>
    ) },
    { id: "items", label: "Items", content: (
      <div className="space-y-1.5">
        {REVIEW_SUMMARY.items.map((i) => (
          <div key={i.identity} className="rounded border border-slate-200 px-2.5 py-2">
            <div className="flex items-center justify-between"><span className="text-[12px] font-medium text-slate-800">{i.identity}</span>
              <StatePill tone={riskTone(i.risk)} label={i.risk} /></div>
            <div className="mt-0.5 text-[11px] text-slate-600">Owner {i.owner} · role {i.role} · {i.permissions} permissions · {i.unused} unused · last use {i.lastUse}</div>
            <div className="mt-1 text-[11px] text-slate-700"><span className="font-medium">Recommendation: </span>{i.recommendation}</div>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {REVIEW_SUMMARY.decisions.map((d) => (
                <Btn key={d} onClick={() => toast.success(`${d} recorded`, { description: `${d} decision captured for ${i.identity}. Reviewer reason required before submission.` })}>{d}</Btn>
              ))}
            </div>
          </div>
        ))}
      </div>
    ) },
  ];
}

export function delegationTabs(): DrawerTab[] {
  return [
    { id: "delegations", label: "Delegated Authority", content: (
      <div className="space-y-1.5">
        {DELEGATIONS.map((d) => (
          <div key={d.id} className="rounded border border-slate-200 px-2.5 py-2">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-slate-800">{d.delegator} → {d.delegate}</span>
              <StatePill tone={d.state.startsWith("Active") ? "ok" : "muted"} label={d.state.split(" · ")[0]} />
            </div>
            <KV rows={[["Delegation ID", d.id], ["Allowed action", d.action], ["Resource scope", d.scope],
              ["Maximum duration", d.duration], ["Approval reference", d.approval], ["Workflow", d.workflow],
              ["Reason", d.reason], ["Correlation ID", d.correlation], ["State", d.state]]} />
          </div>
        ))}
      </div>
    ) },
    { id: "jit", label: "JIT Privilege", content: (
      <div>
        <KV rows={[["Request", JIT_REQUEST.request], ["Identity", JIT_REQUEST.identity], ["Reason", JIT_REQUEST.reason],
          ["Target", JIT_REQUEST.target], ["Maximum duration", JIT_REQUEST.duration]]} />
        <SubHead>Preconditions</SubHead>
        <CheckList checks={JIT_REQUEST.requirements.map((r) => ({ label: r.label, result: r.state === "Met" ? "PASS" : "NOT PRESENT" }))} />
        <p className="mt-2 text-[11px] leading-relaxed text-slate-600">{JIT_REQUEST.afterWorkflow}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {["Request Privilege", "Approve", "Deny", "Expire", "Revoke"].map((a) => (
            <Btn key={a} onClick={() => toast.info(a, { description: `${a} recorded for ${JIT_REQUEST.id}.` })}>{a}</Btn>
          ))}
        </div>
      </div>
    ) },
    { id: "tools", label: "Tool Authority", content: (
      <div className="space-y-2">
        {TOOL_GOVERNANCE.map((t) => (
          <div key={t.identity + t.system}>
            <SubHead>{t.identity} · {t.system}</SubHead>
            <div className="space-y-1">
              {t.rows.map((r) => (
                <div key={r.action} className="rounded border border-slate-200 px-2.5 py-1.5">
                  <div className="flex items-center justify-between"><span className="text-[11.5px] text-slate-800">{r.action}</span>
                    <StatePill tone={effectTone(r.effect)} label={r.effect} /></div>
                  <div className="text-[11px] text-slate-600">{r.constraint}</div>
                  <div className="text-[11px] text-slate-500">Policy source: {r.source} · last use {r.lastUse}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    ) },
  ];
}

export function conflictTabs(): DrawerTab[] {
  const denied = ACCESS_EVENTS.find((e) => e.result === "Denied")!;
  return [
    { id: "conflict", label: "Conflict", content: (
      <div>
        <div className="mb-2"><StatePill tone="bad" label="DENY" /></div>
        <KV rows={[["Identity", "Remediation Engineer"], ["Decision ID", denied.id],
          ["Role entitlement", "Allows Kubernetes deployment modification"],
          ["Runtime policy", "Requires incident workflow approval"],
          ["Approval reference", "Absent"]]} />
        <SubHead>Recommended action</SubHead>
        <p className="text-[11.5px] leading-relaxed text-slate-700">
          Attach an approved workflow authorization to the request or raise a just-in-time privilege request bound to INC-98271.
        </p>
        <div className="mt-2 flex gap-1.5">
          <Btn variant="primary" onClick={() => toast.success("JIT privilege request raised", { description: "JIT-2208 routed to the incident approver." })}>Request JIT Privilege</Btn>
          <Btn onClick={() => toast.info("Workflow authorization", { description: "Attach an approval reference from INC-98271." })}>Attach Approval</Btn>
        </div>
      </div>
    ) },
    { id: "eval", label: "Evaluation", content: <CheckList checks={denied.decision.checks} /> },
  ];
}
