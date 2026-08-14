-- Khedmat durable notification inbox
--
-- Purpose:
-- - Persist notification history in Supabase instead of AsyncStorage.
-- - Keep customer and provider-workspace notifications separated.
-- - Allow authenticated clients to read only their own notifications.
-- - Allow clients to mark their own notifications as read, but not create,
--   delete, retarget, or rewrite notification content.
-- - Leave push delivery for a later migration/Edge Function.
--
-- Design notes:
-- - recipient_user_id always identifies the authenticated Supabase user.
-- - provider notifications additionally carry recipient_provider_id so one
--   user with multiple provider accounts receives notifications in the
--   correct provider workspace.
-- - booking_id is nullable because system/message notifications may not
--   always belong to a booking.
-- - dedupe_key prevents the same backend event from creating duplicates.
-- - navigation routes are intentionally NOT stored in the database. The app
--   will map trusted notification types to known routes.

create table public.notifications (
  id uuid primary key default gen_random_uuid(),

  recipient_user_id uuid not null
    references public.profiles(id)
    on delete cascade,

  recipient_role text not null
    check (recipient_role in ('customer', 'provider')),

  recipient_provider_id uuid
    references public.provider_accounts(id)
    on delete cascade,

  booking_id uuid
    references public.bookings(id)
    on delete set null,

  type text not null
    check (
      type in (
        'booking-created',
        'booking-confirmed',
        'booking-rescheduled',
        'booking-cancelled',
        'booking-completed',
        'booking-reminder',
        'message',
        'system'
      )
    ),

  priority text not null default 'normal'
    check (priority in ('low', 'normal', 'high')),

  -- Localization keys consumed by the app translation layer.
  title_key text not null,
  body_key text not null,

  body_params jsonb not null default '{}'::jsonb
    check (jsonb_typeof(body_params) = 'object'),

  -- Flexible server-owned metadata for future notification types.
  -- The client must not treat values in this object as arbitrary routes.
  data jsonb not null default '{}'::jsonb
    check (jsonb_typeof(data) = 'object'),

  dedupe_key text not null unique,

  read_at timestamptz,
  created_at timestamptz not null default now(),

  check (pg_catalog.btrim(title_key) <> ''),
  check (pg_catalog.btrim(body_key) <> ''),
  check (pg_catalog.btrim(dedupe_key) <> ''),

  check (
    (
      recipient_role = 'customer'
      and recipient_provider_id is null
    )
    or
    (
      recipient_role = 'provider'
      and recipient_provider_id is not null
    )
  )
);

comment on table public.notifications is
  'Durable Khedmat notification inbox. Server-created; clients may read their own rows and update read_at only.';

comment on column public.notifications.recipient_user_id is
  'Supabase user that owns this notification.';

comment on column public.notifications.recipient_provider_id is
  'Provider-account scope for provider-workspace notifications. Null for customer notifications.';

comment on column public.notifications.dedupe_key is
  'Stable backend event key used to prevent duplicate notification rows.';


-- ---------------------------------------------------------------------------
-- Recipient integrity
-- ---------------------------------------------------------------------------

create or replace function public.validate_notification_recipient()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_provider_owner_id uuid;
  v_booking_customer_id uuid;
  v_booking_provider_id uuid;
begin
  if new.recipient_role = 'provider' then
    select provider.owner_user_id
    into v_provider_owner_id
    from public.provider_accounts as provider
    where provider.id = new.recipient_provider_id;

    if not found then
      raise exception 'Notification provider account was not found.';
    end if;

    if v_provider_owner_id <> new.recipient_user_id then
      raise exception
        'Notification recipient does not own the provider account.';
    end if;
  end if;

  if new.booking_id is not null then
    select
      booking.customer_id,
      booking.provider_id
    into
      v_booking_customer_id,
      v_booking_provider_id
    from public.bookings as booking
    where booking.id = new.booking_id;

    if not found then
      raise exception 'Notification booking was not found.';
    end if;

    if new.recipient_role = 'customer' then
      if v_booking_customer_id is null
         or v_booking_customer_id <> new.recipient_user_id then
        raise exception
          'Notification customer does not own the booking.';
      end if;
    else
      if v_booking_provider_id <> new.recipient_provider_id then
        raise exception
          'Notification provider does not own the booking.';
      end if;
    end if;
  end if;

  return new;
end;
$$;

create trigger validate_notification_recipient
before insert or update of
  recipient_user_id,
  recipient_role,
  recipient_provider_id,
  booking_id
on public.notifications
for each row
execute function public.validate_notification_recipient();


-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index notifications_recipient_created_at_idx
on public.notifications (
  recipient_user_id,
  created_at desc
);

create index notifications_provider_created_at_idx
on public.notifications (
  recipient_provider_id,
  created_at desc
)
where recipient_provider_id is not null;

create index notifications_booking_id_idx
on public.notifications (booking_id)
where booking_id is not null;

create index notifications_unread_recipient_idx
on public.notifications (
  recipient_user_id,
  recipient_role,
  recipient_provider_id,
  created_at desc
)
where read_at is null;


-- ---------------------------------------------------------------------------
-- Row-Level Security
-- ---------------------------------------------------------------------------

alter table public.notifications enable row level security;

create policy "Users can read their own notifications"
on public.notifications
for select
to authenticated
using (
  recipient_user_id = (select auth.uid())
);

create policy "Users can update their own notification read state"
on public.notifications
for update
to authenticated
using (
  recipient_user_id = (select auth.uid())
)
with check (
  recipient_user_id = (select auth.uid())
);


-- ---------------------------------------------------------------------------
-- Privileges
-- ---------------------------------------------------------------------------

-- New public-schema objects are kept explicit, matching the existing project.
revoke all
on table public.notifications
from anon, authenticated;

grant select
on table public.notifications
to authenticated;

-- Mobile clients may only change read_at. They cannot change recipient,
-- notification content, dedupe keys, booking links, or server metadata.
grant update (read_at)
on table public.notifications
to authenticated;

grant all
on table public.notifications
to service_role;

-- Trigger functions are internal database implementation details.
revoke execute
on function public.validate_notification_recipient()
from public, anon, authenticated;
