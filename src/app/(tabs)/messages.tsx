import { Ionicons } from "@expo/vector-icons";
import { ComponentProps, useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { GlassSurface } from "../../components/glass/glass-surface";
import {
  Colors,
  Layout,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "../../constants/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

type ConversationType = "booking" | "support";

type Conversation = {
  id: string;
  name: string;
  initials: string;
  role: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  online: boolean;
  verified: boolean;
  type: ConversationType;
  bookingService?: string;
  bookingStatus?: "pending" | "confirmed" | "completed";
};

const conversations: Conversation[] = [
  {
    id: "conversation-1",
    name: "احمد ولی",
    initials: "او",
    role: "برق‌کار حرفه‌ای",
    lastMessage:
      "بله، ساعت سه بعد از ظهر در محل شما حاضر می‌شوم.",
    time: "۱۰:۴۲",
    unreadCount: 2,
    online: true,
    verified: true,
    type: "booking",
    bookingService: "ترمیم سیم‌کشی برق",
    bookingStatus: "confirmed",
  },
  {
    id: "conversation-2",
    name: "مریم احمدی",
    initials: "ما",
    role: "خدمات نظافت",
    lastMessage:
      "لطفاً تعداد اتاق‌ها و مساحت تقریبی خانه را بفرستید.",
    time: "۹:۱۵",
    unreadCount: 1,
    online: true,
    verified: true,
    type: "booking",
    bookingService: "نظافت عمومی خانه",
    bookingStatus: "pending",
  },
  {
    id: "conversation-3",
    name: "محمد سلیم",
    initials: "مس",
    role: "لوله‌کش و تخنیکر آب",
    lastMessage:
      "تشکر. خوشحال شدم که مشکل لوله برطرف شد.",
    time: "دیروز",
    unreadCount: 0,
    online: false,
    verified: true,
    type: "booking",
    bookingService: "ترمیم نشت لوله",
    bookingStatus: "completed",
  },
  {
    id: "conversation-4",
    name: "پشتیبانی خدمت",
    initials: "خ",
    role: "تیم پشتیبانی",
    lastMessage:
      "درخواست شما دریافت شد و در حال بررسی است.",
    time: "شنبه",
    unreadCount: 0,
    online: false,
    verified: false,
    type: "support",
  },
];

export default function MessagesScreen() {
  const [query, setQuery] = useState("");

  const filteredConversations = useMemo(() => {
    const normalizedQuery = query
      .trim()
      .toLocaleLowerCase();

    if (!normalizedQuery) {
      return conversations;
    }

    return conversations.filter((conversation) => {
      const searchableText = [
        conversation.name,
        conversation.role,
        conversation.lastMessage,
        conversation.bookingService,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [query]);

  const unreadTotal = conversations.reduce(
    (total, conversation) =>
      total + conversation.unreadCount,
    0,
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <GlassSurface
              variant="regular"
              radius={Radius.pill}
              style={styles.headerIconSurface}
              contentStyle={styles.headerIconContent}
            >
              <Ionicons
                name="chatbubbles-outline"
                size={22}
                color={Colors.primary}
              />

              {unreadTotal > 0 ? (
                <View style={styles.headerUnreadBadge}>
                  <Text style={styles.headerUnreadText}>
                    {unreadTotal}
                  </Text>
                </View>
              ) : null}
            </GlassSurface>

            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>
                گفتگوها
              </Text>

              <Text style={styles.title}>
                پیام‌ها
              </Text>
            </View>
          </View>

          <Text style={styles.subtitle}>
            با ارائه‌دهندگان و تیم پشتیبانی در ارتباط باشید.
          </Text>
        </View>

        <GlassSurface
          variant="prominent"
          radius={Radius.xl}
          style={[styles.searchSurface, Shadows.small]}
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
            placeholder="جستجوی گفتگو یا پیام..."
            placeholderTextColor={Colors.textMuted}
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

        <View style={styles.sectionHeader}>
          <Text style={styles.conversationCount}>
            {filteredConversations.length} گفتگو
          </Text>

          <Text style={styles.sectionTitle}>
            گفتگوهای اخیر
          </Text>
        </View>

        <View style={styles.conversations}>
          {filteredConversations.map((conversation) => (
            <ConversationCard
              key={conversation.id}
              conversation={conversation}
            />
          ))}

          {filteredConversations.length === 0 ? (
            <EmptyMessages onClear={() => setQuery("")} />
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ConversationCard({
  conversation,
}: {
  conversation: Conversation;
}) {
  const bookingStatus = conversation.bookingStatus
    ? getBookingStatus(conversation.bookingStatus)
    : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`گفتگو با ${conversation.name}`}
      onPress={() => {
        console.log(
          "Open conversation:",
          conversation.id,
        );
      }}
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
          styles.conversationSurface,
          conversation.unreadCount > 0 &&
            styles.unreadConversationSurface,
        ]}
        contentStyle={styles.conversationContent}
      >
        <View style={styles.avatarWrapper}>
          <View
            style={[
              styles.avatar,
              conversation.type === "support" &&
                styles.supportAvatar,
            ]}
          >
            {conversation.type === "support" ? (
              <Ionicons
                name="headset-outline"
                size={23}
                color={Colors.primary}
              />
            ) : (
              <Text style={styles.avatarInitials}>
                {conversation.initials}
              </Text>
            )}
          </View>

          {conversation.online ? (
            <View style={styles.onlineDot} />
          ) : null}

          {conversation.verified ? (
            <View style={styles.verifiedBadge}>
              <Ionicons
                name="checkmark"
                size={10}
                color={Colors.white}
              />
            </View>
          ) : null}
        </View>

        <View style={styles.conversationCopy}>
          <View style={styles.nameRow}>
            <View style={styles.nameBlock}>
              <Text
                numberOfLines={1}
                style={styles.name}
              >
                {conversation.name}
              </Text>

              <Text
                numberOfLines={1}
                style={styles.role}
              >
                {conversation.role}
              </Text>
            </View>

            <View style={styles.metaBlock}>
              <Text style={styles.time}>
                {conversation.time}
              </Text>

              {conversation.unreadCount > 0 ? (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>
                    {conversation.unreadCount}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {conversation.bookingService ? (
            <View style={styles.bookingContext}>
              <Ionicons
                name="briefcase-outline"
                size={14}
                color={Colors.primary}
              />

              <Text
                numberOfLines={1}
                style={styles.bookingService}
              >
                {conversation.bookingService}
              </Text>

              {bookingStatus ? (
                <View
                  style={[
                    styles.bookingStatusBadge,
                    {
                      backgroundColor:
                        bookingStatus.backgroundColor,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.bookingStatusText,
                      {
                        color: bookingStatus.color,
                      },
                    ]}
                  >
                    {bookingStatus.label}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}

          <Text
            numberOfLines={2}
            style={[
              styles.lastMessage,
              conversation.unreadCount > 0 &&
                styles.unreadLastMessage,
            ]}
          >
            {conversation.lastMessage}
          </Text>
        </View>
      </GlassSurface>
    </Pressable>
  );
}

function EmptyMessages({
  onClear,
}: {
  onClear: () => void;
}) {
  return (
    <View style={styles.emptyState}>
      <GlassSurface
        variant="regular"
        radius={Radius.xxl}
        style={styles.emptyIconSurface}
        contentStyle={styles.emptyIconContent}
      >
        <Ionicons
          name="chatbubble-ellipses-outline"
          size={32}
          color={Colors.textTertiary}
        />
      </GlassSurface>

      <Text style={styles.emptyTitle}>
        گفتگویی پیدا نشد
      </Text>

      <Text style={styles.emptySubtitle}>
        عبارت جستجو را تغییر دهید یا دوباره تلاش کنید.
      </Text>

      <Pressable
        accessibilityRole="button"
        onPress={onClear}
        style={({ pressed }) => [
          styles.emptyAction,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.emptyActionText}>
          پاک کردن جستجو
        </Text>
      </Pressable>
    </View>
  );
}

function getBookingStatus(
  status: NonNullable<Conversation["bookingStatus"]>,
) {
  if (status === "confirmed") {
    return {
      label: "تأییدشده",
      color: Colors.primary,
      backgroundColor: Colors.primarySoft,
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  scrollContent: {
    width: "100%",
    maxWidth: Layout.contentMaxWidth,
    alignSelf: "center",
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.lg,
    paddingBottom: 130,
  },

  header: {
    width: "100%",
    alignItems: "flex-end",
    gap: Spacing.sm,
  },

  headerTopRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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

  headerIconSurface: {
    width: 48,
    height: 48,
  },

  headerIconContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  headerUnreadBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.error,
    borderWidth: 1.5,
    borderColor: Colors.backgroundRaised,
  },

  headerUnreadText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: "700",
  },

  searchSurface: {
    width: "100%",
    marginTop: Spacing.xxl,
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

  sectionHeader: {
    width: "100%",
    marginTop: Spacing.section,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    ...Typography.sectionTitle,
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 21,
    lineHeight: 28,
  },

  conversationCount: {
    ...Typography.captionStyle,
    color: Colors.textTertiary,
    textAlign: "right",
    writingDirection: "rtl",
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

  conversationSurface: {
    width: "100%",
  },

  unreadConversationSurface: {
    borderColor: "rgba(76, 141, 255, 0.42)",
    backgroundColor: "rgba(76, 141, 255, 0.07)",
  },

  conversationContent: {
    minHeight: 116,
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: Spacing.md,
    padding: Spacing.lg,
  },

  avatarWrapper: {
    width: 58,
    height: 58,
    flexShrink: 0,
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primarySoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(76, 141, 255, 0.28)",
  },

  supportAvatar: {
    backgroundColor: "rgba(86, 183, 201, 0.12)",
    borderColor: "rgba(86, 183, 201, 0.26)",
  },

  avatarInitials: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: "700",
  },

  onlineDot: {
    position: "absolute",
    right: 1,
    bottom: 1,
    width: 14,
    height: 14,
    borderRadius: Radius.pill,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.backgroundRaised,
  },

  verifiedBadge: {
    position: "absolute",
    left: -1,
    bottom: -1,
    width: 19,
    height: 19,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.backgroundRaised,
  },

  conversationCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: Spacing.sm,
  },

  nameRow: {
    width: "100%",
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.md,
  },

  nameBlock: {
    flex: 1,
    alignItems: "flex-end",
    gap: 2,
  },

  name: {
    ...Typography.sectionTitle,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 18,
    lineHeight: 24,
  },

  role: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textTertiary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  metaBlock: {
    flexShrink: 0,
    alignItems: "flex-start",
    gap: Spacing.xs,
  },

  time: {
    ...Typography.captionStyle,
    color: Colors.textTertiary,
    fontSize: 11,
  },

  unreadBadge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
  },

  unreadText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: "700",
  },

  bookingContext: {
    width: "100%",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.xs,
  },

  bookingService: {
    ...Typography.captionStyle,
    flex: 1,
    color: Colors.primary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  bookingStatusBadge: {
    flexShrink: 0,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },

  bookingStatusText: {
    ...Typography.captionStyle,
    fontSize: 10,
    textAlign: "center",
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

  unreadLastMessage: {
    color: Colors.textPrimary,
    fontWeight: "500",
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
    maxWidth: 340,
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

  pressed: {
    opacity: 0.82,
  },

  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.993 }],
  },
});