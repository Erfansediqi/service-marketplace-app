import type { ProviderProfile } from "../data/providers";
import { StorageService } from "./storage";

const LOCAL_PROVIDERS_STORAGE_KEY =
  "@khedmat_local_providers";

type ProviderProfileUpdate =
  Partial<
    Omit<
      ProviderProfile,
      "id"
    >
  >;

type DuplicateProviderOptions = {
  name?: string;
  profession?: string;
  categoryId?: ProviderProfile["categoryId"];

  /**
   * Keep the original services by default.
   * Set to false when duplication should begin with
   * an empty service list.
   */
  copyServices?: boolean;

  /**
   * Keep the original portfolio by default.
   * Verification and performance data are always reset.
   */
  copyPortfolio?: boolean;
};

function isObject(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null
  );
}

function isProviderProfile(
  value: unknown,
): value is ProviderProfile {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.initials === "string" &&
    typeof value.profession === "string" &&
    typeof value.categoryId === "string" &&
    typeof value.description === "string" &&
    typeof value.provinceId === "string" &&
    typeof value.provinceName === "string" &&
    typeof value.districtId === "string" &&
    typeof value.districtName === "string" &&
    typeof value.locationLabel === "string" &&
    typeof value.latitude === "number" &&
    typeof value.longitude === "number" &&
    typeof value.distanceKm === "number" &&
    typeof value.verified === "boolean" &&
    typeof value.availableToday === "boolean" &&
    typeof value.acceptsUrgentRequests === "boolean" &&
    typeof value.instantBooking === "boolean" &&
    typeof value.rating === "number" &&
    typeof value.reviewCount === "number" &&
    typeof value.completedJobs === "number" &&
    typeof value.yearsExperience === "string" &&
    typeof value.responseRate === "number" &&
    typeof value.averageResponseMinutes === "number" &&
    typeof value.minimumPrice === "number" &&
    value.currency === "AFN" &&
    typeof value.serviceRadiusKm === "number" &&
    Array.isArray(value.workingDays) &&
    typeof value.startTime === "string" &&
    typeof value.endTime === "string" &&
    Array.isArray(value.services) &&
    Array.isArray(value.reviews) &&
    Array.isArray(value.portfolio)
  );
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

function createProviderId(): string {
  return `local-provider-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function cloneArray<T>(
  values: T[],
): T[] {
  return values.map((value) => {
    if (
      typeof value === "object" &&
      value !== null
    ) {
      return {
        ...value,
      };
    }

    return value;
  }) as T[];
}

export async function getLocalProviders(): Promise<
  ProviderProfile[]
> {
  const stored =
    await StorageService.get<unknown>(
      LOCAL_PROVIDERS_STORAGE_KEY,
    );

  if (!Array.isArray(stored)) {
    return [];
  }

  return stored.filter(
    isProviderProfile,
  );
}

export async function saveLocalProviders(
  providers: ProviderProfile[],
): Promise<void> {
  await StorageService.save(
    LOCAL_PROVIDERS_STORAGE_KEY,
    providers,
  );
}

export async function addLocalProvider(
  provider: ProviderProfile,
): Promise<void> {
  const providers =
    await getLocalProviders();

  const existingIndex =
    providers.findIndex(
      (item) =>
        item.id === provider.id,
    );

  const updatedProviders =
    existingIndex >= 0
      ? providers.map((item) =>
          item.id === provider.id
            ? provider
            : item,
        )
      : [provider, ...providers];

  await saveLocalProviders(
    updatedProviders,
  );
}

export async function updateLocalProvider(
  providerId: string,
  updates: ProviderProfileUpdate,
): Promise<ProviderProfile> {
  const providers =
    await getLocalProviders();

  const existingProvider =
    providers.find(
      (provider) =>
        provider.id === providerId,
    );

  if (!existingProvider) {
    throw new Error(
      `Provider "${providerId}" was not found.`,
    );
  }

  const normalizedName =
    typeof updates.name === "string"
      ? updates.name.trim()
      : undefined;

  if (
    updates.name !== undefined &&
    !normalizedName
  ) {
    throw new Error(
      "Provider name cannot be empty.",
    );
  }

  const updatedProvider: ProviderProfile = {
    ...existingProvider,
    ...updates,

    /*
     * Provider identity must never change during an
     * update operation.
     */
    id: existingProvider.id,

    name:
      normalizedName ??
      existingProvider.name,

    initials:
      normalizedName !== undefined
        ? createInitials(
            normalizedName,
          )
        : updates.initials ??
          existingProvider.initials,
  };

  if (
    !isProviderProfile(
      updatedProvider,
    )
  ) {
    throw new Error(
      "The updated provider profile is invalid.",
    );
  }

  const updatedProviders =
    providers.map(
      (provider) =>
        provider.id === providerId
          ? updatedProvider
          : provider,
    );

  await saveLocalProviders(
    updatedProviders,
  );

  return updatedProvider;
}

export async function renameLocalProvider(
  providerId: string,
  name: string,
): Promise<ProviderProfile> {
  return updateLocalProvider(
    providerId,
    {
      name,
    },
  );
}

export async function duplicateLocalProvider(
  providerId: string,
  options: DuplicateProviderOptions = {},
): Promise<ProviderProfile> {
  const providers =
    await getLocalProviders();

  const originalProvider =
    providers.find(
      (provider) =>
        provider.id === providerId,
    );

  if (!originalProvider) {
    throw new Error(
      `Provider "${providerId}" was not found.`,
    );
  }

  const duplicatedName =
    options.name?.trim() ||
    `${originalProvider.name} Copy`;

  const duplicatedProvider: ProviderProfile = {
    ...originalProvider,

    /*
     * A duplicate is a separate provider identity.
     * Bookings and notifications therefore remain
     * isolated by this new ID.
     */
    id: createProviderId(),

    name: duplicatedName,
    initials:
      createInitials(
        duplicatedName,
      ),

    profession:
      options.profession?.trim() ||
      originalProvider.profession,

    categoryId:
      options.categoryId ??
      originalProvider.categoryId,

    /*
     * Clone mutable arrays so changes to the duplicate
     * cannot mutate the original provider in memory.
     */
    services:
      options.copyServices === false
        ? []
        : cloneArray(
            originalProvider.services,
          ),

    portfolio:
      options.copyPortfolio === false
        ? []
        : cloneArray(
            originalProvider.portfolio,
          ),

    workingDays:
      [...originalProvider.workingDays],

    /*
     * A new provider account must not inherit public
     * reputation or completed-work history.
     */
    verified: false,
    rating: 0,
    reviewCount: 0,
    completedJobs: 0,
    reviews: [],

    /*
     * Response metrics start fresh for the duplicate.
     */
    responseRate: 0,
    averageResponseMinutes: 0,

    /*
     * Avoid presenting a newly duplicated account as
     * immediately available until the provider reviews
     * and confirms its configuration.
     */
    availableToday: false,
  };

  if (
    !isProviderProfile(
      duplicatedProvider,
    )
  ) {
    throw new Error(
      "The duplicated provider profile is invalid.",
    );
  }

  await saveLocalProviders([
    duplicatedProvider,
    ...providers,
  ]);

  return duplicatedProvider;
}

export async function getLocalProviderById(
  providerId: string,
): Promise<ProviderProfile | null> {
  const providers =
    await getLocalProviders();

  return (
    providers.find(
      (provider) =>
        provider.id === providerId,
    ) ?? null
  );
}

export async function removeLocalProvider(
  providerId: string,
): Promise<void> {
  const providers =
    await getLocalProviders();

  await saveLocalProviders(
    providers.filter(
      (provider) =>
        provider.id !== providerId,
    ),
  );
}

export {
  LOCAL_PROVIDERS_STORAGE_KEY
};
