-- AI-Powered Customer Guidance Agent — foundation migration.
--
-- 1. Formalizes public.nova_knowledge_base under version control. This table
--    already exists on the live database (created directly against it, not via
--    a tracked migration), so every statement here is written to be safe to run
--    against a database that already has it: CREATE TABLE IF NOT EXISTS,
--    DROP POLICY IF EXISTS before CREATE POLICY, etc.
-- 2. Adds a unique constraint on `route` so the automated catalog-sync job can
--    upsert new page entries with ON CONFLICT (route) DO NOTHING.
-- 3. Broadens read access beyond platform_admin so the guidance agent (and any
--    future direct client read) can see active catalog entries.
-- 4. Creates guidance_agent_interactions, the interaction/escalation log for
--    the new guidance agent — every "ask" turn is logged regardless of
--    outcome, doubling as the analytics source for content-gap discovery.

CREATE TABLE IF NOT EXISTS public.nova_knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  route text NOT NULL,
  description text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.nova_knowledge_base ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'nova_knowledge_base_route_key'
  ) THEN
    ALTER TABLE public.nova_knowledge_base
      ADD CONSTRAINT nova_knowledge_base_route_key UNIQUE (route);
  END IF;
END $$;

DROP POLICY IF EXISTS "Platform admins manage nova_knowledge_base" ON public.nova_knowledge_base;
CREATE POLICY "Platform admins manage nova_knowledge_base"
  ON public.nova_knowledge_base
  FOR ALL
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users read active nova_knowledge_base" ON public.nova_knowledge_base;
CREATE POLICY "Authenticated users read active nova_knowledge_base"
  ON public.nova_knowledge_base
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE INDEX IF NOT EXISTS idx_nova_knowledge_base_active_sort
  ON public.nova_knowledge_base (sort_order)
  WHERE is_active = true;

CREATE TABLE IF NOT EXISTS public.guidance_agent_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL,
  question text NOT NULL,
  answer text,
  matched_catalog_ids text[] NOT NULL DEFAULT '{}',
  confidence integer,
  escalated boolean NOT NULL DEFAULT false,
  escalated_at timestamptz,
  escalation_note text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'triaged', 'resolved', 'dismissed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.guidance_agent_interactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own guidance interactions" ON public.guidance_agent_interactions;
CREATE POLICY "Users read own guidance interactions"
  ON public.guidance_agent_interactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "Users insert own guidance interactions" ON public.guidance_agent_interactions;
CREATE POLICY "Users insert own guidance interactions"
  ON public.guidance_agent_interactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Platform admins update guidance interactions" ON public.guidance_agent_interactions;
CREATE POLICY "Platform admins update guidance interactions"
  ON public.guidance_agent_interactions
  FOR UPDATE
  TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "Platform admins delete guidance interactions" ON public.guidance_agent_interactions;
CREATE POLICY "Platform admins delete guidance interactions"
  ON public.guidance_agent_interactions
  FOR DELETE
  TO authenticated
  USING (public.is_platform_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_guidance_interactions_user ON public.guidance_agent_interactions (user_id);
CREATE INDEX IF NOT EXISTS idx_guidance_interactions_escalated ON public.guidance_agent_interactions (escalated) WHERE escalated = true;
CREATE INDEX IF NOT EXISTS idx_guidance_interactions_created ON public.guidance_agent_interactions (created_at DESC);
