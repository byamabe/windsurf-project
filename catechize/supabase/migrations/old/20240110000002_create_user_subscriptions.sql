-- Create subscription_tier enum type if it doesn't exist
do $$ 
begin
  create type subscription_tier as enum ('free', 'basic', 'premium');
exception
  when duplicate_object then null;
end $$;

-- Create subscription status enum if it doesn't exist
do $$ 
begin
  create type subscription_status as enum ('active', 'inactive', 'cancelled');
exception
  when duplicate_object then null;
end $$;

-- Create user_subscriptions table
create table if not exists public.user_subscriptions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade unique,
    tier subscription_tier not null default 'free',
    starts_at timestamp with time zone default timezone('utc'::text, now()) not null,
    ends_at timestamp with time zone,
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    metadata jsonb default '{}'::jsonb
);

-- Create function to update is_active
create or replace function update_subscription_is_active()
returns trigger as $$
begin
    new.is_active := 
        case
            when new.ends_at is null then true
            when new.ends_at > timezone('utc'::text, now()) then true
            else false
        end;
    return new;
end;
$$ language plpgsql;

-- Create trigger to update is_active
do $$ 
begin
  if not exists (
    select 1 from pg_trigger 
    where tgname = 'update_subscription_is_active_trigger'
    and tgrelid = 'public.user_subscriptions'::regclass
  ) then
    create trigger update_subscription_is_active_trigger
      before insert or update
      on public.user_subscriptions
      for each row
      execute function update_subscription_is_active();
  end if;
end $$;

-- Create function to get user subscription tier
create or replace function public.get_user_subscription_tier(user_id uuid)
returns subscription_tier as $$
begin
    return (
        select tier
        from public.user_subscriptions
        where user_id = $1
        and is_active = true
        limit 1
    );
end;
$$ language plpgsql security definer;

-- Enable RLS
alter table public.user_subscriptions enable row level security;

-- Drop existing policies
drop policy if exists "User subscriptions are viewable by admins and own user" on public.user_subscriptions;
drop policy if exists "User subscriptions are manageable by admins" on public.user_subscriptions;
drop policy if exists "Only admins can insert subscriptions" on public.user_subscriptions;
drop policy if exists "Only admins can update subscriptions" on public.user_subscriptions;
drop policy if exists "Only admins can delete subscriptions" on public.user_subscriptions;

-- Create policies
create policy "User subscriptions are viewable by admins and own user"
    on public.user_subscriptions for select
    using (auth.is_admin() or user_id = auth.uid());

create policy "User subscriptions are manageable by admins"
    on public.user_subscriptions for all
    using (auth.is_admin());

-- Drop existing trigger
drop trigger if exists update_user_subscriptions_updated_at on public.user_subscriptions;

-- Create trigger for updated_at
create trigger update_user_subscriptions_updated_at
    before update on public.user_subscriptions
    for each row
    execute function update_updated_at_column();
