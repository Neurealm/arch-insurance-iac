import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ORG_LEVELS, levelBySlug } from "@/config/orgLevels";
import { useOrgList, useOrgMutations, useOrgRecord, type OrgRecord } from "@/hooks/org/useOrgEntity";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Pencil, Plus, Trash2, Eye } from "lucide-react";
import { EntityFormDialog } from "@/components/org/EntityFormDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function EntityDetailPage() {
  const { levelSlug = "", id = "" } = useParams();
  const cfg = levelBySlug(levelSlug);
  const navigate = useNavigate();
  if (!cfg) return <div className="p-6">Unknown level</div>;

  const { data: record, isLoading } = useOrgRecord(cfg.key, id);
  const childCfg = cfg.child ? ORG_LEVELS[cfg.child] : null;
  const children = useOrgList(childCfg?.key ?? cfg.key, childCfg ? id : undefined);
  const parentList = useOrgList(cfg.parent ?? "business_units");
  const parentName = useMemo(() => {
    if (!cfg.parentFk || !record) return null;
    return (parentList.data ?? []).find((p) => p.id === (record as any)[cfg.parentFk!])?.name ?? null;
  }, [parentList.data, record, cfg.parentFk]);

  const { remove } = useOrgMutations(cfg.key);
  const childMutations = useOrgMutations(childCfg?.key ?? cfg.key);
  const [editOpen, setEditOpen] = useState(false);
  const [childFormOpen, setChildFormOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<OrgRecord | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [childToDelete, setChildToDelete] = useState<OrgRecord | null>(null);

  if (isLoading) return <div className="p-6 text-muted-foreground">Loading...</div>;
  if (!record) return <div className="p-6">Not found</div>;

  return (
    <div className="px-6 py-5 space-y-5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link to={`/settings/organization/${cfg.slug}`} className="flex items-center gap-1 hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to {cfg.label}
        </Link>
        {cfg.parent && parentName && (
          <>
            <span>/</span>
            <Link
              to={`/settings/organization/${ORG_LEVELS[cfg.parent].slug}/${(record as any)[cfg.parentFk!]}`}
              className="hover:text-foreground"
            >
              {parentName}
            </Link>
          </>
        )}
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {record.logo ? (
            <img src={record.logo} alt="" className="h-14 w-14 rounded-lg object-cover border" />
          ) : (
            <div className="h-14 w-14 rounded-lg bg-muted grid place-items-center">
              <cfg.icon className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{record.name}</h1>
              {record.short_name && <Badge variant="outline">{record.short_name}</Badge>}
            </div>
            {record.tagline && <p className="text-sm text-muted-foreground mt-1">{record.tagline}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" /> Edit
          </Button>
          <Button variant="outline" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <Detail label="Description" value={record.description} />
            <Detail label="Mission" value={record.mission} />
            <Detail label="Strategic Value" value={record.strategic_value} />
            <Detail label="AI Summary" value={record.ai_summary} />
            <Detail label="Embedding Text" value={record.embedding_text} mono />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Meta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Tags label="Keywords" items={record.keywords} />
            <Tags label="Semantic Tags" items={record.semantic_tags} />
            <Tags label="Strategic Themes" items={record.strategic_themes} />
            {record.url && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">URL</div>
                <a href={record.url} target="_blank" rel="noreferrer" className="text-primary hover:underline break-all">
                  {record.url}
                </a>
              </div>
            )}
            <div className="text-xs text-muted-foreground pt-2 border-t space-y-1">
              <div>Created: {new Date(record.created_at).toLocaleString()}</div>
              <div>Updated: {new Date(record.updated_at).toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {childCfg && (
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">{childCfg.label}</CardTitle>
            <Button
              size="sm"
              onClick={() => {
                setEditingChild(null);
                setChildFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> Add {childCfg.singular}
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Short Name</TableHead>
                  <TableHead>Tagline</TableHead>
                  <TableHead className="w-[140px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(children.data ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                      No {childCfg.label.toLowerCase()} yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  (children.data ?? []).map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">
                        <Link to={`/settings/organization/${childCfg.slug}/${c.id}`} className="hover:underline">
                          {c.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{c.short_name || "—"}</TableCell>
                      <TableCell className="text-muted-foreground max-w-[280px] truncate">
                        {c.tagline || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button asChild variant="ghost" size="icon">
                            <Link to={`/settings/organization/${childCfg.slug}/${c.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingChild(c);
                              setChildFormOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setChildToDelete(c)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <EntityFormDialog
        level={cfg.key}
        open={editOpen}
        onOpenChange={setEditOpen}
        initial={record}
      />
      {childCfg && (
        <EntityFormDialog
          level={childCfg.key}
          open={childFormOpen}
          onOpenChange={setChildFormOpen}
          initial={editingChild}
          defaultParentId={id}
        />
      )}

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {cfg.singular}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove "{record.name}". Records with children cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await remove.mutateAsync(record.id);
                navigate(`/settings/organization/${cfg.slug}`);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!childToDelete} onOpenChange={(o) => !o && setChildToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {childCfg?.singular}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove "{childToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (childToDelete) await childMutations.remove.mutateAsync(childToDelete.id);
                setChildToDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Detail({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  if (!value) return null;
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <div className={`whitespace-pre-wrap text-foreground/90 ${mono ? "font-mono text-xs" : ""}`}>{value}</div>
    </div>
  );
}

function Tags({ label, items }: { label: string; items?: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="flex flex-wrap gap-1">
        {items.map((i) => (
          <Badge key={i} variant="outline">{i}</Badge>
        ))}
      </div>
    </div>
  );
}