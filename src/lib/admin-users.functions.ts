import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

const APP_ROLES = [
  "super_admin", "admin", "campaign_manager", "strategy_lead",
  "field_coordinator", "volunteer_lead", "media_lead", "finance_lead",
  "analyst", "volunteer", "viewer",
] as const;
type AppRole = (typeof APP_ROLES)[number];

async function assertSuperAdmin(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase.rpc("is_super_admin", { _user_id: userId });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden");
}

export const listUsersWithRoles = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      search: z.string().trim().max(120).optional().default(""),
      page: z.number().int().min(1).max(500).optional().default(1),
      perPage: z.number().int().min(1).max(200).optional().default(100),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({
      page: data.page,
      perPage: data.perPage,
    });
    if (error) throw new Error(error.message);

    const q = data.search.toLowerCase();
    const users = (q
      ? list.users.filter((u) =>
          (u.email ?? "").toLowerCase().includes(q) ||
          (u.phone ?? "").toLowerCase().includes(q) ||
          u.id.toLowerCase().includes(q),
        )
      : list.users
    ).map((u) => ({
      id: u.id,
      email: u.email ?? null,
      phone: u.phone ?? null,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at ?? null,
    }));

    const ids = users.map((u) => u.id);
    let rolesByUser: Record<string, AppRole[]> = {};
    if (ids.length) {
      const { data: rows, error: rErr } = await context.supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", ids);
      if (rErr) throw new Error(rErr.message);
      rolesByUser = (rows ?? []).reduce<Record<string, AppRole[]>>((acc, r) => {
        (acc[r.user_id] ||= []).push(r.role as AppRole);
        return acc;
      }, {});
    }

    return {
      users: users.map((u) => ({ ...u, roles: rolesByUser[u.id] ?? [] })),
      total: list.total ?? users.length,
    };
  });

export const assignRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      userId: z.string().uuid(),
      role: z.enum(APP_ROLES),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("user_roles")
      .insert({ user_id: data.userId, role: data.role, granted_by: context.userId });
    if (error && !/duplicate key/i.test(error.message)) throw new Error(error.message);
    return { ok: true };
  });

export const revokeRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      userId: z.string().uuid(),
      role: z.enum(APP_ROLES),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase, context.userId);

    // Guard: never let the last super_admin revoke their own super_admin role.
    if (data.role === "super_admin") {
      const { count, error: cErr } = await context.supabase
        .from("user_roles")
        .select("user_id", { count: "exact", head: true })
        .eq("role", "super_admin");
      if (cErr) throw new Error(cErr.message);
      if ((count ?? 0) <= 1) {
        throw new Error("Cannot revoke the last remaining super_admin.");
      }
    }

    const { error } = await context.supabase
      .from("user_roles")
      .delete()
      .eq("user_id", data.userId)
      .eq("role", data.role);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
