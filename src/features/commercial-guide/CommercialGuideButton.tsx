import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCommercialGuide } from "./CommercialGuideProvider";

const TOOLTIP = "Open page-specific commercial instructions, logic, responsibilities, and training.";

export function CommercialGuideButton({ buttonRef }: { buttonRef?: React.Ref<HTMLButtonElement> }) {
  const { guide, setOpen } = useCommercialGuide();
  if (!guide) return null;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            ref={buttonRef}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
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
  );
}
