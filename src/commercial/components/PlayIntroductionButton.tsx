import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Headphones, Volume2 } from "lucide-react";

const FUNCTIONS_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/tts-speak`;

export function PlayIntroductionButton({
  text = "Hello, my name is Ryan.",
  label = "Play Introduction",
}: {
  text?: string;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = async () => {
    if (busy) return;
    setBusy(true);
    let url: string | undefined;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const res = await fetch(FUNCTIONS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        throw new Error(`${res.status}: ${await res.text().catch(() => "")}`);
      }

      const buffer = await res.arrayBuffer();
      if (buffer.byteLength === 0) throw new Error("Empty audio response");

      const blob = new Blob([buffer], { type: "audio/mpeg" });
      url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;

      await new Promise<void>((resolve, reject) => {
        audio.onended = () => resolve();
        audio.onerror = () => reject(new Error("Audio playback failed"));
        audio.play().catch(reject);
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not play audio");
    } finally {
      if (url) URL.revokeObjectURL(url);
      setBusy(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={play}
      disabled={busy}
      aria-label={label}
      title={label}
    >
      {busy ? <Volume2 className="h-4 w-4 animate-pulse" /> : <Headphones className="h-4 w-4" />}
    </Button>
  );
}
