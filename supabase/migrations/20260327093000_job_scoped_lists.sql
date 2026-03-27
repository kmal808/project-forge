/*
  Job-scoped parent list entities for crew workflows.

  Adds:
    - punch_lists
    - material_lists
    - punch_list.list_id
    - materials.list_id

  Notes:
    - Compatibility-safe: does not drop legacy columns.
    - list_id remains nullable during rollout.
*/

-- Parent table for punch list jobs
create table if not exists public.punch_lists (
  id uuid primary key default gen_random_uuid(),
  crew_id uuid not null references public.crews(id) on delete cascade,
  job_name text not null,
  job_number text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Parent table for material list jobs
create table if not exists public.material_lists (
  id uuid primary key default gen_random_uuid(),
  crew_id uuid not null references public.crews(id) on delete cascade,
  job_name text not null,
  job_number text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One list per job number per crew
create unique index if not exists punch_lists_crew_job_number_unique
  on public.punch_lists (crew_id, job_number);

create unique index if not exists material_lists_crew_job_number_unique
  on public.material_lists (crew_id, job_number);

-- Add list_id to existing item tables (nullable for compatibility)
alter table public.punch_list
  add column if not exists list_id uuid references public.punch_lists(id) on delete cascade;

alter table public.materials
  add column if not exists list_id uuid references public.material_lists(id) on delete cascade;

create index if not exists punch_list_list_id_idx on public.punch_list(list_id);
create index if not exists materials_list_id_idx on public.materials(list_id);

-- Enable RLS on new parent tables
alter table public.punch_lists enable row level security;
alter table public.material_lists enable row level security;

-- Policies:
-- - admin can manage all rows
-- - non-admin can manage rows they own
drop policy if exists "punch_lists_all_admin_or_owner" on public.punch_lists;
create policy "punch_lists_all_admin_or_owner"
  on public.punch_lists
  for all
  to authenticated
  using (public.is_admin(auth.uid()) or user_id = auth.uid())
  with check (public.is_admin(auth.uid()) or user_id = auth.uid());

drop policy if exists "material_lists_all_admin_or_owner" on public.material_lists;
create policy "material_lists_all_admin_or_owner"
  on public.material_lists
  for all
  to authenticated
  using (public.is_admin(auth.uid()) or user_id = auth.uid())
  with check (public.is_admin(auth.uid()) or user_id = auth.uid());

-- Keep updated_at fresh on parent tables
drop trigger if exists update_punch_lists_updated_at on public.punch_lists;
create trigger update_punch_lists_updated_at
  before update on public.punch_lists
  for each row
  execute function public.update_updated_at_column();

drop trigger if exists update_material_lists_updated_at on public.material_lists;
create trigger update_material_lists_updated_at
  before update on public.material_lists
  for each row
  execute function public.update_updated_at_column();

