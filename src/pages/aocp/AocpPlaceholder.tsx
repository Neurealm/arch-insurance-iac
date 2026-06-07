import { AppShell } from "@/components/eoc/AppShell";
import { Construction } from "lucide-react";

export default function AocpPlaceholder({ title }: { title: string }) {
  return (
    <AppShell>
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-muted-foreground">
        <Construction className="h-12 w-12 opacity-40" />
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <p className="text-sm">This screen is coming soon.</p>
      </div>
    </AppShell>
  );
}
