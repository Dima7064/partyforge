alter table campaigns add column if not exists is_public boolean default false;
alter table campaigns add column if not exists fork_count int default 0;
alter table campaigns add column if not exists forked_from uuid references campaigns(id);

create table if not exists campaign_ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  campaign_id uuid not null references campaigns(id) on delete cascade,
  rating int not null check (rating >= 1 and rating <= 5),
  created_at timestamptz not null default now(),
  unique(user_id, campaign_id)
);

alter table campaign_ratings enable row level security;

create policy "Users can view all ratings"
  on campaign_ratings for select
  using (true);

create policy "Users can insert own ratings"
  on campaign_ratings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own ratings"
  on campaign_ratings for update
  using (auth.uid() = user_id);