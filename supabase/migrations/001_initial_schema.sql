-- ============================================
-- PartyForge: начальная схема БД
-- ============================================

-- ---------- Каталог ----------

create table classes (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  role text not null,
  ability_priorities jsonb not null,
  tone_tags text[] not null default '{}',
  description text not null
);

create table races (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  tone_tags text[] not null default '{}',
  description text not null
);

create table backgrounds (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  tone_tags text[] not null default '{}',
  description text not null
);

create table traits (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  name text not null,
  tags text[] not null default '{}',
  description text
);

create index on traits (type);

create table secrets (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  tags text[] not null default '{}'
);

create table hook_templates (
  id uuid primary key default gen_random_uuid(),
  template text not null,
  type text not null,
  tags text[] not null default '{}'
);

create table tone_weights (
  id uuid primary key default gen_random_uuid(),
  tone text not null,
  entity_type text not null,
  entity_id uuid not null,
  weight numeric not null default 1.0,
  unique (tone, entity_type, entity_id)
);

-- ---------- Кампания ----------

create table campaigns (
  id uuid primary key default gen_random_uuid(),
  share_code text unique not null,
  user_id uuid,
  title text not null,
  system text not null default 'dnd5e',
  level int not null default 1,
  tone text not null,
  party_size int not null default 4,
  world text not null default 'custom',
  constraints jsonb not null default '{}'::jsonb,
  duration text not null default 'mini_campaign',
  situation text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on campaigns (share_code);
create index on campaigns (user_id) where user_id is not null;

-- ---------- Изображения ----------

create table images (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns(id) on delete cascade,
  url text not null,
  type text not null,
  prompt text,
  created_at timestamptz not null default now()
);

create index on images (campaign_id);

-- ---------- Персонажи ----------

create table characters (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  name text not null,
  class_id uuid not null references classes(id),
  race_id uuid not null references races(id),
  background_id uuid not null references backgrounds(id),
  level int not null default 1,
  role text not null,
  abilities jsonb not null,
  personality jsonb not null,
  backstory text not null,
  secret_id uuid references secrets(id),
  image_id uuid references images(id) on delete set null,
  created_at timestamptz not null default now()
);

create index on characters (campaign_id);

-- ---------- Связи между персонажами ----------

create table relationships (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  source_character_id uuid not null references characters(id) on delete cascade,
  target_character_id uuid not null references characters(id) on delete cascade,
  type text not null,
  description text not null,
  created_at timestamptz not null default now(),
  check (source_character_id != target_character_id)
);

create index on relationships (campaign_id);

-- ---------- Локации ----------

create table locations (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  name text not null,
  type text not null,
  description text not null,
  image_id uuid references images(id) on delete set null,
  created_at timestamptz not null default now()
);

create index on locations (campaign_id);

create table character_locations (
  character_id uuid not null references characters(id) on delete cascade,
  location_id uuid not null references locations(id) on delete cascade,
  connection_type text not null,
  primary key (character_id, location_id, connection_type)
);

-- ---------- Фракции ----------

create table factions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  name text not null,
  goals text not null,
  attitude text not null,
  description text not null,
  created_at timestamptz not null default now()
);

create index on factions (campaign_id);

-- ---------- NPC ----------

create table npcs (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  name text not null,
  role text not null,
  description text not null,
  location_id uuid references locations(id) on delete set null,
  faction_id uuid references factions(id) on delete set null,
  image_id uuid references images(id) on delete set null,
  created_at timestamptz not null default now()
);

create index on npcs (campaign_id);

-- ---------- Сюжетные крючки ----------

create table hooks (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  title text not null,
  description text not null,
  type text not null,
  character_id uuid references characters(id) on delete set null,
  created_at timestamptz not null default now()
);

create index on hooks (campaign_id);

-- ============================================
-- RLS (Row Level Security)
-- ============================================

alter table campaigns enable row level security;
alter table characters enable row level security;
alter table relationships enable row level security;
alter table locations enable row level security;
alter table character_locations enable row level security;
alter table factions enable row level security;
alter table npcs enable row level security;
alter table hooks enable row level security;
alter table images enable row level security;

alter table classes enable row level security;
alter table races enable row level security;
alter table backgrounds enable row level security;
alter table traits enable row level security;
alter table secrets enable row level security;
alter table hook_templates enable row level security;
alter table tone_weights enable row level security;

-- ============================================
-- Триггер: обновление updated_at
-- ============================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger campaigns_updated_at
  before update on campaigns
  for each row execute function update_updated_at();