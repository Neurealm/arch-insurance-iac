import { useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Rocket, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAccess } from "@/platform/access/AccessContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { sanitizeError } from "@/platform/components/States";

const COMMERCIAL_SLUG = "neugain-commercial";

type BootstrapResult = {
  tenant_id: string;
  tenant_created: boolean;
  membership_id: string;
  membership_created: boolean;
  commercial_admin_assigned: boolean;
};

export function CommercialBootstrapButton({
  size = "sm",
  variant = "default",
}: { size?: "sm" | "default"; variant?: "default" | "outline" | "secondary" }) {
  const { tenants, switchTenant, refresh } = useAccess();
  const existing = useMemo(
    () => tenants.find((t) => t.slug === COMMERCIAL_SLUG) ?? null,
    [tenants],
  );

  const bootstrap = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("bootstrap_commercial_workspace");
      if (error) throw error;
      return data as BootstrapResult;
    },
    onSuccess: async (data) => {
      await refresh();
      if (data?.tenant_id) await switchTenant(data.tenant_id);
      toast.success(
        data.tenant_created
          ? "NeuGAIN Commercial workspace created"
          : "NeuGAIN Commercial workspace ready",
        {
          description: data.commercial_admin_assigned
            ? "You were assigned Commercial Administrator."
            : "You already have Commercial Administrator access.",
        },
      );
    },
    onError: (err) => toast.error(sanitizeError((err as Error).message)),
  });

  if (existing) {
    return (
      <Button
        size={size}
        variant={variant}
        onClick={() => switchTenant(existing.tenant_id)}
      >
        <ExternalLink className="mr-1 h-4 w-4" aria-hidden />
        Open Commercial Workspace
      </Button>
    );
  }

  return (
    <Button
      size={size}
      variant={variant}
      onClick={() => bootstrap.mutate()}
      disabled={bootstrap.isPending}
    >
      {bootstrap.isPending
        ? <Loader2 className="mr-1 h-4 w-4 animate-spin" aria-hidden />
        : <Rocket className="mr-1 h-4 w-4" aria-hidden />}
      {bootstrap.isPending ? "Creating…" : "Create Commercial Workspace"}
    </Button>
  );
}
