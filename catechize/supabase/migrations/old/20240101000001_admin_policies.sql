-- Create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.jwt() ->> 'role' = 'admin'
    OR
    EXISTS (
      SELECT 1
      FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing policies to include admin access
do $$ 
declare
  tables_exist boolean;
begin
  -- Check if all required tables exist
  select exists (
    select 1 from information_schema.tables 
    where table_schema = 'public' 
    and table_name in ('categories', 'podcasts', 'episodes', 'articles', 'resources', 'tags')
  ) into tables_exist;

  -- Only proceed if all tables exist
  if tables_exist then
    -- Categories policies
    if exists (
      select 1 from pg_policies 
      where tablename = 'categories' 
      and policyname = 'Categories are updatable by authenticated users'
    ) then
      drop policy "Categories are updatable by authenticated users" on public.categories;
    end if;

    if not exists (
      select 1 from pg_policies 
      where tablename = 'categories' 
      and policyname = 'Categories are updatable by admins'
    ) then
      create policy "Categories are updatable by admins" on public.categories
        for update using (auth.is_admin());
    end if;

    if exists (
      select 1 from pg_policies 
      where tablename = 'categories' 
      and policyname = 'Categories are insertable by authenticated users'
    ) then
      drop policy "Categories are insertable by authenticated users" on public.categories;
    end if;

    if not exists (
      select 1 from pg_policies 
      where tablename = 'categories' 
      and policyname = 'Categories are insertable by admins'
    ) then
      create policy "Categories are insertable by admins" on public.categories
        for insert with check (auth.is_admin());
    end if;

    if not exists (
      select 1 from pg_policies 
      where tablename = 'categories' 
      and policyname = 'Categories are deletable by admins'
    ) then
      create policy "Categories are deletable by admins" on public.categories
        for delete using (auth.is_admin());
    end if;

    -- Only create content policies if the tables have author_id column
    if exists (
      select 1 from information_schema.columns 
      where table_schema = 'public' 
      and table_name = 'podcasts' 
      and column_name = 'author_id'
    ) then
      -- Podcasts policies
      if exists (
        select 1 from pg_policies 
        where tablename = 'podcasts' 
        and policyname = 'Podcasts are updatable by authors'
      ) then
        drop policy "Podcasts are updatable by authors" on public.podcasts;
      end if;

      if not exists (
        select 1 from pg_policies 
        where tablename = 'podcasts' 
        and policyname = 'Podcasts are updatable by authors and admins'
      ) then
        create policy "Podcasts are updatable by authors and admins" on public.podcasts
          for update using (auth.uid() = author_id or auth.is_admin());
      end if;

      if not exists (
        select 1 from pg_policies 
        where tablename = 'podcasts' 
        and policyname = 'Podcasts are deletable by admins'
      ) then
        create policy "Podcasts are deletable by admins" on public.podcasts
          for delete using (auth.is_admin());
      end if;
    end if;

    if exists (
      select 1 from information_schema.columns 
      where table_schema = 'public' 
      and table_name = 'episodes' 
      and column_name = 'author_id'
    ) then
      -- Episodes policies
      if exists (
        select 1 from pg_policies 
        where tablename = 'episodes' 
        and policyname = 'Episodes are updatable by authors'
      ) then
        drop policy "Episodes are updatable by authors" on public.episodes;
      end if;

      if not exists (
        select 1 from pg_policies 
        where tablename = 'episodes' 
        and policyname = 'Episodes are updatable by authors and admins'
      ) then
        create policy "Episodes are updatable by authors and admins" on public.episodes
          for update using (auth.uid() = author_id or auth.is_admin());
      end if;

      if not exists (
        select 1 from pg_policies 
        where tablename = 'episodes' 
        and policyname = 'Episodes are deletable by admins'
      ) then
        create policy "Episodes are deletable by admins" on public.episodes
          for delete using (auth.is_admin());
      end if;
    end if;

    if exists (
      select 1 from information_schema.columns 
      where table_schema = 'public' 
      and table_name = 'articles' 
      and column_name = 'author_id'
    ) then
      -- Articles policies
      if exists (
        select 1 from pg_policies 
        where tablename = 'articles' 
        and policyname = 'Articles are updatable by authors'
      ) then
        drop policy "Articles are updatable by authors" on public.articles;
      end if;

      if not exists (
        select 1 from pg_policies 
        where tablename = 'articles' 
        and policyname = 'Articles are updatable by authors and admins'
      ) then
        create policy "Articles are updatable by authors and admins" on public.articles
          for update using (auth.uid() = author_id or auth.is_admin());
      end if;

      if not exists (
        select 1 from pg_policies 
        where tablename = 'articles' 
        and policyname = 'Articles are deletable by admins'
      ) then
        create policy "Articles are deletable by admins" on public.articles
          for delete using (auth.is_admin());
      end if;
    end if;

    if exists (
      select 1 from information_schema.columns 
      where table_schema = 'public' 
      and table_name = 'resources' 
      and column_name = 'author_id'
    ) then
      -- Resources policies
      if exists (
        select 1 from pg_policies 
        where tablename = 'resources' 
        and policyname = 'Resources are updatable by authors'
      ) then
        drop policy "Resources are updatable by authors" on public.resources;
      end if;

      if not exists (
        select 1 from pg_policies 
        where tablename = 'resources' 
        and policyname = 'Resources are updatable by authors and admins'
      ) then
        create policy "Resources are updatable by authors and admins" on public.resources
          for update using (auth.uid() = author_id or auth.is_admin());
      end if;

      if not exists (
        select 1 from pg_policies 
        where tablename = 'resources' 
        and policyname = 'Resources are deletable by admins'
      ) then
        create policy "Resources are deletable by admins" on public.resources
          for delete using (auth.is_admin());
      end if;
    end if;

    -- Tags policies
    if exists (
      select 1 from pg_policies 
      where tablename = 'tags' 
      and policyname = 'Tags are insertable by authenticated users'
    ) then
      drop policy "Tags are insertable by authenticated users" on public.tags;
    end if;

    if not exists (
      select 1 from pg_policies 
      where tablename = 'tags' 
      and policyname = 'Tags are insertable by admins'
    ) then
      create policy "Tags are insertable by admins" on public.tags
        for insert with check (auth.is_admin());
    end if;

    if not exists (
      select 1 from pg_policies 
      where tablename = 'tags' 
      and policyname = 'Tags are updatable by admins'
    ) then
      create policy "Tags are updatable by admins" on public.tags
        for update using (auth.is_admin());
    end if;

    if not exists (
      select 1 from pg_policies 
      where tablename = 'tags' 
      and policyname = 'Tags are deletable by admins'
    ) then
      create policy "Tags are deletable by admins" on public.tags
        for delete using (auth.is_admin());
    end if;
  end if;
end $$;
