export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://uiddfmhjhgjiwygzewnb.supabase.co";

export const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_JBbndMaUPy2dsXpYSnY7tA_IADwpY6z";

export const SUPABASE_STATE_TABLE = "app_state";

export const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || "elytraprod@gmail.com")
  .split(",")
  .map(email => email.trim().toLowerCase())
  .filter(Boolean);
