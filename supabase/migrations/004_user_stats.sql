-- Таблица для вечного хранения агрегированной статистики
create table user_stats (
  user_id uuid primary key references profiles(id) on delete cascade,
  campaigns_created int not null default 0,
  campaigns_joined int not null default 0
);

-- Таблица для вечного хранения сыгранных персонажей (для графиков)
create table user_character_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  class_name text not null,
  race_name text not null,
  role text not null,
  created_at timestamptz not null default now()
);