import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Loader2, Search, ShieldPlus, X } from "lucide-react";
import { toast } from "sonner";
import {
  assignRole,
  listUsersWithRoles,
  revokeRole,
} from "@/lib/admin-users.functions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({
    meta: [
      { title: "Users & Roles — Mwaura 2027" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: UsersAdminPage,
});

const APP_ROLES = [
  "super_admin", "admin", "campaign_manager", "strategy_lead",
  "field_coordinator", "volunteer_lead", "media_lead", "finance_lead",
  "analyst", "volunteer", "viewer",
] as const;
type AppRole = (typeof APP_ROLES)[number];

function UsersAdminPage() {
  const list = useServerFn(listUsersWithRoles);
  const assign = useServerFn(assignRole);
  const revoke = useServerFn(revokeRole);
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [applied, setApplied] = useState("");

  const query = useQuery({
    queryKey: ["admin-users", applied],
    queryFn: () => list({ data: { search: applied, page: 1, perPage: 200 } }),
  });

  const assignMut = useMutation({
    mutationFn: (v: { userId: string; role: AppRole }) => assign({ data: v }),
    onSuccess: () => {
      toast.success("Role granted.");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const revokeMut = useMutation({
    mutationFn: (v: { userId: string; role: AppRole }) => revoke({ data: v }),
    onSuccess: () => {
      toast.success("Role revoked.");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const users = query.data?.users ?? [];

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6">
        <Link
          to="/war-room"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> War Room
        </Link>
        <h1 className="mt-1 font-display text-2xl font-semibold">Users &amp; Roles</h1>
        <p className="text-sm text-muted-foreground">
          Super-admin only. Grant or revoke roles without touching the bootstrap flow.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setApplied(search.trim());
        }}
        className="grid gap-3 rounded-md border border-border bg-card p-4 sm:grid-cols-[1fr_auto]"
      >
        <div>
          <Label htmlFor="q">Search</Label>
          <Input
            id="q"
            placeholder="Email, phone, or user id"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <Button type="submit" variant="secondary" className="w-full sm:w-auto">
            <Search className="mr-2 h-4 w-4" /> Search
          </Button>
        </div>
      </form>

      <div className="mt-6 overflow-hidden rounded-md border border-border">
        {query.isLoading ? (
          <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading users…
          </div>
        ) : query.isError ? (
          <div className="p-6 text-sm text-destructive">
            {(query.error as Error).message === "Forbidden"
              ? "Only super_admin can manage users and roles."
              : `Failed: ${(query.error as Error).message}`}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">User</th>
                  <th className="px-3 py-2">Roles</th>
                  <th className="px-3 py-2 w-64">Grant role</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-6 text-center text-muted-foreground">
                      No users match.
                    </td>
                  </tr>
                ) : users.map((u) => (
                  <UserRow
                    key={u.id}
                    user={u}
                    onAssign={(role) => assignMut.mutate({ userId: u.id, role })}
                    onRevoke={(role) => revokeMut.mutate({ userId: u.id, role: role as AppRole })}
                    busy={assignMut.isPending || revokeMut.isPending}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function UserRow({
  user,
  onAssign,
  onRevoke,
  busy,
}: {
  user: {
    id: string;
    email: string | null;
    phone: string | null;
    created_at: string;
    last_sign_in_at: string | null;
    roles: string[];
  };
  onAssign: (role: AppRole) => void;
  onRevoke: (role: string) => void;
  busy: boolean;
}) {
  const [role, setRole] = useState<AppRole>("viewer");
  return (
    <tr className="border-t border-border align-top">
      <td className="px-3 py-3">
        <div className="font-medium">{user.email ?? user.phone ?? "—"}</div>
        <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">{user.id}</div>
        <div className="mt-1 text-[11px] text-muted-foreground">
          Joined {new Date(user.created_at).toLocaleDateString()} ·{" "}
          {user.last_sign_in_at
            ? `Last sign-in ${new Date(user.last_sign_in_at).toLocaleDateString()}`
            : "Never signed in"}
        </div>
      </td>
      <td className="px-3 py-3">
        {user.roles.length === 0 ? (
          <span className="text-xs text-muted-foreground">No roles</span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {user.roles.map((r) => (
              <button
                key={r}
                type="button"
                disabled={busy}
                onClick={() => onRevoke(r)}
                title="Click to revoke"
                className="inline-flex items-center gap-1 rounded-sm border border-amber/40 bg-amber/10 px-2 py-0.5 text-[11px] font-semibold text-amber hover:bg-destructive/20 hover:border-destructive hover:text-destructive transition-colors disabled:opacity-50"
              >
                {r} <X className="h-3 w-3" />
              </button>
            ))}
          </div>
        )}
      </td>
      <td className="px-3 py-3">
        <div className="flex gap-2">
          <select
            className="h-9 flex-1 rounded-md border border-input bg-background px-2 text-xs"
            value={role}
            onChange={(e) => setRole(e.target.value as AppRole)}
          >
            {APP_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <Button
            size="sm"
            type="button"
            disabled={busy || user.roles.includes(role)}
            onClick={() => onAssign(role)}
            className="amber-bar text-navy hover:opacity-90"
          >
            <ShieldPlus className="mr-1 h-3 w-3" /> Grant
          </Button>
        </div>
      </td>
    </tr>
  );
}
