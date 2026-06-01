import { usePersona } from "@/context/PersonaContext";
import type { Persona } from "@/data/eoc";
import { cn } from "@/lib/utils";

const personas: { id: Persona; label: string }[] = [
  { id: "executive", label: "Executive" },
  { id: "operations", label: "Operations" },
  { id: "security", label: "Security" },
  { id: "sre", label: "SRE" },
];

export function PersonaToggle() {
  const { persona, setPersona } = usePersona();
  return (
    <div className="inline-flex items-center p-1 rounded-xl bg-secondary border border-border">
      {personas.map((p) => {
        const active = p.id === persona;
        return (
          <button
            key={p.id}
            onClick={() => setPersona(p.id)}
            className={cn(
              "px-4 h-8 rounded-lg text-xs font-semibold transition-all",
              active
                ? "bg-indigo text-indigo-foreground shadow-[var(--shadow-md)]"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}