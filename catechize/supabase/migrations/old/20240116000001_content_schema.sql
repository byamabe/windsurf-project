-- Create enum types
do $$ begin
  create type content_status as enum ('draft', 'published', 'archived');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type resource_type as enum ('document', 'video', 'audio', 'link');
exception
  when duplicate_object then null;
end $$;

-- Create categories table
create table if not exists public.categories (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null unique,
    slug text not null unique,
    description text,
    parent_id uuid references public.categories(id)
);

-- Create podcasts table
create table if not exists public.podcasts (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    title text not null,
    slug text not null unique,
    description text,
    cover_image_url text,
    author_id uuid references auth.users(id) not null,
    status content_status default 'draft'::content_status not null,
    rss_feed_url text,
    website_url text,
    category_id uuid references public.categories(id)
);

-- Create episodes table
create table if not exists public.episodes (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    title text not null,
    slug text not null unique,
    description text,
    audio_url text not null,
    duration integer, -- in seconds
    published_at timestamp with time zone,
    podcast_id uuid references public.podcasts(id) not null,
    author_id uuid references auth.users(id) not null,
    status content_status default 'draft'::content_status not null,
    transcript text,
    show_notes text,
    UNIQUE(podcast_id, slug)
);

-- Create articles table
create table if not exists public.articles (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    title text not null,
    slug text not null unique,
    content text not null,
    excerpt text,
    featured_image_url text,
    author_id uuid references auth.users(id) not null,
    status content_status default 'draft'::content_status not null,
    published_at timestamp with time zone,
    category_id uuid references public.categories(id)
);

-- Create resources table
create table if not exists public.resources (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    title text not null,
    slug text not null unique,
    description text,
    resource_url text not null,
    resource_type resource_type not null,
    author_id uuid references auth.users(id) not null,
    status content_status default 'draft'::content_status not null,
    category_id uuid references public.categories(id)
);

-- Create tags table
create table if not exists public.tags (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null unique,
    slug text not null unique
);

-- Create junction tables for tags
create table if not exists public.podcast_tags (
    podcast_id uuid references public.podcasts(id) on delete cascade,
    tag_id uuid references public.tags(id) on delete cascade,
    primary key (podcast_id, tag_id)
);

create table if not exists public.episode_tags (
    episode_id uuid references public.episodes(id) on delete cascade,
    tag_id uuid references public.tags(id) on delete cascade,
    primary key (episode_id, tag_id)
);

create table if not exists public.article_tags (
    article_id uuid references public.articles(id) on delete cascade,
    tag_id uuid references public.tags(id) on delete cascade,
    primary key (article_id, tag_id)
);

create table if not exists public.resource_tags (
    resource_id uuid references public.resources(id) on delete cascade,
    tag_id uuid references public.tags(id) on delete cascade,
    primary key (resource_id, tag_id)
);

-- Create profiles table
create table if not exists public.profiles (
    id uuid references auth.users(id) primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    username text unique,
    full_name text,
    avatar_url text,
    website text,
    bio text
);

-- Create authors table
create table if not exists public.authors (
    id uuid references auth.users(id) primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    display_name text not null,
    bio text,
    avatar_url text,
    social_links jsonb
);

-- Create functions for automatic slug generation
create or replace function generate_slug(title text)
returns text as $$
begin
  return lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'));
end;
$$ language plpgsql;

-- Create triggers for automatic updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create triggers
do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'update_podcasts_updated_at'
    and tgrelid = 'public.podcasts'::regclass
  ) then
    create trigger update_podcasts_updated_at
      before update on podcasts
      for each row
      execute function update_updated_at_column();
  end if;

  if not exists (
    select 1 from pg_trigger
    where tgname = 'update_episodes_updated_at'
    and tgrelid = 'public.episodes'::regclass
  ) then
    create trigger update_episodes_updated_at
      before update on episodes
      for each row
      execute function update_updated_at_column();
  end if;

  if not exists (
    select 1 from pg_trigger
    where tgname = 'update_articles_updated_at'
    and tgrelid = 'public.articles'::regclass
  ) then
    create trigger update_articles_updated_at
      before update on articles
      for each row
      execute function update_updated_at_column();
  end if;

  if not exists (
    select 1 from pg_trigger
    where tgname = 'update_resources_updated_at'
    and tgrelid = 'public.resources'::regclass
  ) then
    create trigger update_resources_updated_at
      before update on resources
      for each row
      execute function update_updated_at_column();
  end if;

  if not exists (
    select 1 from pg_trigger
    where tgname = 'update_profiles_updated_at'
    and tgrelid = 'public.profiles'::regclass
  ) then
    create trigger update_profiles_updated_at
      before update on profiles
      for each row
      execute function update_updated_at_column();
  end if;

  if not exists (
    select 1 from pg_trigger
    where tgname = 'update_authors_updated_at'
    and tgrelid = 'public.authors'::regclass
  ) then
    create trigger update_authors_updated_at
      before update on authors
      for each row
      execute function update_updated_at_column();
  end if;
end $$;
