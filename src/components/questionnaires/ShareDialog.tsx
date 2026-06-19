import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Copy, Link2, Trash2, Loader2, CheckCircle2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type Props = {
  questionnaireId: string;
  questionnaireTitle: string;
  sectionId?: string | null;
  sectionTitle?: string | null;
  trigger: React.ReactNode;
};

type ShareLink = {
  id: string;
  token: string;
  scope: "full" | "section";
  section_id: string | null;
  label: string | null;
  revoked_at: string | null;
  created_at: string;
};

type Response = {
  id: string;
  org_name: string;
  respondent_name: string;
  respondent_email: string;
  respondent_role: string;
  status: string;
  submitted_at: string | null;
  updated_at: string;
};

function makeToken() {
  const a = crypto.randomUUID().replace(/-/g, "");
  const b = crypto.randomUUID().replace(/-/g, "");
  return (a + b).slice(0, 40);
}

export function ShareDialog({ questionnaireId, questionnaireTitle, sectionId, sectionTitle, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [links, setLinks] = useState<ShareLink[]>([]);
  const [responses, setResponses] = useState<Record<string, Response[]>>({});
  const [label, setLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const scope: "full" | "section" = sectionId ? "section" : "full";

  async function load() {
    setLoading(true);
    let q = supabase.from("questionnaire_share_links")
      .select("id, token, scope, section_id, label, revoked_at, created_at")
      .eq("questionnaire_id", questionnaireId)
      .order("created_at", { ascending: false });
    q = sectionId ? q.eq("section_id", sectionId) : q.is("section_id", null);
    const { data, error } = await q;
    if (error) toast.error(error.message);
    const list = (data as ShareLink[]) ?? [];
    setLinks(list);

    if (list.length) {
      const { data: rs } = await supabase
        .from("questionnaire_responses")
        .select("id, share_link_id, org_name, respondent_name, respondent_email, respondent_role, status, submitted_at, updated_at")
        .in("share_link_id", list.map((l) => l.id))
        .order("updated_at", { ascending: false });
      const grouped: Record<string, Response[]> = {};
      (rs ?? []).forEach((r: any) => { (grouped[r.share_link_id] ||= []).push(r); });
      setResponses(grouped);
    }
    setLoading(false);
  }
  useEffect(() => { if (open) load(); /* eslint-disable-next-line */ }, [open]);

  async function createLink() {
    setCreating(true);
    const token = makeToken();
    const { data: user } = await supabase.auth.getUser();
    const { error } = await supabase.from("questionnaire_share_links").insert({
      token,
      questionnaire_id: questionnaireId,
      section_id: sectionId ?? null,
      scope,
      label: label.trim() || null,
      created_by: user.user?.id ?? null,
    });
    if (error) { toast.error(error.message); }
    else { setLabel(""); toast.success("Link created"); await load(); }
    setCreating(false);
  }

  async function revoke(id: string) {
    const { error } = await supabase.from("questionnaire_share_links").update({ revoked_at: new Date().toISOString() }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Revoked"); load(); }
  }

  function publicUrl(token: string) {
    return `${window.location.origin}/q/${token}`;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share {scope === "section" ? `section · ${sectionTitle}` : `questionnaire · ${questionnaireTitle}`}</DialogTitle>
        </DialogHeader>

        <Card className="p-3 flex gap-2 items-center bg-indigo-50/40 border-indigo-100">
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Optional label (e.g. Acme — Q1 review)" className="bg-white" />
          <Button onClick={createLink} disabled={creating} className="bg-indigo-600 text-white hover:bg-indigo-700">
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Link2 className="h-4 w-4 mr-1.5" /> Generate link</>}
          </Button>
        </Card>

        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
          {loading && <p className="text-xs text-muted-foreground">Loading…</p>}
          {!loading && links.length === 0 && <p className="text-xs text-muted-foreground text-center py-6">No links yet. Generate one above.</p>}
          {links.map((l) => {
            const url = publicUrl(l.token);
            const rs = responses[l.id] ?? [];
            return (
              <Card key={l.id} className="p-3">
                <div className="flex items-center gap-2">
                  {l.revoked_at ? <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 text-[10px]">Revoked</Badge>
                    : <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">Active</Badge>}
                  <span className="text-xs font-medium truncate">{l.label || "Untitled link"}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">{formatDistanceToNow(new Date(l.created_at), { addSuffix: true })}</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Input readOnly value={url} className="bg-slate-50 text-xs h-8" />
                  <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(url); toast.success("Copied"); }}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  {!l.revoked_at && (
                    <Button size="sm" variant="outline" className="text-rose-600" onClick={() => revoke(l.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                {rs.length > 0 && (
                  <div className="mt-3 border-t pt-2 space-y-1">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Responses ({rs.length})</p>
                    {rs.map((r) => (
                      <div key={r.id} className="flex items-center gap-2 text-xs">
                        {r.status === "submitted"
                          ? <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          : <Clock className="h-3 w-3 text-amber-600" />}
                        <span className="font-medium">{r.org_name}</span>
                        <span className="text-muted-foreground">· {r.respondent_name} ({r.respondent_role}) · {r.respondent_email}</span>
                        <span className="ml-auto text-[10px] text-muted-foreground">
                          {r.status === "submitted" && r.submitted_at
                            ? `Submitted ${formatDistanceToNow(new Date(r.submitted_at), { addSuffix: true })}`
                            : `Draft · updated ${formatDistanceToNow(new Date(r.updated_at), { addSuffix: true })}`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
