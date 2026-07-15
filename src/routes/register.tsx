import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { KIAMBU, CONSTITUENCIES, KE_PHONE_REGEX, normalizeKePhone } from "@/lib/kiambu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const INTERESTS = [
  "Jobs & Enterprise",
  "Healthcare",
  "Education & Bursaries",
  "Sports & Arts",
  "Digital / Tech",
  "Agriculture",
  "Environment",
];

const schema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(120),
  phone: z.string().trim().regex(KE_PHONE_REGEX, "Use 07XXXXXXXX or +2547XXXXXXXX"),
  id_number: z.string().trim().max(20).optional().or(z.literal("")),
  gender: z.enum(["male", "female", "other"]).optional(),
  date_of_birth: z.string().optional().or(z.literal("")),
  constituency: z.string().min(1, "Select your constituency"),
  ward: z.string().min(1, "Select your ward"),
  village: z.string().trim().max(80).optional().or(z.literal("")),
  occupation: z.string().trim().max(80).optional().or(z.literal("")),
  interests: z.array(z.string()).optional(),
  consent: z.literal(true, { errorMap: () => ({ message: "You must accept the data policy" }) }),
});

type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Youth Registration — Mwaura 2027" },
      { name: "description", content: "Register with the Mwaura 2027 youth movement — free, 2 minutes, and open to every Kiambu resident." },
      { property: "og:title", content: "Youth Registration — Mwaura 2027" },
      { property: "og:description", content: "Join the Mwaura 2027 youth movement." },
    ],
  }),
  component: RegisterPage,
});

const STEPS = ["Personal", "Location", "About You", "Review"] as const;

function RegisterPage() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: "", phone: "", id_number: "", gender: undefined,
      date_of_birth: "", constituency: "", ward: "", village: "",
      occupation: "", interests: [], consent: false as unknown as true,
    },
    mode: "onBlur",
  });

  const constituency = form.watch("constituency");
  const wardOptions = useMemo(
    () => (constituency ? KIAMBU[constituency] ?? [] : []),
    [constituency],
  );

  async function onSubmit(values: FormValues) {
    const payload = {
      full_name: values.full_name.trim(),
      phone: normalizeKePhone(values.phone),
      id_number: values.id_number || null,
      gender: values.gender || null,
      date_of_birth: values.date_of_birth || null,
      constituency: values.constituency,
      ward: values.ward,
      village: values.village || null,
      occupation: values.occupation || null,
      interests: values.interests,
      source: "public_portal",
    };
    const { error } = await supabase.from("youth_registrations").insert(payload);
    if (error) {
      toast.error("Registration failed", { description: error.message });
      return;
    }
    toast.success("You're in! Karibu Mwaura 2027.");
    setDone(true);
  }

  async function next() {
    const fields: Record<number, (keyof FormValues)[]> = {
      0: ["full_name", "phone", "id_number", "gender", "date_of_birth"],
      1: ["constituency", "ward", "village"],
      2: ["occupation", "interests"],
    };
    const ok = await form.trigger(fields[step] ?? []);
    if (ok) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  if (done) {
    return (
      <div className="container-page py-24 max-w-xl text-center">
        <div className="mx-auto inline-flex h-16 w-16 items-center justify-center amber-bar">
          <CheckCircle2 size={32} />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold">Karibu Mwaura 2027 🎉</h1>
        <p className="mt-3 text-muted-foreground">
          You're officially part of the movement. Your ward coordinator will be
          in touch shortly.
        </p>
        <div className="mt-8 solid-card border-2 p-6 text-left text-sm">
          <div className="text-xs uppercase tracking-widest text-amber">Next steps</div>
          <ul className="mt-3 space-y-2 list-disc pl-5 marker:text-amber">
            <li>Save the campaign number to your phone.</li>
            <li>Share the movement with 3 friends in your ward.</li>
            <li>Watch for our SMS invitation to the next town hall.</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-14 max-w-2xl">
      <div className="text-xs font-semibold uppercase tracking-widest text-amber">
        Youth Registration
      </div>
      <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
        Join the movement.
      </h1>
      <p className="mt-3 text-muted-foreground">
        Free. Takes about two minutes. Open to every resident of Kiambu County.
      </p>

      {/* Stepper */}
      <ol className="mt-8 grid grid-cols-4 gap-2">
        {STEPS.map((label, i) => (
          <li key={label} className={`solid-card border-2 px-2 py-2 text-center text-[11px] sm:text-xs ${i === step ? "border-amber" : i < step ? "border-border" : "border-border opacity-60"}`}>
            <div className={`font-display text-base ${i <= step ? "text-amber" : ""}`}>{i + 1}</div>
            <div className="mt-1 uppercase tracking-widest">{label}</div>
          </li>
        ))}
      </ol>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-8 solid-card border-2 p-6 sm:p-8 space-y-6"
      >
        {step === 0 && (
          <>
            <Field label="Full name *" error={form.formState.errors.full_name?.message}>
              <Input {...form.register("full_name")} placeholder="Jane Wanjiku Kamau" />
            </Field>
            <Field label="Phone number *" error={form.formState.errors.phone?.message}>
              <Input {...form.register("phone")} placeholder="0712 345 678" inputMode="tel" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="National ID (optional)" error={form.formState.errors.id_number?.message}>
                <Input {...form.register("id_number")} placeholder="12345678" inputMode="numeric" />
              </Field>
              <Field label="Gender" error={form.formState.errors.gender?.message}>
                <Select onValueChange={(v) => form.setValue("gender", v as FormValues["gender"])} value={form.watch("gender") ?? ""}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other / Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Date of birth (optional)">
              <Input type="date" {...form.register("date_of_birth")} />
            </Field>
          </>
        )}

        {step === 1 && (
          <>
            <Field label="Constituency *" error={form.formState.errors.constituency?.message}>
              <Select
                value={form.watch("constituency")}
                onValueChange={(v) => {
                  form.setValue("constituency", v);
                  form.setValue("ward", "");
                }}
              >
                <SelectTrigger><SelectValue placeholder="Select constituency" /></SelectTrigger>
                <SelectContent>
                  {CONSTITUENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Ward *" error={form.formState.errors.ward?.message}>
              <Select
                value={form.watch("ward")}
                onValueChange={(v) => form.setValue("ward", v)}
                disabled={!constituency}
              >
                <SelectTrigger>
                  <SelectValue placeholder={constituency ? "Select ward" : "Choose constituency first"} />
                </SelectTrigger>
                <SelectContent>
                  {wardOptions.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Village / Estate (optional)">
              <Input {...form.register("village")} placeholder="e.g. Ndumberi" />
            </Field>
          </>
        )}

        {step === 2 && (
          <>
            <Field label="Occupation (optional)">
              <Input {...form.register("occupation")} placeholder="Student, farmer, boda rider..." />
            </Field>
            <div>
              <Label className="mb-3 block text-sm font-medium">What matters to you?</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {INTERESTS.map((i) => {
                  const checked = form.watch("interests")?.includes(i);
                  return (
                    <label key={i} className={`flex items-center gap-3 border-2 rounded-sm px-3 py-2 cursor-pointer ${checked ? "border-amber" : "border-border"}`}>
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) => {
                          const cur = form.getValues("interests") ?? [];
                          form.setValue(
                            "interests",
                            v ? [...cur, i] : cur.filter((x) => x !== i),
                          );
                        }}
                      />
                      <span className="text-sm">{i}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="grid gap-3 text-sm">
              <Row k="Name" v={form.watch("full_name")} />
              <Row k="Phone" v={form.watch("phone")} />
              <Row k="Constituency" v={form.watch("constituency")} />
              <Row k="Ward" v={form.watch("ward")} />
              {form.watch("village") && <Row k="Village" v={form.watch("village")!} />}
              {form.watch("occupation") && <Row k="Occupation" v={form.watch("occupation")!} />}
              {(form.watch("interests")?.length ?? 0) > 0 && (
                <Row k="Interests" v={(form.watch("interests") ?? []).join(", ")} />
              )}
            </div>

            <label className="mt-4 flex items-start gap-3 text-sm">
              <Checkbox
                checked={form.watch("consent") as unknown as boolean}
                onCheckedChange={(v) => form.setValue("consent", (v === true) as unknown as true, { shouldValidate: true })}
              />
              <span className="text-muted-foreground">
                I consent to Mwaura 2027 storing my details under the Kenya Data
                Protection Act, 2019 for campaign communications only.
              </span>
            </label>
            {form.formState.errors.consent && (
              <p className="text-xs text-destructive-foreground">
                {form.formState.errors.consent.message}
              </p>
            )}
          </>
        )}

        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={next} className="bg-amber text-primary-foreground hover:bg-amber-bright">
              Continue <ChevronRight size={16} className="ml-1" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="bg-amber text-primary-foreground hover:bg-amber-bright"
            >
              {form.formState.isSubmitting ? "Submitting..." : "Complete Registration"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

function Field({
  label, error, children,
}: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive-foreground">{error}</p>}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-2">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium text-right">{v}</span>
    </div>
  );
}
