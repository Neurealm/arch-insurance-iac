import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthCtx = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
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
  approvalStatus: null,
  roleLoading: true,
  refreshRole: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<"pending" | "approved" | "rejected" | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  const loadRole = async (userId: string | undefined) => {
    if (!userId) {
      setIsAdmin(false);
      setApprovalStatus(null);
      setRoleLoading(false);
      return;
    }
    setRoleLoading(true);
    const [{ data: roles }, { data: profile }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("profiles").select("approval_status").eq("user_id", userId).maybeSingle(),
    ]);
    setIsAdmin(!!roles?.some((r: any) => r.role === "platform_admin"));
    setApprovalStatus(((profile as any)?.approval_status as any) ?? "pending");
    setRoleLoading(false);
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setLoading(false);
      // Defer role lookups to avoid deadlocks in the auth callback
      setTimeout(() => loadRole(s?.user?.id), 0);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
      loadRole(data.session?.user?.id);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <Ctx.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        isAdmin,
        approvalStatus,
        roleLoading,
        refreshRole: () => loadRole(session?.user?.id),
        signOut: async () => {
          await supabase.auth.signOut();
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);