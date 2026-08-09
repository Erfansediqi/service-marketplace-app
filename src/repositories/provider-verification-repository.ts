import { supabase } from "../lib/supabase";
import type { Tables, TablesInsert } from "../types/database";

export type ProviderVerificationSubmissionRow =
  Tables<"provider_verification_submissions">;

export type SaveProviderVerificationSubmissionInput = {
  providerId: string;
  ownerUserId: string;
  identityNumber: string;
  profilePhotoPath: string;
  identityFrontPath: string;
  identityBackPath?: string | null;
  declarationAcceptedAt: string;
};

function required(value: string, label: string): string {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error(`${label} is required.`);
  }

  return normalized;
}

function optional(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  return normalized || null;
}

async function getForProvider(
  providerId: string,
): Promise<ProviderVerificationSubmissionRow | null> {
  const { data, error } = await supabase
    .from("provider_verification_submissions")
    .select("*")
    .eq("provider_id", required(providerId, "Provider ID"))
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load provider verification submission: ${error.message}`,
    );
  }

  return data;
}

async function saveSubmission(
  input: SaveProviderVerificationSubmissionInput,
): Promise<ProviderVerificationSubmissionRow> {
  const row: TablesInsert<"provider_verification_submissions"> = {
    provider_id: required(input.providerId, "Provider ID"),
    owner_user_id: required(input.ownerUserId, "Owner user ID"),
    identity_number: required(input.identityNumber, "Identity number"),
    profile_photo_path: required(input.profilePhotoPath, "Profile photo path"),
    identity_front_path: required(
      input.identityFrontPath,
      "Identity front path",
    ),
    identity_back_path: optional(input.identityBackPath),
    declaration_accepted_at: required(
      input.declarationAcceptedAt,
      "Declaration acceptance time",
    ),
  };

  const existing = await getForProvider(row.provider_id);

  if (existing) {
    const { data, error } = await supabase
      .from("provider_verification_submissions")
      .update({
        identity_number: row.identity_number,
        profile_photo_path: row.profile_photo_path,
        identity_front_path: row.identity_front_path,
        identity_back_path: row.identity_back_path,
        declaration_accepted_at: row.declaration_accepted_at,
      })
      .eq("provider_id", row.provider_id)
      .select("*")
      .single();

    if (error) {
      throw new Error(
        `Failed to update provider verification submission: ${error.message}`,
      );
    }

    return data;
  }

  const { data, error } = await supabase
    .from("provider_verification_submissions")
    .insert(row)
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Failed to create provider verification submission: ${error.message}`,
    );
  }

  return data;
}

export const ProviderVerificationRepository = {
  getForProvider,
  saveSubmission,
};
