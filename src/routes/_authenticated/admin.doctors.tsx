import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/settings";
import { RowSkeleton } from "@/components/site/Skeleton";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/doctors")({
  component: DoctorsAdmin,
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
  consultation_fee: string | null;
  email: string | null;
  phone: string | null;
  sort_order: number;
  is_active: boolean;
  is_featured: boolean;
};

const empty: Partial<Doctor> = {
  slug: "",
  name: "",
  specialization: "",
  qualifications: "",
  bio: "",
  image_url: "",
  experience_years: 0,
  languages: [],
  consultation_fee: "",
  email: "",
  phone: "",
  sort_order: 0,
  is_active: true,
  is_featured: false,
};

function DoctorsAdmin() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<Doctor> | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "doctors"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("doctors").select("*").order("sort_order");
      if (error) throw error;
      return (data ?? []) as Doctor[];
    },
  });

  const save = useMutation({
    mutationFn: async (d: Partial<Doctor>) => {
      const payload: any = { ...d };
      if (typeof payload.languages === "string") {
        payload.languages = (payload.languages as string).split(",").map((s) => s.trim()).filter(Boolean);
      }
      if (payload.id) {
        const { error } = await (supabase as any).from("doctors").update(payload).eq("id", payload.id);
        if (error) throw error;
        await logActivity("update", "doctor", payload.id, { name: payload.name });
      } else {
        const { error } = await (supabase as any).from("doctors").insert(payload);
        if (error) throw error;
        await logActivity("create", "doctor", undefined, { name: payload.name });
      }
    },
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["admin", "doctors"] });
      qc.invalidateQueries({ queryKey: ["public", "doctors"] });
      setEditing(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("doctors").delete().eq("id", id);
      if (error) throw error;
      await logActivity("delete", "doctor", id);
    },
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin", "doctors"] });
      qc.invalidateQueries({ queryKey: ["public", "doctors"] });
    },
  });

  const toggle = async (d: Doctor, field: "is_active" | "is_featured") => {
    await (supabase as any).from("doctors").update({ [field]: !d[field] }).eq("id", d.id);
    qc.invalidateQueries({ queryKey: ["admin", "doctors"] });
    qc.invalidateQueries({ queryKey: ["public", "doctors"] });
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">Doctors</h1>
          <p className="text-sm text-muted-foreground">Manage the doctors shown on your public site.</p>
        </div>
        <button onClick={() => setEditing({ ...empty })} className="btn-hero btn-hero-hover inline-flex items-center gap-2 !text-sm !py-2.5">
          <Plus className="h-4 w-4" /> New Doctor
        </button>
      </header>

      <div className="glass overflow-hidden rounded-3xl">
        {isLoading ? (
          <div className="divide-y divide-border p-4">{Array.from({ length: 3 }).map((_, i) => <RowSkeleton key={i} />)}</div>
        ) : !data || data.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No doctors yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {data.map((d) => (
              <div key={d.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
                  {d.image_url && <img src={d.image_url} alt={d.name} className="h-full w-full object-cover" />}
                </div>
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{d.name}</p>
                    {d.is_featured && <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />}
                    {!d.is_active && <span className="rounded bg-muted px-2 py-0.5 text-[10px] uppercase">Hidden</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">{d.specialization || "—"} · {d.experience_years || 0}+ yrs</p>
                </div>
                <button onClick={() => toggle(d, "is_active")} className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted">
                  {d.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button onClick={() => toggle(d, "is_featured")} className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted">
                  <Star className={`h-4 w-4 ${d.is_featured ? "fill-amber-500 text-amber-500" : ""}`} />
                </button>
                <button onClick={() => setEditing({ ...d })} className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted">
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => confirm("Delete this doctor?") && del.mutate(d.id)}
                  className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {editing && (
        <Editor value={editing} onChange={setEditing} onClose={() => setEditing(null)} onSave={() => save.mutate(editing)} saving={save.isPending} />
      )}
    </div>
  );
}

function Editor({ value, onChange, onClose, onSave, saving }: {
  value: Partial<Doctor>; onChange: (v: Partial<Doctor>) => void; onClose: () => void; onSave: () => void; saving: boolean;
}) {
  const update = (patch: Partial<Doctor>) => onChange({ ...value, ...patch });
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="glass max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-xl font-semibold">{value.id ? "Edit Doctor" : "New Doctor"}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Slug *">
            <input className="input-base" value={value.slug ?? ""} onChange={(e) => update({ slug: e.target.value })} placeholder="dr-name" />
          </Field>
          <Field label="Name *">
            <input className="input-base" value={value.name ?? ""} onChange={(e) => update({ name: e.target.value })} placeholder="Dr. Full Name" />
          </Field>
          <Field label="Specialization">
            <input className="input-base" value={value.specialization ?? ""} onChange={(e) => update({ specialization: e.target.value })} />
          </Field>
          <Field label="Qualifications">
            <input className="input-base" value={value.qualifications ?? ""} onChange={(e) => update({ qualifications: e.target.value })} placeholder="MBBS, DGO" />
          </Field>
          <Field label="Experience (years)">
            <input type="number" className="input-base" value={value.experience_years ?? 0} onChange={(e) => update({ experience_years: Number(e.target.value) })} />
          </Field>
          <Field label="Consultation fee">
            <input className="input-base" value={value.consultation_fee ?? ""} onChange={(e) => update({ consultation_fee: e.target.value })} placeholder="₹800" />
          </Field>
          <Field label="Email">
            <input type="email" className="input-base" value={value.email ?? ""} onChange={(e) => update({ email: e.target.value })} />
          </Field>
          <Field label="Phone">
            <input className="input-base" value={value.phone ?? ""} onChange={(e) => update({ phone: e.target.value })} />
          </Field>
          <Field label="Bio" className="sm:col-span-2">
            <textarea className="input-base min-h-[100px]" value={value.bio ?? ""} onChange={(e) => update({ bio: e.target.value })} />
          </Field>
          <Field label="Image URL" className="sm:col-span-2">
            <input className="input-base" value={value.image_url ?? ""} onChange={(e) => update({ image_url: e.target.value })} placeholder="https://…" />
          </Field>
          <Field label="Languages (comma separated)" className="sm:col-span-2">
            <input
              className="input-base"
              value={Array.isArray(value.languages) ? value.languages.join(", ") : (value.languages as any) ?? ""}
              onChange={(e) => update({ languages: e.target.value as any })}
              placeholder="English, Hindi, Kannada"
            />
          </Field>
          <Field label="Sort order">
            <input type="number" className="input-base" value={value.sort_order ?? 0} onChange={(e) => update({ sort_order: Number(e.target.value) })} />
          </Field>
          <div className="flex items-end gap-4">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={value.is_active ?? true} onChange={(e) => update({ is_active: e.target.checked })} /> Active</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={value.is_featured ?? false} onChange={(e) => update({ is_featured: e.target.checked })} /> Featured</label>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-full px-5 py-2 text-sm hover:bg-muted">Cancel</button>
          <button onClick={onSave} disabled={saving || !value.name || !value.slug} className="btn-hero btn-hero-hover !text-sm !py-2.5 disabled:opacity-50">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
