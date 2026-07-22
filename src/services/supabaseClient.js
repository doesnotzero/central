import { createClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL } from "../config/app.js";

// Client empacotado (não depende do <script> CDN, que carregava com `defer` e
// gerava race condition: se o SDK não estivesse pronto quando o review público
// rodava, o link falhava de vez com "não encontrado"). Singleton para evitar
// múltiplas instâncias de auth.
let _client = null;

export const getSupabase = () => {
  if (_client) return _client;
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  _client = createClient(SUPABASE_URL, SUPABASE_KEY);
  return _client;
};
