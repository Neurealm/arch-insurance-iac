import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiTextInput } from "@/components/crm/MultiTextInput";
import { ORG_LEVELS, type OrgLevelKey } from "@/config/orgLevels";
import { useOrgList, useOrgMutations, type OrgRecord } from "@/hooks/org/useOrgEntity";

const BUSINESS_UNIT_PRESETS = ["Healthcare", "HiTech", "C.I.T.", "SEAD", "UKI"];

type Props = {
  level: OrgLevelKey;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Partial<OrgRecord> | null;
  defaultParentId?: string | null;
};

const empty = {
  name: "",
  short_name: "",
  url: "",
  description: "",
  logo: "",
  tagline: "",
  mission: "",
  strategic_value: "",
  ai_summary: "",
  embedding_text: "",
  keywords: [] as string[],
  semantic_tags: [] as string[],
  strategic_themes: [] as string[],
};

export function EntityFormDialog({ level, open, onOpenChange, initial, defaultParentId }: Props) {
  const cfg = ORG_LEVELS[level];
  const { create, update } = useOrgMutations(level);
  const parentList = useOrgList(cfg.parent ?? "business_units");
  const [form, setForm] = useState<any>({ ...empty });

  useEffect(() => {
    if (open) {
      const base = { ...empty, ...(initial ?? {}) };
      if (cfg.parentFk) base[cfg.parentFk] = (initial as any)?.[cfg.parentFk] ?? defaultParentId ?? "";
      setForm(base);
    }
  }, [open, initial, defaultParentId, cfg.parentFk]);

  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));
  const isEdit = !!(initial && (initial as any).id);

  const isBU = level === "business_units";
  const buPreset = isBU && BUSINESS_UNIT_PRESETS.includes(form.name) ? form.name : "";
  const buIsOther = isBU && !!form.name && !BUSINESS_UNIT_PRESETS.includes(form.name);
  const [buMode, setBuMode] = useState<string>("");
  useEffect(() => {
    if (!isBU) return;
    if (buPreset) setBuMode(buPreset);
    else if (buIsOther || (open && isEdit)) setBuMode("__other__");
    else setBuMode("");
  }, [open, isBU, buPreset, buIsOther, isEdit]);

  const submit = async () => {
    if (!form.name?.trim()) return;
    if (cfg.parentFk && !form[cfg.parentFk]) return;
    if (!form.description?.trim()) return;
    const payload: any = { ...form };
    if (isEdit) {
      await update.mutateAsync({ id: (initial as any).id, ...payload });
    } else {
      await create.mutateAsync(payload);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit" : "New"} {cfg.singular}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          {cfg.parent && cfg.parentFk && (
            <div className="sm:col-span-2 space-y-1.5">
              <Label>{ORG_LEVELS[cfg.parent].singular} *</Label>
              <Select
                value={form[cfg.parentFk] || ""}
                onValueChange={(v) => set(cfg.parentFk!, v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${ORG_LEVELS[cfg.parent].singular}`} />
                </SelectTrigger>
                <SelectContent>
                  {(parentList.data ?? []).map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {isBU ? (
            <>
              <Field label="Business Unit *">
                <Select
                  value={buMode}
                  onValueChange={(v) => {
                    setBuMode(v);
                    set("name", v === "__other__" ? "" : v);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select business unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_UNIT_PRESETS.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                    <SelectItem value="__other__">Others (type custom)</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              {buMode === "__other__" && (
                <Field label="Custom Name *">
                  <Input
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Enter business unit name"
                  />
                </Field>
              )}
            </>
          ) : (
            <Field label="Name *">
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
            </Field>
          )}
          <Field label="Short Name">
            <Input value={form.short_name} onChange={(e) => set("short_name", e.target.value)} />
          </Field>
          <Field label="URL">
            <Input value={form.url} onChange={(e) => set("url", e.target.value)} />
          </Field>
          <Field label="Logo (URL)">
            <Input value={form.logo} onChange={(e) => set("logo", e.target.value)} />
          </Field>
          <Field label="Tagline" wide>
            <Input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} />
          </Field>
          <Field label="Description *" wide>
            <Textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} />
          </Field>
          <Field label="Mission" wide>
            <Textarea rows={2} value={form.mission} onChange={(e) => set("mission", e.target.value)} />
          </Field>
          <Field label="Strategic Value" wide>
            <Textarea rows={2} value={form.strategic_value} onChange={(e) => set("strategic_value", e.target.value)} />
          </Field>
          <Field label="Keywords" wide>
            <MultiTextInput value={form.keywords} onChange={(v) => set("keywords", v)} placeholder="Add keyword and press Enter" />
          </Field>
          <Field label="Semantic Tags" wide>
            <MultiTextInput value={form.semantic_tags} onChange={(v) => set("semantic_tags", v)} placeholder="Add tag and press Enter" />
          </Field>
          <Field label="Strategic Themes" wide>
            <MultiTextInput value={form.strategic_themes} onChange={(v) => set("strategic_themes", v)} placeholder="Add theme and press Enter" />
          </Field>
          <Field label="AI Summary" wide>
            <Textarea rows={2} value={form.ai_summary} onChange={(e) => set("ai_summary", e.target.value)} />
          </Field>
          <Field label="Embedding Text" wide>
            <Textarea rows={2} value={form.embedding_text} onChange={(e) => set("embedding_text", e.target.value)} />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={create.isPending || update.isPending}>
            {isEdit ? "Save changes" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className={`space-y-1.5 ${wide ? "sm:col-span-2" : ""}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}