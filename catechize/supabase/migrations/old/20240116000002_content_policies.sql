-- Enable RLS
do $$ 
begin
  -- Enable RLS on all tables if not already enabled
  if not exists (
    select 1 from pg_tables 
    where tablename = 'categories' 
    and rowsecurity = true
  ) then
    alter table public.categories enable row level security;
  end if;

  if not exists (
    select 1 from pg_tables 
    where tablename = 'podcasts' 
    and rowsecurity = true
  ) then
    alter table public.podcasts enable row level security;
  end if;

  if not exists (
    select 1 from pg_tables 
    where tablename = 'episodes' 
    and rowsecurity = true
  ) then
    alter table public.episodes enable row level security;
  end if;

  if not exists (
    select 1 from pg_tables 
    where tablename = 'articles' 
    and rowsecurity = true
  ) then
    alter table public.articles enable row level security;
  end if;

  if not exists (
    select 1 from pg_tables 
    where tablename = 'resources' 
    and rowsecurity = true
  ) then
    alter table public.resources enable row level security;
  end if;

  if not exists (
    select 1 from pg_tables 
    where tablename = 'tags' 
    and rowsecurity = true
  ) then
    alter table public.tags enable row level security;
  end if;

  if not exists (
    select 1 from pg_tables 
    where tablename = 'podcast_tags' 
    and rowsecurity = true
  ) then
    alter table public.podcast_tags enable row level security;
  end if;

  if not exists (
    select 1 from pg_tables 
    where tablename = 'episode_tags' 
    and rowsecurity = true
  ) then
    alter table public.episode_tags enable row level security;
  end if;

  if not exists (
    select 1 from pg_tables 
    where tablename = 'article_tags' 
    and rowsecurity = true
  ) then
    alter table public.article_tags enable row level security;
  end if;

  if not exists (
    select 1 from pg_tables 
    where tablename = 'resource_tags' 
    and rowsecurity = true
  ) then
    alter table public.resource_tags enable row level security;
  end if;

  if not exists (
    select 1 from pg_tables 
    where tablename = 'profiles' 
    and rowsecurity = true
  ) then
    alter table public.profiles enable row level security;
  end if;

  if not exists (
    select 1 from pg_tables 
    where tablename = 'authors' 
    and rowsecurity = true
  ) then
    alter table public.authors enable row level security;
  end if;
end $$;

-- Categories policies
do $$ 
begin
  if not exists (
    select 1 from pg_policies 
    where tablename = 'categories' 
    and policyname = 'Categories are viewable by everyone'
  ) then
    create policy "Categories are viewable by everyone"
      on public.categories for select
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'categories' 
    and policyname = 'Categories are insertable by authenticated users'
  ) then
    create policy "Categories are insertable by authenticated users"
      on public.categories for insert
      with check (auth.role() = 'authenticated');
  end if;
end $$;

-- Content policies (podcasts, episodes, articles, resources)
do $$ 
begin
  -- Podcasts
  if not exists (
    select 1 from pg_policies 
    where tablename = 'podcasts' 
    and policyname = 'Podcasts are viewable by everyone'
  ) then
    create policy "Podcasts are viewable by everyone"
      on public.podcasts for select
      using (status = 'published' or auth.uid() = author_id);
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'podcasts' 
    and policyname = 'Podcasts are insertable by authenticated users'
  ) then
    create policy "Podcasts are insertable by authenticated users"
      on public.podcasts for insert
      with check (auth.role() = 'authenticated');
  end if;

  -- Episodes
  if not exists (
    select 1 from pg_policies 
    where tablename = 'episodes' 
    and policyname = 'Episodes are viewable by everyone'
  ) then
    create policy "Episodes are viewable by everyone"
      on public.episodes for select
      using (status = 'published' or auth.uid() = author_id);
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'episodes' 
    and policyname = 'Episodes are insertable by authenticated users'
  ) then
    create policy "Episodes are insertable by authenticated users"
      on public.episodes for insert
      with check (auth.role() = 'authenticated');
  end if;

  -- Articles
  if not exists (
    select 1 from pg_policies 
    where tablename = 'articles' 
    and policyname = 'Articles are viewable by everyone'
  ) then
    create policy "Articles are viewable by everyone"
      on public.articles for select
      using (status = 'published' or auth.uid() = author_id);
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'articles' 
    and policyname = 'Articles are insertable by authenticated users'
  ) then
    create policy "Articles are insertable by authenticated users"
      on public.articles for insert
      with check (auth.role() = 'authenticated');
  end if;

  -- Resources
  if not exists (
    select 1 from pg_policies 
    where tablename = 'resources' 
    and policyname = 'Resources are viewable by everyone'
  ) then
    create policy "Resources are viewable by everyone"
      on public.resources for select
      using (status = 'published' or auth.uid() = author_id);
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'resources' 
    and policyname = 'Resources are insertable by authenticated users'
  ) then
    create policy "Resources are insertable by authenticated users"
      on public.resources for insert
      with check (auth.role() = 'authenticated');
  end if;
end $$;

-- Tags and junction table policies
do $$ 
begin
  -- Tags
  if not exists (
    select 1 from pg_policies 
    where tablename = 'tags' 
    and policyname = 'Tags are viewable by everyone'
  ) then
    create policy "Tags are viewable by everyone"
      on public.tags for select
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'tags' 
    and policyname = 'Tags are insertable by authenticated users'
  ) then
    create policy "Tags are insertable by authenticated users"
      on public.tags for insert
      with check (auth.role() = 'authenticated');
  end if;

  -- Podcast Tags
  if not exists (
    select 1 from pg_policies 
    where tablename = 'podcast_tags' 
    and policyname = 'Podcast tag relations are viewable by everyone'
  ) then
    create policy "Podcast tag relations are viewable by everyone"
      on public.podcast_tags for select
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'podcast_tags' 
    and policyname = 'Podcast tag relations are insertable by authenticated users'
  ) then
    create policy "Podcast tag relations are insertable by authenticated users"
      on public.podcast_tags for insert
      with check (auth.role() = 'authenticated');
  end if;

  -- Episode Tags
  if not exists (
    select 1 from pg_policies 
    where tablename = 'episode_tags' 
    and policyname = 'Episode tag relations are viewable by everyone'
  ) then
    create policy "Episode tag relations are viewable by everyone"
      on public.episode_tags for select
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'episode_tags' 
    and policyname = 'Episode tag relations are insertable by authenticated users'
  ) then
    create policy "Episode tag relations are insertable by authenticated users"
      on public.episode_tags for insert
      with check (auth.role() = 'authenticated');
  end if;

  -- Article Tags
  if not exists (
    select 1 from pg_policies 
    where tablename = 'article_tags' 
    and policyname = 'Article tag relations are viewable by everyone'
  ) then
    create policy "Article tag relations are viewable by everyone"
      on public.article_tags for select
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'article_tags' 
    and policyname = 'Article tag relations are insertable by authenticated users'
  ) then
    create policy "Article tag relations are insertable by authenticated users"
      on public.article_tags for insert
      with check (auth.role() = 'authenticated');
  end if;

  -- Resource Tags
  if not exists (
    select 1 from pg_policies 
    where tablename = 'resource_tags' 
    and policyname = 'Resource tag relations are viewable by everyone'
  ) then
    create policy "Resource tag relations are viewable by everyone"
      on public.resource_tags for select
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'resource_tags' 
    and policyname = 'Resource tag relations are insertable by authenticated users'
  ) then
    create policy "Resource tag relations are insertable by authenticated users"
      on public.resource_tags for insert
      with check (auth.role() = 'authenticated');
  end if;
end $$;

-- Profile and author policies
do $$ 
begin
  -- Profiles
  if not exists (
    select 1 from pg_policies 
    where tablename = 'profiles' 
    and policyname = 'Anyone can view profiles'
  ) then
    create policy "Anyone can view profiles"
      on public.profiles for select
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'profiles' 
    and policyname = 'Users can insert own profile'
  ) then
    create policy "Users can insert own profile"
      on public.profiles for insert
      with check (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'profiles' 
    and policyname = 'Users can update own profile'
  ) then
    create policy "Users can update own profile"
      on public.profiles for update
      using (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'profiles' 
    and policyname = 'Users can delete own profile'
  ) then
    create policy "Users can delete own profile"
      on public.profiles for delete
      using (auth.uid() = id);
  end if;

  -- Authors
  if not exists (
    select 1 from pg_policies 
    where tablename = 'authors' 
    and policyname = 'Anyone can view authors'
  ) then
    create policy "Anyone can view authors"
      on public.authors for select
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'authors' 
    and policyname = 'Authors can read their own author profile.'
  ) then
    create policy "Authors can read their own author profile."
      on public.authors for select
      using (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'authors' 
    and policyname = 'Authors can update their own author profile.'
  ) then
    create policy "Authors can update their own author profile."
      on public.authors for update
      using (auth.uid() = id)
      with check (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'authors' 
    and policyname = 'Enable insert for authenticated users only.'
  ) then
    create policy "Enable insert for authenticated users only."
      on public.authors for insert
      with check (auth.uid() = id);
  end if;
end $$;
