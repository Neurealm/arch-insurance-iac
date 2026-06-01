import { AppShell } from "@/components/eoc/AppShell";
import { Link } from "react-router-dom";
import {
  UserRound, Briefcase, Monitor, Lock, Database, TrendingUp,
  HeartPulse, Users, ClipboardList, Users2, Bot, DollarSign,
  ShieldCheck, BarChart3, Clock, UserPlus,
} from "lucide-react";

type Item = { n: number; title: string; desc: string; to?: string };
type Category = {
  title: string;
  icon: typeof UserRound;
  color: string; // tailwind text color class
  bar: string;   // tailwind border color class for left bar
  badge: string; // tailwind bg color for number badge
  items: Item[];
};

const topCats: Category[] = [
  {
    title: "MEMBER & CARE MANAGEMENT",
    icon: UserRound, color: "text-blue-600", bar: "border-blue-500", badge: "bg-blue-600",
    items: [
      { n: 1, title: "Prior Authorization & Utilization Management Coworker", desc: "Streamline authorizations and documentation reviews", to: "/coworkers/healthcare-payer/prior-authorization" },
      { n: 2, title: "Stars, HEDIS & QARR Care Gap Closure Coworker", desc: "Operationalize real-time care gap closure at scale", to: "/coworkers/healthcare-payer/stars-hedis-qarr" },
      { n: 3, title: "Member Renewal & Recertification Coworker", desc: "Reduce coverage lapses with proactive outreach", to: "/coworkers/healthcare-payer/member-renewal" },
      { n: 4, title: "D-SNP & Long-Term Care Navigation Coworker", desc: "Coordinate Medicare, Medicaid, LTSS and caregiver services", to: "/coworkers/healthcare-payer/dsnp-long-term-care" },
      { n: 5, title: "Behavioral Health & Substance Use Transition Coworker", desc: "Improve post-discharge follow-up and reduce readmissions", to: "/coworkers/healthcare-payer/behavioral-health-transition" },
      { n: 6, title: "Medication Adherence & Pharmacy Outreach Coworker", desc: "Increase medication adherence and pharmacy engagement", to: "/coworkers/healthcare-payer/medication-adherence" },
      { n: 7, title: "Pediatric CHW & Developmental Screening Coworker", desc: "Ensure screening completion and closed-loop referrals", to: "/coworkers/healthcare-payer/pediatric-chw-screening" },
      { n: 8, title: "Chronic Disease Management Coworker", desc: "Drive outreach and engagement for chronic conditions", to: "/coworkers/healthcare-payer/chronic-disease" },
    ],
  },
  {
    title: "PROVIDER & PAYER OPERATIONS",
    icon: Briefcase, color: "text-emerald-600", bar: "border-emerald-500", badge: "bg-emerald-600",
    items: [
      { n: 9, title: "Provider Experience & Portal Assistant Coworker", desc: "Improve provider experience and reduce support calls", to: "/coworkers/healthcare-payer/provider-experience" },
      { n: 10, title: "Risk Adjustment & Documentation Integrity Coworker", desc: "Capture and validate documentation for accurate risk scores", to: "/coworkers/healthcare-payer/risk-adjustment" },
      { n: 11, title: "Claims Exception & Appeals Coworker", desc: "Automate exception handling and appeal preparation", to: "/coworkers/healthcare-payer/claims-exception-appeals" },
      { n: 12, title: "Health Equity & Community Outreach Coworker", desc: "Coordinate culturally aligned outreach at scale", to: "/coworkers/healthcare-payer/health-equity" },
    ],
  },
  {
    title: "IT OPERATIONS & RELIABILITY",
    icon: Monitor, color: "text-indigo-600", bar: "border-indigo-500", badge: "bg-indigo-600",
    items: [
      { n: 13, title: "FHIR & CMS Interoperability API Operations Coworker", desc: "Monitor API compliance, uptime, and OAuth governance", to: "/coworkers/healthcare-payer/fhir-cms-api" },
      { n: 14, title: "HIE & Integration Feed Reliability Coworker", desc: "Detect and resolve HIE and integration feed issues", to: "/coworkers/healthcare-payer/hie-integration" },
      { n: 15, title: "Provider Portal & Availity Reliability Coworker", desc: "Monitor provider portal performance and transaction failures", to: "/coworkers/healthcare-payer/provider-portal-availity" },
      { n: 16, title: "EDI & Clearinghouse Resilience Coworker", desc: "Ensure EDI transaction reliability and failover readiness", to: "/coworkers/healthcare-payer/edi-clearinghouse" },
      { n: 17, title: "Prior Authorization Configuration Governance Coworker", desc: "Detect config drift across UM systems and vendors", to: "/coworkers/healthcare-payer/pa-config-governance" },
      { n: 18, title: "Data Quality & Member Identity Coworker", desc: "Identify and resolve data quality and identity issues", to: "/coworkers/healthcare-payer/data-quality-identity" },
      { n: 19, title: "Major Incident & Business Impact Coworker", desc: "Correlate alerts with business impact for faster response", to: "/coworkers/healthcare-payer/major-incident-business-impact" },
      { n: 20, title: "Vendor & SaaS Dependency Risk Coworker", desc: "Monitor vendor health and dependency risks", to: "/coworkers/healthcare-payer/vendor-saas-risk" },
    ],
  },
];

const rightTop: Category[] = [
  {
    title: "CYBERSECURITY & IAM",
    icon: Lock, color: "text-orange-600", bar: "border-orange-500", badge: "bg-orange-600",
    items: [
      { n: 21, title: "Identity, OAuth & Access Governance Coworker", desc: "Manage access risk and OAuth sprawl", to: "/coworkers/healthcare-payer/identity-oauth-governance" },
      { n: 22, title: "Cyber Resilience & Ransomware Readiness Coworker", desc: "Strengthen cybersecurity posture and recovery readiness" },
    ],
  },
  {
    title: "DATA, ANALYTICS & GOVERNANCE",
    icon: Database, color: "text-teal-600", bar: "border-teal-500", badge: "bg-teal-600",
    items: [
      { n: 23, title: "Enterprise Data & Analytics Insights Coworker", desc: "Deliver unified insights across operational and clinical data" },
      { n: 24, title: "AI Model Governance & Monitoring Coworker", desc: "Ensure responsible AI with monitoring and governance" },
    ],
  },
  {
    title: "FINANCE & PERFORMANCE",
    icon: TrendingUp, color: "text-pink-600", bar: "border-pink-500", badge: "bg-pink-600",
    items: [
      { n: 25, title: "Financial Performance & Variance Analysis Coworker", desc: "Analyze financial performance and explain variances" },
      { n: 26, title: "Contract & Provider Performance Coworker", desc: "Track contract performance and provider KPIs" },
    ],
  },
];

const bottomCats: Category[] = [
  {
    title: "QUALITY & CLINICAL EXCELLENCE",
    icon: HeartPulse, color: "text-blue-600", bar: "border-blue-500", badge: "bg-blue-600",
    items: [
      { n: 27, title: "Quality Event Triage & RCA Coworker", desc: "Accelerate event triage and root cause analysis" },
      { n: 28, title: "Clinical Guideline & Best Practice Coworker", desc: "Promote guideline adherence and standardization" },
    ],
  },
  {
    title: "POPULATION HEALTH & RISK",
    icon: Users, color: "text-orange-600", bar: "border-orange-500", badge: "bg-orange-600",
    items: [
      { n: 29, title: "Social Determinants & Community Resource Coworker", desc: "Connect members to community resources" },
      { n: 30, title: "Risk Stratification & Member Insights Coworker", desc: "Identify high-risk members and actionable insights" },
    ],
  },
  {
    title: "COMPLIANCE & REGULATORY",
    icon: ClipboardList, color: "text-emerald-600", bar: "border-emerald-500", badge: "bg-emerald-600",
    items: [
      { n: 31, title: "Compliance & Regulatory Monitoring Coworker", desc: "Monitor regulatory changes and compliance risks" },
      { n: 32, title: "Audit & Evidence Management Coworker", desc: "Automate audit evidence collection and tracking" },
    ],
  },
  {
    title: "WORKPLACE EXPERIENCE",
    icon: Users2, color: "text-teal-600", bar: "border-teal-500", badge: "bg-teal-600",
    items: [
      { n: 33, title: "Employee Support & Knowledge Coworker", desc: "Provide instant answers and self-service support" },
      { n: 34, title: "IT Service Desk & Ticket Triage Coworker", desc: "Triage and resolve IT tickets efficiently" },
    ],
  },
];

function CategoryCard({ cat }: { cat: Category }) {
  const Icon = cat.icon;
  return (
    <div className={`rounded-xl border-l-4 ${cat.bar} bg-white border border-slate-200 shadow-sm p-5`}>
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
        <Icon className={`h-5 w-5 ${cat.color}`} />
        <h3 className={`text-[13px] font-extrabold tracking-wide ${cat.color}`}>{cat.title}</h3>
      </div>
      <div className="space-y-2.5">
        {cat.items.map((it) => (
          it.to ? (
            <Link
              key={it.n}
              to={it.to}
              className="w-full text-left flex gap-3 items-start rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm hover:shadow-md hover:border-slate-300 hover:bg-slate-50/80 transition-all"
            >
              <span className={`shrink-0 h-6 w-6 rounded-full ${cat.badge} text-white text-[11px] font-bold grid place-items-center mt-0.5`}>
                {it.n}
              </span>
              <div className="min-w-0">
                <div className="text-[12.5px] font-semibold text-slate-800 leading-tight">{it.title}</div>
                <div className="text-[11px] text-slate-500 leading-snug mt-1">{it.desc}</div>
              </div>
            </Link>
          ) : (
            <button
              key={it.n}
              type="button"
              className="w-full text-left flex gap-3 items-start rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm hover:shadow-md hover:border-slate-300 hover:bg-slate-50/80 transition-all"
            >
              <span className={`shrink-0 h-6 w-6 rounded-full ${cat.badge} text-white text-[11px] font-bold grid place-items-center mt-0.5`}>
                {it.n}
              </span>
              <div className="min-w-0">
                <div className="text-[12.5px] font-semibold text-slate-800 leading-tight">{it.title}</div>
                <div className="text-[11px] text-slate-500 leading-snug mt-1">{it.desc}</div>
              </div>
            </button>
          )
        ))}
      </div>
    </div>
  );
}

function HeaderBenefit({ icon: Icon, title, desc, color }: { icon: typeof Bot; title: string; desc: string; color: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <Icon className={`h-5 w-5 ${color}`} />
      <div className="leading-tight">
        <div className="text-[11px] font-bold text-slate-800">{title}</div>
        <div className="text-[10px] text-slate-500">{desc}</div>
      </div>
    </div>
  );
}

function FooterBenefit({ icon: Icon, title, desc, color }: { icon: typeof Bot; title: string; desc: string; color: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className={`h-6 w-6 ${color} mt-0.5`} />
      <div className="leading-tight">
        <div className="text-[12px] font-bold text-slate-800">{title}</div>
        <div className="text-[11px] text-slate-500 mt-0.5">{desc}</div>
      </div>
    </div>
  );
}

export default function HealthcarePayer() {
  return (
    <AppShell>
      <main className="flex-1 bg-slate-50 px-8 py-6 animate-fade-in">
        <div className="mx-auto max-w-[1480px] rounded-2xl bg-white border border-slate-200 shadow-sm p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 grid place-items-center">
                <Bot className="h-7 w-7 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-[28px] font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  DIGITAL COWORKER CATALOG
                </h1>
                <p className="text-[12px] text-slate-500 mt-0.5">
                  Intelligent AI-powered coworkers driving efficiency, quality, and better outcomes across Health First.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              <HeaderBenefit icon={Users} title="Better Outcomes" desc="Improve quality, access and member experience" color="text-blue-600" />
              <HeaderBenefit icon={DollarSign} title="Operational Efficiency" desc="Automate work, reduce burden" color="text-emerald-600" />
              <HeaderBenefit icon={ShieldCheck} title="Risk & Compliance" desc="Strengthen compliance, reduce risk" color="text-indigo-600" />
              <HeaderBenefit icon={BarChart3} title="Data-Driven Decisions" desc="Real-time insights for smarter actions" color="text-orange-600" />
            </div>
          </div>

          {/* Top row: 3 wide + right stack */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
            <CategoryCard cat={topCats[0]} />
            <CategoryCard cat={topCats[1]} />
            <CategoryCard cat={topCats[2]} />
            <div className="space-y-5">
              {rightTop.map((c) => <CategoryCard key={c.title} cat={c} />)}
            </div>
          </div>

          {/* Bottom row: 4 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
            {bottomCats.map((c) => <CategoryCard key={c.title} cat={c} />)}
          </div>

          {/* Footer band */}
          <div className="mt-6 rounded-xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white p-4 grid grid-cols-1 lg:grid-cols-6 gap-4 items-center">
            <div className="flex items-center gap-3">
              <div className="leading-tight">
                <div className="text-[10px] tracking-[0.2em] text-indigo-200 font-semibold">POWERING</div>
                <div className="text-lg font-extrabold">HEALTH FIRST</div>
                <div className="text-[11px] text-indigo-200">WITH AI</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-white/10 grid place-items-center">
                <HeartPulse className="h-5 w-5 text-white" />
              </div>
            </div>
            <FooterBenefit icon={Clock} title="Faster Turnaround" desc="Reduce cycle times and improve responsiveness" color="text-cyan-300" />
            <FooterBenefit icon={UserPlus} title="Improved Member and Provider Experience" desc="Deliver seamless, personalized support" color="text-emerald-300" />
            <FooterBenefit icon={ShieldCheck} title="Stronger Compliance and Quality" desc="Reduce risk and improve regulatory outcomes" color="text-indigo-300" />
            <FooterBenefit icon={DollarSign} title="Cost Efficiency" desc="Optimize resources and reduce operating costs" color="text-orange-300" />
            <FooterBenefit icon={BarChart3} title="Data-Driven Decisions" desc="Actionable insights for better business outcomes" color="text-pink-300" />
          </div>
        </div>
      </main>
    </AppShell>
  );
}