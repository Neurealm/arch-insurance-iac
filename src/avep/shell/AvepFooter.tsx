import { AVEP_IDENTITY } from "../theme";

export function AvepFooter() {
  return (
    <footer
      className="h-8 shrink-0 border-t flex items-center justify-between px-4"
      style={{
        borderColor: "hsl(var(--avep-border))",
        background: "hsl(var(--avep-surface))",
        fontSize: "var(--avep-text-2xs)",
        color: "hsl(var(--avep-foreground-subtle))",
      }}
      role="contentinfo"
    >
      <div className="flex items-center gap-3">
        <span>{AVEP_IDENTITY.shortName} · Foundation Build</span>
        <span>·</span>
        <span>{AVEP_IDENTITY.tenant}</span>
      </div>
      <div className="flex items-center gap-3">
        <span>{AVEP_IDENTITY.program}</span>
        <span>·</span>
        <span className="avep-mono">{AVEP_IDENTITY.primaryIp}</span>
      </div>
    </footer>
  );
}
