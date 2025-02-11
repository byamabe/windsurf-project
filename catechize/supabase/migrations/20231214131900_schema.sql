-- Create extensions
create extension if not exists "uuid-ossp";

-- Create enum types
do $$ begin
  create type public.subscription_tier as enum (
    'free',
    'basic',
    'premium',
    'institution'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.content_status as enum (
    'draft',
    'published',
    'archived'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.resource_type as enum (
    'document',
    'video',
    'audio',
    'link'
  );
exception
  when duplicate_object then null;
end $$;

-- Create roles and permissions tables
create table if not exists public.roles (
    id uuid default gen_random_uuid() primary key,
    name text not null unique,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.permissions (
    id uuid default gen_random_uuid() primary key,
    name text not null unique,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.role_permissions (
    role_id uuid references public.roles(id) on delete cascade,
    permission_id uuid references public.permissions(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (role_id, permission_id)
);

create table if not exists public.user_roles (
    user_id uuid references auth.users(id) on delete cascade,
    role_id uuid references public.roles(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (user_id, role_id)
);

-- Create user-related tables
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

create table if not exists public.user_subscriptions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null unique,
    tier subscription_tier not null default 'free',
    is_active boolean not null default true,
    starts_at timestamp with time zone not null default now(),
    ends_at timestamp with time zone,
    metadata jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create content-related tables
create table if not exists public.categories (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null unique,
    slug text not null unique,
    description text,
    parent_id uuid references public.categories(id)
);

create table if not exists public.podcasts (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    title text not null,
    slug text not null unique,
    description text,
    cover_image_url text,
    rss_feed_url text unique,
    website_url text,
    author_id uuid references auth.users(id),
    status content_status not null default 'draft'
);

create table if not exists public.episodes (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    podcast_id uuid references public.podcasts(id) not null,
    title text not null,
    slug text not null,
    description text,
    audio_url text,
    video_url text,
    transcript text,
    duration integer,
    published_at timestamp with time zone,
    status content_status not null default 'draft',
    is_premium boolean not null default false,
    unique(podcast_id, slug)
);

create table if not exists public.resources (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    episode_id uuid references public.episodes(id) not null,
    title text not null,
    description text,
    url text not null,
    type resource_type not null,
    is_premium boolean not null default false,
    metadata jsonb
);

create table if not exists public.episode_categories (
    episode_id uuid references public.episodes(id) not null,
    category_id uuid references public.categories(id) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (episode_id, category_id)
);

-- Enable RLS on all tables
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_roles enable row level security;
alter table public.profiles enable row level security;
alter table public.user_subscriptions enable row level security;
alter table public.categories enable row level security;
alter table public.podcasts enable row level security;
alter table public.episodes enable row level security;
alter table public.resources enable row level security;
alter table public.episode_categories enable row level security;
