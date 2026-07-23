import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAccess } from "@/platform/access/AccessContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function TenantSettings() {
  const { activeTenant, activeTenantId, hasPermission, refresh } = useAccess();
  const canEdit = hasPermission("tenant.update");
  const qc = useQueryClient();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [currency, setCurrency] = useState("");
  const [timezone, setTimezone] = useState("");

  useEffect(() => {
    if (activeTenant) {
      setName(activeTenant.name);
      setSlug(activeTenant.slug);
      setCurrency(activeTenant.default_currency_code);
      setTimezone(activeTenant.default_timezone);
    }
  }, [activeTenant?.tenant_id]);

  const save = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("update_tenant", {
        p_tenant_id: activeTenantId!,
        p_name: name,
        p_slug: slug,
        p_default_currency_code: currency.toUpperCase(),
        p_default_timezone: timezone,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      toast.success("Workspace settings saved");
      await refresh();
      qc.invalidateQueries({ queryKey: ["platform"] });
    },
    onError: (err) => toast.error((err as Error).message),
  });

  if (!activeTenant) return null;

  return (
    <Card className="max-w-2xl">
      <CardHeader><CardTitle className="text-sm font-medium">Workspace settings</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="ws-name">Name</Label>
          <Input id="ws-name" value={name} onChange={(e) => setName(e.target.value)} disabled={!canEdit} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="ws-slug">Slug</Label>
          <Input id="ws-slug" value={slug} onChange={(e) => setSlug(e.target.value)} disabled={!canEdit} />
          <p className="text-xs text-muted-foreground">Lowercase letters, numbers, and hyphens.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="ws-currency">Default currency</Label>
            <Input id="ws-currency" value={currency} maxLength={3} onChange={(e) => setCurrency(e.target.value)} disabled={!canEdit} />
            <p className="text-xs text-muted-foreground">3-letter ISO 4217 (USD, EUR).</p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="ws-tz">Default timezone</Label>
            <Input id="ws-tz" value={timezone} onChange={(e) => setTimezone(e.target.value)} disabled={!canEdit} />
            <p className="text-xs text-muted-foreground">IANA name (e.g. America/New_York).</p>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => save.mutate()} disabled={!canEdit || save.isPending}>
            {save.isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
        {!canEdit && (
          <p className="text-xs text-muted-foreground">You need the <span className="font-mono">tenant.update</span> permission to edit these settings.</p>
        )}
      </CardContent>
    </Card>
  );
}
