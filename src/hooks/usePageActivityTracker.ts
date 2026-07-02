import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

/**
 * Lightweight route-change tracker. Writes one row per SPA navigation to
 * `public.user_page_activity` (path + page_title + timestamp).
 * Silent on failure — analytics must never block navigation.
 */
export function usePageActivityTracker() {
  const { user } = useAuth();
  const location = useLocation();
  const lastLogged = useRef<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const path = location.pathname + (location.search || "");
    if (lastLogged.current === path) return;
    lastLogged.current = path;

    const title = typeof document !== "undefined" ? document.title : null;
    supabase
      .from("user_page_activity")
      .insert({ user_id: user.id, path, page_title: title })
      .then(({ error }) => {
        if (error) {
          // Fail quiet — analytics should never break the app
          // eslint-disable-next-line no-console
          console.debug("page activity insert failed", error.message);
        }
      });
  }, [user, location.pathname, location.search]);
}
