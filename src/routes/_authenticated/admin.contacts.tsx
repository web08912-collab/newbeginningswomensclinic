import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Mail, Phone, Search, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/contacts")({
  component: ContactsPage,
});

function ContactsPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = !q.trim()
    ? data
    : data?.filter((r: any) => {
        const s = q.toLowerCase();
        return (
          r.full_name?.toLowerCase().includes(s) ||
          r.email?.toLowerCase().includes(s) ||
          r.subject?.toLowerCase().includes(s) ||
          r.message?.toLowerCase().includes(s)
        );
      });

  async function remove(id: string) {
    if (!confirm("Delete this message?")) return;
    const { error } = await supabase.from("contacts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin", "contacts"] });
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Messages</h1>
        <p className="text-sm text-muted-foreground">Enquiries received from the contact form.</p>
      </header>

      <label className="flex items-center gap-2 rounded-full glass px-4 py-2.5">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search messages…"
          className="w-full bg-transparent text-sm outline-none"
        />
      </label>

      <div className="glass overflow-hidden rounded-3xl">
        {isLoading ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Loading…</p>
        ) : !filtered || filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No messages yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((c: any) => (
              <article key={c.id} className="space-y-2 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{c.full_name}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1 hover:text-primary"><Mail className="h-3 w-3" />{c.email}</a>
                      {c.phone ? <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1 hover:text-primary"><Phone className="h-3 w-3" />{c.phone}</a> : null}
                      <span>{new Date(c.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <button onClick={() => remove(c.id)} className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {c.subject ? <p className="text-sm font-medium">{c.subject}</p> : null}
                <p className="whitespace-pre-wrap text-sm text-foreground/80">{c.message}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
