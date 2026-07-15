import { ReactNode, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BadgeCheck,
  Bell,
  Building2,
  CalendarClock,
  Check,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  Phone,
  Plus,
  ShieldCheck,
  Trash2,
  Upload,
  User as UserIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { toast } from "@/hooks/use-toast";

const TIME_ZONES = [
  "UTC","America/New_York","America/Chicago","America/Denver","America/Los_Angeles",
  "Europe/London","Europe/Berlin","Europe/Paris","Asia/Dubai","Asia/Kolkata",
  "Asia/Singapore","Asia/Tokyo","Australia/Sydney",
];
const LANGUAGES = [
  { value: "en", label: "English" }, { value: "es", label: "Spanish" },
  { value: "fr", label: "French" }, { value: "de", label: "German" },
  { value: "pt", label: "Portuguese" }, { value: "hi", label: "Hindi" },
  { value: "zh", label: "Chinese" }, { value: "ja", label: "Japanese" },
];
const OFFICE_SITES = ["HQ - New York", "Chicago", "Austin", "Bengaluru", "London", "Singapore", "Remote"];
const WEEKDAYS = ["mon","tue","wed","thu","fri","sat","sun"] as const;
const WEEKDAY_LABELS: Record<string, string> = { mon:"Mon", tue:"Tue", wed:"Wed", thu:"Thu", fri:"Fri", sat:"Sat", sun:"Sun" };
const PRIORITIES = ["P1","P2","P3","P4"] as const;
const CHANNELS = ["email","sms","phone","push"] as const;

type WeeklyHours = Record<string, { start: string; end: string; off?: boolean }>;
const DEFAULT_WEEKLY_HOURS: WeeklyHours = Object.fromEntries(
  WEEKDAYS.map(d => [d, { start: "09:00", end: "17:00", off: d === "sat" || d === "sun" }])
) as WeeklyHours;

type ContactMethod = { id: string; method_type: string; value: string; verified: boolean; label: string | null };
type NotifRule = { id: string; priority: string; channels: string[]; timing: string | null; escalate_after_minutes: number | null };

export function AccountPanel({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="max-h-[92vh]">
        <div className="mx-auto w-full max-w-5xl overflow-y-auto px-4 pb-8 md:px-8">
          <AccountPanelBody onRequestClose={() => setOpen(false)} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function AccountPanelBody({ onRequestClose }: { onRequestClose: () => void }) {
  const { user } = useAuth();
  const { displayName, initials, email, signOut } = useUserProfile();
  const navigate = useNavigate();

  const [tab, setTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [contacts, setContacts] = useState<ContactMethod[]>([]);
  const [rules, setRules] = useState<NotifRule[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const [{ data: p }, { data: c }, { data: r }] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("user_contact_methods" as any).select("*").eq("user_id", user.id).order("created_at"),
        supabase.from("user_notification_rules" as any).select("*").eq("user_id", user.id).order("priority"),
      ]);
      setProfile(p);
      setContacts((c ?? []) as any);
      setRules((r ?? []) as any);
      setLoading(false);
    })();
  }, [user?.id]);

  if (!user) return null;

  return (
    <>
      <DrawerHeader className="px-0 pt-6">
        <div className="flex items-center gap-4">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="h-14 w-14 rounded-full object-cover border" />
          ) : (
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-indigo to-ai text-white grid place-items-center text-lg font-semibold shadow-[var(--shadow-md)]">
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <DrawerTitle className="text-xl">{displayName}</DrawerTitle>
            <DrawerDescription className="flex items-center gap-2">
              <span className="truncate">{email}</span>
              <Badge variant="outline" className="gap-1 text-[10px]">
                <BadgeCheck className="h-3 w-3 text-status-healthy" /> Verified
              </Badge>
            </DrawerDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-destructive hover:text-destructive"
            onClick={async () => { await signOut(); onRequestClose(); navigate("/"); }}
          >
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>

        {profile && !profile.profile_completed_at && (
          <div className="mt-3 rounded-lg border border-ai/30 bg-ai/5 px-3 py-2 text-xs text-foreground">
            Finish setting up your profile so teammates can reach you the right way.
          </div>
        )}
      </DrawerHeader>

      <Tabs value={tab} onValueChange={setTab} className="mt-2">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="profile"><UserIcon className="h-4 w-4 mr-1.5" />Profile</TabsTrigger>
          <TabsTrigger value="availability"><CalendarClock className="h-4 w-4 mr-1.5" />Availability</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="h-4 w-4 mr-1.5" />Notifications</TabsTrigger>
          <TabsTrigger value="security"><ShieldCheck className="h-4 w-4 mr-1.5" />Security</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {loading ? (
            <div className="space-y-3"><Skeleton className="h-9 w-full" /><Skeleton className="h-9 w-full" /><Skeleton className="h-9 w-2/3" /></div>
          ) : (
            <>
              <TabsContent value="profile"><ProfileTab profile={profile} setProfile={setProfile} userId={user.id} userEmail={email} /></TabsContent>
              <TabsContent value="availability"><AvailabilityTab profile={profile} setProfile={setProfile} userId={user.id} /></TabsContent>
              <TabsContent value="notifications"><NotificationsTab profile={profile} setProfile={setProfile} userId={user.id} contacts={contacts} setContacts={setContacts} rules={rules} setRules={setRules} /></TabsContent>
              <TabsContent value="security"><SecurityTab userId={user.id} userEmail={email} userUpdatedAt={user.updated_at ?? user.created_at} /></TabsContent>
            </>
          )}
        </div>
      </Tabs>
    </>
  );
}

/* ---------------- PROFILE TAB ---------------- */
function ProfileTab({ profile, setProfile, userId, userEmail }: { profile: any; setProfile: (p: any) => void; userId: string; userEmail: string }) {
  const [form, setForm] = useState({
    first_name: profile?.first_name ?? (profile?.full_name?.split(" ")[0] ?? ""),
    last_name: profile?.last_name ?? (profile?.full_name?.split(" ").slice(1).join(" ") ?? ""),
    phone: profile?.phone ?? "",
    job_title: profile?.job_title ?? "",
    department: profile?.department ?? "",
    company: profile?.company ?? "",
    location: profile?.location ?? "",
    preferred_language: profile?.preferred_language ?? "",
    avatar_url: profile?.avatar_url ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast({ title: "Invalid file", description: "Please choose an image.", variant: "destructive" });
    if (file.size > 5 * 1024 * 1024) return toast({ title: "File too large", description: "Max 5MB.", variant: "destructive" });
    setUploading(true);
    const ext = file.name.split(".").pop() || "png";
    const path = `${userId}/avatar-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
    if (error) { setUploading(false); return toast({ title: "Upload failed", description: error.message, variant: "destructive" }); }
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    set("avatar_url", pub.publicUrl);
    setUploading(false);
    toast({ title: "Photo uploaded", description: "Click Save to keep it." });
  };

  const onSave = async () => {
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
      department: form.department || null,
      company: form.company || null,
      location: form.location || null,
      preferred_language: form.preferred_language || null,
      avatar_url: form.avatar_url || null,
    };
    const { error } = await supabase.from("profiles").update(patch).eq("user_id", userId);
    if (!error) await supabase.auth.updateUser({ data: { full_name } });
    setSaving(false);
    if (error) toast({ title: "Save failed", description: error.message, variant: "destructive" });
    else {
      setProfile({ ...profile, ...patch });
      toast({ title: "Profile saved" });
    }
  };

  return (
    <div className="rounded-xl border bg-card p-5 space-y-5">
      <div className="flex items-center gap-4">
        {form.avatar_url ? (
          <img src={form.avatar_url} alt="" className="h-16 w-16 rounded-full object-cover border" />
        ) : (
          <div className="h-16 w-16 rounded-full bg-accent grid place-items-center text-indigo"><UserIcon className="h-7 w-7" /></div>
        )}
        <div>
          <Label htmlFor="avatar_file" className="inline-flex items-center gap-2 cursor-pointer rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-accent">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? "Uploading…" : form.avatar_url ? "Change photo" : "Upload photo"}
          </Label>
          <input id="avatar_file" type="file" accept="image/*" className="hidden" onChange={onUpload} disabled={uploading} />
          <p className="mt-1 text-xs text-muted-foreground">PNG or JPG, up to 5MB.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name"><Input value={form.first_name} onChange={(e) => set("first_name", e.target.value)} /></Field>
        <Field label="Last name"><Input value={form.last_name} onChange={(e) => set("last_name", e.target.value)} /></Field>
        <Field label="Email">
          <div className="flex items-center gap-2">
            <Input value={userEmail} disabled />
            <Badge variant="outline" className="gap-1"><BadgeCheck className="h-3 w-3 text-status-healthy" /> Verified</Badge>
          </div>
        </Field>
        <Field label="Phone"><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+1 555 000 1234" /></Field>
        <Field label="Job title"><Input value={form.job_title} onChange={(e) => set("job_title", e.target.value)} /></Field>
        <Field label="Department"><Input value={form.department} onChange={(e) => set("department", e.target.value)} /></Field>
        <Field label="Company"><Input value={form.company} onChange={(e) => set("company", e.target.value)} /></Field>
        <Field label="Location"><Input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="New York, USA" /></Field>
        <Field label="Preferred language">
          <Select value={form.preferred_language} onValueChange={(v) => set("preferred_language", v)}>
            <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
            <SelectContent>{LANGUAGES.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
      </div>

      <div className="flex justify-end">
        <Button onClick={onSave} disabled={saving} className="min-w-32">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Save changes
        </Button>
      </div>
    </div>
  );
}

/* ---------------- AVAILABILITY TAB ---------------- */
function AvailabilityTab({ profile, setProfile, userId }: { profile: any; setProfile: (p: any) => void; userId: string }) {
  const [wt, setWt] = useState(profile?.working_location_type ?? "remote");
  const [site, setSite] = useState(profile?.office_site ?? "");
  const [hybrid, setHybrid] = useState<string[]>(profile?.hybrid_days ?? []);
  const [tz, setTz] = useState(profile?.time_zone ?? "");
  const [hours, setHours] = useState<WeeklyHours>({ ...DEFAULT_WEEKLY_HOURS, ...(profile?.weekly_hours ?? {}) });
  const [sameWeekday, setSameWeekday] = useState(false);
  const [ooo, setOoo] = useState(!!profile?.ooo_enabled);
  const [oooStart, setOooStart] = useState<string>(profile?.ooo_start ?? "");
  const [oooEnd, setOooEnd] = useState<string>(profile?.ooo_end ?? "");
  const [delegate, setDelegate] = useState<string>(profile?.ooo_delegate_user_id ?? "");
  const [delegateOptions, setDelegateOptions] = useState<{ user_id: string; full_name: string | null; email: string }[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("profiles").select("user_id, full_name, email").neq("user_id", userId).order("full_name").limit(50);
      setDelegateOptions((data ?? []) as any);
    })();
  }, [userId]);

  const toggleHybrid = (d: string) => setHybrid((prev) => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  const setHour = (d: string, key: "start" | "end" | "off", value: any) => {
    setHours((h) => ({ ...h, [d]: { ...h[d], [key]: value } }));
    if (sameWeekday && ["tue","wed","thu","fri"].includes(d)) return;
    if (sameWeekday && d === "mon") {
      setHours((h) => {
        const monRow = { ...h.mon, [key]: value };
        const next = { ...h, mon: monRow };
        for (const wd of ["tue","wed","thu","fri"]) next[wd] = { ...monRow };
        return next;
      });
    }
  };

  const onSave = async () => {
    setSaving(true);
    const patch: any = {
      working_location_type: wt || null,
      office_site: site || null,
      hybrid_days: wt === "hybrid" ? hybrid : null,
      time_zone: tz || null,
      weekly_hours: hours,
      ooo_enabled: ooo,
      ooo_start: ooo && oooStart ? oooStart : null,
      ooo_end: ooo && oooEnd ? oooEnd : null,
      ooo_delegate_user_id: ooo && delegate ? delegate : null,
    };
    const { error } = await supabase.from("profiles").update(patch).eq("user_id", userId);
    setSaving(false);
    if (error) toast({ title: "Save failed", description: error.message, variant: "destructive" });
    else { setProfile({ ...profile, ...patch }); toast({ title: "Availability saved" }); }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border bg-card p-5 space-y-4">
        <div>
          <Label className="text-sm font-semibold">Working location</Label>
          <div className="mt-2 inline-flex rounded-lg border p-0.5 bg-muted">
            {(["remote","hybrid","onsite"] as const).map((v) => (
              <button key={v} onClick={() => setWt(v)} className={`px-4 py-1.5 text-sm rounded-md capitalize transition ${wt === v ? "bg-background shadow-sm font-semibold" : "text-muted-foreground"}`}>{v}</button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Office / site">
            <Select value={site} onValueChange={setSite}>
              <SelectTrigger><SelectValue placeholder="Select office" /></SelectTrigger>
              <SelectContent>{OFFICE_SITES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Time zone">
            <Select value={tz} onValueChange={setTz}>
              <SelectTrigger><SelectValue placeholder="Select time zone" /></SelectTrigger>
              <SelectContent>{TIME_ZONES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
        </div>

        {wt === "hybrid" && (
          <div>
            <Label className="text-sm font-semibold">In-office days</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {["mon","tue","wed","thu","fri"].map((d) => (
                <button key={d} onClick={() => toggleHybrid(d)} className={`px-3 py-1.5 rounded-full text-xs font-medium border ${hybrid.includes(d) ? "bg-indigo text-white border-indigo" : "bg-background hover:bg-accent"}`}>{WEEKDAY_LABELS[d]}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">Hours of operation</Label>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <Checkbox checked={sameWeekday} onCheckedChange={(v) => setSameWeekday(!!v)} /> Same schedule Mon–Fri
          </label>
        </div>
        <div className="space-y-1.5">
          {WEEKDAYS.map((d) => {
            const row = hours[d];
            const disabled = sameWeekday && ["tue","wed","thu","fri"].includes(d);
            return (
              <div key={d} className="grid grid-cols-[70px_auto_1fr_1fr] items-center gap-3 text-sm">
                <span className="font-medium">{WEEKDAY_LABELS[d]}</span>
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Checkbox checked={!!row.off} onCheckedChange={(v) => setHour(d, "off", !!v)} /> Off
                </label>
                <Input type="time" value={row.start} onChange={(e) => setHour(d, "start", e.target.value)} disabled={row.off || disabled} />
                <Input type="time" value={row.end} onChange={(e) => setHour(d, "end", e.target.value)} disabled={row.off || disabled} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-semibold">Out of office</Label>
            <p className="text-xs text-muted-foreground">Pages routed to you can be redirected while you're away.</p>
          </div>
          <Switch checked={ooo} onCheckedChange={setOoo} />
        </div>
        {ooo && (
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="From"><Input type="date" value={oooStart} onChange={(e) => setOooStart(e.target.value)} /></Field>
            <Field label="Through"><Input type="date" value={oooEnd} onChange={(e) => setOooEnd(e.target.value)} /></Field>
            <Field label="Delegate">
              <Select value={delegate} onValueChange={setDelegate}>
                <SelectTrigger><SelectValue placeholder="Choose delegate" /></SelectTrigger>
                <SelectContent>
                  {delegateOptions.map((o) => (
                    <SelectItem key={o.user_id} value={o.user_id}>{o.full_name || o.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={onSave} disabled={saving} className="min-w-32">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Save changes
        </Button>
      </div>
    </div>
  );
}

/* ---------------- NOTIFICATIONS TAB ---------------- */
function NotificationsTab({
  profile, setProfile, userId, contacts, setContacts, rules, setRules,
}: {
  profile: any; setProfile: (p: any) => void; userId: string;
  contacts: ContactMethod[]; setContacts: (c: ContactMethod[]) => void;
  rules: NotifRule[]; setRules: (r: NotifRule[]) => void;
}) {
  const [pref, setPref] = useState<string>(profile?.preferred_contact_method ?? "email");
  const [newType, setNewType] = useState<string>("sms");
  const [newValue, setNewValue] = useState("");
  const [savingPref, setSavingPref] = useState(false);
  const [savingRule, setSavingRule] = useState<string | null>(null);

  const rulesByPriority = useMemo(() => {
    const m: Record<string, NotifRule> = {};
    for (const r of rules) m[r.priority] = r;
    return m;
  }, [rules]);

  const addContact = async () => {
    if (!newValue.trim()) return;
    let verified = false;
    if (newType === "push" && typeof Notification !== "undefined") {
      try {
        const perm = await Notification.requestPermission();
        verified = perm === "granted";
      } catch { /* ignore */ }
    }
    const { data, error } = await supabase.from("user_contact_methods" as any).insert({
      user_id: userId, method_type: newType, value: newValue.trim(), verified,
    }).select().single();
    if (error) return toast({ title: "Could not add", description: error.message, variant: "destructive" });
    setContacts([...contacts, data as any]);
    setNewValue("");
    toast({ title: "Contact added" });
  };

  const removeContact = async (id: string) => {
    const { error } = await supabase.from("user_contact_methods" as any).delete().eq("id", id);
    if (error) return toast({ title: "Could not remove", description: error.message, variant: "destructive" });
    setContacts(contacts.filter(c => c.id !== id));
  };

  const savePref = async (v: string) => {
    setPref(v); setSavingPref(true);
    const { error } = await supabase.from("profiles").update({ preferred_contact_method: v }).eq("user_id", userId);
    setSavingPref(false);
    if (error) toast({ title: "Save failed", description: error.message, variant: "destructive" });
    else setProfile({ ...profile, preferred_contact_method: v });
  };

  const saveRule = async (priority: string, patch: Partial<NotifRule>) => {
    const existing = rulesByPriority[priority];
    setSavingRule(priority);
    if (existing) {
      const { error } = await supabase.from("user_notification_rules" as any).update(patch).eq("id", existing.id);
      if (!error) setRules(rules.map(r => r.id === existing.id ? { ...r, ...patch } as NotifRule : r));
      if (error) toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      const { data, error } = await supabase.from("user_notification_rules" as any).insert({
        user_id: userId, priority, channels: [], ...patch,
      }).select().single();
      if (!error && data) setRules([...rules, data as any]);
      if (error) toast({ title: "Save failed", description: error.message, variant: "destructive" });
    }
    setSavingRule(null);
  };

  const toggleChannel = (priority: string, ch: string) => {
    const r = rulesByPriority[priority];
    const current = r?.channels ?? [];
    const next = current.includes(ch) ? current.filter(x => x !== ch) : [...current, ch];
    saveRule(priority, { channels: next });
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-semibold">Contact methods</Label>
            <p className="text-xs text-muted-foreground">How you can be reached.</p>
          </div>
          <div className="text-xs text-muted-foreground">Preferred:
            <Select value={pref} onValueChange={savePref}>
              <SelectTrigger className="ml-2 inline-flex h-8 w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CHANNELS.map(c => <SelectItem key={c} value={c}>{c.toUpperCase()}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          {contacts.map((c) => (
            <div key={c.id} className="flex items-center gap-3 rounded-lg border px-3 py-2 text-sm">
              <ContactIcon type={c.method_type} />
              <span className="font-medium capitalize w-16">{c.method_type}</span>
              <span className="flex-1 truncate">{c.value}</span>
              <Badge variant={c.verified ? "default" : "outline"} className="gap-1 text-[10px]">
                {c.verified ? <><Check className="h-3 w-3" /> Verified</> : "Unverified"}
              </Badge>
              {c.method_type !== "email" && (
                <Button variant="ghost" size="icon" onClick={() => removeContact(c.id)}>
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Select value={newType} onValueChange={setNewType}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="push">Push</SelectItem>
              <SelectItem value="email">Email</SelectItem>
            </SelectContent>
          </Select>
          <Input value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder={newType === "push" ? "Device label" : "+1 555 0000"} />
          <Button variant="outline" onClick={addContact} className="gap-1"><Plus className="h-4 w-4" />Add</Button>
        </div>

        <div className="rounded-md border border-dashed px-3 py-2 flex items-center justify-between opacity-70">
          <div className="text-xs">Connect Slack or Microsoft Teams</div>
          <Button variant="outline" size="sm" disabled>Connect</Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5 space-y-3">
        <div>
          <Label className="text-sm font-semibold">Paging rules by priority</Label>
          <p className="text-xs text-muted-foreground">Controls how <em>you</em> are notified — not the company-wide SLA.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="text-left font-medium py-2">Priority</th>
                {CHANNELS.map(c => <th key={c} className="text-center font-medium py-2 capitalize">{c}</th>)}
                <th className="text-left font-medium py-2">Timing</th>
                <th className="text-left font-medium py-2">Escalate after (min)</th>
              </tr>
            </thead>
            <tbody>
              {PRIORITIES.map((p) => {
                const r = rulesByPriority[p];
                return (
                  <tr key={p} className="border-t">
                    <td className="py-2 font-semibold">{p}</td>
                    {CHANNELS.map(ch => (
                      <td key={ch} className="text-center">
                        <Checkbox checked={r?.channels?.includes(ch) ?? false} onCheckedChange={() => toggleChannel(p, ch)} />
                      </td>
                    ))}
                    <td className="py-2 pr-2">
                      <Input
                        defaultValue={r?.timing ?? ""}
                        onBlur={(e) => e.target.value !== (r?.timing ?? "") && saveRule(p, { timing: e.target.value })}
                        className="h-8"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <Input
                        type="number" min={0}
                        defaultValue={r?.escalate_after_minutes ?? ""}
                        onBlur={(e) => {
                          const v = e.target.value === "" ? null : Number(e.target.value);
                          if (v !== (r?.escalate_after_minutes ?? null)) saveRule(p, { escalate_after_minutes: v });
                        }}
                        className="h-8 w-24"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {savingRule && <p className="text-[11px] text-muted-foreground">Saving {savingRule}…</p>}
      </div>
    </div>
  );
}

function ContactIcon({ type }: { type: string }) {
  if (type === "email") return <Mail className="h-4 w-4 text-muted-foreground" />;
  if (type === "phone") return <Phone className="h-4 w-4 text-muted-foreground" />;
  if (type === "sms") return <Phone className="h-4 w-4 text-muted-foreground" />;
  return <Bell className="h-4 w-4 text-muted-foreground" />;
}

/* ---------------- SECURITY TAB ---------------- */
function SecurityTab({ userId, userEmail, userUpdatedAt }: { userId: string; userEmail: string; userUpdatedAt?: string }) {
  const [sendingReset, setSendingReset] = useState(false);
  const [signingOutOthers, setSigningOutOthers] = useState(false);
  const [mfaLoading, setMfaLoading] = useState(true);
  const [hasTotp, setHasTotp] = useState(false);
  const [enrollment, setEnrollment] = useState<{ factorId: string; qr: string; secret: string } | null>(null);
  const [otp, setOtp] = useState("");
  const [enrollBusy, setEnrollBusy] = useState(false);
  const [activity, setActivity] = useState<any[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  const daysSince = userUpdatedAt ? Math.floor((Date.now() - new Date(userUpdatedAt).getTime()) / 86400000) : null;

  const loadMfa = async () => {
    setMfaLoading(true);
    const { data } = await supabase.auth.mfa.listFactors();
    setHasTotp(!!data?.totp?.some((f: any) => f.status === "verified"));
    setMfaLoading(false);
  };

  useEffect(() => { loadMfa(); }, []);
  useEffect(() => {
    (async () => {
      setActivityLoading(true);
      const { data } = await supabase.functions.invoke("user-login-history", { body: {} }).catch(() => ({ data: null } as any));
      const events = (data as any)?.events ?? [];
      setActivity(events.slice(0, 5));
      setActivityLoading(false);
    })();
  }, []);

  const sendReset = async () => {
    setSendingReset(true);
    const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSendingReset(false);
    if (error) toast({ title: "Could not send", description: error.message, variant: "destructive" });
    else toast({ title: "Reset link sent", description: `Check ${userEmail} for a link to change your password.` });
  };

  const signOutOthers = async () => {
    setSigningOutOthers(true);
    const { error } = await supabase.auth.signOut({ scope: "others" });
    setSigningOutOthers(false);
    if (error) toast({ title: "Could not sign out", description: error.message, variant: "destructive" });
    else toast({ title: "Signed out other sessions" });
  };

  const startEnroll = async () => {
    setEnrollBusy(true);
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
    setEnrollBusy(false);
    if (error) return toast({ title: "MFA setup failed", description: error.message, variant: "destructive" });
    setEnrollment({ factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  };

  const verifyEnroll = async () => {
    if (!enrollment) return;
    setEnrollBusy(true);
    const { data: chal, error: cErr } = await supabase.auth.mfa.challenge({ factorId: enrollment.factorId });
    if (cErr || !chal) { setEnrollBusy(false); return toast({ title: "MFA challenge failed", description: cErr?.message, variant: "destructive" }); }
    const { error: vErr } = await supabase.auth.mfa.verify({ factorId: enrollment.factorId, challengeId: chal.id, code: otp });
    setEnrollBusy(false);
    if (vErr) return toast({ title: "Wrong code", description: vErr.message, variant: "destructive" });
    setEnrollment(null); setOtp("");
    toast({ title: "Two-factor enabled" });
    loadMfa();
  };

  const disableMfa = async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    const factor = data?.totp?.[0];
    if (!factor) return;
    const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
    if (error) toast({ title: "Could not disable", description: error.message, variant: "destructive" });
    else { toast({ title: "Two-factor disabled" }); loadMfa(); }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border bg-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-semibold flex items-center gap-2"><KeyRound className="h-4 w-4" /> Password</Label>
            <p className="text-xs text-muted-foreground">{daysSince != null ? `Last account update ~${daysSince} day${daysSince === 1 ? "" : "s"} ago.` : "Manage your account password."}</p>
          </div>
          <Button variant="outline" onClick={sendReset} disabled={sendingReset}>
            {sendingReset ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Send reset link
          </Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-semibold flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Two-factor authentication</Label>
            <p className="text-xs text-muted-foreground">Time-based one-time code (Google Authenticator, 1Password, etc.).</p>
          </div>
          {mfaLoading ? <Skeleton className="h-8 w-24" /> : hasTotp ? (
            <div className="flex items-center gap-2">
              <Badge className="gap-1"><Check className="h-3 w-3" /> Enabled</Badge>
              <Button variant="ghost" size="sm" onClick={disableMfa}>Disable</Button>
            </div>
          ) : !enrollment ? (
            <Button variant="outline" onClick={startEnroll} disabled={enrollBusy}>Set up</Button>
          ) : null}
        </div>
        {enrollment && (
          <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
            <p className="text-xs text-muted-foreground">Scan this QR code with your authenticator app, then enter the 6-digit code.</p>
            <div className="flex items-center gap-4">
              <div className="bg-white p-2 rounded-md border" dangerouslySetInnerHTML={{ __html: enrollment.qr }} />
              <div className="text-xs space-y-1">
                <div className="text-muted-foreground">Can't scan? Enter manually:</div>
                <code className="font-mono text-[11px] bg-background px-2 py-1 rounded border block break-all">{enrollment.secret}</code>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="123456" className="max-w-32 font-mono tracking-widest" />
              <Button onClick={verifyEnroll} disabled={enrollBusy || otp.length !== 6}>Verify & enable</Button>
              <Button variant="ghost" onClick={() => setEnrollment(null)}>Cancel</Button>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border bg-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-semibold flex items-center gap-2"><Building2 className="h-4 w-4" /> Sessions</Label>
            <p className="text-xs text-muted-foreground">Sign out of every browser and device you've used, other than this one.</p>
          </div>
          <Button variant="outline" onClick={signOutOthers} disabled={signingOutOthers}>
            {signingOutOthers ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Sign out of other sessions
          </Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5 space-y-3">
        <Label className="text-sm font-semibold">Recent activity</Label>
        {activityLoading ? <Skeleton className="h-16 w-full" /> : activity.length === 0 ? (
          <p className="text-xs text-muted-foreground">No recent activity recorded.</p>
        ) : (
          <div className="space-y-1.5">
            {activity.map((e: any) => (
              <div key={e.id} className="flex items-center justify-between gap-3 text-xs rounded-md border px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Badge variant="outline" className="capitalize">{(e.action ?? "event").replace(/_/g, " ")}</Badge>
                  <span className="text-muted-foreground truncate">{e.ip ?? "—"}</span>
                </div>
                <span className="text-muted-foreground shrink-0">{new Date(e.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- shared ---------------- */
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
