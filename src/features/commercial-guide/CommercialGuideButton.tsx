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
              className="border border-[#C7D2FE] bg-[#EEF2FF] text-[#312E81] shadow-none hover:border-[#A5B4FC] hover:bg-[#E0E7FF] hover:text-[#312E81]"
            >
              <BookOpen className="mr-1.5 h-4 w-4 text-[#4338CA]" aria-hidden />
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
