import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Award, ArrowRight, Stethoscope, Sparkles } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { CardSkeleton } from "@/components/site/Skeleton";
import { supabase } from "@/integrations/supabase/client";
import doctorImg from "@/assets/doctor.png.asset.json";

export const Route = createFileRoute("/doctors")({
  head: () => ({
    meta: [
      { title: "Our Doctors — New Beginnings Women's Clinic" },
      { name: "description", content: "Meet the team of expert gynecologists and women's health specialists at New Beginnings Women's Clinic, Bangalore." },
      { property: "og:title", content: "Our Doctors — New Beginnings Women's Clinic" },
      { property: "og:description", content: "Meet our team of expert women's health specialists." },
      { property: "og:url", content: "/doctors" },
    ],
    links: [{ rel: "canonical", href: "/doctors" }],
  }),
  component: DoctorsPage,
});

type Doctor = {
  id: string;
  slug: string;
  name: string;
  specialization: string | null;
  qualifications: string | null;
  bio: string | null;
  image_url: string | null;
  experience_years: number | null;
  languages: string[] | null;
  is_featured: boolean;
};

function DoctorsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["public", "doctors"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("doctors")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Doctor[];
    },
  });

  return (
    <section className="container-px mx-auto max-w-7xl py-16 md:py-24">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Our Doctors</p>
        <h1 className="mt-3 font-display text-5xl font-semibold leading-tight md:text-6xl">
          Meet the team behind your <span className="gradient-text">care</span>.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
          A team of experienced gynecologists and specialists committed to compassionate, personalized women's healthcare.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
          : (data ?? []).map((d, i) => (
              <Reveal key={d.id} delay={i * 0.06}>
                <article className="card-elegant card-elegant-hover overflow-hidden">
                  <div className="aspect-[4/5] overflow-hidden bg-muted">
                    <img
                      src={d.image_url || doctorImg.url}
                      alt={d.name}
                      className="h-full w-full object-cover transition duration-700 hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    {d.is_featured && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent">
                        <Sparkles className="h-3 w-3" /> Lead Doctor
                      </span>
                    )}
                    <h2 className="mt-3 font-display text-2xl font-semibold">{d.name}</h2>
                    {d.specialization && <p className="text-sm text-muted-foreground">{d.specialization}</p>}
                    {d.qualifications && (
                      <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-foreground/70">
                        <Award className="h-3.5 w-3.5 text-accent" /> {d.qualifications}
                      </p>
                    )}
                    {!!d.experience_years && (
                      <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-foreground/70">
                        <Stethoscope className="h-3.5 w-3.5 text-accent" /> {d.experience_years}+ years experience
                      </p>
                    )}
                    {d.bio && <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-foreground/80">{d.bio}</p>}
                    <Link to="/appointment" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                      Book with {d.name.split(" ").slice(0, 2).join(" ")} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
      </div>

      {!isLoading && (!data || data.length === 0) && (
        <p className="mt-12 text-center text-sm text-muted-foreground">No doctors listed yet.</p>
      )}
    </section>
  );
}
