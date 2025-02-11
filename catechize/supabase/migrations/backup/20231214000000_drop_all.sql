-- Drop all database objects
do $$ 
declare
  r record;
begin
  -- Disable triggers
  for r in (
    select distinct trigger_name, event_object_table
    from information_schema.triggers
    where trigger_schema = 'public'
  ) loop
    execute format('alter table %I disable trigger %I', r.event_object_table, r.trigger_name);
  end loop;

  -- Drop policies
  for r in (
    select policyname, tablename 
    from pg_policies 
    where schemaname = 'public'
  ) loop
    execute format('drop policy if exists %I on %I', r.policyname, r.tablename);
  end loop;

  -- Drop tables
  for r in (
    select tablename 
    from pg_tables 
    where schemaname = 'public'
  ) loop
    execute 'drop table if exists public.' || quote_ident(r.tablename) || ' cascade';
  end loop;

  -- Drop functions
  for r in (
    select proname, oid 
    from pg_proc 
    where pronamespace = 'public'::regnamespace
  ) loop
    execute 'drop function if exists public.' || quote_ident(r.proname) || '() cascade';
  end loop;

  -- Drop types
  for r in (
    select typname 
    from pg_type 
    where typnamespace = 'public'::regnamespace 
    and typtype = 'e'
  ) loop
    execute 'drop type if exists public.' || quote_ident(r.typname) || ' cascade';
  end loop;
end $$;
