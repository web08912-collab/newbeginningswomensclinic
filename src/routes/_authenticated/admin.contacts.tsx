import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Mail, Phone, Search, Trash2, Archive, ArchiveRestore, Star, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/settings";
import { RowSkeleton } from "@/components/site/Skeleton";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/contacts")({
  component: ContactsPage,
});

function ContactsPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [view, setView] = useState<"inbox" | "important" | "archived">("inbox");
  const [active, setActive] = useState<any | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "contacts", view, q],
    queryFn: async () => {
      let query = (supabase as any).from("contacts").select("*").order("created_at", { ascending: false });
      if (view === "inbox") query = query.eq("archived", false);
      if (view === "important") query = query.eq("is_important", true).eq("archived", false);
      if (view === "archived") query = query.eq("archived", true);
      const { data, error } = await query;
      if (error) throw error;
      const rows = data ?? [];
      if (!q.trim()) return rows;
      const s = q.toLowerCase();
      return rows.filter((r: any) => r.full_name?.toLowerCase().includes(s) || r.email?.toLowerCase().includes(s) || r.message?.toLowerCase().includes(s));
    },
  });

  async function toggle(id: string, field: "archived" | "is_important", value: boolean) {
    await (supabase as any).from("contacts").update({ [field]: value }).eq("id", id);
    await logActivity(value ? `set_${field}` : `unset_${field}`, "contact", id);
    qc.invalidateQueries({ queryKey: ["admin", "contacts"] });
  }

  async function remove(id: string) {
    if (!confirm("Delete this message?")) return;
    const { error } = await supabase.from("contacts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await logActivity("delete", "contact", id);
    qc.invalidateQueries({ queryKey: ["admin", "contacts"] });
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Messages</h1>
        <p className="text-sm text-muted-foreground">Patient enquiries from the contact form.</p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex flex-1 min-w-[200px] items-center gap-2 rounded-full glass px-4 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search messages…" className="w-full bg-transparent text-sm outline-none" />
        </label>
        <div className="flex gap-1 rounded-full bg-muted p-1">
          {(["inbox", "important", "archived"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition ${view === v ? "bg-background shadow-sm" : "text-muted-foreground"}`}>{v}</button>
          ))}
        </div>
      </div>

      <div className="glass overflow-hidden rounded-3xl">
        {isLoading ? (
          <div className="divide-y divide-border p-4">{Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)}</div>
        ) : !data || data.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No messages.</p>
        ) : (
          <div className="divide-y divide-border">
            {data.map((c: any) => (
              <div key={c.id} className="grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="cursor-pointer" onClick={() => setActive(c)}>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{c.full_name}</p>
                    {c.is_important && <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />}
                    {c.subject && <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{c.subject}</span>}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <a href={`mailto:${c.email}`} onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 hover:text-primary"><Mail className="h-3 w-3" />{c.email}</a>
                    {c.phone && <a href={`tel:${c.phone}`} onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 hover:text-primary"><Phone className="h-3 w-3" />{c.phone}</a>}
                    <span>{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-1 text-sm text-foreground/80 line-clamp-2">{c.message}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggle(c.id, "is_important", !c.is_important)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted" title="Star">
                    <Star className={`h-4 w-4 ${c.is_important ? "fill-amber-500 text-amber-500" : ""}`} />
                  </button>
                  <button onClick={() => toggle(c.id, "archived", !c.archived)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted" title={c.archived ? "Restore" : "Archive"}>
                    {c.archived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                  </button>
                  <a href={`mailto:${c.email}?subject=Re: ${c.subject || "Your enquiry"}`} className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">Reply</a>
                  <button onClick={() => remove(c.id)} className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {active && <MessageDrawer msg={active} onClose={() => setActive(null)} />}
    </div>
  );
}

function MessageDrawer({ msg, onClose }: { msg: any; onClose: () => void }) {
  const qc = useQueryClient();
  const [notes, setNotes] = useState(msg.internal_notes ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const { error } = await (supabase as any).from("contacts").update({ internal_notes: notes }).eq("id", msg.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    await logActivity("update_notes", "contact", msg.id);
    qc.invalidateQueries({ queryKey: ["admin", "contacts"] });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-foreground/40 backdrop-blur-sm" onClick={onClose}>
      <div className="glass h-full w-full max-w-md overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">{msg.full_name}</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          <p><Mail className="mr-1 inline h-3 w-3" />{msg.email}</p>
          {msg.phone && <p><Phone className="mr-1 inline h-3 w-3" />{msg.phone}</p>}
          {msg.subject && <p>Subject: <span className="font-medium text-foreground">{msg.subject}</span></p>}
          <p>{new Date(msg.created_at).toLocaleString()}</p>
        </div>
        <div className="mt-5 rounded-2xl bg-muted/50 p-4 text-sm whitespace-pre-wrap">{msg.message}</div>

        <label className="mt-6 block">
          <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Internal notes</span>
          <textarea className="input-base min-h-[120px]" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
        <div className="mt-6 flex justify-end gap-3">
          <a href={`mailto:${msg.email}?subject=Re: ${msg.subject || "Your enquiry"}`} className="rounded-full px-5 py-2 text-sm hover:bg-muted">Reply via email</a>
          <button onClick={save} disabled={saving} className="btn-hero btn-hero-hover !text-sm !py-2.5 disabled:opacity-50">{saving ? "Saving…" : "Save"}</button>
        </div>
      </div>
    </div>
  );
}
