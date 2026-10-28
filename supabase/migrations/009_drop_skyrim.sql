-- Конвертируем старые кампании в классику
update campaigns set theme = 'classic' where theme = 'skyrim';

-- Меняем constraint, чтобы разрешить только classic
alter table campaigns drop constraint if exists campaigns_theme_check;
alter table campaigns add constraint campaigns_theme_check check (theme in ('classic'));

-- Удаляем достижение Скайрима
delete from achievements where code = 'skyrim_master';