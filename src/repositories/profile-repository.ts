import type { Database } from "../types/database";
import { supabase } from "../lib/supabase";
import { getProfileCacheKey } from "../offline/cache-keys";
import { CacheStorage } from "../offline/cache-storage";
import {
  createCachedRecord,
  type CachedRecord,
} from "../offline/cache-types";

export type ProfileRow =
  Database["public"]["Tables"]["profiles"]["Row"];

export type ProfileUpdate =
  Database["public"]["Tables"]["profiles"]["Update"];

export class ProfileRepositoryError extends Error {
  readonly causeValue: unknown;

  constructor(
    message: string,
    causeValue?: unknown,
  ) {
    super(message);
    this.name = "ProfileRepositoryError";
    this.causeValue = causeValue;
  }
}

function normalizeUserId(userId: string): string {
  const normalizedUserId = userId.trim();

  if (!normalizedUserId) {
    throw new ProfileRepositoryError(
      "A user ID is required to access a profile.",
    );
  }

  return normalizedUserId;
}

async function getCachedProfile(
  userId: string,
): Promise<CachedRecord<ProfileRow> | null> {
  const normalizedUserId = normalizeUserId(userId);

  return CacheStorage.get<CachedRecord<ProfileRow>>(
    getProfileCacheKey(normalizedUserId),
  );
}

async function fetchRemoteProfile(
  userId: string,
): Promise<CachedRecord<ProfileRow>> {
  const normalizedUserId = normalizeUserId(userId);

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", normalizedUserId)
    .single();

  if (error) {
    throw new ProfileRepositoryError(
      `Failed to fetch profile: ${error.message}`,
      error,
    );
  }

  const cachedProfile = createCachedRecord(data, {
    serverUpdatedAt: data.updated_at,
    syncState: "synced",
    lastError: null,
  });

  await CacheStorage.set(
    getProfileCacheKey(normalizedUserId),
    cachedProfile,
  );

  return cachedProfile;
}

async function removeCachedProfile(
  userId: string,
): Promise<void> {
  const normalizedUserId = normalizeUserId(userId);

  await CacheStorage.remove(
    getProfileCacheKey(normalizedUserId),
  );
}

export const ProfileRepository = {
  getCachedProfile,
  fetchRemoteProfile,
  removeCachedProfile,
};
