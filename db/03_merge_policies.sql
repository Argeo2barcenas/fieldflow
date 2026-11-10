-- FieldFlow: merge overlapping RLS policies (fixes Performance Advisor warnings)
-- Run ONCE in Supabase > SQL Editor, after 02_security_hardening.sql.
--
-- Problem: each table had an "office full access" policy (all actions) PLUS
-- technician policies for the same actions. Postgres evaluates every
-- permissive policy on every query. Fix: exactly ONE policy per table and
-- action, combining both conditions with OR. Access rules do not change.

begin;

-- ---------------------------------------------------------------------
-- customers
-- ---------------------------------------------------------------------
drop policy "customers: office full access" on public.customers;
drop policy "customers: technician reads own jobs' customers" on public.customers;

create policy "customers: select"
  on public.customers for select to authenticated
  using (
    (select private.app_role()) = 'office'
    or exists (
      select 1 from public.jobs j
      where j.customer_id = customers.id
        and j.technician_id = (select auth.uid())
    )
  );

create policy "customers: insert"
  on public.customers for insert to authenticated
  with check ((select private.app_role()) = 'office');

create policy "customers: update"
  on public.customers for update to authenticated
  using ((select private.app_role()) = 'office')
  with check ((select private.app_role()) = 'office');

create policy "customers: delete"
  on public.customers for delete to authenticated
  using ((select private.app_role()) = 'office');

-- ---------------------------------------------------------------------
-- jobs
-- ---------------------------------------------------------------------
drop policy "jobs: office full access" on public.jobs;
drop policy "jobs: technician reads own" on public.jobs;
drop policy "jobs: technician updates own" on public.jobs;

create policy "jobs: select"
  on public.jobs for select to authenticated
  using (
    (select private.app_role()) = 'office'
    or technician_id = (select auth.uid())
  );

create policy "jobs: insert"
  on public.jobs for insert to authenticated
  with check ((select private.app_role()) = 'office');

-- Technicians may update their own jobs; the guard trigger limits which columns.
create policy "jobs: update"
  on public.jobs for update to authenticated
  using (
    (select private.app_role()) = 'office'
    or technician_id = (select auth.uid())
  )
  with check (
    (select private.app_role()) = 'office'
    or technician_id = (select auth.uid())
  );

create policy "jobs: delete"
  on public.jobs for delete to authenticated
  using ((select private.app_role()) = 'office');

-- ---------------------------------------------------------------------
-- job_costs
-- ---------------------------------------------------------------------
drop policy "costs: office full access" on public.job_costs;
drop policy "costs: technician reads own jobs" on public.job_costs;
drop policy "costs: technician adds to own jobs" on public.job_costs;

create policy "costs: select"
  on public.job_costs for select to authenticated
  using (
    (select private.app_role()) = 'office'
    or exists (
      select 1 from public.jobs j
      where j.id = job_costs.job_id
        and j.technician_id = (select auth.uid())
    )
  );

create policy "costs: insert"
  on public.job_costs for insert to authenticated
  with check (
    (select private.app_role()) = 'office'
    or exists (
      select 1 from public.jobs j
      where j.id = job_costs.job_id
        and j.technician_id = (select auth.uid())
    )
  );

create policy "costs: update"
  on public.job_costs for update to authenticated
  using ((select private.app_role()) = 'office')
  with check ((select private.app_role()) = 'office');

create policy "costs: delete"
  on public.job_costs for delete to authenticated
  using ((select private.app_role()) = 'office');

commit;
