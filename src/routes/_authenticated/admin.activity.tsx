import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RowSkeleton } from "@/components/site/Skeleton";

export const Route = createFileRoute("/_authenticated/admin/activity")({
  component: ActivityAdmin,
});

function ActivityAdmin() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "activity"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      return data ?? [];
    },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Activity Log</h1>
        <p className="text-sm text-muted-foreground">Audit trail of admin actions (latest 200).</p>
      </header>

      <div className="glass overflow-hidden rounded-3xl">
        {isLoading ? (
          <div className="divide-y divide-border p-4">{Array.from({ length: 6 }).map((_, i) => <RowSkeleton key={i} />)}</div>
        ) : !data || data.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {data.map((a: any) => (
              <div key={a.id} className="flex items-start gap-3 p-4">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary">
                  <Activity className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-semibold capitalize">{a.action}</span>
                    {a.entity_type ? <> <span className="text-muted-foreground">·</span> <span>{a.entity_type}</span></> : null}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {a.user_email ?? "system"} · {new Date(a.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
