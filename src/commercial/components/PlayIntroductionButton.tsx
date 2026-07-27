import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export function PlayIntroductionButton({
  text = "Hello, my name is Ryan.",
  label = "Play Introduction",
}: {
  text?: string;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);

  const play = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("tts-speak", { body: { text } });
      if (error) throw error;
      const blob = data instanceof Blob ? data : new Blob([data as BlobPart], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      await new Promise<void>((resolve) => {
        audio.onended = () => resolve();
        audio.onerror = () => resolve();
        audio.play().catch(() => resolve());
      });
      URL.revokeObjectURL(url);
    } catch {
      // fall through to restore label
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={play} disabled={busy}>
      {busy ? "Playing…" : label}
    </Button>
  );
}
