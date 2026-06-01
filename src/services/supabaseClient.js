import { SUPABASE_KEY, SUPABASE_URL } from "../config/app.js";

export const getSupabase = () =>
  window.supabase?.createClient
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
    : null;
