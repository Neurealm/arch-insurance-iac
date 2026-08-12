export function StaffingPrototypeNotice() {
  return (
    <section
      aria-label="Prototype notice"
      className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground"
    >
      <p className="font-semibold text-foreground">Prototype Staffing View</p>
      <p className="mt-1">
        The staffing levels, FTE values, role assignments, utilization, open positions, capacity gaps, and
        resource risks displayed on this screen are illustrative planning assumptions only.
      </p>
      <p className="mt-2">Data source: Local mock data only</p>
      <p>Persistence: Changes reset when the page is refreshed</p>
    </section>
  );
}
