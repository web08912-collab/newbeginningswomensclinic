import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Award, HeartPulse, Microscope, ShieldCheck, Stethoscope, Sparkles, Star, ChevronDown, Phone } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import doctorImg from "@/assets/doctor.jpg";
import wellnessImg from "@/assets/service-wellness.jpg";
import pregnancyImg from "@/assets/service-pregnancy.jpg";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { CountUp } from "@/components/site/CountUp";
import { SERVICES, SITE, ASSOCIATED_HOSPITALS } from "@/lib/site";
import { supabase } from "@/integrations/supabase/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "New Beginnings Women's Clinic — Gynecologist in Bangalore" },
      { name: "description", content: SITE.description },
      { property: "og:title", content: SITE.name },
      { property: "og:description", content: SITE.description },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

const trust = [
  { n: 20, suffix: "+", label: "Years Experience" },
  { n: 500, suffix: "+", label: "Successful Cases" },
  { n: 1000, suffix: "+", label: "Happy Patients" },
  { n: 98, suffix: "%", label: "Satisfaction" },
];

const why = [
  { icon: Stethoscope, title: "Experienced Specialists", body: "Two decades of trusted clinical expertise." },
  { icon: HeartPulse, title: "Compassionate Care", body: "We listen, we understand, we walk with you." },
  { icon: Microscope, title: "Advanced Diagnostics", body: "Modern lab, ultrasound and screening on-site." },
  { icon: ShieldCheck, title: "Trusted & Safe", body: "Affiliations with Bangalore's top hospitals." },
  { icon: Sparkles, title: "Personalized Plans", body: "Treatment tailored to your unique journey." },
  { icon: Award, title: "Premium Experience", body: "Calm, elegant clinic designed around you." },
];

const FALLBACK_TESTIMONIALS = [
  { id: "1", patient_name: "Priya S.", patient_location: "Patient", content: "Dr. Kavitha is the most patient and caring doctor I have met. The clinic feels like a sanctuary.", rating: 5 },
  { id: "2", patient_name: "Anjali R.", patient_location: "New Mother", content: "From my first scan to delivery — every visit was reassuring. I cannot recommend the team enough.", rating: 5 },
  { id: "3", patient_name: "Meera K.", patient_location: "Patient", content: "Finally, women's care that respects time, dignity and comfort. A truly premium experience.", rating: 5 },
];

const FALLBACK_FAQS = [
  { id: "1", question: "Do I need an appointment to visit?", answer: "Yes — booking helps us give you focused, unhurried time. You can book online in under a minute." },
  { id: "2", question: "Do you handle high-risk pregnancies?", answer: "Yes, with affiliations to leading partner hospitals for advanced delivery and NICU support." },
];

function Home() {
  const { data: testimonials } = useQuery({
    queryKey: ["public", "testimonials"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("testimonials")
        .select("*")
        .eq("is_approved", true)
        .order("sort_order", { ascending: true })
        .limit(6);
      return (data && data.length > 0 ? data : FALLBACK_TESTIMONIALS) as any[];
    },
  });
  const { data: faqs } = useQuery({
    queryKey: ["public", "faqs"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("faqs")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .limit(8);
      return (data && data.length > 0 ? data : FALLBACK_FAQS) as any[];
    },
  });
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div aria-hidden className="pointer-events-none absolute -left-20 top-10 -z-10 h-72 w-72 rounded-full opacity-60 blur-3xl animate-float-slow" style={{ background: "var(--rose)" }} />
        <div aria-hidden className="pointer-events-none absolute -right-20 top-40 -z-10 h-80 w-80 rounded-full opacity-50 blur-3xl animate-float-slow" style={{ background: "var(--lavender)", animationDelay: "2s" }} />

        <div className="container-px mx-auto grid max-w-7xl items-center gap-12 py-16 md:py-24 lg:grid-cols-2 lg:py-32">
          <div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-foreground/80">
              <Sparkles className="h-3.5 w-3.5 text-accent" /> Premium Women's Healthcare · Bangalore
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.9, delay: 0.1 }}
              className="mt-6 text-balance font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
              Compassionate <span className="gradient-text">women's healthcare</span> for every stage of life.
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }}
              className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Expert gynecology, fertility, pregnancy care and women's wellness — led by Dr. Kavitha V Reddy with 20+ years of trusted experience.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/appointment" className="btn-hero btn-hero-hover">
                Book Appointment <ArrowRight className="h-4 w-4" />
              </Link>
              <a href={`tel:${SITE.phoneRaw}`} className="btn-ghost-soft">
                <Phone className="h-4 w-4" /> {SITE.phone}
              </a>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.7 }}
              className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {trust.map((t) => (
                <div key={t.label}>
                  <div className="font-display text-3xl font-semibold gradient-text md:text-4xl">
                    <CountUp to={t.n} suffix={t.suffix} />
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{t.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.96, filter: "blur(10px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0)" }} transition={{ duration: 1 }}
            className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-[var(--shadow-elegant)]">
              <img src={heroImg} alt="New Beginnings Women's Clinic interior" width={1920} height={1080} className="h-full w-full object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 40%, color-mix(in oklab, var(--deeppurple) 60%, transparent) 100%)" }} />
              <div className="absolute bottom-6 left-6 right-6 glass rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-1 text-accent">
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                  </div>
                  <span className="text-sm font-medium">Rated by 1000+ patients</span>
                </div>
                <p className="mt-2 text-sm text-foreground/80">"A truly premium clinic that treats you with dignity and warmth."</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="container-px mx-auto max-w-7xl pb-6 text-center">
          <ChevronDown className="mx-auto h-5 w-5 animate-bounce text-muted-foreground" />
        </div>
      </section>

      {/* SERVICES PREVIEW */}
      <section className="container-px mx-auto max-w-7xl py-24">
        <Reveal>
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Our Services</p>
            <h2 className="mt-3 font-display text-4xl font-semibold md:text-5xl">Care designed for every chapter</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">From your first consult to motherhood and beyond — comprehensive care under one calm roof.</p>
          </div>
        </Reveal>

        <Stagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.slice(0, 6).map((s) => (
            <StaggerItem key={s.slug}>
              <div className="card-elegant card-elegant-hover h-full p-7">
                <div className="grid h-12 w-12 place-items-center rounded-2xl" style={{ background: "var(--gradient-primary)" }}>
                  <HeartPulse className="h-5 w-5 text-white" />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.blurb}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <div className="mt-10 text-center">
          <Link to="/services" className="btn-ghost-soft">View all services <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      {/* WHY US */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 -z-10 opacity-60" style={{ background: "var(--gradient-hero)" }} />
        <div className="container-px mx-auto max-w-7xl">
          <Reveal>
            <div className="grid items-end gap-6 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Why Choose Us</p>
                <h2 className="mt-3 font-display text-4xl font-semibold md:text-5xl">A clinic built around <span className="gradient-text">you</span>.</h2>
              </div>
              <p className="text-muted-foreground md:text-right">Six promises we make to every patient who walks through our doors.</p>
            </div>
          </Reveal>

          <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {why.map((w) => (
              <StaggerItem key={w.title}>
                <div className="card-elegant card-elegant-hover h-full p-6">
                  <w.icon className="h-6 w-6 text-accent" />
                  <h3 className="mt-4 font-display text-lg font-semibold">{w.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{w.body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* DOCTOR SPOTLIGHT */}
      <section className="container-px mx-auto max-w-7xl py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <div className="relative">
              <div className="absolute -inset-6 -z-10 rounded-[2.5rem] opacity-50 blur-3xl" style={{ background: "var(--gradient-primary)" }} />
              <img src={doctorImg} alt={SITE.doctor.name} loading="lazy" width={1024} height={1024} className="aspect-[4/5] w-full rounded-[2rem] object-cover shadow-[var(--shadow-elegant)]" />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Meet Your Doctor</p>
            <h2 className="mt-3 font-display text-4xl font-semibold md:text-5xl">{SITE.doctor.name}</h2>
            <p className="mt-2 text-muted-foreground">{SITE.doctor.creds} · {SITE.doctor.experience}</p>
            <p className="mt-6 leading-relaxed text-foreground/80">
              Dr. Kavitha brings two decades of compassionate, evidence-based gynecological care to Bangalore.
              Known for her warmth and clinical precision, she has guided hundreds of women through pregnancy,
              fertility journeys and complex gynecological care.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {SITE.doctor.specs.map((s) => (
                <span key={s} className="rounded-full bg-muted px-3.5 py-1.5 text-xs font-medium">{s}</span>
              ))}
            </div>
            <div className="mt-8 flex gap-3">
              <Link to="/doctor" className="btn-ghost-soft">Full profile <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/appointment" className="btn-hero btn-hero-hover">Book a consult</Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* HOSPITAL LOGOS */}
      <section className="container-px mx-auto max-w-7xl py-12">
        <Reveal>
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Associated Hospitals</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {ASSOCIATED_HOSPITALS.map((h) => (
              <div key={h} className="font-display text-xl font-semibold text-muted-foreground transition-colors hover:text-foreground md:text-2xl">
                {h}
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* TESTIMONIALS */}
      <section className="container-px mx-auto max-w-7xl py-24">
        <Reveal>
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Patient Stories</p>
            <h2 className="mt-3 font-display text-4xl font-semibold md:text-5xl">Loved by women across Bangalore</h2>
          </div>
        </Reveal>
        <Stagger className="mt-14 grid gap-6 md:grid-cols-3">
          {(testimonials ?? FALLBACK_TESTIMONIALS).map((t: any) => (
            <StaggerItem key={t.id}>
              <div className="card-elegant card-elegant-hover h-full p-7">
                <div className="flex text-accent">{Array.from({ length: t.rating ?? 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
                <p className="mt-4 text-foreground/90 leading-relaxed">"{t.content}"</p>
                <div className="mt-6">
                  <div className="font-display text-lg font-semibold">{t.patient_name}</div>
                  {t.patient_location && <div className="text-xs text-muted-foreground">{t.patient_location}</div>}
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* IMAGE STRIP */}
      <section className="container-px mx-auto max-w-7xl py-12">
        <div className="grid gap-4 sm:grid-cols-2">
          <Reveal>
            <img src={wellnessImg} alt="Women's wellness" loading="lazy" width={1024} height={1024} className="aspect-[5/4] w-full rounded-3xl object-cover shadow-[var(--shadow-soft)]" />
          </Reveal>
          <Reveal delay={0.1}>
            <img src={pregnancyImg} alt="Pregnancy care" loading="lazy" width={1024} height={1024} className="aspect-[5/4] w-full rounded-3xl object-cover shadow-[var(--shadow-soft)]" />
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-px mx-auto max-w-3xl py-24">
        <Reveal>
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">FAQ</p>
            <h2 className="mt-3 font-display text-4xl font-semibold md:text-5xl">Questions, answered</h2>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <Accordion type="single" collapsible className="mt-10">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`f-${i}`} className="border-border">
                <AccordionTrigger className="text-left font-display text-lg">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="container-px mx-auto max-w-7xl pb-16">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] p-10 text-center text-white md:p-16" style={{ background: "var(--gradient-cta)" }}>
            <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-10 -left-10 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
            <h2 className="font-display text-4xl font-semibold md:text-5xl">Begin your wellness journey today.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/85">Book a confidential consultation with Dr. Kavitha. We'll respond within a few hours.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/appointment" className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-foreground transition-transform hover:scale-[1.03]">
                Book Appointment <ArrowRight className="h-4 w-4" />
              </Link>
              <a href={`tel:${SITE.phoneRaw}`} className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20">
                <Phone className="h-4 w-4" /> Call us
              </a>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
