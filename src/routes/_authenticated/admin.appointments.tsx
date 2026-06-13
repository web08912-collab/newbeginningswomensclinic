import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Phone, Mail, Calendar, Search, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/appointments")({
  component: AppointmentsPage,
});

const STATUSES = ["pending", "confirmed", "completed", "cancelled"] as const;

function AppointmentsPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "appointments", status, q],
    queryFn: async () => {
      let query = supabase.from("appointments").select("*").order("created_at", { ascending: false });
      if (status !== "all") query = query.eq("status", status);
      const { data, error } = await query;
      if (error) throw error;
      const rows = data ?? [];
      if (!q.trim()) return rows;
      const s = q.trim().toLowerCase();
      return rows.filter(
        (r: any) =>
          r.full_name?.toLowerCase().includes(s) ||
          r.phone?.toLowerCase().includes(s) ||
          r.email?.toLowerCase().includes(s) ||
          r.service?.toLowerCase().includes(s),
      );
    },
  });

  async function updateStatus(id: string, newStatus: string) {
    const { error } = await supabase.from("appointments").update({ status: newStatus }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    qc.invalidateQueries({ queryKey: ["admin"] });
  }

  async function remove(id: string) {
    if (!confirm("Delete this appointment?")) return;
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin"] });
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Appointments</h1>
        <p className="text-sm text-muted-foreground">Manage booking requests from your patients.</p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex flex-1 min-w-[200px] items-center gap-2 rounded-full glass px-4 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, phone, email…"
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>
        <div className="flex flex-wrap gap-1 rounded-full bg-muted p-1">
          {["all", ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition ${
                status === s ? "bg-background shadow-sm" : "text-muted-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="glass overflow-hidden rounded-3xl">
        {isLoading ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Loading…</p>
        ) : !data || data.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No appointments found.</p>
        ) : (
          <div className="divide-y divide-border">
            {data.map((a: any) => (
              <div key={a.id} className="grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{a.full_name}</p>
                    {a.age ? <span className="text-xs text-muted-foreground">· {a.age} yrs</span> : null}
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{a.service}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{a.preferred_date} · {a.preferred_time}</span>
                    <a href={`tel:${a.phone}`} className="inline-flex items-center gap-1 hover:text-primary"><Phone className="h-3 w-3" />{a.phone}</a>
                    {a.email ? <a href={`mailto:${a.email}`} className="inline-flex items-center gap-1 hover:text-primary"><Mail className="h-3 w-3" />{a.email}</a> : null}
                  </div>
                  {a.concern ? <p className="text-xs text-foreground/70 line-clamp-2">{a.concern}</p> : null}
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={a.status}
                    onChange={(e) => updateStatus(a.id, e.target.value)}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-xs capitalize focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <button onClick={() => remove(a.id)} className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
