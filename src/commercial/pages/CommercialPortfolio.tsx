import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DirectionalBanner } from "@/commercial/components/DirectionalBanner";
import { CheckCircle2, CircleDashed, ArrowRight } from "lucide-react";

type ReadinessRow = { label: string; state: "known" | "pending" };

const READINESS: ReadinessRow[] = [
  { label: "Broader account universe known", state: "known" },
  { label: "Aggregate ARR known", state: "known" },
  { label: "No-partner aggregate model known", state: "known" },
  { label: "Account-level ARR pending", state: "pending" },
  { label: "Account-level renewal dates pending validation", state: "pending" },
  { label: "Product mix pending validation", state: "pending" },
  { label: "Partner status pending validation", state: "pending" },
  { label: "Opportunity and sentiment enrichment pending validation", state: "pending" },
];

export default function CommercialPortfolio() {
  return (
    <div className="space-y-6">
      <div data-guide-target="portfolio-context">
        <DirectionalBanner />
      </div>

      <Card data-guide-target="portfolio-summary">
        <CardHeader>
          <CardTitle className="text-base">No account records imported</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p className="text-muted-foreground" data-guide-target="portfolio-account-count">
            The current model represents a 104-account no-partner portfolio at an aggregate level.
            Account-level records have not yet been validated or imported.
          </p>
          <div className="flex flex-wrap gap-2" data-guide-target="portfolio-next-actions">
            <Button asChild variant="default" size="sm">
              <Link to="/commercial/sources">Review source requirements</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/commercial/program">Review program metrics</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/commercial">
                Return to Commercial Overview <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card data-guide-target="portfolio-data-quality">
        <CardHeader>
          <CardTitle className="text-base">Data readiness</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border" data-guide-target="portfolio-readiness">
            {READINESS.map((r) => (
              <li key={r.label} className="flex items-center justify-between gap-3 py-2 text-sm">

                <div className="flex items-center gap-2 min-w-0">
                  {r.state === "known" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />
                  ) : (
                    <CircleDashed className="h-4 w-4 text-muted-foreground" aria-hidden />
                  )}
                  <span className="text-foreground truncate">{r.label}</span>
                </div>
                <Badge variant={r.state === "known" ? "secondary" : "outline"} className="capitalize">
                  {r.state === "known" ? "Known" : "Pending"}
                </Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
