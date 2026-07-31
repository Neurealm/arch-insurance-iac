import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCommercialGuide } from "./CommercialGuideProvider";

const TOOLTIP =
  "Open page-specific commercial instructions, logic, responsibilities, and training. Shortcut: Shift + ?";

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
              onClick={() => setOpen(true)}
              aria-haspopup="dialog"
              className="shadow-sm"
            >
              <BookOpen className="mr-1.5 h-4 w-4" aria-hidden />
              Commercial Guide
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
