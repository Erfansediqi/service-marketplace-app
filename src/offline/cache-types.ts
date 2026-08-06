export type SyncState =
  | "synced"
  | "pending"
  | "failed";

export type CachedRecord<T> = {
  version: 1;
  data: T;
  cachedAt: string;
  serverUpdatedAt: string | null;
  syncState: SyncState;
  lastError: string | null;
};

export function createCachedRecord<T>(
  data: T,
  options?: {
    serverUpdatedAt?: string | null;
    syncState?: SyncState;
    lastError?: string | null;
  },
): CachedRecord<T> {
  return {
    version: 1,
    data,
    cachedAt: new Date().toISOString(),
    serverUpdatedAt:
      options?.serverUpdatedAt ?? null,
    syncState: options?.syncState ?? "synced",
    lastError: options?.lastError ?? null,
  };
}
