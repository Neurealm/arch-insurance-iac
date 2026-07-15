import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Upload, Replace, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { TechnologyBrand } from "./TechnologyBrand";
import TechnologyBrandUploadDialog from "./TechnologyBrandUploadDialog";
import { useRemoveTechnologyBrand } from "@/hooks/etdm/useTechnologies";

interface Props {
  technology: {
    id: string;
    technology_name: string | null;
    vendor_name: string | null;
    technology_image_url: string | null;
    technology_image_storage_path: string | null;
    technology_image_original_filename: string | null;
    technology_image_type: string | null;
    technology_image_width: number | null;
    technology_image_height: number | null;
    technology_image_last_updated: string | null;
    technology_image_last_updated_by: string | null;
  };
  disabled?: boolean;
}

export default function TechnologyBrandCard({ technology, disabled }: Props) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const remove = useRemoveTechnologyBrand();

  const hasImage = !!technology.technology_image_storage_path;

  return (
    <Card className="p-5 mb-5">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Technology Branding
        </h2>
      </div>
      <div className="flex flex-col md:flex-row items-start gap-6">
        <TechnologyBrand technology={technology} size={128} mode="logo" background="white" className="ring-1 ring-border" />
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <Meta label="Technology" value={technology.technology_name} />
            <Meta label="Vendor" value={technology.vendor_name} />
            <Meta
              label="Dimensions"
              value={
                technology.technology_image_width && technology.technology_image_height
                  ? `${technology.technology_image_width} × ${technology.technology_image_height}`
                  : null
              }
            />
            <Meta label="File type" value={technology.technology_image_type} />
            <Meta
              label="Original file"
              value={technology.technology_image_original_filename}
            />
            <Meta
              label="Last updated"
              value={
                technology.technology_image_last_updated
                  ? new Date(technology.technology_image_last_updated).toLocaleString()
                  : null
              }
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {!hasImage && (
              <Button size="sm" onClick={() => setUploadOpen(true)} disabled={disabled}>
                <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload Image
              </Button>
            )}
            {hasImage && (
              <>
                <Button size="sm" variant="outline" onClick={() => setUploadOpen(true)} disabled={disabled}>
                  <Replace className="h-3.5 w-3.5 mr-1.5" /> Replace Image
                </Button>
                <Button size="sm" variant="outline" onClick={() => setUploadOpen(true)} disabled={disabled}>
                  <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit Image
                </Button>
                <Button size="sm" variant="outline" className="text-destructive" onClick={() => setConfirmRemove(true)} disabled={disabled}>
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Remove Image
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <TechnologyBrandUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        technologyId={technology.id}
        technologyName={technology.technology_name ?? ""}
      />

      <AlertDialog open={confirmRemove} onOpenChange={setConfirmRemove}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove branding asset?</AlertDialogTitle>
            <AlertDialogDescription>
              The technology will fall back to a neutral initials placeholder everywhere in the application.
              This action is recorded in the audit history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                try {
                  await remove.mutateAsync(technology.id);
                  toast.success("Branding removed");
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Remove failed");
                }
                setConfirmRemove(false);
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

function Meta({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="truncate">{value ?? "—"}</div>
    </div>
  );
}
