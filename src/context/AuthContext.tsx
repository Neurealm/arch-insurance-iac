import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthCtx = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  hasPlatformAdminRole: boolean;
  activeWorkspace: string | null;
  setActiveWorkspace: (slug: string | null) => void;
  approvalStatus: "pending" | "approved" | "rejected" | null;
  roleLoading: boolean;
  refreshRole: () => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
  hasPlatformAdminRole: false,
  activeWorkspace: null,
  setActiveWorkspace: () => {},
  approvalStatus: null,
  roleLoading: true,
  refreshRole: async () => {},
  signOut: async () => {},
});

const readWorkspace = () =>
  typeof window !== "undefined" ? sessionStorage.getItem("active_workspace") : null;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasPlatformAdminRole, setHasPlatformAdminRole] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<"pending" | "approved" | "rejected" | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [activeWorkspace, setActiveWorkspaceState] = useState<string | null>(readWorkspace());

  const setActiveWorkspace = (slug: string | null) => {
    if (typeof window !== "undefined") {
      if (slug) sessionStorage.setItem("active_workspace", slug);
      else sessionStorage.removeItem("active_workspace");
      window.dispatchEvent(new Event("workspace-change"));
    }
    setActiveWorkspaceState(slug);
  };

  useEffect(() => {
    const sync = () => setActiveWorkspaceState(readWorkspace());
    window.addEventListener("storage", sync);
    window.addEventListener("workspace-change", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("workspace-change", sync);
    };
  }, []);

  const loadRole = async (userId: string | undefined) => {
    if (!userId) {
      setHasPlatformAdminRole(false);
      setApprovalStatus(null);
      setRoleLoading(false);
      return;
    }
    setRoleLoading(true);
    const [{ data: roles }, { data: profile }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("profiles").select("approval_status").eq("user_id", userId).maybeSingle(),
    ]);
    setHasPlatformAdminRole(!!roles?.some((r: any) => r.role === "platform_admin"));
    setApprovalStatus(((profile as any)?.approval_status as any) ?? "pending");
    setRoleLoading(false);
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      setLoading(false);
      setTimeout(() => loadRole(s?.user?.id), 0);

      // Record a durable login event for any first-time session establishment
      // in this tab — covers password sign-in (SIGNED_IN), invite/recovery
      // link completion (PASSWORD_RECOVERY, USER_UPDATED, TOKEN_REFRESHED
      // following a recovery), and magic-link callbacks.
      const LOGIN_EVENTS = new Set([
        "SIGNED_IN",
        "PASSWORD_RECOVERY",
        "USER_UPDATED",
      ]);
      if (LOGIN_EVENTS.has(event) && s?.user) {
        const dedupeKey = `login-recorded:${s.user.id}:${s.access_token?.slice(-16) ?? ""}`;
        const already =
          typeof sessionStorage !== "undefined" && sessionStorage.getItem(dedupeKey);
        if (!already) {
          try { sessionStorage?.setItem(dedupeKey, "1"); } catch {}
          setTimeout(() => {
            supabase.functions
              .invoke("record-login", {
                body: {
                  action: "login",
                  login_method:
                    event === "PASSWORD_RECOVERY" || event === "USER_UPDATED"
                      ? "recovery"
                      : ((s.user.app_metadata as any)?.provider as string) ?? null,
                  user_agent:
                    typeof navigator !== "undefined" ? navigator.userAgent : null,
                  source: "portal",
                  traits: { auth_event: event },
                },
              })
              .then(({ error }) => {
                if (error) console.warn("login event not recorded", error.message);
              });
          }, 0);
        }
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
      loadRole(data.session?.user?.id);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const isAdmin = hasPlatformAdminRole;

  return (
    <Ctx.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        isAdmin,
        hasPlatformAdminRole,
        activeWorkspace,
        setActiveWorkspace,
        approvalStatus,
        roleLoading,
        refreshRole: () => loadRole(session?.user?.id),
        signOut: async () => {
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("active_workspace");
            window.dispatchEvent(new Event("workspace-change"));
          }
          setActiveWorkspaceState(null);
          await supabase.auth.signOut();
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
