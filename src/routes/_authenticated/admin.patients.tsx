import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Phone, Mail, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RowSkeleton } from "@/components/site/Skeleton";

export const Route = createFileRoute("/_authenticated/admin/patients")({
  component: PatientsAdmin,
});

function PatientsAdmin() {
  const [q, setQ] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "patients"],
    queryFn: async () => {
      const { data } = await supabase
        .from("appointments")
        .select("*")
        .order("created_at", { ascending: false });
      const rows = data ?? [];
      const map = new Map<string, any>();
      rows.forEach((a: any) => {
        const key = a.phone || a.email || a.full_name;
        const existing = map.get(key);
        if (!existing) {
          map.set(key, {
            key,
            name: a.full_name,
            phone: a.phone,
            email: a.email,
            visits: 1,
            last_visit: a.preferred_date,
            last_status: a.status,
            services: new Set([a.service]),
            history: [a],
          });
        } else {
          existing.visits += 1;
          existing.services.add(a.service);
          existing.history.push(a);
        }
      });
      return Array.from(map.values()).map((p) => ({ ...p, services: Array.from(p.services) }));
    },
  });

  const filtered = (data ?? []).filter((p) => {
    if (!q.trim()) return true;
    const s = q.toLowerCase();
    return p.name?.toLowerCase().includes(s) || p.phone?.toLowerCase().includes(s) || p.email?.toLowerCase().includes(s);
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Patients</h1>
        <p className="text-sm text-muted-foreground">CRM view — built from appointment history.</p>
      </header>

      <label className="flex items-center gap-2 rounded-full glass px-4 py-2.5">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patients…" className="w-full bg-transparent text-sm outline-none" />
      </label>

      <div className="glass overflow-hidden rounded-3xl">
        {isLoading ? (
          <div className="divide-y divide-border p-4">{Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)}</div>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No patients yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((p) => (
              <div key={p.key} className="grid gap-2 p-4 sm:grid-cols-[1fr_auto]">
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {p.phone && <a href={`tel:${p.phone}`} className="inline-flex items-center gap-1 hover:text-primary"><Phone className="h-3 w-3" />{p.phone}</a>}
                    {p.email && <a href={`mailto:${p.email}`} className="inline-flex items-center gap-1 hover:text-primary"><Mail className="h-3 w-3" />{p.email}</a>}
                    <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />Last: {p.last_visit}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {p.services.map((s: string) => (
                      <span key={s} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl font-semibold">{p.visits}</p>
                  <p className="text-[10px] uppercase text-muted-foreground">visits</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
