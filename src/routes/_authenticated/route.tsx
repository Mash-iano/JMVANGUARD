import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/auth", search: { redirect: location.href } });
    }
    // MFA enforcement temporarily disabled to prevent redirect loops.
    // TODO: re-enable AAL2 challenge + enrollment gate once MFA setup is fully verified.
    // const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    // if (aal?.currentLevel === "aal1" && aal.nextLevel === "aal2") {
    //   throw redirect({ to: "/auth/mfa", search: { redirect: location.href } });
    // }
    return { user: data.user };
  },
  component: () => <Outlet />,
});
