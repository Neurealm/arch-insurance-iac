import { useEffect, useMemo, useState } from "react";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { TechnologyBrand } from "./TechnologyBrand";
import { useUploadTechnologyBrand } from "@/hooks/etdm/useTechnologies";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["image/svg+xml", "image/png", "image/jpeg", "image/webp"] as const;
const ALLOWED_EXT = ["svg", "png", "jpg", "jpeg", "webp"];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  technologyId: string;
  technologyName: string;
}

type Crop = { top: number; right: number; bottom: number; left: number }; // percent 0-40

const CANVAS_SIZE = 512; // master image resolution

export default function TechnologyBrandUploadDialog({ open, onOpenChange, technologyId, technologyName }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [naturalDim, setNaturalDim] = useState<{ w: number; h: number } | null>(null);
  const [crop, setCrop] = useState<Crop>({ top: 0, right: 0, bottom: 0, left: 0 });
  const [scale, setScale] = useState<number>(1);
  const [bg, setBg] = useState<"transparent" | "white" | "dark">("transparent");
  const [saving, setSaving] = useState(false);
  const uploader = useUploadTechnologyBrand();

  useEffect(() => {
    if (!open) {
      setFile(null);
      setObjectUrl((u) => { if (u) URL.revokeObjectURL(u); return null; });
      setNaturalDim(null);
      setCrop({ top: 0, right: 0, bottom: 0, left: 0 });
      setScale(1);
      setBg("transparent");
      setSaving(false);
    }
  }, [open]);

  const onPick = (f: File | null) => {
    if (!f) return;
    // Validate type by MIME + extension
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED.includes(f.type as (typeof ALLOWED)[number]) && !ALLOWED_EXT.includes(ext)) {
      toast.error(`Unsupported file type. Allowed: ${ALLOWED_EXT.join(", ").toUpperCase()}`);
      return;
    }
    if (f.size > MAX_BYTES) {
      toast.error("File exceeds the 5 MB maximum.");
      return;
    }
    if (f.size === 0) {
      toast.error("File appears to be empty or corrupted.");
      return;
    }
    // Probe by loading it as an image to catch corruption
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      setFile(f);
      setObjectUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return url; });
      setNaturalDim({ w: img.naturalWidth, h: img.naturalHeight });
      setCrop({ top: 0, right: 0, bottom: 0, left: 0 });
      setScale(1);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      toast.error("Could not read the image. The file may be corrupted.");
    };
    img.src = url;
  };

  const isSvg = file?.type === "image/svg+xml" || file?.name.toLowerCase().endsWith(".svg");
  const cropped = crop.top > 0 || crop.right > 0 || crop.bottom > 0 || crop.left > 0;
  const scaled = Math.abs(scale - 1) > 0.001;
  const willRasterize = !isSvg || cropped || scaled;

  const reset = () => {
    setCrop({ top: 0, right: 0, bottom: 0, left: 0 });
    setScale(1);
  };

  const previewInner = useMemo(() => {
    // For preview modes we render the transformed source via an inner <img>.
    // The saved master will be baked with these settings on save.
    return objectUrl;
  }, [objectUrl]);

  async function bakeMaster(): Promise<{ blob: Blob; mime: string; ext: string; width: number; height: number }> {
    if (!file || !objectUrl || !naturalDim) throw new Error("No image");
    if (isSvg && !cropped && !scaled) {
      // Passthrough SVG — preserve vector quality
      return { blob: file, mime: "image/svg+xml", ext: "svg", width: naturalDim.w, height: naturalDim.h };
    }
    // Rasterize into a CANVAS_SIZE square with contain scaling + crop + scale.
    const img = await loadImage(objectUrl);
    const cropX = (crop.left / 100) * img.naturalWidth;
    const cropY = (crop.top / 100) * img.naturalHeight;
    const cropW = img.naturalWidth - (crop.left / 100 + crop.right / 100) * img.naturalWidth;
    const cropH = img.naturalHeight - (crop.top / 100 + crop.bottom / 100) * img.naturalHeight;

    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    const ctx = canvas.getContext("2d")!;
    // Do NOT fill background — preserve transparency of the master
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // contain-scale cropped region into CANVAS_SIZE, then apply user scale
    const containScale = Math.min(CANVAS_SIZE / cropW, CANVAS_SIZE / cropH) * scale;
    const drawW = cropW * containScale;
    const drawH = cropH * containScale;
    const dx = (CANVAS_SIZE - drawW) / 2;
    const dy = (CANVAS_SIZE - drawH) / 2;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, cropX, cropY, cropW, cropH, dx, dy, drawW, drawH);

    const blob: Blob = await new Promise((res, rej) =>
      canvas.toBlob((b) => (b ? res(b) : rej(new Error("canvas encode failed"))), "image/png", 0.95),
    );
    return { blob, mime: "image/png", ext: "png", width: CANVAS_SIZE, height: CANVAS_SIZE };
  }

  const onSave = async () => {
    if (!file || !naturalDim) return;
    try {
      setSaving(true);
      const master = await bakeMaster();
      await uploader.mutateAsync({
        technologyId,
        blob: master.blob,
        mime: master.mime,
        ext: master.ext,
        originalFilename: file.name,
        width: master.width,
        height: master.height,
        crop,
        scale,
      });
      toast.success("Branding asset saved");
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const previewObj = { technology_name: technologyName, technology_image_storage_path: null };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Upload Technology Branding</DialogTitle>
          <DialogDescription>
            One master branding asset is stored per Technology and rendered everywhere. Crop only to remove
            unnecessary whitespace; do not crop the vendor logo itself.
          </DialogDescription>
        </DialogHeader>

        {!file ? (
          <div className="border-2 border-dashed border-border rounded-md p-10 text-center">
            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <div className="text-sm font-medium mb-1">Select an image file</div>
            <div className="text-xs text-muted-foreground mb-4">
              SVG, PNG, WebP, JPG · max 5 MB · preferred: SVG, PNG, WebP
            </div>
            <label className="inline-flex">
              <input
                type="file"
                accept={ALLOWED_EXT.map((e) => "." + e).join(",")}
                className="sr-only"
                onChange={(e) => onPick(e.target.files?.[0] ?? null)}
              />
              <Button asChild size="sm"><span>Choose file</span></Button>
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_320px] gap-6">
            {/* Editor */}
            <div>
              <div
                className={
                  "relative aspect-square w-full rounded-md border overflow-hidden " +
                  (bg === "white" ? "bg-white" : bg === "dark" ? "bg-slate-900" : "bg-[conic-gradient(#e5e7eb_25%,transparent_0_50%,#e5e7eb_0_75%,transparent_0)] bg-[length:16px_16px]")
                }
              >
                {/* Crop guide overlay */}
                <div
                  className="absolute inset-0 pointer-events-none ring-1 ring-indigo/60"
                  style={{
                    top: `${crop.top}%`,
                    bottom: `${crop.bottom}%`,
                    left: `${crop.left}%`,
                    right: `${crop.right}%`,
                  }}
                />
                {previewInner && (
                  <img
                    src={previewInner}
                    alt=""
                    className="absolute inset-0 w-full h-full object-contain p-2"
                    style={{ transform: `scale(${scale})` }}
                    draggable={false}
                  />
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Scale ({scale.toFixed(2)}x)</Label>
                  <Slider value={[scale]} min={0.5} max={2} step={0.05} onValueChange={([v]) => setScale(v)} />
                </div>
                <div>
                  <Label className="text-xs">Preview background</Label>
                  <div className="flex gap-1.5 mt-1">
                    {(["transparent", "white", "dark"] as const).map((b) => (
                      <Button
                        key={b}
                        size="sm"
                        variant={bg === b ? "default" : "outline"}
                        className="capitalize h-7 text-xs"
                        onClick={() => setBg(b)}
                      >
                        {b}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Crop top ({crop.top}%)</Label>
                  <Slider value={[crop.top]} min={0} max={40} step={1} onValueChange={([v]) => setCrop((c) => ({ ...c, top: v }))} />
                </div>
                <div>
                  <Label className="text-xs">Crop bottom ({crop.bottom}%)</Label>
                  <Slider value={[crop.bottom]} min={0} max={40} step={1} onValueChange={([v]) => setCrop((c) => ({ ...c, bottom: v }))} />
                </div>
                <div>
                  <Label className="text-xs">Crop left ({crop.left}%)</Label>
                  <Slider value={[crop.left]} min={0} max={40} step={1} onValueChange={([v]) => setCrop((c) => ({ ...c, left: v }))} />
                </div>
                <div>
                  <Label className="text-xs">Crop right ({crop.right}%)</Label>
                  <Slider value={[crop.right]} min={0} max={40} step={1} onValueChange={([v]) => setCrop((c) => ({ ...c, right: v }))} />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <Button size="sm" variant="outline" onClick={reset}>Reset</Button>
                <Button size="sm" variant="outline" onClick={() => setScale(1)}>Fit to Canvas</Button>
                <Button size="sm" variant="outline" onClick={() => setCrop({ top: 0, right: 0, bottom: 0, left: 0 })}>Center</Button>
                <label>
                  <input
                    type="file"
                    accept={ALLOWED_EXT.map((e) => "." + e).join(",")}
                    className="sr-only"
                    onChange={(e) => onPick(e.target.files?.[0] ?? null)}
                  />
                  <Button asChild size="sm" variant="outline"><span>Choose different file</span></Button>
                </label>
              </div>
              <div className="mt-2 text-[11px] text-muted-foreground">
                {file.name} · {(file.size / 1024).toFixed(1)} KB · {naturalDim?.w}×{naturalDim?.h}
                {willRasterize && isSvg && " · SVG will be rasterized on save because you cropped or scaled it"}
              </div>
            </div>

            {/* Preview modes */}
            <div>
              <Label className="text-xs">Preview across the app</Label>
              <Tabs defaultValue="large" className="mt-1">
                <TabsList className="flex-wrap h-auto justify-start">
                  <TabsTrigger value="large" className="text-[11px]">Large</TabsTrigger>
                  <TabsTrigger value="medium" className="text-[11px]">Medium</TabsTrigger>
                  <TabsTrigger value="nav" className="text-[11px]">Nav Icon</TabsTrigger>
                  <TabsTrigger value="table" className="text-[11px]">Table</TabsTrigger>
                  <TabsTrigger value="header" className="text-[11px]">Header</TabsTrigger>
                  <TabsTrigger value="dropdown" className="text-[11px]">Dropdown</TabsTrigger>
                  <TabsTrigger value="card" className="text-[11px]">Card</TabsTrigger>
                </TabsList>
                {[
                  { k: "large", size: 128, mode: "logo" as const, label: "Large Logo · 128" },
                  { k: "medium", size: 64, mode: "logo" as const, label: "Medium Logo · 64" },
                  { k: "nav", size: 24, mode: "icon" as const, label: "Navigation Icon · 24" },
                  { k: "table", size: 32, mode: "icon" as const, label: "Table Icon · 32" },
                  { k: "header", size: 96, mode: "logo" as const, label: "Profile Header · 96" },
                  { k: "dropdown", size: 20, mode: "icon" as const, label: "Dropdown · 20" },
                  { k: "card", size: 48, mode: "logo" as const, label: "Technology Card · 48" },
                ].map((p) => (
                  <TabsContent key={p.k} value={p.k}>
                    <div
                      className={
                        "rounded-md border p-6 flex flex-col items-center gap-3 " +
                        (bg === "white" ? "bg-white" : bg === "dark" ? "bg-slate-900 text-white" : "")
                      }
                    >
                      <TechnologyBrand
                        technology={previewObj}
                        size={p.size}
                        mode={p.mode}
                        background={bg}
                        overrideSrc={objectUrl}
                      />
                      <div className="text-[11px] text-muted-foreground">{p.label}</div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={onSave} disabled={!file || saving}>
            {saving && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
            Save branding
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = url;
  });
}
