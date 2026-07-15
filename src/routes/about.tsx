import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About the Candidate — Mwaura 2027" },
      { name: "description", content: "Biography, background and public-service journey of the Mwaura 2027 gubernatorial candidate for Kiambu County." },
      { property: "og:title", content: "About the Candidate — Mwaura 2027" },
      { property: "og:description", content: "Biography of the Mwaura 2027 candidate for Kiambu Governor." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="container-page py-16 max-w-4xl">
      <div className="text-xs font-semibold uppercase tracking-widest text-amber">About</div>
      
      {/* Introduction Grid: Text on the left, your new PNG image on the right */}
      <div className="mt-2 grid gap-8 md:grid-cols-3 items-center">
        <div className="md:col-span-2">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">
            A life of service to Kiambu.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Born and raised in Kiambu County, the candidate has spent two decades at the
            intersection of public service, small business, and community organising —
            building a record of listening first and delivering second.
          </p>
        </div>
        
        {/* The Candidate PNG Image container */}
        <div className="flex justify-center md:col-span-1">
          <div className="relative aspect-square w-full max-w-[280px] overflow-hidden rounded-md border border-border bg-muted">
            <img 
              src="/candidate.png" 
              alt="Mwaura 2027 Candidate" 
              className="h-full w-full object-cover"
              onError={(e) => {
                // If candidate.png isn't found, hide the broken image container gracefully
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {[
          { h: "Early Years", p: "Raised in a smallholder farming family, attended local public schools and community youth programs." },
          { h: "Education", p: "Bachelor of Commerce, University of Nairobi. Executive certifications in Public Policy and Devolution." },
          { h: "Public Service", p: "Served on multiple county advisory boards on youth affairs, health, and SME development." },
          { h: "Community", p: "Founded a bursary fund supporting over 500 Kiambu students to date, spanning all 12 constituencies." },
        ].map((s) => (
          <div key={s.h} className="solid-card p-6">
            <h3 className="font-display text-lg font-semibold">{s.h}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.p}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 solid-card border-2 p-8">
        <h2 className="font-display text-2xl font-bold">Why 2027?</h2>
        <p className="mt-3 text-muted-foreground">
          Kiambu deserves a governor who treats the office as a service contract,
          not a title. This campaign is built on measurable pledges — every promise
          in our manifesto ships with a delivery timeline, a budget line, and a
          public dashboard the county can hold us to.
        </p>
      </div>
    </div>
  );
}