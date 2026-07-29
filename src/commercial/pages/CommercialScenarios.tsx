import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Save, Star, Lock } from "lucide-react";
import { EmptyState } from "@/platform/components/States";
import { DirectionalBanner } from "@/commercial/components/DirectionalBanner";
import { SeedScenariosButton } from "@/commercial/components/SeedScenariosButton";
import {
  useProjectMomentousScenarios,
  type CommercialAssumption,
  type CommercialScenario,
} from "@/commercial/hooks/useProjectMomentousScenarios";
import { useCommercialAccess } from "@/commercial/hooks/useCommercialAccess";

type Group = { title: string; codes: string[] };

const RAMP_YEARS: { code: string; label: string }[] = [
  { code: "ACT_RAMP_FY2027", label: "FY2027" },
  { code: "ACT_RAMP_FY2028", label: "FY2028" },
  { code: "ACT_RAMP_FY2029", label: "FY2029" },
  { code: "ACT_RAMP_FY2030", label: "FY2030" },
  { code: "ACT_RAMP_FY2031", label: "FY2031" },
];

const GROUPS: Group[] = [
  {
    title: "Renewal & Growth",
    codes: [
      "RENEWAL_INFLUENCED_PCT",
      "INCR_ARR_GROWTH_PCT",
      "NON_FLEX_MIX_PCT",
      "MARKETPLACE_MIX_PCT",
    ],
  },
  {
    title: "Rebate & Growth Share",
    codes: [
      "BASE_RENEWAL_REBATE_PCT",
      "MARKETPLACE_REBATE_PCT",
      "NON_FLEX_EXPANSION_REBATE_PCT",
      "FLEX_MIGRATION_REBATE_PCT",
      "STRATEGIC_GROWTH_ACCEL_PCT",
      "ARR_PROXY_GROWTH_SHARE_PCT",
    ],
  },
  {
    title: "Services",
    codes: ["MS_ANNUAL_REV_PER_ACCT_USD", "PS_ONETIME_REV_PER_ACCT_USD", "MS_GROSS_MARGIN_PCT"],
  },
  {
    title: "Funding",
    codes: ["ACTIVATION_FUND_PER_ACCT_USD", "MDF_COSELL_ANNUAL_USD", "SUPPORT_READINESS_FUND_USD"],
  },
  {
    title: "Operating Scope",
    codes: ["L1_L2_SUPPORT_IN_SCOPE", "PAYMENT_LAG_DAYS"],
  },
];

const SCENARIO_ORDER = ["CONSERVATIVE", "BASE", "UPSIDE"];

function formatValue(a: CommercialAssumption | undefined): string {
  if (!a) return "—";
  if (a.unit === "ratio" && a.numeric_value != null)
    return `${(Number(a.numeric_value) * 100).toFixed(a.numeric_value % 0.01 ? 1 : 1)}%`;
  if (a.unit === "USD" && a.numeric_value != null)
    return `$${Number(a.numeric_value).toLocaleString()}`;
  if (a.unit === "accounts" && a.numeric_value != null) return `${a.numeric_value}`;
  if (a.unit === "days" && a.numeric_value != null) return `${a.numeric_value} days`;
  if (a.unit === "boolean") return a.text_value ?? (a.numeric_value ? "Yes" : "No");
  return a.text_value ?? (a.numeric_value?.toString() ?? "—");
}

function toInputValue(a: CommercialAssumption | undefined): string {
  if (!a) return "";
  if (a.unit === "ratio" && a.numeric_value != null)
    return (Number(a.numeric_value) * 100).toString();
  return a.numeric_value?.toString() ?? "";
}

function parseInputValue(raw: string, unit: string | null): number | null {
  if (raw.trim() === "") return null;
  const n = Number(raw);
  if (Number.isNaN(n)) return null;
  return unit === "ratio" ? n / 100 : n;
}

export default function CommercialScenarios() {
  const { data, isLoading } = useProjectMomentousScenarios();
  const { canManageScenario } = useCommercialAccess();
  const qc = useQueryClient();
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const scenarios = useMemo(
    () =>
      (data?.scenarios ?? [])
        .slice()
        .sort((a, b) => SCENARIO_ORDER.indexOf(a.code) - SCENARIO_ORDER.indexOf(b.code)),
    [data],
  );

  const byScenarioCode = useMemo(() => {
    const map = new Map<string, Map<string, CommercialAssumption>>();
    for (const s of scenarios) map.set(s.id, new Map());
    for (const a of data?.assumptions ?? []) map.get(a.scenario_id)?.set(a.assumption_code, a);
    return map;
  }, [scenarios, data]);

  const dirtyKeys = Object.keys(drafts).filter((k) => {
    const [scenarioId, code] = k.split("::");
    const a = byScenarioCode.get(scenarioId)?.get(code);
    const parsed = parseInputValue(drafts[k], a?.unit ?? null);
    return parsed !== (a?.numeric_value ?? null);
  });

  useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (dirtyKeys.length > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirtyKeys.length]);

  const save = useMutation({
    mutationFn: async () => {
      for (const k of dirtyKeys) {
        const [scenarioId, code] = k.split("::");
        const a = byScenarioCode.get(scenarioId)?.get(code);
        if (!a) continue;
        const parsed = parseInputValue(drafts[k], a.unit);
        const { error } = await supabase
          .from("commercial_scenario_assumptions")
          .update({ numeric_value: parsed })
          .eq("id", a.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(`Saved ${dirtyKeys.length} assumption change(s).`);
      setDrafts({});
      qc.invalidateQueries({ queryKey: ["commercial"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Save failed"),
  });

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading scenarios…</div>;
  if (scenarios.length === 0) {
    return (
      <div className="space-y-4">
        <DirectionalBanner />
        <div className="flex justify-end">
          <SeedScenariosButton />
        </div>
        <EmptyState
          title="No scenarios configured"
          description="Seed the Conservative, Base, and Upside scenarios for Project Momentous. Values are directional inputs from the revised P&L workbook."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DirectionalBanner />

      <Alert data-guide-target="scenarios-summary">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle className="text-xs uppercase tracking-wide">Directional caveat</AlertTitle>
        <AlertDescription>
          These are directional portfolio assumptions, not contractually approved values or
          validated account-level forecasts.
        </AlertDescription>
      </Alert>

      <Alert variant="default" className="border-dashed" data-guide-target="scenarios-validation">
        <AlertDescription className="text-xs">
          Financial calculation engine planned for the next Commercial modeling package. No P&L,
          EBITDA, cash-flow, NPV, or payback outputs are computed here.
        </AlertDescription>
      </Alert>

      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground" data-guide-target="scenarios-status">
          {canManageScenario ? "Editing enabled" : (
            <span className="inline-flex items-center gap-1">
              <Lock className="h-3 w-3" /> View-only (no scenario management permission)
            </span>
          )}
          {dirtyKeys.length > 0 && (
            <span className="ml-3 text-amber-600 font-medium">
              {dirtyKeys.length} unsaved change{dirtyKeys.length === 1 ? "" : "s"}
            </span>
          )}
        </div>
        <div className="flex gap-2" data-guide-target="scenarios-actions">
          <SeedScenariosButton />
          {canManageScenario && (
            <Button size="sm" onClick={() => save.mutate()} disabled={dirtyKeys.length === 0 || save.isPending}>
              <Save className="mr-1 h-4 w-4" />
              {save.isPending ? "Saving…" : "Save changes"}
            </Button>
          )}
        </div>
      </div>

      {/* Scenario cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-guide-target="scenarios-cards">
        {scenarios.map((s) => (
          <ScenarioCard key={s.id} scenario={s} />
        ))}
      </div>

      {/* Activation ramp */}
      <Card data-guide-target="scenarios-detail">
        <CardHeader>
          <CardTitle className="text-sm">Activation Ramp (cumulative accounts)</CardTitle>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-4">Fiscal Year</th>
                {scenarios.map((s) => (
                  <th key={s.id} className="py-2 pr-4">
                    {s.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RAMP_YEARS.map((y) => (
                <tr key={y.code} className="border-b last:border-0">
                  <td className="py-2 pr-4 font-medium">{y.label}</td>
                  {scenarios.map((s) => (
                    <td key={s.id} className="py-2 pr-4">
                      <AssumptionCell
                        assumption={byScenarioCode.get(s.id)?.get(y.code)}
                        editable={canManageScenario}
                        draft={drafts[`${s.id}::${y.code}`]}
                        onChange={(v) => setDrafts((d) => ({ ...d, [`${s.id}::${y.code}`]: v }))}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Assumption groups */}
      {GROUPS.map((g, gi) => (
        <Card key={g.title} data-guide-target={gi === 0 ? "scenarios-drivers" : undefined}>

          <CardHeader>
            <CardTitle className="text-sm">{g.title}</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-4">Assumption</th>
                  {scenarios.map((s) => (
                    <th key={s.id} className="py-2 pr-4">
                      {s.name}
                    </th>
                  ))}
                  <th className="py-2 pr-4">Confidence</th>
                  <th className="py-2 pr-4">Source</th>
                </tr>
              </thead>
              <tbody>
                {g.codes.map((code) => {
                  const sample = scenarios
                    .map((s) => byScenarioCode.get(s.id)?.get(code))
                    .find(Boolean);
                  return (
                    <tr key={code} className="border-b last:border-0 align-top">
                      <td className="py-2 pr-4">
                        <div className="font-medium">{sample?.label ?? code}</div>
                        <div className="font-mono text-[10px] text-muted-foreground">{code}</div>
                      </td>
                      {scenarios.map((s) => (
                        <td key={s.id} className="py-2 pr-4">
                          <AssumptionCell
                            assumption={byScenarioCode.get(s.id)?.get(code)}
                            editable={canManageScenario && code !== "L1_L2_SUPPORT_IN_SCOPE"}
                            draft={drafts[`${s.id}::${code}`]}
                            onChange={(v) => setDrafts((d) => ({ ...d, [`${s.id}::${code}`]: v }))}
                          />
                        </td>
                      ))}
                      <td className="py-2 pr-4">
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {sample?.confidence ?? "directional"}
                        </Badge>
                      </td>
                      <td className="py-2 pr-4 text-xs text-muted-foreground">SRC-002</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ScenarioCard({ scenario }: { scenario: CommercialScenario }) {
  return (
    <Card className={scenario.is_baseline ? "border-primary" : undefined}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-base">{scenario.name}</CardTitle>
          {scenario.is_baseline && (
            <Badge className="gap-1">
              <Star className="h-3 w-3" /> Baseline
            </Badge>
          )}
          <Badge variant="outline" className="font-mono text-[10px]">
            {scenario.code}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="text-muted-foreground" data-guide-target="scenarios-rationale">
          {scenario.description}
        </p>
        <div className="flex flex-wrap gap-2 text-[11px]">
          <Badge variant="secondary" className="capitalize">
            {scenario.status}
          </Badge>
          <Badge variant="outline" className="uppercase">
            {scenario.source_status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function AssumptionCell({
  assumption,
  editable,
  draft,
  onChange,
}: {
  assumption: CommercialAssumption | undefined;
  editable: boolean;
  draft?: string;
  onChange: (v: string) => void;
}) {
  if (!assumption) return <span className="text-muted-foreground">—</span>;
  const currentInput = draft ?? toInputValue(assumption);
  const parsed = parseInputValue(currentInput, assumption.unit);
  const isDirty = draft !== undefined && parsed !== assumption.numeric_value;
  if (!editable) {
    return <span className="tabular-nums">{formatValue(assumption)}</span>;
  }
  return (
    <div className="flex items-center gap-1">
      <Input
        className={`h-7 w-24 text-sm tabular-nums ${isDirty ? "border-amber-400" : ""}`}
        value={currentInput}
        onChange={(e) => onChange(e.target.value)}
      />
      <span className="text-xs text-muted-foreground">
        {assumption.unit === "ratio" ? "%" : assumption.unit === "USD" ? "$" : assumption.unit}
      </span>
    </div>
  );
}
