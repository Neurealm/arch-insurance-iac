import { useEffect, useState } from "react";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAccess } from "@/platform/access/AccessContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ConfirmDialog } from "@/platform/components/ConfirmDialog";
import { sanitizeError } from "@/platform/components/States";

const schema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  slug: z.string().trim().regex(/^[a-z0-9](?:[a-z0-9-]{1,48}[a-z0-9])?$/,
    "Lowercase letters, numbers and hyphens (2–50 chars)"),
  currency: z.string().trim().length(3).regex(/^[A-Z]{3}$/i, "3-letter ISO 4217"),
  timezone: z.string().trim().min(3).max(64),
});

export default function TenantSettings() {
  const { activeTenant, activeTenantId, hasPermission, refresh } = useAccess();
  const canEdit = hasPermission("tenant.update");
  const qc = useQueryClient();

  const [values, setValues] = useState({ name: "", slug: "", currency: "", timezone: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmSlug, setConfirmSlug] = useState(false);
  const originalSlug = activeTenant?.slug ?? "";

  useEffect(() => {
    if (activeTenant) {
      setValues({
        name: activeTenant.name,
        slug: activeTenant.slug,
        currency: activeTenant.default_currency_code,
        timezone: activeTenant.default_timezone,
      });
      setErrors({});
    }
  }, [activeTenant?.tenant_id]);

  const save = useMutation({
    mutationFn: async () => {
      const parsed = schema.safeParse(values);
      if (!parsed.success) {
        const e: Record<string, string> = {};
        parsed.error.issues.forEach((i) => { e[i.path[0] as string] = i.message; });
        setErrors(e);
        throw new Error("validation");
      }
      setErrors({});
      const { data, error } = await supabase.rpc("update_tenant", {
        p_tenant_id: activeTenantId!,
        p_name: parsed.data.name,
        p_slug: parsed.data.slug,
        p_default_currency_code: parsed.data.currency.toUpperCase(),
        p_default_timezone: parsed.data.timezone,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      toast.success("Workspace settings saved");
      await refresh();
      qc.invalidateQueries({ queryKey: ["platform"] });
    },
    onError: (err) => {
      if ((err as Error).message !== "validation") toast.error(sanitizeError((err as Error).message));
    },
  });

  const submit = () => {
    if (values.slug !== originalSlug) { setConfirmSlug(true); return; }
    save.mutate();
  };

  if (!activeTenant) return null;

  return (
    <>
      <Card className="max-w-2xl">
        <CardHeader><CardTitle className="text-sm font-medium">Workspace settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Field id="ws-name" label="Name" value={values.name} err={errors.name} disabled={!canEdit}
            onChange={(v) => setValues((s) => ({ ...s, name: v }))} />
          <Field id="ws-slug" label="Slug" value={values.slug} err={errors.slug} disabled={!canEdit}
            hint="Lowercase letters, numbers, and hyphens. Changing breaks existing URLs."
            onChange={(v) => setValues((s) => ({ ...s, slug: v.toLowerCase() }))} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="ws-currency" label="Default currency" value={values.currency} err={errors.currency}
              disabled={!canEdit} maxLength={3} hint="3-letter ISO 4217 (USD, EUR)."
              onChange={(v) => setValues((s) => ({ ...s, currency: v.toUpperCase() }))} />
            <Field id="ws-tz" label="Default timezone" value={values.timezone} err={errors.timezone}
              disabled={!canEdit} hint="IANA name (e.g. America/New_York)."
              onChange={(v) => setValues((s) => ({ ...s, timezone: v }))} />
          </div>
          <div className="flex justify-end">
            <Button onClick={submit} disabled={!canEdit || save.isPending}>
              {save.isPending ? "Saving…" : "Save changes"}
            </Button>
          </div>
          {!canEdit && (
            <p className="text-xs text-muted-foreground">You need the <span className="font-mono">tenant.update</span> permission to edit these settings.</p>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmSlug}
        onOpenChange={setConfirmSlug}
        title="Change workspace slug?"
        description={<>Changing the slug from <b>{originalSlug}</b> to <b>{values.slug}</b> may break bookmarks and external links.</>}
        confirmLabel="Change slug"
        destructive
        onConfirm={async () => { await save.mutateAsync(); }}
      />
    </>
  );
}

function Field({
  id, label, value, err, onChange, hint, disabled, maxLength,
}: { id: string; label: string; value: string; err?: string; onChange: (v: string) => void; hint?: string; disabled?: boolean; maxLength?: number }) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} disabled={disabled} maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)} aria-invalid={!!err}
        aria-describedby={err ? `${id}-err` : hint ? `${id}-hint` : undefined} />
      {hint && !err && <p id={`${id}-hint`} className="text-xs text-muted-foreground">{hint}</p>}
      {err && <p id={`${id}-err`} className="text-xs text-destructive">{err}</p>}
    </div>
  );
}
