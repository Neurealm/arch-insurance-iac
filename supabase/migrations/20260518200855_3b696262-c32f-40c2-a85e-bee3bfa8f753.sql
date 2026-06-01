UPDATE public.org_capability_areas SET description = '' WHERE description IS NULL;
ALTER TABLE public.org_capability_areas ALTER COLUMN description SET DEFAULT '';
ALTER TABLE public.org_capability_areas ALTER COLUMN description SET NOT NULL;