ALTER TABLE public.commercial_stage_gates DROP CONSTRAINT commercial_stage_gates_status_check;
ALTER TABLE public.commercial_stage_gates ADD CONSTRAINT commercial_stage_gates_status_check
  CHECK (status = ANY (ARRAY['not_started'::text,'in_progress'::text,'passed'::text,'blocked'::text,'failed'::text,'not_applicable'::text]));