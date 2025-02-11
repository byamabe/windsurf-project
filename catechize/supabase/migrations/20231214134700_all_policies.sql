-- Drop all existing policies
drop policy if exists "Roles are viewable by authenticated users" on public.roles;
drop policy if exists "Permissions are viewable by authenticated users" on public.permissions;
drop policy if exists "Role permissions are viewable by authenticated users" on public.role_permissions;
drop policy if exists "User roles are viewable by authenticated users" on public.user_roles;
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can view their own subscriptions" on public.user_subscriptions;
drop policy if exists "Categories are viewable by everyone" on public.categories;
drop policy if exists "Published podcasts are viewable by everyone" on public.podcasts;
drop policy if exists "Draft podcasts are viewable by authors" on public.podcasts;
drop policy if exists "Admins can manage podcasts" on public.podcasts;
drop policy if exists "Episodes are viewable by everyone" on public.episodes;
drop policy if exists "Authors can create episodes" on public.episodes;
drop policy if exists "Authors can update their episodes" on public.episodes;
drop policy if exists "Authors can delete their episodes" on public.episodes;

-- Role and Permission policies
create policy "Roles are viewable by authenticated users"
    on public.roles for select
    using (auth.role() = 'authenticated');

create policy "Permissions are viewable by authenticated users"
    on public.permissions for select
    using (auth.role() = 'authenticated');

create policy "Role permissions are viewable by authenticated users"
    on public.role_permissions for select
    using (auth.role() = 'authenticated');

create policy "User roles are viewable by authenticated users"
    on public.user_roles for select
    using (auth.role() = 'authenticated');

-- Profile policies
create policy "Public profiles are viewable by everyone"
    on public.profiles for select
    using (true);

create policy "Users can insert their own profile"
    on public.profiles for insert
    with check (auth.uid() = id);

create policy "Users can update own profile"
    on public.profiles for update
    using (auth.uid() = id);

-- Subscription policies
create policy "Users can view their own subscriptions"
    on public.user_subscriptions for select
    using (auth.uid() = user_id);

-- Content policies
create policy "Categories are viewable by everyone"
    on public.categories for select
    using (true);

create policy "Published podcasts are viewable by everyone"
    on public.podcasts for select
    using (status = 'published');

create policy "Draft podcasts are viewable by authors"
    on public.podcasts for select
    using (auth.uid() = author_id and status = 'draft');

create policy "Admins can manage podcasts"
    on public.podcasts for all
    using (
        exists (
            select 1
            from public.user_roles ur
            join public.roles r on r.id = ur.role_id
            where ur.user_id = auth.uid()
            and r.name = 'admin'
        )
    );

-- Episode policies
create policy "Episodes are viewable by everyone"
    on public.episodes for select
    using (true);

create policy "Authors can create episodes"
    on public.episodes for insert
    with check (
        exists (
            select 1 from public.podcasts
            where id = podcast_id
            and author_id = auth.uid()
        )
    );

create policy "Authors can update their episodes"
    on public.episodes for update
    using (
        exists (
            select 1 from public.podcasts
            where id = podcast_id
            and author_id = auth.uid()
        )
    );

create policy "Authors can delete their episodes"
    on public.episodes for delete
    using (
        exists (
            select 1 from public.podcasts
            where id = podcast_id
            and author_id = auth.uid()
        )
    );
