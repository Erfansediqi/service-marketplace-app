import { supabase } from "../lib/supabase";
import type { Database, Enums, Tables } from "../types/database";

export type BookingRow = Tables<"bookings">;
export type BookingStatus = Enums<"booking_status">;
export type PaymentStatus = Enums<"payment_status">;

export type CreateBookingInput = {
  clientRequestId: string;
  providerId: string;
  serviceId: string;
  serviceDate: string;
  serviceTime: string;
  address: {
    id?: string | null;
    label: string;
    fullAddress: string;
    latitude?: number | null;
    longitude?: number | null;
  };
  notes?: string;
};

function required(value: string, label: string): string {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error(`${label} is required.`);
  }

  return normalized;
}

function optionalText(value: string | null | undefined): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();

  return normalized || undefined;
}

async function getAuthenticatedUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(`Failed to read authentication session: ${error.message}`);
  }

  const userId = data.session?.user.id;

  if (!userId) {
    throw new Error("Authentication is required.");
  }

  return userId;
}

export async function resolveProviderServiceId(
  providerId: string,
  serviceId: string,
): Promise<string> {
  const normalizedProviderId = required(providerId, "Provider ID");

  const normalizedServiceId = required(serviceId, "Service ID");

  const { data, error } = await supabase
    .from("provider_services")
    .select("id")
    .eq("provider_id", normalizedProviderId)
    .eq("service_id", normalizedServiceId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to resolve provider service: ${error.message}`);
  }

  if (!data) {
    throw new Error("The selected provider service is no longer available.");
  }

  return data.id;
}

export async function createBooking(
  input: CreateBookingInput,
): Promise<BookingRow> {
  const clientRequestId = required(input.clientRequestId, "Client request ID");

  const providerServiceId = await resolveProviderServiceId(
    input.providerId,
    input.serviceId,
  );

  const args: Database["public"]["Functions"]["create_booking"]["Args"] = {
    p_client_request_id: clientRequestId,
    p_provider_service_id: providerServiceId,
    p_service_date: required(input.serviceDate, "Service date"),
    p_service_time: required(input.serviceTime, "Service time"),
    p_address_label: required(input.address.label, "Address label"),
    p_full_address: required(input.address.fullAddress, "Full address"),
    p_notes: input.notes ?? "",
  };

  const addressId = optionalText(input.address.id);

  if (addressId) {
    args.p_address_id = addressId;
  }

  if (input.address.latitude != null) {
    args.p_latitude = input.address.latitude;
  }

  if (input.address.longitude != null) {
    args.p_longitude = input.address.longitude;
  }

  const { data, error } = await supabase.rpc("create_booking", args);

  if (error) {
    throw new Error(`Failed to create booking: ${error.message}`);
  }

  if (!data) {
    throw new Error("Supabase did not return the created booking.");
  }

  return data;
}

export async function listCustomerBookings(): Promise<BookingRow[]> {
  const userId = await getAuthenticatedUserId();

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("customer_id", userId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(`Failed to load customer bookings: ${error.message}`);
  }

  return data ?? [];
}

export async function listProviderBookings(
  providerId: string,
): Promise<BookingRow[]> {
  const normalizedProviderId = required(providerId, "Provider ID");

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("provider_id", normalizedProviderId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(`Failed to load provider bookings: ${error.message}`);
  }

  return data ?? [];
}

export async function getBookingById(
  bookingId: string,
): Promise<BookingRow | null> {
  const normalizedBookingId = required(bookingId, "Booking ID");

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", normalizedBookingId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load booking: ${error.message}`);
  }

  return data;
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
): Promise<BookingRow> {
  const { data, error } = await supabase.rpc("update_booking_status", {
    p_booking_id: required(bookingId, "Booking ID"),
    p_status: status,
  });

  if (error) {
    throw new Error(`Failed to update booking status: ${error.message}`);
  }

  if (!data) {
    throw new Error("Supabase did not return the updated booking.");
  }

  return data;
}

export const BookingRepository = {
  resolveProviderServiceId,
  createBooking,
  listCustomerBookings,
  listProviderBookings,
  getBookingById,
  updateBookingStatus,
};
