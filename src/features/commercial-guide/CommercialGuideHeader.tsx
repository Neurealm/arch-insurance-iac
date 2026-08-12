import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Printer } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { CommercialGuideContent, GuideMode } from "./types";
import { useCommercialGuide } from "./CommercialGuideProvider";
import { CommercialGuideSearch } from "./CommercialGuideSearch";
import { guideToPlainText } from "./guideText";

const MODE_LABEL: Record<GuideMode, string> = {
  executive: "Executive",
  practitioner: "Practitioner",
  administrator: "Administrator",
};

export function CommercialGuideHeader({ guide }: { guide: CommercialGuideContent }) {
  const { mode, setMode, announce } = useCommercialGuide();

  const copyGuide = async () => {
    const text = guideToPlainText(guide);
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Guide copied", description: "The guide text was copied to your clipboard." });
      announce("Guide copied to clipboard.");
    } catch {
      toast({ title: "Copy unavailable", description: "Clipboard access was blocked by the browser." });
    }
  };

  return (
    <div className="space-y-3 border-b border-border px-5 pb-4 pt-2">
      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
        <Badge variant="secondary">Commercial Digital Twin Training</Badge>
        {guide.isFallback && <Badge variant="outline">Training content pending validation</Badge>}
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground sm:grid-cols-4">
        <div>
          <dt className="font-medium text-foreground">Audience</dt>
          <dd>{guide.audiences.join(", ")}</dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Reading time</dt>
          <dd>{guide.estimatedReadingMinutes} min</dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Training level</dt>
          <dd>{guide.trainingLevel}</dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Last updated</dt>
          <dd>{guide.lastUpdated}</dd>
        </div>
      </dl>

      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor="guide-mode">
          Guide mode
        </label>
        <Select value={mode} onValueChange={(v) => { setMode(v as GuideMode); announce(`${MODE_LABEL[v as GuideMode]} mode selected.`); }}>
          <SelectTrigger id="guide-mode" className="h-8 w-[170px] text-xs">
            <SelectValue placeholder="Guide mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="executive">Executive mode</SelectItem>
            <SelectItem value="practitioner">Practitioner mode</SelectItem>
            <SelectItem value="administrator">Administrator mode</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={copyGuide}>
          <Copy className="mr-1.5 h-3.5 w-3.5" aria-hidden />
          Copy Guide
        </Button>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="mr-1.5 h-3.5 w-3.5" aria-hidden />
          Print Guide
        </Button>
      </div>

      <CommercialGuideSearch guide={guide} />
    </div>
  );
}
