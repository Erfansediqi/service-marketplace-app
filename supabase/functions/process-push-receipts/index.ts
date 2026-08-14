import { createClient } from "@supabase/supabase-js";

type PendingReceiptRow = {
  id: string;
  push_device_id: string;
  expo_ticket_id: string;
  receipt_attempt_count: number;
};

type ExpoPushReceipt =
  | {
      status: "ok";
    }
  | {
      status: "error";
      message?: string;
      details?: {
        error?: string;
      };
    };

type ExpoReceiptResponse = {
  data?: Record<string, ExpoPushReceipt>;
  errors?: unknown[];
};

const EXPO_RECEIPTS_ENDPOINT =
  "https://exp.host/--/api/v2/push/getReceipts";

const MAX_RECEIPTS_PER_REQUEST =
  1000;

const MISSING_RECEIPT_RETRY_DELAY_MS =
  15 * 60 * 1000;

function createBackendClient(
  supabaseUrl: string,
  serviceRoleKey: string,
) {
  return createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}

type BackendSupabaseClient =
  ReturnType<
    typeof createBackendClient
  >;

export default {
  async fetch(
    request: Request,
  ): Promise<Response> {
    if (request.method !== "POST") {
      return jsonResponse(
        {
          error:
            "Method not allowed.",
        },
        405,
      );
    }

    const configuredSecret =
      Deno.env.get(
        "KHEDMAT_PUSH_WEBHOOK_SECRET",
      );

    if (!configuredSecret) {
      console.error(
        "KHEDMAT_PUSH_WEBHOOK_SECRET is not configured.",
      );

      return jsonResponse(
        {
          error:
            "Push processing secret is not configured.",
        },
        500,
      );
    }

    const requestSecret =
      request.headers.get(
        "x-khedmat-webhook-secret",
      );

    if (
      !requestSecret ||
      requestSecret !== configuredSecret
    ) {
      return jsonResponse(
        {
          error:
            "Unauthorized.",
        },
        401,
      );
    }

    const supabaseUrl =
      Deno.env.get(
        "SUPABASE_URL",
      );

    const serviceRoleKey =
      Deno.env.get(
        "SUPABASE_SERVICE_ROLE_KEY",
      );

    if (
      !supabaseUrl ||
      !serviceRoleKey
    ) {
      console.error(
        "Required Supabase Edge Function environment variables are missing.",
      );

      return jsonResponse(
        {
          error:
            "Server configuration is incomplete.",
        },
        500,
      );
    }

    const supabase =
      createBackendClient(
        supabaseUrl,
        serviceRoleKey,
      );

    const now =
      new Date().toISOString();

    const {
      data: pendingReceiptRows,
      error: pendingReceiptError,
    } =
      await supabase
        .from(
          "push_delivery_receipts",
        )
        .select(
          "id,push_device_id,expo_ticket_id,receipt_attempt_count",
        )
        .eq(
          "status",
          "pending",
        )
        .lte(
          "receipt_available_after",
          now,
        )
        .order(
          "receipt_available_after",
          {
            ascending: true,
          },
        )
        .limit(
          MAX_RECEIPTS_PER_REQUEST,
        );

    if (pendingReceiptError) {
      console.error(
        "Failed to load pending Expo push receipts:",
        pendingReceiptError,
      );

      return jsonResponse(
        {
          error:
            "Could not load pending push receipts.",
        },
        500,
      );
    }

    const pendingReceipts:
      PendingReceiptRow[] =
        pendingReceiptRows ?? [];

    if (
      pendingReceipts.length === 0
    ) {
      return jsonResponse({
        ok: true,
        selected: 0,
        processed: 0,
        delivered: 0,
        errors: 0,
        missing: 0,
      });
    }

    const ticketIds =
      pendingReceipts.map(
        (receipt) =>
          receipt.expo_ticket_id,
      );

    let expoResponse: Response;

    try {
      expoResponse =
        await fetch(
          EXPO_RECEIPTS_ENDPOINT,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              Accept:
                "application/json",
            },
            body:
              JSON.stringify({
                ids: ticketIds,
              }),
          },
        );
    } catch (error) {
      console.error(
        "Expo push receipt request failed:",
        error,
      );

      await recordFailedReceiptAttempts(
        supabase,
        pendingReceipts,
      );

      return jsonResponse(
        {
          error:
            "Expo push receipt request failed.",
        },
        502,
      );
    }

    let expoPayload:
      | ExpoReceiptResponse
      | null = null;

    try {
      expoPayload =
        (await expoResponse.json()) as
          ExpoReceiptResponse;
    } catch {
      expoPayload = null;
    }

    if (
      !expoResponse.ok ||
      !expoPayload?.data
    ) {
      console.error(
        "Expo Push Service returned an unsuccessful receipt response:",
        expoResponse.status,
        expoPayload,
      );

      await recordFailedReceiptAttempts(
        supabase,
        pendingReceipts,
      );

      return jsonResponse(
        {
          error:
            "Expo Push Service returned an unsuccessful receipt response.",
        },
        502,
      );
    }

    let deliveredCount = 0;
    let errorCount = 0;
    let missingCount = 0;

    for (
      const pendingReceipt of
      pendingReceipts
    ) {
      const receipt =
        expoPayload.data[
          pendingReceipt.expo_ticket_id
        ];

      if (!receipt) {
        missingCount += 1;

        await recordMissingReceipt(
          supabase,
          pendingReceipt,
        );

        continue;
      }

      if (
        receipt.status === "ok"
      ) {
        const markedDelivered =
          await markReceiptDelivered(
            supabase,
            pendingReceipt,
          );

        if (markedDelivered) {
          deliveredCount += 1;
        }

        continue;
      }

      const errorCode =
        readNonEmptyString(
          receipt.details?.error,
        ) ??
        "expo-receipt-error";

      const errorMessage =
        readNonEmptyString(
          receipt.message,
        );

      const markedError =
        await markReceiptError(
          supabase,
          pendingReceipt,
          errorCode,
          errorMessage,
        );

      if (!markedError) {
        continue;
      }

      errorCount += 1;

      if (
        errorCode ===
        "DeviceNotRegistered"
      ) {
        await disableUnregisteredPushDevice(
          supabase,
          pendingReceipt.push_device_id,
          errorCode,
        );
      } else {
        await recordPushDeviceFailure(
          supabase,
          pendingReceipt.push_device_id,
          errorCode,
        );
      }
    }

    return jsonResponse({
      ok: true,
      selected:
        pendingReceipts.length,
      processed:
        deliveredCount +
        errorCount,
      delivered:
        deliveredCount,
      errors:
        errorCount,
      missing:
        missingCount,
    });
  },
};

async function markReceiptDelivered(
  supabase:
    BackendSupabaseClient,
  receipt:
    PendingReceiptRow,
): Promise<boolean> {
  const timestamp =
    new Date().toISOString();

  const {
    error,
  } =
    await supabase
      .from(
        "push_delivery_receipts",
      )
      .update({
        status:
          "delivered",
        receipt_attempt_count:
          receipt.receipt_attempt_count +
          1,
        last_receipt_attempt_at:
          timestamp,
        expo_error_code:
          null,
        expo_error_message:
          null,
        processed_at:
          timestamp,
      })
      .eq(
        "id",
        receipt.id,
      )
      .eq(
        "status",
        "pending",
      );

  if (error) {
    console.error(
      "Failed to mark Expo push receipt as delivered:",
      error,
    );

    return false;
  }

  return true;
}

async function markReceiptError(
  supabase:
    BackendSupabaseClient,
  receipt:
    PendingReceiptRow,
  errorCode: string,
  errorMessage: string | null,
): Promise<boolean> {
  const timestamp =
    new Date().toISOString();

  const {
    error,
  } =
    await supabase
      .from(
        "push_delivery_receipts",
      )
      .update({
        status:
          "error",
        receipt_attempt_count:
          receipt.receipt_attempt_count +
          1,
        last_receipt_attempt_at:
          timestamp,
        expo_error_code:
          errorCode,
        expo_error_message:
          errorMessage,
        processed_at:
          timestamp,
      })
      .eq(
        "id",
        receipt.id,
      )
      .eq(
        "status",
        "pending",
      );

  if (error) {
    console.error(
      "Failed to mark Expo push receipt as errored:",
      error,
    );

    return false;
  }

  return true;
}

async function recordMissingReceipt(
  supabase:
    BackendSupabaseClient,
  receipt:
    PendingReceiptRow,
): Promise<void> {
  const now =
    new Date();

  const nextAttempt =
    new Date(
      now.getTime() +
        MISSING_RECEIPT_RETRY_DELAY_MS,
    );

  const {
    error,
  } =
    await supabase
      .from(
        "push_delivery_receipts",
      )
      .update({
        receipt_attempt_count:
          receipt.receipt_attempt_count +
          1,
        last_receipt_attempt_at:
          now.toISOString(),
        receipt_available_after:
          nextAttempt.toISOString(),
      })
      .eq(
        "id",
        receipt.id,
      )
      .eq(
        "status",
        "pending",
      );

  if (error) {
    console.error(
      "Failed to record missing Expo push receipt:",
      error,
    );
  }
}

async function recordFailedReceiptAttempts(
  supabase:
    BackendSupabaseClient,
  receipts:
    PendingReceiptRow[],
): Promise<void> {
  const timestamp =
    new Date().toISOString();

  for (
    const receipt of
    receipts
  ) {
    const {
      error,
    } =
      await supabase
        .from(
          "push_delivery_receipts",
        )
        .update({
          receipt_attempt_count:
            receipt.receipt_attempt_count +
            1,
          last_receipt_attempt_at:
            timestamp,
        })
        .eq(
          "id",
          receipt.id,
        )
        .eq(
          "status",
          "pending",
        );

    if (error) {
      console.error(
        "Failed to record Expo push receipt attempt:",
        error,
      );
    }
  }
}

async function disableUnregisteredPushDevice(
  supabase:
    BackendSupabaseClient,
  pushDeviceId: string,
  errorCode: string,
): Promise<void> {
  const {
    data: pushDevice,
    error: readError,
  } =
    await supabase
      .from(
        "push_devices",
      )
      .select(
        "id,delivery_failure_count",
      )
      .eq(
        "id",
        pushDeviceId,
      )
      .maybeSingle();

  if (readError) {
    console.error(
      "Failed to load unregistered push device:",
      readError,
    );

    return;
  }

  if (!pushDevice) {
    return;
  }

  const failureCount =
    typeof pushDevice
      .delivery_failure_count ===
    "number"
      ? pushDevice
          .delivery_failure_count
      : 0;

  const timestamp =
    new Date().toISOString();

  const {
    error: updateError,
  } =
    await supabase
      .from(
        "push_devices",
      )
      .update({
        enabled: false,
        disabled_at:
          timestamp,
        disabled_reason:
          "device-not-registered",
        delivery_failure_count:
          failureCount + 1,
        last_delivery_error:
          errorCode,
        last_delivery_error_at:
          timestamp,
      })
      .eq(
        "id",
        pushDeviceId,
      );

  if (updateError) {
    console.error(
      "Failed to disable unregistered push device:",
      updateError,
    );
  }
}

async function recordPushDeviceFailure(
  supabase:
    BackendSupabaseClient,
  pushDeviceId: string,
  errorCode: string,
): Promise<void> {
  const {
    data: pushDevice,
    error: readError,
  } =
    await supabase
      .from(
        "push_devices",
      )
      .select(
        "id,delivery_failure_count",
      )
      .eq(
        "id",
        pushDeviceId,
      )
      .maybeSingle();

  if (readError) {
    console.error(
      "Failed to load push device for delivery failure:",
      readError,
    );

    return;
  }

  if (!pushDevice) {
    return;
  }

  const failureCount =
    typeof pushDevice
      .delivery_failure_count ===
    "number"
      ? pushDevice
          .delivery_failure_count
      : 0;

  const {
    error: updateError,
  } =
    await supabase
      .from(
        "push_devices",
      )
      .update({
        delivery_failure_count:
          failureCount + 1,
        last_delivery_error:
          errorCode,
        last_delivery_error_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        pushDeviceId,
      );

  if (updateError) {
    console.error(
      "Failed to record push-device receipt failure:",
      updateError,
    );
  }
}

function readNonEmptyString(
  value: unknown,
): string | null {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const normalized =
    value.trim();

  return normalized
    ? normalized
    : null;
}

function jsonResponse(
  value: unknown,
  status = 200,
): Response {
  return new Response(
    JSON.stringify(value),
    {
      status,
      headers: {
        "Content-Type":
          "application/json",
      },
    },
  );
}