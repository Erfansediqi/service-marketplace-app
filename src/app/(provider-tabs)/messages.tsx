import { Ionicons } from "@expo/vector-icons";
import {
  ComponentProps,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  Fonts,
  KhedmatPalette,
  Layout,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "../../constants/theme";
import {
  BookingRecord,
  BookingStatus,
  useBooking,
} from "../../context/booking-context";
import { useLanguage } from "../../context/languagecontext";
import { useActiveProvider } from "../../hooks/use-active-provider";

type IconName =
  ComponentProps<typeof Ionicons>["name"];

type LanguageName =
  | "English"
  | "Dari"
  | "Pashto";

type ConversationFilter =
  | "all"
  | "unread"
  | "active"
  | "archived";

type LocalizedText = {
  English: string;
  Dari: string;
  Pashto: string;
};

type MessageSender =
  | "provider"
  | "customer";

type ConversationMessage = {
  id: string;
  sender: MessageSender;
  text: string;
  time: string;
  read: boolean;
};

type Conversation = {
  id: string;
  bookingId: string;
  customerName: string;
  customerInitials: string;
  serviceName: string;
  serviceId: string;
  addressLabel: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  online: boolean;
  archived: boolean;
  bookingStatus: BookingStatus;
  messages: ConversationMessage[];
};

type FilterDefinition = {
  id: ConversationFilter;
  icon: IconName;
};

type MessagesCopy = ReturnType<
  typeof getMessagesCopy
>;

const SUCCESS = "#268A57";
const SUCCESS_SOFT = "#E8F6EE";

const WARNING = "#8A5A00";
const WARNING_SOFT = "#FFF4D6";

const ERROR = "#B3261E";
const ERROR_SOFT = "#FCE8E6";

const INFO_SOFT = "#E5F4F8";

const FILTERS: FilterDefinition[] = [
  {
    id: "all",
    icon: "chatbubbles-outline",
  },
  {
    id: "unread",
    icon: "mail-unread-outline",
  },
  {
    id: "active",
    icon: "briefcase-outline",
  },
  {
    id: "archived",
    icon: "archive-outline",
  },
];

const CUSTOMER_NAMES: LocalizedText[] = [
  {
    English: "Ahmad Zahir",
    Dari: "احمد ظاهر",
    Pashto: "احمد ظاهر",
  },
  {
    English: "Maryam Ahmadi",
    Dari: "مریم احمدی",
    Pashto: "مریم احمدي",
  },
  {
    English: "Mohammad Salim",
    Dari: "محمد سلیم",
    Pashto: "محمد سلیم",
  },
  {
    English: "Fatima Rahimi",
    Dari: "فاطمه رحیمی",
    Pashto: "فاطمه رحیمي",
  },
  {
    English: "Omid Safi",
    Dari: "امید صافی",
    Pashto: "امید صافي",
  },
];

export default function ProviderMessagesScreen() {
  const { bookings } =
    useBooking();

  const { language } =
    useLanguage();

  const activeLanguage =
    normalizeLanguage(language);

  const isRtl =
    activeLanguage === "Dari" ||
    activeLanguage === "Pashto";

  const localizedDigits =
    activeLanguage !== "English";

  const copy =
    getMessagesCopy(
      activeLanguage,
    );

  const { provider } =
  useActiveProvider();

 const providerId =
  provider?.id ?? null;

  const generatedConversations =
    useMemo(
      () =>
        createConversations(
          bookings.filter(
            (booking) =>
              booking.providerId ===
              providerId,
          ),
          activeLanguage,
        ),
      [
        activeLanguage,
        bookings,
        providerId,
      ],
    );

  const [
    conversationOverrides,
    setConversationOverrides,
  ] = useState<
    Record<
      string,
      Partial<Conversation>
    >
  >({});

  const [query, setQuery] =
    useState("");

  const [
    selectedFilter,
    setSelectedFilter,
  ] = useState<ConversationFilter>(
    "all",
  );

  const [
    selectedConversationId,
    setSelectedConversationId,
  ] = useState<string | null>(
    null,
  );

  const [
    draftMessage,
    setDraftMessage,
  ] = useState("");

  const messagesScrollRef =
    useRef<ScrollView>(null);

  const conversations =
    useMemo(
      () =>
        generatedConversations.map(
          (conversation) => ({
            ...conversation,
            ...conversationOverrides[
              conversation.id
            ],
          }),
        ),
      [
        conversationOverrides,
        generatedConversations,
      ],
    );

  const filteredConversations =
    useMemo(() => {
      const normalizedQuery =
        query
          .trim()
          .toLocaleLowerCase();

      return conversations.filter(
        (conversation) => {
          if (
            selectedFilter ===
              "unread" &&
            conversation.unreadCount ===
              0
          ) {
            return false;
          }

          if (
            selectedFilter ===
              "active" &&
            !isActiveBookingStatus(
              conversation.bookingStatus,
            )
          ) {
            return false;
          }

          if (
            selectedFilter ===
              "archived" &&
            !conversation.archived
          ) {
            return false;
          }

          if (
            selectedFilter !==
              "archived" &&
            conversation.archived
          ) {
            return false;
          }

          if (!normalizedQuery) {
            return true;
          }

          return [
            conversation.customerName,
            conversation.serviceName,
            conversation.lastMessage,
            conversation.addressLabel,
          ]
            .join(" ")
            .toLocaleLowerCase()
            .includes(
              normalizedQuery,
            );
        },
      );
    }, [
      conversations,
      query,
      selectedFilter,
    ]);

  const selectedConversation =
    conversations.find(
      (conversation) =>
        conversation.id ===
        selectedConversationId,
    ) ?? null;

  const counts = useMemo(
    () => ({
      all: conversations.filter(
        (conversation) =>
          !conversation.archived,
      ).length,

      unread:
        conversations.filter(
          (conversation) =>
            !conversation.archived &&
            conversation.unreadCount >
              0,
        ).length,

      active:
        conversations.filter(
          (conversation) =>
            !conversation.archived &&
            isActiveBookingStatus(
              conversation.bookingStatus,
            ),
        ).length,

      archived:
        conversations.filter(
          (conversation) =>
            conversation.archived,
        ).length,
    }),
    [conversations],
  );

  const unreadTotal =
    conversations.reduce(
      (total, conversation) =>
        total +
        conversation.unreadCount,
      0,
    );

  const openConversation = (
    conversation: Conversation,
  ) => {
    setConversationOverrides(
      (current) => ({
        ...current,

        [conversation.id]: {
          ...current[
            conversation.id
          ],

          unreadCount: 0,

          messages:
            conversation.messages.map(
              (message) => ({
                ...message,
                read: true,
              }),
            ),
        },
      }),
    );

    setSelectedConversationId(
      conversation.id,
    );

    setDraftMessage("");
  };

  const closeConversation = () => {
    setSelectedConversationId(
      null,
    );

    setDraftMessage("");
  };

  const toggleArchive = (
    conversation: Conversation,
  ) => {
    setConversationOverrides(
      (current) => ({
        ...current,

        [conversation.id]: {
          ...current[
            conversation.id
          ],

          archived:
            !conversation.archived,
        },
      }),
    );

    if (
      selectedConversationId ===
      conversation.id
    ) {
      closeConversation();
    }
  };

  const sendMessage = () => {
    const cleanMessage =
      draftMessage.trim();

    if (
      !cleanMessage ||
      !selectedConversation
    ) {
      return;
    }

    const time =
      formatCurrentTime(
        activeLanguage,
      );

    const newMessage: ConversationMessage =
      {
        id: `message-${Date.now()}`,
        sender: "provider",
        text: cleanMessage,
        time,
        read: true,
      };

    const nextMessages = [
      ...selectedConversation.messages,
      newMessage,
    ];

    setConversationOverrides(
      (current) => ({
        ...current,

        [selectedConversation.id]: {
          ...current[
            selectedConversation.id
          ],

          messages:
            nextMessages,

          lastMessage:
            cleanMessage,

          lastMessageAt:
            new Date().toISOString(),

          unreadCount: 0,
        },
      }),
    );

    setDraftMessage("");

    requestAnimationFrame(() => {
      messagesScrollRef.current?.scrollToEnd(
        {
          animated: true,
        },
      );
    });
  };

  if (selectedConversation) {
    return (
      <ConversationView
        conversation={
          selectedConversation
        }
        language={
          activeLanguage
        }
        isRtl={isRtl}
        copy={copy}
        draftMessage={
          draftMessage
        }
        scrollRef={
          messagesScrollRef
        }
        onChangeDraft={
          setDraftMessage
        }
        onBack={
          closeConversation
        }
        onSend={sendMessage}
        onArchive={() =>
          toggleArchive(
            selectedConversation,
          )
        }
      />
    );
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <View
          style={[
            styles.headerTopRow,
            {
              flexDirection: isRtl
                ? "row-reverse"
                : "row",
            },
          ]}
        >
          <View
            style={[
              styles.headerCopy,
              {
                alignItems: isRtl
                  ? "flex-end"
                  : "flex-start",
              },
            ]}
          >
            <Text
              style={[
                styles.eyebrow,
                directionStyle(isRtl),
              ]}
            >
              {copy.eyebrow}
            </Text>

            <Text
              style={[
                styles.title,
                directionStyle(isRtl),
              ]}
            >
              {copy.title}
            </Text>
          </View>

          <View
            style={
              styles.headerIcon
            }
          >
            <Ionicons
              name="chatbubbles-outline"
              size={24}
              color={
                KhedmatPalette.blue500
              }
            />

            {unreadTotal > 0 ? (
              <View
                style={
                  styles.headerBadge
                }
              >
                <Text
                  style={
                    styles.headerBadgeText
                  }
                >
                  {formatDigits(
                    unreadTotal.toString(),
                    localizedDigits,
                  )}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <Text
          style={[
            styles.subtitle,
            directionStyle(isRtl),
          ]}
        >
          {copy.subtitle}
        </Text>

        <View
          style={[
            styles.searchBox,
            {
              flexDirection: isRtl
                ? "row-reverse"
                : "row",
            },
          ]}
        >
          <Ionicons
            name="search-outline"
            size={21}
            color={
              KhedmatPalette.blue500
            }
          />

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={
              copy.searchPlaceholder
            }
            placeholderTextColor={
              KhedmatPalette.textMuted
            }
            selectionColor={
              KhedmatPalette.blue500
            }
            returnKeyType="search"
            style={[
              styles.searchInput,
              directionStyle(isRtl),
            ]}
          />

          {query.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                copy.clearSearch
              }
              hitSlop={8}
              onPress={() =>
                setQuery("")
              }
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={
                  KhedmatPalette.textMuted
                }
              />
            </Pressable>
          ) : null}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.filtersRow
          }
          style={{
            direction: isRtl
              ? "rtl"
              : "ltr",
          }}
        >
          {FILTERS.map(
            (filter) => {
              const selected =
                selectedFilter ===
                filter.id;

              return (
                <Pressable
                  key={filter.id}
                  accessibilityRole="button"
                  accessibilityState={{
                    selected,
                  }}
                  accessibilityLabel={getFilterLabel(
                    filter.id,
                    activeLanguage,
                  )}
                  onPress={() =>
                    setSelectedFilter(
                      filter.id,
                    )
                  }
                  style={({ pressed }) => [
                    styles.filterChip,
                    selected &&
                      styles.filterChipSelected,
                    pressed &&
                      styles.pressed,
                  ]}
                >
                  <Ionicons
                    name={filter.icon}
                    size={17}
                    color={
                      selected
                        ? KhedmatPalette
                            .white
                        : KhedmatPalette
                            .navy700
                    }
                  />

                  <Text
                    style={[
                      styles.filterText,
                      selected &&
                        styles.filterTextSelected,
                      directionStyle(
                        isRtl,
                      ),
                    ]}
                  >
                    {getFilterLabel(
                      filter.id,
                      activeLanguage,
                    )}
                  </Text>

                  <View
                    style={[
                      styles.filterCount,
                      selected &&
                        styles.filterCountSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterCountText,
                        selected &&
                          styles.filterCountTextSelected,
                      ]}
                    >
                      {formatDigits(
                        counts[
                          filter.id
                        ].toString(),
                        localizedDigits,
                      )}
                    </Text>
                  </View>
                </Pressable>
              );
            },
          )}
        </ScrollView>

        <View
          style={[
            styles.resultsHeader,
            {
              flexDirection: isRtl
                ? "row-reverse"
                : "row",
            },
          ]}
        >
          <View
            style={[
              styles.resultsCopy,
              {
                alignItems: isRtl
                  ? "flex-end"
                  : "flex-start",
              },
            ]}
          >
            <Text
              style={[
                styles.resultsTitle,
                directionStyle(isRtl),
              ]}
            >
              {getFilterTitle(
                selectedFilter,
                activeLanguage,
              )}
            </Text>

            <Text
              style={[
                styles.resultsSubtitle,
                directionStyle(isRtl),
              ]}
            >
              {copy.resultCount(
                formatDigits(
                  filteredConversations.length.toString(),
                  localizedDigits,
                ),
              )}
            </Text>
          </View>

          <View
            style={
              styles.resultsIcon
            }
          >
            <Ionicons
              name="people-outline"
              size={21}
              color={
                KhedmatPalette.blue500
              }
            />
          </View>
        </View>

        <View
          style={
            styles.conversationsList
          }
        >
          {filteredConversations.map(
            (conversation) => (
              <ConversationCard
                key={
                  conversation.id
                }
                conversation={
                  conversation
                }
                language={
                  activeLanguage
                }
                isRtl={isRtl}
                copy={copy}
                onPress={() =>
                  openConversation(
                    conversation,
                  )
                }
                onArchive={() =>
                  toggleArchive(
                    conversation,
                  )
                }
              />
            ),
          )}

          {filteredConversations.length ===
          0 ? (
            <EmptyMessages
              filter={
                selectedFilter
              }
              hasQuery={
                query.trim().length >
                0
              }
              language={
                activeLanguage
              }
              isRtl={isRtl}
              copy={copy}
              onClear={() => {
                setQuery("");
                setSelectedFilter(
                  "all",
                );
              }}
            />
          ) : null}
        </View>

        <View
          style={[
            styles.noticeCard,
            {
              flexDirection: isRtl
                ? "row-reverse"
                : "row",
            },
          ]}
        >
          <View
            style={styles.noticeIcon}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={22}
              color={
                KhedmatPalette.blue500
              }
            />
          </View>

          <View
            style={[
              styles.noticeCopy,
              {
                alignItems: isRtl
                  ? "flex-end"
                  : "flex-start",
              },
            ]}
          >
            <Text
              style={[
                styles.noticeTitle,
                directionStyle(isRtl),
              ]}
            >
              {copy.noticeTitle}
            </Text>

            <Text
              style={[
                styles.noticeText,
                directionStyle(isRtl),
              ]}
            >
              {copy.noticeText}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type ConversationCardProps = {
  conversation: Conversation;
  language: LanguageName;
  isRtl: boolean;
  copy: MessagesCopy;
  onPress: () => void;
  onArchive: () => void;
};

function ConversationCard({
  conversation,
  language,
  isRtl,
  copy,
  onPress,
  onArchive,
}: ConversationCardProps) {
  const status =
    getBookingStatusConfig(
      conversation.bookingStatus,
      language,
    );

  const hasUnread =
    conversation.unreadCount >
    0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${copy.conversationWith} ${conversation.customerName}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.conversationCard,
        hasUnread &&
          styles.unreadConversationCard,
        pressed &&
          styles.cardPressed,
      ]}
    >
      <View
        style={[
          styles.conversationTopRow,
          {
            flexDirection: isRtl
              ? "row-reverse"
              : "row",
          },
        ]}
      >
        <View
          style={
            styles.avatarWrapper
          }
        >
          <View
            style={styles.avatar}
          >
            <Text
              style={
                styles.avatarText
              }
            >
              {
                conversation.customerInitials
              }
            </Text>
          </View>

          {conversation.online ? (
            <View
              style={
                styles.onlineIndicator
              }
            />
          ) : null}
        </View>

        <View
          style={[
            styles.conversationCopy,
            {
              alignItems: isRtl
                ? "flex-end"
                : "flex-start",
            },
          ]}
        >
          <View
            style={[
              styles.nameRow,
              {
                flexDirection: isRtl
                  ? "row-reverse"
                  : "row",
              },
            ]}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.customerName,
                directionStyle(isRtl),
              ]}
            >
              {
                conversation.customerName
              }
            </Text>

            <Text
              style={[
                styles.messageTime,
                directionStyle(isRtl),
              ]}
            >
              {formatRelativeTime(
                conversation.lastMessageAt,
                language,
              )}
            </Text>
          </View>

          <View
            style={[
              styles.serviceRow,
              {
                flexDirection: isRtl
                  ? "row-reverse"
                  : "row",
              },
            ]}
          >
            <Ionicons
              name={getServiceIcon(
                conversation.serviceId,
              )}
              size={14}
              color={
                KhedmatPalette.blue500
              }
            />

            <Text
              numberOfLines={1}
              style={[
                styles.serviceName,
                directionStyle(isRtl),
              ]}
            >
              {
                conversation.serviceName
              }
            </Text>

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
                    color:
                      status.color,
                  },
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {status.label}
              </Text>
            </View>
          </View>

          <Text
            numberOfLines={2}
            style={[
              styles.lastMessage,
              hasUnread &&
                styles.unreadLastMessage,
              directionStyle(isRtl),
            ]}
          >
            {
              conversation.lastMessage
            }
          </Text>
        </View>

        <View
          style={
            styles.cardSideColumn
          }
        >
          {hasUnread ? (
            <View
              style={
                styles.unreadBadge
              }
            >
              <Text
                style={
                  styles.unreadBadgeText
                }
              >
                {formatDigits(
                  conversation.unreadCount.toString(),
                  language !==
                    "English",
                )}
              </Text>
            </View>
          ) : (
            <Ionicons
              name="checkmark-done-outline"
              size={18}
              color={
                KhedmatPalette.textMuted
              }
            />
          )}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              conversation.archived
                ? copy.restore
                : copy.archive
            }
            hitSlop={8}
            onPress={(event) => {
              event.stopPropagation();
              onArchive();
            }}
            style={({ pressed }) => [
              styles.archiveButton,
              pressed &&
                styles.pressed,
            ]}
          >
            <Ionicons
              name={
                conversation.archived
                  ? "arrow-undo-outline"
                  : "archive-outline"
              }
              size={17}
              color={
                KhedmatPalette.textMuted
              }
            />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

type ConversationViewProps = {
  conversation: Conversation;
  language: LanguageName;
  isRtl: boolean;
  copy: MessagesCopy;
  draftMessage: string;
  scrollRef:
    React.RefObject<ScrollView | null>;
  onChangeDraft: (
    value: string,
  ) => void;
  onBack: () => void;
  onSend: () => void;
  onArchive: () => void;
};

function ConversationView({
  conversation,
  language,
  isRtl,
  copy,
  draftMessage,
  scrollRef,
  onChangeDraft,
  onBack,
  onSend,
  onArchive,
}: ConversationViewProps) {
  const status =
    getBookingStatusConfig(
      conversation.bookingStatus,
      language,
    );

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <KeyboardAvoidingView
        style={styles.chatRoot}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
        keyboardVerticalOffset={
          Platform.OS === "ios"
            ? 8
            : 0
        }
      >
        <View
          style={[
            styles.chatHeader,
            {
              flexDirection: isRtl
                ? "row-reverse"
                : "row",
            },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              copy.back
            }
            onPress={onBack}
            style={({ pressed }) => [
              styles.backButton,
              pressed &&
                styles.pressed,
            ]}
          >
            <Ionicons
              name={
                isRtl
                  ? "chevron-forward"
                  : "chevron-back"
              }
              size={24}
              color={
                KhedmatPalette.navy900
              }
            />
          </Pressable>

          <View
            style={
              styles.chatAvatarWrapper
            }
          >
            <View
              style={
                styles.chatAvatar
              }
            >
              <Text
                style={
                  styles.chatAvatarText
                }
              >
                {
                  conversation.customerInitials
                }
              </Text>
            </View>

            {conversation.online ? (
              <View
                style={
                  styles.chatOnlineIndicator
                }
              />
            ) : null}
          </View>

          <View
            style={[
              styles.chatHeaderCopy,
              {
                alignItems: isRtl
                  ? "flex-end"
                  : "flex-start",
              },
            ]}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.chatCustomerName,
                directionStyle(isRtl),
              ]}
            >
              {
                conversation.customerName
              }
            </Text>

            <Text
              style={[
                styles.chatPresence,
                directionStyle(isRtl),
              ]}
            >
              {conversation.online
                ? copy.online
                : copy.offline}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              conversation.archived
                ? copy.restore
                : copy.archive
            }
            onPress={onArchive}
            style={({ pressed }) => [
              styles.chatArchiveButton,
              pressed &&
                styles.pressed,
            ]}
          >
            <Ionicons
              name={
                conversation.archived
                  ? "arrow-undo-outline"
                  : "archive-outline"
              }
              size={20}
              color={
                KhedmatPalette.navy700
              }
            />
          </Pressable>
        </View>

        <View
          style={
            styles.bookingContextCard
          }
        >
          <View
            style={[
              styles.bookingContextRow,
              {
                flexDirection: isRtl
                  ? "row-reverse"
                  : "row",
              },
            ]}
          >
            <View
              style={
                styles.bookingContextIcon
              }
            >
              <Ionicons
                name={getServiceIcon(
                  conversation.serviceId,
                )}
                size={19}
                color={
                  KhedmatPalette.blue500
                }
              />
            </View>

            <View
              style={[
                styles.bookingContextCopy,
                {
                  alignItems: isRtl
                    ? "flex-end"
                    : "flex-start",
                },
              ]}
            >
              <Text
                style={[
                  styles.bookingContextLabel,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {copy.relatedBooking}
              </Text>

              <Text
                numberOfLines={1}
                style={[
                  styles.bookingContextTitle,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {
                  conversation.serviceName
                }
              </Text>

              <Text
                numberOfLines={1}
                style={[
                  styles.bookingContextAddress,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {
                  conversation.addressLabel
                }
              </Text>
            </View>

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
                    color:
                      status.color,
                  },
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {status.label}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            styles.messagesContent
          }
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd(
              {
                animated: false,
              },
            )
          }
        >
          <View
            style={
              styles.dayDivider
            }
          >
            <View
              style={
                styles.dayDividerLine
              }
            />

            <Text
              style={
                styles.dayDividerText
              }
            >
              {copy.today}
            </Text>

            <View
              style={
                styles.dayDividerLine
              }
            />
          </View>

          {conversation.messages.map(
            (message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isRtl={isRtl}
                copy={copy}
              />
            ),
          )}
        </ScrollView>

        <View
          style={[
            styles.composer,
            {
              flexDirection: isRtl
                ? "row-reverse"
                : "row",
            },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              copy.attachment
            }
            style={({ pressed }) => [
              styles.attachmentButton,
              pressed &&
                styles.pressed,
            ]}
          >
            <Ionicons
              name="add"
              size={25}
              color={
                KhedmatPalette.navy700
              }
            />
          </Pressable>

          <View
            style={
              styles.composerInputBox
            }
          >
            <TextInput
              value={draftMessage}
              onChangeText={
                onChangeDraft
              }
              placeholder={
                copy.messagePlaceholder
              }
              placeholderTextColor={
                KhedmatPalette.textMuted
              }
              selectionColor={
                KhedmatPalette.blue500
              }
              multiline
              maxLength={1000}
              style={[
                styles.composerInput,
                directionStyle(isRtl),
              ]}
            />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              copy.send
            }
            disabled={
              draftMessage.trim()
                .length === 0
            }
            onPress={onSend}
            style={({ pressed }) => [
              styles.sendButton,
              draftMessage.trim()
                .length === 0 &&
                styles.sendButtonDisabled,
              pressed &&
                draftMessage.trim()
                  .length > 0 &&
                styles.sendButtonPressed,
            ]}
          >
            <Ionicons
              name="send"
              size={19}
              color={
                KhedmatPalette.white
              }
              style={{
                transform: [
                  {
                    rotate: isRtl
                      ? "180deg"
                      : "0deg",
                  },
                ],
              }}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type MessageBubbleProps = {
  message: ConversationMessage;
  isRtl: boolean;
  copy: MessagesCopy;
};

function MessageBubble({
  message,
  isRtl,
  copy,
}: MessageBubbleProps) {
  const outgoing =
    message.sender ===
    "provider";

  return (
    <View
      style={[
        styles.messageRow,
        outgoing
          ? styles.outgoingMessageRow
          : styles.incomingMessageRow,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          outgoing
            ? styles.outgoingMessageBubble
            : styles.incomingMessageBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            outgoing
              ? styles.outgoingMessageText
              : styles.incomingMessageText,
            directionStyle(isRtl),
          ]}
        >
          {message.text}
        </Text>

        <View
          style={[
            styles.messageMeta,
            {
              flexDirection: isRtl
                ? "row-reverse"
                : "row",
            },
          ]}
        >
          <Text
            style={[
              styles.messageBubbleTime,
              outgoing
                ? styles.outgoingMessageTime
                : styles.incomingMessageTime,
            ]}
          >
            {message.time}
          </Text>

          {outgoing ? (
            <Ionicons
              name={
                message.read
                  ? "checkmark-done"
                  : "checkmark"
              }
              size={14}
              color={
                message.read
                  ? KhedmatPalette.blue200
                  : "rgba(255,255,255,0.68)"
              }
              accessibilityLabel={
                message.read
                  ? copy.read
                  : copy.sent
              }
            />
          ) : null}
        </View>
      </View>
    </View>
  );
}

type EmptyMessagesProps = {
  filter: ConversationFilter;
  hasQuery: boolean;
  language: LanguageName;
  isRtl: boolean;
  copy: MessagesCopy;
  onClear: () => void;
};

function EmptyMessages({
  filter,
  hasQuery,
  language,
  isRtl,
  copy,
  onClear,
}: EmptyMessagesProps) {
  return (
    <View style={styles.emptyState}>
      <View
        style={
          styles.emptyIconContainer
        }
      >
        <Ionicons
          name={
            hasQuery
              ? "search-outline"
              : "chatbubbles-outline"
          }
          size={34}
          color={
            KhedmatPalette.blue500
          }
        />
      </View>

      <Text
        style={[
          styles.emptyTitle,
          directionStyle(isRtl),
        ]}
      >
        {hasQuery
          ? copy.noSearchResults
          : getEmptyTitle(
              filter,
              language,
            )}
      </Text>

      <Text
        style={[
          styles.emptySubtitle,
          directionStyle(isRtl),
        ]}
      >
        {hasQuery
          ? copy.noSearchResultsSubtitle
          : getEmptySubtitle(
              filter,
              language,
            )}
      </Text>

      {(hasQuery ||
        filter !== "all") ? (
        <Pressable
          accessibilityRole="button"
          onPress={onClear}
          style={({ pressed }) => [
            styles.emptyAction,
            pressed &&
              styles.pressed,
          ]}
        >
          <Text
            style={[
              styles.emptyActionText,
              directionStyle(isRtl),
            ]}
          >
            {copy.showAll}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function createConversations(
  bookings: BookingRecord[],
  language: LanguageName,
): Conversation[] {
  return bookings
    .filter(
      (booking) =>
        booking.status !==
        "cancelled",
    )
    .map((booking, index) => {
      const customerName =
        CUSTOMER_NAMES[
          index %
            CUSTOMER_NAMES.length
        ][language];

      const messages =
        createInitialMessages(
          booking,
          language,
          index,
        );

      const lastMessage =
        messages[
          messages.length - 1
        ];

      return {
        id: `conversation-${booking.id}`,
        bookingId: booking.id,
        customerName,
        customerInitials:
          getInitials(
            customerName,
          ),
        serviceName:
          booking.serviceName,
        serviceId:
          booking.serviceId,
        addressLabel:
          booking.address.label,
        lastMessage:
          lastMessage.text,
        lastMessageAt:
          getConversationTimestamp(
            booking.createdAt,
            index,
          ),
        unreadCount:
          booking.status ===
          "pending"
            ? 1
            : booking.status ===
                  "confirmed" &&
                index % 2 === 0
              ? 2
              : 0,
        online: index % 3 !== 2,
        archived:
          booking.status ===
            "completed" &&
          index % 2 === 1,
        bookingStatus:
          booking.status,
        messages,
      };
    })
    .sort(
      (first, second) =>
        new Date(
          second.lastMessageAt,
        ).getTime() -
        new Date(
          first.lastMessageAt,
        ).getTime(),
    );
}

function createInitialMessages(
  booking: BookingRecord,
  language: LanguageName,
  index: number,
): ConversationMessage[] {
  const timeOne =
    language === "English"
      ? "09:20"
      : "۰۹:۲۰";

  const timeTwo =
    language === "English"
      ? "09:32"
      : "۰۹:۳۲";

  const timeThree =
    language === "English"
      ? "09:38"
      : "۰۹:۳۸";

  const intro =
    getInitialMessageCopy(
      language,
    );

  const messages: ConversationMessage[] =
    [
      {
        id: `${booking.id}-1`,
        sender: "customer",
        text:
          booking.notes?.trim() ||
          intro.customerRequest(
            booking.serviceName,
          ),
        time: timeOne,
        read: true,
      },
      {
        id: `${booking.id}-2`,
        sender: "provider",
        text:
          intro.providerReply,
        time: timeTwo,
        read: true,
      },
    ];

  if (
    booking.status ===
      "confirmed" ||
    booking.status ===
      "in-progress"
  ) {
    messages.push({
      id: `${booking.id}-3`,
      sender: "customer",
      text:
        intro.confirmedReply,
      time: timeThree,
      read: index % 2 !== 0,
    });
  }

  if (
    booking.status ===
    "completed"
  ) {
    messages.push({
      id: `${booking.id}-3`,
      sender: "customer",
      text:
        intro.completedReply,
      time: timeThree,
      read: true,
    });
  }

  return messages;
}

function getInitialMessageCopy(
  language: LanguageName,
) {
  if (language === "Dari") {
    return {
      customerRequest:
        (service: string) =>
          `سلام، دربارهٔ خدمت «${service}» معلومات بیشتر می‌خواستم.`,

      providerReply:
        "سلام، درخواست شما را دریافت کردم. لطفاً جزئیات مشکل را بفرستید.",

      confirmedReply:
        "تشکر. زمان تأییدشده برای من مناسب است.",

      completedReply:
        "تشکر، کار به‌خوبی انجام شد.",
    };
  }

  if (language === "Pashto") {
    return {
      customerRequest:
        (service: string) =>
          `سلام، زه د «${service}» خدمت په اړه نور معلومات غواړم.`,

      providerReply:
        "سلام، ستاسو غوښتنه مې ترلاسه کړه. مهرباني وکړئ د ستونزې تفصیل راولېږئ.",

      confirmedReply:
        "مننه. تایید شوی وخت زما لپاره مناسب دی.",

      completedReply:
        "مننه، کار په ښه ډول بشپړ شو.",
    };
  }

  return {
    customerRequest:
      (service: string) =>
        `Hello, I would like more information about “${service}”.`,

    providerReply:
      "Hello, I received your request. Please send more details about the issue.",

    confirmedReply:
      "Thank you. The confirmed time works for me.",

    completedReply:
      "Thank you, the work was completed successfully.",
  };
}

function getBookingStatusConfig(
  status: BookingStatus,
  language: LanguageName,
) {
  const labels =
    getStatusLabels(language);

  if (
    status === "confirmed"
  ) {
    return {
      label: labels.confirmed,
      color:
        KhedmatPalette.blue500,
      backgroundColor:
        INFO_SOFT,
    };
  }

  if (
    status === "in-progress"
  ) {
    return {
      label:
        labels.inProgress,
      color:
        KhedmatPalette.navy700,
      backgroundColor:
        KhedmatPalette.blue050,
    };
  }

  if (
    status === "completed"
  ) {
    return {
      label: labels.completed,
      color: SUCCESS,
      backgroundColor:
        SUCCESS_SOFT,
    };
  }

  if (
    status === "cancelled"
  ) {
    return {
      label: labels.cancelled,
      color: ERROR,
      backgroundColor:
        ERROR_SOFT,
    };
  }

  return {
    label: labels.pending,
    color: WARNING,
    backgroundColor:
      WARNING_SOFT,
  };
}

function getStatusLabels(
  language: LanguageName,
) {
  if (language === "Dari") {
    return {
      pending: "در انتظار",
      confirmed: "تأییدشده",
      inProgress:
        "در حال انجام",
      completed:
        "تکمیل‌شده",
      cancelled: "لغوشده",
    };
  }

  if (language === "Pashto") {
    return {
      pending: "په تمه",
      confirmed:
        "تایید شوی",
      inProgress: "روان",
      completed:
        "بشپړ شوی",
      cancelled:
        "لغوه شوی",
    };
  }

  return {
    pending: "Pending",
    confirmed: "Confirmed",
    inProgress: "In progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };
}

function getFilterLabel(
  filter: ConversationFilter,
  language: LanguageName,
): string {
  if (language === "Dari") {
    return {
      all: "همه",
      unread: "خوانده‌نشده",
      active: "فعال",
      archived: "آرشیف",
    }[filter];
  }

  if (language === "Pashto") {
    return {
      all: "ټول",
      unread: "نا لوستل شوي",
      active: "فعال",
      archived: "آرشیف",
    }[filter];
  }

  return {
    all: "All",
    unread: "Unread",
    active: "Active",
    archived: "Archived",
  }[filter];
}

function getFilterTitle(
  filter: ConversationFilter,
  language: LanguageName,
): string {
  if (language === "Dari") {
    return {
      all: "گفتگوهای اخیر",
      unread:
        "پیام‌های خوانده‌نشده",
      active:
        "گفتگوهای کارهای فعال",
      archived:
        "گفتگوهای آرشیف‌شده",
    }[filter];
  }

  if (language === "Pashto") {
    return {
      all: "وروستۍ خبرې",
      unread:
        "نا لوستل شوي پیغامونه",
      active:
        "د فعالو کارونو خبرې",
      archived:
        "آرشیف شوې خبرې",
    }[filter];
  }

  return {
    all: "Recent conversations",
    unread: "Unread messages",
    active:
      "Active-job conversations",
    archived:
      "Archived conversations",
  }[filter];
}

function getEmptyTitle(
  filter: ConversationFilter,
  language: LanguageName,
): string {
  if (language === "Dari") {
    return {
      all: "هنوز گفتگویی ندارید",
      unread:
        "پیام خوانده‌نشده‌ای ندارید",
      active:
        "گفتگوی فعال موجود نیست",
      archived:
        "آرشیف شما خالی است",
    }[filter];
  }

  if (language === "Pashto") {
    return {
      all: "تر اوسه خبرې نه لرئ",
      unread:
        "نا لوستل شوی پیغام نشته",
      active:
        "فعاله خبرې نشته",
      archived:
        "ستاسو آرشیف تش دی",
    }[filter];
  }

  return {
    all: "No conversations yet",
    unread: "No unread messages",
    active:
      "No active conversations",
    archived:
      "Your archive is empty",
  }[filter];
}

function getEmptySubtitle(
  filter: ConversationFilter,
  language: LanguageName,
): string {
  if (language === "Dari") {
    return {
      all:
        "پس از دریافت درخواست مشتری، گفتگوهای مربوط به آن در اینجا نمایش داده می‌شوند.",
      unread:
        "همهٔ پیام‌های مشتریان را خوانده‌اید.",
      active:
        "گفتگوهای مربوط به کارهای تأییدشده یا در حال انجام در این بخش قرار می‌گیرند.",
      archived:
        "گفتگوهایی که آرشیف می‌کنید در این قسمت نمایش داده می‌شوند.",
    }[filter];
  }

  if (language === "Pashto") {
    return {
      all:
        "کله چې د پیرودونکي غوښتنه ترلاسه کړئ، اړوند خبرې به دلته ښکاره شي.",
      unread:
        "تاسو د پیرودونکو ټول پیغامونه لوستي دي.",
      active:
        "د تایید شوو او روانو کارونو خبرې به دلته ښکاره شي.",
      archived:
        "هغه خبرې چې آرشیف یې کړئ دلته به ښکاره شي.",
    }[filter];
  }

  return {
    all:
      "Conversations linked to customer requests will appear here.",
    unread:
      "You have read all customer messages.",
    active:
      "Conversations for confirmed and in-progress jobs will appear here.",
    archived:
      "Conversations you archive will appear here.",
  }[filter];
}

function isActiveBookingStatus(
  status: BookingStatus,
): boolean {
  return (
    status === "confirmed" ||
    status === "in-progress"
  );
}

function getConversationTimestamp(
  createdAt: string,
  index: number,
): string {
  const parsed =
    new Date(createdAt);

  const baseTime =
    Number.isFinite(
      parsed.getTime(),
    )
      ? parsed
      : new Date();

  baseTime.setMinutes(
    baseTime.getMinutes() +
      index * 7,
  );

  return baseTime.toISOString();
}

function formatRelativeTime(
  value: string,
  language: LanguageName,
): string {
  const date = new Date(value);
  const now = new Date();

  if (
    !Number.isFinite(
      date.getTime(),
    )
  ) {
    return "";
  }

  const differenceMinutes =
    Math.max(
      0,
      Math.floor(
        (now.getTime() -
          date.getTime()) /
          60000,
      ),
    );

  if (differenceMinutes < 1) {
    return language === "English"
      ? "Now"
      : language === "Dari"
        ? "اکنون"
        : "اوس";
  }

  if (differenceMinutes < 60) {
    const valueText =
      formatDigits(
        differenceMinutes.toString(),
        language !== "English",
      );

    if (language === "Dari") {
      return `${valueText} دقیقه`;
    }

    if (language === "Pashto") {
      return `${valueText} دقیقې`;
    }

    return `${valueText} min`;
  }

  const differenceHours =
    Math.floor(
      differenceMinutes / 60,
    );

  if (differenceHours < 24) {
    const valueText =
      formatDigits(
        differenceHours.toString(),
        language !== "English",
      );

    if (language === "Dari") {
      return `${valueText} ساعت`;
    }

    if (language === "Pashto") {
      return `${valueText} ساعته`;
    }

    return `${valueText}h`;
  }

  const differenceDays =
    Math.floor(
      differenceHours / 24,
    );

  if (differenceDays === 1) {
    return language === "English"
      ? "Yesterday"
      : language === "Dari"
        ? "دیروز"
        : "پرون";
  }

  const valueText =
    formatDigits(
      differenceDays.toString(),
      language !== "English",
    );

  if (language === "Dari") {
    return `${valueText} روز`;
  }

  if (language === "Pashto") {
    return `${valueText} ورځې`;
  }

  return `${valueText}d`;
}

function formatCurrentTime(
  language: LanguageName,
): string {
  const now = new Date();

  const value = `${String(
    now.getHours(),
  ).padStart(2, "0")}:${String(
    now.getMinutes(),
  ).padStart(2, "0")}`;

  return language === "English"
    ? value
    : formatDigits(value, true);
}

function getInitials(
  name: string,
): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) =>
      part.charAt(0),
    )
    .join("")
    .slice(0, 2);

  return initials || "C";
}

function getServiceIcon(
  serviceId: string,
): IconName {
  const normalized =
    serviceId.toLowerCase();

  if (
    normalized.includes("electric") ||
    normalized.includes("wiring") ||
    normalized.includes("lighting") ||
    normalized.includes("socket")
  ) {
    return "flash-outline";
  }

  if (
    normalized.includes("plumb") ||
    normalized.includes("water") ||
    normalized.includes("pipe") ||
    normalized.includes("drain")
  ) {
    return "water-outline";
  }

  if (
    normalized.includes("clean")
  ) {
    return "sparkles-outline";
  }

  if (
    normalized.includes("computer") ||
    normalized.includes("phone") ||
    normalized.includes("software") ||
    normalized.includes("hardware")
  ) {
    return "laptop-outline";
  }

  if (
    normalized.includes("wood") ||
    normalized.includes("door") ||
    normalized.includes("cabinet") ||
    normalized.includes("furniture")
  ) {
    return "hammer-outline";
  }

  return "construct-outline";
}

function formatDigits(
  value: string,
  localized: boolean,
): string {
  if (!localized) {
    return value;
  }

  const digits: Record<
    string,
    string
  > = {
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
    (digit) =>
      digits[digit] ?? digit,
  );
}

function normalizeLanguage(
  language: string,
): LanguageName {
  if (language === "Dari") {
    return "Dari";
  }

  if (language === "Pashto") {
    return "Pashto";
  }

  return "English";
}

function directionStyle(
  isRtl: boolean,
) {
  return {
    textAlign: isRtl
      ? ("right" as const)
      : ("left" as const),

    writingDirection: isRtl
      ? ("rtl" as const)
      : ("ltr" as const),
  };
}

function getMessagesCopy(
  language: LanguageName,
) {
  if (language === "Dari") {
    return {
      eyebrow: "ارتباط با مشتریان",
      title: "پیام‌ها",

      subtitle:
        "گفتگوهای مرتبط با درخواست‌ها و کارهای فعال را مدیریت کنید.",

      searchPlaceholder:
        "جستجوی مشتری، خدمت یا پیام",

      clearSearch:
        "پاک کردن جستجو",

      resultCount:
        (value: string) =>
          `${value} گفتگو`,

      conversationWith:
        "گفتگو با",

      archive: "آرشیف",
      restore:
        "بازگرداندن از آرشیف",

      relatedBooking:
        "رزرو مرتبط",

      online: "آنلاین",
      offline: "آفلاین",
      back: "بازگشت",
      today: "امروز",

      messagePlaceholder:
        "پیام خود را بنویسید",

      attachment:
        "افزودن فایل",

      send: "ارسال پیام",
      read: "خوانده شد",
      sent: "ارسال شد",

      noSearchResults:
        "گفتگویی پیدا نشد",

      noSearchResultsSubtitle:
        "عبارت جستجو یا فیلتر انتخاب‌شده را تغییر دهید.",

      showAll:
        "نمایش همه گفتگوها",

      noticeTitle:
        "ارتباط را در پلتفرم نگه دارید",

      noticeText:
        "برای حفظ سابقهٔ گفتگو و پشتیبانی بهتر، جزئیات کار و هماهنگی‌ها را در همین بخش ثبت کنید.",
    };
  }

  if (language === "Pashto") {
    return {
      eyebrow:
        "له پیرودونکو سره اړیکه",

      title: "پیغامونه",

      subtitle:
        "د غوښتنو او فعالو کارونو اړوند خبرې مدیریت کړئ.",

      searchPlaceholder:
        "پیرودونکی، خدمت یا پیغام ولټوئ",

      clearSearch:
        "لټون پاک کړئ",

      resultCount:
        (value: string) =>
          `${value} خبرې`,

      conversationWith:
        "خبرې له",

      archive: "آرشیف",
      restore:
        "له آرشیف څخه راګرځول",

      relatedBooking:
        "اړوند رزرف",

      online: "آنلاین",
      offline: "آفلاین",
      back: "بېرته",
      today: "نن",

      messagePlaceholder:
        "خپل پیغام ولیکئ",

      attachment:
        "فایل ورزیات کړئ",

      send: "پیغام واستوئ",
      read: "لوستل شوی",
      sent: "استول شوی",

      noSearchResults:
        "کومې خبرې ونه موندل شوې",

      noSearchResultsSubtitle:
        "د لټون عبارت یا ټاکل شوی فلټر بدل کړئ.",

      showAll:
        "ټولې خبرې وګورئ",

      noticeTitle:
        "اړیکه په پلېټفارم کې وساتئ",

      noticeText:
        "د خبرو د تاریخچې او غوره ملاتړ لپاره، د کار تفصیل او همغږي په همدې برخه کې ثبت کړئ.",
    };
  }

  return {
    eyebrow:
      "Customer communication",
    title: "Messages",

    subtitle:
      "Manage conversations linked to requests and active jobs.",

    searchPlaceholder:
      "Search customer, service or message",

    clearSearch: "Clear search",

    resultCount:
      (value: string) =>
        `${value} conversations`,

    conversationWith:
      "Conversation with",

    archive: "Archive",
    restore:
      "Restore from archive",

    relatedBooking:
      "Related booking",

    online: "Online",
    offline: "Offline",
    back: "Back",
    today: "Today",

    messagePlaceholder:
      "Write a message",

    attachment:
      "Add attachment",

    send: "Send message",
    read: "Read",
    sent: "Sent",

    noSearchResults:
      "No conversation found",

    noSearchResultsSubtitle:
      "Change your search or selected filter.",

    showAll:
      "Show all conversations",

    noticeTitle:
      "Keep communication on Khedmat",

    noticeText:
      "Keep service details and coordination in this conversation so records remain available for support.",
  };
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor:
      KhedmatPalette.blue050,
  },

  scrollContent: {
    width: "100%",
    maxWidth:
      Layout.contentMaxWidth,
    alignSelf: "center",
    paddingHorizontal:
      Layout.screenPadding,
    paddingTop: Spacing.lg,
    paddingBottom: 130,
  },

  headerTopRow: {
    width: "100%",
    alignItems: "center",
    justifyContent:
      "space-between",
    gap: Spacing.md,
  },

  headerCopy: {
    flex: 1,
    gap: Spacing.xs,
  },

  eyebrow: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.blue500,
    fontFamily: Fonts.medium,
  },

  title: {
    ...Typography.screenTitle,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
    fontSize: 27,
    lineHeight: 34,
  },

  subtitle: {
    ...Typography.bodyStyle,
    width: "100%",
    maxWidth:
      Layout.readableTextMaxWidth,
    marginTop: Spacing.xs,
    color:
      KhedmatPalette.textSecondary,
  },

  headerIcon: {
    width: 50,
    height: 50,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    backgroundColor:
      KhedmatPalette.surface,
  },

  headerBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 21,
    height: 21,
    paddingHorizontal: 5,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor:
      KhedmatPalette.blue050,
    backgroundColor: ERROR,
  },

  headerBadgeText: {
    fontFamily: Fonts.bold,
    color:
      KhedmatPalette.white,
    fontSize: 10,
  },

  searchBox: {
    width: "100%",
    minHeight:
      Layout.controlHeight,
    marginTop: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
    gap: Spacing.md,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor:
      KhedmatPalette.surface,
    ...Shadows.small,
  },

  searchInput: {
    flex: 1,
    minHeight:
      Layout.controlHeight,
    paddingVertical: 0,
    fontFamily: Fonts.regular,
    fontSize: Typography.body,
    color:
      KhedmatPalette.textPrimary,
  },

  filtersRow: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
    paddingHorizontal: 1,
  },

  filterChip: {
    minHeight: 44,
    paddingHorizontal: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    borderRadius: Radius.pill,
    backgroundColor:
      KhedmatPalette.surface,
  },

  filterChipSelected: {
    borderColor:
      KhedmatPalette.navy900,
    backgroundColor:
      KhedmatPalette.navy900,
  },

  filterText: {
    ...Typography.captionStyle,
    color:
      KhedmatPalette.textSecondary,
  },

  filterTextSelected: {
    color:
      KhedmatPalette.white,
    fontFamily: Fonts.medium,
  },

  filterCount: {
    minWidth: 24,
    height: 24,
    paddingHorizontal: 6,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },

  filterCountSelected: {
    backgroundColor:
      "rgba(255,255,255,0.18)",
  },

  filterCountText: {
    fontFamily: Fonts.medium,
    color:
      KhedmatPalette.textMuted,
    fontSize: 11,
  },

  filterCountTextSelected: {
    color:
      KhedmatPalette.white,
  },

  resultsHeader: {
    width: "100%",
    marginTop: Spacing.section,
    alignItems: "center",
    justifyContent:
      "space-between",
    gap: Spacing.md,
  },

  resultsCopy: {
    flex: 1,
    gap: 2,
  },

  resultsTitle: {
    ...Typography.sectionTitle,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
    fontSize: 21,
    lineHeight: 28,
  },

  resultsSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textMuted,
  },

  resultsIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    backgroundColor:
      KhedmatPalette.surface,
  },

  conversationsList: {
    width: "100%",
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },

  conversationCard: {
    width: "100%",
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor:
      KhedmatPalette.surface,
    ...Shadows.small,
  },

  unreadConversationCard: {
    borderColor:
      KhedmatPalette.blue500,
    backgroundColor: "#F5FBFC",
  },

  conversationTopRow: {
    width: "100%",
    alignItems: "flex-start",
    gap: Spacing.md,
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
    backgroundColor:
      KhedmatPalette.navy900,
  },

  avatarText: {
    fontFamily: Fonts.bold,
    color:
      KhedmatPalette.white,
    fontSize: 17,
  },

  onlineIndicator: {
    position: "absolute",
    right: 1,
    bottom: 1,
    width: 14,
    height: 14,
    borderRadius: Radius.pill,
    borderWidth: 2,
    borderColor:
      KhedmatPalette.surface,
    backgroundColor: SUCCESS,
  },

  conversationCopy: {
    flex: 1,
    gap: Spacing.sm,
  },

  nameRow: {
    width: "100%",
    alignItems: "center",
    justifyContent:
      "space-between",
    gap: Spacing.sm,
  },

  customerName: {
    ...Typography.sectionTitle,
    flex: 1,
    color:
      KhedmatPalette.textPrimary,
    fontSize: 18,
    lineHeight: 24,
  },

  messageTime: {
    ...Typography.captionStyle,
    flexShrink: 0,
    color:
      KhedmatPalette.textMuted,
    fontSize: 10,
  },

  serviceRow: {
    width: "100%",
    alignItems: "center",
    gap: 5,
  },

  serviceName: {
    ...Typography.captionStyle,
    flex: 1,
    color:
      KhedmatPalette.blue500,
    fontFamily: Fonts.medium,
  },

  statusBadge: {
    flexShrink: 0,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.pill,
  },

  statusText: {
    ...Typography.captionStyle,
    fontFamily: Fonts.medium,
    fontSize: 9,
    textAlign: "center",
  },

  lastMessage: {
    ...Typography.bodyStyle,
    width: "100%",
    color:
      KhedmatPalette.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },

  unreadLastMessage: {
    color:
      KhedmatPalette.textPrimary,
    fontFamily: Fonts.medium,
  },

  cardSideColumn: {
    minWidth: 26,
    alignItems: "center",
    gap: Spacing.md,
  },

  unreadBadge: {
    minWidth: 24,
    height: 24,
    paddingHorizontal: 6,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.blue500,
  },

  unreadBadgeText: {
    fontFamily: Fonts.bold,
    color:
      KhedmatPalette.white,
    fontSize: 11,
  },

  archiveButton: {
    width: 30,
    height: 30,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },

  noticeCard: {
    width: "100%",
    minHeight: 108,
    marginTop: Spacing.section,
    padding: Spacing.lg,
    alignItems: "center",
    gap: Spacing.md,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.blue200,
    borderRadius: Radius.xl,
    backgroundColor: "#F4FBFC",
  },

  noticeIcon: {
    width: 46,
    height: 46,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surface,
  },

  noticeCopy: {
    flex: 1,
    gap: 3,
  },

  noticeTitle: {
    ...Typography.label,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
  },

  noticeText: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textSecondary,
    lineHeight: 19,
  },

  emptyState: {
    minHeight: 350,
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
  },

  emptyIconContainer: {
    width: 82,
    height: 82,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    backgroundColor:
      KhedmatPalette.surface,
  },

  emptyTitle: {
    ...Typography.sectionTitle,
    maxWidth: 340,
    color:
      KhedmatPalette.textPrimary,
    textAlign: "center",
  },

  emptySubtitle: {
    ...Typography.bodyStyle,
    maxWidth: 350,
    color:
      KhedmatPalette.textSecondary,
    textAlign: "center",
  },

  emptyAction: {
    minHeight: 44,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.pill,
    backgroundColor:
      KhedmatPalette.navy900,
  },

  emptyActionText: {
    ...Typography.label,
    color:
      KhedmatPalette.white,
  },

  chatRoot: {
    flex: 1,
  },

  chatHeader: {
    width: "100%",
    minHeight: 70,
    paddingHorizontal:
      Layout.screenPadding,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    gap: Spacing.sm,
    borderBottomWidth:
      StyleSheet.hairlineWidth,
    borderBottomColor:
      KhedmatPalette.border,
    backgroundColor:
      KhedmatPalette.surface,
  },

  backButton: {
    width: 42,
    height: 42,
    flexShrink: 0,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },

  chatAvatarWrapper: {
    width: 44,
    height: 44,
    flexShrink: 0,
  },

  chatAvatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.navy900,
  },

  chatAvatarText: {
    fontFamily: Fonts.bold,
    color:
      KhedmatPalette.white,
    fontSize: 14,
  },

  chatOnlineIndicator: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 12,
    height: 12,
    borderRadius: Radius.pill,
    borderWidth: 2,
    borderColor:
      KhedmatPalette.surface,
    backgroundColor: SUCCESS,
  },

  chatHeaderCopy: {
    flex: 1,
    gap: 1,
  },

  chatCustomerName: {
    ...Typography.label,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
    fontSize: 16,
  },

  chatPresence: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textMuted,
    fontSize: 11,
  },

  chatArchiveButton: {
    width: 42,
    height: 42,
    flexShrink: 0,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },

  bookingContextCard: {
    width: "100%",
    paddingHorizontal:
      Layout.screenPadding,
    paddingVertical: Spacing.sm,
    borderBottomWidth:
      StyleSheet.hairlineWidth,
    borderBottomColor:
      KhedmatPalette.border,
    backgroundColor:
      KhedmatPalette.blue050,
  },

  bookingContextRow: {
    width: "100%",
    padding: Spacing.md,
    alignItems: "center",
    gap: Spacing.md,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    borderRadius: Radius.lg,
    backgroundColor:
      KhedmatPalette.surface,
  },

  bookingContextIcon: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },

  bookingContextCopy: {
    flex: 1,
    gap: 1,
  },

  bookingContextLabel: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textMuted,
    fontSize: 9,
  },

  bookingContextTitle: {
    ...Typography.label,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
    fontSize: 13,
  },

  bookingContextAddress: {
    ...Typography.captionStyle,
    width: "100%",
    color:
      KhedmatPalette.textSecondary,
    fontSize: 10,
  },

  messagesContent: {
    flexGrow: 1,
    paddingHorizontal:
      Layout.screenPadding,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
    backgroundColor:
      KhedmatPalette.blue050,
  },

  dayDivider: {
    width: "100%",
    marginBottom: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },

  dayDividerLine: {
    flex: 1,
    height:
      StyleSheet.hairlineWidth,
    backgroundColor:
      KhedmatPalette.border,
  },

  dayDividerText: {
    ...Typography.captionStyle,
    color:
      KhedmatPalette.textMuted,
    fontSize: 11,
  },

  messageRow: {
    width: "100%",
    marginVertical: 2,
  },

  outgoingMessageRow: {
    alignItems: "flex-end",
  },

  incomingMessageRow: {
    alignItems: "flex-start",
  },

  messageBubble: {
    maxWidth: "82%",
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: 7,
    borderRadius: Radius.lg,
  },

  outgoingMessageBubble: {
    borderBottomRightRadius: 5,
    backgroundColor:
      KhedmatPalette.navy900,
  },

  incomingMessageBubble: {
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    borderBottomLeftRadius: 5,
    backgroundColor:
      KhedmatPalette.surface,
  },

  messageText: {
    ...Typography.bodyStyle,
    fontSize: 15,
    lineHeight: 22,
  },

  outgoingMessageText: {
    color:
      KhedmatPalette.white,
  },

  incomingMessageText: {
    color:
      KhedmatPalette.textPrimary,
  },

  messageMeta: {
    marginTop: 5,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
  },

  messageBubbleTime: {
    fontFamily: Fonts.regular,
    fontSize: 10,
  },

  outgoingMessageTime: {
    color:
      "rgba(255,255,255,0.68)",
  },

  incomingMessageTime: {
    color:
      KhedmatPalette.textMuted,
  },

  composer: {
    width: "100%",
    minHeight: 70,
    paddingHorizontal:
      Layout.screenPadding,
    paddingTop: Spacing.sm,
    paddingBottom:
      Platform.OS === "ios"
        ? Spacing.md
        : Spacing.sm,
    alignItems: "flex-end",
    gap: Spacing.sm,
    borderTopWidth:
      StyleSheet.hairlineWidth,
    borderTopColor:
      KhedmatPalette.border,
    backgroundColor:
      KhedmatPalette.surface,
  },

  attachmentButton: {
    width: 44,
    height: 44,
    flexShrink: 0,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },

  composerInputBox: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor:
      KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },

  composerInput: {
    minHeight: 42,
    maxHeight: 108,
    paddingTop: 10,
    paddingBottom: 9,
    fontFamily: Fonts.regular,
    fontSize: 15,
    lineHeight: 21,
    color:
      KhedmatPalette.textPrimary,
  },

  sendButton: {
    width: 44,
    height: 44,
    flexShrink: 0,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      KhedmatPalette.blue500,
  },

  sendButtonDisabled: {
    opacity: 0.42,
  },

  sendButtonPressed: {
    opacity: 0.82,
    transform: [
      {
        scale: 0.95,
      },
    ],
  },

  pressed: {
    opacity: 0.78,
  },

  cardPressed: {
    opacity: 0.88,
    transform: [
      {
        scale: 0.993,
      },
    ],
  },
});