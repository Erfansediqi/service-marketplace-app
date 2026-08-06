const STORAGE_NAMESPACE = "@khedmat";

export const CACHE_KEYS = {
  syncQueue: `${STORAGE_NAMESPACE}:sync-queue:v1`,
} as const;

export function getProfileCacheKey(userId: string): string {
  const normalizedUserId = userId.trim();

  if (!normalizedUserId) {
    throw new Error(
      "A user ID is required to create a profile cache key.",
    );
  }

  return `${STORAGE_NAMESPACE}:profile:${normalizedUserId}:v1`;
}
