import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Check, HeartPulse } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { ADDITIONAL_SERVICES, SITE } from "@/lib/site";
import { supabase } from "@/integrations/supabase/client";


export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Gynecology, Pregnancy, Fertility & Wellness · Bangalore" },
      { name: "description", content: "Pregnancy care, fertility, menstrual & hormonal health, menopause care, IVF, laparoscopy, ultrasound and more at New Beginnings Women's Clinic." },
      { property: "og:title", content: "Services at New Beginnings Women's Clinic" },
      { property: "og:description", content: "Comprehensive gynecology and women's wellness services in Bangalore." },
      { property: "og:url", content: "/services" },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
  component: Services,
});

function Services() {
  const { data: services, isLoading } = useQuery({
    queryKey: ["public", "services"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      return data ?? [];
    },
  });

  return (
    <>
      <section className="container-px mx-auto max-w-7xl py-16 md:py-24">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Our Services</p>
          <h1 className="mt-3 max-w-3xl font-display text-5xl font-semibold leading-tight md:text-6xl">
            Comprehensive care, <span className="gradient-text">under one roof</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            From your first consultation to motherhood and beyond — every service designed around your comfort.
          </p>
        </Reveal>

        {isLoading ? (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card-elegant h-72 animate-pulse p-7" />
            ))}
          </div>
        ) : (
          <Stagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services!.map((s: any) => (
              <StaggerItem key={s.id}>
                <Link
                  to="/services/$slug"
                  params={{ slug: s.slug }}
                  className="card-elegant card-elegant-hover group relative block h-full overflow-hidden p-7"
                >
                  <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-30 blur-3xl transition-opacity group-hover:opacity-60" style={{ background: "var(--gradient-primary)" }} />
                  <div className="relative">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl" style={{ background: "var(--gradient-primary)" }}>
                      <HeartPulse className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="mt-5 font-display text-xl font-semibold">{s.name}</h3>
                    {s.price && <p className="mt-1 text-sm font-medium text-primary">{s.price}</p>}
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.short_description || s.description}</p>
                    {Array.isArray(s.benefits) && s.benefits.length > 0 && (
                      <ul className="mt-4 space-y-1.5 text-sm">
                        {s.benefits.slice(0, 4).map((b: string) => (
                          <li key={b} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />{b}</li>
                        ))}
                      </ul>
                    )}
                    <p className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                      Learn more <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </p>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>

        )}
      </section>

      <section className="container-px mx-auto max-w-7xl py-16">
        <Reveal>
          <div className="rounded-[2rem] p-10 md:p-14" style={{ background: "var(--gradient-hero)" }}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Additional Services</p>
            <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">Beyond gynecology</h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">A complete healthcare ecosystem available at our partner network.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {ADDITIONAL_SERVICES.map((s) => (
                <span key={s} className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium shadow-[var(--shadow-soft)]">{s}</span>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section className="container-px mx-auto max-w-7xl pb-16">
        <Reveal>
          <div className="rounded-[2rem] p-10 text-center text-white md:p-14" style={{ background: "var(--gradient-cta)" }}>
            <h2 className="font-display text-3xl font-semibold md:text-4xl">Not sure which service you need?</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/85">Book a consultation with {SITE.doctor.name} and we'll guide you to the right care.</p>
            <Link to="/appointment" className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-foreground transition-transform hover:scale-[1.03]">
              Book Appointment <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-4 text-xs text-white/70">Or call us at {SITE.phone}</p>
          </div>
        </Reveal>
      </section>
    </>
  );
}
