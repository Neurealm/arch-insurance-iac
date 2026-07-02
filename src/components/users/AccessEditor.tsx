import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type AppRole = "platform_admin" | "platform_support";

export function AccessEditor({ userId, onChanged }: { userId: string; onChanged?: () => void }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [platformRole, setPlatformRole] = useState<AppRole>("platform_support");

  const load = async () => {
    setLoading(true);
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    const r = (roles ?? []).some((x: any) => x.role === "platform_admin")
      ? "platform_admin"
      : "platform_support";
    setPlatformRole(r);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, [userId]);

  const savePlatformRole = async (next: AppRole) => {
    setSaving(true);
    const { data, error } = await supabase.functions.invoke("admin-set-platform-role", {
      body: { userId, role: next },
    });
    setSaving(false);
    if (error || (data as any)?.error) {
      toast.error(error?.message || (data as any)?.error || "Failed to update role");
      return;
    }
    setPlatformRole(next);
    toast.success("Platform role updated");
    onChanged?.();
  };

  if (loading) {
    return <div className="text-xs text-muted-foreground">Loading access…</div>;
  }

  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-muted-foreground">Platform role</div>
      <div className="flex items-center gap-2">
        <Select
          value={platformRole}
          onValueChange={(v) => savePlatformRole(v as AppRole)}
          disabled={saving}
        >
          <SelectTrigger className="w-64 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="platform_support">Read-only (default)</SelectItem>
            <SelectItem value="platform_admin">Platform admin (full)</SelectItem>
          </SelectContent>
        </Select>
        {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
      </div>
      <p className="text-[10px] text-muted-foreground">
        Every account has platform access. Read-only can browse; admin can manage users and settings.
      </p>
    </div>
  );
}
