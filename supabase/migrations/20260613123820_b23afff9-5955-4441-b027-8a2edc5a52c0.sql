
-- Roles enum + table
create type public.app_role as enum ('admin', 'staff', 'user');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "Users view own profile" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Users view own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

-- Security definer role checker
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- updated_at helper
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $$
begin new.updated_at = now(); return new; end; $$;

create trigger trg_profiles_updated_at before update on public.profiles
for each row execute function public.update_updated_at_column();

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    new.email
  );
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Lock down appointments & contacts to admins only for read/update/delete
drop policy if exists "Authenticated staff can view appointments" on public.appointments;
drop policy if exists "Authenticated staff can update appointments" on public.appointments;
drop policy if exists "Authenticated staff can view contacts" on public.contacts;

create policy "Admins view appointments" on public.appointments for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins update appointments" on public.appointments for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete appointments" on public.appointments for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy "Admins view contacts" on public.contacts for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete contacts" on public.contacts for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Add updated_at + notes/status maintained columns to appointments
alter table public.appointments add column if not exists updated_at timestamptz not null default now();
create trigger trg_appointments_updated_at before update on public.appointments
for each row execute function public.update_updated_at_column();
