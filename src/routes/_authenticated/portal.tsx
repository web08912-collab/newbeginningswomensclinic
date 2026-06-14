import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, CalendarDays, FileText, LogOut } from "lucide-react";
import { useAuth, signOut } from "@/lib/auth";
import { SITE } from "@/lib/site";
import { toast } from "sonner";
import logoAsset from "@/assets/logo.png.asset.json";

export const Route = createFileRoute("/_authenticated/portal")({
  head: () => ({
    meta: [{ title: "Patient Portal · New Beginnings Clinic" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: PortalShell,
});

function PortalShell() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  async function handleSignOut() {
    await signOut();
    toast.success("Signed out");
    navigate({ to: "/auth" });
  }

  if (loading || !user) {
    return <div className="grid min-h-[60vh] place-items-center text-sm text-muted-foreground">Loading…</div>;
  }

  const nav: Array<{ to: any; label: string; icon: typeof LayoutDashboard; exact?: boolean }> = [
    { to: "/portal", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/portal/appointments", label: "My Appointments", icon: CalendarDays },
    { to: "/portal/documents", label: "My Documents", icon: FileText },
  ];

  return (
    <div className="container-px mx-auto max-w-7xl py-8">
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="glass h-fit rounded-3xl p-5 lg:sticky lg:top-24">
          <Link to="/" className="flex items-center gap-2.5 px-2 pb-4">
            <img src={logoAsset.url} alt={SITE.name} className="h-9 w-9 object-contain" />
            <span className="font-display text-sm font-semibold">{SITE.short}</span>
          </Link>
          <p className="px-2 pb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Patient Portal</p>
          <nav className="space-y-1">
            {nav.map((n) => {
              const active = n.exact ? path === n.to : path.startsWith(n.to);
              const Icon = n.icon;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                    active ? "bg-primary/15 text-primary" : "text-foreground/70 hover:bg-muted"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-6 border-t border-border pt-4">
            <p className="px-2 text-xs text-muted-foreground truncate">{user.email}</p>
            <button onClick={handleSignOut} className="mt-2 flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-foreground/70 hover:bg-muted">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </aside>
        <section>
          <Outlet />
        </section>
      </div>
    </div>
  );
}
