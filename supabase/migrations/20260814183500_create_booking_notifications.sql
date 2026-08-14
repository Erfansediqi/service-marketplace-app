-- Khedmat booking-event notification generation
--
-- Purpose:
-- - Make Supabase, not the mobile client, authoritative for booking
--   notification creation.
-- - Persist durable notification rows for the booking events Khedmat
--   already supports in its translation/UI layer:
--     1) booking-created    -> provider
--     2) booking-confirmed  -> customer
--     3) booking-completed  -> customer
--
-- Later migrations can add cancellation/reminder/message events after their
-- product copy and delivery behavior are finalized.
--
-- Push delivery is NOT implemented here. This migration only creates durable
-- public.notifications rows. A later webhook/Edge Function will deliver them
-- through Expo Push Service -> APNs/FCM.

create or replace function public.create_booking_event_notification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_provider_owner_id uuid;
begin
  -- -------------------------------------------------------------------------
  -- Booking created -> provider workspace
  -- -------------------------------------------------------------------------
  if tg_op = 'INSERT' then
    select provider.owner_user_id
    into v_provider_owner_id
    from public.provider_accounts as provider
    where provider.id = new.provider_id;

    if not found then
      raise exception
        'Provider owner was not found for booking notification.';
    end if;

    insert into public.notifications (
      recipient_user_id,
      recipient_role,
      recipient_provider_id,
      booking_id,
      type,
      priority,
      title_key,
      body_key,
      body_params,
      data,
      dedupe_key
    )
    values (
      v_provider_owner_id,
      'provider',
      new.provider_id,
      new.id,
      'booking-created',
      'high',
      'notificationBookingCreatedTitle',
      'notificationBookingCreatedBody',
      pg_catalog.jsonb_build_object(
        'customerName',
        new.customer_name_snapshot
      ),
      pg_catalog.jsonb_build_object(
        'bookingId',
        new.id
      ),
      pg_catalog.concat(
        'booking:',
        new.id::text,
        ':created'
      )
    )
    on conflict (dedupe_key)
    do nothing;

    return new;
  end if;

  -- Ignore UPDATEs that do not actually change booking status.
  if old.status is not distinct from new.status then
    return new;
  end if;

  -- If the customer account no longer exists, the booking history remains,
  -- but there is no authenticated recipient to notify.
  if new.customer_id is null then
    return new;
  end if;

  -- -------------------------------------------------------------------------
  -- Provider confirmed booking -> customer
  -- -------------------------------------------------------------------------
  if new.status = 'confirmed'::public.booking_status then
    insert into public.notifications (
      recipient_user_id,
      recipient_role,
      recipient_provider_id,
      booking_id,
      type,
      priority,
      title_key,
      body_key,
      body_params,
      data,
      dedupe_key
    )
    values (
      new.customer_id,
      'customer',
      null,
      new.id,
      'booking-confirmed',
      'high',
      'notificationBookingConfirmedTitle',
      'notificationBookingConfirmedBody',
      pg_catalog.jsonb_build_object(
        'providerName',
        new.provider_name_snapshot
      ),
      pg_catalog.jsonb_build_object(
        'bookingId',
        new.id
      ),
      pg_catalog.concat(
        'booking:',
        new.id::text,
        ':confirmed'
      )
    )
    on conflict (dedupe_key)
    do nothing;

    return new;
  end if;

  -- -------------------------------------------------------------------------
  -- Provider completed booking -> customer
  -- -------------------------------------------------------------------------
  if new.status = 'completed'::public.booking_status then
    insert into public.notifications (
      recipient_user_id,
      recipient_role,
      recipient_provider_id,
      booking_id,
      type,
      priority,
      title_key,
      body_key,
      body_params,
      data,
      dedupe_key
    )
    values (
      new.customer_id,
      'customer',
      null,
      new.id,
      'booking-completed',
      'normal',
      'notificationBookingCompletedTitle',
      'notificationBookingCompletedBody',
      pg_catalog.jsonb_build_object(
        'providerName',
        new.provider_name_snapshot
      ),
      pg_catalog.jsonb_build_object(
        'bookingId',
        new.id
      ),
      pg_catalog.concat(
        'booking:',
        new.id::text,
        ':completed'
      )
    )
    on conflict (dedupe_key)
    do nothing;

    return new;
  end if;

  return new;
end;
$$;


-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

create trigger create_booking_insert_notification
after insert
on public.bookings
for each row
execute function public.create_booking_event_notification();

create trigger create_booking_status_notification
after update of status
on public.bookings
for each row
when (old.status is distinct from new.status)
execute function public.create_booking_event_notification();


-- ---------------------------------------------------------------------------
-- Privileges
-- ---------------------------------------------------------------------------

-- Trigger function is an internal backend implementation detail.
revoke execute
on function public.create_booking_event_notification()
from public, anon, authenticated;
