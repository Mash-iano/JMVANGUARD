import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const search = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Sign in — Mwaura 2027" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup";

function AuthPage() {
  const nav = useNavigate();
  const { redirect } = useSearch({ from: "/auth" });
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) nav({ to: (redirect as "/war-room") ?? "/war-room", replace: true });
    });
  }, [nav, redirect]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/auth" },
        });
        if (error) throw error;
        toast.success("Account created. Check your email if confirmation is required.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in.");
      }
      // Determine next step based on MFA state.
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal?.currentLevel === "aal1" && aal.nextLevel === "aal2") {
        nav({ to: "/auth/mfa", search: { redirect } });
      } else {
        nav({ to: (redirect as "/war-room") ?? "/war-room", replace: true });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-md border border-border bg-card p-8 shadow-2xl">
        <div className="flex items-center gap-3 border-b border-border pb-5">
          <div className="grid h-11 w-11 place-items-center rounded-sm amber-bar">
            <ShieldCheck className="h-5 w-5 text-navy" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-amber">Secure Access</p>
            <h1 className="font-display text-xl font-semibold">
              {mode === "signin" ? "Sign in to the War Room" : "Create War Room account"}
            </h1>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            disabled={busy}
            className="w-full amber-bar text-navy font-semibold hover:opacity-90"
          >
            {busy ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Working…</>
            ) : mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <div className="mt-5 flex items-center justify-between text-sm">
          <button
            type="button"
            className="text-amber underline underline-offset-4"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
          </button>
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            Back to site
          </Link>
        </div>
      </div>
    </section>
  );
}
