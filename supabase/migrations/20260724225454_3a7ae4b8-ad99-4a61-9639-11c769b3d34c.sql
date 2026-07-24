
-- Ensure metric uniqueness for idempotent upsert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid='public.commercial_program_metrics'::regclass
      AND conname='commercial_program_metrics_program_id_metric_code_key'
  ) THEN
    ALTER TABLE public.commercial_program_metrics
      ADD CONSTRAINT commercial_program_metrics_program_id_metric_code_key
      UNIQUE (program_id, metric_code);
  END IF;
END$$;

CREATE OR REPLACE FUNCTION public.seed_project_momentous_foundation()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $fn$
DECLARE
  v_uid uuid := auth.uid();
  v_tenant uuid;
  v_program uuid;
  v_created_program boolean := false;
  v_gates_upserted int := 0;
  v_metrics_upserted int := 0;
  v_sources_upserted int := 0;
  r record;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;

  SELECT id INTO v_tenant FROM public.tenants WHERE slug='neugain-commercial';
  IF v_tenant IS NULL THEN RAISE EXCEPTION 'neugain_commercial_workspace_missing'; END IF;

  IF NOT public.has_permission(v_uid, v_tenant, 'commercial.program.manage') THEN
    RAISE EXCEPTION 'permission_denied: commercial.program.manage';
  END IF;
  IF NOT public.has_permission(v_uid, v_tenant, 'commercial.source.manage') THEN
    RAISE EXCEPTION 'permission_denied: commercial.source.manage';
  END IF;

  -- 1. Program (idempotent by tenant_id, code)
  SELECT id INTO v_program FROM public.commercial_programs
   WHERE tenant_id=v_tenant AND code='PROJECT_MOMENTOUS';
  IF v_program IS NULL THEN
    INSERT INTO public.commercial_programs(
      tenant_id, code, name, partner_name, market_segment, description,
      status, current_gate_code, source_status, created_by, updated_by
    ) VALUES (
      v_tenant, 'PROJECT_MOMENTOUS', 'Project Momentous', 'Citrix',
      'US Healthcare Providers',
      'A gated Commercial and operating model for expanding Citrix adoption, renewals, professional services, managed services, support readiness, and customer outcomes across US healthcare provider accounts.',
      'draft', 'G0', 'directional', v_uid, v_uid
    ) RETURNING id INTO v_program;
    v_created_program := true;
    PERFORM public.emit_audit_event(v_tenant,'commercial.program.created','commercial_program',v_program::text);
  END IF;

  -- 2. Gates
  FOR r IN
    SELECT * FROM (VALUES
      ('G0',0,'Kickoff Readiness','No accounts transferred.',0,
        'Establish governance, program charter, gate model, and shared operating cadence between Neurealm and Citrix.',
        'Confirm baseline economics, deal envelope, and cost-to-serve assumptions before any account transfer.',
        jsonb_build_array(
          'Signed MOU and joint governance charter',
          'Aligned partner operating model and RACI',
          'Baseline P&L and pricing framework approved',
          'Executive sponsorship and steering cadence in place'
        ), 'in_progress'),
      ('G1',1,'Controlled Operator Pilot','20 to 30 selected no-partner accounts.',25,
        'Prove Neurealm can operate Citrix accounts end-to-end (renewal, PS, MS, support) at production quality.',
        'Validate revenue retention, gross margin, and unit economics on a controlled pilot cohort.',
        jsonb_build_array(
          'Pilot cohort selected from no-partner accounts (20-30)',
          'Operator playbooks executed for renewal + PS + MS + support',
          'Retention and CSAT meet or exceed baseline',
          'Unit economics validated within committed envelope'
        ), 'not_started'),
      ('G2',2,'Scale Operator Model','Add 50 to 75 accounts, reaching 70 to 105 cumulative.',87,
        'Scale the pilot operating model to a broader no-partner base while preserving service quality.',
        'Demonstrate operating leverage and margin expansion at 2-3x pilot volume.',
        jsonb_build_array(
          'Pilot exit criteria formally met',
          'Operator capacity and tooling scaled for cohort size',
          'Retention, margin, and CSAT sustained at scale',
          'Joint escalation and QBR cadence operating steady state'
        ), 'not_started'),
      ('G3',3,'Segment Operator Model','Add 100 to 120 accounts, reaching 170 to 225 cumulative.',197,
        'Extend operator model across the majority of the no-partner healthcare provider segment.',
        'Achieve target ARR contribution and segment-level margin thresholds.',
        jsonb_build_array(
          'G2 outcomes validated over full cycle',
          'Segment coverage plan approved by both parties',
          'Field, delivery, and support org sized for segment scope',
          'Segment ARR and margin targets on track'
        ), 'not_started'),
      ('G4',4,'Mature Operator Model','Remaining eligible healthcare-provider accounts.',NULL,
        'Operate as the mature default Citrix delivery partner across eligible healthcare providers.',
        'Sustain durable ARR, margin, and renewal performance at mature-state economics.',
        jsonb_build_array(
          'Segment model performance sustained for 2+ cycles',
          'Full transition of remaining eligible accounts approved',
          'Mature-state cost-to-serve and margin envelope validated',
          'Long-term joint roadmap and renewal engine in place'
        ), 'not_started')
    ) AS g(gate_code, seq, name, scope_label, scope_count, op_obj, econ_obj, unlocks, status)
  LOOP
    INSERT INTO public.commercial_stage_gates(
      tenant_id, program_id, gate_code, sequence_number, name,
      account_scope_label, account_scope_count,
      operating_objective, economic_objective, unlock_conditions, status,
      created_by, updated_by
    ) VALUES (
      v_tenant, v_program, r.gate_code, r.seq, r.name,
      r.scope_label, r.scope_count, r.op_obj, r.econ_obj, r.unlocks, r.status,
      v_uid, v_uid
    )
    ON CONFLICT (program_id, gate_code) DO NOTHING;
    IF FOUND THEN v_gates_upserted := v_gates_upserted + 1; END IF;
  END LOOP;

  -- 3. Sources (must precede metrics that reference them)
  FOR r IN
    SELECT * FROM (VALUES
      ('SRC-001','Project Momentous MOU Draft','mou',
        'Draft memorandum of understanding between Neurealm and Citrix defining scope, governance, and gate model. Contents redacted; metadata only.'),
      ('SRC-002','Neurealm x Citrix Deal P&L Model, Revised','financial_model',
        'Revised joint P&L model underpinning the no-partner portfolio economics. Raw model not stored.'),
      ('SRC-003','Healthcare Account Master List with ICP Fit','account_dataset',
        'Master list of US healthcare provider accounts with ICP-fit scoring. Underlying records not stored.'),
      ('SRC-004','Draup Targeted Account Details, Consolidated','account_intelligence',
        'Consolidated Draup account intelligence extract. Raw exports not stored.'),
      ('SRC-005','Citrix and Neurealm Meeting Transcripts','meeting_transcripts',
        'Series of joint working session transcripts. Transcript content not stored; metadata only.'),
      ('SRC-006','Project Momentous Deal Sheet','deal_sheet',
        'Executive deal sheet summarizing partnership shape and economics. Raw sheet not stored.')
    ) AS s(source_code, title, source_type, notes)
  LOOP
    INSERT INTO public.commercial_source_references(
      tenant_id, program_id, source_code, title, source_type,
      confidentiality, status, notes, created_by, updated_by
    ) VALUES (
      v_tenant, v_program, r.source_code, r.title, r.source_type,
      'confidential', 'active', r.notes, v_uid, v_uid
    )
    ON CONFLICT (program_id, source_code) DO NOTHING;
    IF FOUND THEN v_sources_upserted := v_sources_upserted + 1; END IF;
  END LOOP;

  -- 4. Metrics
  FOR r IN
    SELECT * FROM (VALUES
      ('TOTAL_HC_ACCOUNTS','Total healthcare-provider account universe',338::numeric,'accounts',
        'Broader US healthcare provider account universe. Related to but not interchangeable with the no-partner portfolio scope. Account-level validation pending.'),
      ('TOTAL_HC_ARR','Combined ARR represented by broader universe',442000000::numeric,'USD',
        'Aggregate ARR represented by the broader 338-account universe. Directional; account-level validation pending.'),
      ('NO_PARTNER_ACCOUNTS','No-partner account base used in revised financial model',104::numeric,'accounts',
        'Narrower no-partner portfolio scope used in the revised financial model. Related to but not interchangeable with the broader 338-account universe.'),
      ('NO_PARTNER_ARR','No-partner ARR base used in revised financial model',140900000::numeric,'USD',
        'ARR base for the narrower 104-account no-partner portfolio model. Directional; account-level validation pending.')
    ) AS m(metric_code, label, numeric_value, unit, notes)
  LOOP
    INSERT INTO public.commercial_program_metrics(
      tenant_id, program_id, metric_code, label, numeric_value, unit,
      confidence, notes, created_by, updated_by
    ) VALUES (
      v_tenant, v_program, r.metric_code, r.label, r.numeric_value, r.unit,
      'directional', r.notes, v_uid, v_uid
    )
    ON CONFLICT (program_id, metric_code) DO NOTHING;
    IF FOUND THEN v_metrics_upserted := v_metrics_upserted + 1; END IF;
  END LOOP;

  PERFORM public.emit_audit_event(
    v_tenant,'commercial.program.seeded','commercial_program',v_program::text,
    NULL, jsonb_build_object(
      'created_program', v_created_program,
      'gates_inserted', v_gates_upserted,
      'metrics_inserted', v_metrics_upserted,
      'sources_inserted', v_sources_upserted
    )
  );

  RETURN jsonb_build_object(
    'tenant_id', v_tenant,
    'program_id', v_program,
    'created_program', v_created_program,
    'gates_inserted', v_gates_upserted,
    'metrics_inserted', v_metrics_upserted,
    'sources_inserted', v_sources_upserted
  );
END
$fn$;

REVOKE ALL ON FUNCTION public.seed_project_momentous_foundation() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.seed_project_momentous_foundation() TO authenticated;
