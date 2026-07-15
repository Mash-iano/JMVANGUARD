import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-navy">
      <div className="container-page py-12 grid gap-10 md:grid-cols-4">
        <div>
          <div className="font-display text-lg font-bold">
            MWAURA <span className="text-amber">2027</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">
            A disciplined, transparent, and youth-first bid for Kiambu County —
            built on service, evidence, and delivery.
          </p>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-amber">
            Campaign
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-amber">About the Candidate</Link></li>
            <li><Link to="/manifesto" className="hover:text-amber">Manifesto</Link></li>
            <li><Link to="/media" className="hover:text-amber">Media & Press</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-amber">
            Get Involved
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/register" className="hover:text-amber">Youth Registration</Link></li>
            <li><Link to="/volunteer" className="hover:text-amber">Volunteer</Link></li>
            <li><Link to="/donate" className="hover:text-amber">Donate</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-amber">
            Contact
          </div>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Campaign HQ, Kiambu Town</li>
            <li>+254 700 000 000</li>
            <li>info@mwaura2027.co.ke</li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-t border-border mt-8 pt-8 text-xs text-muted-foreground">
  <p>© 2026–2027 Mwaura Campaign. All rights reserved.</p>
  <p>
    Designed by{" "}
    <a 
      href="https://blessedsolutionsconsultancy.vercel.app/" 
      target="_blank" 
      rel="noopener noreferrer" 
      className="text-amber hover:underline font-medium"
    >
      Blessed Solutions Global
    </a>
  </p>
</div>
    </footer>
  );
}
