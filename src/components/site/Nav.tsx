import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { SITE } from "@/lib/site";
import logoAsset from "@/assets/logo.png.asset.json";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/doctors", label: "Doctors" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
  { to: "/portal", label: "Patient Portal" },
  { to: "/admin", label: "Admin" },
] as const;

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "py-2" : "py-4"
      }`}
    >
      <div className="container-px mx-auto max-w-7xl">
        <div
          className={`flex items-center justify-between gap-4 rounded-full px-4 py-2.5 transition-all duration-300 ${
            scrolled ? "glass shadow-[var(--shadow-soft)]" : ""
          }`}
        >
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <img src={logoAsset.url} alt={SITE.name} className="h-10 w-10 shrink-0 object-contain" />
            <span className="whitespace-nowrap font-display text-sm font-semibold sm:text-base">
              {SITE.name}
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="rounded-full px-3.5 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                activeProps={{ className: "rounded-full px-3.5 py-2 text-sm font-medium text-primary bg-muted" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/appointment" className="hidden btn-hero btn-hero-hover sm:inline-flex !py-2.5 !text-sm">
              Book Appointment
            </Link>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full glass lg:hidden"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="mt-2 glass rounded-3xl p-4 lg:hidden">
            <nav className="flex flex-col gap-1">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="rounded-2xl px-4 py-3 text-sm font-medium hover:bg-muted"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                to="/appointment"
                onClick={() => setOpen(false)}
                className="mt-2 btn-hero btn-hero-hover !py-3 !text-sm"
              >
                Book Appointment
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
