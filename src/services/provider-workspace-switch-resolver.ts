import { listOwnedProviderAccounts } from "../repositories/provider-account-repository";

export type ProviderWorkspaceSwitchResolution =
  | {
      destination: "provider";
      providerId: string;
    }
  | {
      destination: "provider-selection";
      providerId: null;
    }
  | {
      destination: "provider-registration";
      providerId: null;
    };

export async function resolveProviderWorkspaceSwitch(
  userId: string,
): Promise<ProviderWorkspaceSwitchResolution> {
  const normalizedUserId =
    userId.trim();

  if (!normalizedUserId) {
    throw new Error(
      "An authenticated user is required to switch to a provider workspace.",
    );
  }

  const providerAccounts =
    await listOwnedProviderAccounts(
      normalizedUserId,
    );

  if (
    providerAccounts.length === 0
  ) {
    return {
      destination:
        "provider-registration",
      providerId: null,
    };
  }

  if (
    providerAccounts.length === 1
  ) {
    return {
      destination: "provider",
      providerId:
        providerAccounts[0].id,
    };
  }

  return {
    destination:
      "provider-selection",
    providerId: null,
  };
}
