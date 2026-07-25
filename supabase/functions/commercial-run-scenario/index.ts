// BP3.2 / BP3.3 — Commercial run engine (Project Momentous)
// Server-authoritative: implements VOL-*, REV-*, COD-*, OPEX-*, PL-* domains.
// Cash and sensitivity remain out of scope.


import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ---------- Fiscal calendar ----------
const FISCAL_YEARS = ["FY2027", "FY2028", "FY2029", "FY2030", "FY2031"] as const;
type FY = (typeof FISCAL_YEARS)[number];

// ---------- Assumption map helper ----------
type Assumption = { assumption_code: string; numeric_value: number | null };
type AssumptionMap = Record<string, number>;

function toMap(rows: Assumption[]): AssumptionMap {
  const m: AssumptionMap = {};
  for (const r of rows) {
    if (r.numeric_value !== null && r.numeric_value !== undefined) {
      m[r.assumption_code] = Number(r.numeric_value);
    }
  }
  return m;
}

function need(m: AssumptionMap, code: string): number {
  if (!/^[A-Z0-9_]+_FY20\d{2}(_[A-Z]+)?$|^[A-Z0-9_]+$/.test(code)) {
    throw new Error(`malformed_assumption_key:${code}`);
  }
  const fyMatch = code.match(/FY(\d+)/);
  if (fyMatch && fyMatch[1].length !== 4) {
    throw new Error(`malformed_assumption_key:${code}`);
  }
  if (!(code in m)) throw new Error(`missing_assumption:${code}`);
  return m[code];
}

function requiredKeys(): string[] {
  const keys: string[] = [
    "CONV_REBATE_PCT","CONV_EXPAND_PCT","CONV_MS_PCT",
    "AVG_ARR_PER_CUSTOMER_MUSD","INCR_ARR_GROWTH_PCT","RENEWAL_INFLUENCED_PCT",
    "BASE_RENEWAL_REBATE_PCT","MARKETPLACE_MIX_PCT","MARKETPLACE_REBATE_PCT",
    "NON_FLEX_MIX_PCT","NON_FLEX_EXPANSION_REBATE_PCT","FLEX_MIGRATION_REBATE_PCT",
    "STRATEGIC_GROWTH_ACCEL_PCT","GROWTH_ACCEL_THRESHOLD_PCT","ARR_PROXY_GROWTH_SHARE_PCT",
    "ACTIVATION_FUND_PER_ACCT_USD","MDF_COSELL_ANNUAL_USD","SUPPORT_READINESS_FUND_USD",
    "MS_ANNUAL_REV_PER_ACCT_USD","PS_ONETIME_REV_PER_ACCT_USD","COST_ESCALATOR_PCT",
  ];
  for (const fy of FISCAL_YEARS) {
    keys.push(`ACT_RAMP_${fy}`);
    keys.push(`EAR_POOL_${fy}_MUSD`);
  }
  return keys;
}

function checkCompleteness(m: AssumptionMap): string[] {
  return requiredKeys().filter((k) => !(k in m));
}

// ---------- P&L scope helpers (BP3.3) ----------
const COD_CODES = [
  "COD_01_POD_LEAD","COD_02_CS_LEAD","COD_03_SA","COD_04_HC_SME",
  "COD_05_SVC_PRE","COD_06_L1L2","COD_07_DATA","COD_08_PMO",
  "COD_09_DEL_LEAD","COD_09B_DEL_VAR","COD_10_TOOLS","COD_11_TRAVEL",
] as const;
const OPEX_CODES = [
  "OPEX_01_GM","OPEX_02_ALLIANCE","OPEX_03_FIN","OPEX_04_LEGAL",
  "OPEX_05_MKT","OPEX_06_TRAINING","OPEX_07_TRAVEL","OPEX_08_GA",
  "OPEX_09_TOOLS","OPEX_10_RECRUIT",
] as const;
const COD_LABELS: Record<string, string> = {
  COD_01_POD_LEAD: "1. Account Pod Lead",
  COD_02_CS_LEAD: "2. Customer Success / Adoption Lead",
  COD_03_SA: "3. Citrix Solution Architect",
  COD_04_HC_SME: "4. Healthcare Workflow SME",
  COD_05_SVC_PRE: "5. Services Attach / Pre-Sales Lead",
  COD_06_L1L2: "6. L1/L2 Support Resources",
  COD_07_DATA: "7. Data / RevOps Analyst",
  COD_08_PMO: "8. Program Manager / PMO",
  COD_09_DEL_LEAD: "9. Delivery Lead — MS (base FTE)",
  COD_09B_DEL_VAR: "9b. Delivery Resources — MS (variable)",
  COD_10_TOOLS: "10. Third-Party Tools & Infrastructure",
  COD_11_TRAVEL: "11. Travel & Customer Workshops",
};
const OPEX_LABELS: Record<string, string> = {
  OPEX_01_GM: "1. Executive Sponsor / Program GM",
  OPEX_02_ALLIANCE: "2. Alliance Management",
  OPEX_03_FIN: "3. Finance & Deal Operations",
  OPEX_04_LEGAL: "4. Legal & Contracting",
  OPEX_05_MKT: "5. Marketing / Customer Materials",
  OPEX_06_TRAINING: "6. Training & Certification",
  OPEX_07_TRAVEL: "7. Non-delivery Travel",
  OPEX_08_GA: "8. G&A Allocation",
  OPEX_09_TOOLS: "9. Internal Systems & Tooling",
  OPEX_10_RECRUIT: "10. Recruiting / Hiring",
};

function pnlRequiredKeys(): string[] {
  const keys: string[] = [];
  for (const fy of FISCAL_YEARS) {
    for (const c of COD_CODES) keys.push(`${c}_${fy}`);
    for (const o of OPEX_CODES) keys.push(`${o}_${fy}`);
    keys.push(`POD_FTE_${fy}`);
  }
  return keys;
}
function checkPnlCompleteness(m: AssumptionMap): string[] {
  return pnlRequiredKeys().filter((k) => !(k in m));
}



// ---------- Engine ----------
type ResultRow = {
  metric_code: string;
  metric_group: string;
  formula_code: string;
  fiscal_period: string;
  period_sequence: number;
  value_numeric: number | null;
  value_text?: string | null;
  unit: string;
  lineage_json: Record<string, unknown>;
  is_approximation?: boolean;
};

function computeRevenueScope(a: AssumptionMap): ResultRow[] {
  const out: ResultRow[] = [];

  // Volume drivers
  const cum: number[] = FISCAL_YEARS.map((fy) =>
    need(a, `ACT_RAMP_${fy}`),
  );
  const newAct: number[] = cum.map((v, i) => (i === 0 ? v : v - cum[i - 1]));
  const convRebate = cum.map((v) => Math.round(v * need(a, "CONV_REBATE_PCT")));
  const convExpand = cum.map((v) => Math.round(v * need(a, "CONV_EXPAND_PCT")));
  const convMs = cum.map((v) => Math.round(v * need(a, "CONV_MS_PCT")));

  const avgArr = need(a, "AVG_ARR_PER_CUSTOMER_MUSD");
  const incrPct = need(a, "INCR_ARR_GROWTH_PCT");
  const renewInfl = need(a, "RENEWAL_INFLUENCED_PCT");
  const earPool = FISCAL_YEARS.map((fy) =>
    need(a, `EAR_POOL_${fy}_MUSD`),
  );


  const actArr = cum.map((v) => v * avgArr * 1_000_000);
  const incrArr = actArr.map((v) => v * incrPct);
  const newActArr = newAct.map((v) => v * avgArr * 1_000_000);
  const earInfl = earPool.map((v) => v * 1_000_000 * renewInfl);

  // Revenue-stream rates
  const baseRebate = need(a, "BASE_RENEWAL_REBATE_PCT");
  const mktMix = need(a, "MARKETPLACE_MIX_PCT");
  const mktReb = need(a, "MARKETPLACE_REBATE_PCT");
  const nflexMix = need(a, "NON_FLEX_MIX_PCT");
  const nflexReb = need(a, "NON_FLEX_EXPANSION_REBATE_PCT");
  const flexReb = need(a, "FLEX_MIGRATION_REBATE_PCT");
  const growthAccelPct = need(a, "STRATEGIC_GROWTH_ACCEL_PCT");
  const growthAccelThr = need(a, "GROWTH_ACCEL_THRESHOLD_PCT");
  const growthShare = need(a, "ARR_PROXY_GROWTH_SHARE_PCT");
  const actFundPer = need(a, "ACTIVATION_FUND_PER_ACCT_USD");
  const mdfAnn = need(a, "MDF_COSELL_ANNUAL_USD");
  const supRead = need(a, "SUPPORT_READINESS_FUND_USD");
  const msRev = need(a, "MS_ANNUAL_REV_PER_ACCT_USD");
  const psRev = need(a, "PS_ONETIME_REV_PER_ACCT_USD");
  const esc = need(a, "COST_ESCALATOR_PCT");

  const push = (
    row: Omit<ResultRow, "period_sequence" | "fiscal_period"> & {
      fy: FY;
      yi: number;
    },
  ) => {
    const { fy, yi, ...rest } = row;
    out.push({
      ...rest,
      fiscal_period: fy,
      period_sequence: yi,
    });
  };

  // Volume rows + 5-yr totals
  const emitAnnual = (
    codePrefix: { code: string; formula: string; group: string; unit: string },
    values: number[],
    lineageEach: (i: number) => Record<string, unknown>,
    totalMode: "SUM" | "LAST" | "NONE" = "SUM",
  ) => {
    values.forEach((v, i) => {
      push({
        fy: FISCAL_YEARS[i],
        yi: i,
        metric_code: codePrefix.code,
        metric_group: codePrefix.group,
        formula_code: codePrefix.formula,
        value_numeric: v,
        unit: codePrefix.unit,
        lineage_json: lineageEach(i),
      });
    });
    if (totalMode !== "NONE") {
      const total =
        totalMode === "SUM" ? values.reduce((s, v) => s + v, 0) : values[values.length - 1];
      out.push({
        metric_code: codePrefix.code,
        metric_group: codePrefix.group,
        formula_code: codePrefix.formula,
        fiscal_period: "FY2027-FY2031",
        period_sequence: 99,
        value_numeric: total,
        unit: codePrefix.unit,
        lineage_json: { total_mode: totalMode, source_col: "H (5-yr total)" },
      });
    }
  };

  emitAnnual(
    { code: "VOL-CUM-ACT", formula: "VOL-CUM-ACT", group: "volume", unit: "accounts" },
    cum,
    (i) => ({ input: `ACT_RAMP_${FISCAL_YEARS[i]}`, value: cum[i] }),
    "LAST",

  );
  emitAnnual(
    { code: "VOL-NEW-ACT", formula: "VOL-NEW-ACT", group: "volume", unit: "accounts" },
    newAct,
    (i) => ({
      formula: i === 0 ? "cum[0]" : "cum[i] - cum[i-1]",
      cum: cum[i],
      prev_cum: i === 0 ? 0 : cum[i - 1],
    }),
    "SUM",
  );
  emitAnnual(
    { code: "VOL-CONV-REBATE", formula: "VOL-CONV-REBATE", group: "volume", unit: "accounts" },
    convRebate,
    (i) => ({
      formula: "ROUND(cum * CONV_REBATE_PCT, 0)",
      cum: cum[i],
      CONV_REBATE_PCT: a["CONV_REBATE_PCT"],
    }),
    "LAST",
  );
  emitAnnual(
    { code: "VOL-CONV-EXPAND", formula: "VOL-CONV-EXPAND", group: "volume", unit: "accounts" },
    convExpand,
    (i) => ({
      formula: "ROUND(cum * CONV_EXPAND_PCT, 0)",
      cum: cum[i],
      CONV_EXPAND_PCT: a["CONV_EXPAND_PCT"],
    }),
    "LAST",
  );
  emitAnnual(
    { code: "VOL-CONV-MS", formula: "VOL-CONV-MS", group: "volume", unit: "accounts" },
    convMs,
    (i) => ({
      formula: "ROUND(cum * CONV_MS_PCT, 0)",
      cum: cum[i],
      CONV_MS_PCT: a["CONV_MS_PCT"],
    }),
    "LAST",
  );

  // Activation ARR (revenue base)
  emitAnnual(
    { code: "REV-ACT-ARR", formula: "REV-ACT-ARR", group: "revenue_base", unit: "USD" },
    actArr,
    (i) => ({
      formula: "VOL-CUM-ACT * AVG_ARR_PER_CUSTOMER_MUSD * 1e6",
      cum: cum[i],
      avg_arr_musd: avgArr,
    }),
    "LAST",
  );
  emitAnnual(
    { code: "REV-INCR-ARR", formula: "REV-INCR-ARR", group: "revenue_base", unit: "USD" },
    incrArr,
    (i) => ({
      formula: "REV-ACT-ARR * INCR_ARR_GROWTH_PCT",
      act_arr: actArr[i],
      INCR_ARR_GROWTH_PCT: incrPct,
    }),
    "SUM",
  );
  emitAnnual(
    { code: "REV-NEW-ACT-ARR", formula: "REV-NEW-ACT-ARR", group: "revenue_base", unit: "USD" },
    newActArr,
    (i) => ({
      formula: "VOL-NEW-ACT * AVG_ARR_PER_CUSTOMER_MUSD * 1e6",
      new_act: newAct[i],
      avg_arr_musd: avgArr,
    }),
    "SUM",
  );
  emitAnnual(
    { code: "REV-EAR-INFLUENCED", formula: "REV-EAR-INFLUENCED", group: "revenue_base", unit: "USD" },
    earInfl,
    (i) => ({
      formula: "EAR_POOL_FYn_MUSD * 1e6 * RENEWAL_INFLUENCED_PCT",
      ear_pool_musd: earPool[i],
      RENEWAL_INFLUENCED_PCT: renewInfl,
    }),
    "SUM",
  );

  // Revenue streams
  const rev01 = earInfl.map((v) => v * baseRebate);
  const rev02 = newActArr.map((v) => v * mktMix * mktReb);
  const rev03 = incrArr.map((v) => v * nflexMix * nflexReb);
  const rev04 = incrArr.map((v) => v * (1 - nflexMix) * flexReb);
  const rev05 = incrArr.map((v) =>
    incrPct > growthAccelThr ? v * growthAccelPct : 0,
  );
  const rev06 = incrArr.map((v) => v * growthShare);
  const rev07 = newAct.map((v) => v * actFundPer);
  const rev08 = FISCAL_YEARS.map(() => mdfAnn);
  const rev09 = FISCAL_YEARS.map(() => supRead);
  const rev10 = convMs.map((v, i) => v * msRev * Math.pow(1 + esc, i));
  const rev11 = newAct.map((v) => v * psRev);

  emitAnnual(
    { code: "REV-01-BASE-REB", formula: "REV-01-BASE-REB", group: "revenue_stream", unit: "USD" },
    rev01,
    (i) => ({
      formula: "REV-EAR-INFLUENCED * BASE_RENEWAL_REBATE_PCT",
      ear_influenced: earInfl[i],
      BASE_RENEWAL_REBATE_PCT: baseRebate,
    }),
  );
  emitAnnual(
    { code: "REV-02-MKT-REB", formula: "REV-02-MKT-REB", group: "revenue_stream", unit: "USD" },
    rev02,
    (i) => ({
      formula: "REV-NEW-ACT-ARR * MARKETPLACE_MIX_PCT * MARKETPLACE_REBATE_PCT",
      new_act_arr: newActArr[i],
      MARKETPLACE_MIX_PCT: mktMix,
      MARKETPLACE_REBATE_PCT: mktReb,
    }),
  );
  emitAnnual(
    { code: "REV-03-NFLEX-REB", formula: "REV-03-NFLEX-REB", group: "revenue_stream", unit: "USD" },
    rev03,
    (i) => ({
      formula: "REV-INCR-ARR * NON_FLEX_MIX_PCT * NON_FLEX_EXPANSION_REBATE_PCT",
      incr_arr: incrArr[i],
      NON_FLEX_MIX_PCT: nflexMix,
      NON_FLEX_EXPANSION_REBATE_PCT: nflexReb,
    }),
  );
  emitAnnual(
    { code: "REV-04-FLEX-REB", formula: "REV-04-FLEX-REB", group: "revenue_stream", unit: "USD" },
    rev04,
    (i) => ({
      formula: "REV-INCR-ARR * (1 - NON_FLEX_MIX_PCT) * FLEX_MIGRATION_REBATE_PCT",
      incr_arr: incrArr[i],
      NON_FLEX_MIX_PCT: nflexMix,
      FLEX_MIGRATION_REBATE_PCT: flexReb,
    }),
  );
  emitAnnual(
    { code: "REV-05-GROWTH-ACCEL", formula: "REV-05-GROWTH-ACCEL", group: "revenue_stream", unit: "USD" },
    rev05,
    (i) => ({
      formula:
        "IF(INCR_ARR_GROWTH_PCT > GROWTH_ACCEL_THRESHOLD_PCT, REV-INCR-ARR * STRATEGIC_GROWTH_ACCEL_PCT, 0)",
      INCR_ARR_GROWTH_PCT: incrPct,
      threshold: growthAccelThr,
      triggered: incrPct > growthAccelThr,
      incr_arr: incrArr[i],
      STRATEGIC_GROWTH_ACCEL_PCT: growthAccelPct,
    }),
  );
  emitAnnual(
    { code: "REV-06-GROWTH-SHARE", formula: "REV-06-GROWTH-SHARE", group: "revenue_stream", unit: "USD" },
    rev06,
    (i) => ({
      formula: "REV-INCR-ARR * ARR_PROXY_GROWTH_SHARE_PCT (Model 2)",
      incr_arr: incrArr[i],
      ARR_PROXY_GROWTH_SHARE_PCT: growthShare,
      approximation: "APX-01 (Growth-Share Model 2 selected per workbook)",
    }),
  );
  emitAnnual(
    { code: "REV-07-ACT-FUND", formula: "REV-07-ACT-FUND", group: "revenue_stream", unit: "USD" },
    rev07,
    (i) => ({
      formula: "VOL-NEW-ACT * ACTIVATION_FUND_PER_ACCT_USD",
      new_act: newAct[i],
      ACTIVATION_FUND_PER_ACCT_USD: actFundPer,
    }),
  );
  emitAnnual(
    { code: "REV-08-MDF", formula: "REV-08-MDF", group: "revenue_stream", unit: "USD" },
    rev08,
    () => ({ formula: "MDF_COSELL_ANNUAL_USD (flat)", value: mdfAnn }),
  );
  emitAnnual(
    { code: "REV-09-SUP-READ", formula: "REV-09-SUP-READ", group: "revenue_stream", unit: "USD" },
    rev09,
    () => ({ formula: "SUPPORT_READINESS_FUND_USD (flat)", value: supRead }),
  );
  emitAnnual(
    { code: "REV-10-MS", formula: "REV-10-MS", group: "revenue_stream", unit: "USD" },
    rev10,
    (i) => ({
      formula: "VOL-CONV-MS * MS_ANNUAL_REV_PER_ACCT_USD * (1+esc)^year_index",
      conv_ms: convMs[i],
      MS_ANNUAL_REV_PER_ACCT_USD: msRev,
      escalator: esc,
      year_index: i,
      note: "Services revenue — kept separate from license economics per BP3.0 §rule-10",
    }),
  );
  emitAnnual(
    { code: "REV-11-PS", formula: "REV-11-PS", group: "revenue_stream", unit: "USD" },
    rev11,
    (i) => ({
      formula: "VOL-NEW-ACT * PS_ONETIME_REV_PER_ACCT_USD",
      new_act: newAct[i],
      PS_ONETIME_REV_PER_ACCT_USD: psRev,
      note: "Professional services revenue — kept separate from license economics per BP3.0 §rule-10",
    }),
  );

  // Total revenue
  const revTotal = FISCAL_YEARS.map(
    (_, i) =>
      rev01[i] + rev02[i] + rev03[i] + rev04[i] + rev05[i] + rev06[i] +
      rev07[i] + rev08[i] + rev09[i] + rev10[i] + rev11[i],
  );
  emitAnnual(
    { code: "REV-TOTAL", formula: "REV-TOTAL", group: "revenue_total", unit: "USD" },
    revTotal,
    (i) => ({ formula: "SUM(REV-01..REV-11)", period: FISCAL_YEARS[i] }),
  );

  return out;
}

// ---------- P&L Scope Engine (BP3.3) ----------
function computePnlScope(
  a: AssumptionMap,
  revTotalByFy: Record<string, number>,
  revenueRunId: string,
): ResultRow[] {
  const out: ResultRow[] = [];

  const push = (row: Omit<ResultRow, "period_sequence" | "fiscal_period"> & { fy: string; yi: number }) => {
    const { fy, yi, ...rest } = row;
    out.push({ ...rest, fiscal_period: fy, period_sequence: yi });
  };

  const codPerFy: number[] = [];
  const opexPerFy: number[] = [];
  const revPerFy: number[] = FISCAL_YEARS.map((fy) => revTotalByFy[fy]);

  // Emit per-line COD rows + running totals
  FISCAL_YEARS.forEach((fy, i) => {
    let codSum = 0;
    for (const code of COD_CODES) {
      const key = `${code}_${fy}`;
      const v = need(a, key);
      codSum += v;
      push({
        fy, yi: i,
        metric_code: `COD-${code.replace(/^COD_/, "")}`,
        metric_group: "cost_of_delivery",
        formula_code: "COD-LINE",
        value_numeric: v,
        unit: "USD",
        lineage_json: { input: key, label: COD_LABELS[code] },
      });
    }
    codPerFy.push(codSum);
    push({
      fy, yi: i,
      metric_code: "COD-TOTAL",
      metric_group: "cost_of_delivery_total",
      formula_code: "COD-TOTAL",
      value_numeric: codSum,
      unit: "USD",
      lineage_json: { formula: "SUM(COD_01..COD_11)", inputs_count: COD_CODES.length },
    });

    let opexSum = 0;
    for (const code of OPEX_CODES) {
      const key = `${code}_${fy}`;
      const v = need(a, key);
      opexSum += v;
      push({
        fy, yi: i,
        metric_code: `OPEX-${code.replace(/^OPEX_/, "")}`,
        metric_group: "operating_expense",
        formula_code: "OPEX-LINE",
        value_numeric: v,
        unit: "USD",
        lineage_json: { input: key, label: OPEX_LABELS[code] },
      });
    }
    opexPerFy.push(opexSum);
    push({
      fy, yi: i,
      metric_code: "OPEX-TOTAL",
      metric_group: "operating_expense_total",
      formula_code: "OPEX-TOTAL",
      value_numeric: opexSum,
      unit: "USD",
      lineage_json: { formula: "SUM(OPEX_01..OPEX_10)", inputs_count: OPEX_CODES.length },
    });

    // Pod FTE memo
    push({
      fy, yi: i,
      metric_code: "POD-FTE",
      metric_group: "staffing",
      formula_code: "POD-FTE",
      value_numeric: need(a, `POD_FTE_${fy}`),
      unit: "FTE",
      lineage_json: { input: `POD_FTE_${fy}` },
    });
  });

  // Derived P&L rows
  FISCAL_YEARS.forEach((fy, i) => {
    const rev = revPerFy[i];
    const cod = codPerFy[i];
    const opex = opexPerFy[i];
    const gp = rev - cod;
    const gmPct = rev !== 0 ? gp / rev : 0;
    const ebitda = gp - opex;
    const ebitdaPct = rev !== 0 ? ebitda / rev : 0;

    push({
      fy, yi: i,
      metric_code: "PL-GROSS-PROFIT",
      metric_group: "pnl",
      formula_code: "PL-GROSS-PROFIT",
      value_numeric: gp,
      unit: "USD",
      lineage_json: { formula: "REV-TOTAL - COD-TOTAL", rev_total: rev, cod_total: cod, revenue_run_id: revenueRunId },
    });
    push({
      fy, yi: i,
      metric_code: "PL-GROSS-MARGIN-PCT",
      metric_group: "pnl",
      formula_code: "PL-GROSS-MARGIN-PCT",
      value_numeric: gmPct,
      unit: "ratio",
      lineage_json: { formula: "GROSS_PROFIT / REV-TOTAL", gross_profit: gp, rev_total: rev },
    });
    push({
      fy, yi: i,
      metric_code: "PL-EBITDA",
      metric_group: "pnl",
      formula_code: "PL-EBITDA",
      value_numeric: ebitda,
      unit: "USD",
      lineage_json: { formula: "GROSS_PROFIT - OPEX-TOTAL", gross_profit: gp, opex_total: opex },
    });
    push({
      fy, yi: i,
      metric_code: "PL-EBITDA-MARGIN-PCT",
      metric_group: "pnl",
      formula_code: "PL-EBITDA-MARGIN-PCT",
      value_numeric: ebitdaPct,
      unit: "ratio",
      lineage_json: { formula: "EBITDA / REV-TOTAL", ebitda, rev_total: rev },
    });
  });

  // 5-year totals
  const totalRow = (code: string, group: string, value: number, unit: string, lineage: Record<string, unknown>) =>
    out.push({
      metric_code: code, metric_group: group, formula_code: code,
      fiscal_period: "FY2027-FY2031", period_sequence: 99,
      value_numeric: value, unit, lineage_json: lineage,
    });
  const sum = (arr: number[]) => arr.reduce((s, v) => s + v, 0);
  const totRev = sum(revPerFy);
  const totCod = sum(codPerFy);
  const totOpex = sum(opexPerFy);
  const totGp = totRev - totCod;
  const totEbitda = totGp - totOpex;
  totalRow("COD-TOTAL", "cost_of_delivery_total", totCod, "USD", { total_mode: "SUM" });
  totalRow("OPEX-TOTAL", "operating_expense_total", totOpex, "USD", { total_mode: "SUM" });
  totalRow("PL-GROSS-PROFIT", "pnl", totGp, "USD", { formula: "SUM(FY GP)" });
  totalRow("PL-GROSS-MARGIN-PCT", "pnl", totRev !== 0 ? totGp / totRev : 0, "ratio", { formula: "TOT_GP / TOT_REV" });
  totalRow("PL-EBITDA", "pnl", totEbitda, "USD", { formula: "SUM(FY EBITDA)" });
  totalRow("PL-EBITDA-MARGIN-PCT", "pnl", totRev !== 0 ? totEbitda / totRev : 0, "ratio", { formula: "TOT_EBITDA / TOT_REV" });

  return out;
}


Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.toLowerCase().startsWith("bearer ")) {
    return json({ error: "auth_required" }, 401);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Verify user
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData?.user) return json({ error: "auth_required" }, 401);

  let body: { program_id?: string; model_version_id?: string; scenario_ids?: string[] };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }
  if (!body.program_id || !body.model_version_id) {
    return json({ error: "program_id and model_version_id are required" }, 400);
  }

  // Resolve scenarios
  const scenarioIds =
    body.scenario_ids && body.scenario_ids.length > 0
      ? body.scenario_ids
      : (
          await supabase
            .from("commercial_scenarios")
            .select("id")
            .eq("program_id", body.program_id)
            .eq("status", "active")
        ).data?.map((r) => r.id as string) ?? [];

  if (scenarioIds.length === 0) return json({ error: "no_scenarios" }, 404);

  const results: Array<Record<string, unknown>> = [];
  for (const scenarioId of scenarioIds) {
    const runOutcome = await runOne(supabase, body.program_id, scenarioId, body.model_version_id);
    results.push(runOutcome);
  }

  return json({ runs: results }, 200);
});

async function runOne(
  supabase: ReturnType<typeof createClient>,
  program_id: string,
  scenario_id: string,
  model_version_id: string,
) {
  // 1. Start (idempotent — reuses completed identical run)
  const { data: startRes, error: startErr } = await supabase.rpc(
    "commercial_model_run_start",
    {
      _program_id: program_id,
      _scenario_id: scenario_id,
      _model_version_id: model_version_id,
      _run_scope: "revenue",
    },
  );
  if (startErr) return { scenario_id, error: mapErr(startErr.message) };
  const run_id = (startRes as { run_id: string; reused: boolean }).run_id;
  const reused = (startRes as { reused: boolean }).reused;
  if (reused) return { scenario_id, run_id, reused: true };

  try {
    // 2. Load assumptions (canonical values for engine)
    const { data: assumptions, error: aErr } = await supabase
      .from("commercial_scenario_assumptions")
      .select("assumption_code, numeric_value")
      .eq("scenario_id", scenario_id);
    if (aErr) throw new Error(aErr.message);
    const map = toMap(assumptions ?? []);

    // 2b. Pre-run completeness check (fail fast, don't corrupt prior runs)
    const missing = checkCompleteness(map);
    if (missing.length > 0) {
      throw new Error(`missing_assumption:${missing.join(",")}`);
    }

    // 3. Compute
    const rows = computeRevenueScope(map);


    // 4. Mark running
    const { error: mrErr } = await supabase.rpc("commercial_model_run_mark_running", {
      _run_id: run_id,
    });
    if (mrErr) throw new Error(mrErr.message);

    // 5. Persist all results
    const { error: pErr } = await supabase.rpc(
      "commercial_model_run_persist_results_batch",
      { _run_id: run_id, _results: rows },
    );
    if (pErr) throw new Error(pErr.message);

    // 6. Complete
    const { error: cErr } = await supabase.rpc("commercial_model_run_complete", {
      _run_id: run_id,
    });
    if (cErr) throw new Error(cErr.message);

    return { scenario_id, run_id, reused: false, metrics_written: rows.length };
  } catch (e) {
    const msg = (e as Error).message;
    await supabase.rpc("commercial_model_run_fail", {
      _run_id: run_id,
      _error_code: mapErrCode(msg),
      _error_message: msg.slice(0, 500),
    });
    return { scenario_id, run_id, error: mapErr(msg) };
  }
}

function mapErrCode(msg: string): string {
  if (msg.startsWith("missing_assumption:")) return "MISSING_INPUT";
  if (msg.includes("permission_denied")) return "FORBIDDEN";
  if (msg.includes("model_version_not_found")) return "STALE_MODEL_VERSION";
  return "FORMULA_ERROR";
}
function mapErr(msg: string): string {
  return msg;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
