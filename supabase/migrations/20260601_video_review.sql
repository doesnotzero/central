-- ============================================================================
-- VIDEO REVIEW · entregáveis + comentários por timecode
-- ----------------------------------------------------------------------------
-- Este app guarda o estado no blob `app_state` (não usa tabelas normalizadas),
-- por isso NÃO existe tabela `projects`. Não há FK para projects/auth.users.
-- O vínculo com o projeto é guardado como texto (project_title / client_name).
--
-- COMO APLICAR:
--   Supabase Dashboard  ->  SQL Editor  ->  New query  ->  cole tudo  ->  Run.
--   Rodar de novo é seguro (idempotente).
-- ============================================================================

create extension if not exists pgcrypto;

-- Entregáveis com link público de review ---------------------------------------
create table if not exists deliverables (
  id               uuid primary key default gen_random_uuid(),
  project_id       uuid,
  project_title    text,
  client_name      text,
  title            text not null,
  version          int  default 1,
  video_url        text not null,
  public_url       text,
  drive_file_id    text,
  drive_mime_type  text,
  video_source     text not null default 'direct',
  thumbnail_url    text,
  duration_seconds numeric(8,2),
  review_token     text unique not null default encode(gen_random_bytes(32), 'hex'),
  status           text not null default 'waiting_review',
  -- 'waiting_review' | 'revision_requested' | 'approved_with_changes' | 'rejected' | 'approved'
  revision_round   int  default 1,
  expires_at       timestamptz,
  password_hash    text,
  created_by       uuid,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- Comentários com timestamp preciso --------------------------------------------
create table if not exists video_comments (
  id                uuid primary key default gen_random_uuid(),
  deliverable_id    uuid references deliverables(id) on delete cascade,
  parent_id         uuid references video_comments(id),
  timestamp_seconds numeric(8,2),
  timecode          text,
  author_name       text not null,
  author_email      text,
  author_type       text not null default 'client',
  content           text not null,
  resolved          boolean default false,
  resolved_at       timestamptz,
  created_at        timestamptz default now()
);

-- RLS --------------------------------------------------------------------------
-- O review_token é uma URL-capability (string aleatória de 32 bytes).
-- Este é um painel interno pequeno que já confia no client com a publishable key
-- (o estado inteiro vive em app_state). Por isso as policies são permissivas.
alter table deliverables   enable row level security;
alter table video_comments enable row level security;

drop policy if exists "deliverables_read"  on deliverables;
create policy "deliverables_read"  on deliverables for select using (true);
drop policy if exists "deliverables_write" on deliverables;
create policy "deliverables_write" on deliverables for all    using (true) with check (true);

drop policy if exists "comments_read"   on video_comments;
create policy "comments_read"   on video_comments for select using (true);
drop policy if exists "comments_insert" on video_comments;
create policy "comments_insert" on video_comments for insert with check (true);
drop policy if exists "comments_update" on video_comments;
create policy "comments_update" on video_comments for update using (true);

-- Índices ----------------------------------------------------------------------
create index if not exists idx_deliverables_token      on deliverables(review_token);
create index if not exists idx_deliverables_project    on deliverables(project_id);
create index if not exists idx_comments_deliverable_ts on video_comments(deliverable_id, timestamp_seconds);
create index if not exists idx_comments_deliverable_rs on video_comments(deliverable_id, resolved);
