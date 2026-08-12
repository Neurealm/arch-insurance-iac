import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Headphones, Volume2 } from "lucide-react";
import { useNarration } from "@/commercial/hooks/useNarration";
import { useCommercialAccess } from "@/commercial/hooks/useCommercialAccess";

const FUNCTIONS_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/tts-speak`;

export function PlayIntroductionButton({
  narrationKey = "commercial.overview.introduction",
  label = "Play Introduction",
}: {
  narrationKey?: string;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { data: narration, isLoading } = useNarration(narrationKey);
  const { canManageProgram, canAdmin, isPlatformAdmin } = useCommercialAccess();
  const showRecordId = Boolean(canManageProgram || canAdmin || isPlatformAdmin);

  const play = async () => {
    if (busy || !narration) return;
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
        body: JSON.stringify({ narration_id: narration.id }),
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

  const copyRecordId = async () => {
    if (!narration) return;
    try {
      await navigator.clipboard.writeText(narration.id);
      toast.success("Record ID copied");
    } catch {
      toast.error("Could not copy record ID");
    }
  };

  const disabled = busy || isLoading || !narration;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">
            <Button
              variant="outline"
              size="icon"
              onClick={play}
              disabled={disabled}
              aria-label={narration?.title ?? label}
            >
              {busy ? <Volume2 className="h-4 w-4 animate-pulse" /> : <Headphones className="h-4 w-4" />}
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end" className="max-w-xs">
          {!narration ? (
            <div className="text-xs">
              {isLoading ? "Loading narration…" : "No narration configured for this button."}
            </div>
          ) : (
            <div className="space-y-1 text-xs">
              <div className="font-medium">{narration.title}</div>
              {showRecordId && (
                <dl className="grid grid-cols-[auto_1fr] gap-x-2 font-mono text-[11px] text-muted-foreground">
                  <dt>Key</dt>
                  <dd className="truncate">{narration.narration_key}</dd>
                  <dt>Table</dt>
                  <dd>commercial_narrations</dd>
                  <dt>Record</dt>
                  <dd>
                    <button
                      type="button"
                      onClick={copyRecordId}
                      className="underline underline-offset-2 hover:text-foreground"
                    >
                      {narration.id}
                    </button>
                  </dd>
                  <dt>Voice</dt>
                  <dd>
                    {narration.voice} · v{narration.version}
                  </dd>
                </dl>
              )}
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
