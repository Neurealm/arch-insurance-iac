import { EmptyState } from "@/platform/components/States";
import { useCommercialAccess } from "@/commercial/hooks/useCommercialAccess";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CommercialOverview() {
  const { activeTenant, permissions, isPlatformAdmin } = useCommercialAccess();
  const commercialPerms = Array.from(permissions).filter((p) => p.startsWith("commercial.")).sort();
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Active Workspace</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            <div><span className="text-muted-foreground">Name:</span> {activeTenant?.name ?? "—"}</div>
            <div><span className="text-muted-foreground">Slug:</span> <span className="font-mono text-xs">{activeTenant?.slug ?? "—"}</span></div>
            <div><span className="text-muted-foreground">Status:</span> {activeTenant?.status ?? "—"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Commercial Permissions</CardTitle>
              {isPlatformAdmin && <Badge variant="secondary">Platform Admin</Badge>}
            </div>
          </CardHeader>
          <CardContent>
            {commercialPerms.length ? (
              <div className="flex flex-wrap gap-1.5">
                {commercialPerms.map((p) => (
                  <Badge key={p} variant="outline" className="font-mono text-[11px]">{p}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No explicit commercial permissions.</p>
            )}
          </CardContent>
        </Card>
      </div>
      <EmptyState
        title="No Commercial program configured"
        description="A program (such as Project Momentous) will appear here once it is provisioned inside this workspace."
      />
    </div>
  );
}
