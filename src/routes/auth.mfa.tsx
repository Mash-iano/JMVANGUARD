import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const search = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/auth/mfa")({
  ssr: false,
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Two-Factor Challenge — Mwaura 2027" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: MfaChallenge,
});

function MfaChallenge() {
  const nav = useNavigate();
  const { redirect } = useSearch({ from: "/auth/mfa" });
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) return toast.error(error.message);
      const totp = data.totp.find((f) => f.status === "verified");
      if (!totp) {
        nav({ to: "/auth/mfa-setup", search: { redirect } });
        return;
      }
      setFactorId(totp.id);
    })();
  }, [nav, redirect]);

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId) return;
    setBusy(true);
    try {
      const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId });
      if (chErr) throw chErr;
      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: ch.id,
        code,
      });
      if (error) throw error;
      toast.success("Two-factor verified.");
      nav({ to: (redirect as "/war-room") ?? "/war-room", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-md border border-border bg-card p-8">
        <div className="flex items-center gap-3 border-b border-border pb-5">
          <div className="grid h-11 w-11 place-items-center rounded-sm amber-bar">
            <ShieldCheck className="h-5 w-5 text-navy" />
          </div>
          <h1 className="font-display text-xl font-semibold">Two-Factor Challenge</h1>
        </div>
        <p className="mt-5 text-sm text-muted-foreground">
          Enter the 6-digit code from your authenticator app.
        </p>
        <form onSubmit={verify} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="code">Authentication code</Label>
            <Input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            />
          </div>
          <Button
            type="submit"
            disabled={busy || !factorId}
            className="w-full amber-bar text-navy font-semibold hover:opacity-90"
          >
            {busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying…</> : "Verify"}
          </Button>
        </form>
      </div>
    </section>
  );
}
