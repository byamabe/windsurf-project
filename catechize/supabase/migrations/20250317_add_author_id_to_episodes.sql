alter table episodes
add column author_id uuid references auth.users(id);

-- backfill existing episodes with the first admin user's id
update episodes
set author_id = (
  select id from auth.users
  where raw_user_meta_data->>'role' = 'admin'
  limit 1
)
where author_id is null;
