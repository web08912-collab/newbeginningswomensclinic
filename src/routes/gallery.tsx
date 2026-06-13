import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Reveal } from "@/components/site/Reveal";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import hero from "@/assets/hero.jpg";
import clinic1 from "@/assets/clinic-1.jpg";
import clinic2 from "@/assets/clinic-2.jpg";
import wellness from "@/assets/service-wellness.jpg";
import pregnancy from "@/assets/service-pregnancy.jpg";
import doctor from "@/assets/doctor.jpg";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — New Beginnings Women's Clinic" },
      { name: "description", content: "A look inside our clinic, facilities, and patient awareness programs at New Beginnings Women's Clinic, Bangalore." },
      { property: "og:title", content: "Gallery — New Beginnings" },
      { property: "og:description", content: "Inside our clinic and facilities." },
      { property: "og:url", content: "/gallery" },
    ],
    links: [{ rel: "canonical", href: "/gallery" }],
  }),
  component: Gallery,
});

const items = [
  { src: hero, cat: "Clinic", alt: "Clinic reception", ratio: "aspect-[16/10]" },
  { src: clinic1, cat: "Facilities", alt: "Reception area", ratio: "aspect-square" },
  { src: doctor, cat: "Doctor", alt: "Dr. Kavitha", ratio: "aspect-[3/4]" },
  { src: clinic2, cat: "Facilities", alt: "Examination room", ratio: "aspect-[4/3]" },
  { src: wellness, cat: "Awareness", alt: "Wellness", ratio: "aspect-square" },
  { src: pregnancy, cat: "Events", alt: "Maternity care", ratio: "aspect-[4/5]" },
];

const cats = ["All", "Clinic", "Facilities", "Doctor", "Events", "Awareness"] as const;

function Gallery() {
  const [filter, setFilter] = useState<typeof cats[number]>("All");
  const [open, setOpen] = useState<string | null>(null);
  const visible = items.filter((i) => filter === "All" || i.cat === filter);

  return (
    <>
      <section className="container-px mx-auto max-w-7xl py-16 md:py-24">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Gallery</p>
          <h1 className="mt-3 max-w-3xl font-display text-5xl font-semibold leading-tight md:text-6xl">
            A look <span className="gradient-text">inside our world</span>.
          </h1>
        </Reveal>

        <div className="mt-10 flex flex-wrap gap-2">
          {cats.map((c) => (
            <button key={c} onClick={() => setFilter(c)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${filter === c ? "text-white shadow-[var(--shadow-soft)]" : "bg-muted text-muted-foreground hover:text-foreground"}`}
              style={filter === c ? { background: "var(--gradient-cta)" } : undefined}>
              {c}
            </button>
          ))}
        </div>

        <motion.div layout className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
          {visible.map((it, i) => (
            <motion.button
              key={it.alt}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              onClick={() => setOpen(it.src)}
              className={`group relative overflow-hidden rounded-2xl ${it.ratio}`}
            >
              <img src={it.src} alt={it.alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground opacity-0 transition-opacity group-hover:opacity-100">{it.cat}</span>
            </motion.button>
          ))}
        </motion.div>
      </section>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] grid place-items-center bg-black/85 p-4 backdrop-blur-sm"
            onClick={() => setOpen(null)}
          >
            <button aria-label="Close" className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/20"><X /></button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              src={open} alt="" className="max-h-[88vh] max-w-[94vw] rounded-2xl object-contain shadow-[var(--shadow-elegant)]" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
