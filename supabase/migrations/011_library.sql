create table if not exists library_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null check (type in ('name', 'npc', 'location', 'item', 'campaign', 'faction')),
  name text not null,
  data jsonb not null default '{}'::jsonb,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_library_user on library_items(user_id);
create index idx_library_type on library_items(type);

alter table library_items enable row level security;

create policy "Users can view own library items"
  on library_items for select
  using (auth.uid() = user_id);

create policy "Users can insert own library items"
  on library_items for insert
  with check (auth.uid() = user_id);

create policy "Users can update own library items"
  on library_items for update
  using (auth.uid() = user_id);

create policy "Users can delete own library items"
  on library_items for delete
  using (auth.uid() = user_id);