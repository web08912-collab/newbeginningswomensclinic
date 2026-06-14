import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, FileText, ArrowRight, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/portal/")({
  component: PortalHome,
});

function PortalHome() {
  const { user } = useAuth();
  const email = user?.email;

  const { data: appts } = useQuery({
    enabled: !!email,
    queryKey: ["portal", "appts", email],
    queryFn: async () => {
      const { data } = await supabase
        .from("appointments")
        .select("*")
        .eq("email", email!)
        .order("preferred_date", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  const { data: docs } = useQuery({
    enabled: !!user?.id,
    queryKey: ["portal", "docs", user?.id],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("patient_documents")
        .select("id,title,category,created_at")
        .eq("patient_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  const upcoming = (appts ?? []).filter((a: any) => new Date(a.preferred_date) >= new Date(new Date().toDateString())).length;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-semibold">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Manage your care from one place.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={CalendarDays} label="Upcoming visits" value={upcoming} />
        <Stat icon={FileText} label="My documents" value={(docs ?? []).length} />
        <Stat icon={Heart} label="Total appointments" value={(appts ?? []).length} />
      </div>

      <section className="glass rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Recent Appointments</h2>
          <Link to="/portal/appointments" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-4 divide-y divide-border">
          {(appts ?? []).slice(0, 4).map((a: any) => (
            <div key={a.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-semibold">{a.service}</p>
                <p className="text-xs text-muted-foreground">{a.preferred_date} · {a.preferred_time}</p>
              </div>
              <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] uppercase tracking-wider">{a.status}</span>
            </div>
          ))}
          {(appts ?? []).length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No appointments yet. <Link to="/appointment" className="text-primary hover:underline">Book one</Link>.
            </p>
          )}
        </div>
      </section>

      <section className="glass rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Recent Documents</h2>
          <Link to="/portal/documents" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-4 divide-y divide-border">
          {(docs ?? []).slice(0, 4).map((d: any) => (
            <div key={d.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-semibold">{d.title}</p>
                <p className="text-xs text-muted-foreground">{d.category} · {new Date(d.created_at).toLocaleDateString()}</p>
              </div>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
          ))}
          {(docs ?? []).length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">No documents shared with you yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: number | string }) {
  return (
    <div className="glass rounded-3xl p-5">
      <Icon className="h-5 w-5 text-accent" />
      <p className="mt-3 font-display text-3xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
