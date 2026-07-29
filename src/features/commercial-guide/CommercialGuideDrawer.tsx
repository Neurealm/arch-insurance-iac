import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useCommercialGuide } from "./CommercialGuideProvider";
import { CommercialGuideHeader } from "./CommercialGuideHeader";
import { CommercialGuideTabs } from "./CommercialGuideTabs";
import { CommercialGuideFooter } from "./CommercialGuideFooter";

export function CommercialGuideDrawer() {
  const { guide, open, setOpen } = useCommercialGuide();
  if (!guide) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-xl lg:max-w-2xl"
        aria-label={`${guide.guideTitle} guide`}
      >
        <SheetHeader className="space-y-1 px-5 pb-2 pt-5 text-left">
          <SheetTitle className="text-base">{guide.guideTitle}</SheetTitle>
          <SheetDescription className="text-xs">
            {guide.pageTitle} · Commercial Digital Twin
          </SheetDescription>
        </SheetHeader>
        <CommercialGuideHeader guide={guide} />
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
          <CommercialGuideTabs guide={guide} />
        </div>
        <CommercialGuideFooter />
      </SheetContent>
    </Sheet>
  );
}
