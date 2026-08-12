import { useLocation } from "react-router-dom";
import { Construction } from "lucide-react";
import { AVEP_NAV } from "../shell/navigation";

export function ModulePlaceholder() {
  const { pathname } = useLocation();
  const match = AVEP_NAV.find((n) => n.path === pathname);
  const label = match?.label ?? "Module";

  return (
    <div className="max-w-2xl">
      <div
        className="rounded-lg border p-6 flex items-start gap-4"
        style={{
          background: "hsl(var(--avep-surface))",
          borderColor: "hsl(var(--avep-border))",
          boxShadow: "var(--avep-shadow-xs)",
        }}
      >
        <div
          className="h-10 w-10 rounded-md shrink-0 flex items-center justify-center"
          style={{
            background: "hsl(var(--avep-accent-soft))",
            color: "hsl(var(--avep-accent))",
          }}
        >
          <Construction className="h-5 w-5" />
        </div>
        <div className="flex flex-col gap-1.5">
          <div style={{ fontSize: "var(--avep-text-md)", fontWeight: 600 }}>{label}</div>
          <p style={{ fontSize: "var(--avep-text-sm)", color: "hsl(var(--avep-foreground-muted))", lineHeight: "var(--avep-leading-relaxed)" }}>
            The <strong>{label}</strong> module will be installed in a later prompt in the AVEP build sequence.
            The shell, navigation, and design foundation are in place; the business surface is intentionally not yet built.
          </p>
          <div
            className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded self-start"
            style={{
              fontSize: "var(--avep-text-2xs)",
              background: "hsl(var(--avep-surface-muted))",
              border: "1px solid hsl(var(--avep-border))",
              color: "hsl(var(--avep-foreground-subtle))",
              letterSpacing: "var(--avep-tracking-wide)",
            }}
          >
            NOT INSTALLED
          </div>
        </div>
      </div>
    </div>
  );
}
