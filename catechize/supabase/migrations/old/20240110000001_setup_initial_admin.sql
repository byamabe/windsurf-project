-- Insert the admin role if it doesn't exist
insert into roles (name)
values ('admin')
on conflict (name) do nothing;

-- Function to setup initial admin
create or replace function setup_initial_admin(admin_email text)
returns void as $$
declare
  admin_user_id uuid;
  admin_role_id uuid;
begin
  -- Get the user id
  select id into admin_user_id
  from auth.users
  where email = admin_email;

  if admin_user_id is null then
    raise exception 'User with email % not found', admin_email;
  end if;

  -- Get the admin role id
  select id into admin_role_id
  from roles
  where name = 'admin';

  -- Assign admin role
  insert into user_roles (user_id, role_id)
  values (admin_user_id, admin_role_id)
  on conflict (user_id, role_id) do nothing;

  -- Create initial subscription
  insert into user_subscriptions (
    user_id,
    subscription_tier,
    status,
    start_date
  )
  values (
    admin_user_id,
    'institution',
    'active',
    now()
  )
  on conflict (user_id) do update
  set 
    subscription_tier = 'institution',
    status = 'active',
    start_date = now();

end;
$$ language plpgsql security definer;
