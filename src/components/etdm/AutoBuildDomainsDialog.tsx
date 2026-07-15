import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Sparkles, ChevronsUpDown, Check, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  useMasterDomains, useDomainsForTechnology, useTechnologyOptions,
} from "@/hooks/etdm/useDomains";
import { useAutoBuildDomains } from "@/hooks/etdm/useAutoBuildDomains";

interface TechnologyLite {
  id: string;
  technology_name: string;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  technology?: TechnologyLite;
  onBuilt?: () => void;
}

type RowStatus = "ready" | "exists" | "inactive_master";

export default function AutoBuildDomainsDialog({ open, onOpenChange, technology, onBuilt }: Props) {
  const nav = useNavigate();
  const preSelected = !!technology;
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickedTechId, setPickedTechId] = useState<string | null>(null);

  const activeTechId = technology?.id ?? pickedTechId ?? "";

  const { data: masters = [] } = useMasterDomains();
  const { data: existing = [] } = useDomainsForTechnology(activeTechId || undefined);
  const { data: techOptions = [] } = useTechnologyOptions();
  const build = useAutoBuildDomains();

  const pickedTech = useMemo(
    () => techOptions.find((t) => t.id === pickedTechId) ?? null,
    [techOptions, pickedTechId],
  );

  const rows = useMemo(() => {
    const existingByMaster = new Map(existing.map((d) => [d.master_domain_id, d]));
    return masters.map((m) => {
      const exists = existingByMaster.get(m.id);
      const status: RowStatus = !m.is_active
        ? "inactive_master"
        : exists
          ? "exists"
          : "ready";
      return { master: m, existing: exists, status };
    });
  }, [masters, existing]);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  // Default: select every ready row when dialog opens or rows change
  useEffect(() => {
    if (!open) return;
    setSelected(new Set(rows.filter((r) => r.status === "ready").map((r) => r.master.id)));
  }, [open, rows]);

  const [result, setResult] = useState<null | {
    created: number; existing: number; inactive: number;
  }>(null);

  const readyCount = rows.filter((r) => r.status === "ready").length;
  const existsCount = rows.filter((r) => r.status === "exists").length;
  const inactiveCount = rows.filter((r) => r.status === "inactive_master").length;

  const techName = technology?.technology_name ?? pickedTech?.technology_name ?? "";

  const handleClose = (v: boolean) => {
    if (!v) {
      setResult(null);
      if (!preSelected) setPickedTechId(null);
    }
    onOpenChange(v);
  };

  const onBuild = async () => {
    if (!activeTechId) {
      toast.error("Select a Technology first");
      return;
    }
    const ids = Array.from(selected);
    if (!ids.length) return;
    try {
      const res = await build.mutateAsync({ technologyId: activeTechId, masterDomainIds: ids });
      setResult({
        created: res.created_ids?.length ?? 0,
        existing: res.skipped_existing_ids?.length ?? 0,
        inactive: res.skipped_inactive_ids?.length ?? 0,
      });
      toast.success(
        res.created_ids?.length
          ? `${res.created_ids.length} Domain record${res.created_ids.length === 1 ? "" : "s"} created`
          : "All standard domains already exist for this technology.",
      );
      onBuilt?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Auto-build failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo" /> Auto-Build Standard Domains
          </DialogTitle>
          <DialogDescription>
            Create the standard 16 ETDM Domain records for the selected Technology. Existing records are preserved; no duplicates are created.
          </DialogDescription>
        </DialogHeader>

        {/* Result state */}
        {result ? (
          <div className="py-6 text-center space-y-3">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
            <div className="text-lg font-semibold">Build complete</div>
            <div className="text-sm text-muted-foreground">
              {result.created > 0
                ? `${result.created} Domain record${result.created === 1 ? "" : "s"} created for ${techName}.`
                : "All standard domains already exist for this technology."}
              {result.existing > 0 && ` ${result.existing} existing domain${result.existing === 1 ? " was" : "s were"} preserved.`}
              {result.inactive > 0 && ` ${result.inactive} inactive master domain${result.inactive === 1 ? "" : "s"} skipped.`}
            </div>
          </div>
        ) : (
          <>
            {/* Technology picker (only when not pre-selected) */}
            {!preSelected && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Technology</div>
                <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
                      {pickedTech ? pickedTech.technology_name : "Select a Technology…"}
                      <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search technologies…" />
                      <CommandList>
                        <CommandEmpty>No technology found.</CommandEmpty>
                        <CommandGroup>
                          {techOptions.map((t) => (
                            <CommandItem
                              key={t.id}
                              value={t.technology_name}
                              onSelect={() => {
                                setPickedTechId(t.id);
                                setPickerOpen(false);
                              }}
                            >
                              <Check className={cn("h-3.5 w-3.5 mr-2", pickedTechId === t.id ? "opacity-100" : "opacity-0")} />
                              <span className="flex-1">{t.technology_name}</span>
                              {t.short_name && <span className="text-xs text-muted-foreground ml-2">{t.short_name}</span>}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {activeTechId && (
              <>
                {/* Summary */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                  <SummaryStat label="Standard" value={16} />
                  <SummaryStat label="Existing" value={existsCount} />
                  <SummaryStat label="To Create" value={readyCount} tone="ready" />
                  <SummaryStat label="Selected" value={selected.size} tone="selected" />
                  <SummaryStat label="Inactive Master" value={inactiveCount} tone={inactiveCount ? "warn" : undefined} />
                </div>

                {/* Preview grid */}
                <div className="max-h-[420px] overflow-auto rounded border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[36px]"></TableHead>
                        <TableHead className="w-[60px]">Order</TableHead>
                        <TableHead>Master Domain</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Proposed / Existing Display Name</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((r) => {
                        const disabled = r.status !== "ready";
                        const checked = selected.has(r.master.id);
                        return (
                          <TableRow key={r.master.id} className={disabled ? "opacity-70" : undefined}>
                            <TableCell>
                              <Checkbox
                                checked={checked}
                                disabled={disabled}
                                onCheckedChange={(v) => {
                                  const next = new Set(selected);
                                  if (v) next.add(r.master.id); else next.delete(r.master.id);
                                  setSelected(next);
                                }}
                              />
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">{Math.round(r.master.display_order / 10) || r.master.display_order}</TableCell>
                            <TableCell className="font-medium">{r.master.name}</TableCell>
                            <TableCell>
                              {r.status === "ready" && <Badge variant="outline" className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">Ready to Create</Badge>}
                              {r.status === "exists" && <Badge variant="outline" className="bg-slate-500/15 text-slate-500 border-slate-500/30">Already Exists</Badge>}
                              {r.status === "inactive_master" && <Badge variant="outline" className="bg-amber-500/15 text-amber-600 border-amber-500/30">Inactive Master</Badge>}
                            </TableCell>
                            <TableCell className="text-sm">
                              {r.existing?.domain_display_name ?? r.master.name}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </>
        )}

        <DialogFooter>
          {result ? (
            <>
              {result.created > 0 && activeTechId && (
                <Button
                  variant="outline"
                  onClick={() => {
                    handleClose(false);
                    nav(`/admin/technology-taxonomy/technologies/${activeTechId}?tab=domains`);
                  }}
                >
                  View Domains
                </Button>
              )}
              <Button onClick={() => handleClose(false)}>Close</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => handleClose(false)} disabled={build.isPending}>Cancel</Button>
              <Button
                onClick={onBuild}
                disabled={!activeTechId || selected.size === 0 || build.isPending}
              >
                {build.isPending && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                Build Selected Domains ({selected.size})
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SummaryStat({
  label, value, tone,
}: { label: string; value: number; tone?: "ready" | "warn" | "selected" }) {
  const toneCls =
    tone === "ready"
      ? "text-emerald-600"
      : tone === "warn"
        ? "text-amber-600"
        : tone === "selected"
          ? "text-indigo"
          : "text-foreground";
  return (
    <div className="rounded border border-border bg-muted/30 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={cn("text-lg font-semibold", toneCls)}>{value}</div>
    </div>
  );
}
