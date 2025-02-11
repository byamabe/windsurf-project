-- Create extensions
create extension if not exists "uuid-ossp";

-- Create tables
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  display_name text not null,
  bio text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

create table if not exists public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  plan_id text not null,
  status text not null check (status in ('active', 'cancelled', 'expired')),
  current_period_start timestamp with time zone not null,
  current_period_end timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

create table if not exists public.authors (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  bio text,
  avatar_url text,
  website_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.podcasts (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null,
  cover_image_url text not null,
  rss_feed_url text,
  website_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.podcast_authors (
  podcast_id uuid references public.podcasts not null,
  author_id uuid references public.authors not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (podcast_id, author_id)
);

create table if not exists public.episodes (
  id uuid primary key default uuid_generate_v4(),
  podcast_id uuid references public.podcasts not null,
  title text not null,
  description text not null,
  audio_url text not null,
  video_url text,
  duration integer not null,
  published_at timestamp with time zone not null,
  transcript text,
  is_premium boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.loci (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text not null,
  parent_id uuid references public.loci,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.episode_loci (
  episode_id uuid references public.episodes not null,
  locus_id uuid references public.loci not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (episode_id, locus_id)
);

create table if not exists public.questions (
  id uuid primary key default uuid_generate_v4(),
  text text not null,
  answer text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.episode_questions (
  episode_id uuid references public.episodes not null,
  question_id uuid references public.questions not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (episode_id, question_id)
);

create table if not exists public.playlists (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  is_public boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.playlist_episodes (
  playlist_id uuid references public.playlists not null,
  episode_id uuid references public.episodes not null,
  position integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (playlist_id, episode_id)
);

create table if not exists public.ratings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  episode_id uuid references public.episodes not null,
  score integer not null check (score >= 1 and score <= 5),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, episode_id)
);

create table if not exists public.comments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  episode_id uuid references public.episodes not null,
  content text not null,
  parent_id uuid references public.comments,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index if not exists profiles_user_id_idx on public.profiles(user_id);
create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);
create index if not exists episodes_podcast_id_idx on public.episodes(podcast_id);
create index if not exists loci_parent_id_idx on public.loci(parent_id);
create index if not exists playlists_user_id_idx on public.playlists(user_id);
create index if not exists ratings_user_id_idx on public.ratings(user_id);
create index if not exists ratings_episode_id_idx on public.ratings(episode_id);
create index if not exists comments_user_id_idx on public.comments(user_id);
create index if not exists comments_episode_id_idx on public.comments(episode_id);
create index if not exists comments_parent_id_idx on public.comments(parent_id);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.authors enable row level security;
alter table public.podcasts enable row level security;
alter table public.podcast_authors enable row level security;
alter table public.episodes enable row level security;
alter table public.loci enable row level security;
alter table public.episode_loci enable row level security;
alter table public.questions enable row level security;
alter table public.episode_questions enable row level security;
alter table public.playlists enable row level security;
alter table public.playlist_episodes enable row level security;
alter table public.ratings enable row level security;
alter table public.comments enable row level security;

-- Create policies
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where tablename = 'profiles' 
    and policyname = 'Users can view all profiles'
  ) then
    create policy "Users can view all profiles"
      on public.profiles for select
      to authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'profiles' 
    and policyname = 'Users can update own profile'
  ) then
    create policy "Users can update own profile"
      on public.profiles for update
      to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'subscriptions' 
    and policyname = 'Users can view own subscription'
  ) then
    create policy "Users can view own subscription"
      on public.subscriptions for select
      to authenticated
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'authors' 
    and policyname = 'Users can view all authors'
  ) then
    create policy "Users can view all authors"
      on public.authors for select
      to authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'podcasts' 
    and policyname = 'Users can view all podcasts'
  ) then
    create policy "Users can view all podcasts"
      on public.podcasts for select
      to authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'podcast_authors' 
    and policyname = 'Users can view all podcast authors'
  ) then
    create policy "Users can view all podcast authors"
      on public.podcast_authors for select
      to authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'episodes' 
    and policyname = 'Users can view all episodes'
  ) then
    create policy "Users can view all episodes"
      on public.episodes for select
      to authenticated
      using (
        case
          when is_premium then exists (
            select 1
            from public.subscriptions s
            where s.user_id = auth.uid()
            and s.status = 'active'
            and s.current_period_end > now()
          )
          else true
        end
      );
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'loci' 
    and policyname = 'Users can view all loci'
  ) then
    create policy "Users can view all loci"
      on public.loci for select
      to authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'episode_loci' 
    and policyname = 'Users can view all episode loci'
  ) then
    create policy "Users can view all episode loci"
      on public.episode_loci for select
      to authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'questions' 
    and policyname = 'Users can view all questions'
  ) then
    create policy "Users can view all questions"
      on public.questions for select
      to authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'episode_questions' 
    and policyname = 'Users can view all episode questions'
  ) then
    create policy "Users can view all episode questions"
      on public.episode_questions for select
      to authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'playlists' 
    and policyname = 'Users can view own and public playlists'
  ) then
    create policy "Users can view own and public playlists"
      on public.playlists for select
      to authenticated
      using (
        auth.uid() = user_id
        or is_public = true
      );
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'playlists' 
    and policyname = 'Users can insert own playlists'
  ) then
    create policy "Users can insert own playlists"
      on public.playlists for insert
      to authenticated
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'playlists' 
    and policyname = 'Users can update own playlists'
  ) then
    create policy "Users can update own playlists"
      on public.playlists for update
      to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'playlists' 
    and policyname = 'Users can delete own playlists'
  ) then
    create policy "Users can delete own playlists"
      on public.playlists for delete
      to authenticated
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'playlist_episodes' 
    and policyname = 'Users can view playlist episodes for accessible playlists'
  ) then
    create policy "Users can view playlist episodes for accessible playlists"
      on public.playlist_episodes for select
      to authenticated
      using (
        exists (
          select 1
          from public.playlists p
          where p.id = playlist_id
          and (p.user_id = auth.uid() or p.is_public = true)
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'playlist_episodes' 
    and policyname = 'Users can manage playlist episodes for own playlists'
  ) then
    create policy "Users can manage playlist episodes for own playlists"
      on public.playlist_episodes for all
      to authenticated
      using (
        exists (
          select 1
          from public.playlists p
          where p.id = playlist_id
          and p.user_id = auth.uid()
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'ratings' 
    and policyname = 'Users can view all ratings'
  ) then
    create policy "Users can view all ratings"
      on public.ratings for select
      to authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'ratings' 
    and policyname = 'Users can manage own ratings'
  ) then
    create policy "Users can manage own ratings"
      on public.ratings for all
      to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'comments' 
    and policyname = 'Users can view comments on accessible episodes'
  ) then
    create policy "Users can view comments on accessible episodes"
      on public.comments for select
      to authenticated
      using (
        exists (
          select 1
          from public.episodes e
          where e.id = episode_id
          and (
            not e.is_premium
            or exists (
              select 1
              from public.subscriptions s
              where s.user_id = auth.uid()
              and s.status = 'active'
              and s.current_period_end > now()
            )
          )
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'comments' 
    and policyname = 'Users can manage own comments'
  ) then
    create policy "Users can manage own comments"
      on public.comments for all
      to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;
