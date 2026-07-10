import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useOperations } from "@/runops/state/RunOpsProviders";

interface Props { title: string; blurb: string; }

export default function RunOpsPlaceholder({ title, blurb }: Props) {
  const { tenant, services, incident } = useOperations();
  const svc = services[0];
  return (
    <div className="mx-auto max-w-[1200px] p-5">
      <div className="mb-4">
        <div className="text-[11px] uppercase tracking-wider text-slate-500">RunOps</div>
        <h1 className="mt-0.5 text-[22px] font-semibold text-slate-900">{title}</h1>
        <p className="mt-1 max-w-3xl text-[12.5px] text-slate-600">{blurb}</p>
      </div>

      <Card className="border-dashed border-slate-300 bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-[14px]">Scenario context</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-md border border-slate-200 p-3">
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Tenant</div>
              <div className="text-[13px] font-semibold text-slate-900">{tenant.name}</div>
            </div>
            <div className="rounded-md border border-slate-200 p-3">
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Service</div>
              <div className="text-[13px] font-semibold text-slate-900">{svc.name}</div>
            </div>
            <div className="rounded-md border border-slate-200 p-3">
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Health</div>
              <div className="text-[13px] font-semibold text-slate-900">{svc.health}</div>
            </div>
            <div className="rounded-md border border-slate-200 p-3">
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Active Incident</div>
              <div className="text-[13px] font-semibold text-red-700">{incident.id}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">Wired to OperationsProvider</Badge>
            <Badge variant="outline" className="text-[10px]">Deterministic demo data</Badge>
            <Badge variant="outline" className="text-[10px]">Connected Mode disabled</Badge>
          </div>

          <div className="rounded-md bg-slate-50 p-3 text-[12px] text-slate-700">
            This module is scaffolded and reserves its route, navigation slot, and provider connection.
            Detailed screens for {title.toLowerCase()} will be built in follow-up iterations.
          </div>

          <Button asChild size="sm" variant="outline" className="h-7 text-[11.5px]">
            <Link to="/runops">Back to Command Center</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
