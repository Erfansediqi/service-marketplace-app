-- Khedmat: keep provider_accounts.minimum_price synchronized with
-- active provider_services.estimated_price values.
--
-- minimum_price is treated as a derived/server-maintained field after the
-- provider account has been created. Editing services/prices should update
-- provider_services; this trigger keeps provider_accounts consistent.

-- ---------------------------------------------------------------------------
-- Trigger function
-- ---------------------------------------------------------------------------

create or replace function public.sync_provider_minimum_price()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_provider_id uuid;
  v_minimum_price integer;
begin
  -- If a row is ever moved between provider accounts by a privileged backend,
  -- recalculate the old provider as well.
  if tg_op = 'UPDATE'
     and old.provider_id is distinct from new.provider_id then

    select coalesce(min(provider_service.estimated_price), 0)
    into v_minimum_price
    from public.provider_services as provider_service
    where provider_service.provider_id = old.provider_id
      and provider_service.is_active = true;

    update public.provider_accounts as provider
    set minimum_price = v_minimum_price
    where provider.id = old.provider_id
      and provider.minimum_price is distinct from v_minimum_price;
  end if;

  if tg_op = 'DELETE' then
    v_provider_id := old.provider_id;
  else
    v_provider_id := new.provider_id;
  end if;

  select coalesce(min(provider_service.estimated_price), 0)
  into v_minimum_price
  from public.provider_services as provider_service
  where provider_service.provider_id = v_provider_id
    and provider_service.is_active = true;

  update public.provider_accounts as provider
  set minimum_price = v_minimum_price
  where provider.id = v_provider_id
    and provider.minimum_price is distinct from v_minimum_price;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;


-- ---------------------------------------------------------------------------
-- Trigger
-- ---------------------------------------------------------------------------

drop trigger if exists sync_provider_minimum_price
on public.provider_services;

create trigger sync_provider_minimum_price
after insert
  or delete
  or update of provider_id, estimated_price, is_active
on public.provider_services
for each row
execute function public.sync_provider_minimum_price();


-- ---------------------------------------------------------------------------
-- Backfill existing provider accounts
-- ---------------------------------------------------------------------------

update public.provider_accounts as provider
set minimum_price = coalesce(
  (
    select min(provider_service.estimated_price)
    from public.provider_services as provider_service
    where provider_service.provider_id = provider.id
      and provider_service.is_active = true
  ),
  0
)
where provider.minimum_price is distinct from coalesce(
  (
    select min(provider_service.estimated_price)
    from public.provider_services as provider_service
    where provider_service.provider_id = provider.id
      and provider_service.is_active = true
  ),
  0
);


-- ---------------------------------------------------------------------------
-- Privileges
-- ---------------------------------------------------------------------------
-- minimum_price is now maintained by the database whenever provider services
-- change. Mobile clients should not directly edit the derived value.

revoke update (minimum_price)
on table public.provider_accounts
from authenticated;

revoke all
on function public.sync_provider_minimum_price()
from public, anon, authenticated;

grant execute
on function public.sync_provider_minimum_price()
to service_role;


comment on column public.provider_accounts.minimum_price is
  'Derived minimum price across the provider account''s active provider services. Maintained automatically by database trigger.';