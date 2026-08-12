import { useProjectMomentous } from "@/commercial/hooks/useProjectMomentous";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/platform/components/States";
import { DirectionalBanner } from "@/commercial/components/DirectionalBanner";
import { SeedMomentousButton } from "@/commercial/components/SeedMomentousButton";
import { Lock } from "lucide-react";

export default function CommercialSources() {
  const { data, isLoading } = useProjectMomentous();
  const sources = data?.sources ?? [];

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading sources…</div>;
  if (!data?.program) {
    return (
      <div className="space-y-4">
        <DirectionalBanner />
        <div className="flex justify-end"><SeedMomentousButton /></div>
        <EmptyState
          title="No source references configured"
          description="Seed Project Momentous to register SRC-001 through SRC-006."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div data-guide-target="sources-context">
        <DirectionalBanner />
      </div>
      <div
        className="flex items-center gap-2 text-xs text-muted-foreground"
        data-guide-target="sources-confidentiality"
      >
        <Lock className="h-3.5 w-3.5" />
        Metadata only. Raw content, transcripts, spreadsheets, contact info, and credentials are never stored here.
      </div>
      <div className="grid gap-3 md:grid-cols-2" data-guide-target="sources-registry">
        {sources.map((s) => (
          <Card key={s.id} data-guide-target="sources-record">
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-center gap-2" data-guide-target="sources-identity">
                <Badge variant="outline" className="font-mono text-[11px]">{s.source_code}</Badge>
                <CardTitle className="text-sm">{s.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex flex-wrap gap-1.5" data-guide-target="sources-status">
                <Badge variant="secondary" className="capitalize">{s.source_type.replace(/_/g, " ")}</Badge>
                <Badge variant="outline" className="capitalize">{s.confidentiality}</Badge>
                <Badge variant="outline" className="capitalize">{s.status}</Badge>
              </div>
              {s.notes && <p className="text-muted-foreground" data-guide-target="sources-notes">{s.notes}</p>}

            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
