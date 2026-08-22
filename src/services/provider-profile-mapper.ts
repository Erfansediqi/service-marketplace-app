import type {
  ProviderAccountRow,
  ProviderServiceRow,
  ServiceRow,
} from "../repositories/provider-account-repository";
import type {
  ProviderCategoryId,
  ProviderProfile,
  ProviderService,
} from "../types/provider";

const PROVIDER_CATEGORY_IDS =
  new Set<ProviderCategoryId>([
    "electrician",
    "plumber",
    "carpenter",
    "construction",
    "painter",
    "cleaner",
    "ac-technician",
    "driver",
    "phone-repair",
    "computer-repair",
    "tailor",
    "barber",
    "tutor",
    "photographer",
    "other",
  ]);

function createInitials(
  name: string,
): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "KP";
  }

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function normalizeCategoryId(
  value: string,
): ProviderCategoryId {
  return PROVIDER_CATEGORY_IDS.has(
    value as ProviderCategoryId,
  )
    ? (value as ProviderCategoryId)
    : "other";
}

function clean(
  value:
    | string
    | null
    | undefined,
): string {
  return value?.trim() ?? "";
}

function mapProviderService(
  providerService: ProviderServiceRow,
  service: ServiceRow | undefined,
): ProviderService {
  const overrideTitle = clean(
    providerService.title_override,
  );

  const overrideDescription = clean(
    providerService.description_override,
  );

  /*
   * Catalog names are language-specific. Do not prefer Dari globally and do
   * not concatenate multiple languages into one display string.
   *
   * A single provider override cannot safely represent three languages, so it
   * is used only as a fallback when the catalog does not contain that
   * language.
   */
  const titleEnglish =
    clean(service?.name_english) ||
    overrideTitle ||
    providerService.service_id;

  const titleDari =
    clean(service?.name_dari) ||
    overrideTitle ||
    titleEnglish;

  const titlePashto =
    clean(service?.name_pashto) ||
    overrideTitle ||
    titleEnglish;

  /*
   * The current `services` schema has Dari and Pashto descriptions, but no
   * `description_english` column. Use a provider override when available;
   * otherwise keep the English description empty instead of inventing one.
   */
  const descriptionEnglish =
    overrideDescription ||
    "";

  const descriptionDari =
    clean(service?.description_dari) ||
    overrideDescription ||
    descriptionEnglish;

  const descriptionPashto =
    clean(
      service?.description_pashto,
    ) ||
    overrideDescription ||
    descriptionEnglish;

  return {
    id:
      providerService.service_id,

    /*
     * English is the compatibility default while screens are migrated to
     * explicit language-aware rendering.
     */
    title: titleEnglish,
    description:
      descriptionEnglish,

    titleEnglish,
    titleDari,
    titlePashto,

    descriptionEnglish,
    descriptionDari,
    descriptionPashto,

    estimatedPrice:
      providerService.estimated_price,
  };
}

export function mapProviderAccountToProfile(
  provider: ProviderAccountRow,
  providerServices: ProviderServiceRow[],
  services: ServiceRow[],
): ProviderProfile {
  const serviceById =
    new Map(
      services.map(
        (service) => [
          service.id,
          service,
        ],
      ),
    );

  const name =
    provider.business_name.trim() ||
    provider.profession.trim();

  return {
    id: provider.id,

    name,
    initials:
      createInitials(name),
    profession:
      provider.profession,
    categoryId:
      normalizeCategoryId(
        provider.category_id,
      ),

    description:
      provider.description,

    provinceId:
      provider.province_id,
    provinceName:
      provider.province_name,

    districtId:
      provider.district_id,
    districtName:
      provider.district_name,

    locationLabel:
      provider.location_label,

    latitude:
      provider.latitude ?? 0,
    longitude:
      provider.longitude ?? 0,
    distanceKm: 0,

    verified:
      provider.verification_status ===
      "verified",
    availableToday:
      provider.available_today,
    acceptsUrgentRequests:
      provider.accepts_urgent_requests,
    instantBooking:
      provider.instant_booking,

    rating:
      provider.rating,
    reviewCount:
      provider.review_count,
    completedJobs:
      provider.completed_jobs,

    yearsExperience:
      provider.years_experience,
    responseRate:
      provider.response_rate,
    averageResponseMinutes:
      provider.average_response_minutes,

    minimumPrice:
      provider.minimum_price,
    currency: "AFN",

    serviceRadiusKm:
      provider.service_radius_km,

    workingDays:
      provider.working_days,
    startTime:
      provider.start_time,
    endTime:
      provider.end_time,

    services: providerServices
      .filter(
        (providerService) =>
          providerService.is_active,
      )
      .map(
        (providerService) =>
          mapProviderService(
            providerService,
            serviceById.get(
              providerService.service_id,
            ),
          ),
      ),

    reviews: [],
    portfolio: [],
  };
}
