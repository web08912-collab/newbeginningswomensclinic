import { supabase } from "@/integrations/supabase/client";

export type SiteSettings = Record<string, any>;

export async function fetchAllSettings(): Promise<SiteSettings> {
  const { data } = await (supabase as any).from("site_settings").select("key,value");
  const out: SiteSettings = {};
  (data ?? []).forEach((r: any) => {
    out[r.key] = r.value;
  });
  return out;
}

export async function upsertSetting(key: string, value: any) {
  const { error } = await (supabase as any)
    .from("site_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) throw error;
}

export async function logActivity(action: string, entity_type?: string, entity_id?: string, details: any = {}) {
  try {
    const { data: userRes } = await supabase.auth.getUser();
    const u = userRes?.user;
    if (!u) return;
    await (supabase as any).from("activity_log").insert({
      user_id: u.id,
      user_email: u.email,
      action,
      entity_type,
      entity_id,
      details,
    });
  } catch {}
}
