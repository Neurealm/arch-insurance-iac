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

function NumBadge({ n, color }: { n: string; color: string }) {
  return (
    <span
      className="inline-flex items-center justify-center h-5 px-1.5 rounded text-[10px] font-bold text-white"
      style={{ background: color }}
    >
      {n}
    </span>
  );
}

function Scorecard({
  border,
  num,
  numBg,
  title,
  value,
  visual,
  rows,
}: {
  border: string;
  num: string;
  numBg: string;
  title: string;
  value: string;
  visual: React.ReactNode;
  rows: string[];
}) {
  return (
    <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
      <div className="h-1" style={{ background: border }} />
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <NumBadge n={num} color={numBg} />
          <h4 className="text-sm font-semibold text-foreground leading-tight">{title}</h4>
        </div>
        <div className="rounded-lg bg-muted/40 p-3 mb-3 flex items-center justify-between">
          <div className="text-2xl font-bold tracking-tight text-foreground">{value}</div>
          {visual}
        </div>
        <div className="space-y-0.5">
          {rows.map((r) => <Row key={r} label={r} right={<span className="text-emerald-600">Healthy</span>} />)}
        </div>
      </div>
    </div>
  );
}

const spark = [12,14,13,15,16,18,17,19,21,22,24,23,25,27];

const kpis = [
  { label: "Digital", sub: "Experience", value: "4.6/5", visual: <Stars value={4.6} />, footer: "Employee sentiment", tone: "" },
  { label: "Endpoint", sub: "Compliance", value: "98.7%", visual: <Donut value={98} color="hsl(142 71% 45%)" />, footer: "Healthy" },
  { label: "Provisioning", sub: "Speed", value: "1.2 days", visual: <Sparkline data={spark} color="hsl(187 71% 45%)" />, footer: "30 day trend" },
  { label: "Collaboration", sub: "Availability", value: "99.98%", visual: <Progress value={92} color="hsl(258 89% 66%)" />, footer: "Improving" },
  { label: "VDI Session", sub: "Health", value: "97.3%", visual: <Donut value={97} color="hsl(199 89% 48%)" />, footer: "Healthy" },
  { label: "Device Risk", sub: "Reduction", value: "41%", visual: <MiniBars data={[5,4,3,2,3]} color="hsl(142 71% 45%)" />, footer: "Risk declining" },
  { label: "Patch SLA", sub: "Attainment", value: "96%", visual: <Donut value={96} color="hsl(25 95% 53%)" />, footer: "Healthy" },
  { label: "Workforce", sub: "Friction Reduced", value: "27%", visual: <Progress value={65} color="hsl(142 71% 45%)" />, footer: "Improving" },
  { label: "Self Healing", sub: "Coverage", value: "68%", visual: <Donut value={68} color="hsl(258 89% 66%)" />, footer: "Healthy" },
  { label: "Productivity", sub: "Recovered", value: "8.2K hrs", visual: <Sparkline data={spark} color="hsl(217 91% 60%)" />, footer: "30 day trend" },
];

const scorecards = [
  { border:"#06b6d4", num:"01", numBg:"#0891b2", title:"Digital Experience and XLAs", value:"4.6/5", visual:<Stars value={4.6}/>, rows:["Experience Score","Employee Effort","VIP Satisfaction","Experience Signals"]},
  { border:"#22c55e", num:"02", numBg:"#16a34a", title:"Endpoint Compliance and Security", value:"98.7%", visual:<Donut value={98} color="hsl(142 71% 45%)"/>, rows:["Device Compliance","Encryption Coverage","Risk Exposure","Patch Currency"]},
  { border:"#3b82f6", num:"03", numBg:"#2563eb", title:"Provisioning and Onboarding", value:"1.2 days", visual:<Sparkline data={spark} color="hsl(187 71% 45%)"/>, rows:["Laptop Readiness","Account Provisioning","Manual Touch Reduction","Day 1 Readiness"]},
  { border:"#8b5cf6", num:"04", numBg:"#7c3aed", title:"VDI and Workspace Reliability", value:"97.3%", visual:<Donut value={97} color="hsl(258 89% 66%)"/>, rows:["Session Availability","Login Performance","Profile Stability","Workspace Health"]},
  { border:"#f97316", num:"05", numBg:"#ea580c", title:"Patch and Vulnerability Management", value:"96%", visual:<Progress value={96} color="hsl(25 95% 53%)"/>, rows:["Critical Patch SLA","High Risk Exposure","Remediation Speed","Compliance Drift"]},
  { border:"#3b82f6", num:"06", numBg:"#2563eb", title:"Collaboration Platform Operations", value:"99.98%", visual:<Donut value={99} color="hsl(199 89% 48%)"/>, rows:["Teams Availability","Voice Quality","Meeting Reliability","User Sentiment"]},
  { border:"#ec4899", num:"07", numBg:"#db2777", title:"Asset Lifecycle and Inventory", value:"92%", visual:<Progress value={92} color="hsl(330 81% 60%)"/>, rows:["Inventory Accuracy","Refresh Coverage","Warranty Visibility","Asset Recovery"]},
  { border:"#3b82f6", num:"08", numBg:"#2563eb", title:"Mobility and Remote Workforce", value:"94%", visual:<Donut value={94} color="hsl(217 91% 60%)"/>, rows:["Remote Connectivity","Mobile Device Health","VPN Reliability","Travel Readiness"]},
  { border:"#8b5cf6", num:"09", numBg:"#7c3aed", title:"Self Healing and Automation", value:"68%", visual:<MiniBars data={[3,5,2,4,3]} color="hsl(142 71% 45%)"/>, rows:["Touchless Resolution","Auto Remediation","Workflow Success","Human Escalation"]},
  { border:"#22c55e", num:"10", numBg:"#16a34a", title:"Workforce Productivity and Adoption", value:"8.2K hrs", visual:<Sparkline data={spark} color="hsl(142 71% 45%)"/>, rows:["Hours Recovered","Adoption Score","Digital Friction Reduced","Training Completion"]},
];

export default function EucDashboard() {
  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Practice Library"
        title="Digital Workplace and EUC Executive Dashboard"
        subtitle="Executive experience, workforce productivity, endpoint health, collaboration reliability, and digital employee outcomes"
      />

      <Section title="Strategic KPI and SLA Overview" className="mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-3">
          {kpis.map((k) => (
            <div key={k.label+k.sub} className="rounded-xl border bg-card p-3">
              <div className="text-[11px] font-semibold text-muted-foreground leading-tight min-h-[28px]">
                {k.label}<br/>{k.sub}
              </div>
              <div className="text-xl font-bold text-foreground mt-1">{k.value}</div>
              <div className="mt-2 flex items-center justify-center min-h-[40px]">{k.visual}</div>
              {k.footer && <div className="text-[10px] text-emerald-600 mt-1 text-center">{k.footer}</div>}
            </div>
          ))}
        </div>
      </Section>

      <div className="mb-3">
        <h2 className="text-lg font-bold text-foreground">Digital Workplace and EUC Capability Scorecards</h2>
        <p className="text-xs text-muted-foreground">Executive reporting focused on workforce experience, endpoint readiness, device security, collaboration continuity, and employee productivity</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {scorecards.map((s) => <Scorecard key={s.num} {...s} />)}
      </div>

      <div className="mt-6 rounded-xl border bg-card p-4 text-xs">
        <span className="font-semibold text-indigo-600 mr-2">Executive Signal</span>
        <span className="text-muted-foreground">
          This Digital Workplace and EUC dashboard prioritizes employee experience, productivity, endpoint readiness, collaboration continuity, and governed automation
        </span>
      </div>
    </DashboardLayout>
  );
}