import {
  providers as mockProviders,
  type ProviderProfile,
} from "../data/providers";
import {
  getProviderAccount,
  listOwnedProviderAccounts,
  listProviderServices,
  listServices,
  updateProviderAccount,
} from "../repositories/provider-account-repository";
import { mapProviderAccountToProfile } from "./provider-profile-mapper";
import {
  getLocalProviderById,
  getLocalProviders,
  renameLocalProvider,
  updateLocalProvider,
} from "./provider-storage";

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
    console.warn(
      "Failed to load owned providers from Supabase; using local provider mirrors:",
      error,
    );

    return getLocalProviders();
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

  const localUpdates: Partial<ProviderProfile> = {};

  if (updates.availableToday !== undefined) {
    localUpdates.availableToday = updates.availableToday;
  }

  if (updates.acceptsUrgentRequests !== undefined) {
    localUpdates.acceptsUrgentRequests = updates.acceptsUrgentRequests;
  }

  if (!looksLikeUuid(normalizedProviderId)) {
    return updateLocalProvider(normalizedProviderId, localUpdates);
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

  /*
   * Keep the temporary local mirror aligned after the authoritative Supabase
   * write. A missing mirror is fine; this is only an offline fallback.
   */
  try {
    const localProvider = await getLocalProviderById(normalizedProviderId);

    if (localProvider) {
      await updateLocalProvider(normalizedProviderId, localUpdates);
    }
  } catch (error) {
    console.warn(
      "Provider availability was updated in Supabase, but the local fallback mirror could not be updated:",
      error,
    );
  }

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
    return renameLocalProvider(normalizedProviderId, normalizedName);
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

  /*
   * Keep the temporary local mirror aligned after a successful remote write.
   * The mirror is only an offline fallback and is never treated as the
   * authoritative provider account.
   */
  try {
    const localProvider = await getLocalProviderById(normalizedProviderId);

    if (localProvider) {
      await renameLocalProvider(normalizedProviderId, normalizedName);
    }
  } catch (error) {
    console.warn(
      "Provider was renamed in Supabase, but the local fallback mirror could not be updated:",
      error,
    );
  }

  return mappedProvider;
}

export async function getAllProviders(): Promise<ProviderProfile[]> {
  const localProviders = await getLocalProviders();

  const localProviderIds = new Set(
    localProviders.map((provider) => provider.id),
  );

  const filteredMockProviders = mockProviders.filter(
    (provider) => !localProviderIds.has(provider.id),
  );

  return [...localProviders, ...filteredMockProviders];
}

export async function getProviderById(
  providerId: string,
): Promise<ProviderProfile | null> {
  /*
   * Provider accounts created through the Supabase onboarding flow use UUIDs.
   * Prefer the remote row so the provider workspace reflects the authoritative
   * account/service state. If the network is unavailable, fall back to the
   * temporary local mirror created during registration.
   */
  if (looksLikeUuid(providerId)) {
    try {
      const remoteProvider = await getRemoteProviderById(providerId);

      if (remoteProvider) {
        return remoteProvider;
      }
    } catch (error) {
      console.warn(
        "Failed to load provider from Supabase; using local fallback if available:",
        error,
      );
    }
  }

  const localProvider = await getLocalProviderById(providerId);

  if (localProvider) {
    return localProvider;
  }

  return mockProviders.find((provider) => provider.id === providerId) ?? null;
}
