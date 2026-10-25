alter table campaigns
  add column map_image_id uuid references images(id) on delete set null;