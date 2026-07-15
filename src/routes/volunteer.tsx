import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, MapPin, Megaphone, Heart } from "lucide-react";

export const Route = createFileRoute("/volunteer")({
  head: () => ({
    meta: [
      { title: "Volunteer — Mwaura 2027" },
      { name: "description", content: "Join the Mwaura 2027 volunteer network — coordinators, door-to-door, digital, and polling agents." },
      { property: "og:title", content: "Volunteer — Mwaura 2027" },
      { property: "og:description", content: "Help us reach every ward and every village in Kiambu." },
    ],
  }),
  component: VolunteerPage,
});

function VolunteerPage() {
  return (
    <div className="container-page py-16 max-w-4xl">
      <div className="text-xs font-semibold uppercase tracking-widest text-amber">Volunteer</div>
      <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">
        Be the reason a neighbour votes.
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
        We need coordinators in every one of the 60 wards, door-to-door
        canvassers, polling agents, and digital storytellers.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {[
          { icon: MapPin, t: "Ward Coordinator", d: "Lead a ward-level volunteer team." },
          { icon: Users, t: "Door-to-Door", d: "Weekend canvassing in your village." },
          { icon: Megaphone, t: "Digital Team", d: "Content, translation, and rapid response." },
          { icon: Heart, t: "Polling Agent", d: "Trained observers for August 10, 2027." },
        ].map((r) => (
          <div key={r.t} className="solid-card p-6">
            <div className="inline-flex h-10 w-10 items-center justify-center amber-bar"><r.icon size={18} /></div>
            <h3 className="mt-4 font-display text-lg font-semibold">{r.t}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{r.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 solid-card border-2 p-8 text-center">
        <h2 className="font-display text-2xl font-bold">Ready to help?</h2>
        <p className="mt-2 text-muted-foreground">
          Start by registering — we'll route you to the ward team lead nearest you.
        </p>
        <Link to="/register" className="mt-5 inline-flex rounded-sm amber-bar px-6 py-3 text-sm font-semibold">
          Register to Volunteer
        </Link>
      </div>
    </div>
  );
}
