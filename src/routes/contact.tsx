import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { SITE } from "@/lib/site";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — New Beginnings Women's Clinic, Bangalore" },
      { name: "description", content: "Visit, call, email or message us. Located at SLV Plaza, Kundalahalli Gate, Bangalore — Mon–Sat, 8 AM – 8 PM." },
      { property: "og:title", content: "Contact New Beginnings Women's Clinic" },
      { property: "og:description", content: "Visit, call, email or message us in Bangalore." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: Contact,
});

const schema = z.object({
  full_name: z.string().trim().min(2, "Please share your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().max(20).optional(),
  subject: z.string().trim().max(150).optional(),
  message: z.string().trim().min(5, "Message is too short").max(1000),
});

function Contact() {
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("contacts").insert(parsed.data);
    setLoading(false);
    if (error) { toast.error("Could not send. Please try again."); return; }
    toast.success("Message sent — we'll be in touch soon.");
    (e.target as HTMLFormElement).reset();
  }

  return (
    <>
      <section className="container-px mx-auto max-w-7xl py-16 md:py-24">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Contact</p>
          <h1 className="mt-3 max-w-3xl font-display text-5xl font-semibold leading-tight md:text-6xl">
            We'd love to <span className="gradient-text">hear from you</span>.
          </h1>
        </Reveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-2">
          <Reveal>
            <div className="space-y-5">
              {[
                { icon: MapPin, label: "Visit", value: SITE.address },
                { icon: Phone, label: "Call", value: SITE.phone, href: `tel:${SITE.phoneRaw}` },
                { icon: Mail, label: "Email", value: SITE.email, href: `mailto:${SITE.email}` },
              ].map((c) => (
                <div key={c.label} className="card-elegant flex items-start gap-4 p-5">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl" style={{ background: "var(--gradient-primary)" }}>
                    <c.icon className="h-5 w-5 text-white" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{c.label}</div>
                    {c.href ? (
                      <a href={c.href} className="mt-1 block break-words font-medium hover:text-primary">{c.value}</a>
                    ) : (
                      <div className="mt-1 break-words font-medium">{c.value}</div>
                    )}
                  </div>
                </div>
              ))}

              <div className="card-elegant p-5">
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Clock className="h-4 w-4" /> Hours
                </div>
                {SITE.hours.map((h) => (
                  <div key={h.day} className="flex justify-between border-t border-border py-2 text-sm first:border-t-0">
                    <span>{h.day}</span><span className="text-muted-foreground">{h.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <form onSubmit={onSubmit} className="card-elegant space-y-4 p-7">
              <h2 className="font-display text-2xl font-semibold">Send us a message</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field name="full_name" label="Full name" required />
                <Field name="email" label="Email" type="email" required />
                <Field name="phone" label="Phone" />
                <Field name="subject" label="Subject" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Message *</label>
                <textarea name="message" required rows={5} className="mt-1.5 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30" />
              </div>
              <button disabled={loading} className="btn-hero btn-hero-hover w-full disabled:opacity-60">
                {loading ? "Sending…" : (<>Send message <Send className="h-4 w-4" /></>)}
              </button>
            </form>
          </Reveal>
        </div>
      </section>

      <section className="container-px mx-auto max-w-7xl pb-16">
        <Reveal>
          <div className="overflow-hidden rounded-[2rem] shadow-[var(--shadow-soft)]">
            <iframe
              title="Clinic location"
              src={`https://www.google.com/maps?q=${SITE.mapsQuery}&output=embed`}
              loading="lazy"
              className="h-[420px] w-full border-0"
            />
          </div>
        </Reveal>
      </section>
    </>
  );
}

function Field({ name, label, type = "text", required }: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}{required && " *"}</label>
      <input name={name} type={type} required={required} className="mt-1.5 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30" />
    </div>
  );
}
