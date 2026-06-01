
CREATE TABLE public.stakeholder_registers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  register_id TEXT NOT NULL,
  stakeholder_name TEXT NOT NULL,
  company TEXT DEFAULT '',
  role TEXT DEFAULT '',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  department TEXT DEFAULT '',
  priority TEXT NOT NULL DEFAULT 'Medium',
  influence_level TEXT NOT NULL DEFAULT 'Medium',
  engagement_strategy TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  status BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.stakeholder_registers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view stakeholder registers"
  ON public.stakeholder_registers FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert stakeholder registers"
  ON public.stakeholder_registers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update stakeholder registers"
  ON public.stakeholder_registers FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete stakeholder registers"
  ON public.stakeholder_registers FOR DELETE
  USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_stakeholder_registers_updated_at
BEFORE UPDATE ON public.stakeholder_registers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
