import { createFileRoute } from "@tanstack/react-router";
import { Progress } from "../components/ui/progress";

const GOAL = 50_000_000; // KES
const RAISED = 18_450_000;

export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title: "Donate — Mwaura 2027" },
      { name: "description", content: "Fuel the Mwaura 2027 campaign. Every shilling is tracked, published, and auditable." },
      { property: "og:title", content: "Donate — Mwaura 2027" },
      { property: "og:description", content: "Support a transparent, youth-first campaign for Kiambu County." },
    ],
  }),
  component: DonatePage,
});

function DonatePage() {
  const pct = Math.round((RAISED / GOAL) * 100);
  return (
    <div className="container-page py-16 max-w-3xl">
      <div className="text-xs font-semibold uppercase tracking-widest text-amber">Support the Movement</div>
      <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">
        Fund a campaign that publishes its books.
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Every shilling raised is tracked, categorised, and published on this
        portal every 30 days. No dark money. No favours.
      </p>

      <div className="mt-10 solid-card border-2 p-8">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Raised</div>
            <div className="mt-1 font-display text-3xl font-bold text-amber">
              KES {RAISED.toLocaleString()}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Goal</div>
            <div className="mt-1 font-display text-xl">KES {GOAL.toLocaleString()}</div>
          </div>
        </div>
        <Progress value={pct} className="mt-5 h-3 bg-muted [&>div]:bg-amber" />
        <div className="mt-2 text-xs text-muted-foreground">{pct}% of Q1 2027 target</div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[500, 2000, 10000].map((amt) => (
            <button key={amt} className="rounded-sm border-2 border-border py-4 font-display text-lg font-semibold hover:border-amber">
              KES {amt.toLocaleString()}
            </button>
          ))}
        </div>
        <button className="mt-4 w-full rounded-sm amber-bar py-3 font-semibold">
          Donate via M-Pesa (Paybill 000000)
        </button>
        <p className="mt-3 text-xs text-muted-foreground text-center">
          Payment gateway integration coming soon. Configure Paybill/Till in campaign settings.
        </p>
      </div>
    </div>
  );
}
