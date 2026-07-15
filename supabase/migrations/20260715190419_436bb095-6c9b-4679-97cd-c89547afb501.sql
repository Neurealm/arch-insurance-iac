CREATE OR REPLACE FUNCTION public.etdm_enforce_practice()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF (NEW.approval_status = 'Approved' OR NEW.is_active = true)
       AND (NEW.neurealm_practice IS NULL OR btrim(NEW.neurealm_practice) = '') THEN
      RAISE EXCEPTION 'A Neurealm Practice must be selected before a Technology can be Approved or Activated.'
        USING ERRCODE = 'check_violation';
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF (NEW.neurealm_practice IS NULL OR btrim(NEW.neurealm_practice) = '')
       AND (
         (NEW.approval_status = 'Approved' AND COALESCE(OLD.approval_status,'') <> 'Approved')
         OR (NEW.is_active = true AND COALESCE(OLD.is_active,false) = false)
       ) THEN
      RAISE EXCEPTION 'A Neurealm Practice must be selected before a Technology can be Approved or Activated.'
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;