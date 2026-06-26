import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check, Clock, HeartPulse, IndianRupee } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/services/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — New Beginnings Women's Clinic` },
      { name: "description", content: `Detailed information about ${params.slug.replace(/-/g, " ")} at New Beginnings Women's Clinic, Bangalore.` },
    ],
    links: [{ rel: "canonical", href: `/services/${params.slug}` }],
  }),
  component: ServiceDetail,
  errorComponent: ({ error }) => (
    <div className="container-px mx-auto max-w-3xl py-24 text-center">
      <h1 className="font-display text-3xl">Something went wrong</h1>
      <p className="mt-3 text-muted-foreground">{error.message}</p>
      <Link to="/services" className="mt-6 inline-flex text-sm text-primary underline">Back to services</Link>
    </div>
  ),
  notFoundComponent: () => (
    <div className="container-px mx-auto max-w-3xl py-24 text-center">
      <h1 className="font-display text-3xl">Service not found</h1>
      <Link to="/services" className="mt-6 inline-flex text-sm text-primary underline">Back to services</Link>
    </div>
  ),
});

function ServiceDetail() {
  const { slug } = Route.useParams();
  const router = useRouter();
  const { data: service, isLoading } = useQuery({
    queryKey: ["public", "service", slug],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("services")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="container-px mx-auto max-w-5xl py-16">
        <div className="h-8 w-40 animate-pulse rounded bg-muted" />
        <div className="mt-6 h-14 w-2/3 animate-pulse rounded bg-muted" />
        <div className="mt-4 h-4 w-1/2 animate-pulse rounded bg-muted" />
        <div className="mt-10 h-64 w-full animate-pulse rounded-3xl bg-muted" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container-px mx-auto max-w-3xl py-24 text-center">
        <h1 className="font-display text-3xl">Service not found</h1>
        <Link to="/services" className="mt-6 inline-flex text-sm text-primary underline">Back to services</Link>
      </div>
    );
  }

  return (
    <section className="container-px mx-auto max-w-5xl py-16 md:py-24">
      <Reveal>
        <button onClick={() => router.history.back()} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-accent">Our Services</p>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-6xl">
          {service.name}
        </h1>
        {service.short_description && (
          <p className="mt-4 max-w-3xl text-lg text-muted-foreground">{service.short_description}</p>
        )}

        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          {service.price && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2">
              <IndianRupee className="h-3.5 w-3.5 text-primary" /> {service.price}
            </span>
          )}
          {service.duration_minutes && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2">
              <Clock className="h-3.5 w-3.5 text-primary" /> {service.duration_minutes} minutes
            </span>
          )}
        </div>
      </Reveal>

      <div className="mt-12 grid gap-10 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          {service.image_url && (
            <img src={service.image_url} alt={service.name} className="mb-8 aspect-[16/9] w-full rounded-3xl object-cover" loading="lazy" />
          )}
          {service.description && (
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              {service.description.split("\n").filter(Boolean).map((p: string, i: number) => (
                <p key={i} className="text-base leading-relaxed text-muted-foreground">{p}</p>
              ))}
            </div>
          )}

          {Array.isArray(service.benefits) && service.benefits.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-2xl font-semibold">What's included</h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {service.benefits.map((b: string) => (
                  <li key={b} className="flex items-start gap-2.5 rounded-2xl border border-border bg-card p-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {b}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Reveal>

        <aside className="space-y-4">
          <div className="card-elegant p-6">
            <div className="grid h-12 w-12 place-items-center rounded-2xl" style={{ background: "var(--gradient-primary)" }}>
              <HeartPulse className="h-5 w-5 text-white" />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold">Book this service</h3>
            <p className="mt-1 text-sm text-muted-foreground">Consult with {SITE.doctor.name} ({SITE.doctor.experience}).</p>
            <Link to="/appointment" className="btn-hero btn-hero-hover mt-5 inline-flex w-full items-center justify-center gap-2 !text-sm !py-2.5">
              Book Appointment <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-3 text-center text-xs text-muted-foreground">Or call {SITE.phone}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
