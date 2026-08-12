import { useState } from "react";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useAccess } from "@/platform/access/AccessContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { sanitizeError } from "@/platform/components/States";
import { CURRENCY_OPTIONS, TIMEZONE_OPTIONS } from "@/platform/data/tenantOptions";


const schema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  slug: z.string().trim().regex(/^[a-z0-9](?:[a-z0-9-]{1,48}[a-z0-9])?$/,
    "Lowercase letters, numbers and hyphens (2–50 chars, no leading/trailing hyphen)"),
  timezone: z.string().trim().min(3).max(64),
  currency: z.string().trim().length(3, "3-letter ISO 4217 code").regex(/^[A-Z]{3}$/i, "e.g. USD"),
});

export function CreateTenantDialog() {
  const { user } = useAuth();
  const { refresh, switchTenant } = useAccess();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState({ name: "", slug: "", timezone: "America/New_York", currency: "USD" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const create = useMutation({
    mutationFn: async () => {
      const parsed = schema.safeParse(values);
      if (!parsed.success) {
        const e: Record<string, string> = {};
        parsed.error.issues.forEach((i) => { e[i.path[0] as string] = i.message; });
        setErrors(e);
        throw new Error("Please fix the highlighted fields.");
      }
      setErrors({});
      const { data, error } = await supabase.rpc("provision_tenant", {
        _name: parsed.data.name,
        _slug: parsed.data.slug,
        _admin_user_id: user!.id,
        _timezone: parsed.data.timezone,
        _currency: parsed.data.currency.toUpperCase(),
      });
      if (error) throw error;
      return data as string;
    },
    onSuccess: async (newId) => {
      toast.success("Workspace created");
      await refresh();
      if (newId) await switchTenant(newId);
      setOpen(false);
      setValues({ name: "", slug: "", timezone: "America/New_York", currency: "USD" });
    },
    onError: (err) => {
      const msg = sanitizeError((err as Error).message);
      if (!Object.keys(errors).length) toast.error(msg);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline"><Plus className="mr-1 h-4 w-4" aria-hidden="true" />New workspace</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create workspace</DialogTitle>
          <DialogDescription>
            Provisions a new tenant. You will become its first administrator.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <Field id="ct-name" label="Name" value={values.name} err={errors.name}
            onChange={(v) => setValues((s) => ({ ...s, name: v }))} autoFocus />
          <Field id="ct-slug" label="Slug" value={values.slug} err={errors.slug}
            onChange={(v) => setValues((s) => ({ ...s, slug: v.toLowerCase() }))}
            hint="Used in URLs. Lowercase letters, numbers, hyphens." />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="ct-tz">Timezone</Label>
              <Select value={values.timezone} onValueChange={(v) => setValues((s) => ({ ...s, timezone: v }))}>
                <SelectTrigger id="ct-tz" aria-invalid={!!errors.timezone}
                  aria-describedby={errors.timezone ? "ct-tz-err" : "ct-tz-hint"}>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {TIMEZONE_OPTIONS.map((tz) => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.timezone
                ? <p id="ct-tz-err" className="text-xs text-destructive">{errors.timezone}</p>
                : <p id="ct-tz-hint" className="text-xs text-muted-foreground">IANA name.</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="ct-cur">Currency</Label>
              <Select value={values.currency} onValueChange={(v) => setValues((s) => ({ ...s, currency: v.toUpperCase() }))}>
                <SelectTrigger id="ct-cur" aria-invalid={!!errors.currency}
                  aria-describedby={errors.currency ? "ct-cur-err" : "ct-cur-hint"}>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {CURRENCY_OPTIONS.map((c) => <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.currency
                ? <p id="ct-cur-err" className="text-xs text-destructive">{errors.currency}</p>
                : <p id="ct-cur-hint" className="text-xs text-muted-foreground">ISO 4217.</p>}
            </div>
          </div>

        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={create.isPending}>Cancel</Button>
          <Button onClick={() => create.mutate()} disabled={create.isPending}>
            {create.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" aria-hidden="true" />}
            {create.isPending ? "Provisioning…" : "Create workspace"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  id, label, value, err, onChange, hint, autoFocus,
}: { id: string; label: string; value: string; err?: string; onChange: (v: string) => void; hint?: string; autoFocus?: boolean }) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} autoFocus={autoFocus} onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!err} aria-describedby={err ? `${id}-err` : hint ? `${id}-hint` : undefined} />
      {hint && !err && <p id={`${id}-hint`} className="text-xs text-muted-foreground">{hint}</p>}
      {err && <p id={`${id}-err`} className="text-xs text-destructive">{err}</p>}
    </div>
  );
}
