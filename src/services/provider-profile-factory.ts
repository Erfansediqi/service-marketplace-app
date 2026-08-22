import {
  categoryServices,
} from "../data/category-services";
import {
  serviceProfessions,
} from "../data/service-professions";
import type {
  ProviderCategoryId,
  ProviderProfile,
  ProviderService,
} from "../types/provider";

export type ProviderRegistrationData = {
  category: string;
  services: string;
  experience: string;

  businessName: string;
  description: string;

  province: string;
  provinceName: string;

  district: string;
  districtName: string;

  radius: string;
  serviceModes: string;

  workingDays: string;
  startTime: string;
  endTime: string;

  urgentRequests: string;
  availableToday: string;
};

function createProviderId(): string {
  return `local-provider-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

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

function parseBoolean(
  value: string,
): boolean {
  return value === "true";
}

function parseRadius(
  value: string,
): number {
  const parsed = Number(value);

  if (
    Number.isFinite(parsed) &&
    parsed > 0
  ) {
    return parsed;
  }

  return 10;
}

function getYearsExperience(
  experienceId: string,
): string {
  switch (experienceId) {
    case "less-than-1":
      return "Less than 1 year";

    case "1-2":
      return "1–2 years";

    case "3-5":
      return "3–5 years";

    case "6-10":
      return "6–10 years";

    case "more-than-10":
      return "More than 10 years";

    default:
      return experienceId;
  }
}

function getCategoryId(
  value: string,
): ProviderCategoryId {
  const category =
    serviceProfessions.find(
      (item) =>
        item.id === value,
    );

  return (
    category?.id as ProviderCategoryId
  ) ?? "other";
}

function getProfession(
  categoryId: string,
): string {
  const category =
    serviceProfessions.find(
      (item) =>
        item.id === categoryId,
    );

  return (
    category?.nameFa ??
    category?.nameEn ??
    "Service provider"
  );
}

function createServices(
  categoryId: string,
  servicesParam: string,
): ProviderService[] {
  const selectedIds =
    servicesParam
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  return selectedIds.map(
    (serviceId) => {
      const service =
        categoryServices.find(
          (item) =>
            item.id === serviceId &&
            item.categoryId ===
              categoryId,
        );

      const titleEnglish =
        service?.nameEn?.trim() ||
        serviceId;

      const titleDari =
        service?.nameFa?.trim() ||
        titleEnglish;

      /*
       * The local category-services fixture does not currently contain Pashto
       * names. Keep English as a compatibility fallback here; live Supabase
       * services get their real Pashto names in provider-profile-mapper.ts.
       */
      const titlePashto =
        titleEnglish;

      const descriptionEnglish =
        "";

      const descriptionDari =
        service?.descriptionFa?.trim() ||
        "";

      const descriptionPashto =
        "";

      return {
        id: serviceId,

        title:
          titleEnglish,
        description:
          descriptionEnglish,

        titleEnglish,
        titleDari,
        titlePashto,

        descriptionEnglish,
        descriptionDari,
        descriptionPashto,

        estimatedPrice: 500,
      };
    },
  );
}

export function createLocalProviderProfile(
  registration: ProviderRegistrationData,
): ProviderProfile {
  const categoryId =
    getCategoryId(
      registration.category,
    );

  const services =
    createServices(
      categoryId,
      registration.services,
    );

  const minimumPrice =
    services.length > 0
      ? Math.min(
          ...services.map(
            (service) =>
              service.estimatedPrice,
          ),
        )
      : 500;

  const name =
    registration.businessName.trim() ||
    getProfession(categoryId);

  return {
    id: createProviderId(),

    name,
    initials:
      createInitials(name),

    profession:
      getProfession(categoryId),

    categoryId,

    description:
      registration.description.trim(),

    provinceId:
      registration.province,

    provinceName:
      registration.provinceName,

    districtId:
      registration.district,

    districtName:
      registration.districtName,

    locationLabel: [
      registration.districtName,
      registration.provinceName,
    ]
      .filter(Boolean)
      .join("، "),

    /*
     * Registration currently collects named service
     * areas but no precise coordinates.
     */
    latitude: 34.5553,
    longitude: 69.2075,
    distanceKm: 0,

    verified: false,

    availableToday:
      parseBoolean(
        registration.availableToday,
      ),

    acceptsUrgentRequests:
      parseBoolean(
        registration.urgentRequests,
      ),

    instantBooking: false,

    rating: 0,
    reviewCount: 0,
    completedJobs: 0,

    yearsExperience:
      getYearsExperience(
        registration.experience,
      ),

    responseRate: 0,
    averageResponseMinutes: 0,

    minimumPrice,
    currency: "AFN",

    serviceRadiusKm:
      parseRadius(
        registration.radius,
      ),

    workingDays:
      registration.workingDays
        .split(",")
        .map((item) =>
          item.trim(),
        )
        .filter(Boolean),

    startTime:
      registration.startTime,

    endTime:
      registration.endTime,

    services,

    reviews: [],
    portfolio: [],
  };
}