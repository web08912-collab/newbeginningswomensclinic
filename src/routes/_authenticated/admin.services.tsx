import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/settings";
import { RowSkeleton } from "@/components/site/Skeleton";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/services")({
  component: ServicesAdmin,
});

type Service = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  price: string | null;
  duration_minutes: number | null;
  image_url: string | null;
  benefits: string[];
  seo_title: string | null;
  seo_description: string | null;
  sort_order: number;
  is_active: boolean;
  is_featured: boolean;
};

const empty: Partial<Service> = {
  slug: "",
  name: "",
  short_description: "",
  description: "",
  price: "",
  duration_minutes: 30,
  image_url: "",
  benefits: [],
  seo_title: "",
  seo_description: "",
  sort_order: 0,
  is_active: true,
  is_featured: false,
};

function ServicesAdmin() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<Service> | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "services"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("services")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Service[];
    },
  });

  const save = useMutation({
    mutationFn: async (s: Partial<Service>) => {
      const payload: any = { ...s };
      if (typeof payload.benefits === "string") {
        payload.benefits = (payload.benefits as string).split("\n").map((b) => b.trim()).filter(Boolean);
      }
      if (payload.id) {
        const { error } = await (supabase as any).from("services").update(payload).eq("id", payload.id);
        if (error) throw error;
        await logActivity("update", "service", payload.id, { name: payload.name });
      } else {
        const { error } = await (supabase as any).from("services").insert(payload);
        if (error) throw error;
        await logActivity("create", "service", undefined, { name: payload.name });
      }
    },
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["admin", "services"] });
      qc.invalidateQueries({ queryKey: ["public", "services"] });
      setEditing(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("services").delete().eq("id", id);
      if (error) throw error;
      await logActivity("delete", "service", id);
    },
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin", "services"] });
      qc.invalidateQueries({ queryKey: ["public", "services"] });
    },
  });

  const toggle = async (s: Service, field: "is_active" | "is_featured") => {
    await (supabase as any).from("services").update({ [field]: !s[field] }).eq("id", s.id);
    qc.invalidateQueries({ queryKey: ["admin", "services"] });
    qc.invalidateQueries({ queryKey: ["public", "services"] });
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">Services</h1>
          <p className="text-sm text-muted-foreground">Manage services shown on your public website.</p>
        </div>
        <button
          onClick={() => setEditing({ ...empty })}
          className="btn-hero btn-hero-hover inline-flex items-center gap-2 !text-sm !py-2.5"
        >
          <Plus className="h-4 w-4" /> New Service
        </button>
      </header>

      <div className="glass overflow-hidden rounded-3xl">
        {isLoading ? (
          <div className="divide-y divide-border p-4">{Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)}</div>
        ) : !data || data.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No services yet. Add your first service.</p>
        ) : (
          <div className="divide-y divide-border">
            {data.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{s.name}</p>
                    {s.is_featured && <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />}
                    {!s.is_active && <span className="rounded bg-muted px-2 py-0.5 text-[10px] uppercase">Hidden</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">/{s.slug} · {s.price || "—"} · {s.duration_minutes ?? "—"} min</p>
                </div>
                <button onClick={() => toggle(s, "is_active")} className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted" title="Toggle active">
                  {s.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button onClick={() => toggle(s, "is_featured")} className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted" title="Toggle featured">
                  <Star className={`h-4 w-4 ${s.is_featured ? "fill-amber-500 text-amber-500" : ""}`} />
                </button>
                <button onClick={() => setEditing({ ...s, benefits: s.benefits as any })} className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted">
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => confirm("Delete this service?") && del.mutate(s.id)}
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
        <ServiceEditor
          value={editing}
          onChange={setEditing}
          onClose={() => setEditing(null)}
          onSave={() => save.mutate(editing)}
          saving={save.isPending}
        />
      )}
    </div>
  );
}

function ServiceEditor({
  value,
  onChange,
  onClose,
  onSave,
  saving,
}: {
  value: Partial<Service>;
  onChange: (v: Partial<Service>) => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  const update = (patch: Partial<Service>) => onChange({ ...value, ...patch });
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="glass max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-xl font-semibold">{value.id ? "Edit Service" : "New Service"}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Slug *">
            <input className="input-base" value={value.slug ?? ""} onChange={(e) => update({ slug: e.target.value })} placeholder="pregnancy-care" />
          </Field>
          <Field label="Name *">
            <input className="input-base" value={value.name ?? ""} onChange={(e) => update({ name: e.target.value })} />
          </Field>
          <Field label="Price">
            <input className="input-base" value={value.price ?? ""} onChange={(e) => update({ price: e.target.value })} placeholder="From ₹800" />
          </Field>
          <Field label="Duration (min)">
            <input type="number" className="input-base" value={value.duration_minutes ?? ""} onChange={(e) => update({ duration_minutes: Number(e.target.value) })} />
          </Field>
          <Field label="Short description" className="sm:col-span-2">
            <textarea className="input-base min-h-[60px]" value={value.short_description ?? ""} onChange={(e) => update({ short_description: e.target.value })} />
          </Field>
          <Field label="Full description" className="sm:col-span-2">
            <textarea className="input-base min-h-[100px]" value={value.description ?? ""} onChange={(e) => update({ description: e.target.value })} />
          </Field>
          <Field label="Benefits (one per line)" className="sm:col-span-2">
            <textarea
              className="input-base min-h-[80px]"
              value={Array.isArray(value.benefits) ? value.benefits.join("\n") : (value.benefits as any)}
              onChange={(e) => update({ benefits: e.target.value as any })}
            />
          </Field>
          <Field label="Image URL" className="sm:col-span-2">
            <input className="input-base" value={value.image_url ?? ""} onChange={(e) => update({ image_url: e.target.value })} />
          </Field>
          <Field label="Sort order">
            <input type="number" className="input-base" value={value.sort_order ?? 0} onChange={(e) => update({ sort_order: Number(e.target.value) })} />
          </Field>
          <div className="flex items-end gap-4">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={value.is_active ?? true} onChange={(e) => update({ is_active: e.target.checked })} /> Active</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={value.is_featured ?? false} onChange={(e) => update({ is_featured: e.target.checked })} /> Featured</label>
          </div>
          <Field label="SEO Title" className="sm:col-span-2">
            <input className="input-base" value={value.seo_title ?? ""} onChange={(e) => update({ seo_title: e.target.value })} />
          </Field>
          <Field label="SEO Description" className="sm:col-span-2">
            <textarea className="input-base min-h-[60px]" value={value.seo_description ?? ""} onChange={(e) => update({ seo_description: e.target.value })} />
          </Field>
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
