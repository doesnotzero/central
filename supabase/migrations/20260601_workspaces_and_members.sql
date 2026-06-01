create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  plan text not null default 'trial',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create index if not exists workspaces_owner_id_idx
on public.workspaces (owner_id);

create index if not exists workspace_members_user_id_idx
on public.workspace_members (user_id);

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;

drop policy if exists "workspace owners can manage workspaces" on public.workspaces;
drop policy if exists "members can read their memberships" on public.workspace_members;
drop policy if exists "owners can manage workspace members" on public.workspace_members;

create policy "workspace owners can manage workspaces"
on public.workspaces
for all
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "members can read their memberships"
on public.workspace_members
for select
using (user_id = auth.uid());

create policy "owners can manage workspace members"
on public.workspace_members
for all
using (
  exists (
    select 1
    from public.workspaces w
    where w.id = workspace_members.workspace_id
      and w.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.workspaces w
    where w.id = workspace_members.workspace_id
      and w.owner_id = auth.uid()
  )
);
