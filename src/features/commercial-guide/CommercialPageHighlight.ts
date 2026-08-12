const HIGHLIGHT_CLASS = "commercial-guide-highlight";
const HIGHLIGHT_MS = 4000;

let activeTimer: number | undefined;

export function guideTargetSelector(targetId: string): string {
  return `[data-guide-target="${CSS.escape(targetId)}"]`;
}

export function findGuideTarget(targetId: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(guideTargetSelector(targetId));
}

export function clearGuideHighlights() {
  if (activeTimer) window.clearTimeout(activeTimer);
  activeTimer = undefined;
  document
    .querySelectorAll<HTMLElement>(`.${HIGHLIGHT_CLASS}`)
    .forEach((el) => el.classList.remove(HIGHLIGHT_CLASS));
}

/**
 * Scroll a `data-guide-target` element into view and apply a temporary,
 * non-color-only outline. Returns false when the target is not on the page.
 */
export function highlightGuideTarget(targetId: string, persist = false): boolean {
  const el = findGuideTarget(targetId);
  if (!el) return false;

  clearGuideHighlights();
  el.classList.add(HIGHLIGHT_CLASS);
  el.scrollIntoView({ behavior: "smooth", block: "center" });

  if (!persist) {
    activeTimer = window.setTimeout(() => {
      el.classList.remove(HIGHLIGHT_CLASS);
      activeTimer = undefined;
    }, HIGHLIGHT_MS);
  }
  return true;
}
