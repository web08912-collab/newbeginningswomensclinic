import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, ArrowRight } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — Women's Health, Pregnancy & Wellness" },
      { name: "description", content: "Expert articles on women's health, pregnancy, fertility, menopause and wellness from the team at New Beginnings Women's Clinic, Bangalore." },
      { property: "og:title", content: "Blog — New Beginnings Women's Clinic" },
      { property: "og:description", content: "Expert articles on women's health and wellness." },
      { property: "og:url", content: "/blog" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: Blog,
});

const posts = [
  { cat: "Pregnancy", date: "Jun 2026", title: "Your first prenatal visit — what to expect", excerpt: "A gentle walk-through of your very first antenatal appointment and how to prepare." },
  { cat: "Fertility", date: "May 2026", title: "Understanding fertility: when to consult a specialist", excerpt: "Key signs that it's time to seek expert fertility guidance — and what the first conversation looks like." },
  { cat: "Wellness", date: "May 2026", title: "PCOS-friendly habits that actually work", excerpt: "Evidence-based lifestyle changes that meaningfully support hormonal balance." },
  { cat: "Menopause", date: "Apr 2026", title: "Navigating perimenopause with confidence", excerpt: "The shifts to expect — and the simple care plans that keep you feeling strong." },
  { cat: "Women's Health", date: "Apr 2026", title: "Why regular screenings matter at every age", excerpt: "A simple guide to age-appropriate gynecological screenings and why they save lives." },
  { cat: "Pregnancy", date: "Mar 2026", title: "Eating well in your second trimester", excerpt: "Nourishing, practical meal ideas that work for Bangalore moms-to-be." },
];

function Blog() {
  return (
    <section className="container-px mx-auto max-w-7xl py-16 md:py-24">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Insights</p>
        <h1 className="mt-3 max-w-3xl font-display text-5xl font-semibold leading-tight md:text-6xl">
          Stories & guidance for <span className="gradient-text">every woman</span>.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Honest, expert-written notes on pregnancy, fertility, menopause and everyday women's wellness.
        </p>
      </Reveal>

      <Stagger className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <StaggerItem key={p.title}>
            <article className="card-elegant card-elegant-hover group h-full p-7">
              <div className="flex items-center gap-3 text-xs">
                <span className="rounded-full bg-muted px-2.5 py-1 font-semibold uppercase tracking-wider">{p.cat}</span>
                <span className="flex items-center gap-1 text-muted-foreground"><Calendar className="h-3 w-3" /> {p.date}</span>
              </div>
              <h2 className="mt-5 font-display text-xl font-semibold leading-snug">{p.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.excerpt}</p>
              <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary opacity-80 transition-opacity group-hover:opacity-100">
                Read article <ArrowRight className="h-4 w-4" />
              </div>
            </article>
          </StaggerItem>
        ))}
      </Stagger>

      <Reveal>
        <div className="mt-16 rounded-[2rem] p-10 text-center text-white md:p-14" style={{ background: "var(--gradient-cta)" }}>
          <h2 className="font-display text-3xl font-semibold md:text-4xl">Have a question for our team?</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">Book a confidential consultation. We respond within hours.</p>
          <Link to="/appointment" className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-foreground transition-transform hover:scale-[1.03]">
            Book Appointment <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
