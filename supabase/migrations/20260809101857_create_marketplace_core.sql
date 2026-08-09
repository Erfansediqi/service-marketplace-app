-- Khedmat marketplace core
-- Creates the service catalog, provider accounts, provider offerings,
-- bookings, synchronization metadata, Row-Level Security, and secure RPCs.
--
-- Design notes:
-- - One authenticated user may own multiple provider accounts.
-- - Service/category IDs intentionally match the IDs already used by the app.
-- - Bookings can only be created through public.create_booking(), so the
--   mobile client cannot choose its own customer ID, service price, platform
--   fee, payment state, or initial booking state.
-- - Booking status changes are controlled through public.update_booking_status().

create type public.provider_verification_status as enum (
  'draft',
  'pending',
  'verified',
  'rejected',
  'suspended'
);

create type public.booking_status as enum (
  'pending',
  'confirmed',
  'in-progress',
  'completed',
  'cancelled'
);

create type public.payment_status as enum (
  'unpaid',
  'paid',
  'refunded'
);


-- ---------------------------------------------------------------------------
-- Service catalog
-- ---------------------------------------------------------------------------

create table public.service_categories (
  id text primary key,

  name_dari text not null,
  name_english text not null,
  name_pashto text,

  description_dari text,
  description_pashto text,

  icon_name text,
  sort_order integer not null default 0,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  sync_version bigint not null default 1
    check (sync_version > 0),

  check (pg_catalog.btrim(id) <> ''),
  check (pg_catalog.btrim(name_dari) <> ''),
  check (pg_catalog.btrim(name_english) <> '')
);

comment on table public.service_categories is
  'Canonical Khedmat service categories. IDs match src/data/service-professions.ts.';


create table public.services (
  id text primary key,

  category_id text not null
    references public.service_categories(id)
    on update cascade
    on delete restrict,

  name_dari text not null,
  name_english text not null,
  name_pashto text,

  description_dari text,
  description_pashto text,

  sort_order integer not null default 0,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  sync_version bigint not null default 1
    check (sync_version > 0),

  check (pg_catalog.btrim(id) <> ''),
  check (pg_catalog.btrim(name_dari) <> ''),
  check (pg_catalog.btrim(name_english) <> '')
);

comment on table public.services is
  'Canonical services offered under each service category. IDs match src/data/category-services.ts.';


-- ---------------------------------------------------------------------------
-- Provider accounts
-- ---------------------------------------------------------------------------

create table public.provider_accounts (
  id uuid primary key default gen_random_uuid(),

  -- A single authenticated user may own multiple provider accounts.
  owner_user_id uuid not null
    references public.profiles(id)
    on delete cascade,

  business_name text not null,
  profession text not null default '',
  description text not null default '',

  category_id text not null
    references public.service_categories(id)
    on update cascade
    on delete restrict,

  province_id text not null,
  province_name text not null default '',
  district_id text not null,
  district_name text not null default '',
  location_label text not null default '',

  latitude double precision,
  longitude double precision,

  verification_status public.provider_verification_status
    not null default 'draft',

  is_active boolean not null default true,
  available_today boolean not null default false,
  accepts_urgent_requests boolean not null default false,
  instant_booking boolean not null default false,

  rating numeric(3, 2) not null default 0
    check (rating >= 0 and rating <= 5),

  review_count integer not null default 0
    check (review_count >= 0),

  completed_jobs integer not null default 0
    check (completed_jobs >= 0),

  years_experience text not null default '',

  response_rate numeric(5, 2) not null default 0
    check (response_rate >= 0 and response_rate <= 100),

  average_response_minutes integer not null default 0
    check (average_response_minutes >= 0),

  minimum_price integer not null default 0
    check (minimum_price >= 0),

  currency text not null default 'AFN'
    check (currency = 'AFN'),

  service_radius_km numeric(6, 2) not null default 10
    check (service_radius_km > 0),

  working_days text[] not null default '{}'::text[],

  start_time time without time zone not null default '08:00',
  end_time time without time zone not null default '17:00',

  service_modes text[] not null default '{}'::text[],

  timezone text not null default 'Asia/Kabul',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  sync_version bigint not null default 1
    check (sync_version > 0),

  check (pg_catalog.btrim(business_name) <> ''),
  check (pg_catalog.btrim(category_id) <> ''),
  check (pg_catalog.btrim(province_id) <> ''),
  check (pg_catalog.btrim(district_id) <> ''),
  check (
    latitude is null
    or (latitude >= -90 and latitude <= 90)
  ),
  check (
    longitude is null
    or (longitude >= -180 and longitude <= 180)
  ),
  check (end_time > start_time)
);

comment on table public.provider_accounts is
  'Provider/business identities. One Supabase user may own multiple provider accounts.';


create table public.provider_services (
  id uuid primary key default gen_random_uuid(),

  provider_id uuid not null
    references public.provider_accounts(id)
    on delete restrict,

  service_id text not null
    references public.services(id)
    on update cascade
    on delete restrict,

  title_override text,
  description_override text,

  estimated_price integer not null default 0
    check (estimated_price >= 0),

  currency text not null default 'AFN'
    check (currency = 'AFN'),

  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  sync_version bigint not null default 1
    check (sync_version > 0),

  unique (provider_id, service_id)
);

comment on table public.provider_services is
  'Services selected by a provider account, including provider-specific pricing.';


-- ---------------------------------------------------------------------------
-- Bookings
-- ---------------------------------------------------------------------------

create table public.bookings (
  id uuid primary key default gen_random_uuid(),

  -- Stable client-side idempotency key. Offline retries with the same value
  -- return the original booking instead of creating duplicates.
  client_request_id text not null,

  customer_id uuid
    references public.profiles(id)
    on delete set null,

  provider_id uuid not null
    references public.provider_accounts(id)
    on delete restrict,

  provider_service_id uuid not null
    references public.provider_services(id)
    on delete restrict,

  service_id text not null
    references public.services(id)
    on update cascade
    on delete restrict,

  -- Snapshot fields preserve booking history if public profile text changes.
  customer_name_snapshot text not null,
  customer_phone_snapshot text,

  provider_name_snapshot text not null,
  provider_profession_snapshot text not null,

  service_name_snapshot text not null,

  service_date date not null,
  service_time time without time zone not null,
  service_timezone text not null default 'Asia/Kabul',

  address_id text,
  address_label text not null,
  full_address text not null,
  latitude double precision,
  longitude double precision,

  notes text not null default '',

  service_price integer not null
    check (service_price >= 0),

  platform_fee integer not null default 50
    check (platform_fee >= 0),

  total integer generated always as (
    service_price + platform_fee
  ) stored,

  currency text not null default 'AFN'
    check (currency = 'AFN'),

  status public.booking_status not null default 'pending',
  payment_status public.payment_status not null default 'unpaid',

  confirmed_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  cancelled_by uuid references public.profiles(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  sync_version bigint not null default 1
    check (sync_version > 0),

  unique (customer_id, client_request_id),

  check (pg_catalog.btrim(client_request_id) <> ''),
  check (pg_catalog.btrim(customer_name_snapshot) <> ''),
  check (pg_catalog.btrim(provider_name_snapshot) <> ''),
  check (pg_catalog.btrim(service_name_snapshot) <> ''),
  check (pg_catalog.btrim(address_label) <> ''),
  check (pg_catalog.btrim(full_address) <> ''),
  check (pg_catalog.char_length(notes) <= 2000),
  check (
    latitude is null
    or (latitude >= -90 and latitude <= 90)
  ),
  check (
    longitude is null
    or (longitude >= -180 and longitude <= 180)
  )
);

comment on table public.bookings is
  'Customer bookings. Creation and status transitions are controlled by database functions.';


-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index services_category_id_idx
  on public.services using btree (category_id);

create index services_active_category_idx
  on public.services using btree (category_id, is_active);

create index provider_accounts_owner_user_id_idx
  on public.provider_accounts using btree (owner_user_id);

create index provider_accounts_category_id_idx
  on public.provider_accounts using btree (category_id);

create index provider_accounts_public_catalog_idx
  on public.provider_accounts using btree (
    verification_status,
    is_active,
    category_id
  );

create index provider_accounts_location_idx
  on public.provider_accounts using btree (
    province_id,
    district_id
  );

create index provider_services_provider_id_idx
  on public.provider_services using btree (provider_id);

create index provider_services_service_id_idx
  on public.provider_services using btree (service_id);

create index provider_services_active_idx
  on public.provider_services using btree (
    provider_id,
    is_active
  );

create index bookings_customer_id_idx
  on public.bookings using btree (customer_id);

create index bookings_provider_id_idx
  on public.bookings using btree (provider_id);

create index bookings_status_idx
  on public.bookings using btree (status);

create index bookings_customer_created_at_idx
  on public.bookings using btree (customer_id, created_at desc);

create index bookings_provider_created_at_idx
  on public.bookings using btree (provider_id, created_at desc);

create index bookings_provider_schedule_idx
  on public.bookings using btree (
    provider_id,
    service_date,
    service_time
  );

-- Prevent exact-slot double booking while a booking is still active.
create unique index bookings_active_provider_slot_uidx
  on public.bookings (
    provider_id,
    service_date,
    service_time
  )
  where status in (
    'pending'::public.booking_status,
    'confirmed'::public.booking_status,
    'in-progress'::public.booking_status
  );


-- ---------------------------------------------------------------------------
-- Provider-service integrity
-- ---------------------------------------------------------------------------

create or replace function public.validate_provider_service_category()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_provider_category_id text;
  v_service_category_id text;
begin
  select category_id
  into v_provider_category_id
  from public.provider_accounts
  where id = new.provider_id;

  if not found then
    raise exception 'Provider account was not found.';
  end if;

  select category_id
  into v_service_category_id
  from public.services
  where id = new.service_id;

  if not found then
    raise exception 'Service was not found.';
  end if;

  if v_provider_category_id <> v_service_category_id then
    raise exception
      'The selected service does not belong to the provider category.';
  end if;

  return new;
end;
$$;

create trigger validate_provider_service_category
before insert or update of provider_id, service_id
on public.provider_services
for each row
execute function public.validate_provider_service_category();


-- ---------------------------------------------------------------------------
-- Synchronization metadata
-- ---------------------------------------------------------------------------

create or replace function public.set_marketplace_update_metadata()
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

create trigger set_service_categories_update_metadata
before update on public.service_categories
for each row
execute function public.set_marketplace_update_metadata();

create trigger set_services_update_metadata
before update on public.services
for each row
execute function public.set_marketplace_update_metadata();

create trigger set_provider_accounts_update_metadata
before update on public.provider_accounts
for each row
execute function public.set_marketplace_update_metadata();

create trigger set_provider_services_update_metadata
before update on public.provider_services
for each row
execute function public.set_marketplace_update_metadata();

create trigger set_bookings_update_metadata
before update on public.bookings
for each row
execute function public.set_marketplace_update_metadata();


-- ---------------------------------------------------------------------------
-- Seed the service catalog from the current Khedmat app data.
-- ---------------------------------------------------------------------------

insert into public.service_categories (
  id,
  name_dari,
  name_english,
  name_pashto,
  description_dari,
  description_pashto,
  icon_name,
  sort_order
)
values
  ('electrician', 'برق‌کار', 'Electrician', null, 'نصب، ترمیم و عیب‌یابی سیستم‌های برقی', null, 'flash-outline', 1),
  ('plumber', 'لوله‌کش', 'Plumber', null, 'نصب و ترمیم لوله، آب‌رسانی و فاضلاب', null, 'water-outline', 2),
  ('carpenter', 'نجار', 'Carpenter', null, 'ساخت و ترمیم دروازه، پنجره و وسایل چوبی', null, 'hammer-outline', 3),
  ('construction', 'کارگر ساختمانی', 'Construction worker', null, 'کارهای ساختمانی، ترمیم و بازسازی', null, 'construct-outline', 4),
  ('painter', 'رنگ‌مال', 'Painter', null, 'رنگ‌آمیزی خانه، دفتر و ساختمان', null, 'brush-outline', 5),
  ('cleaner', 'نظافت‌چی', 'Cleaner', null, 'نظافت خانه، دفتر و محیط کاری', null, 'sparkles-outline', 6),
  ('ac-technician', 'تخنیکر کولر و تهویه', 'AC technician', null, 'نصب و ترمیم کولر و سیستم‌های تهویه', null, 'snow-outline', 7),
  ('driver', 'راننده', 'Driver', null, 'خدمات ترانسپورت و جابه‌جایی', null, 'car-outline', 8),
  ('phone-repair', 'ترمیم‌کار موبایل', 'Phone repair technician', null, 'ترمیم موبایل، صفحه‌نمایش و قطعات', null, 'phone-portrait-outline', 9),
  ('computer-repair', 'ترمیم‌کار کمپیوتر', 'Computer repair technician', null, 'ترمیم کمپیوتر، لپ‌تاپ و نرم‌افزار', null, 'laptop-outline', 10),
  ('tailor', 'خیاط', 'Tailor', null, 'دوخت، اصلاح و ترمیم لباس', null, 'shirt-outline', 11),
  ('barber', 'آرایشگر', 'Barber', null, 'اصلاح مو و خدمات آرایشگری', null, 'cut-outline', 12),
  ('tutor', 'آموزگار خصوصی', 'Private tutor', null, 'آموزش خصوصی مضامین و مهارت‌ها', null, 'school-outline', 13),
  ('photographer', 'عکاس', 'Photographer', null, 'عکاسی مراسم، محصولات و پرتره', null, 'camera-outline', 14),
  ('other', 'سایر خدمات', 'Other services', null, 'حرفه یا مهارتی که در فهرست موجود نیست', null, 'ellipsis-horizontal', 15);


insert into public.services (
  id,
  category_id,
  name_dari,
  name_english,
  name_pashto,
  description_dari,
  description_pashto,
  sort_order
)
values
  ('electrical-wiring-repair', 'electrician', 'ترمیم سیم‌کشی برق', 'Electrical wiring repair', null, null, null, 1),
  ('socket-switch-installation', 'electrician', 'نصب پریز و کلید', 'Socket and switch installation', null, null, null, 2),
  ('lighting-installation', 'electrician', 'نصب چراغ و روشنایی', 'Lighting installation', null, null, null, 3),
  ('breaker-panel-repair', 'electrician', 'ترمیم فیوز و تابلو برق', 'Breaker and electrical panel repair', null, null, null, 4),
  ('generator-installation', 'electrician', 'نصب و اتصال جنراتور', 'Generator installation', null, null, null, 5),
  ('leaking-pipe-repair', 'plumber', 'ترمیم نشت لوله', 'Leaking pipe repair', null, null, null, 1),
  ('drain-unblocking', 'plumber', 'باز کردن بندش فاضلاب', 'Drain unblocking', null, null, null, 2),
  ('toilet-installation', 'plumber', 'نصب و ترمیم تشناب', 'Toilet installation and repair', null, null, null, 3),
  ('water-tank-installation', 'plumber', 'نصب تانکر آب', 'Water tank installation', null, null, null, 4),
  ('water-heater-installation', 'plumber', 'نصب آب‌گرم‌کن', 'Water heater installation', null, null, null, 5),
  ('door-repair', 'carpenter', 'ساخت و ترمیم دروازه', 'Door construction and repair', null, null, null, 1),
  ('window-repair', 'carpenter', 'ساخت و ترمیم پنجره', 'Window construction and repair', null, null, null, 2),
  ('furniture-repair', 'carpenter', 'ترمیم وسایل چوبی', 'Furniture repair', null, null, null, 3),
  ('cabinet-installation', 'carpenter', 'ساخت و نصب کابینت', 'Cabinet construction and installation', null, null, null, 4),
  ('wall-construction', 'construction', 'دیوارچینی', 'Wall construction', null, null, null, 1),
  ('plastering', 'construction', 'گچ‌کاری و پلستر', 'Plastering', null, null, null, 2),
  ('tile-installation', 'construction', 'نصب کاشی و سرامیک', 'Tile installation', null, null, null, 3),
  ('concrete-work', 'construction', 'کارهای کانکریتی', 'Concrete work', null, null, null, 4),
  ('building-renovation', 'construction', 'بازسازی ساختمان', 'Building renovation', null, null, null, 5),
  ('interior-painting', 'painter', 'رنگ‌آمیزی داخل ساختمان', 'Interior painting', null, null, null, 1),
  ('exterior-painting', 'painter', 'رنگ‌آمیزی نمای ساختمان', 'Exterior painting', null, null, null, 2),
  ('wall-preparation', 'painter', 'آماده‌سازی و ترمیم دیوار', 'Wall preparation and repair', null, null, null, 3),
  ('door-window-painting', 'painter', 'رنگ‌آمیزی دروازه و پنجره', 'Door and window painting', null, null, null, 4),
  ('home-cleaning', 'cleaner', 'نظافت خانه', 'Home cleaning', null, null, null, 1),
  ('office-cleaning', 'cleaner', 'نظافت دفتر', 'Office cleaning', null, null, null, 2),
  ('deep-cleaning', 'cleaner', 'نظافت عمومی و عمیق', 'Deep cleaning', null, null, null, 3),
  ('carpet-cleaning', 'cleaner', 'شست‌وشوی قالین', 'Carpet cleaning', null, null, null, 4),
  ('post-construction-cleaning', 'cleaner', 'نظافت پس از ساختمان‌کاری', 'Post-construction cleaning', null, null, null, 5),
  ('ac-installation', 'ac-technician', 'نصب کولر', 'Air conditioner installation', null, null, null, 1),
  ('ac-repair', 'ac-technician', 'ترمیم کولر', 'Air conditioner repair', null, null, null, 2),
  ('ac-maintenance', 'ac-technician', 'سرویس و پاک‌کاری کولر', 'Air conditioner maintenance', null, null, null, 3),
  ('heating-system-repair', 'ac-technician', 'ترمیم سیستم گرمایشی', 'Heating system repair', null, null, null, 4),
  ('city-transport', 'driver', 'ترانسپورت داخل شهر', 'City transportation', null, null, null, 1),
  ('intercity-transport', 'driver', 'سفر بین‌شهری', 'Intercity transportation', null, null, null, 2),
  ('goods-transport', 'driver', 'انتقال کالا و وسایل', 'Goods transportation', null, null, null, 3),
  ('airport-transfer', 'driver', 'انتقال به میدان هوایی', 'Airport transfer', null, null, null, 4),
  ('phone-screen-repair', 'phone-repair', 'تعویض و ترمیم صفحه موبایل', 'Phone screen repair', null, null, null, 1),
  ('phone-battery-replacement', 'phone-repair', 'تعویض باتری موبایل', 'Phone battery replacement', null, null, null, 2),
  ('phone-software-repair', 'phone-repair', 'ترمیم نرم‌افزاری موبایل', 'Phone software repair', null, null, null, 3),
  ('phone-charging-port-repair', 'phone-repair', 'ترمیم جای شارژ', 'Charging port repair', null, null, null, 4),
  ('computer-hardware-repair', 'computer-repair', 'ترمیم سخت‌افزار کمپیوتر', 'Computer hardware repair', null, null, null, 1),
  ('windows-installation', 'computer-repair', 'نصب ویندوز و نرم‌افزار', 'Windows and software installation', null, null, null, 2),
  ('virus-removal', 'computer-repair', 'پاک‌سازی ویروس', 'Virus removal', null, null, null, 3),
  ('data-recovery', 'computer-repair', 'بازیابی اطلاعات', 'Data recovery', null, null, null, 4),
  ('mens-clothing-tailoring', 'tailor', 'دوخت لباس مردانه', 'Men''s clothing tailoring', null, null, null, 1),
  ('womens-clothing-tailoring', 'tailor', 'دوخت لباس زنانه', 'Women''s clothing tailoring', null, null, null, 2),
  ('clothing-alteration', 'tailor', 'اصلاح اندازه لباس', 'Clothing alteration', null, null, null, 3),
  ('clothing-repair', 'tailor', 'ترمیم لباس', 'Clothing repair', null, null, null, 4),
  ('mens-haircut', 'barber', 'اصلاح موی مردانه', 'Men''s haircut', null, null, null, 1),
  ('beard-trimming', 'barber', 'اصلاح ریش', 'Beard trimming', null, null, null, 2),
  ('childrens-haircut', 'barber', 'اصلاح موی کودکان', 'Children''s haircut', null, null, null, 3),
  ('school-subject-tutoring', 'tutor', 'آموزش مضامین مکتب', 'School subject tutoring', null, null, null, 1),
  ('english-language-tutoring', 'tutor', 'آموزش زبان انگلیسی', 'English language tutoring', null, null, null, 2),
  ('computer-training', 'tutor', 'آموزش کمپیوتر', 'Computer training', null, null, null, 3),
  ('exam-preparation', 'tutor', 'آمادگی برای امتحان', 'Exam preparation', null, null, null, 4),
  ('event-photography', 'photographer', 'عکاسی مراسم', 'Event photography', null, null, null, 1),
  ('portrait-photography', 'photographer', 'عکاسی پرتره', 'Portrait photography', null, null, null, 2),
  ('product-photography', 'photographer', 'عکاسی محصولات', 'Product photography', null, null, null, 3),
  ('video-recording', 'photographer', 'فیلم‌برداری', 'Video recording', null, null, null, 4),
  ('custom-service', 'other', 'خدمت دیگر', 'Other service', null, 'خدمت خود را در مرحلهٔ بعد توضیح دهید.', null, 1);


-- ---------------------------------------------------------------------------
-- Row-Level Security
-- ---------------------------------------------------------------------------

alter table public.service_categories enable row level security;
alter table public.services enable row level security;
alter table public.provider_accounts enable row level security;
alter table public.provider_services enable row level security;
alter table public.bookings enable row level security;


create policy "Active service categories are public"
on public.service_categories
for select
to anon, authenticated
using (is_active = true);


create policy "Active services are public"
on public.services
for select
to anon, authenticated
using (is_active = true);


create policy "Verified providers are public"
on public.provider_accounts
for select
to anon
using (
  verification_status = 'verified'::public.provider_verification_status
  and is_active = true
);

create policy "Authenticated users can read public or owned providers"
on public.provider_accounts
for select
to authenticated
using (
  (
    verification_status = 'verified'::public.provider_verification_status
    and is_active = true
  )
  or owner_user_id = (select auth.uid())
);

create policy "Users can create their own provider accounts"
on public.provider_accounts
for insert
to authenticated
with check (
  owner_user_id = (select auth.uid())
);

create policy "Users can update their own provider accounts"
on public.provider_accounts
for update
to authenticated
using (
  owner_user_id = (select auth.uid())
)
with check (
  owner_user_id = (select auth.uid())
);


create policy "Public provider services are readable"
on public.provider_services
for select
to anon
using (
  is_active = true
  and exists (
    select 1
    from public.provider_accounts as provider
    where provider.id = provider_services.provider_id
      and provider.verification_status =
        'verified'::public.provider_verification_status
      and provider.is_active = true
  )
);

create policy "Authenticated users can read public or owned provider services"
on public.provider_services
for select
to authenticated
using (
  exists (
    select 1
    from public.provider_accounts as provider
    where provider.id = provider_services.provider_id
      and (
        (
          provider.verification_status =
            'verified'::public.provider_verification_status
          and provider.is_active = true
          and provider_services.is_active = true
        )
        or provider.owner_user_id = (select auth.uid())
      )
  )
);

create policy "Users can add services to their own provider accounts"
on public.provider_services
for insert
to authenticated
with check (
  exists (
    select 1
    from public.provider_accounts as provider
    where provider.id = provider_services.provider_id
      and provider.owner_user_id = (select auth.uid())
  )
);

create policy "Users can update services on their own provider accounts"
on public.provider_services
for update
to authenticated
using (
  exists (
    select 1
    from public.provider_accounts as provider
    where provider.id = provider_services.provider_id
      and provider.owner_user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.provider_accounts as provider
    where provider.id = provider_services.provider_id
      and provider.owner_user_id = (select auth.uid())
  )
);


create policy "Customers and provider owners can read bookings"
on public.bookings
for select
to authenticated
using (
  customer_id = (select auth.uid())
  or exists (
    select 1
    from public.provider_accounts as provider
    where provider.id = bookings.provider_id
      and provider.owner_user_id = (select auth.uid())
  )
);


-- ---------------------------------------------------------------------------
-- Secure provider submission
-- ---------------------------------------------------------------------------

create or replace function public.submit_provider_account(
  p_provider_id uuid
)
returns public.provider_accounts
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_provider public.provider_accounts%rowtype;
begin
  if v_user_id is null then
    raise exception 'Authentication is required.';
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

  if v_provider.verification_status not in (
    'draft'::public.provider_verification_status,
    'rejected'::public.provider_verification_status
  ) then
    raise exception
      'Only draft or rejected provider accounts can be submitted.';
  end if;

  if not exists (
    select 1
    from public.provider_services as provider_service
    where provider_service.provider_id = p_provider_id
      and provider_service.is_active = true
  ) then
    raise exception
      'Select at least one active service before submitting.';
  end if;

  update public.provider_accounts
  set verification_status = 'pending'::public.provider_verification_status
  where id = p_provider_id
  returning * into v_provider;

  return v_provider;
end;
$$;


-- ---------------------------------------------------------------------------
-- Secure booking creation.
-- ---------------------------------------------------------------------------

create or replace function public.create_booking(
  p_client_request_id text,
  p_provider_service_id uuid,
  p_service_date date,
  p_service_time time without time zone,
  p_address_label text,
  p_full_address text,
  p_latitude double precision default null,
  p_longitude double precision default null,
  p_address_id text default null,
  p_notes text default ''
)
returns public.bookings
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());

  v_customer public.profiles%rowtype;
  v_provider_service public.provider_services%rowtype;
  v_provider public.provider_accounts%rowtype;
  v_service public.services%rowtype;
  v_category public.service_categories%rowtype;

  v_booking public.bookings%rowtype;
  v_service_name text;
  v_provider_profession text;
  v_weekday text;
begin
  if v_user_id is null then
    raise exception 'Authentication is required.';
  end if;

  if pg_catalog.btrim(coalesce(p_client_request_id, '')) = '' then
    raise exception 'A client request ID is required.';
  end if;

  -- Offline/retry idempotency: return the already-created booking.
  select *
  into v_booking
  from public.bookings
  where customer_id = v_user_id
    and client_request_id = pg_catalog.btrim(p_client_request_id);

  if found then
    return v_booking;
  end if;

  if p_service_date is null or p_service_time is null then
    raise exception 'A booking date and time are required.';
  end if;

  if p_service_date < current_date then
    raise exception 'A booking cannot be created in the past.';
  end if;

  if pg_catalog.btrim(coalesce(p_address_label, '')) = '' then
    raise exception 'An address label is required.';
  end if;

  if pg_catalog.btrim(coalesce(p_full_address, '')) = '' then
    raise exception 'A full address is required.';
  end if;

  if pg_catalog.char_length(coalesce(p_notes, '')) > 2000 then
    raise exception 'Booking notes cannot exceed 2000 characters.';
  end if;

  if p_latitude is not null
     and (p_latitude < -90 or p_latitude > 90) then
    raise exception 'Latitude is outside the valid range.';
  end if;

  if p_longitude is not null
     and (p_longitude < -180 or p_longitude > 180) then
    raise exception 'Longitude is outside the valid range.';
  end if;

  select *
  into v_customer
  from public.profiles
  where id = v_user_id;

  if not found then
    raise exception 'Customer profile was not found.';
  end if;

  if pg_catalog.btrim(v_customer.full_name) = '' then
    raise exception 'Complete your customer profile before booking.';
  end if;

  select *
  into v_provider_service
  from public.provider_services
  where id = p_provider_service_id
    and is_active = true;

  if not found then
    raise exception 'The selected provider service is unavailable.';
  end if;

  select *
  into v_provider
  from public.provider_accounts
  where id = v_provider_service.provider_id
    and is_active = true
    and verification_status =
      'verified'::public.provider_verification_status;

  if not found then
    raise exception 'The selected provider is unavailable.';
  end if;

  select *
  into v_service
  from public.services
  where id = v_provider_service.service_id
    and is_active = true;

  if not found then
    raise exception 'The selected service is unavailable.';
  end if;

  select *
  into v_category
  from public.service_categories
  where id = v_provider.category_id
    and is_active = true;

  if not found then
    raise exception 'The selected provider category is unavailable.';
  end if;

  -- Enforce the provider's current working day and hours.
  v_weekday := pg_catalog.lower(
    pg_catalog.to_char(p_service_date, 'FMDay')
  );

  if pg_catalog.cardinality(v_provider.working_days) > 0
     and not (v_weekday = any(v_provider.working_days)) then
    raise exception 'The provider is not available on the selected day.';
  end if;

  if p_service_time < v_provider.start_time
     or p_service_time > v_provider.end_time then
    raise exception 'The selected time is outside provider working hours.';
  end if;

  v_service_name := coalesce(
    nullif(pg_catalog.btrim(v_provider_service.title_override), ''),
    v_service.name_english
  );

  v_provider_profession := coalesce(
    nullif(pg_catalog.btrim(v_provider.profession), ''),
    v_category.name_english
  );

  insert into public.bookings (
    client_request_id,
    customer_id,
    provider_id,
    provider_service_id,
    service_id,

    customer_name_snapshot,
    customer_phone_snapshot,

    provider_name_snapshot,
    provider_profession_snapshot,

    service_name_snapshot,

    service_date,
    service_time,
    service_timezone,

    address_id,
    address_label,
    full_address,
    latitude,
    longitude,

    notes,

    service_price,
    platform_fee,
    currency,

    status,
    payment_status
  )
  values (
    pg_catalog.btrim(p_client_request_id),
    v_user_id,
    v_provider.id,
    v_provider_service.id,
    v_service.id,

    v_customer.full_name,
    v_customer.phone,

    v_provider.business_name,
    v_provider_profession,

    v_service_name,

    p_service_date,
    p_service_time,
    v_provider.timezone,

    nullif(pg_catalog.btrim(coalesce(p_address_id, '')), ''),
    pg_catalog.btrim(p_address_label),
    pg_catalog.btrim(p_full_address),
    p_latitude,
    p_longitude,

    coalesce(p_notes, ''),

    v_provider_service.estimated_price,
    50,
    v_provider_service.currency,

    'pending'::public.booking_status,
    'unpaid'::public.payment_status
  )
  returning * into v_booking;

  return v_booking;

exception
  when unique_violation then
    -- A concurrent retry may have inserted the same client request ID.
    select *
    into v_booking
    from public.bookings
    where customer_id = v_user_id
      and client_request_id = pg_catalog.btrim(p_client_request_id);

    if found then
      return v_booking;
    end if;

    raise exception
      'That provider already has an active booking at the selected time.';
end;
$$;


-- ---------------------------------------------------------------------------
-- Secure booking status transitions.
-- ---------------------------------------------------------------------------

create or replace function public.update_booking_status(
  p_booking_id uuid,
  p_status public.booking_status
)
returns public.bookings
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_booking public.bookings%rowtype;
  v_provider_owner_id uuid;

  v_is_customer boolean;
  v_is_provider_owner boolean;
  v_transition_allowed boolean := false;
begin
  if v_user_id is null then
    raise exception 'Authentication is required.';
  end if;

  select *
  into v_booking
  from public.bookings
  where id = p_booking_id
  for update;

  if not found then
    raise exception 'Booking was not found.';
  end if;

  select owner_user_id
  into v_provider_owner_id
  from public.provider_accounts
  where id = v_booking.provider_id;

  v_is_customer := v_booking.customer_id = v_user_id;
  v_is_provider_owner := v_provider_owner_id = v_user_id;

  if not v_is_customer and not v_is_provider_owner then
    raise exception 'You do not have access to this booking.';
  end if;

  if p_status = v_booking.status then
    return v_booking;
  end if;

  if v_is_provider_owner then
    v_transition_allowed :=
      (
        v_booking.status = 'pending'::public.booking_status
        and p_status in (
          'confirmed'::public.booking_status,
          'cancelled'::public.booking_status
        )
      )
      or (
        v_booking.status = 'confirmed'::public.booking_status
        and p_status in (
          'in-progress'::public.booking_status,
          'cancelled'::public.booking_status
        )
      )
      or (
        v_booking.status = 'in-progress'::public.booking_status
        and p_status = 'completed'::public.booking_status
      );
  elsif v_is_customer then
    v_transition_allowed :=
      v_booking.status in (
        'pending'::public.booking_status,
        'confirmed'::public.booking_status
      )
      and p_status = 'cancelled'::public.booking_status;
  end if;

  if not v_transition_allowed then
    raise exception
      'The requested booking status transition is not allowed.';
  end if;

  update public.bookings
  set
    status = p_status,

    confirmed_at =
      case
        when p_status = 'confirmed'::public.booking_status
          then coalesce(confirmed_at, pg_catalog.now())
        else confirmed_at
      end,

    started_at =
      case
        when p_status = 'in-progress'::public.booking_status
          then coalesce(started_at, pg_catalog.now())
        else started_at
      end,

    completed_at =
      case
        when p_status = 'completed'::public.booking_status
          then coalesce(completed_at, pg_catalog.now())
        else completed_at
      end,

    cancelled_at =
      case
        when p_status = 'cancelled'::public.booking_status
          then coalesce(cancelled_at, pg_catalog.now())
        else cancelled_at
      end,

    cancelled_by =
      case
        when p_status = 'cancelled'::public.booking_status
          then v_user_id
        else cancelled_by
      end

  where id = p_booking_id
  returning * into v_booking;

  return v_booking;
end;
$$;


-- ---------------------------------------------------------------------------
-- Privileges
-- ---------------------------------------------------------------------------

revoke all
on table
  public.service_categories,
  public.services,
  public.provider_accounts,
  public.provider_services,
  public.bookings
from anon, authenticated;


grant select
on table public.service_categories
to anon, authenticated;

grant select
on table public.services
to anon, authenticated;

grant select
on table public.provider_accounts
to anon, authenticated;

grant insert (
  owner_user_id,
  business_name,
  profession,
  description,
  category_id,
  province_id,
  province_name,
  district_id,
  district_name,
  location_label,
  latitude,
  longitude,
  is_active,
  available_today,
  accepts_urgent_requests,
  instant_booking,
  years_experience,
  minimum_price,
  currency,
  service_radius_km,
  working_days,
  start_time,
  end_time,
  service_modes,
  timezone
)
on table public.provider_accounts
to authenticated;

grant update (
  business_name,
  profession,
  description,
  province_id,
  province_name,
  district_id,
  district_name,
  location_label,
  latitude,
  longitude,
  is_active,
  available_today,
  accepts_urgent_requests,
  instant_booking,
  years_experience,
  minimum_price,
  currency,
  service_radius_km,
  working_days,
  start_time,
  end_time,
  service_modes,
  timezone
)
on table public.provider_accounts
to authenticated;


grant select
on table public.provider_services
to anon, authenticated;

grant insert (
  provider_id,
  service_id,
  title_override,
  description_override,
  estimated_price,
  currency,
  is_active
)
on table public.provider_services
to authenticated;

grant update (
  title_override,
  description_override,
  estimated_price,
  currency,
  is_active
)
on table public.provider_services
to authenticated;


-- Mobile clients can read bookings they are authorized to see.
-- INSERT/UPDATE/DELETE stay revoked: writes go through the secure RPCs.
grant select
on table public.bookings
to authenticated;


grant all
on table
  public.service_categories,
  public.services,
  public.provider_accounts,
  public.provider_services,
  public.bookings
to service_role;


grant usage
on type
  public.provider_verification_status,
  public.booking_status,
  public.payment_status
to anon, authenticated, service_role;


-- Trigger functions are internal.
revoke execute
on function public.set_marketplace_update_metadata()
from public, anon, authenticated;

revoke execute
on function public.validate_provider_service_category()
from public, anon, authenticated;


-- SECURITY DEFINER functions are denied by default and granted only
-- to authenticated application users.
revoke execute
on function public.submit_provider_account(uuid)
from public, anon;

grant execute
on function public.submit_provider_account(uuid)
to authenticated;


revoke execute
on function public.create_booking(
  text,
  uuid,
  date,
  time without time zone,
  text,
  text,
  double precision,
  double precision,
  text,
  text
)
from public, anon;

grant execute
on function public.create_booking(
  text,
  uuid,
  date,
  time without time zone,
  text,
  text,
  double precision,
  double precision,
  text,
  text
)
to authenticated;


revoke execute
on function public.update_booking_status(
  uuid,
  public.booking_status
)
from public, anon;

grant execute
on function public.update_booking_status(
  uuid,
  public.booking_status
)
to authenticated;