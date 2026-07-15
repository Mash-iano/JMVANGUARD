import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Download, Loader2, Search, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { listYouthRegistrations } from "@/lib/youth-registrations.functions";
import { CONSTITUENCIES, KIAMBU } from "@/lib/kiambu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/admin/youth-registrations")({
  head: () => ({
    meta: [
      { title: "Youth Registrations — Mwaura 2027" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: YouthRegistrationsPage,
});

type Row = {
  id: string;
  created_at: string;
  full_name: string;
  phone: string;
  id_number: string | null;
  gender: string | null;
  date_of_birth: string | null;
  constituency: string;
  ward: string;
  village: string | null;
  occupation: string | null;
  interests: string[] | null;
  source: string | null;
};

const CSV_COLS: (keyof Row)[] = [
  "created_at", "full_name", "phone", "id_number", "gender",
  "date_of_birth", "constituency", "ward", "village", "occupation",
  "interests", "source",
];

function toCsv(rows: Row[]): string {
  const esc = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = Array.isArray(v) ? v.join("; ") : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = CSV_COLS.join(",");
  const body = rows.map((r) => CSV_COLS.map((c) => esc(r[c])).join(",")).join("\n");
  return header + "\n" + body;
}

function YouthRegistrationsPage() {
  const call = useServerFn(listYouthRegistrations);
  const [search, setSearch] = useState("");
  const [constituency, setConstituency] = useState("");
  const [ward, setWard] = useState("");
  const [applied, setApplied] = useState({ search: "", constituency: "", ward: "" });

  const wards = useMemo(
    () => (constituency ? KIAMBU[constituency] ?? [] : []),
    [constituency],
  );

  const query = useQuery({
    queryKey: ["youth-registrations", applied],
    queryFn: () => call({ data: { ...applied, limit: 1000 } }),
  });

  function apply(e: React.FormEvent) {
    e.preventDefault();
    setApplied({ search: search.trim(), constituency, ward });
  }

  function exportCsv() {
    const rows = query.data?.rows ?? [];
    if (!rows.length) return toast.info("No rows to export.");
    const blob = new Blob([toCsv(rows as Row[])], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `youth-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  const rows = (query.data?.rows ?? []) as Row[];

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <Link
            to="/war-room"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> War Room
          </Link>
          <h1 className="mt-1 font-display text-2xl font-semibold">Youth Registrations</h1>
          <p className="text-sm text-muted-foreground">
            Restricted to command, coordination, and analyst roles.
          </p>
        </div>
        <Button
          onClick={exportCsv}
          disabled={!rows.length}
          className="amber-bar text-navy font-semibold hover:opacity-90"
        >
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <form
        onSubmit={apply}
        className="grid gap-3 rounded-md border border-border bg-card p-4 sm:grid-cols-4"
      >
        <div className="sm:col-span-2">
          <Label htmlFor="q">Search</Label>
          <Input
            id="q"
            placeholder="Name, phone, ID, village"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="c">Constituency</Label>
          <select
            id="c"
            className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={constituency}
            onChange={(e) => { setConstituency(e.target.value); setWard(""); }}
          >
            <option value="">All</option>
            {CONSTITUENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <Label htmlFor="w">Ward</Label>
          <select
            id="w"
            className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={ward}
            onChange={(e) => setWard(e.target.value)}
            disabled={!constituency}
          >
            <option value="">All</option>
            {wards.map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>
        <div className="sm:col-span-4">
          <Button type="submit" variant="secondary" className="w-full sm:w-auto">
            <Search className="mr-2 h-4 w-4" /> Apply filters
          </Button>
        </div>
      </form>

      <div className="mt-6 overflow-hidden rounded-md border border-border">
        {query.isLoading ? (
          <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : query.isError ? (
          <div className="p-6 text-sm text-destructive">
            {(query.error as Error).message === "Forbidden"
              ? "You do not have permission to view youth registrations."
              : `Failed to load: ${(query.error as Error).message}`}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Registered</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Phone</th>
                  <th className="px-3 py-2">Constituency</th>
                  <th className="px-3 py-2">Ward</th>
                  <th className="px-3 py-2">Village</th>
                  <th className="px-3 py-2">Interests</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">
                      No registrations match these filters.
                    </td>
                  </tr>
                ) : rows.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                    <td className="px-3 py-2">{r.full_name}</td>
                    <td className="px-3 py-2 font-mono text-xs">{r.phone}</td>
                    <td className="px-3 py-2">{r.constituency}</td>
                    <td className="px-3 py-2">{r.ward}</td>
                    <td className="px-3 py-2">{r.village ?? "—"}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {(r.interests ?? []).join(", ") || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Showing up to 1,000 most recent rows. Refine filters to narrow.
      </p>
    </section>
  );
}
