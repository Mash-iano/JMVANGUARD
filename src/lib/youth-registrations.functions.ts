import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const listInput = z.object({
  search: z.string().trim().max(120).optional().default(""),
  constituency: z.string().trim().max(80).optional().default(""),
  ward: z.string().trim().max(80).optional().default(""),
  limit: z.number().int().min(1).max(2000).optional().default(500),
});

export const listYouthRegistrations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => listInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Defense-in-depth: verify role server-side even though RLS blocks unprivileged reads.
    const { data: allowed, error: roleErr } = await supabase.rpc(
      "can_read_youth_registrations",
      { _user_id: userId },
    );
    if (roleErr) throw new Error(roleErr.message);
    if (!allowed) throw new Error("Forbidden");

    let q = supabase
      .from("youth_registrations")
      .select(
        "id,created_at,full_name,phone,id_number,gender,date_of_birth,constituency,ward,village,occupation,interests,source",
      )
      .order("created_at", { ascending: false })
      .limit(data.limit);

    if (data.constituency) q = q.eq("constituency", data.constituency);
    if (data.ward) q = q.eq("ward", data.ward);
    if (data.search) {
      const like = `%${data.search.replace(/[%_]/g, "")}%`;
      q = q.or(
        `full_name.ilike.${like},phone.ilike.${like},id_number.ilike.${like},village.ilike.${like}`,
      );
    }

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });
