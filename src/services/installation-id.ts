import * as Crypto from "expo-crypto";

import { CacheStorage } from "../offline/cache-storage";

const INSTALLATION_ID_STORAGE_KEY =
  "khedmat.push.installation-id.v1";

let cachedInstallationId: string | null =
  null;

let installationIdPromise:
  | Promise<string>
  | null = null;

/**
 * Returns the stable identifier for this Khedmat installation.
 *
 * The identifier is created once and persisted locally. It is intentionally
 * independent of the authenticated user so the same physical installation can
 * safely move between accounts while push_devices ownership is updated by the
 * server-side registration RPC.
 *
 * This identifier must not be removed during logout.
 */
export async function getOrCreateInstallationId(): Promise<string> {
  if (cachedInstallationId) {
    return cachedInstallationId;
  }

  if (installationIdPromise) {
    return installationIdPromise;
  }

  installationIdPromise =
    loadOrCreateInstallationId();

  try {
    const installationId =
      await installationIdPromise;

    cachedInstallationId =
      installationId;

    return installationId;
  } finally {
    installationIdPromise =
      null;
  }
}

async function loadOrCreateInstallationId(): Promise<string> {
  const storedInstallationId =
    await CacheStorage.get<unknown>(
      INSTALLATION_ID_STORAGE_KEY,
    );

  if (
    typeof storedInstallationId === "string" &&
    storedInstallationId.trim()
  ) {
    return storedInstallationId.trim();
  }

  const installationId =
    Crypto.randomUUID();

  await CacheStorage.set(
    INSTALLATION_ID_STORAGE_KEY,
    installationId,
  );

  return installationId;
}