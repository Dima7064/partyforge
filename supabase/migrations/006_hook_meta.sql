alter table hooks
  add column template_id uuid references hook_templates(id) on delete set null,
  add column metadata jsonb not null default '{}'::jsonb;