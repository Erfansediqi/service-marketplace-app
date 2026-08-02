import { StorageService } from "@/services/storage";
import {
  type PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const BOOKINGS_STORAGE_KEY =
  "@khedmat_bookings_record";

const BOOKING_DRAFT_STORAGE_KEY =
  "@khedmat_booking_draft";

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

  serviceId: string;
  serviceName: string;

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

export type PaymentStatus =
  | "unpaid"
  | "paid"
  | "refunded";

export type BookingRecord = {
  id: string;

  customerId: string;

  providerId: string;
  providerName: string;
  providerProfession: string;

  serviceId: string;
  serviceName: string;

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

  updateBookingDraft: (
    values: Partial<BookingDraft>,
  ) => void;

  resetBookingDraft: () => void;

  addBooking: (
    booking: BookingRecord,
  ) => Promise<void>;

  updateBookingStatus: (
    bookingId: string,
    status: BookingStatus,
  ) => Promise<void>;

  getBookingById: (
    bookingId: string,
  ) => BookingRecord | undefined;

  bookingReadyForSummary: boolean;
};

const BookingContext =
  createContext<BookingContextValue | null>(
    null,
  );

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

function isObject(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null
  );
}

function isCurrency(
  value: unknown,
): value is "AFN" {
  return value === "AFN";
}

function isBookingStatus(
  value: unknown,
): value is BookingStatus {
  return (
    value === "pending" ||
    value === "confirmed" ||
    value === "in-progress" ||
    value === "completed" ||
    value === "cancelled"
  );
}

function isPaymentStatus(
  value: unknown,
): value is PaymentStatus {
  return (
    value === "unpaid" ||
    value === "paid" ||
    value === "refunded"
  );
}

function isBookingAddress(
  value: unknown,
): value is BookingAddress {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.label === "string" &&
    typeof value.fullAddress ===
      "string" &&
    (value.id === undefined ||
      typeof value.id === "string") &&
    (value.latitude === undefined ||
      typeof value.latitude ===
        "number") &&
    (value.longitude === undefined ||
      typeof value.longitude ===
        "number")
  );
}

function isBookingDraft(
  value: unknown,
): value is BookingDraft {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.providerId ===
      "string" &&
    typeof value.providerName ===
      "string" &&
    typeof value.providerProfession ===
      "string" &&
    typeof value.serviceId ===
      "string" &&
    typeof value.serviceName ===
      "string" &&
    typeof value.date === "string" &&
    typeof value.time === "string" &&
    (value.address === null ||
      isBookingAddress(value.address)) &&
    typeof value.notes === "string" &&
    (value.estimatedPrice === null ||
      typeof value.estimatedPrice ===
        "number") &&
    isCurrency(value.currency)
  );
}

function isBookingRecord(
  value: unknown,
): value is BookingRecord {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.customerId ===
      "string" &&
    typeof value.providerId ===
      "string" &&
    typeof value.providerName ===
      "string" &&
    typeof value.providerProfession ===
      "string" &&
    typeof value.serviceId ===
      "string" &&
    typeof value.serviceName ===
      "string" &&
    typeof value.date === "string" &&
    typeof value.time === "string" &&
    isBookingAddress(value.address) &&
    typeof value.notes === "string" &&
    typeof value.servicePrice ===
      "number" &&
    typeof value.platformFee ===
      "number" &&
    typeof value.total === "number" &&
    isCurrency(value.currency) &&
    isBookingStatus(value.status) &&
    isPaymentStatus(
      value.paymentStatus,
    ) &&
    typeof value.createdAt ===
      "string"
  );
}

function normalizeStoredBookings(
  value: unknown,
): BookingRecord[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isBookingRecord);
}

export function BookingProvider({
  children,
}: PropsWithChildren) {
  const [
    bookingDraft,
    setBookingDraft,
  ] = useState<BookingDraft>(
    createEmptyBookingDraft,
  );

  const [bookings, setBookings] =
    useState<BookingRecord[]>([]);

  const [isHydrated, setIsHydrated] =
    useState(false);

  /*
   * The ref is updated synchronously before storage
   * writes begin. This prevents consecutive updates
   * from using an old bookings array captured by a
   * previous render.
   */
  const bookingsRef =
    useRef<BookingRecord[]>([]);

  useEffect(() => {
    let isMounted = true;

    const hydrateBookingState =
      async () => {
        try {
          const [
            storedBookings,
            storedDraft,
          ] = await Promise.all([
            StorageService.get<unknown>(
              BOOKINGS_STORAGE_KEY,
            ),
            StorageService.get<unknown>(
              BOOKING_DRAFT_STORAGE_KEY,
            ),
          ]);

          if (!isMounted) {
            return;
          }

          const normalizedBookings =
            normalizeStoredBookings(
              storedBookings,
            );

          bookingsRef.current =
            normalizedBookings;

          setBookings(
            normalizedBookings,
          );

          if (
            isBookingDraft(storedDraft)
          ) {
            setBookingDraft(
              storedDraft,
            );
          }
        } catch (error) {
          console.error(
            "Failed to hydrate booking state:",
            error,
          );
        } finally {
          if (isMounted) {
            setIsHydrated(true);
          }
        }
      };

    void hydrateBookingState();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const persistBookingDraft =
      async () => {
        try {
          await StorageService.save(
            BOOKING_DRAFT_STORAGE_KEY,
            bookingDraft,
          );
        } catch (error) {
          console.error(
            "Failed to persist booking draft:",
            error,
          );
        }
      };

    void persistBookingDraft();
  }, [
    bookingDraft,
    isHydrated,
  ]);

  const updateBookingDraft =
    useCallback(
      (
        values: Partial<BookingDraft>,
      ) => {
        setBookingDraft(
          (currentDraft) => ({
            ...currentDraft,
            ...values,
          }),
        );
      },
      [],
    );

  const resetBookingDraft =
    useCallback(() => {
      setBookingDraft(
        createEmptyBookingDraft(),
      );
    }, []);

  const addBooking =
    useCallback(
      async (
        booking: BookingRecord,
      ): Promise<void> => {
        const currentBookings =
          bookingsRef.current;

        const bookingAlreadyExists =
          currentBookings.some(
            (item) =>
              item.id === booking.id,
          );

        if (bookingAlreadyExists) {
          throw new Error(
            `Booking "${booking.id}" already exists.`,
          );
        }

        const updatedBookings = [
          booking,
          ...currentBookings,
        ];

        bookingsRef.current =
          updatedBookings;

        setBookings(updatedBookings);

        await StorageService.save(
          BOOKINGS_STORAGE_KEY,
          updatedBookings,
        );
      },
      [],
    );

  const updateBookingStatus =
    useCallback(
      async (
        bookingId: string,
        status: BookingStatus,
      ): Promise<void> => {
        const currentBookings =
          bookingsRef.current;

        const bookingExists =
          currentBookings.some(
            (booking) =>
              booking.id === bookingId,
          );

        if (!bookingExists) {
          throw new Error(
            `Booking "${bookingId}" was not found.`,
          );
        }

        const updatedBookings =
          currentBookings.map(
            (booking) =>
              booking.id ===
              bookingId
                ? {
                    ...booking,
                    status,
                  }
                : booking,
          );

        bookingsRef.current =
          updatedBookings;

        setBookings(updatedBookings);

        await StorageService.save(
          BOOKINGS_STORAGE_KEY,
          updatedBookings,
        );
      },
      [],
    );

  const getBookingById =
    useCallback(
      (
        bookingId: string,
      ): BookingRecord | undefined =>
        bookingsRef.current.find(
          (booking) =>
            booking.id === bookingId,
        ),
      [],
    );

  const bookingReadyForSummary =
    useMemo(
      () =>
        Boolean(
          bookingDraft.providerId,
        ) &&
        Boolean(
          bookingDraft.serviceId,
        ) &&
        Boolean(bookingDraft.date) &&
        Boolean(bookingDraft.time) &&
        Boolean(
          bookingDraft.address,
        ),
      [
        bookingDraft.address,
        bookingDraft.date,
        bookingDraft.providerId,
        bookingDraft.serviceId,
        bookingDraft.time,
      ],
    );

  const value =
    useMemo<BookingContextValue>(
      () => ({
        bookingDraft,
        bookings,
        isHydrated,
        updateBookingDraft,
        resetBookingDraft,
        addBooking,
        updateBookingStatus,
        getBookingById,
        bookingReadyForSummary,
      }),
      [
        addBooking,
        bookingDraft,
        bookingReadyForSummary,
        bookings,
        getBookingById,
        isHydrated,
        resetBookingDraft,
        updateBookingDraft,
        updateBookingStatus,
      ],
    );

  return (
    <BookingContext.Provider
      value={value}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking(): BookingContextValue {
  const context =
    useContext(BookingContext);

  if (!context) {
    throw new Error(
      "useBooking must be used inside BookingProvider.",
    );
  }

  return context;
}