import { X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useRightDrawer } from "@/runops/state/RunOpsProviders";

/**
 * Reusable 420px right context drawer. Consumers open it by calling
 * `useRightDrawer().openDrawer({ title, subtitle, body })`.
 */
export function RunOpsRightDrawer() {
  const { open, payload, closeDrawer } = useRightDrawer();
  return (
    <Sheet open={open} onOpenChange={(v) => (v ? undefined : closeDrawer())}>
      <SheetContent side="right" className="w-full sm:w-[420px] sm:max-w-[420px] p-0 bg-white">
        <SheetHeader className="border-b border-slate-200 px-5 py-3">
          <SheetTitle className="flex items-start gap-2 text-[14px]">
            <div className="min-w-0 flex-1">
              <div className="truncate text-slate-900">{payload?.title ?? "Context"}</div>
              {payload?.subtitle && (
                <div className="mt-0.5 text-[11px] font-normal text-slate-500">{payload.subtitle}</div>
              )}
            </div>
            <button
              type="button"
              onClick={closeDrawer}
              aria-label="Close drawer"
              className="grid h-6 w-6 place-items-center rounded text-slate-500 hover:bg-slate-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </SheetTitle>
        </SheetHeader>
        <div className="h-[calc(100vh-64px)] overflow-y-auto px-5 py-4">
          {payload?.body}
        </div>
      </SheetContent>
    </Sheet>
  );
}
