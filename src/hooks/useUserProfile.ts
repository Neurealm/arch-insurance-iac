import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// Simple in-memory cache + pub/sub so avatar updates propagate instantly
// across the top bar, sidebar, and any other consumer without an extra fetch.
const avatarCache = new Map<string, string | null>();
const listeners = new Set<() => void>();
export function setCachedAvatar(userId: string, url: string | null) {
  avatarCache.set(userId, url);
  listeners.forEach((l) => l());
}

export function useUserProfile() {
  const { user, signOut, loading } = useAuth();
  const meta = (user?.user_metadata ?? {}) as Record<string, any>;
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    user ? avatarCache.get(user.id) ?? null : null
  );

  useEffect(() => {
    if (!user) return;
    const uid = user.id;

    const sync = () => setAvatarUrl(avatarCache.get(uid) ?? null);
    listeners.add(sync);

    if (!avatarCache.has(uid)) {
      supabase
        .from("profiles")
        .select("avatar_url")
        .eq("user_id", uid)
        .maybeSingle()
        .then(({ data }) => setCachedAvatar(uid, data?.avatar_url ?? null));
    } else {
      sync();
    }

    return () => {
      listeners.delete(sync);
    };
  }, [user?.id]);

  const displayName: string =
    meta.full_name ||
    meta.name ||
    [meta.first_name, meta.last_name].filter(Boolean).join(" ").trim() ||
    (user?.email ? user.email.split("@")[0] : "Guest");

  const initials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "U";

  const role: string = meta.role || meta.title || "";
  const email: string = user?.email ?? "";

  return { user, loading, displayName, initials, role, email, avatarUrl, signOut };
}
