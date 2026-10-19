-- ============================================
-- PartyForge 002: auth, localization, roles, theme
-- IDEMPOTENT (safe to re-run)
-- ============================================

-- ---------- 1. Профили ----------
create table if not exists profiles (
  id uuid primary key,
  username text unique not null,
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);
create index if not exists idx_profiles_username on profiles (username);

-- ---------- 2. Достижения ----------
create table if not exists achievements (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name_ru text not null,
  description_ru text not null,
  icon text not null default '🏆'
);

create table if not exists user_achievements (
  user_id uuid not null references profiles(id) on delete cascade,
  achievement_id uuid not null references achievements(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

-- ---------- 3. Участники кампаний ----------
create table if not exists campaign_members (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null check (role in ('master', 'player')),
  character_id uuid references characters(id) on delete set null,
  joined_at timestamptz not null default now(),
  unique (campaign_id, user_id)
);
create index if not exists idx_cm_campaign on campaign_members (campaign_id);
create index if not exists idx_cm_user on campaign_members (user_id);

-- ---------- 4. campaigns: theme, status ----------
alter table campaigns add column if not exists theme text not null default 'classic';
alter table campaigns add column if not exists status text not null default 'active';

-- CHECK constraints через DO-блок (идемпотентно)
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'campaigns_theme_check') then
    alter table campaigns
      add constraint campaigns_theme_check check (theme in ('classic', 'skyrim'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'campaigns_status_check') then
    alter table campaigns
      add constraint campaigns_status_check check (status in ('draft', 'active', 'finished'));
  end if;
end $$;

-- ---------- 5. characters: денормализация + secret ----------
alter table characters add column if not exists class_name text not null default '';
alter table characters add column if not exists race_name text not null default '';
alter table characters add column if not exists background_name text not null default '';
alter table characters add column if not exists secret_text text not null default '';

-- Drop NOT NULL on FK columns (no-op если уже nullable)
alter table characters alter column class_id drop not null;
alter table characters alter column race_id drop not null;
alter table characters alter column background_id drop not null;

-- ---------- 6. character_locations: campaign_id ----------
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'character_locations'
      and column_name = 'campaign_id'
  ) then
    alter table character_locations
      add column campaign_id uuid references campaigns(id) on delete cascade;
  end if;
end $$;

-- Backfill (только если есть NULL, повторный запуск — no-op)
update character_locations cl
set campaign_id = c.campaign_id
from characters c
where cl.character_id = c.id
  and cl.campaign_id is null;

-- Set NOT NULL (no-op если уже NOT NULL)
alter table character_locations alter column campaign_id set not null;

create index if not exists idx_cl_campaign on character_locations (campaign_id);

-- ---------- 7. Локализация каталога ----------
alter table classes add column if not exists name_ru text not null default '';
alter table races add column if not exists name_ru text not null default '';
alter table backgrounds add column if not exists name_ru text not null default '';

-- ---------- 8. theme для каталога ----------
alter table classes add column if not exists theme text[] not null default '{classic}';
alter table races add column if not exists theme text[] not null default '{classic}';