import { useMemo, useState } from "react";
import { AppShell } from "@/components/eoc/AppShell";
import { CrmTabs } from "./CrmTabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Building2, Search, Copy, ExternalLink, Pencil, Settings2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Tenant = {
  id: string;
  name: string;
  slug: string;
  status: boolean;
  logo_url: string | null;
  primary_admin_email: string | null;
  source_company_id: string | null;
  created_at: string;
};

function tenantLoginUrl(slug: string) {
  return `${window.location.origin}/t/${slug}/auth`;
}

export default function CrmTenantsPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Tenant | null>(null);

  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ["crm-tenants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenants")
        .select("id,name,slug,status,logo_url,primary_admin_email,source_company_id,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Tenant[];
    },
  });

  const update = useMutation({
    mutationFn: async (t: Tenant) => {
      const { error } = await supabase
        .from("tenants")
        .update({
          name: t.name,
          slug: t.slug,
          status: t.status,
          primary_admin_email: t.primary_admin_email,
        })
        .eq("id", t.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-tenants"] });
      toast({ title: "Tenant updated" });
      setEditing(null);
    },
    onError: (e: unknown) =>
      toast({ title: e instanceof Error ? e.message : "Update failed", variant: "destructive" }),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tenants;
    return tenants.filter((t) =>
      [t.name, t.slug, t.primary_admin_email].some((x) => x?.toLowerCase().includes(q))
    );
  }, [tenants, search]);

  const copy = async (url: string) => {
    await navigator.clipboard.writeText(url);
    toast({ title: "Login URL copied" });
  };

  return (
    <AppShell>
      <div className="p-6 max-w-[1600px] mx-auto w-full">
        <header className="mb-4">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-indigo" /> Customer Relation Manager
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tenants provisioned from accepted CRM companies. Each tenant has its own login URL.
          </p>
        </header>

        <CrmTabs />

        <div className="rounded-lg border bg-card">
          <div className="flex items-center gap-3 p-4 border-b">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tenants..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <div className="h-16 w-16 mx-auto rounded-full bg-accent flex items-center justify-center mb-4">
                <Building2 className="h-8 w-8 text-indigo" />
              </div>
              <h3 className="text-lg font-semibold">No tenants yet</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                Go to Companies, open a company that has accepted the project, and use "Promote to Tenant" to provision a workspace.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Primary admin</TableHead>
                  <TableHead>Login URL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => {
                  const url = tenantLoginUrl(t.slug);
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">{t.slug}</TableCell>
                      <TableCell className="text-muted-foreground">{t.primary_admin_email || "—"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded truncate max-w-[280px]">{url}</code>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copy(url)}>
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <a href={url} target="_blank" rel="noreferrer" title="Open tenant login">
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </a>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            title="Tenant settings"
                            onClick={() => navigate(`/crm/tenants/${t.id}/settings`)}
                          >
                            <Settings2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={t.status ? "default" : "secondary"}>
                          {t.status ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing(t)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Configure"
                          onClick={() => navigate(`/crm/tenants/${t.id}/settings`)}
                        >
                          <Settings2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit tenant</DialogTitle>
            <DialogDescription>Slug changes also change the tenant login URL.</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div>
                <Label>Slug</Label>
                <Input
                  value={editing.slug}
                  onChange={(e) =>
                    setEditing({ ...editing, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })
                  }
                />
              </div>
              <div>
                <Label>Primary admin email</Label>
                <Input
                  type="email"
                  value={editing.primary_admin_email ?? ""}
                  onChange={(e) => setEditing({ ...editing, primary_admin_email: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="status"
                  type="checkbox"
                  checked={editing.status}
                  onChange={(e) => setEditing({ ...editing, status: e.target.checked })}
                />
                <Label htmlFor="status">Active</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={() => editing && update.mutate(editing)} disabled={update.isPending}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}