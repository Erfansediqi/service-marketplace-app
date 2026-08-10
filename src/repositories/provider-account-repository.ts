import { supabase } from "../lib/supabase";
import type {
  Json,
  Tables,
  TablesInsert,
  TablesUpdate,
} from "../types/database";

export type ProviderAccountRow = Tables<"provider_accounts">;

export type ProviderServiceRow = Tables<"provider_services">;

export type ServiceRow = Tables<"services">;

export type ServiceCategoryRow = Tables<"service_categories">;

export type ProviderVerificationStatus =
  ProviderAccountRow["verification_status"];

export type ProviderServiceDraftInput = {
  serviceId: string;
  estimatedPrice: number;
  titleOverride?: string | null;
  descriptionOverride?: string | null;
  isActive?: boolean;
};

export type CreateProviderDraftInput = {
  ownerUserId: string;

  businessName: string;
  profession: string;
  description?: string;

  categoryId: string;

  provinceId: string;
  provinceName?: string;

  districtId: string;
  districtName?: string;

  locationLabel?: string;

  latitude?: number | null;
  longitude?: number | null;

  availableToday?: boolean;
  acceptsUrgentRequests?: boolean;
  instantBooking?: boolean;

  yearsExperience?: string;

  serviceRadiusKm?: number;
  workingDays?: string[];

  startTime?: string;
  endTime?: string;

  serviceModes?: string[];
  timezone?: string;

  services: ProviderServiceDraftInput[];
};

export type ProviderDraftResult = {
  provider: ProviderAccountRow;
  services: ProviderServiceRow[];
};

export type SaveProviderServiceInput = {
  serviceId: string;
  estimatedPrice: number;
};

function normalizeRequiredText(value: string, fieldName: string): string {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error(`${fieldName} is required.`);
  }

  return normalized;
}

function normalizeOptionalText(value: string | null | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizePrice(value: number): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error("Provider service prices must be zero or greater.");
  }

  return Math.round(value);
}

function normalizeRadius(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value) || value <= 0) {
    return 10;
  }

  return value;
}

function getMinimumPrice(services: ProviderServiceDraftInput[]): number {
  if (services.length === 0) {
    return 0;
  }

  return Math.min(
    ...services.map((service) => normalizePrice(service.estimatedPrice)),
  );
}

export async function listServiceCategories(): Promise<ServiceCategoryRow[]> {
  const { data, error } = await supabase
    .from("service_categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", {
      ascending: true,
    })
    .order("name_english", {
      ascending: true,
    });

  if (error) {
    throw new Error(`Failed to load service categories: ${error.message}`);
  }

  return data ?? [];
}

export async function listServices(categoryId?: string): Promise<ServiceRow[]> {
  let query = supabase.from("services").select("*").eq("is_active", true);

  if (categoryId?.trim()) {
    query = query.eq("category_id", categoryId.trim());
  }

  const { data, error } = await query
    .order("sort_order", {
      ascending: true,
    })
    .order("name_english", {
      ascending: true,
    });

  if (error) {
    throw new Error(`Failed to load services: ${error.message}`);
  }

  return data ?? [];
}

export async function listOwnedProviderAccounts(
  ownerUserId: string,
): Promise<ProviderAccountRow[]> {
  const normalizedOwnerId = normalizeRequiredText(ownerUserId, "Owner user ID");

  const { data, error } = await supabase
    .from("provider_accounts")
    .select("*")
    .eq("owner_user_id", normalizedOwnerId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(`Failed to load provider accounts: ${error.message}`);
  }

  return data ?? [];
}

export async function getProviderAccount(
  providerId: string,
): Promise<ProviderAccountRow | null> {
  const normalizedProviderId = normalizeRequiredText(providerId, "Provider ID");

  const { data, error } = await supabase
    .from("provider_accounts")
    .select("*")
    .eq("id", normalizedProviderId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load provider account: ${error.message}`);
  }

  return data;
}

export async function listProviderServices(
  providerId: string,
): Promise<ProviderServiceRow[]> {
  const normalizedProviderId = normalizeRequiredText(providerId, "Provider ID");

  const { data, error } = await supabase
    .from("provider_services")
    .select("*")
    .eq("provider_id", normalizedProviderId)
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw new Error(`Failed to load provider services: ${error.message}`);
  }

  return data ?? [];
}

export async function createProviderDraft(
  input: CreateProviderDraftInput,
): Promise<ProviderDraftResult> {
  if (input.services.length === 0) {
    throw new Error(
      "Select at least one service before creating a provider account.",
    );
  }

  const ownerUserId = normalizeRequiredText(input.ownerUserId, "Owner user ID");

  const businessName = normalizeRequiredText(
    input.businessName,
    "Business name",
  );

  const categoryId = normalizeRequiredText(input.categoryId, "Category");

  const provinceId = normalizeRequiredText(input.provinceId, "Province");

  const districtId = normalizeRequiredText(input.districtId, "District");

  const providerInsert: TablesInsert<"provider_accounts"> = {
    owner_user_id: ownerUserId,
    business_name: businessName,
    profession: normalizeOptionalText(input.profession),
    description: normalizeOptionalText(input.description),
    category_id: categoryId,

    province_id: provinceId,
    province_name: normalizeOptionalText(input.provinceName),

    district_id: districtId,
    district_name: normalizeOptionalText(input.districtName),

    location_label: normalizeOptionalText(input.locationLabel),

    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,

    available_today: input.availableToday ?? false,

    accepts_urgent_requests: input.acceptsUrgentRequests ?? false,

    instant_booking: input.instantBooking ?? false,

    years_experience: normalizeOptionalText(input.yearsExperience),

    minimum_price: getMinimumPrice(input.services),

    currency: "AFN",

    service_radius_km: normalizeRadius(input.serviceRadiusKm),

    working_days: input.workingDays ?? [],

    start_time: input.startTime?.trim() || "08:00",

    end_time: input.endTime?.trim() || "17:00",

    service_modes: input.serviceModes ?? [],

    timezone: input.timezone?.trim() || "Asia/Kabul",
  };

  const { data: provider, error: providerError } = await supabase
    .from("provider_accounts")
    .insert(providerInsert)
    .select("*")
    .single();

  if (providerError) {
    throw new Error(
      `Failed to create provider account: ${providerError.message}`,
    );
  }

  const serviceRows: TablesInsert<"provider_services">[] = input.services.map(
    (service) => ({
      provider_id: provider.id,
      service_id: normalizeRequiredText(service.serviceId, "Service ID"),

      title_override: normalizeOptionalText(service.titleOverride) || null,

      description_override:
        normalizeOptionalText(service.descriptionOverride) || null,

      estimated_price: normalizePrice(service.estimatedPrice),

      currency: "AFN",

      is_active: service.isActive ?? true,
    }),
  );

  const { data: providerServices, error: servicesError } = await supabase
    .from("provider_services")
    .insert(serviceRows)
    .select("*");

  if (servicesError) {
    throw new Error(
      "The provider account was created as a draft, " +
        `but its services could not be saved: ${servicesError.message}`,
    );
  }

  return {
    provider,
    services: providerServices ?? [],
  };
}

export async function updateProviderAccount(
  providerId: string,
  updates: TablesUpdate<"provider_accounts">,
): Promise<ProviderAccountRow> {
  const normalizedProviderId = normalizeRequiredText(providerId, "Provider ID");

  const { data, error } = await supabase
    .from("provider_accounts")
    .update(updates)
    .eq("id", normalizedProviderId)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to update provider account: ${error.message}`);
  }

  return data;
}

export async function updateProviderService(
  providerServiceId: string,
  updates: TablesUpdate<"provider_services">,
): Promise<ProviderServiceRow> {
  const normalizedProviderServiceId = normalizeRequiredText(
    providerServiceId,
    "Provider service ID",
  );

  const { data, error } = await supabase
    .from("provider_services")
    .update(updates)
    .eq("id", normalizedProviderServiceId)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to update provider service: ${error.message}`);
  }

  return data;
}

export async function saveProviderServicesAtomic(
  providerId: string,
  services: SaveProviderServiceInput[],
): Promise<ProviderServiceRow[]> {
  const normalizedProviderId = normalizeRequiredText(providerId, "Provider ID");

  const payload: Json = services.map((service) => ({
    service_id: normalizeRequiredText(service.serviceId, "Service ID"),
    estimated_price: normalizePrice(service.estimatedPrice),
  }));

  const { data, error } = await supabase.rpc("save_provider_services", {
    p_provider_id: normalizedProviderId,
    p_services: payload,
  });

  if (error) {
    throw new Error(`Failed to save provider services: ${error.message}`);
  }

  return data ?? [];
}

export async function submitProviderAccount(
  providerId: string,
): Promise<ProviderAccountRow> {
  const normalizedProviderId = normalizeRequiredText(providerId, "Provider ID");

  const { data, error } = await supabase.rpc("submit_provider_account", {
    p_provider_id: normalizedProviderId,
  });

  if (error) {
    throw new Error(`Failed to submit provider account: ${error.message}`);
  }

  if (!data) {
    throw new Error("Supabase did not return the submitted provider account.");
  }

  return data;
}

export const ProviderAccountRepository = {
  listServiceCategories,
  listServices,
  listOwnedProviderAccounts,
  getProviderAccount,
  listProviderServices,
  createProviderDraft,
  updateProviderAccount,
  updateProviderService,
  saveProviderServicesAtomic,
  submitProviderAccount,
};
