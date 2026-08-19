// "Why this matters" — a small, in-place explanation of the causal chain that
// connects an infrastructure condition to the customer's own deployment.
//
// Nothing here is hand-written per object: the chain is generated from the
// dependency model (dependency layers + their `chain`), the correlation graph
// (which deployments/regions/risks an object touches) and the object's own
// current status. That keeps the language specific to the customer's estate
// instead of a generic technical description of the provider service.

import { useEffect, useRef, useState } from "react";
import { HelpCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { relatedKeys } from "./correlation";
import { dependencies, deployments, events, regions } from "./data";
import { riskSignals } from "./riskDetail";
import type { DependencyRow, HealthStatus } from "./types";

/* ------------------------------- generation ------------------------------- */

export interface WhyStep {
  /** The object in the chain, e.g. "Azure Blob Storage". */
  node: string;
  /** Relationship to the next node, e.g. "supports". */
  connector?: string;
  /** Optional plain-language qualifier under the node. */
  note?: string;
}

export interface WhyExplanation {
  steps: WhyStep[];
  conclusion: string;
  currentResult: string;
  currentStatus: HealthStatus;
  customerImpact: string;
  impactTone: "none" | "watch" | "impact";
}

/** Text inside the trailing parentheses of a description, if any. */
const paren = (s?: string) => {
  const m = s?.match(/\(([^)]+)\)\s*$/);
  return m?.[1];
};

/** How a dependency layer reads when describing a deployment's own services. */
const layerNoun: Record<string, string> = {
  Storage: "storage services",
  Compute: "compute capacity",
  Network: "network paths",
  "Service Layer": "service control and routing",
  "Azure Services": "platform dependencies",
  "Azure Region": "regional hosting",
  "Your Service": "customer-facing service",
};

const kindOf = (key: string) => key.split(":")[0];
const idOf = (key: string) => key.slice(key.indexOf(":") + 1);

/** Pick the most specific dependency layer related to an object. */
function anchorDependency(key: string, hint?: string): DependencyRow | undefined {
  const rel = [...relatedKeys(key)].filter((k) => kindOf(k) === "dependency").map(idOf);
  const pool = dependencies.filter((d) => rel.includes(d.id) && d.id !== "dep-your");
  if (hint) {
    const h = hint.toLowerCase();
    const direct = pool.find((d) => h.includes(d.layer.toLowerCase().split(" ")[0]));
    if (direct) return direct;
  }
  // Most specific = the layer that names an actual provider service.
  return pool.find((d) => paren(d.description)) ?? pool[0];
}

function relatedDeployments(key: string) {
  const rel = [...relatedKeys(key)].filter((k) => kindOf(k) === "deployment").map(idOf);
  return deployments.filter((d) => rel.includes(d.id));
}

const list = (xs: string[]) =>
  xs.length <= 1 ? (xs[0] ?? "") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;

const toneFor = (text: string): WhyExplanation["impactTone"] => {
  const t = text.toLowerCase();
  if (/(^|\b)(none|no impact|no current impact|no impact expected)/.test(t)) return "none";
  if (/(slower|degraded|impaired|failing|unavailable|errors|service impact)/.test(t)) return "impact";
  return "watch";
};

/**
 * Build the causal chain for any correlatable object:
 * `event:evt-…`, `dependency:dep-…`, `risk:risk-…`, `region:r-…`.
 */
export function buildWhy(objectKey: string): WhyExplanation | null {
  const kind = kindOf(objectKey);
  const id = idOf(objectKey);

  let source = "";
  let condition = "";
  let dep: DependencyRow | undefined;
  let deps = relatedDeployments(objectKey);
  let currentResult = "";
  let currentStatus: HealthStatus = "healthy";
  let customerImpact = "";
  let forwardLooking = false;

  if (kind === "event") {
    const e = events.find((x) => x.id === id);
    if (!e) return null;
    dep = anchorDependency(objectKey, e.affectedDependency);
    source = paren(e.affectedDependency) ?? e.affectedDependency;
    condition = `${e.kind.toLowerCase() === "incident" ? "this incident in" : "the condition observed in"} ${source}`;
    currentStatus = e.active === false ? "healthy" : e.status;
    currentResult =
      e.active === false
        ? "The condition is closed and the path has been restored."
        : (e.responseStatus ?? e.response ?? "Being monitored.");
    customerImpact = e.customerImpact ?? e.impactToYou ?? "None";
  } else if (kind === "dependency") {
    const d = dependencies.find((x) => x.id === id);
    if (!d) return null;
    dep = d.id === "dep-your" ? d : d;
    source = paren(d.description) ?? `${d.layer} — ${d.description}`;
    condition =
      d.status === "healthy"
        ? `this layer is behaving normally`
        : `the ${d.status === "at-risk" ? "watch condition" : "condition"} observed in ${source}`;
    currentStatus = d.status;
    currentResult = d.customerRelevance ?? "Behaving within expectations.";
    customerImpact = d.status === "healthy" ? "None." : "None reaching your users at this time.";
    if (deps.length === 0) {
      deps = deployments.filter((x) => relatedKeys(`deployment:${x.id}`).has(objectKey));
    }
  } else if (kind === "risk") {
    const r = riskSignals.find((x) => x.id === id);
    if (!r) return null;
    forwardLooking = true;
    dep = anchorDependency(objectKey, r.label);
    source = dep ? (paren(dep.description) ?? dep.layer) : r.label.replace(/ Risk$/, "");
    condition = `an emerging ${r.label.replace(/ Risk$/, "").toLowerCase()} condition in ${source}`;
    currentStatus = r.currentHealth ?? "healthy";
    currentResult = `${r.currentHealthLabel ?? "Service healthy"}. Observed trend: ${(r.trend ?? "Stable").toLowerCase()}${r.trendNote ? ` — ${r.trendNote.toLowerCase()}` : ""}.`;
    customerImpact = r.level === "Low" ? "None." : "None today — this is a risk signal, not an outcome.";
    const named = (r.affectedDeployments ?? []).filter((n) => !/^no deployment/i.test(n));
    if (named.length === 0) deps = [];
  } else if (kind === "region") {
    const reg = regions.find((x) => x.id === id);
    if (!reg) return null;
    dep = anchorDependency(objectKey) ?? dependencies.find((d) => d.id === "dep-region");
    source = `Azure ${reg.name} (${reg.geo})`;
    condition =
      reg.infraStatus === "healthy"
        ? `${source} is operating normally`
        : `the provider ${reg.infraStatus === "degraded" ? "degradation" : "advisory"} open in ${source}`;
    currentStatus = reg.hasDeployment ? reg.serviceStatus : "healthy";
    currentResult = reg.hasDeployment
      ? `${reg.serviceLabel} for ${reg.deploymentSummary} in this region.`
      : "No customer deployment in this region.";
    customerImpact = reg.hasDeployment ? "None." : "None — you run nothing here.";
    if (!reg.hasDeployment) deps = [];
    else if (deps.length === 0) deps = deployments.filter((d) => d.region === reg.name);
  } else {
    return null;
  }

  const depNames = deps.map((d) => d.name);
  const steps: WhyStep[] = [];

  if (depNames.length === 0) {
    steps.push({ node: source, connector: "supports" });
    steps.push({
      node: "no deployment of yours",
      note: "Nothing in your environment is built on this condition's path.",
      connector: "therefore",
    });
    return {
      steps,
      conclusion: `${condition.charAt(0).toUpperCase()}${condition.slice(1)} has no path into your service — it cannot reach your users.`,
      currentResult,
      currentStatus,
      customerImpact: customerImpact || "None.",
      impactTone: "none",
    };
  }

  const noun = layerNoun[dep?.layer ?? ""] ?? "supporting services";
  steps.push({ node: source, connector: "supports" });
  steps.push({
    node: `${list(depNames)} ${noun}`,
    note: dep?.customerRelevance,
    connector: "which support",
  });
  steps.push({
    node: `your managed service${deps[0]?.tier ? ` (${deps[0].tier})` : ""}`,
    connector: "therefore",
  });

  const verb = forwardLooking
    ? "could, if it continues, affect"
    : toneFor(customerImpact) === "impact"
      ? "is affecting"
      : "could affect";
  const conclusion = `${condition.charAt(0).toUpperCase()}${condition.slice(1)} ${verb} your ${list(depNames)} deployment${depNames.length > 1 ? "s" : ""}.`;

  return {
    steps,
    conclusion,
    currentResult,
    currentStatus,
    customerImpact: customerImpact || "None.",
    impactTone: toneFor(customerImpact),
  };
}

/* --------------------------------- the UI --------------------------------- */

const toneStyles: Record<WhyExplanation["impactTone"], string> = {
  none: "text-emerald-700",
  watch: "text-amber-700",
  impact: "text-red-600",
};

/**
 * Small "Why this matters" affordance. Rendered OUTSIDE the clickable card
 * body (never nested in a button) and opens an in-place explanation panel.
 */
export function WhyThisMatters({
  objectKey,
  className,
  align = "left",
}: {
  objectKey: string;
  className?: string;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const why = buildWhy(objectKey);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!why) return null;

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10.5px] font-medium text-slate-500 transition-colors hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
      >
        <HelpCircle className="h-3 w-3" aria-hidden />
        Why this matters
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div
            role="dialog"
            aria-label="Why this matters"
            className={cn(
              "absolute top-full z-50 mt-1.5 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white p-3 text-left shadow-xl shadow-slate-400/20",
              align === "right" ? "right-0" : "left-0",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Why this matters
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="-mr-1 -mt-1 rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <ol className="mt-2 space-y-0.5">
              {why.steps.map((s, i) => (
                <li key={i}>
                  <div className="rounded-md bg-slate-50 px-2 py-1.5 text-[11.5px] font-medium leading-snug text-slate-800">
                    {s.node}
                    {s.note && (
                      <span className="mt-0.5 block text-[10.5px] font-normal text-slate-500">{s.note}</span>
                    )}
                  </div>
                  {s.connector && (
                    <div className="py-0.5 pl-2 text-[10px] italic text-slate-400">↓ {s.connector}</div>
                  )}
                </li>
              ))}
              <li className="rounded-md border border-sky-200 bg-sky-50 px-2 py-1.5 text-[11.5px] leading-snug text-slate-800">
                {why.conclusion}
              </li>
            </ol>

            <div className="mt-2.5 grid gap-2 border-t border-slate-200 pt-2 sm:grid-cols-2">
              <div>
                <div className="text-[9.5px] uppercase tracking-[0.12em] text-slate-400">Current result</div>
                <p className="text-[11px] leading-snug text-slate-600">{why.currentResult}</p>
              </div>
              <div>
                <div className="text-[9.5px] uppercase tracking-[0.12em] text-slate-400">Customer impact</div>
                <p className={cn("text-[11px] font-medium leading-snug", toneStyles[why.impactTone])}>
                  {why.customerImpact}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
