import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CalendarCheck2, MessagesSquare, Clock4, CircleCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const { data } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const [apts, pending, today, msgs] = await Promise.all([
        supabase.from("appointments").select("*", { count: "exact", head: true }),
        supabase.from("appointments").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase
          .from("appointments")
          .select("*", { count: "exact", head: true })
          .eq("preferred_date", new Date().toISOString().slice(0, 10)),
        supabase.from("contacts").select("*", { count: "exact", head: true }),
      ]);
      return {
        total: apts.count ?? 0,
        pending: pending.count ?? 0,
        today: today.count ?? 0,
        messages: msgs.count ?? 0,
      };
    },
  });

  const { data: recent } = useQuery({
    queryKey: ["admin", "recent-appointments"],
    queryFn: async () => {
      const { data } = await supabase
        .from("appointments")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  const stats = [
    { label: "Total Appointments", value: data?.total ?? 0, icon: CalendarCheck2, accent: "text-primary" },
    { label: "Pending", value: data?.pending ?? 0, icon: Clock4, accent: "text-amber-500" },
    { label: "Today", value: data?.today ?? 0, icon: CircleCheck, accent: "text-emerald-500" },
    { label: "Messages", value: data?.messages ?? 0, icon: MessagesSquare, accent: "text-violet-500" },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Live overview of bookings and enquiries.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-2xl p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</span>
              <s.icon className={`h-5 w-5 ${s.accent}`} />
            </div>
            <div className="mt-3 font-display text-3xl font-semibold">{s.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="glass rounded-3xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Recent Appointments</h2>
          <Link to="/admin/appointments" className="text-xs text-primary hover:underline">
            View all →
          </Link>
        </div>
        {recent && recent.length > 0 ? (
          <div className="divide-y divide-border">
            {recent.map((a: any) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium">{a.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.service} · {a.preferred_date} {a.preferred_time}
                  </p>
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-xs capitalize">{a.status}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">No appointments yet.</p>
        )}
      </div>
    </div>
  );
}
