import { supabase } from "../lib/supabase";
import type { Tables } from "../types/database";

export type MarketplaceProviderAccountRow = Tables<"provider_accounts">;

export type MarketplaceProviderServiceRow = Tables<"provider_services">;

/**
 * Loads only providers that are eligible to appear in the customer
 * marketplace.
 *
 * The explicit filters are important even though RLS is enabled:
 * authenticated provider owners are allowed to read their own pending/draft
 * accounts, but those accounts must never leak into customer discovery.
 */
export async function listMarketplaceProviderAccounts(): Promise<
  MarketplaceProviderAccountRow[]
> {
  const { data, error } = await supabase
    .from("provider_accounts")
    .select("*")
    .eq("verification_status", "verified")
    .eq("is_active", true)
    .order("available_today", {
      ascending: false,
    })
    .order("rating", {
      ascending: false,
    })
    .order("review_count", {
      ascending: false,
    })
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(`Failed to load marketplace providers: ${error.message}`);
  }

  return data ?? [];
}

/**
 * Bulk-load active provider-service rows for the supplied public provider
 * accounts. This avoids one network request per provider.
 */
export async function listMarketplaceProviderServices(
  providerIds: string[],
): Promise<MarketplaceProviderServiceRow[]> {
  const normalizedProviderIds = [
    ...new Set(
      providerIds.map((providerId) => providerId.trim()).filter(Boolean),
    ),
  ];

  if (normalizedProviderIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("provider_services")
    .select("*")
    .in("provider_id", normalizedProviderIds)
    .eq("is_active", true)
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw new Error(
      `Failed to load marketplace provider services: ${error.message}`,
    );
  }

  return data ?? [];
}

export const MarketplaceProviderRepository = {
  listMarketplaceProviderAccounts,
  listMarketplaceProviderServices,
};
