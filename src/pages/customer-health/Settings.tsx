import { tenant } from "./data";
import { PageHeader, Panel } from "./primitives";

const preferences = [
  { label: "Default time window", value: tenant.window },
  { label: "Primary contact", value: "cloud-ops@northwindlogistics.com" },
  { label: "Escalation contact", value: "duty-manager@northwindlogistics.com" },
  { label: "Report delivery", value: "Monthly, first business day" },
  { label: "Advisory notifications", value: "Email + Microsoft Teams" },
  { label: "Impact-only mode", value: "On — hide advisories with no customer impact" },
];

export default function CustomerHealthSettings() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Settings"
        subtitle="How this dashboard behaves for your organisation and who we notify."
      />
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Account" subtitle="Your service subscription">
          <dl className="space-y-2">
            {[
              { label: "Organisation", value: tenant.name },
              { label: "Service", value: tenant.service },
              { label: "Subscription tier", value: "Enterprise" },
              { label: "Support plan", value: "24×7 with named service manager" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-4 rounded-lg border border-slate-800 px-3 py-2.5">
                <dt className="text-[12px] text-slate-400">{row.label}</dt>
                <dd className="text-[12.5px] text-slate-100">{row.value}</dd>
              </div>
            ))}
          </dl>
        </Panel>
        <Panel title="Preferences" subtitle="Presentation and notification behaviour">
          <dl className="space-y-2">
            {preferences.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-4 rounded-lg border border-slate-800 px-3 py-2.5">
                <dt className="text-[12px] text-slate-400">{row.label}</dt>
                <dd className="text-right text-[12.5px] text-slate-100">{row.value}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>
    </div>
  );
}
