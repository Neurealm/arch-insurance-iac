import * as React from "react";
import type { CommercialGuideContent, GuideMode } from "./types";
import { clearGuideHighlights, highlightGuideTarget } from "./CommercialPageHighlight";

type GuideState = {
  guide: CommercialGuideContent | null;
  open: boolean;
  setOpen: (open: boolean) => void;
  mode: GuideMode;
  setMode: (mode: GuideMode) => void;
  search: string;
  setSearch: (value: string) => void;
  bookmarks: string[];
  toggleBookmark: (sectionId: string) => void;
  reviewed: boolean;
  setReviewed: (value: boolean) => void;
  announce: (message: string) => void;
  announcement: string;
  showOnPage: (targetId: string, label: string) => void;
  walkthroughIndex: number | null;
  startWalkthrough: () => void;
  moveWalkthrough: (delta: number) => void;
  exitWalkthrough: () => void;
};

const Ctx = React.createContext<GuideState | null>(null);

/**
 * Session-only guide state. Nothing here is persisted — no localStorage,
 * no sessionStorage, no backend. All values reset on refresh.
 */
export function CommercialGuideProvider({
  guide,
  children,
}: {
  guide: CommercialGuideContent | null;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<GuideMode>("practitioner");
  const [search, setSearch] = React.useState("");
  const [bookmarks, setBookmarks] = React.useState<string[]>([]);
  const [reviewed, setReviewed] = React.useState(false);
  const [announcement, setAnnouncement] = React.useState("");
  const [walkthroughIndex, setWalkthroughIndex] = React.useState<number | null>(null);

  const pageId = guide?.pageId;
  // Reset session state when the page changes.
  React.useEffect(() => {
    setOpen(false);
    setSearch("");
    setBookmarks([]);
    setReviewed(false);
    setWalkthroughIndex(null);
    clearGuideHighlights();
  }, [pageId]);

  const announce = React.useCallback((message: string) => setAnnouncement(message), []);

  const toggleBookmark = React.useCallback((sectionId: string) => {
    setBookmarks((prev) =>
      prev.includes(sectionId) ? prev.filter((s) => s !== sectionId) : [...prev, sectionId],
    );
  }, []);

  const showOnPage = React.useCallback(
    (targetId: string, label: string) => {
      setOpen(false);
      window.setTimeout(() => {
        const found = highlightGuideTarget(targetId);
        announce(found ? `Highlighted ${label} on the page.` : `${label} is not visible on this page.`);
      }, 220);
    },
    [announce],
  );

  const targets = guide?.showOnPageTargets ?? [];

  const applyStep = React.useCallback(
    (index: number) => {
      const target = targets[index];
      if (!target) return;
      const found = highlightGuideTarget(target.targetId, true);
      announce(
        found
          ? `Walkthrough step ${index + 1} of ${targets.length}: ${target.label}.`
          : `Walkthrough step ${index + 1}: ${target.label} is not visible on this page.`,
      );
    },
    [targets, announce],
  );

  const startWalkthrough = React.useCallback(() => {
    if (targets.length === 0) {
      announce("No walkthrough targets are configured for this page.");
      return;
    }
    setOpen(false);
    setWalkthroughIndex(0);
    window.setTimeout(() => applyStep(0), 220);
  }, [targets.length, applyStep, announce]);

  const moveWalkthrough = React.useCallback(
    (delta: number) => {
      setWalkthroughIndex((prev) => {
        if (prev === null) return prev;
        const next = Math.min(Math.max(prev + delta, 0), targets.length - 1);
        applyStep(next);
        return next;
      });
    },
    [targets.length, applyStep],
  );

  const exitWalkthrough = React.useCallback(() => {
    setWalkthroughIndex(null);
    clearGuideHighlights();
    announce("Walkthrough closed.");
  }, [announce]);

  const value: GuideState = {
    guide,
    open,
    setOpen,
    mode,
    setMode,
    search,
    setSearch,
    bookmarks,
    toggleBookmark,
    reviewed,
    setReviewed,
    announce,
    announcement,
    showOnPage,
    walkthroughIndex,
    startWalkthrough,
    moveWalkthrough,
    exitWalkthrough,
  };

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>
    </Ctx.Provider>
  );
}

export function useCommercialGuide(): GuideState {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useCommercialGuide must be used within CommercialGuideProvider");
  return ctx;
}
