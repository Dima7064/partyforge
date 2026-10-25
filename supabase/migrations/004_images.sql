-- ============================================
-- PartyForge 004: пул изображений, террейн
-- ============================================

-- Расширяем images: метаданные пула
alter table images
  add column is_pool boolean not null default false,
  add column race_name text,
  add column location_type text,
  add column theme text not null default 'classic',
  add column width int not null default 0,
  add column height int not null default 0,
  add column filename text;

create index on images (is_pool, type);
create index on images (is_pool, race_name);
create index on images (is_pool, location_type);

-- Террейн кампании
alter table campaigns
  add column terrain_image_id uuid references images(id) on delete set null;

-- Индексы для поиска
create index on characters (image_id) where image_id is not null;
create index on locations (image_id) where image_id is not null;
create index on npcs (image_id) where image_id is not null;