import type { GlossaryGuide } from "./types";
import { GuidePending } from "./CommercialGuideSection";

export function CommercialGuideGlossary({ glossary }: { glossary: GlossaryGuide[] }) {
  if (glossary.length === 0) return <GuidePending label="Key terms pending validation" />;
  return (
    <dl className="space-y-1.5 text-xs">
      {glossary.map((g) => (
        <div key={g.term}>
          <dt className="font-medium text-foreground">{g.term}</dt>
          <dd className="text-muted-foreground">{g.definition}</dd>
        </div>
      ))}
    </dl>
  );
}
