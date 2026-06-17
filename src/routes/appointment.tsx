import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, ArrowRight, Calendar, Clock } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { SITE, SERVICES } from "@/lib/site";
import { supabase } from "@/integrations/supabase/client";
import { Shimmer } from "@/components/site/Skeleton";
import { toast } from "sonner";
import { z } from "zod";
import { motion } from "framer-motion";

export const Route = createFileRoute("/appointment")({
  head: () => ({
    meta: [
      { title: "Book Appointment — New Beginnings Women's Clinic" },
      { name: "description", content: "Book a confidential gynecology or wellness consultation with Dr. Kavitha V Reddy. Online booking, fast response." },
      { property: "og:title", content: "Book Appointment — New Beginnings" },
      { property: "og:description", content: "Book a confidential consultation in Bangalore." },
      { property: "og:url", content: "/appointment" },
    ],
    links: [{ rel: "canonical", href: "/appointment" }],
  }),
  component: Appointment,
});

const schema = z.object({
  full_name: z.string().trim().min(2, "Please share your name").max(100),
  age: z.coerce.number().int().min(1).max(120).optional(),
  phone: z.string().trim().min(7, "Enter a valid phone").max(20),
  email: z.string().trim().email("Enter a valid email").max(255).optional().or(z.literal("")),
  service: z.string().min(1, "Please pick a service"),
  doctor_id: z.string().optional().or(z.literal("")),
  preferred_date: z.string().min(1, "Pick a date"),
  preferred_time: z.string().min(1, "Pick a time"),
  concern: z.string().trim().max(300).optional(),
  notes: z.string().trim().max(500).optional(),
});

const slots = ["08:00", "09:30", "11:00", "12:30", "15:00", "16:30", "18:00", "19:30"];

function Appointment() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const { data: doctors } = useQuery({
    queryKey: ["public", "doctors"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("doctors")
        .select("id,name,specialization")
        .eq("is_active", true)
        .order("sort_order");
      return (data ?? []) as Array<{ id: string; name: string; specialization: string | null }>;
    },
  });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setLoading(true);
    const payload: any = { ...parsed.data, email: parsed.data.email || null };
    if (!payload.doctor_id) delete payload.doctor_id;
    const { error } = await supabase.from("appointments").insert(payload as never);
    setLoading(false);
    if (error) { toast.error("Could not book. Please try again."); return; }
    setDone(true);
    toast.success("Appointment requested — we'll confirm shortly.");
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <section className="container-px mx-auto max-w-5xl py-16 md:py-24">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Book Appointment</p>
        <h1 className="mt-3 font-display text-5xl font-semibold leading-tight md:text-6xl">
          Begin your <span className="gradient-text">consultation</span>.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
          Share a few details and our team will confirm your slot within a few hours.
          For urgent matters, call us at <a href={`tel:${SITE.phoneRaw}`} className="underline-offset-4 hover:underline">{SITE.phone}</a>.
        </p>
      </Reveal>

      {done ? (
        <Reveal>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}
            className="mt-12 card-elegant p-10 text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-accent" />
            <h2 className="mt-5 font-display text-3xl font-semibold">Request received</h2>
            <p className="mt-3 text-muted-foreground">Thank you. We'll call or message you to confirm your appointment shortly.</p>
            <a href="/" className="mt-7 inline-flex btn-ghost-soft">Back to home <ArrowRight className="h-4 w-4" /></a>
          </motion.div>
        </Reveal>
      ) : (
        <Reveal>
          <form onSubmit={onSubmit} className="mt-12 card-elegant space-y-6 p-7 md:p-10">
            <div className="grid gap-5 sm:grid-cols-2">
              <Input name="full_name" label="Full name" required />
              <Input name="age" label="Age" type="number" />
              <Input name="phone" label="Phone" type="tel" required />
              <Input name="email" label="Email" type="email" />
            </div>

            <div>
              <Label>Service *</Label>
              <select name="service" required defaultValue=""
                className="mt-1.5 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30">
                <option value="" disabled>Select a service</option>
                {SERVICES.map((s) => <option key={s.slug} value={s.title}>{s.title}</option>)}
                <option value="General consultation">General consultation</option>
              </select>
            </div>

            {doctors && doctors.length > 0 && (
              <div>
                <Label>Preferred doctor (optional)</Label>
                <select name="doctor_id" defaultValue=""
                  className="mt-1.5 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30">
                  <option value="">No preference</option>
                  {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}{d.specialization ? ` — ${d.specialization}` : ""}</option>)}
                </select>
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label><Calendar className="mr-1 inline h-4 w-4" /> Preferred date *</Label>
                <input name="preferred_date" type="date" required min={today}
                  className="mt-1.5 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30" />
              </div>
              <div>
                <Label><Clock className="mr-1 inline h-4 w-4" /> Preferred time *</Label>
                <select name="preferred_time" required defaultValue=""
                  className="mt-1.5 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30">
                  <option value="" disabled>Select a time</option>
                  {slots.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <Label>Reason for visit (optional)</Label>
              <input name="concern" maxLength={300} className="mt-1.5 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30" />
            </div>

            <div>
              <Label>Additional notes (optional)</Label>
              <textarea name="notes" rows={4} maxLength={500} className="mt-1.5 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30" />
            </div>

            <button disabled={loading} className="btn-hero btn-hero-hover w-full disabled:opacity-60">
              {loading ? "Booking…" : (<>Request appointment <ArrowRight className="h-4 w-4" /></>)}
            </button>
            <p className="text-center text-xs text-muted-foreground">By submitting, you agree to be contacted about your appointment.</p>
          </form>
        </Reveal>
      )}
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{children}</label>;
}
function Input({ name, label, type = "text", required }: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <div>
      <Label>{label}{required && " *"}</Label>
      <input name={name} type={type} required={required}
        className="mt-1.5 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30" />
    </div>
  );
}
