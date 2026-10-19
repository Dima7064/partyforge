-- Денормализация для быстрого чтения и snapshot-логики
-- (если каталог поменяется, старые кампании не сломаются)

alter table characters
  add column if not exists class_name text,
  add column if not exists race_name text,
  add column if not exists background_name text,
  add column if not exists secret_text text,
  add column if not exists image_url text;

alter table locations
  add column if not exists image_url text;

alter table npcs
  add column if not exists image_url text;

-- Индексы не нужны — поля читаются только вместе со строкой.