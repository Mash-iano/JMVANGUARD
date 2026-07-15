import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, LogIn, LayoutDashboard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/manifesto", label: "Manifesto" },
  { to: "/media", label: "Media" },
  { to: "/donate", label: "Donate" },
  { to: "/volunteer", label: "Volunteer" },
] as const;

const ADMIN_ROLES = new Set([
  "super_admin",
  "campaign_manager",
  "coordinator",
  "county_director",
  "constituency_director",
  "ward_coordinator",
]);

export function Header() {
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function refresh(userId: string | undefined) {
      if (!userId) {
        if (!cancelled) {
          setSignedIn(false);
          setIsAdmin(false);
        }
        return;
      }
      if (!cancelled) setSignedIn(true);
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      if (cancelled) return;
      const admin = (data ?? []).some((r) => ADMIN_ROLES.has(r.role as string));
      setIsAdmin(admin);
    }

    supabase.auth.getUser().then(({ data }) => refresh(data.user?.id));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        refresh(session?.user?.id);
      }
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const showDashboard = signedIn && isAdmin;

  const AuthCta = ({ mobile = false, onClick }: { mobile?: boolean; onClick?: () => void }) =>
    showDashboard ? (
      <Link
        to="/war-room"
        onClick={onClick}
        className={
          mobile
            ? "mt-2 inline-flex items-center justify-center gap-2 rounded-sm border border-amber/60 bg-amber/10 px-4 py-3 text-sm font-semibold text-amber"
            : "ml-1 inline-flex items-center gap-2 rounded-sm border border-amber/60 bg-amber/10 px-4 py-2 text-sm font-semibold text-amber hover:bg-amber/20 transition-colors"
        }
      >
        <LayoutDashboard size={16} /> Dashboard
      </Link>
    ) : (
      <Link
        to="/auth"
        onClick={onClick}
        className={
          mobile
            ? "mt-2 inline-flex items-center justify-center gap-2 rounded-sm border border-border bg-transparent px-4 py-3 text-sm font-semibold text-foreground"
            : "ml-1 inline-flex items-center gap-2 rounded-sm border border-border bg-transparent px-4 py-2 text-sm font-semibold text-foreground hover:border-amber hover:text-amber transition-colors"
        }
      >
        <LogIn size={16} /> Sign In
      </Link>
    );

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-navy-deep/95 backdrop-blur-none">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-bold">
  <img 
    src="/logo.png" 
    alt="Mwaura 2027 Logo" 
    className="h-8 w-8 object-contain"
    onError={(e) => {
      // Fallback: If logo.png is missing, it falls back to a clean text-only layout
      e.currentTarget.style.display = 'none';
    }}
  />
  <span className="text-sm sm:text-base tracking-wide">
    JM YOUTH <span className="text-amber">VANGUARD 2027</span>
  </span>
</Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              activeProps={{ className: "text-amber" }}
              className="px-3 py-2 text-sm font-medium text-foreground/90 hover:text-amber transition-colors"
            >
              {n.label}
            </Link>
          ))}
          <Link
            to="/register"
            className="ml-3 inline-flex items-center rounded-sm amber-bar px-4 py-2 text-sm font-semibold hover:brightness-95"
          >
            Register as Youth
          </Link>
          <AuthCta />
        </nav>

        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-navy">
          <nav className="container-page flex flex-col py-3">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: n.to === "/" }}
                activeProps={{ className: "text-amber" }}
                className="py-2 text-base font-medium"
              >
                {n.label}
              </Link>
            ))}
            <Link
              to="/register"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex justify-center rounded-sm amber-bar px-4 py-3 text-sm font-semibold"
            >
              Register as Youth
            </Link>
            <AuthCta mobile onClick={() => setOpen(false)} />
          </nav>
        </div>
      )}
    </header>
  );
}
