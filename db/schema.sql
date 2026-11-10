-- FieldFlow: database schema (Supabase / Postgres)
-- Run this once in Supabase > SQL Editor. All data in this project is fictional.

-- =====================================================================
-- 1. TABLES
-- =====================================================================

-- One profile per login. The role decides what each person can do.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  role text not null default 'technician' check (role in ('office', 'technician')),
  created_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  address text,
  created_at timestamptz not null default now()
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete restrict,
  technician_id uuid references public.profiles (id) on delete set null,
  title text not null,
  description text,
  status text not null default 'new'
    check (status in ('new', 'assigned', 'in_progress', 'done')),
  price numeric(12, 2) not null default 0 check (price >= 0),
  scheduled_at timestamptz,
  field_notes text,
  customer_summary text,
  created_at timestamptz not null default now()
);

create table public.job_costs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  kind text not null check (kind in ('material', 'labor', 'other')),
  description text not null,
  quantity numeric(10, 2) not null default 1 check (quantity > 0),
  unit_cost numeric(12, 2) not null check (unit_cost >= 0),
  created_at timestamptz not null default now()
);

-- Indexes on foreign keys keep joins and RLS checks fast.
create index jobs_technician_id_idx on public.jobs (technician_id);
create index jobs_customer_id_idx on public.jobs (customer_id);
create index job_costs_job_id_idx on public.job_costs (job_id);

-- =====================================================================
-- 2. HELPER FUNCTIONS
-- =====================================================================

-- Returns the role ('office' or 'technician') of the logged-in user.
-- SECURITY DEFINER lets it read profiles without triggering RLS recursion.
create or replace function public.app_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = (select auth.uid());
$$;

revoke all on function public.app_role() from public, anon;
grant execute on function public.app_role() to authenticated;

-- Creates a profile automatically when someone signs up.
-- New users are always technicians; an office user is promoted manually.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Technicians may only change status, field_notes and customer_summary.
-- RLS cannot restrict columns, so this trigger does it.
-- Edits made from the SQL editor (no logged-in user) are not restricted.
create or replace function public.jobs_technician_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null
     and (select public.app_role()) is distinct from 'office' then
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

create trigger jobs_technician_guard
  before update on public.jobs
  for each row execute function public.jobs_technician_guard();

-- =====================================================================
-- 3. ROW LEVEL SECURITY
-- =====================================================================
-- Rule: no policy = no access. Anonymous visitors get nothing.

alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.jobs enable row level security;
alter table public.job_costs enable row level security;

-- profiles: everyone reads their own; office reads all. Nobody edits from the app.
create policy "profiles: read own, office reads all"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.app_role()) = 'office');

-- customers: office manages them; technicians only see customers of their jobs.
create policy "customers: office full access"
  on public.customers for all to authenticated
  using ((select public.app_role()) = 'office')
  with check ((select public.app_role()) = 'office');

create policy "customers: technician reads own jobs' customers"
  on public.customers for select to authenticated
  using (exists (
    select 1 from public.jobs j
    where j.customer_id = customers.id
      and j.technician_id = (select auth.uid())
  ));

-- jobs: office manages them; technicians read and update only their own.
create policy "jobs: office full access"
  on public.jobs for all to authenticated
  using ((select public.app_role()) = 'office')
  with check ((select public.app_role()) = 'office');

create policy "jobs: technician reads own"
  on public.jobs for select to authenticated
  using (technician_id = (select auth.uid()));

create policy "jobs: technician updates own"
  on public.jobs for update to authenticated
  using (technician_id = (select auth.uid()))
  with check (technician_id = (select auth.uid()));

-- job_costs: office manages them; technicians read and add costs on their own jobs.
create policy "costs: office full access"
  on public.job_costs for all to authenticated
  using ((select public.app_role()) = 'office')
  with check ((select public.app_role()) = 'office');

create policy "costs: technician reads own jobs"
  on public.job_costs for select to authenticated
  using (exists (
    select 1 from public.jobs j
    where j.id = job_costs.job_id
      and j.technician_id = (select auth.uid())
  ));

create policy "costs: technician adds to own jobs"
  on public.job_costs for insert to authenticated
  with check (exists (
    select 1 from public.jobs j
    where j.id = job_costs.job_id
      and j.technician_id = (select auth.uid())
  ));

-- =====================================================================
-- 4. PRIVILEGES (new tables are not exposed automatically)
-- =====================================================================
-- Grants say WHICH operations are possible; policies above say FOR WHICH ROWS.
-- The anon role gets nothing.

grant select on public.profiles to authenticated;
grant select, insert, update, delete on public.customers to authenticated;
grant select, insert, update, delete on public.jobs to authenticated;
grant select, insert, update, delete on public.job_costs to authenticated;

-- =====================================================================
-- 5. MARGIN REPORT
-- =====================================================================
-- security_invoker makes the view respect the caller's RLS policies.
create view public.job_margins
with (security_invoker = true) as
select
  j.id as job_id,
  j.title,
  j.status,
  j.price,
  coalesce(sum(c.quantity * c.unit_cost), 0)::numeric(12, 2) as total_cost,
  (j.price - coalesce(sum(c.quantity * c.unit_cost), 0))::numeric(12, 2) as margin
from public.jobs j
left join public.job_costs c on c.job_id = j.id
group by j.id;

grant select on public.job_margins to authenticated;
