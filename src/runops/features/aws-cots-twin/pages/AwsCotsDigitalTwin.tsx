import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cloud, Layers, ShieldAlert } from "lucide-react";

/**
 * AWS COTS Digital Twin — Foundation placeholder.
 *
 * Subject: "COTS Application, Single Region, Dual Availability Zone".
 * This page reserves the route and demonstrates the intended shell only.
 * It intentionally contains no fake architecture, no simulated telemetry,
 * and no non-functional controls. Data model, canvas, hover cards, and
 * the persistent details panel are delivered in later build phases.
 */
export default function AwsCotsDigitalTwinPage() {
  return (
    <div className="mx-auto max-w-[1200px] p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-slate-500">Services</div>
          <h1 className="mt-0.5 flex items-center gap-2 text-[22px] font-semibold text-slate-900">
            <Cloud className="h-5 w-5 text-slate-700" aria-hidden />
            AWS COTS Digital Twin
          </h1>
          <p className="mt-1 max-w-3xl text-[12.5px] text-slate-600">
            COTS Application, Single Region, Dual Availability Zone. Digital twin of a production
            Commercial Off-The-Shelf application hosted in one AWS Region across two Availability Zones.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">
            Foundation in Progress
          </Badge>
          <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
            Phase 0 · Scaffolding
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-12 border-slate-200 xl:col-span-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-[14px]">Build phase overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-[12.5px] text-slate-700">
            <p>
              The route, navigation slot, feature module, build manifest, and implementation
              blueprint have been created. No resource model, no architecture canvas, no telemetry,
              and no simulated controls exist yet — those arrive in subsequent build phases.
            </p>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <div className="text-[10.5px] uppercase tracking-wider text-slate-500">Route</div>
              <div className="font-mono text-[11.5px] text-slate-900">/runops/aws-cots-digital-twin</div>
            </div>
            <ol className="ml-4 list-decimal space-y-1 text-[12px]">
              <li><span className="font-semibold text-slate-900">Phase 0</span> — Foundation, route, manifest, blueprint <span className="text-emerald-700">(current)</span></li>
              <li>Phase 1 — Core data model, typed repositories, seeded demo data</li>
              <li>Phase 2 — Page shell, header, business-service summary, responsive layout</li>
              <li>Phase 3 — Architecture canvas + visual hierarchy</li>
              <li>Phase 4 — Standardized resource hover cards</li>
              <li>Phase 5 — Persistent resource details panel</li>
            </ol>
          </CardContent>
        </Card>

        <Card className="col-span-12 border-slate-200 xl:col-span-4">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-[14px]">
              <Layers className="h-4 w-4 text-slate-500" aria-hidden />
              Feature module
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-[12px] text-slate-700">
            <div>
              <div className="text-[10.5px] uppercase tracking-wider text-slate-500">Location</div>
              <div className="font-mono text-[11.5px]">src/runops/features/aws-cots-twin/</div>
            </div>
            <div>
              <div className="text-[10.5px] uppercase tracking-wider text-slate-500">Docs</div>
              <ul className="mt-0.5 space-y-0.5 font-mono text-[11.5px]">
                <li>manifest.md</li>
                <li>blueprint.md</li>
              </ul>
            </div>
            <div className="flex items-start gap-2 rounded-md border border-slate-200 bg-white p-2 text-[11.5px]">
              <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden />
              <span>
                No AWS credentials, tokens, or privileged APIs are exposed to the browser.
                All future AWS access will flow through typed server-side adapters.
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
