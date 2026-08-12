import { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronRight, Circle, ArrowRight, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AWS_PAYLOAD, ENGINEERING_DECISIONS, EXPECTED_RESULT, POWERSHELL_EXTEND, POWERSHELL_RESCAN,
  PREREQUISITES, RECOVERY_SECTIONS, SQL_BACKUP, SQL_POSTCHECK, SQL_POST_CHECKLIST, SQL_PREFLIGHT,
  TARGET_RESOURCE, TERRAFORM_CODE, TERRAFORM_DIFF, TERRAFORM_META, VALIDATIONS, STEPS,
  type ChangeStep,
} from "./data";

export const STEP_TABS = [
  "Overview", "Terraform", "AWS API", "Validation", "Recovery", "Dependencies", "Evidence", "Engineering Decision",
] as const;
export type StepTab = (typeof STEP_TABS)[number];

/* ---------- primitives ---------- */

export function Code({ code, lang }: { code: string; lang?: string }) {
  return (
    <div className="overflow-hidden rounded-md border border-slate-800 bg-[#0F172A]">
      {lang && (
        <div className="flex items-center justify-between border-b border-slate-800 px-3 py-1.5 text-[10.5px] uppercase tracking-wide text-slate-400">
          <span>{lang}</span>
          <span>read-only preview</span>
        </div>
      )}
      <pre className="overflow-x-auto p-3 text-[11.5px] leading-[1.6] text-slate-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function DiffBlock({ code }: { code: string }) {
  return (
    <div className="overflow-hidden rounded-md border border-slate-800 bg-[#0F172A]">
      <pre className="overflow-x-auto p-3 text-[11.5px] leading-[1.6]">
        {code.split("\n").map((line, i) => (
          <div
            key={i}
            className={cn(
              "px-1 text-slate-100",
              line.startsWith("+") && "bg-emerald-500/15 text-emerald-300",
              line.startsWith("-") && "bg-red-500/15 text-red-300",
            )}
          >
            {line || " "}
          </div>
        ))}
      </pre>
    </div>
  );
}

function KV({ items, cols = 2 }: { items: { label: string; value: string }[]; cols?: number }) {
  return (
    <dl className={cn("grid gap-x-6 gap-y-1", cols === 2 ? "sm:grid-cols-2" : "")}>
      {items.map((i) => (
        <div key={i.label} className="flex items-baseline justify-between gap-3 border-b border-slate-100 py-1 text-[11.5px]">
          <dt className="text-slate-500">{i.label}</dt>
          <dd className="text-right font-medium text-slate-800">{i.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function SubHead({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-slate-700">{children}</h3>;
}

function Chain({ nodes }: { nodes: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {nodes.map((n, i) => (
        <div key={n} className="flex items-center gap-2">
          <span className="rounded-md border border-[#CFE0F3] bg-[#EFF4FB] px-2.5 py-1 text-[11.5px] font-medium text-[#1B4F91]">{n}</span>
          {i < nodes.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-slate-400" />}
        </div>
      ))}
    </div>
  );
}

/* ---------- tabs ---------- */

function OverviewTab({ step }: { step: ChangeStep }) {
  const [openPrereq, setOpenPrereq] = useState<string | null>(null);
  const isEbs = step.id === 4;

  return (
    <div className="space-y-5">
      <section>
        <SubHead>What This Step Does</SubHead>
        <p className="text-[12px] leading-relaxed text-slate-700">
          {isEbs
            ? "Modify the attached AWS EBS volume from 500 GB to 750 GB to provide additional capacity headroom while maintaining production availability."
            : step.description}
        </p>
      </section>

      {isEbs && (
        <>
          <section>
            <SubHead>Target Resource</SubHead>
            <KV items={TARGET_RESOURCE} />
          </section>

          <section>
            <SubHead>Execution Method</SubHead>
            <Chain nodes={["Terraform", "AWS Provider", "AWS EBS API", "EBS Control Plane"]} />
          </section>

          <section>
            <SubHead>Expected Result</SubHead>
            <KV items={EXPECTED_RESULT} />
            <p className="mt-2 rounded-md border border-[#CFE0F3] bg-[#EFF4FB] px-3 py-2 text-[11.5px] text-[#1B4F91]">
              No service interruption expected based on current eligibility checks.
            </p>
          </section>
        </>
      )}

      <section>
        <SubHead>Technology &amp; Artifacts</SubHead>
        <div className="flex flex-wrap gap-1.5">
          {step.technology.map((t) => (
            <span key={t} className="rounded border border-[#E2E8F0] bg-slate-50 px-2 py-0.5 text-[11px] text-slate-700">{t}</span>
          ))}
          {step.artifacts.map((a) => (
            <span key={a} className="rounded border border-[#E2E8F0] bg-white px-2 py-0.5 font-mono text-[11px] text-slate-700">{a}</span>
          ))}
        </div>
      </section>

      <section>
        <SubHead>Prerequisites</SubHead>
        <ul className="rounded-md border border-[#E2E8F0]">
          {PREREQUISITES.map((p) => {
            const open = openPrereq === p.label;
            return (
              <li key={p.label} className="border-b border-[#E2E8F0] last:border-b-0">
                <button
                  type="button"
                  onClick={() => setOpenPrereq(open ? null : p.label)}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left"
                >
                  {open ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
                  {p.ok
                    ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    : <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />}
                  <span className="text-[11.5px] text-slate-700">{p.label}</span>
                  <span className={cn("ml-auto text-[11px] font-medium", p.ok ? "text-emerald-700" : "text-amber-700")}>{p.result}</span>
                </button>
                {open && <div className="border-t border-[#E2E8F0] bg-slate-50 px-9 py-2 text-[11px] text-slate-600">{p.evidence}</div>}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function TerraformTab({ step }: { step: ChangeStep }) {
  const [diff, setDiff] = useState(false);

  if (step.layer === "windows") {
    return (
      <div className="space-y-4">
        <SubHead>Windows Engineering</SubHead>
        <p className="text-[12px] text-slate-700">
          This step executes inside the Windows guest operating system. Terraform is not used for guest filesystem mutation.
        </p>
        <Code lang={step.id === 5 ? "PowerShell — storage rescan" : "PowerShell — extend volume"} code={step.id === 5 ? POWERSHELL_RESCAN : POWERSHELL_EXTEND} />
        <KV
          items={[
            { label: "Target", value: "SQL-PROD-07" },
            { label: "Execution mechanism", value: "PowerShell Remoting / approved management channel" },
            { label: "Expected filesystem", value: "NTFS" },
            { label: "Current", value: "500 GB" },
            { label: "Expected", value: "750 GB" },
            { label: "Restart required", value: "No" },
          ]}
        />
      </div>
    );
  }

  if (step.layer === "sql") {
    return (
      <div className="space-y-4">
        <SubHead>SQL Engineering</SubHead>
        <Code lang={step.id === 2 ? "T-SQL — backup" : "T-SQL"} code={step.id === 2 ? SQL_BACKUP : SQL_PREFLIGHT} />
        {step.id === 2 && (
          <p className="rounded-md border border-[#E2E8F0] bg-slate-50 px-3 py-2 text-[11.5px] text-slate-600">
            ApprovedBackupTarget resolved at execution time. No production credentials or sensitive locations are stored in the change package.
          </p>
        )}
      </div>
    );
  }

  if (step.id !== 4) {
    return (
      <div className="space-y-4">
        <SubHead>Cross-Layer Artifacts</SubHead>
        <Code lang="T-SQL — post validation" code={SQL_POSTCHECK} />
        <ul className="grid gap-1 sm:grid-cols-2">
          {SQL_POST_CHECKLIST.map((c) => (
            <li key={c} className="flex items-center gap-2 text-[11.5px] text-slate-700">
              <Circle className="h-2 w-2 fill-slate-400 text-slate-400" />{c}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setDiff((d) => !d)} className="rounded-md border border-[#E2E8F0] bg-white px-2.5 py-1 text-[11.5px] font-medium text-slate-700 hover:bg-slate-50">
          {diff ? "View Code" : "View Diff"}
        </button>
        <button type="button" className="rounded-md border border-[#E2E8F0] bg-white px-2.5 py-1 text-[11.5px] text-slate-700 hover:bg-slate-50">Validate</button>
        <button type="button" className="rounded-md border border-[#E2E8F0] bg-white px-2.5 py-1 text-[11.5px] text-slate-700 hover:bg-slate-50">Regenerate</button>
        <button type="button" className="rounded-md border border-[#E2E8F0] bg-white px-2.5 py-1 text-[11.5px] text-slate-700 hover:bg-slate-50">View Repository</button>
      </div>

      {diff ? (
        <>
          <DiffBlock code={TERRAFORM_DIFF} />
          <KV
            cols={2}
            items={[
              { label: "Resources to Add", value: "0" },
              { label: "Resources to Change", value: "1" },
              { label: "Resources to Destroy", value: "0" },
              { label: "Plan", value: "0 to add, 1 to change, 0 to destroy" },
            ]}
          />
          <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11.5px] font-medium text-emerald-700">
            No destructive infrastructure operation detected.
          </p>
        </>
      ) : (
        <Code lang="HCL — ebs-volume.tf" code={TERRAFORM_CODE} />
      )}

      <KV items={[...TERRAFORM_META]} />
    </div>
  );
}

function AwsTab() {
  return (
    <div className="space-y-4">
      <SubHead>Control Plane Operation</SubHead>
      <KV
        items={[
          { label: "Service", value: "EC2" },
          { label: "Operation", value: "ModifyVolume" },
          { label: "Target", value: "vol-0a81f2c4e7b9d1234" },
          { label: "Invocation", value: "Modelled only — not executed" },
        ]}
      />
      <Code lang="JSON — modify-volume.json" code={AWS_PAYLOAD} />
      <SubHead>Expected Lifecycle</SubHead>
      <Chain nodes={["modifying", "optimizing", "completed"]} />
      <p className="rounded-md border border-[#E2E8F0] bg-slate-50 px-3 py-2 text-[11.5px] leading-relaxed text-slate-600">
        Terraform is the preferred declarative execution method. Direct AWS API invocation is retained as an orchestrated
        control-plane method where policy permits. This workspace does not call AWS.
      </p>
    </div>
  );
}

function ValidationTab() {
  const cats = ["SQL", "AWS", "Windows", "Application"] as const;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 text-[11.5px]">
        <span className="rounded-md border border-[#CFE0F3] bg-[#EFF4FB] px-2.5 py-1 font-medium text-[#1B4F91]">Total tests: {VALIDATIONS.length}</span>
        {cats.map((c) => (
          <span key={c} className="rounded-md border border-[#E2E8F0] bg-white px-2.5 py-1 text-slate-700">
            {c}: {VALIDATIONS.filter((v) => v.category === c).length}
          </span>
        ))}
      </div>
      {cats.map((c) => (
        <section key={c}>
          <SubHead>{c}</SubHead>
          <div className="overflow-x-auto rounded-md border border-[#E2E8F0]">
            <table className="w-full min-w-[720px] text-left text-[11.5px]">
              <thead className="bg-slate-50 text-[10.5px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-1.5 font-medium">Test</th>
                  <th className="px-3 py-1.5 font-medium">Precondition</th>
                  <th className="px-3 py-1.5 font-medium">Expected</th>
                  <th className="px-3 py-1.5 font-medium">On Failure</th>
                  <th className="px-3 py-1.5 font-medium">Evidence</th>
                </tr>
              </thead>
              <tbody>
                {VALIDATIONS.filter((v) => v.category === c).map((v) => (
                  <tr key={v.name} className="border-t border-[#E2E8F0] align-top">
                    <td className="px-3 py-1.5 font-medium text-slate-800">{v.name}</td>
                    <td className="px-3 py-1.5 text-slate-600">{v.precondition}</td>
                    <td className="px-3 py-1.5 text-slate-600">{v.expected}</td>
                    <td className="px-3 py-1.5 text-slate-600">{v.onFailure}</td>
                    <td className="px-3 py-1.5 text-slate-600">{v.evidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}

function RecoveryTab() {
  return (
    <div className="space-y-4">
      <h3 className="text-[13px] font-semibold text-slate-800">Recovery &amp; Compensating Actions</h3>
      <p className="text-[12px] leading-relaxed text-slate-700">
        Increasing an EBS volume is not directly reversible through an online volume shrink. Recovery is therefore based on
        compensating actions rather than simple reversal.
      </p>
      {RECOVERY_SECTIONS.map((s) => (
        <section key={s.title} className="rounded-md border border-[#E2E8F0] p-3">
          <SubHead>{s.title}</SubHead>
          <ul className="space-y-1">
            {s.items.map((i) => (
              <li key={i} className="flex gap-2 text-[11.5px] text-slate-700">
                <Circle className="mt-1.5 h-2 w-2 shrink-0 fill-slate-400 text-slate-400" />{i}
              </li>
            ))}
          </ul>
        </section>
      ))}
      <KV
        items={[
          { label: "Rollback Available", value: "Partial" },
          { label: "Compensating Actions", value: "Yes" },
          { label: "Destructive Automatic Rollback", value: "Disabled" },
        ]}
      />
    </div>
  );
}

function DependenciesTab({ step }: { step: ChangeStep }) {
  return (
    <div className="space-y-4">
      <SubHead>Validation Gates</SubHead>
      <p className="rounded-md border border-[#CFE0F3] bg-[#EFF4FB] px-3 py-2 text-[11.5px] text-[#1B4F91]">{step.gate}</p>
      <ol className="space-y-1.5">
        {STEPS.map((s) => (
          <li
            key={s.id}
            className={cn(
              "flex gap-3 rounded-md border px-3 py-2 text-[11.5px]",
              s.id === step.id ? "border-[#CFE0F3] bg-[#EFF4FB]" : "border-[#E2E8F0] bg-white",
            )}
          >
            <span className="mt-[1px] grid h-4 w-4 shrink-0 place-items-center rounded-full border border-slate-300 text-[10px] text-slate-600">{s.id}</span>
            <div>
              <div className="font-medium text-slate-800">{s.title}</div>
              <div className="text-slate-600">{s.gate}</div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function EvidenceTab({ step }: { step: ChangeStep }) {
  return (
    <div className="space-y-4">
      <SubHead>Evidence Capture</SubHead>
      <KV
        items={[
          { label: "Evidence manifest", value: "evidence-manifest.json" },
          { label: "Captured by", value: "Evidence Agent" },
          { label: "Retention", value: "Change record + audit archive" },
          { label: "Step", value: `${step.id} — ${step.title}` },
        ]}
      />
      <ul className="rounded-md border border-[#E2E8F0]">
        {[
          "Pre-change SQL, Windows and AWS state snapshots",
          "Generated artifacts with checksums and versions",
          "Terraform plan output and diff",
          "AWS control-plane request and response records",
          "Validation test results with evidence sources",
          "Approver identity, timestamp and policy decision",
        ].map((e) => (
          <li key={e} className="flex items-center gap-2 border-b border-[#E2E8F0] px-3 py-1.5 text-[11.5px] text-slate-700 last:border-b-0">
            <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />{e}
          </li>
        ))}
      </ul>
    </div>
  );
}

function DecisionTab() {
  return (
    <div className="space-y-3">
      <h3 className="text-[13px] font-semibold text-slate-800">Engineering Decisions</h3>
      {ENGINEERING_DECISIONS.map((d) => (
        <section key={d.area} className="rounded-md border border-[#E2E8F0] p-3">
          <div className="text-[12px] font-semibold text-slate-800">{d.area}</div>
          <div className="mt-1 text-[11.5px] text-slate-700"><span className="text-slate-500">Selected: </span>{d.selected}</div>
          <div className="mt-1 text-[11.5px] text-slate-700"><span className="text-slate-500">Reason: </span>{d.reason}</div>
          {d.alternative && (
            <div className="mt-1 text-[11.5px] text-slate-700">
              <span className="text-slate-500">Alternative: </span>{d.alternative} — <span className="text-slate-600">{d.status}</span>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

export function StepWorkspaceBody({ step, tab }: { step: ChangeStep; tab: StepTab }) {
  switch (tab) {
    case "Overview": return <OverviewTab step={step} />;
    case "Terraform": return <TerraformTab step={step} />;
    case "AWS API": return <AwsTab />;
    case "Validation": return <ValidationTab />;
    case "Recovery": return <RecoveryTab />;
    case "Dependencies": return <DependenciesTab step={step} />;
    case "Evidence": return <EvidenceTab step={step} />;
    case "Engineering Decision": return <DecisionTab />;
    default: return null;
  }
}
