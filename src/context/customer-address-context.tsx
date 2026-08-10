import {
    type PropsWithChildren,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import { StorageService } from "../services/storage";
import { useSupabaseAuth } from "./supabase-auth-context";

export type CustomerAddressLabel =
  | "home"
  | "work"
  | "other";

export type CustomerAddressSource =
  | "manual"
  | "location";

export type CustomerAddress = {
  id: string;

  label: CustomerAddressLabel;
  customLabel: string;

  provinceId: string;
  provinceName: string;

  districtId: string;
  districtName: string;

  neighbourhood: string;
  street: string;
  house: string;
  details: string;

  fullAddress: string;

  latitude: number | null;
  longitude: number | null;

  source: CustomerAddressSource;

  createdAt: string;
  updatedAt: string;
};

export type CustomerAddressInput = {
  label?: CustomerAddressLabel;
  customLabel?: string;

  provinceId?: string;
  provinceName?: string;

  districtId?: string;
  districtName?: string;

  neighbourhood?: string;
  street?: string;
  house?: string;
  details?: string;

  fullAddress?: string;

  latitude?: number | null;
  longitude?: number | null;

  source: CustomerAddressSource;
};

type PersistedCustomerAddressesV1 = {
  version: 1;
  addresses: CustomerAddress[];
};

type CustomerAddressContextValue = {
  addresses: CustomerAddress[];
  isHydrated: boolean;

  addAddress: (
    input: CustomerAddressInput,
  ) => Promise<CustomerAddress>;

  updateAddress: (
    addressId: string,
    updates: Partial<CustomerAddressInput>,
  ) => Promise<CustomerAddress>;

  deleteAddress: (
    addressId: string,
  ) => Promise<void>;

  getAddressById: (
    addressId: string,
  ) => CustomerAddress | null;
};

const CUSTOMER_ADDRESSES_STORAGE_PREFIX =
  "@khedmat_customer_addresses";

const CustomerAddressContext =
  createContext<CustomerAddressContextValue | null>(
    null,
  );

function normalizeText(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function normalizeNullableNumber(
  value: unknown,
): number | null {
  return typeof value === "number" &&
    Number.isFinite(value)
    ? value
    : null;
}

function isAddressLabel(
  value: unknown,
): value is CustomerAddressLabel {
  return (
    value === "home" ||
    value === "work" ||
    value === "other"
  );
}

function isAddressSource(
  value: unknown,
): value is CustomerAddressSource {
  return (
    value === "manual" ||
    value === "location"
  );
}

function createAddressId(): string {
  return [
    "address",
    Date.now().toString(36),
    Math.random()
      .toString(36)
      .slice(2, 10),
  ].join("-");
}

function createStorageKey(
  userId: string | null,
): string {
  return `${CUSTOMER_ADDRESSES_STORAGE_PREFIX}:${
    userId || "local"
  }`;
}

function buildFullAddress(
  input: CustomerAddressInput,
): string {
  const providedFullAddress =
    normalizeText(
      input.fullAddress,
    );

  if (providedFullAddress) {
    return providedFullAddress;
  }

  return [
    normalizeText(
      input.house,
    ),
    normalizeText(
      input.street,
    ),
    normalizeText(
      input.neighbourhood,
    ),
    normalizeText(
      input.districtName,
    ),
    normalizeText(
      input.provinceName,
    ),
  ]
    .filter(Boolean)
    .join(", ");
}

function normalizeAddress(
  value: unknown,
): CustomerAddress | null {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return null;
  }

  const stored =
    value as Record<
      string,
      unknown
    >;

  const id =
    normalizeText(stored.id);

  const label =
    isAddressLabel(
      stored.label,
    )
      ? stored.label
      : "other";

  const source =
    isAddressSource(
      stored.source,
    )
      ? stored.source
      : "manual";

  const createdAt =
    normalizeText(
      stored.createdAt,
    );

  const updatedAt =
    normalizeText(
      stored.updatedAt,
    );

  if (
    !id ||
    !createdAt ||
    !updatedAt
  ) {
    return null;
  }

  const normalized: CustomerAddress = {
    id,

    label,
    customLabel:
      normalizeText(
        stored.customLabel,
      ),

    provinceId:
      normalizeText(
        stored.provinceId,
      ),

    provinceName:
      normalizeText(
        stored.provinceName,
      ),

    districtId:
      normalizeText(
        stored.districtId,
      ),

    districtName:
      normalizeText(
        stored.districtName,
      ),

    neighbourhood:
      normalizeText(
        stored.neighbourhood,
      ),

    street:
      normalizeText(
        stored.street,
      ),

    house:
      normalizeText(
        stored.house,
      ),

    details:
      normalizeText(
        stored.details,
      ),

    fullAddress:
      normalizeText(
        stored.fullAddress,
      ),

    latitude:
      normalizeNullableNumber(
        stored.latitude,
      ),

    longitude:
      normalizeNullableNumber(
        stored.longitude,
      ),

    source,

    createdAt,
    updatedAt,
  };

  if (
    !normalized.fullAddress
  ) {
    normalized.fullAddress =
      buildFullAddress({
        ...normalized,
        source:
          normalized.source,
      });
  }

  return normalized;
}

function normalizeStoredAddresses(
  value: unknown,
): CustomerAddress[] {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return [];
  }

  const stored =
    value as Record<
      string,
      unknown
    >;

  if (
    stored.version !== 1 ||
    !Array.isArray(
      stored.addresses,
    )
  ) {
    return [];
  }

  return stored.addresses
    .map(normalizeAddress)
    .filter(
      (
        address,
      ): address is CustomerAddress =>
        address !== null,
    );
}

async function readLocalAddresses(
  storageKey: string,
): Promise<CustomerAddress[]> {
  const stored =
    await StorageService.get<unknown>(
      storageKey,
    );

  return normalizeStoredAddresses(
    stored,
  );
}

async function writeLocalAddresses(
  storageKey: string,
  addresses: CustomerAddress[],
): Promise<void> {
  const persisted: PersistedCustomerAddressesV1 = {
    version: 1,
    addresses,
  };

  await StorageService.save(
    storageKey,
    persisted,
  );
}

function createAddress(
  input: CustomerAddressInput,
): CustomerAddress {
  const now =
    new Date().toISOString();

  const fullAddress =
    buildFullAddress(input);

  if (!fullAddress) {
    throw new Error(
      "A saved address must contain address details.",
    );
  }

  return {
    id: createAddressId(),

    label:
      input.label ??
      "home",

    customLabel:
      normalizeText(
        input.customLabel,
      ),

    provinceId:
      normalizeText(
        input.provinceId,
      ),

    provinceName:
      normalizeText(
        input.provinceName,
      ),

    districtId:
      normalizeText(
        input.districtId,
      ),

    districtName:
      normalizeText(
        input.districtName,
      ),

    neighbourhood:
      normalizeText(
        input.neighbourhood,
      ),

    street:
      normalizeText(
        input.street,
      ),

    house:
      normalizeText(
        input.house,
      ),

    details:
      normalizeText(
        input.details,
      ),

    fullAddress,

    latitude:
      normalizeNullableNumber(
        input.latitude,
      ),

    longitude:
      normalizeNullableNumber(
        input.longitude,
      ),

    source:
      input.source,

    createdAt: now,
    updatedAt: now,
  };
}

export function CustomerAddressProvider({
  children,
}: PropsWithChildren) {
  const {
    user,
    isHydrated:
      authIsHydrated,
  } = useSupabaseAuth();

  const [
    addresses,
    setAddresses,
  ] = useState<
    CustomerAddress[]
  >([]);

  const [
    isHydrated,
    setIsHydrated,
  ] = useState(false);

  const storageKey =
    useMemo(
      () =>
        createStorageKey(
          user?.id ?? null,
        ),
      [user?.id],
    );

  useEffect(() => {
    if (!authIsHydrated) {
      return;
    }

    let isMounted = true;

    const hydrate =
      async (): Promise<void> => {
        setIsHydrated(false);

        try {
          const storedAddresses =
            await readLocalAddresses(
              storageKey,
            );

          if (isMounted) {
            setAddresses(
              storedAddresses,
            );
          }
        } catch (error) {
          console.error(
            "Failed to hydrate customer addresses:",
            error,
          );

          if (isMounted) {
            setAddresses([]);
          }
        } finally {
          if (isMounted) {
            setIsHydrated(true);
          }
        }
      };

    void hydrate();

    return () => {
      isMounted = false;
    };
  }, [
    authIsHydrated,
    storageKey,
  ]);

  const persistAddresses =
    useCallback(
      async (
        nextAddresses: CustomerAddress[],
      ): Promise<void> => {
        await writeLocalAddresses(
          storageKey,
          nextAddresses,
        );

        setAddresses(
          nextAddresses,
        );
      },
      [storageKey],
    );

  const addAddress =
    useCallback(
      async (
        input: CustomerAddressInput,
      ): Promise<CustomerAddress> => {
        const nextAddress =
          createAddress(
            input,
          );

        const nextAddresses = [
          ...addresses,
          nextAddress,
        ];

        await persistAddresses(
          nextAddresses,
        );

        return nextAddress;
      },
      [
        addresses,
        persistAddresses,
      ],
    );

  const updateAddress =
    useCallback(
      async (
        addressId: string,
        updates: Partial<CustomerAddressInput>,
      ): Promise<CustomerAddress> => {
        const existingAddress =
          addresses.find(
            (address) =>
              address.id ===
              addressId,
          );

        if (!existingAddress) {
          throw new Error(
            `Saved address "${addressId}" was not found.`,
          );
        }

        const nextInput: CustomerAddressInput = {
          label:
            updates.label ??
            existingAddress.label,

          customLabel:
            updates.customLabel ??
            existingAddress.customLabel,

          provinceId:
            updates.provinceId ??
            existingAddress.provinceId,

          provinceName:
            updates.provinceName ??
            existingAddress.provinceName,

          districtId:
            updates.districtId ??
            existingAddress.districtId,

          districtName:
            updates.districtName ??
            existingAddress.districtName,

          neighbourhood:
            updates.neighbourhood ??
            existingAddress.neighbourhood,

          street:
            updates.street ??
            existingAddress.street,

          house:
            updates.house ??
            existingAddress.house,

          details:
            updates.details ??
            existingAddress.details,

          fullAddress:
            updates.fullAddress ??
            existingAddress.fullAddress,

          latitude:
            updates.latitude ??
            existingAddress.latitude,

          longitude:
            updates.longitude ??
            existingAddress.longitude,

          source:
            updates.source ??
            existingAddress.source,
        };

        const fullAddress =
          buildFullAddress(
            nextInput,
          );

        if (!fullAddress) {
          throw new Error(
            "A saved address must contain address details.",
          );
        }

        const updatedAddress: CustomerAddress = {
          ...existingAddress,

          label:
            nextInput.label ??
            existingAddress.label,

          customLabel:
            normalizeText(
              nextInput.customLabel,
            ),

          provinceId:
            normalizeText(
              nextInput.provinceId,
            ),

          provinceName:
            normalizeText(
              nextInput.provinceName,
            ),

          districtId:
            normalizeText(
              nextInput.districtId,
            ),

          districtName:
            normalizeText(
              nextInput.districtName,
            ),

          neighbourhood:
            normalizeText(
              nextInput.neighbourhood,
            ),

          street:
            normalizeText(
              nextInput.street,
            ),

          house:
            normalizeText(
              nextInput.house,
            ),

          details:
            normalizeText(
              nextInput.details,
            ),

          fullAddress,

          latitude:
            normalizeNullableNumber(
              nextInput.latitude,
            ),

          longitude:
            normalizeNullableNumber(
              nextInput.longitude,
            ),

          source:
            nextInput.source,

          updatedAt:
            new Date().toISOString(),
        };

        const nextAddresses =
          addresses.map(
            (address) =>
              address.id ===
              addressId
                ? updatedAddress
                : address,
          );

        await persistAddresses(
          nextAddresses,
        );

        return updatedAddress;
      },
      [
        addresses,
        persistAddresses,
      ],
    );

  const deleteAddress =
    useCallback(
      async (
        addressId: string,
      ): Promise<void> => {
        const nextAddresses =
          addresses.filter(
            (address) =>
              address.id !==
              addressId,
          );

        if (
          nextAddresses.length ===
          addresses.length
        ) {
          return;
        }

        await persistAddresses(
          nextAddresses,
        );
      },
      [
        addresses,
        persistAddresses,
      ],
    );

  const getAddressById =
    useCallback(
      (
        addressId: string,
      ): CustomerAddress | null =>
        addresses.find(
          (address) =>
            address.id ===
            addressId,
        ) ?? null,
      [addresses],
    );

  const value =
    useMemo<CustomerAddressContextValue>(
      () => ({
        addresses,
        isHydrated,
        addAddress,
        updateAddress,
        deleteAddress,
        getAddressById,
      }),
      [
        addresses,
        isHydrated,
        addAddress,
        updateAddress,
        deleteAddress,
        getAddressById,
      ],
    );

  return (
    <CustomerAddressContext.Provider
      value={value}
    >
      {children}
    </CustomerAddressContext.Provider>
  );
}

export function useCustomerAddresses(): CustomerAddressContextValue {
  const context =
    useContext(
      CustomerAddressContext,
    );

  if (!context) {
    throw new Error(
      "useCustomerAddresses must be used within a CustomerAddressProvider.",
    );
  }

  return context;
}

export {
    CUSTOMER_ADDRESSES_STORAGE_PREFIX
};
