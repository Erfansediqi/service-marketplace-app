-- Khedmat Expo push-delivery receipt tracking
--
-- Purpose:
-- - Persist successful Expo Push Service ticket IDs.
-- - Preserve the relationship between an Expo ticket, the durable
--   notification row, and the exact push-device registration used.
-- - Allow a later scheduled Edge Function to query Expo push receipts.
-- - Keep this backend-only; mobile clients never read or mutate this table.
--
-- Expo recommends checking push receipts after delivery has had time to reach
-- FCM/APNs. Receipt processing is implemented separately.

create table public.push_delivery_receipts (
  id uuid primary key default gen_random_uuid(),

  notification_id uuid not null
    references public.notifications(id)
    on delete cascade,

  push_device_id uuid not null
    references public.push_devices(id)
    on delete cascade,

  -- Expo's successful push ticket ID. This becomes the receipt lookup key.
  expo_ticket_id text not null unique,

  status text not null default 'pending'
    check (
      status in (
        'pending',
        'delivered',
        'error',
        'expired'
      )
    ),

  -- Expo recommends allowing time before querying receipts.
  receipt_available_after timestamptz not null
    default (now() + interval '15 minutes'),

  receipt_attempt_count integer not null default 0
    check (receipt_attempt_count >= 0),

  last_receipt_attempt_at timestamptz,

  expo_error_code text,
  expo_error_message text,

  processed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  check (pg_catalog.btrim(expo_ticket_id) <> ''),

  check (
    expo_error_code is null
    or pg_catalog.btrim(expo_error_code) <> ''
  ),

  check (
    expo_error_message is null
    or pg_catalog.btrim(expo_error_message) <> ''
  ),

  check (
    (
      status = 'pending'
      and processed_at is null
    )
    or
    (
      status <> 'pending'
      and processed_at is not null
    )
  )
);

comment on table public.push_delivery_receipts is
  'Backend-only Expo push ticket/receipt tracking for Khedmat notification delivery.';

comment on column public.push_delivery_receipts.expo_ticket_id is
  'Expo Push Service ticket ID used later to fetch the corresponding push receipt.';


-- ---------------------------------------------------------------------------
-- Metadata
-- ---------------------------------------------------------------------------

create or replace function public.set_push_delivery_receipt_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;

create trigger set_push_delivery_receipts_updated_at
before update on public.push_delivery_receipts
for each row
execute function public.set_push_delivery_receipt_updated_at();


-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index push_delivery_receipts_pending_idx
on public.push_delivery_receipts (
  receipt_available_after,
  created_at
)
where status = 'pending';

create index push_delivery_receipts_notification_idx
on public.push_delivery_receipts (
  notification_id,
  created_at desc
);

create index push_delivery_receipts_device_idx
on public.push_delivery_receipts (
  push_device_id,
  created_at desc
);


-- ---------------------------------------------------------------------------
-- RLS / privileges
-- ---------------------------------------------------------------------------

alter table public.push_delivery_receipts
enable row level security;

-- This table is an internal delivery implementation detail.
-- Mobile clients receive no policies and therefore no row access.

revoke all
on table public.push_delivery_receipts
from anon, authenticated;

grant all
on table public.push_delivery_receipts
to service_role;

revoke execute
on function public.set_push_delivery_receipt_updated_at()
from public, anon, authenticated;