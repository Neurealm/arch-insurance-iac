import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AuthLayout } from "./AuthLayout";
import { friendlyAuthError } from "@/lib/authErrors";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.functions.invoke("forgot-password", {
      body: { email: email.trim() },
    });
    setLoading(false);
    if (error) return toast.error(friendlyAuthError(error.message));
    toast.success("If an account exists for that email, we've sent a reset link and code.");
  };

  return (
    <AuthLayout
      title="Reset password"
      subtitle="We'll email you a reset link and a code"
      footer={<Link to="/login" className="text-indigo font-semibold hover:underline">Back to sign in</Link>}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-11" />
        </div>
        <Button type="submit" disabled={loading} className="w-full h-11 bg-primary hover:bg-primary/90">
          {loading ? "Sending…" : "Send reset link"}
        </Button>
      </form>
    </AuthLayout>
  );
}