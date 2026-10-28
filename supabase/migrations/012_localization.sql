alter table classes add column if not exists name_en text default '';
alter table races add column if not exists name_en text default '';
alter table backgrounds add column if not exists name_en text default '';
alter table traits add column if not exists name_en text default '';
alter table secrets add column if not exists text_en text default '';
alter table hook_templates add column if not exists template_en text default '';
alter table campaigns add column if not exists locale text default 'ru';