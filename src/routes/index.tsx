import { createFileRoute, Link } from "@tanstack/react-router";
import { Countdown } from "../components/Countdown";
import heroImg from "../assets/candidate.png";
import { ArrowRight, ShieldCheck, Users, Target, MapPin } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border bg-navy-deep">
        <div className="container-page grid gap-10 py-14 lg:grid-cols-2 lg:py-20">
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-sm border border-amber/40 bg-navy px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amber">
              <MapPin size={12} /> Kiambu County · Governor 2027
            </div>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              A disciplined future for <span className="text-amber">Kiambu</span>.
              Built with the youth. Delivered on time.
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              Mwaura 2027 is a service-first, evidence-driven bid for the
              Kiambu County Governor's office — anchored on jobs, healthcare,
              infrastructure and honest leadership.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-sm amber-bar px-5 py-3 text-sm font-semibold hover:brightness-95"
              >
                Register to Join <ArrowRight size={16} />
              </Link>
              <Link
                to="/manifesto"
                className="inline-flex items-center gap-2 rounded-sm border-2 border-border px-5 py-3 text-sm font-semibold hover:border-amber"
              >
                Read the Manifesto
              </Link>
            </div>

            <div className="mt-10">
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Countdown to General Election · 10 August 2027
              </div>
              <div className="mt-3 max-w-lg">
                <Countdown />
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="solid-card overflow-hidden border-2">
              <img
                src={heroImg}
                alt="Candidate portrait"
                width={1280}
                height={1600}
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 amber-bar px-4 py-2 text-xs font-bold uppercase tracking-widest">
              For Every Ward · For Every Village
            </div>
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <section className="container-page py-16">
        <div className="mb-10">
          <div className="text-xs font-semibold uppercase tracking-widest text-amber">
            Our Priorities
          </div>
          <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
            Five pillars. One promise.
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Users, title: "Youth Agenda", body: "20,000 jobs, digital hubs in every constituency, TVET scholarships." },
            { icon: ShieldCheck, title: "Healthcare", body: "Level-4 upgrades, universal maternal care, drug stock guarantees." },
            { icon: Target, title: "Infrastructure", body: "500 km tarmac, market sheds, streetlights and clean water lines." },
            { icon: Users, title: "Education", body: "Feeding programs, ECDE teachers, bursaries with clear criteria." },
            { icon: Target, title: "Economy", body: "SME loans, coffee & dairy value chains, county industrial parks." },
            { icon: ShieldCheck, title: "Governance", body: "Open budgets, live procurement dashboards, zero-tolerance graft." },
          ].map((p) => (
            <div key={p.title} className="solid-card p-6">
              <div className="inline-flex h-10 w-10 items-center justify-center amber-bar">
                <p.icon size={18} />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STATS BAND */}
      <section className="border-y-2 border-border bg-navy">
        <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["12", "Constituencies"],
            ["60", "Wards on the map"],
            ["2.4M", "Kiambu residents"],
            ["1", "Shared future"],
          ].map(([n, l]) => (
            <div key={l} className="text-center">
              <div className="font-display text-4xl font-bold text-amber">{n}</div>
              <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                {l}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-20">
        <div className="solid-card border-2 p-8 sm:p-12 text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Your ward. Your voice. Your county.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Join thousands of young Kiambu residents already registered on the
            Mwaura 2027 movement. It takes less than two minutes.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/register" className="rounded-sm amber-bar px-6 py-3 text-sm font-semibold">
              Register Now
            </Link>
            <Link to="/volunteer" className="rounded-sm border-2 border-border px-6 py-3 text-sm font-semibold hover:border-amber">
              Volunteer
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
