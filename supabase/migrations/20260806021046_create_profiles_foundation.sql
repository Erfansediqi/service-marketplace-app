-- Khedmat profile foundation
-- Creates customer/provider roles, user profiles, synchronization metadata,
-- automatic Auth profile creation, and Row-Level Security.

create type public.app_role as enum (
  'customer',
  'provider',
  'admin'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  role public.app_role not null default 'customer',

  full_name text not null default '',
  phone text,
  email text,
  avatar_path text,

  preferred_language text not null default 'English'
    check (
      preferred_language in ('English', 'Dari', 'Pashto')
    ),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Incremented whenever the server accepts a profile update.
  -- The offline synchronization layer will use this to detect stale data.
  sync_version bigint not null default 1
    check (sync_version > 0)
);

comment on table public.profiles is
  'Application profile associated one-to-one with auth.users.';

comment on column public.profiles.sync_version is
  'Server-side revision used by the offline synchronization layer.';

create index profiles_role_idx
  on public.profiles using btree (role);


-- Update timestamps and revision numbers automatically.
create or replace function public.set_profile_update_metadata()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  new.sync_version = old.sync_version + 1;

  return new;
end;
$$;

create trigger set_profiles_update_metadata
before update on public.profiles
for each row
execute function public.set_profile_update_metadata();


-- Create a profile automatically after Supabase Auth creates a user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_role public.app_role;
  selected_language text;
begin
  -- A user may request provider access during signup.
  -- Admin access can never be assigned from client metadata.
  selected_role :=
    case
      when new.raw_user_meta_data ->> 'role' = 'provider'
        then 'provider'::public.app_role
      else 'customer'::public.app_role
    end;

  selected_language :=
    case
      when new.raw_user_meta_data ->> 'preferred_language'
        in ('English', 'Dari', 'Pashto')
        then new.raw_user_meta_data ->> 'preferred_language'
      else 'English'
    end;

  insert into public.profiles (
    id,
    role,
    full_name,
    phone,
    email,
    preferred_language
  )
  values (
    new.id,
    selected_role,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      ''
    ),
    coalesce(
      new.phone,
      new.raw_user_meta_data ->> 'phone'
    ),
    new.email,
    selected_language
  );

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();


-- Backfill profiles if Auth users already exist in this development project.
insert into public.profiles (
  id,
  role,
  full_name,
  phone,
  email,
  preferred_language
)
select
  auth_user.id,

  case
    when auth_user.raw_user_meta_data ->> 'role' = 'provider'
      then 'provider'::public.app_role
    else 'customer'::public.app_role
  end,

  coalesce(
    auth_user.raw_user_meta_data ->> 'full_name',
    auth_user.raw_user_meta_data ->> 'name',
    ''
  ),

  coalesce(
    auth_user.phone,
    auth_user.raw_user_meta_data ->> 'phone'
  ),

  auth_user.email,

  case
    when auth_user.raw_user_meta_data ->> 'preferred_language'
      in ('English', 'Dari', 'Pashto')
      then auth_user.raw_user_meta_data ->> 'preferred_language'
    else 'English'
  end

from auth.users as auth_user
on conflict (id) do nothing;


-- Row-Level Security
alter table public.profiles enable row level security;

create policy "Users can read their own profile"
on public.profiles
for select
to authenticated
using (
  (select auth.uid()) = id
);

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (
  (select auth.uid()) = id
)
with check (
  (select auth.uid()) = id
);


-- Remove default client privileges and grant only what is required.
revoke all
on table public.profiles
from anon, authenticated;

grant select
on table public.profiles
to authenticated;

-- Users may edit profile fields but cannot change their role,
-- identifiers, server timestamps, or sync revision.
grant update (
  full_name,
  phone,
  avatar_path,
  preferred_language
)
on table public.profiles
to authenticated;

grant all
on table public.profiles
to service_role;

grant usage
on type public.app_role
to authenticated, service_role;


-- Trigger functions should not be called directly by mobile clients.
revoke execute
on function public.handle_new_user()
from public, anon, authenticated;

revoke execute
on function public.set_profile_update_metadata()
from public, anon, authenticated;
