import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    ComponentProps,
    useMemo,
    useState,
} from "react";
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSession } from "../../context/session-context";

import { GlassSurface } from "../../components/glass/glass-surface";
import {
    Colors,
    Layout,
    Radius,
    Shadows,
    Spacing,
    Typography,
} from "../../constants/theme";
import {
    BookingRecord,
    useBooking,
} from "../../context/booking-context";

type IconName =
  ComponentProps<typeof Ionicons>["name"];

type ConversationFilter =
  | "all"
  | "unread"
  | "active"
  | "archived";

type Conversation = {
  id: string;
  bookingId: string;
  customerName: string;
  customerInitials: string;
  serviceName: string;
  serviceId: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  online: boolean;
  archived: boolean;
  bookingStatus: BookingRecord["status"];
};


const filters: Array<{
  id: ConversationFilter;
  label: string;
}> = [
  {
    id: "all",
    label: "همه",
  },
  {
    id: "unread",
    label: "خوانده‌نشده",
  },
  {
    id: "active",
    label: "فعال",
  },
  {
    id: "archived",
    label: "آرشیف",
  },
];

export default function ProviderMessagesScreen() {
  const router = useRouter();
  const { bookings } = useBooking();
  const { activeProviderId } = useSession();

  const providerId =
    activeProviderId ?? "provider-1";

  const [query, setQuery] = useState("");

  const [
    selectedFilter,
    setSelectedFilter,
  ] = useState<ConversationFilter>("all");

  const conversations = useMemo(
    () =>
      createConversations(
        bookings.filter(
          (booking) =>
            booking.providerId === providerId,
        ),
      ),
    [bookings, providerId],
  );

  const filteredConversations =
    useMemo(() => {
      const normalizedQuery = query
        .trim()
        .toLocaleLowerCase();

      return conversations.filter(
        (conversation) => {
          if (
            selectedFilter === "unread" &&
            conversation.unreadCount === 0
          ) {
            return false;
          }

          if (
            selectedFilter === "active" &&
            !(
              conversation.bookingStatus ===
                "confirmed" ||
              conversation.bookingStatus ===
                "in-progress"
            )
          ) {
            return false;
          }

          if (
            selectedFilter === "archived" &&
            !conversation.archived
          ) {
            return false;
          }

          if (
            selectedFilter !== "archived" &&
            conversation.archived
          ) {
            return false;
          }

          if (!normalizedQuery) {
            return true;
          }

          const searchableText = [
            conversation.customerName,
            conversation.serviceName,
            conversation.lastMessage,
          ]
            .join(" ")
            .toLocaleLowerCase();

          return searchableText.includes(
            normalizedQuery,
          );
        },
      );
    }, [
      conversations,
      query,
      selectedFilter,
    ]);

  const unreadCount = conversations.reduce(
    (total, conversation) =>
      total + conversation.unreadCount,
    0,
  );

  const activeCount = conversations.filter(
    (conversation) =>
      conversation.bookingStatus ===
        "confirmed" ||
      conversation.bookingStatus ===
        "in-progress",
  ).length;

  const openConversation = (
    conversation: Conversation,
  ) => {
    /*
     * A dedicated provider conversation route will be
     * connected after the shared chat store is created.
     */
    console.log(
      "Open provider conversation:",
      conversation.id,
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="ایجاد پیام جدید"
              onPress={() => {
                console.log(
                  "Create provider conversation",
                );
              }}
              style={({ pressed }) => [
                styles.composePressable,
                pressed && styles.pressed,
              ]}
            >
              <GlassSurface
                variant="regular"
                radius={Radius.pill}
                style={styles.composeSurface}
                contentStyle={
                  styles.composeContent
                }
              >
                <Ionicons
                  name="create-outline"
                  size={21}
                  color={Colors.primary}
                />
              </GlassSurface>
            </Pressable>

            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>
                ارتباط با مشتریان
              </Text>

              <Text style={styles.title}>
                پیام‌ها
              </Text>

              <Text style={styles.subtitle}>
                گفتگوهای مرتبط با درخواست‌ها و
                رزروهای خود را مدیریت کنید.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <MessageMetric
            icon="chatbubble-ellipses-outline"
            label="همه گفتگوها"
            value={conversations.length}
            color={Colors.primary}
          />

          <MessageMetric
            icon="mail-unread-outline"
            label="خوانده‌نشده"
            value={unreadCount}
            color={Colors.warning}
          />

          <MessageMetric
            icon="briefcase-outline"
            label="رزرو فعال"
            value={activeCount}
            color={Colors.success}
          />
        </View>

        <GlassSurface
          variant="prominent"
          radius={Radius.xl}
          style={[
            styles.searchSurface,
            Shadows.small,
          ]}
          contentStyle={styles.searchContent}
        >
          <Ionicons
            name="search-outline"
            size={21}
            color={Colors.primary}
          />

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="جستجوی مشتری یا خدمت..."
            placeholderTextColor={
              Colors.textMuted
            }
            selectionColor={Colors.primary}
            returnKeyType="search"
            style={styles.searchInput}
          />

          {query.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="پاک کردن جستجو"
              hitSlop={8}
              onPress={() => setQuery("")}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={Colors.textTertiary}
              />
            </Pressable>
          ) : null}
        </GlassSurface>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.filtersRow
          }
          style={styles.filtersScroll}
        >
          {filters.map((filter) => {
            const selected =
              selectedFilter === filter.id;

            const count = getFilterCount(
              filter.id,
              conversations,
            );

            return (
              <Pressable
                key={filter.id}
                accessibilityRole="button"
                accessibilityState={{
                  selected,
                }}
                onPress={() =>
                  setSelectedFilter(filter.id)
                }
                style={({ pressed }) => [
                  styles.filterPressable,
                  pressed && styles.pressed,
                ]}
              >
                <GlassSurface
                  variant={
                    selected
                      ? "prominent"
                      : "regular"
                  }
                  radius={Radius.pill}
                  style={[
                    styles.filterSurface,
                    selected &&
                      styles.selectedFilterSurface,
                  ]}
                  contentStyle={
                    styles.filterContent
                  }
                >
                  <Text
                    style={[
                      styles.filterText,
                      selected &&
                        styles.selectedFilterText,
                    ]}
                  >
                    {filter.label}
                  </Text>

                  {count > 0 ? (
                    <View
                      style={[
                        styles.filterBadge,
                        selected &&
                          styles.selectedFilterBadge,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterBadgeText,
                          selected &&
                            styles.selectedFilterBadgeText,
                        ]}
                      >
                        {toDariDigits(
                          count.toString(),
                        )}
                      </Text>
                    </View>
                  ) : null}
                </GlassSurface>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {toDariDigits(
              filteredConversations.length.toString(),
            )}{" "}
            گفتگو
          </Text>

          <View
            style={styles.resultsTitleRow}
          >
            <Text style={styles.resultsTitle}>
              گفتگوهای شما
            </Text>

            <Ionicons
              name="chatbubbles-outline"
              size={19}
              color={Colors.primary}
            />
          </View>
        </View>

        <View style={styles.conversations}>
          {filteredConversations.map(
            (conversation) => (
              <ConversationCard
                key={conversation.id}
                conversation={conversation}
                onPress={() =>
                  openConversation(conversation)
                }
              />
            ),
          )}

          {filteredConversations.length ===
          0 ? (
            <EmptyMessages
              filter={selectedFilter}
              hasQuery={Boolean(query.trim())}
              onClear={() => {
                setQuery("");
                setSelectedFilter("all");
              }}
            />
          ) : null}
        </View>

        <GlassSurface
          variant="regular"
          radius={Radius.xl}
          style={styles.noticeCard}
          contentStyle={styles.noticeContent}
        >
          <View style={styles.noticeIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={23}
              color={Colors.success}
            />
          </View>

          <View style={styles.noticeCopy}>
            <Text style={styles.noticeTitle}>
              ارتباط امن در داخل برنامه
            </Text>

            <Text style={styles.noticeText}>
              برای حفظ امنیت و سابقهٔ هماهنگی،
              جزئیات رزرو و گفتگوها را در داخل
              برنامه نگه دارید.
            </Text>
          </View>
        </GlassSurface>
      </ScrollView>
    </SafeAreaView>
  );
}

function MessageMetric({
  icon,
  label,
  value,
  color,
}: {
  icon: IconName;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <GlassSurface
      variant="regular"
      radius={Radius.xl}
      style={styles.metricCard}
      contentStyle={styles.metricContent}
    >
      <View
        style={[
          styles.metricIcon,
          {
            backgroundColor: `${color}18`,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={19}
          color={color}
        />
      </View>

      <Text style={styles.metricValue}>
        {toDariDigits(value.toString())}
      </Text>

      <Text style={styles.metricLabel}>
        {label}
      </Text>
    </GlassSurface>
  );
}

function ConversationCard({
  conversation,
  onPress,
}: {
  conversation: Conversation;
  onPress: () => void;
}) {
  const status = getBookingStatus(
    conversation.bookingStatus,
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`گفتگو با ${conversation.customerName}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.conversationPressable,
        pressed && styles.cardPressed,
      ]}
    >
      <GlassSurface
        variant={
          conversation.unreadCount > 0
            ? "prominent"
            : "regular"
        }
        radius={Radius.xl}
        style={[
          styles.conversationCard,
          conversation.unreadCount > 0 &&
            styles.unreadConversationCard,
        ]}
        contentStyle={
          styles.conversationContent
        }
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {conversation.customerInitials}
          </Text>

          {conversation.online ? (
            <View style={styles.onlineIndicator} />
          ) : null}
        </View>

        <View
          style={styles.conversationCopy}
        >
          <View style={styles.nameRow}>
            <Text
              numberOfLines={1}
              style={styles.customerName}
            >
              {conversation.customerName}
            </Text>

            <Text style={styles.messageTime}>
              {formatRelativeTime(
                conversation.lastMessageAt,
              )}
            </Text>
          </View>

          <Text
            numberOfLines={1}
            style={styles.serviceName}
          >
            {conversation.serviceName}
          </Text>

          <Text
            numberOfLines={2}
            style={[
              styles.lastMessage,
              conversation.unreadCount > 0 &&
                styles.unreadMessage,
            ]}
          >
            {conversation.lastMessage}
          </Text>

          <View
            style={styles.conversationFooter}
          >
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    status.backgroundColor,
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color: status.color,
                  },
                ]}
              >
                {status.label}
              </Text>
            </View>

            {conversation.unreadCount > 0 ? (
              <View style={styles.unreadBadge}>
                <Text
                  style={styles.unreadBadgeText}
                >
                  {toDariDigits(
                    conversation.unreadCount.toString(),
                  )}
                </Text>
              </View>
            ) : (
              <Ionicons
                name="checkmark-done-outline"
                size={17}
                color={Colors.textTertiary}
              />
            )}
          </View>
        </View>

        <Ionicons
          name="chevron-back"
          size={18}
          color={Colors.primary}
        />
      </GlassSurface>
    </Pressable>
  );
}

function EmptyMessages({
  filter,
  hasQuery,
  onClear,
}: {
  filter: ConversationFilter;
  hasQuery: boolean;
  onClear: () => void;
}) {
  return (
    <View style={styles.emptyState}>
      <GlassSurface
        variant="regular"
        radius={Radius.xxl}
        style={styles.emptyIconSurface}
        contentStyle={
          styles.emptyIconContent
        }
      >
        <Ionicons
          name={
            hasQuery
              ? "search-outline"
              : "chatbubbles-outline"
          }
          size={34}
          color={Colors.textTertiary}
        />
      </GlassSurface>

      <Text style={styles.emptyTitle}>
        {hasQuery
          ? "گفتگویی پیدا نشد"
          : getEmptyTitle(filter)}
      </Text>

      <Text style={styles.emptySubtitle}>
        {hasQuery
          ? "عبارت جستجو یا فیلتر انتخاب‌شده را تغییر دهید."
          : getEmptySubtitle(filter)}
      </Text>

      {(hasQuery || filter !== "all") ? (
        <Pressable
          accessibilityRole="button"
          onPress={onClear}
          style={({ pressed }) => [
            styles.emptyAction,
            pressed && styles.pressed,
          ]}
        >
          <Text
            style={styles.emptyActionText}
          >
            نمایش همه گفتگوها
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function createConversations(
  bookings: BookingRecord[],
): Conversation[] {
  return bookings
    .filter(
      (booking) =>
        booking.status !== "cancelled",
    )
    .map((booking, index) => {
      const customerName =
        getMockCustomerName(index);

      return {
        id: `conversation-${booking.id}`,
        bookingId: booking.id,
        customerName,
        customerInitials:
          getInitials(customerName),
        serviceName: booking.serviceName,
        serviceId: booking.serviceId,
        lastMessage:
          getLastMessage(booking),
        lastMessageAt:
          getConversationTimestamp(
            booking.createdAt,
            index,
          ),
        unreadCount:
          booking.status === "pending"
            ? 1
            : booking.status ===
                "confirmed" &&
              index % 2 === 0
              ? 2
              : 0,
        online: index % 3 === 0,
        archived:
          booking.status === "completed",
        bookingStatus: booking.status,
      };
    })
    .sort((first, second) =>
      second.lastMessageAt.localeCompare(
        first.lastMessageAt,
      ),
    );
}

function getMockCustomerName(
  index: number,
): string {
  const names = [
    "محمد نعیم",
    "فاطمه احمدی",
    "عبدالله صدیقی",
    "مریم کریمی",
    "احمد جاوید",
    "سمیرا حسینی",
  ];

  return names[index % names.length] ?? "مشتری";
}

function getLastMessage(
  booking: BookingRecord,
): string {
  if (booking.status === "pending") {
    return "سلام، لطفاً درخواست من را بررسی کنید.";
  }

  if (booking.status === "confirmed") {
    return "تشکر، منتظر رسیدن شما در زمان تعیین‌شده هستم.";
  }

  if (
    booking.status === "in-progress"
  ) {
    return "آدرس دقیق را فرستادم. ورودی از کوچه پشتی است.";
  }

  if (booking.status === "completed") {
    return "تشکر، کار با موفقیت انجام شد.";
  }

  return "پیام مربوط به این رزرو";
}

function getConversationTimestamp(
  createdAt: string,
  index: number,
): string {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString();
  }

  date.setMinutes(
    date.getMinutes() + index * 12,
  );

  return date.toISOString();
}

function getFilterCount(
  filter: ConversationFilter,
  conversations: Conversation[],
): number {
  if (filter === "unread") {
    return conversations.filter(
      (conversation) =>
        conversation.unreadCount > 0 &&
        !conversation.archived,
    ).length;
  }

  if (filter === "active") {
    return conversations.filter(
      (conversation) =>
        !conversation.archived &&
        (conversation.bookingStatus ===
          "confirmed" ||
          conversation.bookingStatus ===
            "in-progress"),
    ).length;
  }

  if (filter === "archived") {
    return conversations.filter(
      (conversation) =>
        conversation.archived,
    ).length;
  }

  return conversations.filter(
    (conversation) =>
      !conversation.archived,
  ).length;
}

function getBookingStatus(
  status: BookingRecord["status"],
) {
  if (status === "confirmed") {
    return {
      label: "رزرو تأییدشده",
      color: Colors.primary,
      backgroundColor: Colors.primarySoft,
    };
  }

  if (status === "in-progress") {
    return {
      label: "در حال انجام",
      color: Colors.secondary,
      backgroundColor:
        "rgba(86, 183, 201, 0.12)",
    };
  }

  if (status === "completed") {
    return {
      label: "تکمیل‌شده",
      color: Colors.success,
      backgroundColor:
        "rgba(48, 183, 106, 0.12)",
    };
  }

  return {
    label: "در انتظار",
    color: Colors.warning,
    backgroundColor:
      "rgba(217, 154, 43, 0.12)",
  };
}

function getEmptyTitle(
  filter: ConversationFilter,
): string {
  if (filter === "unread") {
    return "پیام خوانده‌نشده‌ای ندارید";
  }

  if (filter === "active") {
    return "گفتگوی فعالی ندارید";
  }

  if (filter === "archived") {
    return "آرشیف گفتگوها خالی است";
  }

  return "هنوز گفتگویی ندارید";
}

function getEmptySubtitle(
  filter: ConversationFilter,
): string {
  if (filter === "unread") {
    return "پیام‌های تازه مشتریان در این بخش نمایش داده می‌شوند.";
  }

  if (filter === "active") {
    return "گفتگوهای مربوط به رزروهای تأییدشده و در حال انجام در اینجا قرار می‌گیرند.";
  }

  if (filter === "archived") {
    return "گفتگوهای مربوط به خدمات تکمیل‌شده در آرشیف نمایش داده می‌شوند.";
  }

  return "پس از دریافت یا پذیرش درخواست مشتری، گفتگوهای شما در اینجا نمایش داده می‌شوند.";
}

function getInitials(
  name: string,
): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2);
}

function formatRelativeTime(
  value: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();

  const differenceMinutes = Math.max(
    0,
    Math.floor(
      (now.getTime() - date.getTime()) /
        60000,
    ),
  );

  if (differenceMinutes < 1) {
    return "اکنون";
  }

  if (differenceMinutes < 60) {
    return `${toDariDigits(
      differenceMinutes.toString(),
    )} دقیقه`;
  }

  const differenceHours = Math.floor(
    differenceMinutes / 60,
  );

  if (differenceHours < 24) {
    return `${toDariDigits(
      differenceHours.toString(),
    )} ساعت`;
  }

  const differenceDays = Math.floor(
    differenceHours / 24,
  );

  return `${toDariDigits(
    differenceDays.toString(),
  )} روز`;
}

function toDariDigits(
  value: string,
): string {
  const digits: Record<string, string> = {
    "0": "۰",
    "1": "۱",
    "2": "۲",
    "3": "۳",
    "4": "۴",
    "5": "۵",
    "6": "۶",
    "7": "۷",
    "8": "۸",
    "9": "۹",
  };

  return value.replace(
    /\d/g,
    (digit) => digits[digit] ?? digit,
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  scrollContent: {
    width: "100%",
    maxWidth: Layout.contentMaxWidth,
    alignSelf: "center",
    paddingHorizontal:
      Layout.screenPadding,
    paddingTop: Spacing.lg,
    paddingBottom: 130,
  },

  header: {
    width: "100%",
  },

  headerTopRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.md,
  },

  headerCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: Spacing.xs,
  },

  eyebrow: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.primary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  title: {
    ...Typography.screenTitle,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 28,
    lineHeight: 35,
  },

  subtitle: {
    ...Typography.bodyStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  composePressable: {
    width: 48,
    height: 48,
    borderRadius: Radius.pill,
  },

  composeSurface: {
    flex: 1,
  },

  composeContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  metricsRow: {
    width: "100%",
    marginTop: Spacing.xxl,
    flexDirection: "row-reverse",
    gap: Spacing.sm,
  },

  metricCard: {
    flex: 1,
  },

  metricContent: {
    minHeight: 112,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    padding: Spacing.sm,
  },

  metricIcon: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },

  metricValue: {
    ...Typography.sectionTitle,
    color: Colors.textPrimary,
    fontSize: 19,
    lineHeight: 24,
    textAlign: "center",
  },

  metricLabel: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textTertiary,
    textAlign: "center",
    writingDirection: "rtl",
    fontSize: 10,
  },

  searchSurface: {
    width: "100%",
    marginTop: Spacing.lg,
  },

  searchContent: {
    minHeight: Layout.controlHeight,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },

  searchInput: {
    flex: 1,
    minHeight: Layout.controlHeight,
    paddingVertical: 0,
    ...Typography.bodyStyle,
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  filtersScroll: {
    marginTop: Spacing.lg,
  },

  filtersRow: {
    flexDirection: "row-reverse",
    gap: Spacing.sm,
    paddingHorizontal: 1,
  },

  filterPressable: {
    borderRadius: Radius.pill,
  },

  filterSurface: {
    minHeight: 42,
  },

  selectedFilterSurface: {
    borderColor:
      "rgba(76, 141, 255, 0.50)",
    backgroundColor: Colors.primarySoft,
  },

  filterContent: {
    minHeight: 42,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },

  filterText: {
    ...Typography.captionStyle,
    color: Colors.textSecondary,
    writingDirection: "rtl",
  },

  selectedFilterText: {
    color: Colors.textPrimary,
    fontWeight: "600",
  },

  filterBadge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.glassStrong,
  },

  selectedFilterBadge: {
    backgroundColor: Colors.primary,
  },

  filterBadgeText: {
    color: Colors.textSecondary,
    fontSize: 9,
    fontWeight: "700",
  },

  selectedFilterBadgeText: {
    color: Colors.white,
  },

  resultsHeader: {
    width: "100%",
    marginTop: Spacing.section,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  resultsCount: {
    ...Typography.captionStyle,
    color: Colors.textTertiary,
    writingDirection: "rtl",
  },

  resultsTitleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.sm,
  },

  resultsTitle: {
    ...Typography.sectionTitle,
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 21,
  },

  conversations: {
    width: "100%",
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },

  conversationPressable: {
    width: "100%",
    borderRadius: Radius.xl,
  },

  conversationCard: {
    width: "100%",
  },

  unreadConversationCard: {
    borderColor:
      "rgba(76, 141, 255, 0.42)",
    backgroundColor:
      "rgba(76, 141, 255, 0.07)",
  },

  conversationContent: {
    minHeight: 130,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
  },

  avatar: {
    width: 56,
    height: 56,
    flexShrink: 0,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primarySoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor:
      "rgba(76, 141, 255, 0.28)",
  },

  avatarText: {
    color: Colors.primary,
    fontSize: 17,
    fontWeight: "700",
  },

  onlineIndicator: {
    position: "absolute",
    right: 1,
    bottom: 1,
    width: 14,
    height: 14,
    borderRadius: Radius.pill,
    backgroundColor: Colors.success,
    borderWidth: 3,
    borderColor: Colors.backgroundRaised,
  },

  conversationCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3,
  },

  nameRow: {
    width: "100%",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },

  customerName: {
    ...Typography.label,
    flex: 1,
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 17,
  },

  messageTime: {
    ...Typography.captionStyle,
    color: Colors.textTertiary,
    fontSize: 10,
    writingDirection: "rtl",
  },

  serviceName: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.primary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  lastMessage: {
    ...Typography.bodyStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 21,
  },

  unreadMessage: {
    color: Colors.textPrimary,
    fontWeight: "600",
  },

  conversationFooter: {
    width: "100%",
    marginTop: 3,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },

  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },

  statusText: {
    ...Typography.captionStyle,
    fontSize: 9,
    writingDirection: "rtl",
  },

  unreadBadge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 5,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
  },

  unreadBadgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: "700",
  },

  emptyState: {
    minHeight: 360,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },

  emptyIconSurface: {
    width: 78,
    height: 78,
  },

  emptyIconContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    ...Typography.sectionTitle,
    color: Colors.textPrimary,
    textAlign: "center",
    writingDirection: "rtl",
  },

  emptySubtitle: {
    ...Typography.bodyStyle,
    maxWidth: 350,
    color: Colors.textSecondary,
    textAlign: "center",
    writingDirection: "rtl",
  },

  emptyAction: {
    minHeight: 42,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.pill,
    backgroundColor: Colors.primarySoft,
  },

  emptyActionText: {
    ...Typography.label,
    color: Colors.primary,
    writingDirection: "rtl",
  },

  noticeCard: {
    width: "100%",
    marginTop: Spacing.section,
    borderColor:
      "rgba(48, 183, 106, 0.25)",
    backgroundColor:
      "rgba(48, 183, 106, 0.05)",
  },

  noticeContent: {
    minHeight: 104,
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: Spacing.md,
    padding: Spacing.lg,
  },

  noticeIcon: {
    width: 46,
    height: 46,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(48, 183, 106, 0.11)",
  },

  noticeCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: Spacing.xs,
  },

  noticeTitle: {
    ...Typography.label,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  noticeText: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 20,
  },

  pressed: {
    opacity: 0.82,
  },

  cardPressed: {
    opacity: 0.91,
    transform: [{ scale: 0.993 }],
  },
});