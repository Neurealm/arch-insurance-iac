import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCommercialGuide } from "./CommercialGuideProvider";

const TOOLTIP =
  "Open page-specific guidance, commercial logic, responsibilities, workflows, interpretation, and training.";

export function CommercialGuideButton({ buttonRef }: { buttonRef?: React.Ref<HTMLButtonElement> }) {
  const { guide, setOpen, hintVisible, dismissHint } = useCommercialGuide();
  if (!guide) return null;

  return (
    <div className="relative">
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              ref={buttonRef}
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setOpen(true)}
              aria-haspopup="dialog"
              aria-label="Open the Commercial Guide for this page"
              className="border border-amber-300 bg-gradient-to-b from-amber-100 to-amber-200 text-amber-900 shadow-sm ring-1 ring-amber-200/60 transition hover:border-amber-400 hover:from-amber-200 hover:to-amber-300 hover:text-amber-950"
            >
              <BookOpen className="mr-1.5 h-4 w-4 text-amber-700" aria-hidden />
              📖 Learn About This Page
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            {TOOLTIP}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {hintVisible && (
        <div
          role="note"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64 rounded-md border border-border bg-popover p-3 text-left shadow-lg print:hidden"
        >
          <p className="text-xs font-medium text-foreground">Page-specific guidance lives here</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Open the guide for instructions, logic, responsibilities, and training for this page. Press
            Shift + ? anytime.
          </p>
          <button
            type="button"
            onClick={dismissHint}
            className="mt-2 text-[11px] font-semibold text-primary underline-offset-2 hover:underline"
          >
            Got it
          </button>
        </div>
      )}
    </div>
  );
}
