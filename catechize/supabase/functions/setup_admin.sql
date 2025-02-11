-- First, get your user ID by running:
-- select id from auth.users where email = 'your-email@example.com';

-- Then run this function with your user ID:
do $$
declare
  target_user_id uuid := 'YOUR-USER-ID-HERE'; -- Replace with your actual user ID
begin
  -- Insert admin role if it doesn't exist
  insert into public.roles (name)
  values ('admin')
  on conflict (name) do nothing;

  -- Get admin role ID and insert user role
  with admin_role as (
    select id from public.roles where name = 'admin'
  )
  insert into public.user_roles (user_id, role_id)
  select target_user_id, admin_role.id
  from admin_role
  on conflict (user_id, role_id) do nothing;

  -- Insert or update subscription
  insert into public.user_subscriptions (
    user_id,
    tier,
    status,
    start_date
  )
  values (
    target_user_id,
    'institution'::subscription_tier,
    'active'::subscription_status,
    now()
  )
  on conflict (user_id) 
  do update set
    tier = 'institution'::subscription_tier,
    status = 'active'::subscription_status,
    start_date = now();

  raise notice 'Successfully set up admin user with ID: %', target_user_id;
end;
$$;
