import { DashShell, KPI, Outcome, Section } from "@/components/carveout/DashShell";
import {
  Headphones, CheckCircle2, ShoppingBag, CheckCheck, Users, Smile, Clock,
  Laptop, KeyRound, AlertTriangle, AppWindow, Wrench, FileText,
  Phone, Mic, MoreHorizontal, Send, MessageSquare, Smartphone, Mail,
  Bot, Brain, ArrowRightCircle, Layers, GraduationCap, UserCog,
  TrendingDown, Globe2, Frown, Meh,
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const kpis: KPI[] = [
  { label: "Total Interactions (Today)", value: "5,842", sub: "↑ 24% vs yesterday", subColor: "text-emerald-600", icon: Headphones, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Self-Service Resolution Rate", value: "78.6%", sub: "↑ 6.3% vs yesterday", subColor: "text-emerald-600", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Tickets Created (Auto)", value: "842", sub: "↓ 12% vs yesterday", subColor: "text-emerald-600", icon: ShoppingBag, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Tickets Resolved (Auto)", value: "1,986", sub: "↑ 18% vs yesterday", subColor: "text-emerald-600", icon: CheckCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Users Supported (Today)", value: "4,310", sub: "↑ 22% vs yesterday", subColor: "text-emerald-600", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "User Satisfaction (CSAT)", value: "4.7/5", sub: "↑ 0.4 vs yesterday", subColor: "text-emerald-600", icon: Smile, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Avg. Time to Resolution", value: "6.2 min", sub: "↓ 35% vs yesterday", subColor: "text-emerald-600", icon: Clock, color: "text-emerald-600", bg: "bg-emerald-50" },
];

const portal = [
  { i: Laptop, t: "Request a New Device", s: "Get a new device or replacement" },
  { i: KeyRound, t: "Reset MFA / Password", s: "Reset MFA, password or account" },
  { i: AlertTriangle, t: "Report an Issue", s: "Report and track an IT issue" },
  { i: AppWindow, t: "Software & Access", s: "Request software or access" },
  { i: Wrench, t: "Troubleshoot", s: "AI-guided help and fixes" },
  { i: FileText, t: "Check Order / Status", s: "Track device or request status" },
];

type Msg = { from: "ai" | "user"; text: string; time: string };
const chat: Msg[] = [
  { from: "ai", text: "Hello! I'm your EUC Support Assistant. How can I help you today?", time: "10:30 AM" },
  { from: "user", text: "I need to reset my MFA. I got a new phone.", time: "10:30 AM" },
  { from: "ai", text: "No problem! I'll help you reset your MFA. I'll send a verification to your email to continue.", time: "10:30 AM" },
  { from: "user", text: "Verification code: 782341", time: "10:30 AM" },
  { from: "ai", text: "MFA has been reset successfully! You can now sign in with your new device. Is there anything else I can help you with?", time: "10:31 AM" },
];

const channels = [
  { i: MessageSquare, l: "Chat (Web)" },
  { i: Phone, l: "Voice Call" },
  { i: Smartphone, l: "Mobile App" },
  { i: MessageSquare, l: "WhatsApp" },
  { i: Mail, l: "Email" },
];

const ticketSrc = [
  { l: "From Chat", v: "642", p: "76%" },
  { l: "From Portal", v: "128", p: "15%" },
  { l: "From Voice", v: "72", p: "9%" },
];

const topCats = [
  { l: "Password Reset", v: 412 },
  { l: "MFA Reset", v: 368 },
  { l: "Software Access", v: 276 },
  { l: "Device Setup", v: 254 },
  { l: "Network/VPN", v: 198 },
  { l: "Other", v: 478 },
];

const automationOutcome = [
  { v: "1,986", l: "tickets auto-resolved", c: "text-blue-700" },
  { v: "78.6%", l: "self-service resolution", c: "text-emerald-700" },
  { v: "612 hrs", l: "agent time saved", c: "text-amber-700" },
  { v: "$54.2K", l: "cost savings (est.)", c: "text-violet-700" },
];

const langs = [
  { l: "English", v: "2,356", p: "40%", color: "hsl(217 91% 60%)" },
  { l: "Spanish", v: "1,254", p: "21%", color: "hsl(142 71% 45%)" },
  { l: "French", v: "842", p: "14%", color: "hsl(262 83% 58%)" },
  { l: "German", v: "538", p: "9%", color: "hsl(38 92% 50%)" },
  { l: "Portuguese", v: "326", p: "6%", color: "hsl(0 84% 60%)" },
  { l: "Other", v: "526", p: "9%", color: "hsl(215 16% 47%)" },
];

const topQs = [
  { n: 1, q: "Reset MFA / Authenticator", v: "1,254" },
  { n: 2, q: "Password Reset", v: "1,108" },
  { n: 3, q: "Connect to VPN", v: "642" },
  { n: 4, q: "Request New Device", v: "538" },
  { n: 5, q: "Microsoft 365 Access", v: "426" },
];

const impact = [
  { v: "-32%", l: "Reduction in ticket volume (7 days)", icon: TrendingDown, c: "text-emerald-600", bg: "bg-emerald-50" },
  { v: "-41%", l: "Reduction in AHT (7 days)", icon: TrendingDown, c: "text-amber-600", bg: "bg-amber-50" },
  { v: "+38%", l: "Agent productivity improvement", icon: Users, c: "text-violet-600", bg: "bg-violet-50" },
  { v: "$128K", l: "Cost avoided (7 days)", icon: TrendingDown, c: "text-emerald-600", bg: "bg-emerald-50" },
];

const sentiment = [
  { l: "Positive", v: "74%", icon: Smile, c: "text-emerald-600" },
  { l: "Neutral", v: "18%", icon: Meh, c: "text-amber-600" },
  { l: "Negative", v: "8%", icon: Frown, c: "text-red-600" },
];

const aiCaps = [
  { i: Brain, l: "Intent Understanding" },
  { i: FileText, l: "Knowledge Retrieval" },
  { i: Wrench, l: "Action Execution" },
  { i: Layers, l: "System Integration" },
  { i: GraduationCap, l: "Learning Continuous" },
  { i: UserCog, l: "Human Escalation" },
];

const outcomes: Outcome[] = [];

export default function SelfServiceSupport() {
  return (
    <DashShell
      title="SELF-SERVICE & AGENTIC SUPPORT EXPERIENCE"
      subtitle="AI-powered self-service that resolves issues fast, in any language, without increasing headcount."
      wwh={{
        what: [
          "Self-service portal for users to request, reset, and get help",
          "AI chat + voice agent resolving issues in real time",
          "Auto-ticket creation, routing, and resolution tracking",
          "Multilingual support layer for global users",
          "Impact on service desk volume and resolution efficiency",
        ],
        why: [
          "Users get fast help, 24/7, in their preferred language",
          "Reduces service desk load and operational cost",
          "Improves user satisfaction and productivity",
          "Enables scale without doubling support workforce",
          "Ensures consistent support quality globally",
        ],
        how: [
          "AI agents understand intent and resolve or automate actions",
          "Integrates with tools and systems to take actions securely",
          "Auto-ticket creation for complex issues with context",
          "Continuous learning improves resolution and user experience",
          "Multilingual AI + humans-in-the-loop for complex scenarios",
        ],
      }}
      kpis={kpis}
      outcomes={outcomes}
    >
      {/* Row 1: Self-Service Portal | AI Agent Chat | Ticket Automation | Multilingual */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
        {/* Portal */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Self-Service Portal</div>
          <div className="text-xs text-slate-500 mb-3">Popular actions for users</div>
          <div className="grid grid-cols-2 gap-2">
            {portal.map((p) => {
              const I = p.i;
              return (
                <div key={p.t} className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 hover:bg-blue-50 cursor-pointer">
                  <I className="h-4 w-4 text-blue-600 mb-1" />
                  <div className="text-[11px] font-bold text-slate-900 leading-tight">{p.t}</div>
                  <div className="text-[10px] text-slate-500 leading-tight">{p.s}</div>
                </div>
              );
            })}
          </div>
          <button className="w-full mt-3 rounded-lg bg-blue-600 text-white text-xs font-semibold py-2 hover:bg-blue-700 inline-flex items-center justify-center gap-1.5">
            Go to Self-Service Portal <ArrowRightCircle className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* AI Chat */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col">
          <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">AI Agent Interaction (Live)</div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-blue-100 grid place-items-center"><Bot className="h-4 w-4 text-blue-600" /></div>
              <div>
                <div className="text-xs font-bold">AI Agent</div>
                <div className="text-[10px] text-emerald-600 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Online
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Phone className="h-3.5 w-3.5" /><Mic className="h-3.5 w-3.5" /><MoreHorizontal className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="flex-1 space-y-2 overflow-hidden mb-2">
            {chat.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"} gap-1.5`}>
                {m.from === "ai" && <div className="h-5 w-5 rounded-full bg-blue-100 grid place-items-center shrink-0"><Bot className="h-3 w-3 text-blue-600" /></div>}
                <div className={`max-w-[85%] rounded-lg px-2.5 py-1.5 text-[11px] ${m.from === "user" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-900"}`}>
                  {m.text}
                  <div className={`text-[9px] mt-0.5 ${m.from === "user" ? "text-blue-100" : "text-slate-500"}`}>{m.time}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-2 py-1.5">
            <input className="flex-1 text-[11px] outline-none" placeholder="Type your message..." />
            <Send className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <div className="flex items-center justify-around mt-2 text-[10px] text-slate-500">
            {channels.map((c) => {
              const I = c.i;
              return (
                <div key={c.l} className="flex flex-col items-center gap-0.5">
                  <I className="h-3.5 w-3.5" /> {c.l}
                </div>
              );
            })}
          </div>
        </div>

        {/* Ticket Automation */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Ticket Automation Overview</div>
          <div className="text-xs text-slate-500 mb-3">How tickets are created and resolved</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="rounded-lg bg-slate-50 border border-slate-100 p-2.5 mb-2">
                <div className="text-[10px] text-slate-500">Auto-Ticket Creation</div>
                <div className="text-xl font-bold">842</div>
                <div className="text-[10px] text-slate-500">Today</div>
              </div>
              <div className="space-y-1 text-[11px]">
                {ticketSrc.map((s) => (
                  <div key={s.l} className="flex justify-between">
                    <span className="text-slate-600">{s.l}</span>
                    <span className="font-semibold">{s.v} ({s.p})</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="rounded-md bg-blue-500 text-white text-center text-[11px] font-bold py-1.5">
                Received<br /><span className="text-base">842</span>
              </div>
              <div className="rounded-md bg-emerald-500 text-white text-center text-[11px] font-bold py-1.5 mx-2">
                In Progress<br /><span className="text-base">312</span>
              </div>
              <div className="rounded-md bg-violet-500 text-white text-center text-[11px] font-bold py-1.5 mx-4">
                Auto-Resolved<br /><span className="text-base">1,986</span>
              </div>
              <div className="rounded-md bg-red-500 text-white text-center text-[11px] font-bold py-1.5 mx-6">
                Escalated<br /><span className="text-base">156</span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="text-[10px] font-semibold text-emerald-700 mb-1.5 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Automation Outcome (Today)
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-center">
              {automationOutcome.map((o) => (
                <div key={o.l} className="rounded-md bg-emerald-50 p-1.5">
                  <div className={`text-xs font-bold ${o.c}`}>{o.v}</div>
                  <div className="text-[9px] text-slate-600 leading-tight">{o.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100">
            <div className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">Top Auto-Resolved Categories</div>
            <div className="space-y-1 text-[11px]">
              {topCats.map((c) => (
                <div key={c.l} className="flex justify-between">
                  <span className="text-slate-700">{c.l}</span>
                  <span className="font-bold">{c.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Multilingual */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Multilingual Support</div>
          <div className="text-xs text-slate-500 mb-3">Support in the language users prefer</div>
          <div className="flex items-center gap-3">
            <div className="relative shrink-0" style={{ width: 130, height: 130 }}>
              <PieChart width={130} height={130}>
                <Pie data={langs.map(l => ({ name: l.l, value: parseInt(l.v.replace(",", "")) }))} dataKey="value" cx={65} cy={65} innerRadius={40} outerRadius={62} paddingAngle={2}>
                  {langs.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 grid place-items-center pointer-events-none">
                <div className="text-center">
                  <div className="text-base font-bold">5,842</div>
                  <div className="text-[9px] text-slate-500">Interactions Today</div>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-1 text-[11px]">
              {langs.map((l) => (
                <div key={l.l} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: l.color }} />
                  <span className="flex-1 text-slate-700">{l.l}</span>
                  <span className="font-bold">{l.v} ({l.p})</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 rounded-lg bg-blue-50 border border-blue-100 p-2 text-[11px] text-blue-700 flex items-start gap-1.5">
            <Globe2 className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <div>
              AI agents + content available in 12+ languages with native-level understanding and responses.
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100">
            <div className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">Top User Questions (Today)</div>
            <div className="space-y-1 text-[11px]">
              {topQs.map((q) => (
                <div key={q.n} className="flex items-center gap-2">
                  <span className="text-slate-400 w-3">{q.n}</span>
                  <span className="flex-1 text-slate-700">{q.q}</span>
                  <span className="font-bold">{q.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Impact | User Sentiment | AI Capabilities | Always Available */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Impact on Service Desk</div>
          <div className="text-xs text-slate-500 mb-3">Automation is reducing volume and increasing productivity</div>
          <div className="grid grid-cols-2 gap-3">
            {impact.map((i) => {
              const I = i.icon;
              return (
                <div key={i.l} className="flex items-start gap-2">
                  <div className={`h-8 w-8 rounded-lg ${i.bg} ${i.c} grid place-items-center shrink-0`}>
                    <I className="h-4 w-4" />
                  </div>
                  <div>
                    <div className={`text-base font-bold ${i.c}`}>{i.v}</div>
                    <div className="text-[10px] text-slate-500 leading-tight">{i.l}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-[10px] font-bold text-slate-500 uppercase">User Sentiment (Today)</div>
          <div className="text-xs text-slate-500 mb-3">Based on feedback after interaction</div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {sentiment.map((s) => {
              const I = s.icon;
              return (
                <div key={s.l} className="text-center">
                  <I className={`h-7 w-7 mx-auto mb-1 ${s.c}`} />
                  <div className={`text-lg font-bold ${s.c}`}>{s.v}</div>
                  <div className="text-[10px] text-slate-500">{s.l}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-[10px] font-bold text-slate-500 uppercase mb-3">AI Agent Capabilities</div>
          <div className="grid grid-cols-3 gap-2">
            {aiCaps.map((c) => {
              const I = c.i;
              return (
                <div key={c.l} className="text-center rounded-lg bg-slate-50 border border-slate-100 p-2">
                  <I className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                  <div className="text-[10px] font-semibold text-slate-700 leading-tight">{c.l}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Always Available. Always Learning.</div>
          <div className="mt-4 rounded-lg bg-blue-50 border border-blue-100 p-3 flex items-start gap-2">
            <div className="h-10 w-10 rounded-full bg-blue-100 grid place-items-center shrink-0">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-[11px] text-slate-700 leading-snug">
              <b>24/7 support across time zones</b><br />
              AI resolves, learns, and gets better. So your users stay productive and your team stays ahead.
            </div>
          </div>
        </div>
      </div>
    </DashShell>
  );
}
