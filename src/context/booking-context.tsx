import { StorageService } from "@/services/storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";

import { hasInternetConnection } from "../offline/network";
import {
  BookingRepository,
  type BookingLocalization,
  type BookingRow,
} from "../repositories/booking-repository";
import { useLanguage } from "./languagecontext";
import { useSession } from "./session-context";
import { useSupabaseAuth } from "./supabase-auth-context";

const LEGACY_BOOKINGS_STORAGE_KEY = "@khedmat_bookings_record";

const LEGACY_BOOKING_DRAFT_STORAGE_KEY = "@khedmat_booking_draft";

export type BookingAddress = {
  id?: string;
  label: string;
  fullAddress: string;
  latitude?: number;
  longitude?: number;
};

export type BookingDraft = {
  providerId: string;
  providerName: string;
  providerProfession: string;
  providerCategoryId?: string;

  serviceId: string;
  serviceName: string;
  serviceNameEnglish?: string;
  serviceNameDari?: string;
  serviceNamePashto?: string;

  date: string;
  time: string;

  address: BookingAddress | null;
  notes: string;

  estimatedPrice: number | null;
  currency: "AFN";
};

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "in-progress"
  | "completed"
  | "cancelled";

export type PaymentStatus = "unpaid" | "paid" | "refunded";

export type BookingRecord = {
  id: string;

  customerId: string;
  customerName?: string;
  customerPhone?: string | null;

  providerId: string;
  providerName: string;
  providerProfession: string;
  providerCategoryId?: string;

  serviceId: string;
  serviceName: string;
  serviceNameEnglish?: string;
  serviceNameDari?: string;
  serviceNamePashto?: string;

  date: string;
  time: string;

  address: BookingAddress;
  notes: string;

  servicePrice: number;
  platformFee: number;
  total: number;
  currency: "AFN";

  status: BookingStatus;
  paymentStatus: PaymentStatus;

  createdAt: string;
};

type BookingContextValue = {
  bookingDraft: BookingDraft;
  bookings: BookingRecord[];
  isHydrated: boolean;
  isRefreshing: boolean;

  updateBookingDraft: (values: Partial<BookingDraft>) => void;

  resetBookingDraft: () => void;

  /**
   * Creates a server-authoritative booking from the current draft.
   *
   * Final booking confirmation requires a network connection because the
   * database owns slot-conflict checks, provider availability, pricing, and
   * the platform fee.
   */
  submitBookingDraft: () => Promise<BookingRecord>;

  /**
   * Retained for legacy/mock bookings while customer marketplace migration is
   * still in progress. Real UUID bookings should use submitBookingDraft().
   */
  addBooking: (booking: BookingRecord) => Promise<void>;

  updateBookingStatus: (
    bookingId: string,
    status: BookingStatus,
  ) => Promise<void>;

  getBookingById: (bookingId: string) => BookingRecord | undefined;

  refreshBookings: () => Promise<void>;

  bookingReadyForSummary: boolean;
};

const BookingContext = createContext<BookingContextValue | null>(null);

function createEmptyBookingDraft(): BookingDraft {
  return {
    providerId: "",
    providerName: "",
    providerProfession: "",

    serviceId: "",
    serviceName: "",

    date: "",
    time: "",

    address: null,
    notes: "",

    estimatedPrice: null,
    currency: "AFN",
  };
}

function createClientRequestId(): string {
  return [
    "booking",
    Date.now().toString(36),
    Math.random().toString(36).slice(2, 10),
  ].join("-");
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function getBookingStorageKey(
  userId: string | null,
  role: "customer" | "provider",
  providerId: string | null,
): string {
  if (!userId) {
    return LEGACY_BOOKINGS_STORAGE_KEY;
  }

  if (role === "provider") {
    return providerId
      ? `${LEGACY_BOOKINGS_STORAGE_KEY}:${userId}:provider:${providerId}`
      : `${LEGACY_BOOKINGS_STORAGE_KEY}:${userId}:provider:none`;
  }

  return `${LEGACY_BOOKINGS_STORAGE_KEY}:${userId}:customer`;
}

function getBookingDraftStorageKey(userId: string | null): string {
  return userId
    ? `${LEGACY_BOOKING_DRAFT_STORAGE_KEY}:${userId}`
    : LEGACY_BOOKING_DRAFT_STORAGE_KEY;
}

function normalizeServiceTime(value: string): string {
  const normalized = value.trim();

  if (/^\d{2}:\d{2}:\d{2}$/.test(normalized)) {
    return normalized.slice(0, 5);
  }

  return normalized;
}

type BookingLanguage =
  | "English"
  | "Dari"
  | "Pashto";

function normalizeLanguage(
  language: string,
): BookingLanguage {
  if (language === "Dari") {
    return "Dari";
  }

  if (language === "Pashto") {
    return "Pashto";
  }

  return "English";
}

function getLocalizedCategoryTitle(
  categoryId: string | undefined,
  language: BookingLanguage,
  fallback: string,
): string {
  const titles: Record<
    string,
    Record<BookingLanguage, string>
  > = {
    electrician: {
      English: "Electrician",
      Dari: "برق‌کار",
      Pashto: "برېښناکار",
    },
    plumber: {
      English: "Plumber",
      Dari: "لوله‌کش",
      Pashto: "نلدوان",
    },
    carpenter: {
      English: "Carpenter",
      Dari: "نجار",
      Pashto: "ترکاڼ",
    },
    construction: {
      English: "Construction",
      Dari: "ساختمان",
      Pashto: "ساختماني کار",
    },
    painter: {
      English: "Painter",
      Dari: "رنگ‌مال",
      Pashto: "رنګمال",
    },
    cleaner: {
      English: "Cleaner",
      Dari: "نظافت‌چی",
      Pashto: "پاک‌کار",
    },
    "ac-technician": {
      English: "AC technician",
      Dari: "تخنیکر کولر",
      Pashto: "د اې سي تخنیکر",
    },
    driver: {
      English: "Driver",
      Dari: "راننده",
      Pashto: "موټر چلوونکی",
    },
    "phone-repair": {
      English: "Phone repair",
      Dari: "ترمیم موبایل",
      Pashto: "د موبایل ترمیم",
    },
    "computer-repair": {
      English: "Computer repair",
      Dari: "ترمیم کمپیوتر",
      Pashto: "د کمپیوټر ترمیم",
    },
    tailor: {
      English: "Tailor",
      Dari: "خیاط",
      Pashto: "خیاط",
    },
    barber: {
      English: "Barber",
      Dari: "آرایشگر",
      Pashto: "سلماني",
    },
    tutor: {
      English: "Tutor",
      Dari: "معلم خصوصی",
      Pashto: "خصوصي ښوونکی",
    },
    photographer: {
      English: "Photographer",
      Dari: "عکاس",
      Pashto: "عکاس",
    },
    other: {
      English: "Service provider",
      Dari: "ارائه‌دهندهٔ خدمات",
      Pashto: "خدمت وړاندې کوونکی",
    },
  };

  if (
    categoryId &&
    titles[categoryId]
  ) {
    return titles[categoryId][language];
  }

  return fallback;
}

function getLocalizedServiceName(
  localization: BookingLocalization | undefined,
  language: BookingLanguage,
  fallback: string,
): string {
  if (!localization) {
    return fallback;
  }

  if (language === "Dari") {
    return (
      localization.serviceNameDari ||
      localization.serviceNameEnglish ||
      fallback
    );
  }

  if (language === "Pashto") {
    return (
      localization.serviceNamePashto ||
      localization.serviceNameEnglish ||
      fallback
    );
  }

  return (
    localization.serviceNameEnglish ||
    fallback
  );
}

function mapBookingRow(
  row: BookingRow,
  localization: BookingLocalization | undefined,
  language: BookingLanguage,
): BookingRecord {
  const snapshotServiceName =
    row.service_name_snapshot;

  const snapshotProfession =
    row.provider_profession_snapshot;

  return {
    id: row.id,

    customerId: row.customer_id ?? "",
    customerName: row.customer_name_snapshot,
    customerPhone: row.customer_phone_snapshot,

    providerId: row.provider_id,
    providerName: row.provider_name_snapshot,
    providerProfession:
      getLocalizedCategoryTitle(
        localization?.providerCategoryId,
        language,
        snapshotProfession,
      ),
    providerCategoryId:
      localization?.providerCategoryId ||
      undefined,

    serviceId: row.service_id,
    serviceName:
      getLocalizedServiceName(
        localization,
        language,
        snapshotServiceName,
      ),
    serviceNameEnglish:
      localization?.serviceNameEnglish,
    serviceNameDari:
      localization?.serviceNameDari,
    serviceNamePashto:
      localization?.serviceNamePashto,

    date: row.service_date,
    time: normalizeServiceTime(row.service_time),

    address: {
      id: row.address_id ?? undefined,
      label: row.address_label,
      fullAddress: row.full_address,
      latitude: row.latitude ?? undefined,
      longitude: row.longitude ?? undefined,
    },

    notes: row.notes,
    servicePrice: row.service_price,
    platformFee: row.platform_fee,
    total:
      row.total ??
      row.service_price +
        row.platform_fee,
    currency: "AFN",
    status: row.status,
    paymentStatus:
      row.payment_status,
    createdAt: row.created_at,
  };
}

function relocalizeBookingRecord(
  booking: BookingRecord,
  language: BookingLanguage,
): BookingRecord {
  const serviceName =
    language === "Dari"
      ? booking.serviceNameDari ||
        booking.serviceNameEnglish ||
        booking.serviceName
      : language === "Pashto"
        ? booking.serviceNamePashto ||
          booking.serviceNameEnglish ||
          booking.serviceName
        : booking.serviceNameEnglish ||
          booking.serviceName;

  return {
    ...booking,
    serviceName,
    providerProfession:
      getLocalizedCategoryTitle(
        booking.providerCategoryId,
        language,
        booking.providerProfession,
      ),
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isCurrency(value: unknown): value is "AFN" {
  return value === "AFN";
}

function isBookingStatus(value: unknown): value is BookingStatus {
  return (
    value === "pending" ||
    value === "confirmed" ||
    value === "in-progress" ||
    value === "completed" ||
    value === "cancelled"
  );
}

function isPaymentStatus(value: unknown): value is PaymentStatus {
  return value === "unpaid" || value === "paid" || value === "refunded";
}

function isBookingAddress(value: unknown): value is BookingAddress {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.label === "string" &&
    typeof value.fullAddress === "string" &&
    (value.id === undefined || typeof value.id === "string") &&
    (value.latitude === undefined || typeof value.latitude === "number") &&
    (value.longitude === undefined || typeof value.longitude === "number")
  );
}

function isBookingDraft(value: unknown): value is BookingDraft {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.providerId === "string" &&
    typeof value.providerName === "string" &&
    typeof value.providerProfession === "string" &&
    (value.providerCategoryId === undefined ||
      typeof value.providerCategoryId === "string") &&
    typeof value.serviceId === "string" &&
    typeof value.serviceName === "string" &&
    (value.serviceNameEnglish === undefined ||
      typeof value.serviceNameEnglish === "string") &&
    (value.serviceNameDari === undefined ||
      typeof value.serviceNameDari === "string") &&
    (value.serviceNamePashto === undefined ||
      typeof value.serviceNamePashto === "string") &&
    typeof value.date === "string" &&
    typeof value.time === "string" &&
    (value.address === null || isBookingAddress(value.address)) &&
    typeof value.notes === "string" &&
    (value.estimatedPrice === null ||
      typeof value.estimatedPrice === "number") &&
    isCurrency(value.currency)
  );
}

function isBookingRecord(value: unknown): value is BookingRecord {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.customerId === "string" &&
    typeof value.providerId === "string" &&
    typeof value.providerName === "string" &&
    typeof value.providerProfession === "string" &&
    typeof value.serviceId === "string" &&
    typeof value.serviceName === "string" &&
    typeof value.date === "string" &&
    typeof value.time === "string" &&
    isBookingAddress(value.address) &&
    typeof value.notes === "string" &&
    typeof value.servicePrice === "number" &&
    typeof value.platformFee === "number" &&
    typeof value.total === "number" &&
    isCurrency(value.currency) &&
    isBookingStatus(value.status) &&
    isPaymentStatus(value.paymentStatus) &&
    typeof value.createdAt === "string"
  );
}

function normalizeStoredBookings(value: unknown): BookingRecord[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isBookingRecord);
}

function replaceBooking(
  currentBookings: BookingRecord[],
  nextBooking: BookingRecord,
): BookingRecord[] {
  const existingIndex = currentBookings.findIndex(
    (booking) => booking.id === nextBooking.id,
  );

  if (existingIndex < 0) {
    return [nextBooking, ...currentBookings];
  }

  return currentBookings.map((booking) =>
    booking.id === nextBooking.id ? nextBooking : booking,
  );
}

export function BookingProvider({ children }: PropsWithChildren) {
  const { user, isHydrated: authIsHydrated } = useSupabaseAuth();

  const { language } = useLanguage();

  const activeLanguage =
    normalizeLanguage(language);

  const {
    role,
    activeProviderId,
    isHydrated: sessionIsHydrated,
  } = useSession();

  const [bookingDraft, setBookingDraft] = useState<BookingDraft>(
    createEmptyBookingDraft,
  );

  const [bookings, setBookings] = useState<BookingRecord[]>([]);

  const [isHydrated, setIsHydrated] = useState(false);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [hydratedBookingStorageKey, setHydratedBookingStorageKey] = useState<
    string | null
  >(null);

  const bookingsRef = useRef<BookingRecord[]>([]);

  const bookingStorageKey = useMemo(
    () => getBookingStorageKey(user?.id ?? null, role, activeProviderId),
    [activeProviderId, role, user?.id],
  );

  const bookingDraftStorageKey = useMemo(
    () => getBookingDraftStorageKey(user?.id ?? null),
    [user?.id],
  );

  const persistBookings = useCallback(
    async (nextBookings: BookingRecord[]): Promise<void> => {
      await StorageService.save(bookingStorageKey, nextBookings);
    },
    [bookingStorageKey],
  );

  const refreshBookings = useCallback(async (): Promise<void> => {
    if (!user) {
      return;
    }

    const isOnline = await hasInternetConnection();

    if (!isOnline) {
      return;
    }

    setIsRefreshing(true);

    try {
      let rows: BookingRow[];

      if (role === "provider") {
        if (!activeProviderId) {
          rows = [];
        } else {
          rows = await BookingRepository.listProviderBookings(activeProviderId);
        }
      } else {
        rows = await BookingRepository.listCustomerBookings();
      }

      const localizations =
        await BookingRepository.resolveBookingLocalizations(
          rows,
        );

      const nextBookings =
        rows.map((row) =>
          mapBookingRow(
            row,
            localizations[row.id],
            activeLanguage,
          ),
        );

      bookingsRef.current = nextBookings;

      setBookings(nextBookings);

      await persistBookings(nextBookings);
    } finally {
      setIsRefreshing(false);
    }
  }, [
    activeLanguage,
    activeProviderId,
    persistBookings,
    role,
    user,
  ]);

  /*
   * Hydrate only local cached state first. Remote refresh happens after the
   * cache is on-screen so a slow connection does not block app startup.
   */
  useEffect(() => {
    if (!authIsHydrated || !sessionIsHydrated) {
      return;
    }

    let isMounted = true;

    setHydratedBookingStorageKey(null);

    const hydrateBookingState = async (): Promise<void> => {
      try {
        const [storedBookings, storedDraft] = await Promise.all([
          StorageService.get<unknown>(bookingStorageKey),
          StorageService.get<unknown>(bookingDraftStorageKey),
        ]);

        if (!isMounted) {
          return;
        }

        const normalizedBookings = normalizeStoredBookings(storedBookings);

        bookingsRef.current = normalizedBookings;

        setBookings(normalizedBookings);

        if (isBookingDraft(storedDraft)) {
          setBookingDraft(storedDraft);
        } else {
          setBookingDraft(createEmptyBookingDraft());
        }
      } catch (error) {
        console.error("Failed to hydrate booking state:", error);

        if (isMounted) {
          bookingsRef.current = [];
          setBookings([]);
        }
      } finally {
        if (isMounted) {
          setHydratedBookingStorageKey(bookingStorageKey);
          setIsHydrated(true);
        }
      }
    };

    void hydrateBookingState();

    return () => {
      isMounted = false;
    };
  }, [
    authIsHydrated,
    bookingDraftStorageKey,
    bookingStorageKey,
    sessionIsHydrated,
  ]);

  /*
   * Refresh the active customer/provider booking scope from Supabase after
   * local hydration. If the network is unavailable, the scoped local cache
   * remains usable.
   */
  useEffect(() => {
    if (
      !isHydrated ||
      !authIsHydrated ||
      !sessionIsHydrated ||
      !user ||
      hydratedBookingStorageKey !== bookingStorageKey
    ) {
      return;
    }

    void refreshBookings().catch((error) => {
      console.warn(
        "Could not refresh bookings from Supabase; using local cache:",
        error,
      );
    });
  }, [
    authIsHydrated,
    bookingStorageKey,
    hydratedBookingStorageKey,
    isHydrated,
    refreshBookings,
    sessionIsHydrated,
    user,
  ]);

  /*
   * Re-render cached bookings immediately when the user changes language.
   * Live bookings carry localized service names/category IDs in the cache, so
   * this also works offline after at least one successful server refresh.
   */
  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const relocalized =
      bookingsRef.current.map(
        (booking) =>
          relocalizeBookingRecord(
            booking,
            activeLanguage,
          ),
      );

    bookingsRef.current =
      relocalized;

    setBookings(relocalized);
  }, [
    activeLanguage,
    isHydrated,
  ]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const persistBookingDraft = async () => {
      try {
        await StorageService.save(bookingDraftStorageKey, bookingDraft);
      } catch (error) {
        console.error("Failed to persist booking draft:", error);
      }
    };

    void persistBookingDraft();
  }, [bookingDraft, bookingDraftStorageKey, isHydrated]);

  const updateBookingDraft = useCallback((values: Partial<BookingDraft>) => {
    setBookingDraft((currentDraft) => ({
      ...currentDraft,
      ...values,
    }));
  }, []);

  const resetBookingDraft = useCallback(() => {
    setBookingDraft(createEmptyBookingDraft());
  }, []);

  const addBooking = useCallback(
    async (booking: BookingRecord): Promise<void> => {
      const currentBookings = bookingsRef.current;

      const bookingAlreadyExists = currentBookings.some(
        (item) => item.id === booking.id,
      );

      if (bookingAlreadyExists) {
        throw new Error(`Booking "${booking.id}" already exists.`);
      }

      const updatedBookings = [booking, ...currentBookings];

      bookingsRef.current = updatedBookings;

      setBookings(updatedBookings);

      await persistBookings(updatedBookings);
    },
    [
      activeLanguage,
      persistBookings,
    ],
  );

  const bookingReadyForSummary = useMemo(
    () =>
      Boolean(bookingDraft.providerId) &&
      Boolean(bookingDraft.serviceId) &&
      Boolean(bookingDraft.date) &&
      Boolean(bookingDraft.time) &&
      Boolean(bookingDraft.address),
    [
      bookingDraft.address,
      bookingDraft.date,
      bookingDraft.providerId,
      bookingDraft.serviceId,
      bookingDraft.time,
    ],
  );

  const submitBookingDraft = useCallback(async (): Promise<BookingRecord> => {
    if (!user) {
      throw new Error("Sign in before creating a booking.");
    }

    if (!bookingReadyForSummary || !bookingDraft.address) {
      throw new Error("Complete the booking details before submitting.");
    }

    if (!isUuid(bookingDraft.providerId)) {
      throw new Error(
        "This demo provider is not connected to the live marketplace yet. Choose a real Khedmat provider account.",
      );
    }

    const isOnline = await hasInternetConnection();

    if (!isOnline) {
      throw new Error(
        "An internet connection is required to confirm a booking because provider availability and time slots must be checked live.",
      );
    }

    const row = await BookingRepository.createBooking({
      clientRequestId: createClientRequestId(),

      providerId: bookingDraft.providerId,

      serviceId: bookingDraft.serviceId,

      serviceDate: bookingDraft.date,

      serviceTime: bookingDraft.time,

      address: {
        id: bookingDraft.address.id,

        label: bookingDraft.address.label,

        fullAddress: bookingDraft.address.fullAddress,

        latitude: bookingDraft.address.latitude,

        longitude: bookingDraft.address.longitude,
      },

      notes: bookingDraft.notes,
    });

    const localizations =
      await BookingRepository.resolveBookingLocalizations(
        [row],
      );

    const booking =
      mapBookingRow(
        row,
        localizations[row.id],
        activeLanguage,
      );

    const updatedBookings = replaceBooking(bookingsRef.current, booking);

    bookingsRef.current = updatedBookings;

    setBookings(updatedBookings);

    await persistBookings(updatedBookings);

    return booking;
  }, [
    activeLanguage,
    bookingDraft,
    bookingReadyForSummary,
    persistBookings,
    user,
  ]);

  const updateBookingStatus = useCallback(
    async (bookingId: string, status: BookingStatus): Promise<void> => {
      const currentBookings = bookingsRef.current;

      const existingBooking = currentBookings.find(
        (booking) => booking.id === bookingId,
      );

      if (!existingBooking) {
        throw new Error(`Booking "${bookingId}" was not found.`);
      }

      /*
       * Existing mock/local bookings continue to work locally during the
       * migration. Real Supabase bookings use UUID primary keys and always
       * go through the secure status-transition RPC.
       */
      if (!isUuid(bookingId)) {
        const updatedBookings = currentBookings.map((booking) =>
          booking.id === bookingId
            ? {
                ...booking,
                status,
              }
            : booking,
        );

        bookingsRef.current = updatedBookings;

        setBookings(updatedBookings);

        await persistBookings(updatedBookings);

        return;
      }

      const isOnline = await hasInternetConnection();

      if (!isOnline) {
        throw new Error(
          "An internet connection is required to update a live booking.",
        );
      }

      const row = await BookingRepository.updateBookingStatus(
        bookingId,
        status,
      );

      const localizations =
        await BookingRepository.resolveBookingLocalizations(
          [row],
        );

      const updatedBooking =
        mapBookingRow(
          row,
          localizations[row.id],
          activeLanguage,
        );

      const updatedBookings = replaceBooking(currentBookings, updatedBooking);

      bookingsRef.current = updatedBookings;

      setBookings(updatedBookings);

      await persistBookings(updatedBookings);
    },
    [persistBookings],
  );

  const getBookingById = useCallback(
    (bookingId: string): BookingRecord | undefined =>
      bookingsRef.current.find((booking) => booking.id === bookingId),
    [],
  );

  const value = useMemo<BookingContextValue>(
    () => ({
      bookingDraft,
      bookings,
      isHydrated,
      isRefreshing,
      updateBookingDraft,
      resetBookingDraft,
      submitBookingDraft,
      addBooking,
      updateBookingStatus,
      getBookingById,
      refreshBookings,
      bookingReadyForSummary,
    }),
    [
      addBooking,
      bookingDraft,
      bookingReadyForSummary,
      bookings,
      getBookingById,
      isHydrated,
      isRefreshing,
      refreshBookings,
      resetBookingDraft,
      submitBookingDraft,
      updateBookingDraft,
      updateBookingStatus,
    ],
  );

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
}

export function useBooking(): BookingContextValue {
  const context = useContext(BookingContext);

  if (!context) {
    throw new Error("useBooking must be used inside BookingProvider.");
  }

  return context;
}
