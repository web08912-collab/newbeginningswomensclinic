import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  CalendarCheck2, MessagesSquare, Clock4, CircleCheck, Users, Star,
  TrendingUp, AlertCircle, CheckCircle2, XCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CardSkeleton, RowSkeleton, Shimmer } from "@/components/site/Skeleton";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
      const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

      const [allApts, todayApts, weekApts, monthApts, pending, confirmed, completed, cancelled, msgs, msgsUnread, testimonials, services] = await Promise.all([
        supabase.from("appointments").select("*", { count: "exact", head: true }),
        supabase.from("appointments").select("*", { count: "exact", head: true }).eq("preferred_date", today),
        supabase.from("appointments").select("*", { count: "exact", head: true }).gte("created_at", weekAgo),
        supabase.from("appointments").select("*", { count: "exact", head: true }).gte("created_at", monthAgo),
        supabase.from("appointments").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("appointments").select("*", { count: "exact", head: true }).eq("status", "confirmed"),
        supabase.from("appointments").select("*", { count: "exact", head: true }).eq("status", "completed"),
        supabase.from("appointments").select("*", { count: "exact", head: true }).eq("status", "cancelled"),
        supabase.from("contacts").select("*", { count: "exact", head: true }),
        (supabase as any).from("contacts").select("*", { count: "exact", head: true }).eq("archived", false),
        (supabase as any).from("testimonials").select("*", { count: "exact", head: true }).eq("is_approved", false),
        (supabase as any).from("services").select("*", { count: "exact", head: true }).eq("is_active", true),
      ]);

      return {
        total: allApts.count ?? 0,
        today: todayApts.count ?? 0,
        week: weekApts.count ?? 0,
        month: monthApts.count ?? 0,
        pending: pending.count ?? 0,
        confirmed: confirmed.count ?? 0,
        completed: completed.count ?? 0,
        cancelled: cancelled.count ?? 0,
        messages: msgs.count ?? 0,
        messagesUnread: msgsUnread.count ?? 0,
        testimonialsPending: testimonials.count ?? 0,
        activeServices: services.count ?? 0,
      };
    },
  });

  const { data: recent, isLoading: loadingRecent } = useQuery({
    queryKey: ["admin", "recent-appointments"],
    queryFn: async () => {
      const { data } = await supabase.from("appointments").select("*").order("created_at", { ascending: false }).limit(6);
      return data ?? [];
    },
  });

  const { data: weekly } = useQuery({
    queryKey: ["admin", "weekly-trend"],
    queryFn: async () => {
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(Date.now() - (6 - i) * 86400000);
        return d.toISOString().slice(0, 10);
      });
      const { data } = await supabase.from("appointments").select("created_at").gte("created_at", days[0]);
      const counts = days.map((day) => ({
        day,
        label: new Date(day).toLocaleDateString("en", { weekday: "short" }),
        count: (data ?? []).filter((a: any) => a.created_at.slice(0, 10) === day).length,
      }));
      return counts;
    },
  });

  const stats = [
    { label: "Today", value: data?.today, icon: CalendarCheck2, accent: "text-primary", bg: "bg-primary/10" },
    { label: "This Week", value: data?.week, icon: TrendingUp, accent: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "This Month", value: data?.month, icon: Users, accent: "text-violet-500", bg: "bg-violet-500/10" },
    { label: "All Time", value: data?.total, icon: CalendarCheck2, accent: "text-rose-500", bg: "bg-rose-500/10" },
  ];
  const pipeline = [
    { label: "Pending", value: data?.pending, icon: Clock4, color: "text-amber-500" },
    { label: "Confirmed", value: data?.confirmed, icon: CheckCircle2, color: "text-blue-500" },
    { label: "Completed", value: data?.completed, icon: CircleCheck, color: "text-emerald-500" },
    { label: "Cancelled", value: data?.cancelled, icon: XCircle, color: "text-rose-500" },
  ];
  const cms = [
    { label: "New Messages", value: data?.messagesUnread, total: data?.messages, icon: MessagesSquare, to: "/admin/contacts" as const },
    { label: "Pending Reviews", value: data?.testimonialsPending, icon: Star, to: "/admin/testimonials" as const },
    { label: "Active Services", value: data?.activeServices, icon: AlertCircle, to: "/admin/services" as const },
  ];

  const maxCount = Math.max(1, ...(weekly ?? []).map((w) => w.count));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Live overview of bookings, messages and content.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          : stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass rounded-2xl p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</span>
                  <div className={`grid h-9 w-9 place-items-center rounded-full ${s.bg}`}>
                    <s.icon className={`h-4 w-4 ${s.accent}`} />
                  </div>
                </div>
                <div className="mt-3 font-display text-3xl font-semibold">{s.value ?? 0}</div>
              </motion.div>
            ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="glass rounded-3xl p-6">
          <h2 className="font-display text-lg font-semibold">Appointment Pipeline</h2>
          <div className="mt-5 space-y-4">
            {pipeline.map((p) => (
              <div key={p.label} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <p.icon className={`h-4 w-4 ${p.color}`} />
                  <span className="text-sm">{p.label}</span>
                </div>
                <span className="font-display text-xl font-semibold">{p.value ?? 0}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-3xl p-6">
          <h2 className="font-display text-lg font-semibold">Last 7 days</h2>
          <div className="mt-5 flex h-40 items-end justify-between gap-2">
            {(weekly ?? []).map((w, i) => (
              <motion.div
                key={w.day}
                initial={{ height: 0 }}
                animate={{ height: `${(w.count / maxCount) * 100}%` }}
                transition={{ delay: i * 0.04, duration: 0.5, ease: "easeOut" }}
                className="flex flex-1 flex-col items-center gap-2"
              >
                <div className="relative w-full flex-1">
                  <div
                    className="absolute inset-x-0 bottom-0 rounded-t-lg"
                    style={{ height: `${(w.count / maxCount) * 100}%`, background: "var(--gradient-primary)" }}
                  >
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-medium">{w.count}</span>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground">{w.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {cms.map((c) => (
          <Link key={c.label} to={c.to} className="glass card-elegant-hover rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">{c.label}</span>
              <c.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-2xl font-semibold">{c.value ?? 0}</span>
              {c.total ? <span className="text-xs text-muted-foreground">/ {c.total}</span> : null}
            </div>
          </Link>
        ))}
      </div>

      <div className="glass rounded-3xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Recent Appointments</h2>
          <Link to="/admin/appointments" className="text-xs text-primary hover:underline">View all →</Link>
        </div>
        {recent && recent.length > 0 ? (
          <div className="divide-y divide-border">
            {recent.map((a: any) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium">{a.full_name}</p>
                  <p className="text-xs text-muted-foreground">{a.service} · {a.preferred_date} {a.preferred_time}</p>
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
