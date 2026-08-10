-- Khedmat: atomically save the complete active service set for one provider.
--
-- The mobile client sends the provider's desired ACTIVE services as JSON:
--
-- [
--   {
--     "service_id": "plumbing-repair",
--     "estimated_price": 750
--   },
--   {
--     "service_id": "pipe-installation",
--     "estimated_price": 1200
--   }
-- ]
--
-- Rules enforced by the database:
-- - caller must be authenticated
-- - caller must own the provider account
-- - suspended providers cannot change their service offering
-- - at least 1 and at most 8 active services
-- - no duplicate service IDs
-- - every service must exist, be active in the catalog, and belong to the
--   provider account's category
-- - every price must be a whole AFN amount >= 0
--
-- Rows omitted from p_services are retained for booking/history integrity but
-- are marked inactive. Existing rows are reactivated when included again.
--
-- The sync_provider_minimum_price trigger created in the previous migration
-- recalculates provider_accounts.minimum_price automatically.


create or replace function public.save_provider_services(
  p_provider_id uuid,
  p_services jsonb
)
returns setof public.provider_services
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_provider public.provider_accounts%rowtype;

  v_item jsonb;
  v_service_id text;
  v_service_category_id text;
  v_catalog_service_active boolean;

  v_price_numeric numeric;
  v_price integer;

  v_seen_service_ids text[] := '{}'::text[];
  v_service_count integer;
begin
  if v_user_id is null then
    raise exception 'Authentication is required.';
  end if;

  if p_provider_id is null then
    raise exception 'Provider ID is required.';
  end if;

  if p_services is null
     or pg_catalog.jsonb_typeof(p_services) <> 'array' then
    raise exception 'Services must be provided as a JSON array.';
  end if;

  v_service_count := pg_catalog.jsonb_array_length(p_services);

  if v_service_count < 1 then
    raise exception 'Select at least one active service.';
  end if;

  if v_service_count > 8 then
    raise exception 'A provider can have at most 8 active services.';
  end if;

  select *
  into v_provider
  from public.provider_accounts
  where id = p_provider_id
  for update;

  if not found then
    raise exception 'Provider account was not found.';
  end if;

  if v_provider.owner_user_id <> v_user_id then
    raise exception 'You do not own this provider account.';
  end if;

  if v_provider.verification_status =
     'suspended'::public.provider_verification_status then
    raise exception
      'Suspended provider accounts cannot change services or prices.';
  end if;


  -- -------------------------------------------------------------------------
  -- Validate the entire desired service set before changing any rows.
  -- -------------------------------------------------------------------------

  for v_item in
    select value
    from pg_catalog.jsonb_array_elements(p_services)
  loop
    if pg_catalog.jsonb_typeof(v_item) <> 'object' then
      raise exception 'Each service entry must be a JSON object.';
    end if;

    v_service_id :=
      pg_catalog.btrim(
        coalesce(v_item ->> 'service_id', '')
      );

    if v_service_id = '' then
      raise exception 'Every service entry requires a service_id.';
    end if;

    if v_service_id = any(v_seen_service_ids) then
      raise exception
        'Service "%" was included more than once.',
        v_service_id;
    end if;

    v_seen_service_ids :=
      pg_catalog.array_append(
        v_seen_service_ids,
        v_service_id
      );

    if not (v_item ? 'estimated_price') then
      raise exception
        'Service "%" requires an estimated_price.',
        v_service_id;
    end if;

    if pg_catalog.jsonb_typeof(
      v_item -> 'estimated_price'
    ) <> 'number' then
      raise exception
        'The price for service "%" must be a number.',
        v_service_id;
    end if;

    v_price_numeric :=
      (v_item ->> 'estimated_price')::numeric;

    if v_price_numeric < 0 then
      raise exception
        'The price for service "%" cannot be negative.',
        v_service_id;
    end if;

    if v_price_numeric <>
       pg_catalog.trunc(v_price_numeric) then
      raise exception
        'The price for service "%" must be a whole AFN amount.',
        v_service_id;
    end if;

    if v_price_numeric > 2147483647 then
      raise exception
        'The price for service "%" is too large.',
        v_service_id;
    end if;

    v_price := v_price_numeric::integer;

    select
      service.category_id,
      service.is_active
    into
      v_service_category_id,
      v_catalog_service_active
    from public.services as service
    where service.id = v_service_id;

    if not found then
      raise exception
        'Service "%" does not exist.',
        v_service_id;
    end if;

    if v_catalog_service_active is not true then
      raise exception
        'Service "%" is not currently available.',
        v_service_id;
    end if;

    if v_service_category_id <> v_provider.category_id then
      raise exception
        'Service "%" does not belong to this provider category.',
        v_service_id;
    end if;
  end loop;


  -- -------------------------------------------------------------------------
  -- Apply the complete desired state.
  --
  -- We deactivate omitted rows instead of deleting them because historical
  -- bookings can reference provider_services rows.
  -- -------------------------------------------------------------------------

  update public.provider_services as provider_service
  set is_active = false
  where provider_service.provider_id = p_provider_id
    and provider_service.is_active = true
    and not (
      provider_service.service_id =
      any(v_seen_service_ids)
    );


  for v_item in
    select value
    from pg_catalog.jsonb_array_elements(p_services)
  loop
    v_service_id :=
      pg_catalog.btrim(
        v_item ->> 'service_id'
      );

    v_price :=
      ((v_item ->> 'estimated_price')::numeric)::integer;

    insert into public.provider_services (
      provider_id,
      service_id,
      estimated_price,
      currency,
      is_active
    )
    values (
      p_provider_id,
      v_service_id,
      v_price,
      'AFN',
      true
    )
    on conflict (provider_id, service_id)
    do update
    set
      estimated_price = excluded.estimated_price,
      currency = 'AFN',
      is_active = true;
  end loop;


  -- Return the provider's final active service rows.
  return query
  select provider_service.*
  from public.provider_services as provider_service
  where provider_service.provider_id = p_provider_id
    and provider_service.is_active = true
  order by
    provider_service.created_at asc,
    provider_service.service_id asc;
end;
$$;


comment on function public.save_provider_services(uuid, jsonb) is
  'Atomically replaces a provider account''s desired active service set and prices. Omitted service rows are deactivated, not deleted.';


-- SECURITY DEFINER functions are denied by default.
revoke execute
on function public.save_provider_services(uuid, jsonb)
from public, anon;

grant execute
on function public.save_provider_services(uuid, jsonb)
to authenticated, service_role;