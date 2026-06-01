import { services, type Service } from "@/data/eoc";
import {
  Globe, Smartphone, Monitor, CreditCard, Banknote, Database, KeyRound, Wallet, Plus, Minus, Maximize2, Crosshair, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

const statusStyles: Record<Service["status"], { ring: string; text: string; bg: string }> = {
  healthy: { ring: "border-status-healthy/40", text: "text-status-healthy", bg: "bg-status-healthy-soft" },
  warning: { ring: "border-status-warning/50", text: "text-status-warning", bg: "bg-status-warning-soft" },
  critical: { ring: "border-status-critical/50", text: "text-status-critical", bg: "bg-status-critical-soft" },
  info: { ring: "border-status-info/40", text: "text-status-info", bg: "bg-status-info-soft" },
  maintenance: { ring: "border-border", text: "text-muted-foreground", bg: "bg-secondary" },
};

const iconFor: Record<string, any> = {
  online: Globe, mobile: Smartphone, portal: Monitor, card: CreditCard,
  loan: Banknote, core: Database, identity: KeyRound, payments: Wallet,
};

const positions = [
  { left: "50%", top: "10%" },
  { left: "16%", top: "24%" },
  { left: "84%", top: "24%" },
  { left: "8%",  top: "55%" },
  { left: "92%", top: "55%" },
  { left: "16%", top: "84%" },
  { left: "50%", top: "92%" },
  { left: "84%", top: "84%" },
];

export function ServiceMap() {
  return (
    <section className="bg-card rounded-2xl border border-border p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-foreground">Business Service Map</h2>
        <div className="flex items-center gap-3 flex-wrap">
          {[
            { c: "bg-status-healthy", l: "Healthy" },
            { c: "bg-status-warning", l: "Warning" },
            { c: "bg-status-critical", l: "Critical" },
            { c: "bg-status-info", l: "Maintenance" },
            { c: "bg-muted-foreground", l: "Unknown" },
          ].map((x) => (
            <span key={x.l} className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className={cn("h-2 w-2 rounded-full", x.c)} />
              {x.l}
            </span>
          ))}
        </div>
      </div>

      <div className="relative flex-1 min-h-[360px] rounded-xl bg-gradient-to-b from-secondary/40 to-card border border-border overflow-hidden">
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
          {[Plus, Minus, Maximize2, Crosshair].map((Ic, i) => (
            <button key={i} className="h-8 w-8 rounded-lg bg-card border border-border grid place-items-center text-muted-foreground hover:text-foreground hover:bg-secondary transition">
              <Ic className="h-4 w-4" />
            </button>
          ))}
        </div>

        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
          {positions.map((p, i) => (
            <line key={i} x1="50%" y1="50%" x2={p.left} y2={p.top} stroke="hsl(var(--border))" strokeWidth={1.25} strokeDasharray="4 4" />
          ))}
        </svg>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[1]">
          <div className="h-[118px] w-[118px] rounded-full bg-card border-2 border-status-healthy/50 shadow-[var(--shadow-lg)] grid place-items-center text-center">
            <div>
              <Globe className="h-5 w-5 mx-auto text-status-healthy" />
              <div className="mt-1 text-[13px] font-bold text-foreground leading-tight">Digital<br/>Banking</div>
              <div className="text-[10px] text-status-healthy font-semibold">Healthy</div>
            </div>
          </div>
        </div>

        {services.map((s, i) => {
          const pos = positions[i];
          const st = statusStyles[s.status];
          const Icon = iconFor[s.id] ?? Globe;
          return (
            <div key={s.id} className="absolute -translate-x-1/2 -translate-y-1/2 z-[2]" style={{ left: pos.left, top: pos.top }}>
              <button className={cn("flex items-center gap-2 px-3 py-2 rounded-xl bg-card border-2 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all", st.ring)}>
                <span className={cn("h-7 w-7 rounded-lg grid place-items-center", st.bg, st.text)}>
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="text-left leading-tight">
                  <span className="block text-[12px] font-semibold text-foreground whitespace-nowrap">{s.name}</span>
                  <span className={cn("block text-[10px] font-medium capitalize", st.text)}>{s.status}</span>
                </span>
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-3 text-xs">
        <button className="px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-secondary transition font-medium">
          View Full Map
        </button>
        <span className="text-muted-foreground inline-flex items-center gap-1.5">
          <RefreshCw className="h-3 w-3" />
          Updated: 1 min ago
        </span>
      </div>
    </section>
  );
}