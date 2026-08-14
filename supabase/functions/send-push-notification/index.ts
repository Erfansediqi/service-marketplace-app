import { createClient } from "@supabase/supabase-js";

type NotificationRole =
  | "customer"
  | "provider";

type NotificationType =
  | "booking-created"
  | "booking-confirmed"
  | "booking-completed";

type SupportedLanguage =
  | "English"
  | "Dari"
  | "Pashto";

type NotificationRecord = {
  id: string;
  recipient_user_id: string;
  recipient_role: NotificationRole;
  recipient_provider_id: string | null;
  booking_id: string | null;
  type: NotificationType;
  priority: "low" | "normal" | "high";
  title_key: string;
  body_key: string;
  body_params: Record<string, unknown>;
  data: Record<string, unknown>;
  created_at: string;
};

type DatabaseWebhookPayload = {
  type: "INSERT";
  table: "notifications";
  schema: "public";
  record: NotificationRecord;
  old_record: null;
};

type PushDeviceRow = {
  id: string;
  push_token: string;
};

type PushDeliveryReceiptInsert = {
  notification_id: string;
  push_device_id: string;
  expo_ticket_id: string;
};

type ExpoPushTicket =
  | {
      status: "ok";
      id: string;
    }
  | {
      status: "error";
      message?: string;
      details?: {
        error?: string;
      };
    };

type ExpoPushResponse = {
  data?: ExpoPushTicket[];
  errors?: unknown[];
};

const TRANSLATIONS = {
  English: {
    bookingCreatedTitle:
      "New booking request",
    bookingCreatedBody:
      "{{customerName}} requested your service.",

    bookingConfirmedTitle:
      "Booking confirmed",
    bookingConfirmedBody:
      "{{providerName}} accepted your booking.",

    bookingCompletedTitle:
      "Booking completed",
    bookingCompletedBody:
      "{{providerName}} marked your booking as completed.",
  },

  Dari: {
    bookingCreatedTitle:
      "درخواست جدید رزرو",
    bookingCreatedBody:
      "{{customerName}} خدمت شما را درخواست کرده است.",

    bookingConfirmedTitle:
      "رزرو تایید شد",
    bookingConfirmedBody:
      "{{providerName}} رزرو شما را پذیرفت.",

    bookingCompletedTitle:
      "رزرو تکمیل شد",
    bookingCompletedBody:
      "{{providerName}} رزرو شما را تکمیل‌شده علامت زد.",
  },

  Pashto: {
    bookingCreatedTitle:
      "د بکینګ نوې غوښتنه",
    bookingCreatedBody:
      "{{customerName}} ستاسو خدمت غوښتنه کړې ده.",

    bookingConfirmedTitle:
      "بکینګ تایید شو",
    bookingConfirmedBody:
      "{{providerName}} ستاسو بکینګ ومانه.",

    bookingCompletedTitle:
      "بکینګ بشپړ شو",
    bookingCompletedBody:
      "{{providerName}} ستاسو بکینګ بشپړ شوی وښود.",
  },
} as const;

const EXPECTED_NOTIFICATION_KEYS = {
  "booking-created": {
    role: "provider",
    titleKey:
      "notificationBookingCreatedTitle",
    bodyKey:
      "notificationBookingCreatedBody",
  },

  "booking-confirmed": {
    role: "customer",
    titleKey:
      "notificationBookingConfirmedTitle",
    bodyKey:
      "notificationBookingConfirmedBody",
  },

  "booking-completed": {
    role: "customer",
    titleKey:
      "notificationBookingCompletedTitle",
    bodyKey:
      "notificationBookingCompletedBody",
  },
} as const;

const EXPO_PUSH_ENDPOINT =
  "https://exp.host/--/api/v2/push/send";

function createBackendClient(
  supabaseUrl: string,
  serviceRoleKey: string,
) {
  return createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        persistSession:
          false,
        autoRefreshToken:
          false,
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
    if (
      request.method !==
      "POST"
    ) {
      return jsonResponse(
        {
          error:
            "Method not allowed.",
        },
        405,
      );
    }

    const configuredWebhookSecret =
      Deno.env.get(
        "KHEDMAT_PUSH_WEBHOOK_SECRET",
      );

    if (!configuredWebhookSecret) {
      console.error(
        "KHEDMAT_PUSH_WEBHOOK_SECRET is not configured.",
      );

      return jsonResponse(
        {
          error:
            "Push webhook secret is not configured.",
        },
        500,
      );
    }

    const requestWebhookSecret =
      request.headers.get(
        "x-khedmat-webhook-secret",
      );

    if (
      !requestWebhookSecret ||
      requestWebhookSecret !==
        configuredWebhookSecret
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

    let payload: unknown;

    try {
      payload =
        await request.json();
    } catch {
      return jsonResponse(
        {
          error:
            "Invalid JSON body.",
        },
        400,
      );
    }

    const webhookPayload =
      parseWebhookPayload(
        payload,
      );

    if (!webhookPayload) {
      return jsonResponse(
        {
          error:
            "Unsupported webhook payload.",
        },
        400,
      );
    }

    const notification =
      webhookPayload.record;

    const localizedContent =
      await buildLocalizedPushContent({
        notification,
        supabaseUrl,
        serviceRoleKey,
      });

    if (!localizedContent) {
      return jsonResponse(
        {
          error:
            "Notification could not be localized safely.",
        },
        422,
      );
    }

    const supabase =
      createBackendClient(
        supabaseUrl,
        serviceRoleKey,
      );

    const {
      data: pushDevices,
      error:
        pushDevicesError,
    } =
      await supabase
        .from(
          "push_devices",
        )
        .select(
          "id,push_token",
        )
        .eq(
          "user_id",
          notification
            .recipient_user_id,
        )
        .eq(
          "enabled",
          true,
        )
        .eq(
          "push_provider",
          "expo",
        );

    if (pushDevicesError) {
      console.error(
        "Failed to load push devices:",
        pushDevicesError,
      );

      return jsonResponse(
        {
          error:
            "Could not load recipient push devices.",
        },
        500,
      );
    }

    const devices =
      (pushDevices ??
        []) as PushDeviceRow[];

    if (
      devices.length ===
      0
    ) {
      return jsonResponse({
        ok: true,
        deliveredTo:
          0,
      });
    }

    const messages =
      devices.map(
        (
          device,
        ) => ({
          to:
            device.push_token,
          sound:
            "default",
          title:
            localizedContent.title,
          body:
            localizedContent.body,
          priority:
            notification.priority ===
            "high"
              ? "high"
              : "default",
          channelId:
            "khedmat-default",
          data:
            buildTrustedPushData(
              notification,
            ),
        }),
      );

    let expoResponse:
      Response;

    try {
      expoResponse =
        await fetch(
          EXPO_PUSH_ENDPOINT,
          {
            method:
              "POST",
            headers: {
              "Content-Type":
                "application/json",
              Accept:
                "application/json",
            },
            body:
              JSON.stringify(
                messages,
              ),
          },
        );
    } catch (error) {
      console.error(
        "Expo Push Service request failed:",
        error,
      );

      await recordDeliveryFailureForDevices(
        supabase,
        devices.map(
          (
            device,
          ) =>
            device.id,
        ),
        "expo-request-failed",
      );

      return jsonResponse(
        {
          error:
            "Expo Push Service request failed.",
        },
        502,
      );
    }

    let expoPayload:
      | ExpoPushResponse
      | null = null;

    try {
      expoPayload =
        (await expoResponse.json()) as
          ExpoPushResponse;
    } catch {
      expoPayload =
        null;
    }

    if (
      !expoResponse.ok ||
      !expoPayload?.data
    ) {
      console.error(
        "Expo Push Service returned an unsuccessful response:",
        expoResponse.status,
        expoPayload,
      );

      await recordDeliveryFailureForDevices(
        supabase,
        devices.map(
          (
            device,
          ) =>
            device.id,
        ),
        `expo-http-${expoResponse.status}`,
      );

      return jsonResponse(
        {
          error:
            "Expo Push Service returned an unsuccessful response.",
        },
        502,
      );
    }

    const tickets =
      expoPayload.data;

    const ticketIds:
      string[] =
      [];

    const receiptRecords:
      PushDeliveryReceiptInsert[] =
      [];

    for (
      let index = 0;
      index <
      devices.length;
      index += 1
    ) {
      const device =
        devices[index];

      const ticket =
        tickets[index];

      if (!ticket) {
        await recordDeliveryFailureForDevices(
          supabase,
          [
            device.id,
          ],
          "expo-missing-ticket",
        );

        continue;
      }

      if (
        ticket.status ===
        "ok"
      ) {
        ticketIds.push(
          ticket.id,
        );

        receiptRecords.push({
          notification_id:
            notification.id,
          push_device_id:
            device.id,
          expo_ticket_id:
            ticket.id,
        });

        continue;
      }

      const errorCode =
        ticket.details
          ?.error ??
        "expo-ticket-error";

      await recordDeliveryFailureForDevices(
        supabase,
        [
          device.id,
        ],
        errorCode,
      );
    }

    if (
      receiptRecords.length >
      0
    ) {
      const {
        error:
          receiptInsertError,
      } =
        await supabase
          .from(
            "push_delivery_receipts",
          )
          .insert(
            receiptRecords,
          );

      if (
        receiptInsertError
      ) {
        console.error(
          "Failed to persist Expo push ticket records:",
          receiptInsertError,
        );
      }
    }

    return jsonResponse({
      ok: true,
      deliveredTo:
        devices.length,
      ticketIds,
    });
  },
};

async function buildLocalizedPushContent({
  notification,
  supabaseUrl,
  serviceRoleKey,
}: {
  notification:
    NotificationRecord;
  supabaseUrl:
    string;
  serviceRoleKey:
    string;
}): Promise<
  | {
      title: string;
      body: string;
    }
  | null
> {
  const expected =
    EXPECTED_NOTIFICATION_KEYS[
      notification.type
    ];

  if (
    !expected ||
    expected.role !==
      notification
        .recipient_role ||
    expected.titleKey !==
      notification
        .title_key ||
    expected.bodyKey !==
      notification
        .body_key
  ) {
    return null;
  }

  const supabase =
    createBackendClient(
      supabaseUrl,
      serviceRoleKey,
    );

  const {
    data: profile,
    error,
  } =
    await supabase
      .from(
        "profiles",
      )
      .select(
        "preferred_language",
      )
      .eq(
        "id",
        notification
          .recipient_user_id,
      )
      .maybeSingle();

  if (error) {
    console.error(
      "Failed to load notification recipient language:",
      error,
    );

    return null;
  }

  const language =
    parseLanguage(
      profile
        ?.preferred_language,
    );

  const translation =
    TRANSLATIONS[
      language
    ];

  switch (
    notification.type
  ) {
    case "booking-created": {
      const customerName =
        readRequiredParam(
          notification
            .body_params,
          "customerName",
        );

      if (
        !customerName
      ) {
        return null;
      }

      return {
        title:
          translation
            .bookingCreatedTitle,
        body:
          interpolate(
            translation
              .bookingCreatedBody,
            {
              customerName,
            },
          ),
      };
    }

    case "booking-confirmed": {
      const providerName =
        readRequiredParam(
          notification
            .body_params,
          "providerName",
        );

      if (
        !providerName
      ) {
        return null;
      }

      return {
        title:
          translation
            .bookingConfirmedTitle,
        body:
          interpolate(
            translation
              .bookingConfirmedBody,
            {
              providerName,
            },
          ),
      };
    }

    case "booking-completed": {
      const providerName =
        readRequiredParam(
          notification
            .body_params,
          "providerName",
        );

      if (
        !providerName
      ) {
        return null;
      }

      return {
        title:
          translation
            .bookingCompletedTitle,
        body:
          interpolate(
            translation
              .bookingCompletedBody,
            {
              providerName,
            },
          ),
      };
    }
  }
}

function buildTrustedPushData(
  notification:
    NotificationRecord,
): Record<
  string,
  string
> {
  const data:
    Record<
      string,
      string
    > = {
      notificationId:
        notification.id,
      type:
        notification.type,
      recipient:
        notification
          .recipient_role,
    };

  if (
    notification.booking_id
  ) {
    data.bookingId =
      notification.booking_id;
  }

  return data;
}

function parseWebhookPayload(
  value: unknown,
): DatabaseWebhookPayload | null {
  if (
    !isRecord(
      value,
    )
  ) {
    return null;
  }

  if (
    value.type !==
      "INSERT" ||
    value.table !==
      "notifications" ||
    value.schema !==
      "public" ||
    !isRecord(
      value.record,
    )
  ) {
    return null;
  }

  const record =
    value.record;

  const type =
    parseNotificationType(
      record.type,
    );

  const recipientRole =
    parseRecipientRole(
      record
        .recipient_role,
    );

  if (
    !type ||
    !recipientRole
  ) {
    return null;
  }

  const id =
    readNonEmptyString(
      record.id,
    );

  const recipientUserId =
    readNonEmptyString(
      record
        .recipient_user_id,
    );

  const titleKey =
    readNonEmptyString(
      record.title_key,
    );

  const bodyKey =
    readNonEmptyString(
      record.body_key,
    );

  const createdAt =
    readNonEmptyString(
      record.created_at,
    );

  if (
    !id ||
    !recipientUserId ||
    !titleKey ||
    !bodyKey ||
    !createdAt
  ) {
    return null;
  }

  return {
    type:
      "INSERT",
    table:
      "notifications",
    schema:
      "public",
    old_record:
      null,
    record: {
      id,
      recipient_user_id:
        recipientUserId,
      recipient_role:
        recipientRole,
      recipient_provider_id:
        readNullableString(
          record
            .recipient_provider_id,
        ),
      booking_id:
        readNullableString(
          record.booking_id,
        ),
      type,
      priority:
        parsePriority(
          record.priority,
        ),
      title_key:
        titleKey,
      body_key:
        bodyKey,
      body_params:
        isRecord(
          record.body_params,
        )
          ? record.body_params
          : {},
      data:
        isRecord(
          record.data,
        )
          ? record.data
          : {},
      created_at:
        createdAt,
    },
  };
}

async function recordDeliveryFailureForDevices(
  supabase:
    BackendSupabaseClient,
  deviceIds:
    string[],
  errorCode:
    string,
): Promise<void> {
  if (
    deviceIds.length ===
    0
  ) {
    return;
  }

  const {
    data: existingDevices,
    error:
      readError,
  } =
    await supabase
      .from(
        "push_devices",
      )
      .select(
        "id,delivery_failure_count",
      )
      .in(
        "id",
        deviceIds,
      );

  if (readError) {
    console.error(
      "Failed to load push-device failure counts:",
      readError,
    );

    return;
  }

  for (
    const device of
    existingDevices ??
    []
  ) {
    const currentCount =
      typeof device
        .delivery_failure_count ===
      "number"
        ? device
            .delivery_failure_count
        : 0;

    const {
      error:
        updateError,
    } =
      await supabase
        .from(
          "push_devices",
        )
        .update({
          delivery_failure_count:
            currentCount +
            1,
          last_delivery_error:
            errorCode,
          last_delivery_error_at:
            new Date()
              .toISOString(),
        })
        .eq(
          "id",
          device.id,
        );

    if (
      updateError
    ) {
      console.error(
        "Failed to record push-device delivery failure:",
        updateError,
      );
    }
  }
}

function parseLanguage(
  value: unknown,
): SupportedLanguage {
  if (
    value === "Dari" ||
    value === "Pashto" ||
    value === "English"
  ) {
    return value;
  }

  return "English";
}

function parseNotificationType(
  value: unknown,
): NotificationType | null {
  if (
    value ===
      "booking-created" ||
    value ===
      "booking-confirmed" ||
    value ===
      "booking-completed"
  ) {
    return value;
  }

  return null;
}

function parseRecipientRole(
  value: unknown,
): NotificationRole | null {
  if (
    value ===
      "customer" ||
    value ===
      "provider"
  ) {
    return value;
  }

  return null;
}

function parsePriority(
  value: unknown,
):
  | "low"
  | "normal"
  | "high" {
  if (
    value === "low" ||
    value === "high"
  ) {
    return value;
  }

  return "normal";
}

function readRequiredParam(
  params:
    Record<
      string,
      unknown
    >,
  key:
    string,
): string | null {
  return readNonEmptyString(
    params[key],
  );
}

function interpolate(
  template:
    string,
  values:
    Record<
      string,
      string
    >,
): string {
  let result =
    template;

  for (
    const [
      key,
      value,
    ] of Object.entries(
      values,
    )
  ) {
    result =
      result.replaceAll(
        `{{${key}}}`,
        value,
      );
  }

  return result;
}

function readNullableString(
  value: unknown,
): string | null {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  return readNonEmptyString(
    value,
  );
}

function readNonEmptyString(
  value: unknown,
): string | null {
  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  const normalized =
    value.trim();

  return normalized
    ? normalized
    : null;
}

function isRecord(
  value: unknown,
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      "object" &&
    value !== null &&
    !Array.isArray(
      value,
    )
  );
}

function jsonResponse(
  value: unknown,
  status = 200,
): Response {
  return new Response(
    JSON.stringify(
      value,
    ),
    {
      status,
      headers: {
        "Content-Type":
          "application/json",
      },
    },
  );
}