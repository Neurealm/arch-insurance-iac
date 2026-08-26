import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "./AuthLayout";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const TIME_ZONES = [
  "UTC","America/New_York","America/Chicago","America/Denver","America/Los_Angeles",
  "Europe/London","Europe/Berlin","Europe/Paris","Asia/Dubai","Asia/Kolkata","Asia/Tokyo",
];

export default function CompleteProfile() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    first_name: "", last_name: "", phone: "", job_title: "",
    working_location_type: "", time_zone: "", preferred_contact_method: "email",
  });

  useEffect(() => {
    if (!authLoading && !user) navigate("/login", { replace: true });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
      if (data) {
        setForm({
          first_name: (data as any).first_name ?? (data as any).full_name?.split(" ")[0] ?? "",
          last_name: (data as any).last_name ?? (data as any).full_name?.split(" ").slice(1).join(" ") ?? "",
          phone: (data as any).phone ?? "",
          job_title: (data as any).job_title ?? "",
          working_location_type: (data as any).working_location_type ?? "",
          time_zone: (data as any).time_zone ?? "",
          preferred_contact_method: (data as any).preferred_contact_method ?? "email",
        });
      }
      setLoading(false);
    })();
  }, [user]);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const onSave = async () => {
    if (!user) return;
    setSaving(true);
    const first = form.first_name.trim();
    const last = form.last_name.trim();
    const full_name = [first, last].filter(Boolean).join(" ") || null;
    const patch: any = {
      first_name: first || null,
      last_name: last || null,
      full_name,
      display_name: full_name,
      phone: form.phone || null,
      job_title: form.job_title || null,
      working_location_type: form.working_location_type || null,
      time_zone: form.time_zone || null,
      preferred_contact_method: form.preferred_contact_method || null,
      profile_completed_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("profiles").update(patch).eq("user_id", user.id);
    if (!error && full_name) await supabase.auth.updateUser({ data: { full_name } });
    setSaving(false);
    if (error) toast({ title: "Save failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Profile saved" }); navigate("/connections", { replace: true }); }
  };

  const skip = () => navigate("/connections", { replace: true });

  return (
    <AuthLayout
      title="Complete your profile"
      subtitle="A few quick details so teammates can reach you. You can skip this and fill it in anytime from your account panel."
    >
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>First name</Label><Input value={form.first_name} onChange={(e) => set("first_name", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Last name</Label><Input value={form.last_name} onChange={(e) => set("last_name", e.target.value)} /></div>
          </div>
          <div className="space-y-1.5"><Label>Phone</Label><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+1 555 000 1234" /></div>
          <div className="space-y-1.5"><Label>Job title</Label><Input value={form.job_title} onChange={(e) => set("job_title", e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Working location</Label>
              <Select value={form.working_location_type} onValueChange={(v) => set("working_location_type", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="onsite">Onsite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Time zone</Label>
              <Select value={form.time_zone} onValueChange={(v) => set("time_zone", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{TIME_ZONES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Preferred contact</Label>
            <Select value={form.preferred_contact_method} onValueChange={(v) => set("preferred_contact_method", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="phone">Phone call</SelectItem>
                <SelectItem value="push">Push notification</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={skip}>Skip for now</Button>
            <Button className="flex-1" onClick={onSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Save & continue
            </Button>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
