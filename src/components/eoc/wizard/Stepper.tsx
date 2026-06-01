import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type Step = { id: number; title: string; subtitle: string };

export function Stepper({ steps, current }: { steps: Step[]; current: number }) {
  return (
    <div className="flex items-start gap-2 overflow-x-auto">
      {steps.map((s, i) => {
        const done = s.id < current;
        const active = s.id === current;
        return (
          <div key={s.id} className="flex items-start gap-3 min-w-0 flex-1">
            <div className="flex flex-col items-start gap-2 min-w-0 flex-1">
              <div className="flex items-center gap-3 w-full">
                <div
                  className={cn(
                    "h-7 w-7 rounded-full grid place-items-center text-xs font-bold shrink-0 border-2 transition",
                    done && "bg-status-healthy border-status-healthy text-white",
                    active && "bg-foreground border-foreground text-background",
                    !done && !active && "bg-card border-border text-muted-foreground",
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : s.id}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1 rounded",
                      done ? "bg-status-healthy" : "bg-border",
                    )}
                  />
                )}
              </div>
              <div className="leading-tight pl-0 -mt-1">
                <div
                  className={cn(
                    "text-[13px] font-semibold truncate",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {s.title}
                </div>
                <div className="text-[11px] text-muted-foreground truncate">{s.subtitle}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}