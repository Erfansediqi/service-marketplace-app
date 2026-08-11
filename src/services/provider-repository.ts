import {
  providers as mockProviders,
  type ProviderProfile,
} from "../data/providers";
import {
  listMarketplaceProviderAccounts,
  listMarketplaceProviderServices,
} from "../repositories/marketplace-provider-repository";
import {
  getProviderAccount,
  listOwnedProviderAccounts,
  listProviderServices,
  listServices,
  saveProviderServicesAtomic,
  updateProviderAccount,
} from "../repositories/provider-account-repository";
import { mapProviderAccountToProfile } from "./provider-profile-mapper";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function looksLikeUuid(value: string): boolean {
  return UUID_PATTERN.test(value.trim());
}

async function getRemoteProviderById(
  providerId: string,
): Promise<ProviderProfile | null> {
  if (!looksLikeUuid(providerId)) {
    return null;
  }

  const provider = await getProviderAccount(providerId);

  if (!provider) {
    return null;
  }

  const [providerServices, services] = await Promise.all([
    listProviderServices(provider.id),
    listServices(provider.category_id),
  ]);

  return mapProviderAccountToProfile(provider, providerServices, services);
}

export async function getOwnedProviderProfiles(
  ownerUserId: string,
): Promise<ProviderProfile[]> {
  const normalizedOwnerUserId = ownerUserId.trim();

  if (!normalizedOwnerUserId) {
    throw new Error(
      "An authenticated user is required to load provider accounts.",
    );
  }

  try {
    const [providerAccounts, services] = await Promise.all([
      listOwnedProviderAccounts(normalizedOwnerUserId),
      listServices(),
    ]);

    return Promise.all(
      providerAccounts.map(async (provider) => {
        const providerServices = await listProviderServices(provider.id);

        return mapProviderAccountToProfile(
          provider,
          providerServices,
          services,
        );
      }),
    );
  } catch (error) {
    console.warn("Failed to load owned providers from Supabase:", error);

    throw error;
  }
}

export type ProviderAvailabilityUpdate = {
  availableToday?: boolean;
  acceptsUrgentRequests?: boolean;
};

export async function updateProviderAvailability(
  providerId: string,
  updates: ProviderAvailabilityUpdate,
): Promise<ProviderProfile> {
  const normalizedProviderId = providerId.trim();

  if (!normalizedProviderId) {
    throw new Error("Provider ID is required.");
  }

  if (
    updates.availableToday === undefined &&
    updates.acceptsUrgentRequests === undefined
  ) {
    const existingProvider = await getProviderById(normalizedProviderId);

    if (!existingProvider) {
      throw new Error(`Provider "${normalizedProviderId}" was not found.`);
    }

    return existingProvider;
  }

  if (!looksLikeUuid(normalizedProviderId)) {
    throw new Error(
      "Provider availability can be updated only for Supabase provider accounts.",
    );
  }

  const databaseUpdates: {
    available_today?: boolean;
    accepts_urgent_requests?: boolean;
  } = {};

  if (updates.availableToday !== undefined) {
    databaseUpdates.available_today = updates.availableToday;
  }

  if (updates.acceptsUrgentRequests !== undefined) {
    databaseUpdates.accepts_urgent_requests = updates.acceptsUrgentRequests;
  }

  const provider = await updateProviderAccount(
    normalizedProviderId,
    databaseUpdates,
  );

  const [providerServices, services] = await Promise.all([
    listProviderServices(provider.id),
    listServices(provider.category_id),
  ]);

  const mappedProvider = mapProviderAccountToProfile(
    provider,
    providerServices,
    services,
  );

  return mappedProvider;
}

export type ProviderServiceOfferingInput = {
  serviceId: string;
  estimatedPrice: number;
};

export async function saveProviderServiceOffering(
  providerId: string,
  services: ProviderServiceOfferingInput[],
): Promise<ProviderProfile> {
  const normalizedProviderId = providerId.trim();

  if (!normalizedProviderId) {
    throw new Error("Provider ID is required.");
  }

  if (!looksLikeUuid(normalizedProviderId)) {
    throw new Error(
      "Service management is available only for Supabase provider accounts.",
    );
  }

  await saveProviderServicesAtomic(normalizedProviderId, services);

  const provider = await getProviderAccount(normalizedProviderId);

  if (!provider) {
    throw new Error(
      `Provider "${normalizedProviderId}" was not found after saving services.`,
    );
  }

  const [providerServices, catalogServices] = await Promise.all([
    listProviderServices(provider.id),
    listServices(provider.category_id),
  ]);

  const mappedProvider = mapProviderAccountToProfile(
    provider,
    providerServices,
    catalogServices,
  );

  return mappedProvider;
}

export async function renameProvider(
  providerId: string,
  name: string,
): Promise<ProviderProfile> {
  const normalizedProviderId = providerId.trim();
  const normalizedName = name.trim();

  if (!normalizedProviderId) {
    throw new Error("Provider ID is required.");
  }

  if (!normalizedName) {
    throw new Error("Provider name cannot be empty.");
  }

  if (!looksLikeUuid(normalizedProviderId)) {
    throw new Error(
      "Provider names can be updated only for Supabase provider accounts.",
    );
  }

  const provider = await updateProviderAccount(normalizedProviderId, {
    business_name: normalizedName,
  });

  const [providerServices, services] = await Promise.all([
    listProviderServices(provider.id),
    listServices(provider.category_id),
  ]);

  const mappedProvider = mapProviderAccountToProfile(
    provider,
    providerServices,
    services,
  );

  return mappedProvider;
}

export async function getAllProviders(): Promise<ProviderProfile[]> {
  /*
   * Customer discovery is now remote-first and intentionally does not read
   * provider-owner local mirrors. Local mirrors can contain draft/pending
   * accounts and are only an offline fallback for the provider workspace.
   */
  try {
    const providerAccounts = await listMarketplaceProviderAccounts();

    /*
     * Keep the existing demo marketplace usable while the development
     * database has no verified providers. Production must never manufacture
     * provider listings, so this fallback is development-only.
     */
    if (providerAccounts.length === 0) {
      return __DEV__ ? mockProviders : [];
    }

    const [providerServices, catalogServices] = await Promise.all([
      listMarketplaceProviderServices(
        providerAccounts.map((provider) => provider.id),
      ),
      listServices(),
    ]);

    const servicesByProviderId = new Map<string, typeof providerServices>();

    for (const providerService of providerServices) {
      const existing =
        servicesByProviderId.get(providerService.provider_id) ?? [];

      existing.push(providerService);

      servicesByProviderId.set(providerService.provider_id, existing);
    }

    return providerAccounts.map((provider) =>
      mapProviderAccountToProfile(
        provider,
        servicesByProviderId.get(provider.id) ?? [],
        catalogServices,
      ),
    );
  } catch (error) {
    console.warn(
      "Failed to load the live provider marketplace from Supabase:",
      error,
    );

    if (__DEV__) {
      return mockProviders;
    }

    throw error;
  }
}

export async function getProviderById(
  providerId: string,
): Promise<ProviderProfile | null> {
  const normalizedProviderId = providerId.trim();

  if (!normalizedProviderId) {
    return null;
  }

  /*
   * Real provider accounts use Supabase UUIDs. Supabase is the sole source of
   * truth for those accounts; do not fall back to stale AsyncStorage mirrors.
   */
  if (looksLikeUuid(normalizedProviderId)) {
    return getRemoteProviderById(normalizedProviderId);
  }

  /*
   * Legacy demo provider IDs remain available only during development so older
   * demo routes/screens can keep functioning while the remaining mock fixtures
   * are removed incrementally. Production never exposes fabricated providers.
   */
  if (__DEV__) {
    return (
      mockProviders.find((provider) => provider.id === normalizedProviderId) ??
      null
    );
  }

  return null;
}
