-- Log database objects before dropping
do $$ 
declare
  tables text;
  policies text;
  triggers text;
  functions text;
  types text;
begin
  -- Log tables
  SELECT string_agg(table_schema || '.' || table_name, ', ') 
  INTO tables
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';
  
  -- Log policies
  SELECT string_agg(policyname, ', ')
  INTO policies
  FROM pg_policies
  WHERE schemaname = 'public';
  
  -- Log triggers
  SELECT string_agg(tgname, ', ')
  INTO triggers
  FROM pg_trigger t
  JOIN pg_class c ON t.tgrelid = c.oid
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname = 'public';
  
  -- Log functions
  SELECT string_agg(proname, ', ')
  INTO functions
  FROM pg_proc
  WHERE pronamespace = 'public'::regnamespace;
  
  -- Log types
  SELECT string_agg(typname, ', ')
  INTO types
  FROM pg_type 
  WHERE typnamespace = 'public'::regnamespace 
  AND typtype = 'e';

  raise notice 'Database objects before dropping:';
  raise notice 'Tables: %', COALESCE(tables, 'none');
  raise notice 'Policies: %', COALESCE(policies, 'none');
  raise notice 'Triggers: %', COALESCE(triggers, 'none');
  raise notice 'Functions: %', COALESCE(functions, 'none');
  raise notice 'Types: %', COALESCE(types, 'none');
end $$;

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
    raise notice 'Disabled trigger % on table %', r.trigger_name, r.event_object_table;
  end loop;

  -- Drop policies
  for r in (
    select policyname, tablename 
    from pg_policies 
    where schemaname = 'public'
  ) loop
    execute format('drop policy if exists %I on %I', r.policyname, r.tablename);
    raise notice 'Dropped policy % on table %', r.policyname, r.tablename;
  end loop;

  -- Drop tables
  for r in (
    select tablename 
    from pg_tables 
    where schemaname = 'public'
  ) loop
    execute 'drop table if exists public.' || quote_ident(r.tablename) || ' cascade';
    raise notice 'Dropped table %', r.tablename;
  end loop;

  -- Drop functions
  for r in (
    select proname, oid 
    from pg_proc 
    where pronamespace = 'public'::regnamespace
  ) loop
    execute 'drop function if exists public.' || quote_ident(r.proname) || '() cascade';
    raise notice 'Dropped function %', r.proname;
  end loop;

  -- Drop types
  for r in (
    select typname 
    from pg_type 
    where typnamespace = 'public'::regnamespace 
    and typtype = 'e'
  ) loop
    execute 'drop type if exists public.' || quote_ident(r.typname) || ' cascade';
    raise notice 'Dropped type %', r.typname;
  end loop;
end $$;

-- Log database objects after dropping
do $$ 
declare
  tables text;
  policies text;
  triggers text;
  functions text;
  types text;
begin
  -- Check remaining tables
  SELECT string_agg(table_schema || '.' || table_name, ', ') 
  INTO tables
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';
  
  -- Check remaining policies
  SELECT string_agg(policyname, ', ')
  INTO policies
  FROM pg_policies
  WHERE schemaname = 'public';
  
  -- Check remaining triggers
  SELECT string_agg(tgname, ', ')
  INTO triggers
  FROM pg_trigger t
  JOIN pg_class c ON t.tgrelid = c.oid
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname = 'public';
  
  -- Check remaining functions
  SELECT string_agg(proname, ', ')
  INTO functions
  FROM pg_proc
  WHERE pronamespace = 'public'::regnamespace;
  
  -- Check remaining types
  SELECT string_agg(typname, ', ')
  INTO types
  FROM pg_type 
  WHERE typnamespace = 'public'::regnamespace 
  AND typtype = 'e';

  raise notice 'Database objects after dropping:';
  raise notice 'Remaining tables: %', COALESCE(tables, 'none');
  raise notice 'Remaining policies: %', COALESCE(policies, 'none');
  raise notice 'Remaining triggers: %', COALESCE(triggers, 'none');
  raise notice 'Remaining functions: %', COALESCE(functions, 'none');
  raise notice 'Remaining types: %', COALESCE(types, 'none');
end $$;
