/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_ADMIN_EMAILS: string
  readonly VITE_BRANDING_CONFIG: string
  readonly VITE_FEATURE_CONFIG: string
  readonly VITE_LIMIT_CONFIG: string
  readonly VITE_ASSET_CONFIG: string
  readonly VITE_INSTAGRAM_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
