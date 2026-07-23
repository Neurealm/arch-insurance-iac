
ALTER FUNCTION public.is_valid_timezone(text)          SET search_path = public;
ALTER FUNCTION public.normalize_slug(text)             SET search_path = public;
ALTER FUNCTION public.audit_events_reject_mutation()   SET search_path = public;

REVOKE ALL ON FUNCTION public.profiles_protect_governed_fields() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_valid_timezone(text)              FROM PUBLIC;
REVOKE ALL ON FUNCTION public.normalize_slug(text)                 FROM PUBLIC;
