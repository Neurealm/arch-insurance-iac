import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

type Company = { id: string; name: string; email?: string | null; tenant_id?: string | null };

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);
}

export function PromoteToTenantDialog({
  company, open, onOpenChange,
}: { company: Company | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (company) {
      setName(company.name);
      setSlug(slugify(company.name));
      setAdminEmail(company.email ?? "");
    }
  }, [company]);

  const submit = async () => {
    if (!company) return;
    if (!name.trim() || !slug.trim()) {
      toast({ title: "Name and slug are required", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { data: tenant, error: tErr } = await (supabase as any)
        .from("tenants")
        .insert({
          name: name.trim(),
          slug: slug.trim(),
          status: true,
          source_company_id: company.id,
          primary_admin_email: adminEmail.trim() || null,
        })
        .select("id, slug")
        .single();
      if (tErr) throw tErr;

      const { error: cErr } = await supabase
        .from("crm_companies")
        .update({ tenant_id: tenant.id, lifecycle_stage: "customer" })
        .eq("id", company.id);
      if (cErr) throw cErr;

      qc.invalidateQueries({ queryKey: ["crm_companies"] });
      qc.invalidateQueries({ queryKey: ["crm-tenants"] });

      const url = `${window.location.origin}/t/${tenant.slug}/auth`;
      toast({ title: "Tenant created", description: url });
      onOpenChange(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to create tenant";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Promote {company?.name} to Tenant</DialogTitle>
          <DialogDescription>
            Provisions a workspace for this customer. They will sign in at the generated tenant login URL.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Tenant name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Slug (used in login URL)</Label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {window.location.origin}/t/<span className="font-mono">{slug || "slug"}</span>/auth
            </p>
          </div>
          <div>
            <Label>Primary admin email</Label>
            <Input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={submitting}>{submitting ? "Creating…" : "Create tenant"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}