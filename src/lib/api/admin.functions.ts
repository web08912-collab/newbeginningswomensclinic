import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const ADMIN_SIGNUP_CODE = "Rishi@123";

/**
 * Grants admin role to the calling user if they provide the correct signup code.
 * Called after a successful sign-up where the user entered the admin code.
 */
export const claimAdminRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ code: z.string().min(1).max(64) }).parse(d))
  .handler(async ({ data, context }) => {
    if (data.code !== ADMIN_SIGNUP_CODE) {
      throw new Error("Invalid admin signup code");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: context.userId, role: "admin" }, { onConflict: "user_id,role" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
