-- Entregáveis com link de review
create table deliverables (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  title text not null,
  version int default 1,
  video_url text not null,
  -- NOVO: suporte a Google Drive
  drive_file_id text,
  drive_mime_type text,
  video_source text not null default 'direct',
  thumbnail_url text,
  duration_seconds numeric(8,2),
  review_token text unique not null default encode(gen_random_bytes(32), 'hex'),
  status text not null default 'waiting_review',
  -- valores: 'waiting_review' | 'revision_requested' | 'approved_with_changes' | 'rejected' | 'approved'
  revision_round int default 1,
  expires_at timestamptz,
  password_hash text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Comentários com timestamp preciso
create table video_comments (
  id uuid primary key default gen_random_uuid(),
  deliverable_id uuid references deliverables(id) on delete cascade,
  parent_id uuid references video_comments(id),
  timestamp_seconds numeric(8,2),
  timecode text,
  author_name text not null,
  author_email text,
  author_type text not null default 'client',
  content text not null,
  resolved boolean default false,
  resolved_by uuid references auth.users(id),
  resolved_at timestamptz,
  created_at timestamptz default now()
);

-- NOVO: tokens de acesso ao Google Drive por deliverable
create table drive_access_tokens (
  id uuid primary key default gen_random_uuid(),
  deliverable_id uuid references deliverables(id) on delete cascade,
  access_token text not null,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

-- RLS
alter table deliverables enable row level security;
alter table video_comments enable row level security;
alter table drive_access_tokens enable row level security;

create policy "Public can read deliverable by token"
  on deliverables for select using (true);

create policy "Producer can manage deliverables"
  on deliverables for all using (auth.uid() is not null) with check (auth.uid() is not null);

create policy "Public can insert comments"
  on video_comments for insert with check (true);

create policy "Public can read comments"
  on video_comments for select using (true);

create policy "Producer can update comments"
  on video_comments for update using (auth.uid() is not null);

create policy "Producer can manage drive tokens"
  on drive_access_tokens for all using (auth.uid() is not null);

-- Índices de performance
create index on deliverables(review_token);
create index on deliverables(project_id);
create index on deliverables(drive_file_id);
create index on video_comments(deliverable_id, timestamp_seconds);
create index on video_comments(deliverable_id, resolved);
create index on drive_access_tokens(deliverable_id, expires_at);
