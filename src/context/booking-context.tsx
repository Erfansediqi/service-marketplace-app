import {
    PropsWithChildren,
    createContext,
    useContext,
    useMemo,
    useState,
} from "react";

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

const initialBookings: BookingRecord[] = [];

type BookingContextValue = {
  bookingDraft: BookingDraft;

  bookings: BookingRecord[];

  updateBookingDraft: (
    values: Partial<BookingDraft>,
  ) => void;

  resetBookingDraft: () => void;

  addBooking: (
    booking: BookingRecord,
  ) => void;

  updateBookingStatus: (
    bookingId: string,
    status: BookingStatus,
  ) => void;

  getBookingById: (
    bookingId: string,
  ) => BookingRecord | undefined;

  bookingReadyForSummary: boolean;
};

const BookingContext =
  createContext<BookingContextValue | null>(null);

export function BookingProvider({
  children,
}: PropsWithChildren) {
  const [bookingDraft, setBookingDraft] =
    useState<BookingDraft>(emptyBookingDraft);

  const [bookings, setBookings] =
    useState<BookingRecord[]>(initialBookings);

  const updateBookingDraft = (
    values: Partial<BookingDraft>,
  ) => {
    setBookingDraft((current) => ({
      ...current,
      ...values,
    }));
  };

  const resetBookingDraft = () => {
    setBookingDraft(emptyBookingDraft);
  };

  const addBooking = (
    booking: BookingRecord,
  ) => {
    setBookings((current) => [
      booking,
      ...current,
    ]);
  };

  const updateBookingStatus = (
    bookingId: string,
    status: BookingStatus,
  ) => {
    setBookings((current) =>
      current.map((booking) =>
        booking.id === bookingId
          ? {
              ...booking,
              status,
            }
          : booking,
      ),
    );
  };

  const getBookingById = (
    bookingId: string,
  ) =>
    bookings.find(
      (booking) => booking.id === bookingId,
    );

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
    [
      bookingDraft,
      bookings,
      bookingReadyForSummary,
    ],
  );

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);

  if (!context) {
    throw new Error(
      "useBooking must be used inside BookingProvider.",
    );
  }

  return context;
}