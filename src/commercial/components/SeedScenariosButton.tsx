import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { useCommercialAccess } from "@/commercial/hooks/useCommercialAccess";

export function SeedScenariosButton() {
  const { canManageScenario } = useCommercialAccess();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("seed_project_momentous_scenarios");
      if (error) throw error;
      return data as any;
    },
    onMutate: () => setBusy(true),
    onSettled: () => setBusy(false),
    onSuccess: (data) => {
      toast.success(
        (data?.scenarios_created ?? 0) > 0 || (data?.assumptions_inserted ?? 0) > 0
          ? `Seeded ${data.scenarios_created} scenarios and ${data.assumptions_inserted} assumptions.`
          : "Scenarios already provisioned — no duplicates were created.",
      );
      qc.invalidateQueries({ queryKey: ["commercial"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Scenario seed failed"),
  });

  if (!canManageScenario) return null;
  return (
    <Button size="sm" variant="outline" onClick={() => mutation.mutate()} disabled={busy}>
      <Sparkles className="mr-1 h-4 w-4" />
      {busy ? "Seeding…" : "Seed Scenarios"}
    </Button>
  );
}
