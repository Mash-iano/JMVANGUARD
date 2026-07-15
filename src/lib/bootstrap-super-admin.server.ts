// Shared bootstrap handler — imported by the route and by tests.
// Keeps HTTP concerns in one place so tests can invoke it with a mocked
// supabaseAdmin without spinning up the router.
import { z } from "zod";
import { timingSafeEqual } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

const bodySchema = z.object({
  token: z.string().min(8).max(512),
  email: z.string().trim().toLowerCase().email().max(255),
});

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

export interface BootstrapDeps {
  admin: SupabaseClient<any, any, any>;
  expectedToken: string | undefined;
}

export async function handleBootstrapSuperAdmin(
  request: Request,
  { admin, expectedToken }: BootstrapDeps,
): Promise<Response> {
  if (!expectedToken) return json(503, { error: "Bootstrap not configured" });

  let payload: z.infer<typeof bodySchema>;
  try {
    payload = bodySchema.parse(await request.json());
  } catch {
    return json(400, { error: "Invalid request body" });
  }

  if (!safeEqual(payload.token, expectedToken)) {
    return json(401, { error: "Invalid bootstrap token" });
  }

  const { count, error: countErr } = await admin
    .from("user_roles")
    .select("id", { count: "exact", head: true })
    .eq("role", "super_admin");

  if (countErr) {
    console.error("[bootstrap] count error", countErr);
    return json(500, { error: "Bootstrap check failed" });
  }
  if ((count ?? 0) > 0) {
    return json(410, {
      error: "Bootstrap already completed. This endpoint is permanently disabled.",
    });
  }

  let targetUserId: string | null = null;
  let page = 1;
  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) {
      console.error("[bootstrap] listUsers error", error);
      return json(500, { error: "Failed to look up user" });
    }
    const match = data.users.find(
      (u: { email?: string | null }) => (u.email ?? "").toLowerCase() === payload.email,
    );
    if (match) {
      targetUserId = match.id;
      break;
    }
    if (data.users.length < 1000) break;
    page += 1;
  }

  if (!targetUserId) {
    return json(404, {
      error: "No account found for that email. Sign up first, then re-run bootstrap.",
    });
  }

  const { error: insertErr } = await admin
    .from("user_roles")
    .insert({ user_id: targetUserId, role: "super_admin" });

  if (insertErr) {
    console.error("[bootstrap] insert role error", insertErr);
    return json(500, { error: "Failed to grant SUPER_ADMIN role" });
  }

  const ip =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for") ??
    null;
  const ua = request.headers.get("user-agent") ?? null;

  await admin.from("bootstrap_audit").insert({
    event: "super_admin_bootstrapped",
    actor_email: payload.email,
    actor_user_id: targetUserId,
    ip,
    user_agent: ua,
    metadata: {},
  });

  return json(200, {
    ok: true,
    message: "SUPER_ADMIN granted. This endpoint is now permanently disabled.",
    user_id: targetUserId,
  });
}
