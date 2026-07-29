import { CheckCircle2, AlertTriangle, XOctagon } from "lucide-react";
import type { InterpretationGuide, InterpretationBand } from "./types";
import { GuidePending } from "./CommercialGuideSection";

const BAND_META: Record<InterpretationBand, { label: string; Icon: typeof CheckCircle2 }> = {
  healthy: { label: "Healthy", Icon: CheckCircle2 },
  warning: { label: "Warning", Icon: AlertTriangle },
  critical: { label: "Critical", Icon: XOctagon },
};

const ORDER: InterpretationBand[] = ["healthy", "warning", "critical"];

export function CommercialGuideInterpretation({ interpretation }: { interpretation: InterpretationGuide[] }) {
  if (interpretation.length === 0) return <GuidePending label="Interpretation guidance pending validation" />;

  return (
    <div className="space-y-2">
      {ORDER.flatMap((band) => interpretation.filter((i) => i.band === band)).map((item) => {
        const { label, Icon } = BAND_META[item.band];
        return (
          <div key={`${item.band}-${item.label}`} className="rounded-md border border-border px-3 py-2">
            <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Icon className="h-4 w-4" aria-hidden />
              {label}: {item.label}
            </p>
            <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-muted-foreground">
              {item.criteria.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <p className="mt-1 text-xs text-foreground">Action: {item.action}</p>
          </div>
        );
      })}
    </div>
  );
}
