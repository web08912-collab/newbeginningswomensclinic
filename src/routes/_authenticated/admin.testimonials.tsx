import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Trash2, Star, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/settings";
import { RowSkeleton } from "@/components/site/Skeleton";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/testimonials")({
  component: TestimonialsAdmin,
});

type T = {
  id: string;
  patient_name: string;
  patient_location: string | null;
  content: string;
  rating: number;
  image_url: string | null;
  is_approved: boolean;
  is_featured: boolean;
  sort_order: number;
};

function TestimonialsAdmin() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<T> | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "testimonials"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("testimonials")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as T[];
    },
  });

  const save = useMutation({
    mutationFn: async (t: Partial<T>) => {
      if (t.id) {
        const { error } = await (supabase as any).from("testimonials").update(t).eq("id", t.id);
        if (error) throw error;
        await logActivity("update", "testimonial", t.id);
      } else {
        const { error } = await (supabase as any).from("testimonials").insert(t);
        if (error) throw error;
        await logActivity("create", "testimonial");
      }
    },
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["admin", "testimonials"] });
      qc.invalidateQueries({ queryKey: ["public", "testimonials"] });
      setEditing(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("testimonials").delete().eq("id", id);
      if (error) throw error;
      await logActivity("delete", "testimonial", id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "testimonials"] });
      qc.invalidateQueries({ queryKey: ["public", "testimonials"] });
    },
  });

  const toggle = async (t: T, field: "is_approved" | "is_featured") => {
    await (supabase as any).from("testimonials").update({ [field]: !t[field] }).eq("id", t.id);
    qc.invalidateQueries({ queryKey: ["admin", "testimonials"] });
    qc.invalidateQueries({ queryKey: ["public", "testimonials"] });
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">Testimonials</h1>
          <p className="text-sm text-muted-foreground">Approve and feature patient reviews.</p>
        </div>
        <button onClick={() => setEditing({ patient_name: "", content: "", rating: 5, sort_order: 0, is_approved: true })} className="btn-hero btn-hero-hover inline-flex items-center gap-2 !text-sm !py-2.5">
          <Plus className="h-4 w-4" /> New Testimonial
        </button>
      </header>

      <div className="glass overflow-hidden rounded-3xl">
        {isLoading ? (
          <div className="divide-y divide-border p-4">{Array.from({ length: 3 }).map((_, i) => <RowSkeleton key={i} />)}</div>
        ) : !data || data.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No testimonials yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {data.map((t) => (
              <div key={t.id} className="grid gap-3 p-4 sm:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{t.patient_name}</p>
                    {t.patient_location && <span className="text-xs text-muted-foreground">· {t.patient_location}</span>}
                    <div className="flex">{Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-amber-500 text-amber-500" />)}</div>
                    {!t.is_approved && <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] uppercase text-amber-600">Pending</span>}
                    {t.is_featured && <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] uppercase text-primary">Featured</span>}
                  </div>
                  <p className="mt-1 text-sm text-foreground/80 line-clamp-2">{t.content}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggle(t, "is_approved")} className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted" title={t.is_approved ? "Unapprove" : "Approve"}>
                    {t.is_approved ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                  </button>
                  <button onClick={() => toggle(t, "is_featured")} className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted" title="Feature">
                    <Star className={`h-4 w-4 ${t.is_featured ? "fill-amber-500 text-amber-500" : ""}`} />
                  </button>
                  <button onClick={() => setEditing(t)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => confirm("Delete?") && del.mutate(t.id)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4 backdrop-blur-sm" onClick={() => setEditing(null)}>
          <div className="glass w-full max-w-lg space-y-4 rounded-3xl p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-xl font-semibold">{editing.id ? "Edit" : "New"} Testimonial</h2>
            <input className="input-base" placeholder="Patient name" value={editing.patient_name ?? ""} onChange={(e) => setEditing({ ...editing, patient_name: e.target.value })} />
            <input className="input-base" placeholder="Location (optional)" value={editing.patient_location ?? ""} onChange={(e) => setEditing({ ...editing, patient_location: e.target.value })} />
            <textarea className="input-base min-h-[120px]" placeholder="Review content" value={editing.content ?? ""} onChange={(e) => setEditing({ ...editing, content: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Rating</span>
                <select className="input-base" value={editing.rating ?? 5} onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })}>
                  {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Sort order</span>
                <input type="number" className="input-base" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
              </label>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.is_approved ?? true} onChange={(e) => setEditing({ ...editing, is_approved: e.target.checked })} /> Approved</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.is_featured ?? false} onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked })} /> Featured</label>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setEditing(null)} className="rounded-full px-5 py-2 text-sm hover:bg-muted">Cancel</button>
              <button onClick={() => save.mutate(editing)} disabled={save.isPending || !editing.patient_name || !editing.content} className="btn-hero btn-hero-hover !text-sm !py-2.5 disabled:opacity-50">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
