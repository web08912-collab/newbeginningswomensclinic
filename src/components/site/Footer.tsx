import { Link } from "@tanstack/react-router";
import { Phone, Mail, MapPin, Clock, Sparkles } from "lucide-react";
import { SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-muted/40">
      <div className="container-px mx-auto max-w-7xl py-16">
        <div className="grid gap-12 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-full" style={{ background: "var(--gradient-primary)" }}>
                <Sparkles className="h-4 w-4 text-white" />
              </span>
              <span className="font-display text-lg font-semibold">{SITE.short}</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Premium gynecology, fertility and women's wellness care in the heart of Bangalore.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">Explore</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                ["/about", "About"],
                ["/services", "Services"],
                ["/doctor", "Doctor"],
                ["/gallery", "Gallery"],
                ["/admin", "Admin"],
                ["/contact", "Contact"],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-muted-foreground transition-colors hover:text-primary">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">Visit</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" /><span>{SITE.address}</span></li>
              <li className="flex gap-2.5"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent" /><a href={`tel:${SITE.phoneRaw}`} className="hover:text-primary">{SITE.phone}</a></li>
              <li className="flex gap-2.5"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" /><a href={`mailto:${SITE.email}`} className="break-all hover:text-primary">{SITE.email}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">Hours</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {SITE.hours.map((h) => (
                <li key={h.day} className="flex gap-2.5">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <div><div className="text-foreground/90">{h.day}</div><div>{h.time}</div></div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <p>Bangalore • India</p>
        </div>
      </div>
    </footer>
  );
}
