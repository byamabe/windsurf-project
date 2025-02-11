do $$ begin
  create type activity_type as enum ('user', 'subscription', 'podcast');
exception
  when duplicate_object then null;
end $$;

create table if not exists admin_activity_log (
  id uuid default uuid_generate_v4() primary key,
  admin_id uuid references auth.users(id) not null,
  type activity_type not null,
  description text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  metadata jsonb
);

-- Add RLS policies
alter table admin_activity_log enable row level security;

do $$ 
begin
  if not exists (
    select 1 from pg_policies 
    where tablename = 'admin_activity_log' 
    and policyname = 'Admins can view all activity logs'
  ) then
    create policy "Admins can view all activity logs"
      on admin_activity_log for select
      using (
        exists (
          select 1
          from user_roles ur
          join roles r on r.id = ur.role_id
          where ur.user_id = auth.uid()
          and r.name = 'admin'
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'admin_activity_log' 
    and policyname = 'Only admins can insert activity logs'
  ) then
    create policy "Only admins can insert activity logs"
      on admin_activity_log for insert
      with check (
        exists (
          select 1
          from user_roles ur
          join roles r on r.id = ur.role_id
          where ur.user_id = auth.uid()
          and r.name = 'admin'
        )
      );
  end if;
end $$;

-- Create function to log admin activity
create or replace function log_admin_activity(
  activity_type activity_type,
  activity_description text,
  activity_metadata jsonb default '{}'::jsonb
) returns uuid as $$
declare
  new_log_id uuid;
begin
  -- Check if user is admin
  if not exists (
    select 1
    from user_roles ur
    join roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
    and r.name = 'admin'
  ) then
    raise exception 'Only admins can log activities';
  end if;

  -- Insert the activity log
  insert into admin_activity_log (admin_id, type, description, metadata)
  values (auth.uid(), activity_type, activity_description, activity_metadata)
  returning id into new_log_id;

  return new_log_id;
end;
$$ language plpgsql security definer;
