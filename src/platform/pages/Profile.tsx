import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LoadingState, ErrorState, sanitizeError } from "@/platform/components/States";

// Reuses the canonical public.profiles record — no duplicate model.
// Editable fields are limited; governed fields (approval, must_change_password,
// user_category, company_id) are shown read-only and remain protected by RLS.
const schema = z.object({
  first_name: z.string().trim().max(80).optional().or(z.literal("")),
  last_name: z.string().trim().max(80).optional().or(z.literal("")),
  display_name: z.string().trim().max(120).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  job_title: z.string().trim().max(120).optional().or(z.literal("")),
  department: z.string().trim().max(120).optional().or(z.literal("")),
  location: z.string().trim().max(120).optional().or(z.literal("")),
  time_zone: z.string().trim().max(64).optional().or(z.literal("")),
  preferred_language: z.string().trim().max(16).optional().or(z.literal("")),
});
type Editable = z.infer<typeof schema>;

const EDITABLE_KEYS: (keyof Editable)[] = [
  "first_name","last_name","display_name","phone","job_title",
  "department","location","time_zone","preferred_language",
];

export default function Profile() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [values, setValues] = useState<Editable>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const profile = useQuery({
    queryKey: ["platform", "profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user!.id).maybeSingle();
      if (error) throw error;
      return data as Record<string, any> | null;
    },
  });

  useEffect(() => {
    if (profile.data) {
      const next: Editable = {};
      EDITABLE_KEYS.forEach((k) => { (next as any)[k] = profile.data?.[k] ?? ""; });
      setValues(next); setErrors({});
    }
  }, [profile.data?.id]);

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
      const patch: Record<string, any> = {};
      EDITABLE_KEYS.forEach((k) => { patch[k] = (parsed.data as any)[k] || null; });
      const { error } = await supabase.from("profiles").update(patch as any).eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profile updated");
      qc.invalidateQueries({ queryKey: ["platform", "profile"] });
    },
    onError: (e) => { if ((e as Error).message !== "validation") toast.error(sanitizeError((e as Error).message)); },
  });

  if (profile.isLoading) return <LoadingState />;
  if (profile.error) return <ErrorState error={profile.error} onRetry={() => profile.refetch()} />;
  const p = profile.data ?? {};

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader><CardTitle className="text-sm font-medium">Personal details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Text id="first_name" label="First name" values={values} errors={errors} setValues={setValues} />
            <Text id="last_name" label="Last name" values={values} errors={errors} setValues={setValues} />
          </div>
          <Text id="display_name" label="Display name" values={values} errors={errors} setValues={setValues} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Text id="phone" label="Phone" values={values} errors={errors} setValues={setValues} />
            <Text id="job_title" label="Job title" values={values} errors={errors} setValues={setValues} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Text id="department" label="Department" values={values} errors={errors} setValues={setValues} />
            <Text id="location" label="Location" values={values} errors={errors} setValues={setValues} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Text id="time_zone" label="Time zone" values={values} errors={errors} setValues={setValues} />
            <Text id="preferred_language" label="Preferred language" values={values} errors={errors} setValues={setValues} />
          </div>
          <div className="flex justify-end">
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save profile"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm font-medium">Account</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <ReadOnly label="Email" value={p.email ?? user?.email ?? "—"} />
          <ReadOnly label="Approval status" value={p.approval_status ?? "—"} />
          <ReadOnly label="Category" value={p.user_category ?? "—"} />
          <ReadOnly label="Company" value={p.company ?? "—"} />
          <p className="text-xs text-muted-foreground">
            Governed fields are managed by administrators and cannot be edited here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Text({ id, label, values, errors, setValues }: {
  id: keyof Editable; label: string;
  values: Editable; errors: Record<string, string>;
  setValues: React.Dispatch<React.SetStateAction<Editable>>;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={`pf-${id}`}>{label}</Label>
      <Input id={`pf-${id}`} value={(values as any)[id] ?? ""}
        onChange={(e) => setValues((s) => ({ ...s, [id]: e.target.value }))}
        aria-invalid={!!errors[id]} aria-describedby={errors[id] ? `pf-${id}-err` : undefined} />
      {errors[id] && <p id={`pf-${id}-err`} className="text-xs text-destructive">{errors[id]}</p>}
    </div>
  );
}
function ReadOnly({ label, value }: { label: string; value: string }) {
  return (<div><div className="text-xs text-muted-foreground">{label}</div><div className="text-foreground">{value}</div></div>);
}
