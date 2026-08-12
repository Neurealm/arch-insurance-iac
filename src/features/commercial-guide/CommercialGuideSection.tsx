import * as React from "react";
import { ChevronDown, Bookmark, BookmarkCheck, Crosshair } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCommercialGuide } from "./CommercialGuideProvider";

export function GuidePending({ label = "Content pending validation" }: { label?: string }) {
  return (
    <p className="rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
      {label}
    </p>
  );
}

export function CommercialGuideSection({
  id,
  title,
  targetId,
  targetLabel,
  defaultOpen = true,
  children,
}: {
  id: string;
  title: string;
  targetId?: string;
  targetLabel?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const { bookmarks, toggleBookmark, showOnPage } = useCommercialGuide();
  const [open, setOpen] = React.useState(defaultOpen);
  const bookmarked = bookmarks.includes(id);
  const panelId = `guide-panel-${id}`;
  const headerId = `guide-header-${id}`;

  return (
    <section className="border-b border-border py-3" aria-labelledby={headerId}>
      <div className="flex items-start gap-1">
        <h3 id={headerId} className="flex-1 min-w-0">
          <button
            type="button"
            className="flex w-full items-center gap-2 text-left text-sm font-semibold text-foreground"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((v) => !v)}
          >
            <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", !open && "-rotate-90")} aria-hidden />
            <span className="min-w-0">{title}</span>
          </button>
        </h3>
        {targetId && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label={`Show ${targetLabel ?? title} on page`}
            onClick={() => showOnPage(targetId, targetLabel ?? title)}
          >
            <Crosshair className="h-4 w-4" aria-hidden />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-pressed={bookmarked}
          aria-label={bookmarked ? `Remove bookmark from ${title}` : `Bookmark ${title}`}
          onClick={() => toggleBookmark(id)}
        >
          {bookmarked ? <BookmarkCheck className="h-4 w-4" aria-hidden /> : <Bookmark className="h-4 w-4" aria-hidden />}
        </Button>
      </div>
      <div id={panelId} role="region" aria-labelledby={headerId} hidden={!open} className="mt-2 space-y-2 pl-6 text-sm">
        {children}
      </div>
    </section>
  );
}

export function GuideList({ items, empty }: { items: string[]; empty?: string }) {
  if (items.length === 0) return <GuidePending label={empty} />;
  return (
    <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function GuideParagraph({ text, empty }: { text?: string; empty?: string }) {
  if (!text) return <GuidePending label={empty} />;
  return <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>;
}
