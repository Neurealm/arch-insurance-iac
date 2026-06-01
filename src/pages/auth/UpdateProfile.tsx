import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserCog, Loader2, Upload, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const TIME_ZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "pt", label: "Portuguese" },
  { value: "hi", label: "Hindi" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
];

type FormState = {
  full_name: string;
  phone: string;
  avatar_url: string;
  job_title: string;
  department: string;
  company: string;
  location: string;
  time_zone: string;
  preferred_language: string;
};

const EMPTY: FormState = {
  full_name: "",
  phone: "",
  avatar_url: "",
  job_title: "",
  department: "",
  company: "",
  location: "",
  time_zone: "",
  preferred_language: "",
};

export default function UpdateProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select(
          "full_name, phone, avatar_url, job_title, department, company, location, time_zone, preferred_language"
        )
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setForm({
          full_name: (data as any).full_name ?? "",
          phone: (data as any).phone ?? "",
          avatar_url: (data as any).avatar_url ?? "",
          job_title: (data as any).job_title ?? "",
          department: (data as any).department ?? "",
          company: (data as any).company ?? "",
          location: (data as any).location ?? "",
          time_zone: (data as any).time_zone ?? "",
          preferred_language: (data as any).preferred_language ?? "",
        });
      }
      setLoading(false);
    })();
  }, [user]);

  const update = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const onUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please choose an image.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5MB.", variant: "destructive" });
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop() || "png";
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, {
      upsert: true,
      contentType: file.type,
    });
    if (upErr) {
      setUploading(false);
      toast({ title: "Upload failed", description: upErr.message, variant: "destructive" });
      return;
    }
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    setForm((f) => ({ ...f, avatar_url: pub.publicUrl }));
    setUploading(false);
    toast({ title: "Photo uploaded", description: "Click Save Profile to keep it." });
  };

  const onSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name || null,
        phone: form.phone || null,
        avatar_url: form.avatar_url || null,
        job_title: form.job_title || null,
        department: form.department || null,
        company: form.company || null,
        location: form.location || null,
        time_zone: form.time_zone || null,
        preferred_language: form.preferred_language || null,
        display_name: form.full_name || null,
      } as any)
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile saved", description: "Your details have been updated." });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 px-6 py-10">
      <div className="max-w-2xl mx-auto rounded-2xl border bg-card shadow-lg p-8">
        <button
          onClick={() => navigate("/pending-approval")}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-full bg-accent text-indigo grid place-items-center">
            <UserCog className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Update Profile</h1>
            <p className="text-sm text-muted-foreground">
              Signed in as <span className="font-medium text-foreground">{user?.email}</span>
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input id="full_name" value={form.full_name} onChange={update("full_name")} placeholder="Jane Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" value={user?.email ?? ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" value={form.phone} onChange={update("phone")} placeholder="+1 555 000 1234" />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label>Profile Photo</Label>
              <div className="flex items-center gap-4">
                {form.avatar_url ? (
                  <img src={form.avatar_url} alt="" className="h-16 w-16 rounded-full object-cover border" />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-accent grid place-items-center text-indigo">
                    <UserIcon className="h-7 w-7" />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="avatar_file"
                    className="inline-flex items-center gap-2 cursor-pointer rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-accent"
                  >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {uploading ? "Uploading…" : form.avatar_url ? "Change photo" : "Upload photo"}
                  </Label>
                  <input
                    id="avatar_file"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onUploadAvatar}
                    disabled={uploading}
                  />
                  {form.avatar_url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setForm((f) => ({ ...f, avatar_url: "" }))}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">PNG or JPG, up to 5MB.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="job_title">Job Title</Label>
              <Input id="job_title" value={form.job_title} onChange={update("job_title")} placeholder="Project Manager" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input id="department" value={form.department} onChange={update("department")} placeholder="Operations" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company / Organization</Label>
              <Input id="company" value={form.company} onChange={update("company")} placeholder="Acme Corp" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={form.location} onChange={update("location")} placeholder="New York, USA" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time_zone">Time Zone</Label>
              <Select value={form.time_zone} onValueChange={(v) => setForm((f) => ({ ...f, time_zone: v }))}>
                <SelectTrigger id="time_zone">
                  <SelectValue placeholder="Select time zone" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_ZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferred_language">Preferred Language</Label>
              <Select value={form.preferred_language} onValueChange={(v) => setForm((f) => ({ ...f, preferred_language: v }))}>
                <SelectTrigger id="preferred_language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-2 flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => navigate("/pending-approval")}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={onSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Profile
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}