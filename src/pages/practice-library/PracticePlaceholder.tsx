import { AppShell } from "@/components/eoc/AppShell";
import { useLocation } from "react-router-dom";

export default function PracticePlaceholder({
  title,
  image,
}: {
  title: string;
  image?: string;
}) {
  const { pathname } = useLocation();
  return (
    <AppShell>
      <div className="p-6 md:p-8">
        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">
          Practice Library
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">{title}</h1>
        {image ? (
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <img
              src={image}
              alt={`${title} executive dashboard`}
              className="w-full h-auto block"
            />
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            Dashboard coming soon for <code className="text-foreground">{pathname}</code>.
          </p>
        )}
      </div>
    </AppShell>
  );
}
