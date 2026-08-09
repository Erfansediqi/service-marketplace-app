-- Khedmat provider verification storage
-- Creates a private Storage bucket for identity-verification images and a
-- private metadata table for identity-document information.
--
-- Storage object path:
--   <owner-user-id>/<provider-id>/<filename>
--
-- The provider owner may upload/replace/delete verification images only while
-- the provider application is draft, pending, or rejected. Once verified or
-- suspended, the submitted evidence cannot be changed by the provider.
--
-- Admin users can read verification submissions and files. Administrative
-- review writes should be performed later through a dedicated secure RPC or
-- service-role backend, not directly by the mobile client.


-- ---------------------------------------------------------------------------
-- Private Storage bucket
-- ---------------------------------------------------------------------------

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'provider-verification',
  'provider-verification',
  false,
  8388608,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif'
  ]::text[]
)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;


-- ---------------------------------------------------------------------------
-- Admin helper
-- ---------------------------------------------------------------------------

create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles as profile
    where profile.id = (select auth.uid())
      and profile.role = 'admin'::public.app_role
  );
$$;

revoke all
on function public.current_user_is_admin()
from public, anon;

grant execute
on function public.current_user_is_admin()
to authenticated, service_role;


-- ---------------------------------------------------------------------------
-- Verification submission metadata
-- ---------------------------------------------------------------------------

create table public.provider_verification_submissions (
  id uuid primary key default gen_random_uuid(),

  provider_id uuid not null unique
    references public.provider_accounts(id)
    on delete cascade,

  owner_user_id uuid not null
    references public.profiles(id)
    on delete cascade,

  identity_number text not null,

  profile_photo_path text not null,
  identity_front_path text not null,
  identity_back_path text,

  declaration_accepted_at timestamptz not null,

  submitted_at timestamptz not null default now(),

  reviewed_at timestamptz,
  reviewed_by uuid
    references public.profiles(id)
    on delete set null,

  review_notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  sync_version bigint not null default 1
    check (sync_version > 0),

  check (
    char_length(pg_catalog.btrim(identity_number))
    between 5 and 128
  ),

  check (
    pg_catalog.btrim(profile_photo_path) <> ''
  ),

  check (
    pg_catalog.btrim(identity_front_path) <> ''
  ),

  check (
    identity_back_path is null
    or pg_catalog.btrim(identity_back_path) <> ''
  )
);

comment on table public.provider_verification_submissions is
  'Private provider identity-verification metadata. Not part of the public provider profile.';

comment on column public.provider_verification_submissions.identity_number is
  'Sensitive identity-document number. Access is restricted by RLS.';

comment on column public.provider_verification_submissions.profile_photo_path is
  'Private verification face-photo path in the provider-verification bucket.';

comment on column public.provider_verification_submissions.identity_front_path is
  'Private identity-document front image path in the provider-verification bucket.';

comment on column public.provider_verification_submissions.identity_back_path is
  'Optional private identity-document back/second-page path in the provider-verification bucket.';


create index provider_verification_submissions_owner_idx
  on public.provider_verification_submissions using btree (
    owner_user_id
  );

create index provider_verification_submissions_submitted_at_idx
  on public.provider_verification_submissions using btree (
    submitted_at desc
  );


-- ---------------------------------------------------------------------------
-- Submission integrity
-- ---------------------------------------------------------------------------

create or replace function public.validate_provider_verification_submission()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_owner_user_id uuid;
  v_verification_status public.provider_verification_status;
  v_expected_prefix text;
begin
  new.identity_number :=
    pg_catalog.btrim(new.identity_number);

  new.profile_photo_path :=
    pg_catalog.btrim(new.profile_photo_path);

  new.identity_front_path :=
    pg_catalog.btrim(new.identity_front_path);

  new.identity_back_path :=
    nullif(
      pg_catalog.btrim(
        coalesce(new.identity_back_path, '')
      ),
      ''
    );

  select
    provider.owner_user_id,
    provider.verification_status
  into
    v_owner_user_id,
    v_verification_status
  from public.provider_accounts as provider
  where provider.id = new.provider_id;

  if not found then
    raise exception 'Provider account was not found.';
  end if;

  if new.owner_user_id <> v_owner_user_id then
    raise exception
      'Verification submission owner does not match provider owner.';
  end if;

  if v_verification_status not in (
    'draft'::public.provider_verification_status,
    'pending'::public.provider_verification_status,
    'rejected'::public.provider_verification_status
  ) then
    raise exception
      'Verification evidence cannot be changed for this provider status.';
  end if;

  v_expected_prefix :=
    new.owner_user_id::text
    || '/'
    || new.provider_id::text
    || '/';

  if left(
    new.profile_photo_path,
    char_length(v_expected_prefix)
  ) <> v_expected_prefix then
    raise exception
      'Profile verification photo path is outside the provider folder.';
  end if;

  if left(
    new.identity_front_path,
    char_length(v_expected_prefix)
  ) <> v_expected_prefix then
    raise exception
      'Identity front path is outside the provider folder.';
  end if;

  if new.identity_back_path is not null
    and left(
      new.identity_back_path,
      char_length(v_expected_prefix)
    ) <> v_expected_prefix
  then
    raise exception
      'Identity back path is outside the provider folder.';
  end if;

  if tg_op = 'UPDATE'
    and (
      new.identity_number
        is distinct from old.identity_number
      or new.profile_photo_path
        is distinct from old.profile_photo_path
      or new.identity_front_path
        is distinct from old.identity_front_path
      or new.identity_back_path
        is distinct from old.identity_back_path
      or new.declaration_accepted_at
        is distinct from old.declaration_accepted_at
    )
  then
    -- A resubmission starts a fresh review cycle.
    new.submitted_at := pg_catalog.now();
    new.reviewed_at := null;
    new.reviewed_by := null;
    new.review_notes := null;
  end if;

  return new;
end;
$$;

create trigger validate_provider_verification_submission
before insert or update of
  provider_id,
  owner_user_id,
  identity_number,
  profile_photo_path,
  identity_front_path,
  identity_back_path,
  declaration_accepted_at
on public.provider_verification_submissions
for each row
execute function public.validate_provider_verification_submission();


-- Reuse the marketplace metadata trigger to maintain updated_at/sync_version.
create trigger set_provider_verification_submission_update_metadata
before update on public.provider_verification_submissions
for each row
execute function public.set_marketplace_update_metadata();


-- ---------------------------------------------------------------------------
-- Row-Level Security: verification metadata
-- ---------------------------------------------------------------------------

alter table public.provider_verification_submissions
enable row level security;


create policy "Owners and admins can read provider verification submissions"
on public.provider_verification_submissions
for select
to authenticated
using (
  owner_user_id = (select auth.uid())
  or public.current_user_is_admin()
);


create policy "Owners can create provider verification submissions"
on public.provider_verification_submissions
for insert
to authenticated
with check (
  owner_user_id = (select auth.uid())
  and exists (
    select 1
    from public.provider_accounts as provider
    where provider.id =
      provider_verification_submissions.provider_id
      and provider.owner_user_id =
        (select auth.uid())
      and provider.verification_status in (
        'draft'::public.provider_verification_status,
        'pending'::public.provider_verification_status,
        'rejected'::public.provider_verification_status
      )
  )
);


create policy "Owners can update provider verification submissions"
on public.provider_verification_submissions
for update
to authenticated
using (
  owner_user_id = (select auth.uid())
  and exists (
    select 1
    from public.provider_accounts as provider
    where provider.id =
      provider_verification_submissions.provider_id
      and provider.owner_user_id =
        (select auth.uid())
      and provider.verification_status in (
        'draft'::public.provider_verification_status,
        'pending'::public.provider_verification_status,
        'rejected'::public.provider_verification_status
      )
  )
)
with check (
  owner_user_id = (select auth.uid())
  and exists (
    select 1
    from public.provider_accounts as provider
    where provider.id =
      provider_verification_submissions.provider_id
      and provider.owner_user_id =
        (select auth.uid())
      and provider.verification_status in (
        'draft'::public.provider_verification_status,
        'pending'::public.provider_verification_status,
        'rejected'::public.provider_verification_status
      )
  )
);


-- ---------------------------------------------------------------------------
-- Row-Level Security: private Storage objects
-- ---------------------------------------------------------------------------
-- folder 1 = authenticated owner UUID
-- folder 2 = provider UUID
--
-- Example:
--   <uid>/<provider-id>/identity-front-1720000000000.jpg


drop policy if exists
  "Provider owners can upload verification files"
on storage.objects;

create policy "Provider owners can upload verification files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'provider-verification'
  and (storage.foldername(name))[1] =
    (select auth.uid())::text
  and exists (
    select 1
    from public.provider_accounts as provider
    where provider.owner_user_id =
      (select auth.uid())
      and provider.id::text =
        (storage.foldername(name))[2]
      and provider.verification_status in (
        'draft'::public.provider_verification_status,
        'pending'::public.provider_verification_status,
        'rejected'::public.provider_verification_status
      )
  )
);


drop policy if exists
  "Provider owners and admins can read verification files"
on storage.objects;

create policy "Provider owners and admins can read verification files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'provider-verification'
  and (
    (
      (storage.foldername(name))[1] =
        (select auth.uid())::text
      and exists (
        select 1
        from public.provider_accounts as provider
        where provider.owner_user_id =
          (select auth.uid())
          and provider.id::text =
            (storage.foldername(name))[2]
      )
    )
    or public.current_user_is_admin()
  )
);


drop policy if exists
  "Provider owners can update verification files"
on storage.objects;

create policy "Provider owners can update verification files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'provider-verification'
  and (storage.foldername(name))[1] =
    (select auth.uid())::text
  and exists (
    select 1
    from public.provider_accounts as provider
    where provider.owner_user_id =
      (select auth.uid())
      and provider.id::text =
        (storage.foldername(name))[2]
      and provider.verification_status in (
        'draft'::public.provider_verification_status,
        'pending'::public.provider_verification_status,
        'rejected'::public.provider_verification_status
      )
  )
)
with check (
  bucket_id = 'provider-verification'
  and (storage.foldername(name))[1] =
    (select auth.uid())::text
  and exists (
    select 1
    from public.provider_accounts as provider
    where provider.owner_user_id =
      (select auth.uid())
      and provider.id::text =
        (storage.foldername(name))[2]
      and provider.verification_status in (
        'draft'::public.provider_verification_status,
        'pending'::public.provider_verification_status,
        'rejected'::public.provider_verification_status
      )
  )
);


drop policy if exists
  "Provider owners can delete verification files"
on storage.objects;

create policy "Provider owners can delete verification files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'provider-verification'
  and (storage.foldername(name))[1] =
    (select auth.uid())::text
  and exists (
    select 1
    from public.provider_accounts as provider
    where provider.owner_user_id =
      (select auth.uid())
      and provider.id::text =
        (storage.foldername(name))[2]
      and provider.verification_status in (
        'draft'::public.provider_verification_status,
        'pending'::public.provider_verification_status,
        'rejected'::public.provider_verification_status
      )
  )
);


-- ---------------------------------------------------------------------------
-- Privileges
-- ---------------------------------------------------------------------------

revoke all
on table public.provider_verification_submissions
from anon, authenticated;


grant select
on table public.provider_verification_submissions
to authenticated;


grant insert (
  provider_id,
  owner_user_id,
  identity_number,
  profile_photo_path,
  identity_front_path,
  identity_back_path,
  declaration_accepted_at
)
on table public.provider_verification_submissions
to authenticated;


grant update (
  identity_number,
  profile_photo_path,
  identity_front_path,
  identity_back_path,
  declaration_accepted_at
)
on table public.provider_verification_submissions
to authenticated;


grant all
on table public.provider_verification_submissions
to service_role;


-- Trigger function is internal.
revoke execute
on function public.validate_provider_verification_submission()
from public, anon, authenticated;