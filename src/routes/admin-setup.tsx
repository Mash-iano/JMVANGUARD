import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(255),
  token: z.string().trim().min(8, "Token looks too short").max(512),
});
type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/admin-setup")({
  head: () => ({
    meta: [
      { title: "Super Admin Initialization — Mwaura 2027" },
      { name: "description", content: "One-time SUPER_ADMIN initialization gateway." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminSetupPage,
});

function AdminSetupPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", token: "" },
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/public/bootstrap/super-admin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        message?: string;
      };
      if (res.ok && body.ok) {
        toast.success("SUPER_ADMIN granted. Redirecting to War Room…");
        await navigate({ to: "/war-room" });
        return;
      }
      if (res.status === 410) {
        toast.error(body.error ?? "Bootstrap has already been completed.");
      } else if (res.status === 401) {
        toast.error("Invalid deployment token.");
      } else if (res.status === 404) {
        toast.error(body.error ?? "No account found for that email.");
      } else {
        toast.error(body.error ?? `Bootstrap failed (${res.status})`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg rounded-md border border-border bg-card p-8 shadow-2xl">
        <div className="flex items-center gap-3 border-b border-border pb-5">
          <div className="grid h-11 w-11 place-items-center rounded-sm amber-bar">
            <ShieldCheck className="h-5 w-5 text-navy" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-amber">Restricted</p>
            <h1 className="font-display text-xl font-semibold leading-tight">
              Super Admin System Initialization Gateway
            </h1>
          </div>
        </div>

        <p className="mt-5 text-sm text-muted-foreground">
          Grant the first SUPER_ADMIN role using the one-time deployment token.
          This endpoint is permanently disabled after a SUPER_ADMIN exists.
        </p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="email">Administrator email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="admin@example.com"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="token">Deployment token / bypass key</Label>
            <Input
              id="token"
              type="password"
              autoComplete="off"
              spellCheck={false}
              placeholder="••••••••••••••••••••••••"
              {...form.register("token")}
            />
            {form.formState.errors.token && (
              <p className="text-xs text-destructive">{form.formState.errors.token.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full amber-bar text-navy font-semibold hover:opacity-90"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Initializing…
              </>
            ) : (
              "Initialize SUPER_ADMIN"
            )}
          </Button>
        </form>
      </div>
    </section>
  );
}
