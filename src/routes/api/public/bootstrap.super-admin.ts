import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/bootstrap/super-admin")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const [{ handleBootstrapSuperAdmin }, { supabaseAdmin }] = await Promise.all([
          import("@/lib/bootstrap-super-admin.server"),
          import("@/integrations/supabase/client.server"),
        ]);
        return handleBootstrapSuperAdmin(request, {
          admin: supabaseAdmin,
          expectedToken: process.env.BOOTSTRAP_SUPER_ADMIN_TOKEN,
        });
      },
    },
  },
});
