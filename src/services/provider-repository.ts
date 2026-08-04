import {
    providers as mockProviders,
    type ProviderProfile,
} from "../data/providers";
import {
    getLocalProviderById,
    getLocalProviders,
} from "./provider-storage";

export async function getAllProviders(): Promise<
  ProviderProfile[]
> {
  const localProviders =
    await getLocalProviders();

  const localProviderIds =
    new Set(
      localProviders.map(
        (provider) => provider.id,
      ),
    );

  const filteredMockProviders =
    mockProviders.filter(
      (provider) =>
        !localProviderIds.has(
          provider.id,
        ),
    );

  return [
    ...localProviders,
    ...filteredMockProviders,
  ];
}

export async function getProviderById(
  providerId: string,
): Promise<ProviderProfile | null> {
  const localProvider =
    await getLocalProviderById(
      providerId,
    );

  if (localProvider) {
    return localProvider;
  }

  return (
    mockProviders.find(
      (provider) =>
        provider.id === providerId,
    ) ?? null
  );
}