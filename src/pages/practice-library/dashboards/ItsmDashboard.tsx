import DashboardLayout from "./_layout";
import {
  PageHeader,
  Section,
  Donut,
  Sparkline,
  MiniBars,
  Stars,
  Progress,
  Row,
} from "@/components/practice-library/widgets";

const spark = [12, 14, 13, 15, 16, 18, 17, 19, 21, 22, 24, 23, 25, 27];
const bars = [4, 6, 5, 7, 3, 5, 4, 6, 5, 7];

function TileBorder({ color }: { color: string }) {
  return <div className="h-1 rounded-t-2xl" style={{ background: color }} />;
}

function Scorecard({
  color,
  swatchColor,
  title,
  value,
  visual,
  rows,
}: {
  color: string;
  swatchColor: string;
  title: string;
  value: string;
  visual: React.ReactNode;
  rows: { label: string; tone?: "ok" | "warn" | "bad" }[];
}) {
  return (
    <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
      <TileBorder color={color} />
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="h-4 w-4 rounded-sm" style={{ background: swatchColor }} />
          <h4 className="text-sm font-semibold text-foreground leading-tight">{title}</h4>
        </div>
        <div className="rounded-lg bg-muted/40 p-3 mb-3 flex items-center justify-between">
          <div className="text-2xl font-bold tracking-tight text-foreground">{value}</div>
          <div>{visual}</div>
        </div>
        <div className="space-y-0.5">
          {rows.map((r) => (
            <Row key={r.label} label={r.label} right={<span className="text-emerald-600">Healthy</span>} />
          ))}
        </div>
      </div>
    </div>
  );
}

const kpis: {
  label: string;
  sub?: string;
  value: string;
  visual: React.ReactNode;
  footer?: string;
}[] = [
  { label: "Priority SLA", sub: "Attainment", value: "96.2%", visual: <Donut value={96} color="hsl(258 89% 66%)" />, footer: "Healthy" },
  { label: "Experience", sub: "Score", value: "4.6/5", visual: <Stars value={4.6} />, footer: "Executive and user sentiment" },
  { label: "Productivity", sub: "Restored", value: "12.4K", visual: <Progress value={72} color="hsl(142 71% 45%)" />, footer: "Improving" },
  { label: "MTTR", value: "24m", visual: <Sparkline data={spark} color="hsl(187 71% 45%)" />, footer: "30 day trend" },
  { label: "Major Incident", sub: "Reduction", value: "42%", visual: <MiniBars data={[5,4,3,2,3]} color="hsl(142 71% 45%)" />, footer: "Risk declining" },
  { label: "Self Service", sub: "Resolution", value: "38%", visual: <Donut value={38} color="hsl(199 89% 48%)" />, footer: "Automated" },
  { label: "Change Success", sub: "Rate", value: "94%", visual: <Donut value={94} color="hsl(142 71% 45%)" />, footer: "Healthy" },
  { label: "Knowledge", sub: "Reuse", value: "71%", visual: <Progress value={71} color="hsl(258 89% 66%)" />, footer: "Improving" },
  { label: "Automation", sub: "Coverage", value: "72%", visual: <Donut value={72} color="hsl(217 91% 60%)" />, footer: "Automated" },
  { label: "Cost to Serve", sub: "Reduction", value: "18%", visual: <Sparkline data={[20,19,21,18,17,18,19,18,17,16,17,18]} color="hsl(25 95% 53%)" />, footer: "30 day trend" },
];

const scorecards = [
  { color: "#06b6d4", swatchColor: "#3b82f6", title: "Executive Experience and XLAs", value: "4.6/5", visual: <Stars value={4.6} />, rows: [{label:"User Satisfaction"},{label:"Employee Effort"},{label:"VIP Attainment"},{label:"Experience Signals"}] },
  { color: "#14b8a6", swatchColor: "#0d9488", title: "Incident Management and Restoration", value: "24m", visual: <Sparkline data={spark} color="hsl(187 71% 45%)" />, rows: [{label:"P1 Response SLA"},{label:"Restore Within SLA"},{label:"Repeat Incident Reduction"},{label:"Major Incident Cadence"}] },
  { color: "#22c55e", swatchColor: "#16a34a", title: "Request Fulfillment", value: "94%", visual: <Progress value={94} color="hsl(142 71% 45%)" />, rows: [{label:"Onboarding SLA"},{label:"Request Cycle"},{label:"Manual Touch Reduction"},{label:"Backlog Risk"}] },
  { color: "#f97316", swatchColor: "#ea580c", title: "Problem Management", value: "42%", visual: <MiniBars data={[3,5,2,4,3]} color="hsl(142 71% 45%)" />, rows: [{label:"RCA Completion"},{label:"Known Error Burn"},{label:"Permanent Fix Rate"},{label:"Business Impact"}] },
  { color: "#8b5cf6", swatchColor: "#7c3aed", title: "Change Governance", value: "94%", visual: <Donut value={94} color="hsl(258 89% 66%)" />, rows: [{label:"Failed Change Rate"},{label:"Emergency Changes"},{label:"Approval Time"},{label:"Risk Control"}] },
  { color: "#3b82f6", swatchColor: "#2563eb", title: "Knowledge and Self Service", value: "71%", visual: <Donut value={71} color="hsl(199 89% 48%)" />, rows: [{label:"Self Service Success"},{label:"Search Success"},{label:"Article Health"},{label:"Virtual Agent"}] },
  { color: "#ec4899", swatchColor: "#db2777", title: "Vendor and SLA Governance", value: "96.2%", visual: <Progress value={96} color="hsl(330 81% 60%)" />, rows: [{label:"OLA Alignment"},{label:"Vendor Closure"},{label:"Review Actions"},{label:"Reporting Accuracy"}] },
  { color: "#3b82f6", swatchColor: "#2563eb", title: "CMDB and Service Mapping", value: "89%", visual: <Donut value={89} color="hsl(217 91% 60%)" />, rows: [{label:"Critical CI Coverage"},{label:"Owner Coverage"},{label:"Dependency Coverage"},{label:"Exceptions"}] },
  { color: "#8b5cf6", swatchColor: "#7c3aed", title: "Workflow Automation", value: "72%", visual: <Donut value={72} color="hsl(258 89% 66%)" />, rows: [{label:"Workflow Success"},{label:"Routing Accuracy"},{label:"Touchless Resolution"},{label:"Audit Compliance"}] },
  { color: "#22c55e", swatchColor: "#16a34a", title: "Continuous Improvement", value: "$1.1M", visual: <Sparkline data={[20,22,21,23,22,24,23,25,24,26]} color="hsl(142 71% 45%)" />, rows: [{label:"Cost to Serve"},{label:"Cycle Improvement"},{label:"CSI Delivered"},{label:"Risk Reduction"}] },
];

export default function ItsmDashboard() {
  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Practice Library"
        title="IT Service Desk and ITSM Executive Dashboard"
        subtitle="Executive outcomes, service reliability, workforce productivity, automation, governance"
      />

      <Section title="Strategic KPI and SLA Overview" className="mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-3">
          {kpis.map((k) => (
            <div key={k.label} className="rounded-xl border bg-card p-3">
              <div className="text-[11px] font-semibold text-muted-foreground leading-tight min-h-[28px]">
                {k.label}{k.sub && <><br/>{k.sub}</>}
              </div>
              <div className="text-xl font-bold text-foreground mt-1">{k.value}</div>
              <div className="mt-2 flex items-center justify-center min-h-[40px]">{k.visual}</div>
              {k.footer && <div className="text-[10px] text-emerald-600 mt-1 text-center">{k.footer}</div>}
            </div>
          ))}
        </div>
      </Section>

      <div className="mb-3">
        <h2 className="text-lg font-bold text-foreground">ITSM Capability Scorecards</h2>
        <p className="text-xs text-muted-foreground">Mixed executive reporting objects, focused on experience, reliability, governance, automation and operational value</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {scorecards.map((s) => <Scorecard key={s.title} {...s} />)}
      </div>

      <div className="mt-6 rounded-xl border bg-card p-4 text-xs">
        <span className="font-semibold text-indigo-600 mr-2">Executive Signal</span>
        <span className="text-muted-foreground">
          Visual reporting objects intentionally vary across KPI domains to create clearer executive storytelling and reduce dashboard fatigue
        </span>
      </div>
    </DashboardLayout>
  );
}