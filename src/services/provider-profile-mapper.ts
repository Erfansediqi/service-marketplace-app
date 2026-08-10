import type {
    ProviderCategoryId,
    ProviderProfile,
    ProviderService,
} from "../data/providers";
import type {
    ProviderAccountRow,
    ProviderServiceRow,
    ServiceRow,
} from "../repositories/provider-account-repository";

const PROVIDER_CATEGORY_IDS = new Set<ProviderCategoryId>([
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

function createInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "KP";
  }

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function normalizeCategoryId(value: string): ProviderCategoryId {
  return PROVIDER_CATEGORY_IDS.has(value as ProviderCategoryId)
    ? (value as ProviderCategoryId)
    : "other";
}

function mapProviderService(
  providerService: ProviderServiceRow,
  service: ServiceRow | undefined,
): ProviderService {
  return {
    id: providerService.service_id,
    title:
      providerService.title_override?.trim() ||
      service?.name_dari?.trim() ||
      service?.name_english?.trim() ||
      providerService.service_id,
    description:
      providerService.description_override?.trim() ||
      service?.description_dari?.trim() ||
      service?.name_english?.trim() ||
      "",
    estimatedPrice: providerService.estimated_price,
  };
}

export function mapProviderAccountToProfile(
  provider: ProviderAccountRow,
  providerServices: ProviderServiceRow[],
  services: ServiceRow[],
): ProviderProfile {
  const serviceById = new Map(services.map((service) => [service.id, service]));

  const name = provider.business_name.trim() || provider.profession.trim();

  return {
    id: provider.id,

    name,
    initials: createInitials(name),
    profession: provider.profession,
    categoryId: normalizeCategoryId(provider.category_id),

    description: provider.description,

    provinceId: provider.province_id,
    provinceName: provider.province_name,

    districtId: provider.district_id,
    districtName: provider.district_name,

    locationLabel: provider.location_label,

    latitude: provider.latitude ?? 0,
    longitude: provider.longitude ?? 0,
    distanceKm: 0,

    verified: provider.verification_status === "verified",
    availableToday: provider.available_today,
    acceptsUrgentRequests: provider.accepts_urgent_requests,
    instantBooking: provider.instant_booking,

    rating: provider.rating,
    reviewCount: provider.review_count,
    completedJobs: provider.completed_jobs,

    yearsExperience: provider.years_experience,
    responseRate: provider.response_rate,
    averageResponseMinutes: provider.average_response_minutes,

    minimumPrice: provider.minimum_price,
    currency: "AFN",

    serviceRadiusKm: provider.service_radius_km,

    workingDays: provider.working_days,
    startTime: provider.start_time,
    endTime: provider.end_time,

    services: providerServices
      .filter((providerService) => providerService.is_active)
      .map((providerService) =>
        mapProviderService(
          providerService,
          serviceById.get(providerService.service_id),
        ),
      ),

    reviews: [],
    portfolio: [],
  };
}
