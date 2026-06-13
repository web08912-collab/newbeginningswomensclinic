import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/settings";
import { RowSkeleton } from "@/components/site/Skeleton";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/faqs")({
  component: FaqsAdmin,
});

type F = {
  id: string;
  category: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
};

function FaqsAdmin() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<F> | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "faqs"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("faqs").select("*").order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as F[];
    },
  });

  const save = useMutation({
    mutationFn: async (f: Partial<F>) => {
      if (f.id) {
        const { error } = await (supabase as any).from("faqs").update(f).eq("id", f.id);
        if (error) throw error;
        await logActivity("update", "faq", f.id);
      } else {
        const { error } = await (supabase as any).from("faqs").insert(f);
        if (error) throw error;
        await logActivity("create", "faq");
      }
    },
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["admin", "faqs"] });
      qc.invalidateQueries({ queryKey: ["public", "faqs"] });
      setEditing(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("faqs").delete().eq("id", id);
      if (error) throw error;
      await logActivity("delete", "faq", id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "faqs"] });
      qc.invalidateQueries({ queryKey: ["public", "faqs"] });
    },
  });

  const groups = (data ?? []).reduce<Record<string, F[]>>((acc, f) => {
    (acc[f.category] ??= []).push(f);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">FAQs</h1>
          <p className="text-sm text-muted-foreground">Manage questions shown on your website.</p>
        </div>
        <button onClick={() => setEditing({ category: "General", question: "", answer: "", sort_order: 0, is_active: true })} className="btn-hero btn-hero-hover inline-flex items-center gap-2 !text-sm !py-2.5">
          <Plus className="h-4 w-4" /> New FAQ
        </button>
      </header>

      {isLoading ? (
        <div className="glass divide-y divide-border rounded-3xl p-4">{Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)}</div>
      ) : Object.keys(groups).length === 0 ? (
        <div className="glass rounded-3xl p-8 text-center text-sm text-muted-foreground">No FAQs yet.</div>
      ) : (
        Object.entries(groups).map(([cat, items]) => (
          <div key={cat} className="glass overflow-hidden rounded-3xl">
            <h3 className="border-b border-border px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{cat}</h3>
            <div className="divide-y divide-border">
              {items.map((f) => (
                <div key={f.id} className="flex items-start gap-3 p-4">
                  <div className="flex-1">
                    <p className="font-medium">{f.question}</p>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{f.answer}</p>
                  </div>
                  <button onClick={async () => { await (supabase as any).from("faqs").update({ is_active: !f.is_active }).eq("id", f.id); qc.invalidateQueries({ queryKey: ["admin", "faqs"] }); qc.invalidateQueries({ queryKey: ["public", "faqs"] }); }} className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted">
                    {f.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button onClick={() => setEditing(f)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => confirm("Delete?") && del.mutate(f.id)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4 backdrop-blur-sm" onClick={() => setEditing(null)}>
          <div className="glass w-full max-w-lg space-y-4 rounded-3xl p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-xl font-semibold">{editing.id ? "Edit" : "New"} FAQ</h2>
            <input className="input-base" placeholder="Category" value={editing.category ?? ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
            <input className="input-base" placeholder="Question" value={editing.question ?? ""} onChange={(e) => setEditing({ ...editing, question: e.target.value })} />
            <textarea className="input-base min-h-[120px]" placeholder="Answer" value={editing.answer ?? ""} onChange={(e) => setEditing({ ...editing, answer: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Sort order</span>
                <input type="number" className="input-base" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
              </label>
              <label className="flex items-end gap-2 text-sm"><input type="checkbox" checked={editing.is_active ?? true} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} /> Active</label>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setEditing(null)} className="rounded-full px-5 py-2 text-sm hover:bg-muted">Cancel</button>
              <button onClick={() => save.mutate(editing)} disabled={save.isPending || !editing.question || !editing.answer} className="btn-hero btn-hero-hover !text-sm !py-2.5 disabled:opacity-50">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
