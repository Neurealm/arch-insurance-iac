-- =====================================================================
-- CAE.020  Contextual Audio Enrichment: database + security foundation
-- =====================================================================

-- ---------- 1. Permission catalogue ----------------------------------
INSERT INTO public.permissions (code, category, description, is_system) VALUES
  ('audio.view',                  'audio', 'View published contextual audio narratives', true),
  ('audio.narrative.author',      'audio', 'Create and edit contextual audio narratives and draft versions', true),
  ('audio.narrative.review',      'audio', 'Move narrative versions into and out of review', true),
  ('audio.narrative.approve',     'audio', 'Approve reviewed narrative versions', true),
  ('audio.narrative.publish',     'audio', 'Publish approved narrative versions', true),
  ('audio.narrative.retire',      'audio', 'Retire narratives and published versions', true),
  ('audio.placement.manage',      'audio', 'Manage contextual audio placements', true),
  ('audio.profile.manage',        'audio', 'Manage speech profiles', true),
  ('audio.pronunciation.manage',  'audio', 'Manage pronunciation rules and variable definitions', true),
  ('audio.analytics.view',        'audio', 'View contextual audio playback analytics', true),
  ('audio.admin',                 'audio', 'Full administration of contextual audio enrichment', true)
ON CONFLICT (code) DO NOTHING;

-- ---------- 2. Authorization helpers ---------------------------------
CREATE OR REPLACE FUNCTION public.audio_can_view(_tenant_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT
    auth.uid() IS NOT NULL
    AND _tenant_id IS NOT NULL
    AND (
      public.is_platform_admin(auth.uid())
      OR (
        EXISTS (SELECT 1 FROM public.memberships m
                 WHERE m.tenant_id = _tenant_id AND m.user_id = auth.uid() AND m.status = 'active')
        AND public.has_permission(auth.uid(), _tenant_id, 'audio.view')
      )
    );
$$;

CREATE OR REPLACE FUNCTION public.audio_can_manage(_tenant_id uuid, _permission_code text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT
    auth.uid() IS NOT NULL
    AND _tenant_id IS NOT NULL
    AND _permission_code IS NOT NULL
    AND (
      public.is_platform_admin(auth.uid())
      OR (
        EXISTS (SELECT 1 FROM public.memberships m
                 WHERE m.tenant_id = _tenant_id AND m.user_id = auth.uid() AND m.status = 'active')
        AND (
          public.has_permission(auth.uid(), _tenant_id, _permission_code)
          OR public.has_permission(auth.uid(), _tenant_id, 'audio.admin')
        )
      )
    );
$$;

REVOKE EXECUTE ON FUNCTION public.audio_can_view(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.audio_can_manage(uuid, text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.audio_can_view(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.audio_can_manage(uuid, text) TO authenticated, service_role;

-- Shared actor/timestamp trigger for the audio_* suite
CREATE OR REPLACE FUNCTION public.audio_set_actor_and_timestamp()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.created_by := COALESCE(NEW.created_by, auth.uid());
    NEW.updated_by := COALESCE(NEW.updated_by, auth.uid());
    NEW.created_at := COALESCE(NEW.created_at, now());
    NEW.updated_at := now();
  ELSE
    NEW.created_at := OLD.created_at;
    NEW.created_by := OLD.created_by;
    NEW.updated_by := COALESCE(auth.uid(), OLD.updated_by);
    NEW.updated_at := now();
  END IF;
  RETURN NEW;
END $$;

-- ---------- 3. audio_speech_profiles ---------------------------------
CREATE TABLE public.audio_speech_profiles (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  profile_key           text NOT NULL,
  display_name          text NOT NULL,
  description           text,
  locale                text NOT NULL DEFAULT 'en-US',
  fallback_locale       text NOT NULL DEFAULT 'en',
  preferred_voice_names text[] NOT NULL DEFAULT '{}',
  rate                  numeric(4,2) NOT NULL DEFAULT 1.00 CHECK (rate BETWEEN 0.10 AND 3.00),
  pitch                 numeric(4,2) NOT NULL DEFAULT 1.00 CHECK (pitch BETWEEN 0.00 AND 2.00),
  volume                numeric(4,2) NOT NULL DEFAULT 1.00 CHECK (volume BETWEEN 0.00 AND 1.00),
  is_default            boolean NOT NULL DEFAULT false,
  is_enabled            boolean NOT NULL DEFAULT true,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  created_by            uuid,
  updated_by            uuid,
  CONSTRAINT audio_speech_profiles_key_uk UNIQUE (tenant_id, profile_key),
  CONSTRAINT audio_speech_profiles_key_fmt CHECK (profile_key ~ '^[a-z0-9_]{2,64}$')
);
CREATE UNIQUE INDEX audio_speech_profiles_one_default
  ON public.audio_speech_profiles (tenant_id) WHERE is_default;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.audio_speech_profiles TO authenticated;
GRANT ALL ON public.audio_speech_profiles TO service_role;
ALTER TABLE public.audio_speech_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY audio_speech_profiles_select ON public.audio_speech_profiles
  FOR SELECT TO authenticated USING (public.audio_can_view(tenant_id));
CREATE POLICY audio_speech_profiles_insert ON public.audio_speech_profiles
  FOR INSERT TO authenticated WITH CHECK (public.audio_can_manage(tenant_id, 'audio.profile.manage'));
CREATE POLICY audio_speech_profiles_update ON public.audio_speech_profiles
  FOR UPDATE TO authenticated USING (public.audio_can_manage(tenant_id, 'audio.profile.manage'))
  WITH CHECK (public.audio_can_manage(tenant_id, 'audio.profile.manage'));
CREATE POLICY audio_speech_profiles_delete ON public.audio_speech_profiles
  FOR DELETE TO authenticated USING (public.audio_can_manage(tenant_id, 'audio.admin'));

CREATE TRIGGER audio_speech_profiles_actor
  BEFORE INSERT OR UPDATE ON public.audio_speech_profiles
  FOR EACH ROW EXECUTE FUNCTION public.audio_set_actor_and_timestamp();

-- ---------- 4. audio_narratives --------------------------------------
CREATE TABLE public.audio_narratives (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  call_id                   text NOT NULL,
  name                      text NOT NULL,
  description               text,
  module_key                text NOT NULL,
  topic_key                 text NOT NULL,
  scope_type                text NOT NULL DEFAULT 'page',
  scope_reference           text,
  audience                  text NOT NULL DEFAULT 'all',
  default_locale            text NOT NULL DEFAULT 'en-US',
  default_speech_profile_id uuid REFERENCES public.audio_speech_profiles(id) ON DELETE SET NULL,
  active_version_id         uuid,
  status                    text NOT NULL DEFAULT 'draft',
  owner_user_id             uuid,
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now(),
  created_by                uuid,
  updated_by                uuid,
  CONSTRAINT audio_narratives_call_id_uk UNIQUE (tenant_id, call_id),
  CONSTRAINT audio_narratives_call_id_fmt CHECK (call_id ~ '^CAE\.[A-Z][A-Z0-9]*\.[A-Z][A-Z0-9_]*\.[0-9]{3}$'),
  CONSTRAINT audio_narratives_module_fmt CHECK (module_key ~ '^[A-Z][A-Z0-9]*$'),
  CONSTRAINT audio_narratives_topic_fmt CHECK (topic_key ~ '^[A-Z][A-Z0-9_]*$'),
  CONSTRAINT audio_narratives_scope_type_chk CHECK (scope_type IN ('module','page','section','component','record')),
  CONSTRAINT audio_narratives_status_chk CHECK (status IN ('draft','in_review','approved','published','retired'))
);

CREATE INDEX audio_narratives_tenant_call_idx ON public.audio_narratives (tenant_id, call_id);
CREATE INDEX audio_narratives_published_idx
  ON public.audio_narratives (tenant_id, module_key, topic_key) WHERE status = 'published';
CREATE INDEX audio_narratives_scope_idx ON public.audio_narratives (tenant_id, scope_type, scope_reference);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.audio_narratives TO authenticated;
GRANT ALL ON public.audio_narratives TO service_role;
ALTER TABLE public.audio_narratives ENABLE ROW LEVEL SECURITY;

CREATE POLICY audio_narratives_select ON public.audio_narratives
  FOR SELECT TO authenticated USING (
    public.audio_can_view(tenant_id)
    AND (
      status = 'published'
      OR public.audio_can_manage(tenant_id, 'audio.narrative.author')
      OR public.audio_can_manage(tenant_id, 'audio.narrative.review')
      OR public.audio_can_manage(tenant_id, 'audio.narrative.approve')
      OR public.audio_can_manage(tenant_id, 'audio.narrative.publish')
    )
  );
CREATE POLICY audio_narratives_insert ON public.audio_narratives
  FOR INSERT TO authenticated WITH CHECK (public.audio_can_manage(tenant_id, 'audio.narrative.author'));
CREATE POLICY audio_narratives_update ON public.audio_narratives
  FOR UPDATE TO authenticated USING (public.audio_can_manage(tenant_id, 'audio.narrative.author'))
  WITH CHECK (public.audio_can_manage(tenant_id, 'audio.narrative.author'));
CREATE POLICY audio_narratives_delete ON public.audio_narratives
  FOR DELETE TO authenticated USING (public.audio_can_manage(tenant_id, 'audio.admin'));

-- Call ID immutability + module/topic coherence
CREATE OR REPLACE FUNCTION public.audio_narrative_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NEW.call_id <> 'CAE.' || NEW.module_key || '.' || NEW.topic_key || '.' || split_part(NEW.call_id, '.', 4) THEN
    RAISE EXCEPTION 'call_id must be CAE.<MODULE_KEY>.<TOPIC_KEY>.<SEQUENCE> and match module_key/topic_key';
  END IF;
  IF TG_OP = 'UPDATE' THEN
    IF NEW.call_id <> OLD.call_id THEN
      RAISE EXCEPTION 'call_id is immutable';
    END IF;
    IF NEW.tenant_id <> OLD.tenant_id THEN
      RAISE EXCEPTION 'tenant_id is immutable';
    END IF;
    IF NEW.module_key <> OLD.module_key OR NEW.topic_key <> OLD.topic_key THEN
      RAISE EXCEPTION 'module_key and topic_key are immutable';
    END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER audio_narratives_actor
  BEFORE INSERT OR UPDATE ON public.audio_narratives
  FOR EACH ROW EXECUTE FUNCTION public.audio_set_actor_and_timestamp();
CREATE TRIGGER audio_narratives_guard
  BEFORE INSERT OR UPDATE ON public.audio_narratives
  FOR EACH ROW EXECUTE FUNCTION public.audio_narrative_guard();

-- ---------- 5. audio_narrative_versions ------------------------------
CREATE TABLE public.audio_narrative_versions (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id          uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  narrative_id       uuid NOT NULL REFERENCES public.audio_narratives(id) ON DELETE CASCADE,
  version_no         integer NOT NULL CHECK (version_no > 0),
  source_text        text NOT NULL,
  speech_text        text,
  speech_markup      text,
  change_summary     text,
  status             text NOT NULL DEFAULT 'draft',
  speech_profile_id  uuid REFERENCES public.audio_speech_profiles(id) ON DELETE SET NULL,
  author_user_id     uuid,
  reviewer_user_id   uuid,
  approver_user_id   uuid,
  approved_at        timestamptz,
  published_at       timestamptz,
  retired_at         timestamptz,
  effective_start_at timestamptz,
  effective_end_at   timestamptz,
  content_hash       text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  created_by         uuid,
  updated_by         uuid,
  CONSTRAINT audio_narrative_versions_no_uk UNIQUE (narrative_id, version_no),
  CONSTRAINT audio_narrative_versions_status_chk CHECK (status IN ('draft','in_review','approved','published','retired')),
  CONSTRAINT audio_narrative_versions_window_chk CHECK (effective_end_at IS NULL OR effective_start_at IS NULL OR effective_end_at > effective_start_at)
);

CREATE UNIQUE INDEX audio_narrative_versions_one_published
  ON public.audio_narrative_versions (narrative_id) WHERE status = 'published';
CREATE INDEX audio_narrative_versions_lookup_idx
  ON public.audio_narrative_versions (tenant_id, narrative_id, status);
CREATE INDEX audio_narrative_versions_published_idx
  ON public.audio_narrative_versions (narrative_id, effective_start_at, effective_end_at) WHERE status = 'published';

GRANT SELECT, INSERT, UPDATE, DELETE ON public.audio_narrative_versions TO authenticated;
GRANT ALL ON public.audio_narrative_versions TO service_role;
ALTER TABLE public.audio_narrative_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY audio_narrative_versions_select ON public.audio_narrative_versions
  FOR SELECT TO authenticated USING (
    public.audio_can_view(tenant_id)
    AND (
      (
        status = 'published'
        AND (effective_start_at IS NULL OR effective_start_at <= now())
        AND (effective_end_at   IS NULL OR effective_end_at   >  now())
        AND EXISTS (
          SELECT 1 FROM public.audio_narratives n
           WHERE n.id = audio_narrative_versions.narrative_id
             AND n.tenant_id = audio_narrative_versions.tenant_id
             AND n.status = 'published'
        )
      )
      OR public.audio_can_manage(tenant_id, 'audio.narrative.author')
      OR public.audio_can_manage(tenant_id, 'audio.narrative.review')
      OR public.audio_can_manage(tenant_id, 'audio.narrative.approve')
      OR public.audio_can_manage(tenant_id, 'audio.narrative.publish')
    )
  );
CREATE POLICY audio_narrative_versions_insert ON public.audio_narrative_versions
  FOR INSERT TO authenticated WITH CHECK (public.audio_can_manage(tenant_id, 'audio.narrative.author'));
CREATE POLICY audio_narrative_versions_update ON public.audio_narrative_versions
  FOR UPDATE TO authenticated USING (
    public.audio_can_manage(tenant_id, 'audio.narrative.author')
    OR public.audio_can_manage(tenant_id, 'audio.narrative.review')
    OR public.audio_can_manage(tenant_id, 'audio.narrative.approve')
    OR public.audio_can_manage(tenant_id, 'audio.narrative.publish')
    OR public.audio_can_manage(tenant_id, 'audio.narrative.retire')
  ) WITH CHECK (
    public.audio_can_manage(tenant_id, 'audio.narrative.author')
    OR public.audio_can_manage(tenant_id, 'audio.narrative.review')
    OR public.audio_can_manage(tenant_id, 'audio.narrative.approve')
    OR public.audio_can_manage(tenant_id, 'audio.narrative.publish')
    OR public.audio_can_manage(tenant_id, 'audio.narrative.retire')
  );
CREATE POLICY audio_narrative_versions_delete ON public.audio_narrative_versions
  FOR DELETE TO authenticated USING (
    status = 'draft' AND public.audio_can_manage(tenant_id, 'audio.admin')
  );

-- Same-tenant + lifecycle + content immutability guard
CREATE OR REPLACE FUNCTION public.audio_narrative_version_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_narr public.audio_narratives%ROWTYPE;
  v_required text;
BEGIN
  SELECT * INTO v_narr FROM public.audio_narratives WHERE id = NEW.narrative_id;
  IF NOT FOUND OR v_narr.tenant_id <> NEW.tenant_id THEN
    RAISE EXCEPTION 'narrative_id must reference a narrative in the same tenant';
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.status <> 'draft' THEN
      RAISE EXCEPTION 'new versions must be created in draft status';
    END IF;
    NEW.author_user_id := COALESCE(NEW.author_user_id, auth.uid());
    IF NEW.version_no IS NULL THEN
      SELECT COALESCE(MAX(version_no), 0) + 1 INTO NEW.version_no
        FROM public.audio_narrative_versions WHERE narrative_id = NEW.narrative_id;
    END IF;
    RETURN NEW;
  END IF;

  -- UPDATE
  IF NEW.narrative_id <> OLD.narrative_id OR NEW.tenant_id <> OLD.tenant_id OR NEW.version_no <> OLD.version_no THEN
    RAISE EXCEPTION 'narrative_id, tenant_id and version_no are immutable';
  END IF;

  IF OLD.status <> 'draft'
     AND (NEW.source_text IS DISTINCT FROM OLD.source_text
       OR NEW.speech_text IS DISTINCT FROM OLD.speech_text
       OR NEW.speech_markup IS DISTINCT FROM OLD.speech_markup) THEN
    RAISE EXCEPTION 'narrative content is frozen once the version leaves draft status';
  END IF;

  IF NEW.status <> OLD.status THEN
    IF NOT (
      (OLD.status = 'draft'     AND NEW.status = 'in_review')
      OR (OLD.status = 'in_review' AND NEW.status IN ('draft','approved'))
      OR (OLD.status = 'approved'  AND NEW.status IN ('in_review','published'))
      OR (OLD.status = 'published' AND NEW.status = 'retired')
      OR (OLD.status = 'approved'  AND NEW.status = 'retired')
    ) THEN
      RAISE EXCEPTION 'invalid lifecycle transition % -> %', OLD.status, NEW.status;
    END IF;

    v_required := CASE NEW.status
      WHEN 'in_review' THEN 'audio.narrative.review'
      WHEN 'draft'     THEN 'audio.narrative.review'
      WHEN 'approved'  THEN 'audio.narrative.approve'
      WHEN 'published' THEN 'audio.narrative.publish'
      WHEN 'retired'   THEN 'audio.narrative.retire'
    END;
    IF NOT public.audio_can_manage(NEW.tenant_id, v_required) THEN
      RAISE EXCEPTION 'permission % is required for this transition', v_required;
    END IF;

    IF NEW.status = 'in_review' THEN
      NEW.reviewer_user_id := COALESCE(auth.uid(), NEW.reviewer_user_id);
    ELSIF NEW.status = 'approved' THEN
      NEW.approver_user_id := COALESCE(auth.uid(), NEW.approver_user_id);
      NEW.approved_at := COALESCE(NEW.approved_at, now());
    ELSIF NEW.status = 'published' THEN
      NEW.published_at := COALESCE(NEW.published_at, now());
      NEW.effective_start_at := COALESCE(NEW.effective_start_at, now());
      UPDATE public.audio_narrative_versions
         SET status = 'retired', retired_at = now(), effective_end_at = COALESCE(effective_end_at, now())
       WHERE narrative_id = NEW.narrative_id AND id <> NEW.id AND status = 'published';
      UPDATE public.audio_narratives
         SET active_version_id = NEW.id, status = 'published', updated_at = now()
       WHERE id = NEW.narrative_id;
    ELSIF NEW.status = 'retired' THEN
      NEW.retired_at := COALESCE(NEW.retired_at, now());
      NEW.effective_end_at := COALESCE(NEW.effective_end_at, now());
      UPDATE public.audio_narratives
         SET active_version_id = NULL, status = 'retired', updated_at = now()
       WHERE id = NEW.narrative_id AND active_version_id = NEW.id;
    END IF;

    PERFORM public.emit_audit_event(
      NEW.tenant_id,
      'cae.version.' || NEW.status,
      'audio_narrative_version',
      NEW.id::text,
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status, 'call_id', v_narr.call_id, 'version_no', NEW.version_no),
      NULL, '{}'::jsonb
    );
  END IF;

  RETURN NEW;
END $$;

CREATE TRIGGER audio_narrative_versions_actor
  BEFORE INSERT OR UPDATE ON public.audio_narrative_versions
  FOR EACH ROW EXECUTE FUNCTION public.audio_set_actor_and_timestamp();
CREATE TRIGGER audio_narrative_versions_guard
  BEFORE INSERT OR UPDATE ON public.audio_narrative_versions
  FOR EACH ROW EXECUTE FUNCTION public.audio_narrative_version_guard();

ALTER TABLE public.audio_narratives
  ADD CONSTRAINT audio_narratives_active_version_fk
  FOREIGN KEY (active_version_id) REFERENCES public.audio_narrative_versions(id) ON DELETE SET NULL;

-- ---------- 6. audio_placements --------------------------------------
CREATE TABLE public.audio_placements (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  placement_key       text NOT NULL,
  narrative_id        uuid NOT NULL REFERENCES public.audio_narratives(id) ON DELETE RESTRICT,
  call_id             text NOT NULL,
  module_key          text NOT NULL,
  route_pattern       text,
  page_key            text,
  section_key         text,
  component_key       text,
  record_context_type text,
  audience            text NOT NULL DEFAULT 'all',
  button_label        text,
  display_variant     text NOT NULL DEFAULT 'icon',
  sort_order          integer NOT NULL DEFAULT 0,
  is_enabled          boolean NOT NULL DEFAULT true,
  required_permission_code text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  created_by          uuid,
  updated_by          uuid,
  CONSTRAINT audio_placements_key_uk UNIQUE (tenant_id, placement_key),
  CONSTRAINT audio_placements_variant_chk CHECK (display_variant IN ('icon','button','inline','menu'))
);

CREATE INDEX audio_placements_lookup_idx
  ON public.audio_placements (tenant_id, page_key, section_key, component_key) WHERE is_enabled;
CREATE INDEX audio_placements_call_idx ON public.audio_placements (tenant_id, call_id);
CREATE INDEX audio_placements_narrative_idx ON public.audio_placements (narrative_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.audio_placements TO authenticated;
GRANT ALL ON public.audio_placements TO service_role;
ALTER TABLE public.audio_placements ENABLE ROW LEVEL SECURITY;

CREATE POLICY audio_placements_select ON public.audio_placements
  FOR SELECT TO authenticated USING (
    public.audio_can_view(tenant_id)
    AND (is_enabled OR public.audio_can_manage(tenant_id, 'audio.placement.manage'))
  );
CREATE POLICY audio_placements_insert ON public.audio_placements
  FOR INSERT TO authenticated WITH CHECK (public.audio_can_manage(tenant_id, 'audio.placement.manage'));
CREATE POLICY audio_placements_update ON public.audio_placements
  FOR UPDATE TO authenticated USING (public.audio_can_manage(tenant_id, 'audio.placement.manage'))
  WITH CHECK (public.audio_can_manage(tenant_id, 'audio.placement.manage'));
CREATE POLICY audio_placements_delete ON public.audio_placements
  FOR DELETE TO authenticated USING (public.audio_can_manage(tenant_id, 'audio.placement.manage'));

CREATE OR REPLACE FUNCTION public.audio_placement_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_narr public.audio_narratives%ROWTYPE;
BEGIN
  SELECT * INTO v_narr FROM public.audio_narratives WHERE id = NEW.narrative_id;
  IF NOT FOUND OR v_narr.tenant_id <> NEW.tenant_id THEN
    RAISE EXCEPTION 'narrative_id must reference a narrative in the same tenant';
  END IF;
  NEW.call_id := v_narr.call_id;
  NEW.module_key := v_narr.module_key;
  RETURN NEW;
END $$;

CREATE TRIGGER audio_placements_actor
  BEFORE INSERT OR UPDATE ON public.audio_placements
  FOR EACH ROW EXECUTE FUNCTION public.audio_set_actor_and_timestamp();
CREATE TRIGGER audio_placements_guard
  BEFORE INSERT OR UPDATE ON public.audio_placements
  FOR EACH ROW EXECUTE FUNCTION public.audio_placement_guard();

-- Block deletion of narratives that still have enabled placements
CREATE OR REPLACE FUNCTION public.audio_narrative_delete_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.audio_placements p
              WHERE p.narrative_id = OLD.id AND p.is_enabled) THEN
    RAISE EXCEPTION 'cannot delete narrative % while active placements exist', OLD.call_id;
  END IF;
  RETURN OLD;
END $$;

CREATE TRIGGER audio_narratives_delete_guard
  BEFORE DELETE ON public.audio_narratives
  FOR EACH ROW EXECUTE FUNCTION public.audio_narrative_delete_guard();

-- ---------- 7. audio_variable_definitions ----------------------------
CREATE TABLE public.audio_variable_definitions (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  module_key               text NOT NULL,
  variable_key             text NOT NULL,
  resolver_key             text NOT NULL,
  description              text,
  value_type               text NOT NULL DEFAULT 'text',
  required_permission_code text,
  is_enabled               boolean NOT NULL DEFAULT true,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now(),
  created_by               uuid,
  updated_by               uuid,
  CONSTRAINT audio_variable_definitions_uk UNIQUE (tenant_id, module_key, variable_key),
  CONSTRAINT audio_variable_definitions_key_fmt CHECK (variable_key ~ '^[a-z0-9_]+(\.[a-z0-9_]+){1,3}$'),
  CONSTRAINT audio_variable_definitions_resolver_fmt CHECK (resolver_key ~ '^[a-z0-9_]+(\.[a-z0-9_]+){0,3}$'),
  CONSTRAINT audio_variable_definitions_type_chk CHECK (value_type IN ('text','number','currency','percent','date','datetime'))
);
CREATE INDEX audio_variable_definitions_module_idx
  ON public.audio_variable_definitions (tenant_id, module_key) WHERE is_enabled;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.audio_variable_definitions TO authenticated;
GRANT ALL ON public.audio_variable_definitions TO service_role;
ALTER TABLE public.audio_variable_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY audio_variable_definitions_select ON public.audio_variable_definitions
  FOR SELECT TO authenticated USING (public.audio_can_view(tenant_id));
CREATE POLICY audio_variable_definitions_insert ON public.audio_variable_definitions
  FOR INSERT TO authenticated WITH CHECK (public.audio_can_manage(tenant_id, 'audio.pronunciation.manage'));
CREATE POLICY audio_variable_definitions_update ON public.audio_variable_definitions
  FOR UPDATE TO authenticated USING (public.audio_can_manage(tenant_id, 'audio.pronunciation.manage'))
  WITH CHECK (public.audio_can_manage(tenant_id, 'audio.pronunciation.manage'));
CREATE POLICY audio_variable_definitions_delete ON public.audio_variable_definitions
  FOR DELETE TO authenticated USING (public.audio_can_manage(tenant_id, 'audio.admin'));

CREATE TRIGGER audio_variable_definitions_actor
  BEFORE INSERT OR UPDATE ON public.audio_variable_definitions
  FOR EACH ROW EXECUTE FUNCTION public.audio_set_actor_and_timestamp();

-- ---------- 8. audio_pronunciation_rules -----------------------------
CREATE TABLE public.audio_pronunciation_rules (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  scope            text NOT NULL DEFAULT 'global',
  module_key       text,
  match_text       text NOT NULL,
  match_type       text NOT NULL DEFAULT 'word',
  replacement_text text NOT NULL,
  locale           text,
  priority         integer NOT NULL DEFAULT 100,
  is_enabled       boolean NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  created_by       uuid,
  updated_by       uuid,
  CONSTRAINT audio_pronunciation_rules_scope_chk CHECK (scope IN ('global','module')),
  CONSTRAINT audio_pronunciation_rules_match_chk CHECK (match_type IN ('exact','word')),
  CONSTRAINT audio_pronunciation_rules_module_chk CHECK (scope = 'global' OR module_key IS NOT NULL),
  CONSTRAINT audio_pronunciation_rules_uk UNIQUE (tenant_id, scope, module_key, match_text, locale)
);
CREATE INDEX audio_pronunciation_rules_lookup_idx
  ON public.audio_pronunciation_rules (tenant_id, scope, module_key, priority) WHERE is_enabled;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.audio_pronunciation_rules TO authenticated;
GRANT ALL ON public.audio_pronunciation_rules TO service_role;
ALTER TABLE public.audio_pronunciation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY audio_pronunciation_rules_select ON public.audio_pronunciation_rules
  FOR SELECT TO authenticated USING (public.audio_can_view(tenant_id));
CREATE POLICY audio_pronunciation_rules_insert ON public.audio_pronunciation_rules
  FOR INSERT TO authenticated WITH CHECK (public.audio_can_manage(tenant_id, 'audio.pronunciation.manage'));
CREATE POLICY audio_pronunciation_rules_update ON public.audio_pronunciation_rules
  FOR UPDATE TO authenticated USING (public.audio_can_manage(tenant_id, 'audio.pronunciation.manage'))
  WITH CHECK (public.audio_can_manage(tenant_id, 'audio.pronunciation.manage'));
CREATE POLICY audio_pronunciation_rules_delete ON public.audio_pronunciation_rules
  FOR DELETE TO authenticated USING (public.audio_can_manage(tenant_id, 'audio.pronunciation.manage'));

CREATE TRIGGER audio_pronunciation_rules_actor
  BEFORE INSERT OR UPDATE ON public.audio_pronunciation_rules
  FOR EACH ROW EXECUTE FUNCTION public.audio_set_actor_and_timestamp();

-- ---------- 9. audio_playback_events (append only) -------------------
CREATE TABLE public.audio_playback_events (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id              uuid,
  narrative_id         uuid REFERENCES public.audio_narratives(id) ON DELETE SET NULL,
  narrative_version_id uuid REFERENCES public.audio_narrative_versions(id) ON DELETE SET NULL,
  call_id              text,
  placement_key        text,
  event_type           text NOT NULL,
  duration_ms          integer,
  char_count           integer,
  voice_name           text,
  locale               text,
  browser_supported    boolean,
  error_code           text,
  occurred_at          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT audio_playback_events_type_chk CHECK (event_type IN
    ('requested','started','paused','resumed','stopped','completed','error','transcript_opened','unsupported','denied'))
);
CREATE INDEX audio_playback_events_tenant_time_idx ON public.audio_playback_events (tenant_id, occurred_at DESC);
CREATE INDEX audio_playback_events_call_idx ON public.audio_playback_events (tenant_id, call_id, event_type);

GRANT SELECT, INSERT ON public.audio_playback_events TO authenticated;
GRANT ALL ON public.audio_playback_events TO service_role;
ALTER TABLE public.audio_playback_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY audio_playback_events_insert ON public.audio_playback_events
  FOR INSERT TO authenticated
  WITH CHECK (public.audio_can_view(tenant_id) AND user_id = auth.uid());
CREATE POLICY audio_playback_events_select ON public.audio_playback_events
  FOR SELECT TO authenticated USING (
    user_id = auth.uid() OR public.audio_can_manage(tenant_id, 'audio.analytics.view')
  );

CREATE OR REPLACE FUNCTION public.audio_playback_events_reject_mutation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  RAISE EXCEPTION 'audio_playback_events is append only';
END $$;

CREATE TRIGGER audio_playback_events_immutable
  BEFORE UPDATE OR DELETE ON public.audio_playback_events
  FOR EACH ROW EXECUTE FUNCTION public.audio_playback_events_reject_mutation();

-- ---------- 10. Lock down helper execution ---------------------------
REVOKE EXECUTE ON FUNCTION public.audio_set_actor_and_timestamp() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.audio_narrative_guard() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.audio_narrative_version_guard() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.audio_placement_guard() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.audio_narrative_delete_guard() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.audio_playback_events_reject_mutation() FROM anon, public;
