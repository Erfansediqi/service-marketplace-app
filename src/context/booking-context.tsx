import { StorageService } from "@/services/storage";
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const BOOKINGS_STORAGE_KEY = "@khedmat_bookings_record";

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

export type PaymentStatus = "unpaid" | "paid" | "refunded";

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

const emptyBookingDraft: BookingDraft = {
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

type BookingContextValue = {
  bookingDraft: BookingDraft;

  bookings: BookingRecord[];

  updateBookingDraft: (values: Partial<BookingDraft>) => void;

  resetBookingDraft: () => void;

  addBooking: (booking: BookingRecord) => void;

  updateBookingStatus: (bookingId: string, status: BookingStatus) => void;

  getBookingById: (bookingId: string) => BookingRecord | undefined;

  bookingReadyForSummary: boolean;
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: PropsWithChildren) {
  const [bookingDraft, setBookingDraft] =
    useState<BookingDraft>(emptyBookingDraft);

  const [bookings, setBookings] = useState<BookingRecord[]>([]);

  // Load saved bookings from device local storage on start
  useEffect(() => {
    async function loadStoredBookings() {
      const savedBookings =
        await StorageService.get<BookingRecord[]>(BOOKINGS_STORAGE_KEY);
      if (savedBookings) {
        setBookings(savedBookings);
      }
    }
    loadStoredBookings();
  }, []);

  const updateBookingDraft = (values: Partial<BookingDraft>) => {
    setBookingDraft((current) => ({
      ...current,
      ...values,
    }));
  };

  const resetBookingDraft = () => {
    setBookingDraft(emptyBookingDraft);
  };

  // Add booking and save immediately to local storage
  const addBooking = async (booking: BookingRecord) => {
    const updated = [booking, ...bookings];
    setBookings(updated);
    await StorageService.save(BOOKINGS_STORAGE_KEY, updated);
  };

  // Update status (e.g., Provider accepts/declines) and sync to local storage
  const updateBookingStatus = async (
    bookingId: string,
    status: BookingStatus,
  ) => {
    const updated = bookings.map((booking) =>
      booking.id === bookingId
        ? {
            ...booking,
            status,
          }
        : booking,
    );
    setBookings(updated);
    await StorageService.save(BOOKINGS_STORAGE_KEY, updated);
  };

  const getBookingById = (bookingId: string) =>
    bookings.find((booking) => booking.id === bookingId);

  const bookingReadyForSummary =
    Boolean(bookingDraft.providerId) &&
    Boolean(bookingDraft.serviceId) &&
    Boolean(bookingDraft.date) &&
    Boolean(bookingDraft.time) &&
    Boolean(bookingDraft.address);

  const value = useMemo<BookingContextValue>(
    () => ({
      bookingDraft,
      bookings,
      updateBookingDraft,
      resetBookingDraft,
      addBooking,
      updateBookingStatus,
      getBookingById,
      bookingReadyForSummary,
    }),
    [bookingDraft, bookings, bookingReadyForSummary],
  );

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);

  if (!context) {
    throw new Error("useBooking must be used inside BookingProvider.");
  }

  return context;
}
