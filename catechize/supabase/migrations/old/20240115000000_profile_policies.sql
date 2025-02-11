-- Enable RLS for profiles
alter table public.profiles enable row level security;

-- Create profile policies
do $$ 
begin
  if not exists (
    select 1 from pg_policies 
    where tablename = 'profiles' 
    and policyname = 'Enable read access for authenticated users'
  ) then
    create policy "Enable read access for authenticated users"
      on public.profiles for select
      to authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'profiles' 
    and policyname = 'Enable insert for authenticated users only'
  ) then
    create policy "Enable insert for authenticated users only"
      on public.profiles for insert
      with check (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'profiles' 
    and policyname = 'Enable update for users based on id'
  ) then
    create policy "Enable update for users based on id"
      on public.profiles for update
      using (auth.uid() = id);
  end if;
end $$;

-- Update the handle_new_user function with security definer
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, new.email);
  return new;
end;
$$;
