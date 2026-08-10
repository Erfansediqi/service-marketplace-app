import { listOwnedProviderAccounts } from "../repositories/provider-account-repository";

export type PostLoginWorkspace =
  | {
      role: "customer";
      providerId: null;
    }
  | {
      role: "provider";
      providerId: string;
    };

type ResolvePostLoginWorkspaceInput = {
  userId: string;
  lastWorkspaceRole:
    | "customer"
    | "provider";
  lastProviderId: string | null;
  defaultProviderId: string | null;
};

/**
 * Resolves the workspace that should open after a returning user signs in.
 *
 * The most recently used workspace is the primary routing preference.
 *
 * If the user last worked as a provider, the remembered provider ID is
 * validated against authoritative Supabase provider_accounts ownership before
 * provider mode is restored. If that provider is no longer valid, an explicit
 * default provider may be used as a secondary fallback.
 *
 * Local provider mirrors are intentionally not used here because they are an
 * offline UI fallback, not an authentication/ownership authority.
 *
 * If the user last worked as a customer, or provider ownership cannot be
 * validated, Khedmat safely opens the customer workspace.
 */
export async function resolvePostLoginWorkspace({
  userId,
  lastWorkspaceRole,
  lastProviderId,
  defaultProviderId,
}: ResolvePostLoginWorkspaceInput): Promise<PostLoginWorkspace> {
  const normalizedUserId =
    userId.trim();

  if (!normalizedUserId) {
    throw new Error(
      "An authenticated user is required to resolve the post-login workspace.",
    );
  }

  if (
    lastWorkspaceRole ===
    "customer"
  ) {
    return {
      role: "customer",
      providerId: null,
    };
  }

  const normalizedLastProviderId =
    lastProviderId?.trim() ||
    null;

  const normalizedDefaultProviderId =
    defaultProviderId?.trim() ||
    null;

  try {
    const ownedProviders =
      await listOwnedProviderAccounts(
        normalizedUserId,
      );

    const ownedProviderIds =
      new Set(
        ownedProviders.map(
          (provider) =>
            provider.id,
        ),
      );

    if (
      normalizedLastProviderId &&
      ownedProviderIds.has(
        normalizedLastProviderId,
      )
    ) {
      return {
        role: "provider",
        providerId:
          normalizedLastProviderId,
      };
    }

    if (
      normalizedDefaultProviderId &&
      ownedProviderIds.has(
        normalizedDefaultProviderId,
      )
    ) {
      return {
        role: "provider",
        providerId:
          normalizedDefaultProviderId,
      };
    }
  } catch (error) {
    console.warn(
      "Could not validate the remembered provider workspace against Supabase after login; opening the customer workspace:",
      error,
    );
  }

  return {
    role: "customer",
    providerId: null,
  };
}
