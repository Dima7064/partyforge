-- ============================================
-- PartyForge 003: invites, character_notes
-- ============================================

create table invites (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  code text unique not null,
  role text not null default 'player' check (role in ('player', 'master')),
  created_by uuid not null references profiles(id) on delete cascade,
  expires_at timestamptz,
  max_uses int,
  uses_count int not null default 0,
  created_at timestamptz not null default now()
);

create index on invites (campaign_id);
create index on invites (code);

create table character_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  character_id uuid not null references characters(id) on delete cascade,
  content text not null default '',
  updated_at timestamptz not null default now(),
  unique (user_id, character_id)
);

create index on character_notes (character_id);

alter table invites enable row level security;
alter table character_notes enable row level security;