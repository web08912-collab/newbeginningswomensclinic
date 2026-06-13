import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { fetchAllSettings, upsertSetting, logActivity } from "@/lib/settings";
import { toast } from "sonner";
import { Save } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsAdmin,
});

function SettingsAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin", "settings"], queryFn: fetchAllSettings });

  const [hero, setHero] = useState<any>({});
  const [doctor, setDoctor] = useState<any>({});
  const [contact, setContact] = useState<any>({});
  const [cta, setCta] = useState<any>({});

  useEffect(() => {
    if (data) {
      setHero(data.hero ?? {});
      setDoctor(data.doctor ?? {});
      setContact(data.contact ?? {});
      setCta(data.cta ?? {});
    }
  }, [data]);

  const save = useMutation({
    mutationFn: async (entries: Array<[string, any]>) => {
      for (const [k, v] of entries) await upsertSetting(k, v);
      await logActivity("update", "site_settings", undefined, { keys: entries.map((e) => e[0]) });
    },
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["admin", "settings"] });
      qc.invalidateQueries({ queryKey: ["public", "settings"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Site Settings</h1>
        <p className="text-sm text-muted-foreground">Edit content shown across the public website.</p>
      </header>

      <Section title="Hero Section" onSave={() => save.mutate([["hero", hero]])} saving={save.isPending}>
        <Input label="Headline" value={hero.headline} onChange={(v) => setHero({ ...hero, headline: v })} />
        <Input label="Subheadline" value={hero.subheadline} onChange={(v) => setHero({ ...hero, subheadline: v })} textarea />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Primary CTA text" value={hero.cta_primary} onChange={(v) => setHero({ ...hero, cta_primary: v })} />
          <Input label="Secondary CTA text" value={hero.cta_secondary} onChange={(v) => setHero({ ...hero, cta_secondary: v })} />
        </div>
      </Section>

      <Section title="Doctor Profile" onSave={() => save.mutate([["doctor", doctor]])} saving={save.isPending}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Name" value={doctor.name} onChange={(v) => setDoctor({ ...doctor, name: v })} />
          <Input label="Designation" value={doctor.designation} onChange={(v) => setDoctor({ ...doctor, designation: v })} />
          <Input label="Specialization" value={doctor.specialization} onChange={(v) => setDoctor({ ...doctor, specialization: v })} />
          <Input label="Experience" value={doctor.experience} onChange={(v) => setDoctor({ ...doctor, experience: v })} />
        </div>
        <Input label="Bio" value={doctor.bio} onChange={(v) => setDoctor({ ...doctor, bio: v })} textarea />
      </Section>

      <Section title="Clinic Hours" onSave={() => save.mutate([["contact", contact]])} saving={save.isPending}>
        <Input label="Opening hours" value={contact.hours} onChange={(v) => setContact({ ...contact, hours: v })} />
        <Input label="Emergency / extra info" value={contact.emergency} onChange={(v) => setContact({ ...contact, emergency: v })} />
      </Section>

      <Section title="Call to Action Banner" onSave={() => save.mutate([["cta", cta]])} saving={save.isPending}>
        <Input label="Headline" value={cta.headline} onChange={(v) => setCta({ ...cta, headline: v })} />
        <Input label="Subtext" value={cta.subtext} onChange={(v) => setCta({ ...cta, subtext: v })} />
        <Input label="Button text" value={cta.button} onChange={(v) => setCta({ ...cta, button: v })} />
      </Section>
    </div>
  );
}

function Section({ title, children, onSave, saving }: { title: string; children: React.ReactNode; onSave: () => void; saving: boolean }) {
  return (
    <section className="glass space-y-4 rounded-3xl p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        <button onClick={onSave} disabled={saving} className="btn-hero btn-hero-hover inline-flex items-center gap-2 !text-sm !py-2 disabled:opacity-50">
          <Save className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save"}
        </button>
      </div>
      {children}
    </section>
  );
}

function Input({ label, value, onChange, textarea }: { label: string; value?: string; onChange: (v: string) => void; textarea?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {textarea ? (
        <textarea className="input-base min-h-[80px]" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className="input-base" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}
