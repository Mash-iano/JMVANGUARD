import { createFileRoute } from "@tanstack/react-router";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "../components/ui/accordion";

const PILLARS = [
  {
    id: "youth",
    title: "Youth Agenda",
    summary: "Jobs, skills, and dignity for every young person in Kiambu.",
    items: [
      "20,000 direct jobs through public works and county SME anchor contracts.",
      "A digital innovation hub in every one of the 12 constituencies within 24 months.",
      "TVET scholarships prioritising Ruiru, Thika Town, and Kikuyu urban wards.",
      "Youth Enterprise Fund with transparent, published disbursement lists.",
    ],
  },
  {
    id: "infra",
    title: "Infrastructure",
    summary: "Roads, water, markets, and streetlights that outlast the term.",
    items: [
      "500 km of newly tarmacked feeder roads over the first four years.",
      "Modern market sheds in Limuru, Githunguri, and Gatundu South.",
      "24-hour streetlight coverage across all urban wards.",
      "Piped water expansion to underserved rural villages in Lari and Kabete.",
    ],
  },
  {
    id: "health",
    title: "Healthcare",
    summary: "A health system that shows up on the day you need it.",
    items: [
      "Upgrade of four Level-4 hospitals with maternal and emergency wings.",
      "A drug stock-out guarantee: real-time public inventory across dispensaries.",
      "Free NHIF/SHA sign-ups for every registered Kiambu resident under 30.",
      "Mental health desks in every sub-county hospital.",
    ],
  },
  {
    id: "edu",
    title: "Education",
    summary: "Public schools that our own children are proud to attend.",
    items: [
      "County-wide ECDE feeding program in partnership with local farmers.",
      "1,500 additional ECDE teachers on permanent county payroll.",
      "Transparent bursary allocation with published criteria and beneficiary lists.",
      "Free WiFi in every public secondary school library.",
    ],
  },
  {
    id: "econ",
    title: "Economy",
    summary: "Small business first. Investors welcome. Cartels closed.",
    items: [
      "County SME revolving fund with sub-8% interest and no political gatekeepers.",
      "Value-addition plants for coffee, dairy, and horticulture along the Thika belt.",
      "Two industrial parks in Ruiru and Juja, with plug-and-play plots.",
      "One-stop county business licensing under a 72-hour turnaround guarantee.",
    ],
  },
];

export const Route = createFileRoute("/manifesto")({
  head: () => ({
    meta: [
      { title: "Manifesto — Mwaura 2027" },
      { name: "description", content: "The five-pillar Mwaura 2027 manifesto for Kiambu County: Youth, Infrastructure, Healthcare, Education, Economy." },
      { property: "og:title", content: "Manifesto — Mwaura 2027" },
      { property: "og:description", content: "Five pillars. One promise. Read the full Kiambu manifesto." },
    ],
  }),
  component: ManifestoPage,
});

function ManifestoPage() {
  return (
    <div className="container-page py-16 max-w-5xl">
      <div className="text-xs font-semibold uppercase tracking-widest text-amber">
        Manifesto 2027
      </div>
      <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">
        Five pillars. One promise.
      </h1>
      <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
        Every pledge below ships with a timeline, a budget line, and a public
        dashboard so the county can hold us to it.
      </p>

      <div className="mt-10 solid-card border-2 p-2 sm:p-4">
        <Accordion type="single" collapsible defaultValue="youth">
          {PILLARS.map((p) => (
            <AccordionItem key={p.id} value={p.id} className="border-border">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="text-left">
                  <div className="font-display text-lg font-semibold">{p.title}</div>
                  <div className="text-sm text-muted-foreground">{p.summary}</div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4">
                <ul className="grid gap-2 pl-4 list-disc marker:text-amber text-sm">
                  {p.items.map((i) => <li key={i}>{i}</li>)}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
