import { createFileRoute } from "@tanstack/react-router";
import { Download, Newspaper, Image as ImageIcon } from "lucide-react";

export const Route = createFileRoute("/media")({
  head: () => ({
    meta: [
      { title: "Media & Press — Mwaura 2027" },
      { name: "description", content: "Manifesto downloads, press kits, and the latest campaign updates from Mwaura 2027." },
      { property: "og:title", content: "Media & Press — Mwaura 2027" },
      { property: "og:description", content: "Downloads, press releases, and campaign updates." },
    ],
  }),
  component: MediaPage,
});

function MediaPage() {
  return (
    <div className="container-page py-16 max-w-5xl">
      <div className="text-xs font-semibold uppercase tracking-widest text-amber">
        Media Center
      </div>
      <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">
        Press kit and campaign updates.
      </h1>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {[
          { icon: Download, title: "Manifesto PDF", body: "Full 2027 pillar document.", cta: "Download" },
          { icon: ImageIcon, title: "Press Photos", body: "Approved candidate imagery.", cta: "Browse" },
          { icon: Newspaper, title: "Press Releases", body: "Latest campaign statements.", cta: "Read" },
        ].map((c) => (
          <div key={c.title} className="solid-card p-6">
            <div className="inline-flex h-10 w-10 items-center justify-center amber-bar"><c.icon size={18} /></div>
            <h3 className="mt-4 font-display text-lg font-semibold">{c.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
            <button className="mt-4 text-sm font-semibold text-amber hover:underline">{c.cta} →</button>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="font-display text-2xl font-bold">Latest updates</h2>
        <div className="mt-4 grid gap-4">
          {[
            { d: "Feb 12, 2026", t: "Mwaura launches ward-listening tour across Kiambu" },
            { d: "Jan 30, 2026", t: "Youth manifesto pillar unveiled in Ruiru" },
            { d: "Jan 15, 2026", t: "Campaign HQ opens in Kiambu Town" },
          ].map((u) => (
            <article key={u.t} className="solid-card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <div className="text-xs uppercase tracking-widest text-amber">{u.d}</div>
                <div className="mt-1 font-display text-lg">{u.t}</div>
              </div>
              <button className="text-sm font-semibold text-amber hover:underline self-start">Read →</button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
