import { createFileRoute } from "@tanstack/react-router";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { Heart, Target, Eye, Sparkles, ShieldCheck, Users } from "lucide-react";
import { SITE } from "@/lib/site";
import clinic1 from "@/assets/clinic-1.jpg";
import clinic2 from "@/assets/clinic-2.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — New Beginnings Women's Clinic" },
      { name: "description", content: "Our story, mission, vision and the values that shape every visit at New Beginnings Women's Clinic in Bangalore." },
      { property: "og:title", content: "About New Beginnings Women's Clinic" },
      { property: "og:description", content: "Our story, mission, vision and values." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

const values = [
  { icon: Heart, title: "Patient First", body: "Every decision begins with what's best for you." },
  { icon: ShieldCheck, title: "Clinical Excellence", body: "Evidence-based, modern, and meticulously safe care." },
  { icon: Sparkles, title: "Premium Comfort", body: "A clinic designed to feel calm, dignified and warm." },
  { icon: Users, title: "Compassionate Team", body: "A team that listens — without rush, without judgment." },
];

const timeline = [
  { year: "2004", title: "Clinical Practice Begins", body: "Dr. Kavitha begins her gynecology practice in Bangalore." },
  { year: "2012", title: "Specialized Fertility Care", body: "Expanded services to include fertility consultation and IVF." },
  { year: "2018", title: "Hospital Affiliations", body: "Joined leading partner hospitals: Apollo Cradle, Kauvery, Motherhood." },
  { year: "2024", title: "New Beginnings Clinic", body: "A new flagship clinic at Kundalahalli Gate, designed for modern women's wellness." },
];

function About() {
  return (
    <>
      <section className="container-px mx-auto max-w-7xl py-16 md:py-24">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Our Story</p>
          <h1 className="mt-3 max-w-3xl font-display text-5xl font-semibold leading-tight md:text-6xl">
            Two decades of <span className="gradient-text">care, trust and new beginnings</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            {SITE.name} is the result of a simple belief — that women deserve healthcare that is as compassionate as it is excellent.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          <Reveal><img src={clinic1} alt="Clinic reception" loading="lazy" width={1280} height={960} className="aspect-[4/3] w-full rounded-3xl object-cover shadow-[var(--shadow-soft)]" /></Reveal>
          <Reveal delay={0.1}><img src={clinic2} alt="Examination room" loading="lazy" width={1280} height={960} className="aspect-[4/3] w-full rounded-3xl object-cover shadow-[var(--shadow-soft)]" /></Reveal>
        </div>
      </section>

      <section className="container-px mx-auto max-w-7xl py-12">
        <Stagger className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Target, title: "Our Mission", body: "To provide every woman with healthcare that is expert, compassionate, and dignified — at every stage of life." },
            { icon: Eye, title: "Our Vision", body: "To be Bangalore's most trusted destination for women's wellness — known equally for clinical excellence and warmth." },
            { icon: Heart, title: "Our Philosophy", body: "Care that listens first. Treats second. And walks with you through every step of your journey." },
          ].map((b) => (
            <StaggerItem key={b.title}>
              <div className="card-elegant card-elegant-hover h-full p-8">
                <b.icon className="h-7 w-7 text-accent" />
                <h3 className="mt-5 font-display text-2xl font-semibold">{b.title}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">{b.body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="container-px mx-auto max-w-7xl py-24">
        <Reveal>
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Our Values</p>
            <h2 className="mt-3 font-display text-4xl font-semibold md:text-5xl">What guides us</h2>
          </div>
        </Reveal>
        <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => (
            <StaggerItem key={v.title}>
              <div className="card-elegant card-elegant-hover h-full p-6">
                <v.icon className="h-6 w-6 text-accent" />
                <h3 className="mt-4 font-display text-lg font-semibold">{v.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{v.body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="container-px mx-auto max-w-4xl py-16">
        <Reveal>
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Our Journey</p>
            <h2 className="mt-3 font-display text-4xl font-semibold md:text-5xl">Milestones</h2>
          </div>
        </Reveal>
        <div className="relative mt-14 pl-6 md:pl-0">
          <div className="absolute left-2 top-0 h-full w-px bg-border md:left-1/2" />
          {timeline.map((t, i) => (
            <Reveal key={t.year} delay={i * 0.1}>
              <div className={`relative mb-10 md:grid md:grid-cols-2 md:gap-12 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
                <div className={`${i % 2 ? "md:text-left" : "md:text-right"}`}>
                  <div className="font-display text-3xl font-semibold gradient-text">{t.year}</div>
                  <h3 className="mt-1 font-display text-xl">{t.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t.body}</p>
                </div>
                <div className="hidden md:block" />
                <span className="absolute left-0 top-1.5 h-4 w-4 -translate-x-1/2 rounded-full md:left-1/2" style={{ background: "var(--gradient-primary)" }} />
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
