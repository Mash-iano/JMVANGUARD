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

export const Route = createFileRoute("/auth/mfa-setup")({
  ssr: false,
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Enroll Two-Factor — Mwaura 2027" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: MfaEnroll,
});

function MfaEnroll() {
  const nav = useNavigate();
  const { redirect } = useSearch({ from: "/auth/mfa-setup" });
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [enrolling, setEnrolling] = useState(true);

  useEffect(() => {
    (async () => {
      // Clean stale unverified factors, then enroll a fresh TOTP.
      const { data: list } = await supabase.auth.mfa.listFactors();
      for (const f of list?.totp ?? []) {
        if (f.status !== "verified") {
          await supabase.auth.mfa.unenroll({ factorId: f.id });
        }
      }
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: `Mwaura 2027 (${new Date().toISOString().slice(0, 10)})`,
      });
      if (error) {
        toast.error(error.message);
        setEnrolling(false);
        return;
      }
      setFactorId(data.id);
      setQr(data.totp.qr_code);
      setSecret(data.totp.secret);
      setEnrolling(false);
    })();
  }, []);

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
      toast.success("Two-factor enabled.");
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
          <h1 className="font-display text-xl font-semibold">Enable Two-Factor Auth</h1>
        </div>
        <p className="mt-5 text-sm text-muted-foreground">
          Privileged roles must use an authenticator app (Google Authenticator, 1Password, Authy).
        </p>

        {enrolling ? (
          <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Preparing your enrollment…
          </div>
        ) : qr ? (
          <>
            <div className="mt-6 flex justify-center rounded-md border border-border bg-white p-4">
              <img src={qr} alt="TOTP QR code" width={192} height={192} />
            </div>
            {secret && (
              <p className="mt-3 break-all text-center text-xs text-muted-foreground">
                Or enter code manually: <span className="font-mono">{secret}</span>
              </p>
            )}
            <form onSubmit={verify} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="code">6-digit code</Label>
                <Input
                  id="code"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                />
              </div>
              <Button
                type="submit"
                disabled={busy}
                className="w-full amber-bar text-navy font-semibold hover:opacity-90"
              >
                {busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying…</> : "Enable 2FA"}
              </Button>
            </form>
          </>
        ) : null}
      </div>
    </section>
  );
}
