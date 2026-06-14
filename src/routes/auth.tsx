import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock, Mail, User as UserIcon, Phone, ShieldCheck, Sparkles } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { claimAdminRole } from "@/lib/api/admin.functions";
import { useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In — New Beginnings Women's Clinic" },
      { name: "description", content: "Secure sign-in for patients and clinic staff." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AuthPage,
});

const signUpSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(100),
  phone: z.string().trim().min(7, "Enter a valid phone").max(20),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Min 8 characters").max(72),
  admin_code: z.string().trim().max(64).optional().or(z.literal("")),
});
const signInSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(72),
});

function AuthPage() {
  const navigate = useNavigate();
  const { session, isAdmin, loading } = useAuth();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const claimAdmin = useServerFn(claimAdminRole);

  useEffect(() => {
    if (!loading && session) navigate({ to: isAdmin ? "/admin" : "/portal" });
  }, [loading, session, isAdmin, navigate]);

  async function routeAfterAuth(userId: string) {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    navigate({ to: data ? "/admin" : "/portal" });
  }

  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = signInSchema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back");
    if (data.user) await routeAfterAuth(data.user.id);
  }

  async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = signUpSchema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/portal`,
        data: { full_name: parsed.data.full_name, phone: parsed.data.phone },
      },
    });
    if (error) {
      setBusy(false);
      return toast.error(error.message);
    }
    let becameAdmin = false;
    if (parsed.data.admin_code && data.session) {
      try {
        await claimAdmin({ data: { code: parsed.data.admin_code } });
        becameAdmin = true;
        toast.success("Admin access granted");
      } catch (err: any) {
        toast.error(err?.message ?? "Invalid admin code");
      }
    } else {
      toast.success("Account created");
    }
    setBusy(false);
    navigate({ to: becameAdmin ? "/admin" : "/portal" });
  }

  return (
    <div className="container-px mx-auto flex min-h-[80vh] max-w-md flex-col justify-center py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass rounded-3xl p-8 shadow-[var(--shadow-soft)]"
      >
        <div className="mb-6 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full" style={{ background: "var(--gradient-primary)" }}>
            <Sparkles className="h-5 w-5 text-white" />
          </span>
          <h1 className="mt-3 font-display text-2xl font-semibold">Welcome</h1>
          <p className="text-sm text-muted-foreground">Sign in to your patient portal or staff dashboard</p>
        </div>

        <div className="mb-6 flex rounded-full bg-muted p-1">
          {(["signin", "signup"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
                tab === t ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
              }`}
            >
              {t === "signin" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        {tab === "signin" ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <Field icon={<Mail className="h-4 w-4" />} name="email" type="email" placeholder="you@clinic.com" autoComplete="email" />
            <Field icon={<Lock className="h-4 w-4" />} name="password" type="password" placeholder="Password" autoComplete="current-password" />
            <button disabled={busy} className="btn-hero btn-hero-hover w-full !py-3 !text-sm disabled:opacity-60">
              {busy ? "Signing in…" : "Sign In"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-4">
            <Field icon={<UserIcon className="h-4 w-4" />} name="full_name" placeholder="Full name" autoComplete="name" />
            <Field icon={<Phone className="h-4 w-4" />} name="phone" placeholder="Phone number" autoComplete="tel" />
            <Field icon={<Mail className="h-4 w-4" />} name="email" type="email" placeholder="Email address" autoComplete="email" />
            <Field icon={<Lock className="h-4 w-4" />} name="password" type="password" placeholder="Password (min 8 chars)" autoComplete="new-password" />
            <Field icon={<ShieldCheck className="h-4 w-4" />} name="admin_code" type="password" placeholder="Admin code (optional)" />
            <button disabled={busy} className="btn-hero btn-hero-hover w-full !py-3 !text-sm disabled:opacity-60">
              {busy ? "Creating…" : "Create Account"}
            </button>
            <p className="text-center text-xs text-muted-foreground">
              Use the admin code provided by the clinic owner to unlock the dashboard.
            </p>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">← Back to website</Link>
        </p>
      </motion.div>
    </div>
  );
}

function Field({ icon, ...props }: { icon: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-border bg-background/60 px-4 py-3 focus-within:border-primary">
      <span className="text-muted-foreground">{icon}</span>
      <input
        {...props}
        className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </label>
  );
}
