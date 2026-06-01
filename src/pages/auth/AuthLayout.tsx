import { ReactNode } from "react";
import { Link } from "react-router-dom";

export function AuthLayout({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-primary via-indigo to-ai p-12 text-white flex-col justify-between">
        <Link to="/" className="text-2xl font-bold tracking-tight">NeuGain</Link>
        <div className="space-y-4 max-w-md">
          <h2 className="text-4xl font-bold leading-tight">AI-powered operations, run with confidence.</h2>
          <p className="text-white/80">Manage agents, workflows, and dashboards from one secure platform.</p>
        </div>
        <div className="text-xs text-white/60">© {new Date().getFullYear()} NeuGain</div>
        <div className="absolute -bottom-40 -right-40 w-[480px] h-[480px] rounded-full bg-white/10 blur-3xl" />
      </div>
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <Link to="/" className="lg:hidden text-xl font-bold text-primary">NeuGain</Link>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {children}
          {footer && <div className="text-sm text-center text-muted-foreground">{footer}</div>}
        </div>
      </div>
    </div>
  );
}