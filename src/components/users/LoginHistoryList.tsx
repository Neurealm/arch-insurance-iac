import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

type Event = {
  id: string;
  timestamp: string;
  ip: string | null;
  action: string;
  actor_email: string | null;
};

const ACTION_TONE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  login: "default",
  logout: "secondary",
  user_signedup: "outline",
  user_invited: "outline",
  user_recovery_requested: "outline",
  token_refreshed: "secondary",
  user_modified: "outline",
};

export function LoginHistoryList({ userId, email }: { userId: string; email: string | null }) {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.functions.invoke("user-login-history", {
        body: { userId, email },
      });
      if (cancelled) return;
      if (error) {
        setError(error.message);
      } else if ((data as any)?.error) {
        setError((data as any).error);
      } else {
        setEvents(((data as any)?.events ?? []) as Event[]);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, email]);

  if (loading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
        <AlertCircle className="h-3.5 w-3.5" /> Could not load activity: {error}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-xs text-muted-foreground rounded-md border border-dashed px-3 py-4 text-center">
        No recent authentication activity for this user.
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {events.map((e) => (
        <div
          key={e.id}
          className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-xs"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Badge variant={ACTION_TONE[e.action] ?? "outline"} className="capitalize">
              {e.action.replace(/_/g, " ")}
            </Badge>
            <span className="text-muted-foreground truncate">
              {e.ip ?? "—"}
            </span>
          </div>
          <span className="text-muted-foreground shrink-0">
            {new Date(e.timestamp).toLocaleString()}
          </span>
        </div>
      ))}
      <p className="text-[10px] text-muted-foreground pt-1">
        Showing the most recent 20 events from Supabase auth audit log (~7 day retention).
      </p>
    </div>
  );
}
