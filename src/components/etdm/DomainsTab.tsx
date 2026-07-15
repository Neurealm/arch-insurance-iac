import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Plus, GripVertical, MoreVertical, Eye, Pencil, Copy, Power, Trash2, Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  useDomainsForTechnology, useReorderDomains, useSetDomainActive, useCloneDomain,
  useSoftDeleteDomain, useMasterDomains, type Domain,
} from "@/hooks/etdm/useDomains";
import {
  LifecycleBadge, ApprovalBadge, CriticalityBadge, ActiveBadge,
} from "./DomainBadges";
import AutoBuildDomainsDialog from "./AutoBuildDomainsDialog";

interface Props {
  technologyId: string;
  technologyName?: string;
  disabled?: boolean;
}

export default function DomainsTab({ technologyId, technologyName, disabled }: Props) {
  const nav = useNavigate();
  const { data, isLoading, isError, refetch } = useDomainsForTechnology(technologyId);
  const { data: masters = [] } = useMasterDomains();
  const reorder = useReorderDomains();
  const setActive = useSetDomainActive();
  const clone = useCloneDomain();
  const del = useSoftDeleteDomain();

  const rows = useMemo(() => data ?? [], [data]);
  const [items, setItems] = useState<Domain[] | null>(null);
  const list = items ?? rows;

  const [confirmDelete, setConfirmDelete] = useState<Domain | null>(null);
  const [confirmClone, setConfirmClone] = useState<Domain | null>(null);
  const [confirmActive, setConfirmActive] = useState<{ domain: Domain; next: boolean } | null>(null);
  const [autoBuildOpen, setAutoBuildOpen] = useState(false);

  const coverageCount = useMemo(() => {
    const activeMasterIds = new Set(masters.filter((m) => m.is_active).map((m) => m.id));
    const covered = new Set(
      rows.filter((r) => activeMasterIds.has(r.master_domain_id)).map((r) => r.master_domain_id),
    );
    return covered.size;
  }, [rows, masters]);
  const coverageTotal = masters.length || 16;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = list.findIndex((d) => d.id === active.id);
    const newIdx = list.findIndex((d) => d.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    const next = arrayMove(list, oldIdx, newIdx);
    setItems(next);
    try {
      await reorder.mutateAsync({ technologyId, orderedIds: next.map((d) => d.id) });
      toast.success("Order updated");
      setItems(null);
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Reorder failed");
      setItems(null);
    }
  };

  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border gap-3 flex-wrap">
        <div>
          <div className="text-sm font-medium flex items-center gap-2">
            Domains
            <Badge variant="outline" className="bg-indigo/10 text-indigo border-indigo/30">
              Standard Domain Coverage: {coverageCount} of {coverageTotal}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Child records that describe the taxonomy domains this Technology participates in. Drag rows to reorder.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAutoBuildOpen(true)}
            disabled={disabled}
            title="Create the standard 16 ETDM Domain records for this Technology"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Auto-Build Domains
          </Button>
          <Button
            size="sm"
            onClick={() => nav(`/admin/technology-taxonomy/domains/new?technology_id=${technologyId}`)}
            disabled={disabled}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Domain
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[36px]" />
            <TableHead className="w-[70px]">Order</TableHead>
            <TableHead>Master Domain</TableHead>
            <TableHead>Domain Display Name</TableHead>
            <TableHead>Business Criticality</TableHead>
            <TableHead>Lifecycle</TableHead>
            <TableHead>Approval</TableHead>
            <TableHead>Active</TableHead>
            <TableHead>Last Modified</TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow><TableCell colSpan={10} className="text-center py-10 text-muted-foreground">Loading…</TableCell></TableRow>
          )}
          {!isLoading && isError && (
            <TableRow><TableCell colSpan={10} className="text-center py-10 text-destructive">Failed to load domains.</TableCell></TableRow>
          )}
          {!isLoading && !isError && list.length === 0 && (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-12">
                <div className="text-sm font-medium">No domains have been created for this technology.</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Build the standard ETDM domain structure or add an individual domain manually.
                </div>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => setAutoBuildOpen(true)}
                    disabled={disabled}
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Auto-Build Standard Domains
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={disabled}
                    onClick={() => nav(`/admin/technology-taxonomy/domains/new?technology_id=${technologyId}`)}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Domain
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
          {list.length > 0 && (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={list.map((d) => d.id)} strategy={verticalListSortingStrategy}>
                {list.map((d, i) => (
                  <SortableRow
                    key={d.id}
                    domain={d}
                    order={i + 1}
                    onView={() => nav(`/admin/technology-taxonomy/domains/${d.id}`)}
                    onEdit={() => nav(`/admin/technology-taxonomy/domains/${d.id}/edit`)}
                    onClone={() => setConfirmClone(d)}
                    onToggleActive={() => setConfirmActive({ domain: d, next: !d.is_active })}
                    onDelete={() => setConfirmDelete(d)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </TableBody>
      </Table>

      {/* Delete confirm */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete domain?</AlertDialogTitle>
            <AlertDialogDescription>
              Soft-delete <span className="font-semibold">{confirmDelete?.domain_display_name}</span>. It can be restored later from the Domain administration page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!confirmDelete) return;
                try { await del.mutateAsync(confirmDelete.id); toast.success("Domain deleted"); }
                catch (e) { toast.error(e instanceof Error ? e.message : "Delete failed"); }
                setConfirmDelete(null);
              }}
            >Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clone confirm */}
      <AlertDialog open={!!confirmClone} onOpenChange={(o) => !o && setConfirmClone(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clone domain?</AlertDialogTitle>
            <AlertDialogDescription>
              Create a new draft copy of <span className="font-semibold">{confirmClone?.domain_display_name}</span> under the same Technology.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!confirmClone) return;
                try {
                  const res = await clone.mutateAsync(confirmClone.id);
                  toast.success("Cloned");
                  setConfirmClone(null);
                  nav(`/admin/technology-taxonomy/domains/${res.id}/edit`);
                } catch (e) { toast.error(e instanceof Error ? e.message : "Clone failed"); }
              }}
            >Clone</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Activate/Deactivate confirm */}
      <AlertDialog open={!!confirmActive} onOpenChange={(o) => !o && setConfirmActive(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmActive?.next ? "Activate" : "Deactivate"} domain?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmActive?.next
                ? "The record will be visible to consumers of the taxonomy."
                : "The record remains stored with full history but is hidden from active taxonomy consumers."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!confirmActive) return;
                try {
                  await setActive.mutateAsync({ id: confirmActive.domain.id, active: confirmActive.next });
                  toast.success(confirmActive.next ? "Activated" : "Deactivated");
                } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
                setConfirmActive(null);
              }}
            >Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AutoBuildDomainsDialog
        open={autoBuildOpen}
        onOpenChange={setAutoBuildOpen}
        technology={{ id: technologyId, technology_name: technologyName ?? "this technology" }}
        onBuilt={() => refetch()}
      />
    </Card>
  );
}

function SortableRow({
  domain, order, onView, onEdit, onClone, onToggleActive, onDelete,
}: {
  domain: Domain; order: number;
  onView: () => void; onEdit: () => void; onClone: () => void;
  onToggleActive: () => void; onDelete: () => void;
}) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: domain.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    position: isDragging ? "relative" : undefined,
    zIndex: isDragging ? 10 : undefined,
  };
  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">{order}</TableCell>
      <TableCell className="font-medium">{domain.master_domain?.name ?? "—"}</TableCell>
      <TableCell>
        <button
          type="button"
          className="hover:underline text-left"
          onClick={onView}
        >
          {domain.domain_display_name}
        </button>
      </TableCell>
      <TableCell><CriticalityBadge value={domain.business_criticality} /></TableCell>
      <TableCell><LifecycleBadge value={domain.lifecycle_status} /></TableCell>
      <TableCell><ApprovalBadge value={domain.approval_status} /></TableCell>
      <TableCell><ActiveBadge value={domain.is_active} /></TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {new Date(domain.updated_at).toLocaleString()}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onView}><Eye className="h-3.5 w-3.5 mr-2" /> View</DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}><Pencil className="h-3.5 w-3.5 mr-2" /> Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={onClone}><Copy className="h-3.5 w-3.5 mr-2" /> Clone</DropdownMenuItem>
            <DropdownMenuItem onClick={onToggleActive}>
              <Power className="h-3.5 w-3.5 mr-2" /> {domain.is_active ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
