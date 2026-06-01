import { SUPABASE_STATE_TABLE } from "../config/app.js";

export const saveAppState = async (supabase, userId, state) => {
  if (!supabase || !userId) return { ok: false, skipped: true };

  const { error } = await supabase
    .from(SUPABASE_STATE_TABLE)
    .upsert(
      {
        user_id: userId,
        state,
        updated_at: new Date().toISOString()
      },
      { onConflict: "user_id" }
    );

  return { ok: !error, error };
};

export const loadAppState = async (supabase, userId) => {
  if (!supabase || !userId) return { state: null, error: null };

  const { data, error } = await supabase
    .from(SUPABASE_STATE_TABLE)
    .select("state,updated_at")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  return { state: data?.state || null, updatedAt: data?.updated_at || null, error };
};
