-- Create enum for event types
do $$ begin
  create type public.analytics_event_type as enum (
    'view',           -- Episode or podcast view
    'play',           -- Started playing
    'pause',          -- Paused playback
    'resume',         -- Resumed playback
    'complete',       -- Completed episode
    'download',       -- Downloaded episode
    'share',          -- Shared episode/podcast
    'favorite',       -- Added to favorites
    'playlist_add'    -- Added to playlist
  );
exception
  when duplicate_object then null;
end $$;

-- Create analytics tables
create table if not exists public.analytics_events (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references auth.users(id),
    event_type analytics_event_type not null,
    episode_id uuid references public.episodes(id),
    podcast_id uuid references public.podcasts(id),
    metadata jsonb,
    session_id text,
    ip_address text,
    user_agent text
);

create table if not exists public.episode_stats (
    episode_id uuid references public.episodes(id) primary key,
    total_views integer default 0 not null,
    total_plays integer default 0 not null,
    total_completions integer default 0 not null,
    total_downloads integer default 0 not null,
    total_shares integer default 0 not null,
    total_favorites integer default 0 not null,
    avg_completion_rate numeric(5,2) default 0 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.podcast_stats (
    podcast_id uuid references public.podcasts(id) primary key,
    total_views integer default 0 not null,
    total_plays integer default 0 not null,
    total_completions integer default 0 not null,
    total_downloads integer default 0 not null,
    total_shares integer default 0 not null,
    total_favorites integer default 0 not null,
    avg_completion_rate numeric(5,2) default 0 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create function to update episode stats
create or replace function public.update_episode_stats()
returns trigger as $$
begin
  -- Update episode_stats based on the event type
  insert into public.episode_stats (episode_id)
  values (NEW.episode_id)
  on conflict (episode_id) do update
  set
    total_views = case when NEW.event_type = 'view' then episode_stats.total_views + 1 else episode_stats.total_views end,
    total_plays = case when NEW.event_type = 'play' then episode_stats.total_plays + 1 else episode_stats.total_plays end,
    total_completions = case when NEW.event_type = 'complete' then episode_stats.total_completions + 1 else episode_stats.total_completions end,
    total_downloads = case when NEW.event_type = 'download' then episode_stats.total_downloads + 1 else episode_stats.total_downloads end,
    total_shares = case when NEW.event_type = 'share' then episode_stats.total_shares + 1 else episode_stats.total_shares end,
    total_favorites = case when NEW.event_type = 'favorite' then episode_stats.total_favorites + 1 else episode_stats.total_favorites end,
    updated_at = now();
  return NEW;
end;
$$ language plpgsql security definer;

-- Create function to update podcast stats
create or replace function public.update_podcast_stats()
returns trigger as $$
begin
  -- Update podcast_stats based on the event type
  insert into public.podcast_stats (podcast_id)
  values (NEW.podcast_id)
  on conflict (podcast_id) do update
  set
    total_views = case when NEW.event_type = 'view' then podcast_stats.total_views + 1 else podcast_stats.total_views end,
    total_plays = case when NEW.event_type = 'play' then podcast_stats.total_plays + 1 else podcast_stats.total_plays end,
    total_completions = case when NEW.event_type = 'complete' then podcast_stats.total_completions + 1 else podcast_stats.total_completions end,
    total_downloads = case when NEW.event_type = 'download' then podcast_stats.total_downloads + 1 else podcast_stats.total_downloads end,
    total_shares = case when NEW.event_type = 'share' then podcast_stats.total_shares + 1 else podcast_stats.total_shares end,
    total_favorites = case when NEW.event_type = 'favorite' then podcast_stats.total_favorites + 1 else podcast_stats.total_favorites end,
    updated_at = now();
  return NEW;
end;
$$ language plpgsql security definer;

-- Create triggers to update stats
create trigger update_episode_stats_on_event
  after insert on public.analytics_events
  for each row
  when (NEW.episode_id is not null)
  execute function public.update_episode_stats();

create trigger update_podcast_stats_on_event
  after insert on public.analytics_events
  for each row
  when (NEW.podcast_id is not null)
  execute function public.update_podcast_stats();

-- Enable RLS on analytics tables
alter table public.analytics_events enable row level security;
alter table public.episode_stats enable row level security;
alter table public.podcast_stats enable row level security;

-- Create policies for analytics tables
create policy "Anyone can insert analytics events"
  on public.analytics_events for insert
  to authenticated
  with check (true);

create policy "Admins can view all analytics events"
  on public.analytics_events for select
  to authenticated
  using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on r.id = ur.role_id
      where ur.user_id = auth.uid()
      and r.name = 'admin'
    )
  );

create policy "Admins can view all episode stats"
  on public.episode_stats for select
  to authenticated
  using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on r.id = ur.role_id
      where ur.user_id = auth.uid()
      and r.name = 'admin'
    )
  );

create policy "Admins can view all podcast stats"
  on public.podcast_stats for select
  to authenticated
  using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on r.id = ur.role_id
      where ur.user_id = auth.uid()
      and r.name = 'admin'
    )
  );

-- Create indexes for better query performance
create index if not exists analytics_events_episode_id_idx on public.analytics_events(episode_id);
create index if not exists analytics_events_podcast_id_idx on public.analytics_events(podcast_id);
create index if not exists analytics_events_user_id_idx on public.analytics_events(user_id);
create index if not exists analytics_events_created_at_idx on public.analytics_events(created_at);
create index if not exists analytics_events_event_type_idx on public.analytics_events(event_type);
