import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, GraduationCap, Stethoscope, ArrowRight, CheckCircle2 } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import doctorImg from "@/assets/doctor.png.asset.json";
import { SITE, ASSOCIATED_HOSPITALS } from "@/lib/site";

export const Route = createFileRoute("/doctor")({
  head: () => ({
    meta: [
      { title: "Dr. Kavitha V Reddy — Gynecologist in Bangalore (25+ Yrs)" },
      { name: "description", content: "Dr. Kavitha V Reddy, MBBS, DGO — Consultant Obstetrician & Gynecologist with 25+ years of experience in pregnancy care, fertility and laparoscopic surgery in Bangalore." },
      { property: "og:title", content: "Dr. Kavitha V Reddy — Gynecologist" },
      { property: "og:description", content: "25+ years of compassionate gynecology and women's wellness care in Bangalore." },
      { property: "og:url", content: "/doctor" },
    ],
    links: [{ rel: "canonical", href: "/doctor" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Physician",
        name: SITE.doctor.name,
        medicalSpecialty: SITE.doctor.specs,
        worksFor: { "@type": "MedicalClinic", name: SITE.name },
      }),
    }],
  }),
  component: Doctor,
});

const credentials = [
  { icon: GraduationCap, title: "MBBS", body: "Bachelor of Medicine and Bachelor of Surgery" },
  { icon: GraduationCap, title: "DGO", body: "Diploma in Gynecology and Obstetrics" },
  { icon: Stethoscope, title: "25+ Years", body: "Active clinical practice in Bangalore" },
  { icon: Award, title: "Trusted Affiliations", body: "Apollo Cradle, Kauvery, Motherhood" },
];

function Doctor() {
  return (
    <>
      <section className="container-px mx-auto max-w-7xl py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-5 lg:items-center">
          <Reveal className="lg:col-span-2">
            <div className="relative">
              <div className="absolute -inset-6 -z-10 rounded-[2.5rem] opacity-50 blur-3xl" style={{ background: "var(--gradient-primary)" }} />
              <img src={doctorImg.url} alt={SITE.doctor.name} width={1024} height={1024} className="aspect-[4/5] w-full rounded-[2rem] object-cover shadow-[var(--shadow-elegant)]" />
            </div>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Meet Your Doctor</p>
            <h1 className="mt-3 font-display text-5xl font-semibold leading-tight md:text-6xl">{SITE.doctor.name}</h1>
            <p className="mt-3 text-lg text-muted-foreground">{SITE.doctor.title} · {SITE.doctor.creds}</p>
            <p className="mt-6 leading-relaxed text-foreground/85">
              With over two decades of trusted clinical practice, Dr. Kavitha has guided thousands of women through
              every stage of their reproductive health — from puberty and fertility to pregnancy, delivery, gynecology
              and menopause. She is known across Bangalore for her warmth, precision and deeply personal approach.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {SITE.doctor.specs.map((s) => (
                <span key={s} className="rounded-full bg-muted px-3.5 py-1.5 text-xs font-medium">{s}</span>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/appointment" className="btn-hero btn-hero-hover">Book a consult <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/contact" className="btn-ghost-soft">Contact clinic</Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container-px mx-auto max-w-7xl py-16">
        <Reveal>
          <h2 className="font-display text-3xl font-semibold md:text-4xl">Credentials & expertise</h2>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {credentials.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.08}>
              <div className="card-elegant card-elegant-hover h-full p-6">
                <c.icon className="h-6 w-6 text-accent" />
                <h3 className="mt-4 font-display text-lg font-semibold">{c.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-px mx-auto max-w-4xl py-16">
        <Reveal>
          <h2 className="font-display text-3xl font-semibold md:text-4xl">Areas of practice</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              "Obstetric & antenatal care",
              "High-risk pregnancy support",
              "PCOS / PCOD management",
              "Infertility counselling",
              "Menopause & hormonal care",
              "Laparoscopic gynecological surgery",
              "Preventive screenings",
              "Adolescent gynecology",
            ].map((p) => (
              <li key={p} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <span className="text-sm">{p}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <section className="container-px mx-auto max-w-7xl py-12 text-center">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Associated Hospitals</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {ASSOCIATED_HOSPITALS.map((h) => (
              <div key={h} className="font-display text-xl font-semibold text-muted-foreground md:text-2xl">{h}</div>
            ))}
          </div>
        </Reveal>
      </section>
    </>
  );
}
