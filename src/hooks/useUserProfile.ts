import { useAuth } from "@/context/AuthContext";

export function useUserProfile() {
  const { user, signOut, loading } = useAuth();
  const meta = (user?.user_metadata ?? {}) as Record<string, any>;

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

  return { user, loading, displayName, initials, role, email, signOut };
}