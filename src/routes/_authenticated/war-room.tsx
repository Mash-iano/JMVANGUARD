import { createFileRoute } from "@tanstack/react-router";
import { Radar, LogOut, ShieldAlert, Users, UserCog } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/war-room")({
  head: () => ({
    meta: [
      { title: "War Room — Mwaura 2027" },
      { name: "description", content: "Campaign command dashboard." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: WarRoomPage,
});

function WarRoomPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="rounded-md border border-border bg-card p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-sm amber-bar">
              <Radar className="h-5 w-5 text-navy" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-amber">Command</p>
              <h1 className="font-display text-2xl font-semibold">War Room Dashboard</h1>
            </div>
          </div>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-sm hover:bg-muted"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            to="/admin/youth-registrations"
            className="group rounded-md border border-border bg-background p-5 hover:border-amber transition"
          >
            <Users className="h-6 w-6 text-amber" />
            <div className="mt-3 font-semibold">Youth Registrations</div>
            <p className="mt-1 text-sm text-muted-foreground">
              Search, filter, and export volunteer sign-ups.
            </p>
          </Link>
          <Link
            to="/admin/users"
            className="group rounded-md border border-border bg-background p-5 hover:border-amber transition"
          >
            <UserCog className="h-6 w-6 text-amber" />
            <div className="mt-3 font-semibold">Users & Roles</div>
            <p className="mt-1 text-sm text-muted-foreground">
              Grant or revoke roles for signed-up users.
            </p>
          </Link>
          <Link
            to="/auth/mfa-setup"
            className="group rounded-md border border-border bg-background p-5 hover:border-amber transition"
          >
            <ShieldAlert className="h-6 w-6 text-amber" />
            <div className="mt-3 font-semibold">Security & MFA</div>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your two-factor authentication.
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}
