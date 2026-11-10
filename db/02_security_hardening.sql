-- FieldFlow: security hardening (fixes the 3 Security Advisor warnings)
-- Run ONCE in Supabase > SQL Editor, after schema.sql and seed.sql.

-- =====================================================================
-- 1. rls_auto_enable(): created by Supabase when "Enable automatic RLS"
--    is on. It is an event-trigger helper; nobody should call it through
--    the API (/rest/v1/rpc/...), so we remove that permission.
--    This clears the warnings for the anon and authenticated roles.
-- =====================================================================
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

-- =====================================================================
-- 2. app_role(): our own helper. RLS policies need it, but it should not
--    live in the "public" schema, because every function there is
--    reachable through the API. We move it to a private schema that the
--    API does not expose. Existing policies keep working: Postgres tracks
--    functions by ID, not by name.
-- =====================================================================
create schema if not exists private;
grant usage on schema private to authenticated;

alter function public.app_role() set schema private;

-- The technician guard calls app_role() by name, so it must be recreated.
create or replace function public.jobs_technician_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null
     and (select private.app_role()) is distinct from 'office' then
    if (new.customer_id, new.technician_id, new.title, new.description,
        new.price, new.scheduled_at, new.created_at)
       is distinct from
       (old.customer_id, old.technician_id, old.title, old.description,
        old.price, old.scheduled_at, old.created_at) then
      raise exception 'Technicians can only update status, field_notes and customer_summary';
    end if;
  end if;
  return new;
end;
$$;
