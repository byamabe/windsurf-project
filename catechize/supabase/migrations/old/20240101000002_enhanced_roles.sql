-- Create enum for subscription tiers if it doesn't exist
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

-- Create roles table if it doesn't exist
create table if not exists public.roles (
    id uuid default gen_random_uuid() primary key,
    name text not null unique,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create permissions table if it doesn't exist
create table if not exists public.permissions (
    id uuid default gen_random_uuid() primary key,
    name text not null unique,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create role_permissions junction table if it doesn't exist
create table if not exists public.role_permissions (
    role_id uuid references public.roles(id) on delete cascade,
    permission_id uuid references public.permissions(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (role_id, permission_id)
);

-- Create user_roles junction table if it doesn't exist
create table if not exists public.user_roles (
    user_id uuid references auth.users(id) on delete cascade,
    role_id uuid references public.roles(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (user_id, role_id)
);

-- Insert default roles
insert into public.roles (name, description) 
values 
    ('admin', 'Full system access'),
    ('content_author', 'Can create and manage their own content'),
    ('moderator', 'Can moderate content and users'),
    ('subscriber', 'Has access to premium content'),
    ('basic_user', 'Basic access to public content')
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions
insert into public.permissions (name, description) 
values
    ('create_content', 'Can create new content'),
    ('edit_content', 'Can edit existing content'),
    ('delete_content', 'Can delete content'),
    ('publish_content', 'Can publish content'),
    ('manage_users', 'Can manage user accounts'),
    ('manage_roles', 'Can manage roles and permissions'),
    ('view_premium', 'Can view premium content'),
    ('moderate_content', 'Can moderate content')
ON CONFLICT (name) DO NOTHING;

-- Link roles to permissions
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where 
    (r.name = 'admin') or
    (r.name = 'content_author' and p.name in ('create_content', 'edit_content', 'delete_content', 'publish_content')) or
    (r.name = 'moderator' and p.name in ('moderate_content', 'edit_content', 'delete_content')) or
    (r.name = 'subscriber' and p.name = 'view_premium') or
    (r.name = 'basic_user' and false)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Create helper functions
create or replace function public.get_user_permissions(user_id uuid)
returns table (permission_name text) as $$
begin
    return query
    select distinct p.name
    from public.permissions p
    inner join public.role_permissions rp on p.id = rp.permission_id
    inner join public.user_roles ur on rp.role_id = ur.role_id
    where ur.user_id = $1;
end;
$$ language plpgsql security definer;

create or replace function public.has_permission(user_id uuid, required_permission text)
returns boolean as $$
begin
    return exists (
        select 1
        from public.get_user_permissions(user_id)
        where permission_name = required_permission
    );
end;
$$ language plpgsql security definer;

-- Enable RLS
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_roles enable row level security;

-- Drop existing policies
drop policy if exists "Roles are viewable by authenticated users" on public.roles;
drop policy if exists "Permissions are viewable by authenticated users" on public.permissions;
drop policy if exists "Role permissions are viewable by authenticated users" on public.role_permissions;
drop policy if exists "User roles are viewable by authenticated users" on public.user_roles;
drop policy if exists "Admins can manage roles" on public.roles;
drop policy if exists "Admins can manage permissions" on public.permissions;
drop policy if exists "Admins can manage role permissions" on public.role_permissions;
drop policy if exists "Admins can manage user roles" on public.user_roles;

-- Create policies
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

create policy "Admins can manage roles"
    on public.roles for all
    using (auth.jwt() ->> 'role' = 'admin');

create policy "Admins can manage permissions"
    on public.permissions for all
    using (auth.jwt() ->> 'role' = 'admin');

create policy "Admins can manage role permissions"
    on public.role_permissions for all
    using (auth.jwt() ->> 'role' = 'admin');

create policy "Admins can manage user roles"
    on public.user_roles for all
    using (auth.jwt() ->> 'role' = 'admin');

-- Drop existing triggers
drop trigger if exists update_roles_updated_at on public.roles;
drop trigger if exists update_permissions_updated_at on public.permissions;
drop trigger if exists update_role_permissions_updated_at on public.role_permissions;
drop trigger if exists update_user_roles_updated_at on public.user_roles;

-- Update triggers
create trigger update_roles_updated_at
    before update on public.roles
    for each row
    execute function update_updated_at_column();

create trigger update_permissions_updated_at
    before update on public.permissions
    for each row
    execute function update_updated_at_column();

create trigger update_role_permissions_updated_at
    before update on public.role_permissions
    for each row
    execute function update_updated_at_column();

create trigger update_user_roles_updated_at
    before update on public.user_roles
    for each row
    execute function update_updated_at_column();
