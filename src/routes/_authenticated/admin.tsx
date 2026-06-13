import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  LayoutDashboard,
  CalendarCheck2,
  MessagesSquare,
  LogOut,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import { useAuth, signOut } from "@/lib/auth";
import { SITE } from "@/lib/site";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [{ title: "Admin · New Beginnings Clinic" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: AdminShell,
});

function AdminShell() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  async function handleSignOut() {
    await signOut();
    toast.success("Signed out");
    navigate({ to: "/auth" });
  }

  if (loading || !user) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-sm text-muted-foreground">Loading…</div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container-px mx-auto max-w-md py-24 text-center">
        <div className="glass rounded-3xl p-8">
          <ShieldAlert className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-4 font-display text-2xl font-semibold">Admin access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This account is signed in but does not have admin privileges. Ask the clinic owner for the
            admin signup code, then create a new account with it.
          </p>
          <button onClick={handleSignOut} className="mt-6 btn-hero btn-hero-hover !text-sm !py-2.5">
            Sign out
          </button>
        </div>
      </div>
    );
  }

  const nav: Array<{ to: "/admin" | "/admin/appointments" | "/admin/contacts"; label: string; icon: typeof LayoutDashboard; exact?: boolean }> = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/admin/appointments", label: "Appointments", icon: CalendarCheck2 },
    { to: "/admin/contacts", label: "Messages", icon: MessagesSquare },
  ];

  return (
    <div className="container-px mx-auto max-w-7xl py-8">
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="glass h-fit rounded-3xl p-5 lg:sticky lg:top-24">
          <Link to="/" className="flex items-center gap-2.5 px-2 pb-4">
            <span className="grid h-9 w-9 place-items-center rounded-full" style={{ background: "var(--gradient-primary)" }}>
              <Sparkles className="h-4 w-4 text-white" />
            </span>
            <span className="font-display text-sm font-semibold">{SITE.short}</span>
          </Link>
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
            <button
              onClick={handleSignOut}
              className="mt-2 flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-foreground/70 hover:bg-muted"
            >
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
