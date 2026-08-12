ALTER TABLE public.audio_narrative_versions
  ADD COLUMN IF NOT EXISTS estimated_duration_seconds integer;

DO $seed$
DECLARE
  v_tenant uuid := 'd6e1f4a0-ef31-433e-825e-c2f6dc60cfbb';
  v_owner  uuid := '04bd0a7f-7487-4ba7-a751-a6540b3b4a33';
  r record;
  v_narr uuid;
  v_ver uuid;
  v_prof uuid;
BEGIN
  -- 1. Speech profiles ------------------------------------------------------
  INSERT INTO public.audio_speech_profiles
    (tenant_id, profile_key, display_name, description, locale, rate, pitch, volume, is_default, is_enabled, created_by, updated_by)
  VALUES
    (v_tenant, 'executive_explainer',  'Executive Explainer',  'Delivery guidance: confident, concise, consultative.',   'en-US', 0.95, 1.00, 1.00, false, true, v_owner, v_owner),
    (v_tenant, 'technical_explainer',  'Technical Explainer',  'Delivery guidance: clear, precise, technically grounded.','en-US', 0.92, 1.00, 1.00, false, true, v_owner, v_owner),
    (v_tenant, 'operations_briefing',  'Operations Briefing',  'Delivery guidance: direct, calm, action oriented.',       'en-US', 0.95, 1.00, 1.00, false, true, v_owner, v_owner),
    (v_tenant, 'default_accessibility','Default Accessibility','Delivery guidance: clear and neutral.',                   'en-US', 0.90, 1.00, 1.00, true,  true, v_owner, v_owner)
  ON CONFLICT (tenant_id, profile_key) DO UPDATE
    SET display_name = EXCLUDED.display_name,
        description  = EXCLUDED.description,
        locale       = EXCLUDED.locale,
        rate         = EXCLUDED.rate,
        pitch        = EXCLUDED.pitch,
        volume       = EXCLUDED.volume,
        is_default   = EXCLUDED.is_default,
        is_enabled   = true,
        updated_at   = now();

  -- 2. Centralized pronunciation rules --------------------------------------
  INSERT INTO public.audio_pronunciation_rules
    (tenant_id, scope, match_text, match_type, replacement_text, locale, priority, is_enabled, created_by, updated_by)
  VALUES
    (v_tenant, 'global', 'NeuGAIN',    'word', 'New Gain',                            'en-US', 10, true, v_owner, v_owner),
    (v_tenant, 'global', 'EBITDA',     'word', 'e bit dah',                           'en-US', 10, true, v_owner, v_owner),
    (v_tenant, 'global', 'ARR',        'word', 'A R R',                               'en-US', 10, true, v_owner, v_owner),
    (v_tenant, 'global', 'FTE',        'word', 'F T E',                               'en-US', 10, true, v_owner, v_owner),
    (v_tenant, 'global', 'AIOps',      'word', 'A I Ops',                             'en-US', 10, true, v_owner, v_owner),
    (v_tenant, 'global', 'Citrix',     'word', 'Sit rix',                             'en-US', 10, true, v_owner, v_owner),
    (v_tenant, 'global', 'ServiceNow', 'word', 'Service Now',                         'en-US', 10, true, v_owner, v_owner),
    (v_tenant, 'global', 'LangGraph',  'word', 'Lang Graph',                          'en-US', 10, true, v_owner, v_owner)
  ON CONFLICT DO NOTHING;

  -- 3. Sample narratives + published version 1 ------------------------------
  ALTER TABLE public.audio_narrative_versions DISABLE TRIGGER audio_narrative_versions_guard;

  FOR r IN
    SELECT * FROM (VALUES
      ('CAE.PLATFORM.HOME.001','PLATFORM','HOME',
       'Platform Home Orientation',
       'Explains what the NeuGAIN.io platform home provides and how to navigate to the modules available to the signed in user.',
       'all','page','/platform','executive_explainer',
       'Welcome to NeuGAIN.io. This home view is your starting point for the platform. From here you can reach the workspaces your role allows, review the administrative areas assigned to you, and move between modules without losing context. Navigation is grouped by capability, so related workspaces stay together.',
       'Welcome to NeuGAIN.io. This home view is your starting point for the platform. From here you can reach the workspaces your role allows, review the administrative areas assigned to you, and move between modules without losing context. Navigation is grouped by capability, so related workspaces stay together.'),

      ('CAE.COMMERCIAL.DEAL_OVERVIEW.001','COMMERCIAL','DEAL_OVERVIEW',
       'Commercial Deal Overview Orientation',
       'Explains the purpose of the commercial deal overview and how scenarios, assumptions and model runs relate to each other.',
       'all','page','/commercial/overview','executive_explainer',
       'This overview brings the commercial view of a program together in one place. It shows the scenarios under evaluation, the assumptions those scenarios depend on, and the model runs that turn them into financial output. Each number shown here traces back to a governed assumption and a recorded model run, so results can always be explained and reproduced.',
       'This overview brings the commercial view of a program together in one place. It shows the scenarios under evaluation, the assumptions those scenarios depend on, and the model runs that turn them into financial output. Each number shown here traces back to a governed assumption and a recorded model run, so results can always be explained and reproduced.'),

      ('CAE.COMMERCIAL.EBITDA.001','COMMERCIAL','EBITDA',
       'Commercial EBITDA Explanation',
       'Neutral explanation of how EBITDA is derived within the commercial model and what drives movement between scenarios.',
       'all','section','commercial.pnl.ebitda','executive_explainer',
       'EBITDA on this screen is earnings before interest, taxes, depreciation and amortisation, calculated from the revenue and cost lines produced by the active model run. Movement between scenarios comes from changes in volume, pricing, delivery mix, or FTE cost assumptions. To understand a difference, compare the underlying assumption set rather than the summary figure alone.',
       'EBITDA on this screen is earnings before interest, taxes, depreciation and amortisation, calculated from the revenue and cost lines produced by the active model run. Movement between scenarios comes from changes in volume, pricing, delivery mix, or FTE cost assumptions. To understand a difference, compare the underlying assumption set rather than the summary figure alone.'),

      ('CAE.RUNOPS.SERVICE_HEALTH.001','RUNOPS','SERVICE_HEALTH',
       'RunOps Service Health Orientation',
       'Explains how service health is represented in RunOps and how it connects to runbooks and incidents.',
       'all','page','/runops/services','operations_briefing',
       'Service health summarises the current operating state of a service and the components it depends on. Health is derived from service level indicators, active alerts and open incidents. When a service is degraded, use the linked runbooks to move from detection to a governed response, and record every action so the operational timeline stays complete.',
       'Service health summarises the current operating state of a service and the components it depends on. Health is derived from service level indicators, active alerts and open incidents. When a service is degraded, use the linked runbooks to move from detection to a governed response, and record every action so the operational timeline stays complete.'),

      ('CAE.AVEP.REQUIREMENTS_INTAKE.001','AVEP','REQUIREMENTS_INTAKE',
       'AVEP Requirements Intake Orientation',
       'Explains the purpose of requirements intake in the AI VLSI Engineering Platform and what happens to a requirement after capture.',
       'all','page','/ai-vlsi-engineering/requirements-intake','technical_explainer',
       'Requirements intake is where engineering requirements enter the platform in a structured, reviewable form. Each requirement is captured with its source, owner and quality attributes, then carried forward into traceability, architecture and verification. Capturing intent precisely at this stage is what allows downstream coverage and sign off evidence to be linked back to the original requirement.',
       'Requirements intake is where engineering requirements enter the platform in a structured, reviewable form. Each requirement is captured with its source, owner and quality attributes, then carried forward into traceability, architecture and verification. Capturing intent precisely at this stage is what allows downstream coverage and sign off evidence to be linked back to the original requirement.'),

      ('CAE.AGENTS.ORCHESTRATION.001','AGENTS','ORCHESTRATION',
       'Agent Orchestration Orientation',
       'Explains how agentic workflows are composed, governed and observed in the Agentic AI Architecture Studio.',
       'all','page','/neurealm-agentic-ai','technical_explainer',
       'Orchestration describes how individual agents, tools and integrations are composed into a workflow. Each step declares the capability it needs, the tools it may call, and the level of autonomy it is permitted. Patterns such as LangGraph style graphs make the control flow explicit, so behaviour can be reviewed before deployment and observed once running.',
       'Orchestration describes how individual agents, tools and integrations are composed into a workflow. Each step declares the capability it needs, the tools it may call, and the level of autonomy it is permitted. Patterns such as LangGraph style graphs make the control flow explicit, so behaviour can be reviewed before deployment and observed once running.')
    ) AS t(call_id, module_key, topic_key, name, description, audience, scope_type, scope_reference, profile_key, source_text, speech_text)
  LOOP
    SELECT id INTO v_prof FROM public.audio_speech_profiles
      WHERE tenant_id = v_tenant AND profile_key = r.profile_key;

    SELECT id INTO v_narr FROM public.audio_narratives
      WHERE tenant_id = v_tenant AND call_id = r.call_id;

    IF v_narr IS NULL THEN
      INSERT INTO public.audio_narratives
        (tenant_id, call_id, name, description, module_key, topic_key, scope_type, scope_reference,
         audience, default_locale, default_speech_profile_id, status, owner_user_id, created_by, updated_by)
      VALUES
        (v_tenant, r.call_id, r.name, r.description, r.module_key, r.topic_key, r.scope_type, r.scope_reference,
         r.audience, 'en-US', v_prof, 'draft', v_owner, v_owner, v_owner)
      RETURNING id INTO v_narr;
    END IF;

    SELECT id INTO v_ver FROM public.audio_narrative_versions
      WHERE narrative_id = v_narr AND version_no = 1;

    IF v_ver IS NULL THEN
      INSERT INTO public.audio_narrative_versions
        (tenant_id, narrative_id, version_no, source_text, speech_text, change_summary, status,
         speech_profile_id, author_user_id, reviewer_user_id, approver_user_id,
         approved_at, published_at, effective_start_at,
         estimated_duration_seconds, created_by, updated_by)
      VALUES
        (v_tenant, v_narr, 1, r.source_text, r.speech_text, 'Initial seeded foundation narrative.', 'published',
         v_prof, v_owner, v_owner, v_owner,
         now(), now(), now(),
         GREATEST(5, CEIL(array_length(regexp_split_to_array(btrim(r.speech_text), '\s+'), 1) / 2.5)::int),
         v_owner, v_owner)
      RETURNING id INTO v_ver;
    END IF;

    UPDATE public.audio_narratives
       SET active_version_id = v_ver, status = 'published', updated_at = now()
     WHERE id = v_narr;
  END LOOP;

  ALTER TABLE public.audio_narrative_versions ENABLE TRIGGER audio_narrative_versions_guard;
END
$seed$;