import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { RowSkeleton } from "@/components/site/Skeleton";

export const Route = createFileRoute("/_authenticated/portal/appointments")({
  component: PortalAppointments,
});

const STATUS_COLORS: Record<string, string> = {
  new: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  confirmed: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  cancelled: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
};

function PortalAppointments() {
  const { user } = useAuth();
  const email = user?.email;
  const { data, isLoading } = useQuery({
    enabled: !!email,
    queryKey: ["portal", "appointments", email],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("email", email!)
        .order("preferred_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">My Appointments</h1>
          <p className="text-sm text-muted-foreground">Your booking history with the clinic.</p>
        </div>
        <Link to="/appointment" className="btn-hero btn-hero-hover inline-flex items-center gap-2 !text-sm !py-2.5">
          <Plus className="h-4 w-4" /> Book new
        </Link>
      </header>

      <div className="glass overflow-hidden rounded-3xl">
        {isLoading ? (
          <div className="divide-y divide-border p-4">{Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)}</div>
        ) : !data || data.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            You haven't booked any appointments yet. <Link to="/appointment" className="text-primary hover:underline">Book one</Link>.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {data.map((a: any) => (
              <div key={a.id} className="flex flex-wrap items-center gap-4 p-4">
                <CalendarDays className="h-5 w-5 text-accent" />
                <div className="flex-1 min-w-[200px]">
                  <p className="font-semibold">{a.service}</p>
                  <p className="text-xs text-muted-foreground">{a.preferred_date} · {a.preferred_time}</p>
                  {a.concern && <p className="mt-1 text-xs text-foreground/70">{a.concern}</p>}
                </div>
                <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${STATUS_COLORS[a.status] ?? "bg-muted"}`}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
