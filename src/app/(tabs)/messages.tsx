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
import { useLanguage } from "../../context/languagecontext";

type IconName =
  ComponentProps<typeof Ionicons>["name"];

type LanguageName =
  | "English"
  | "Dari"
  | "Pashto";

type ConversationType =
  | "booking"
  | "support";

type BookingConversationStatus =
  | "pending"
  | "confirmed"
  | "completed";

type MessageSender =
  | "customer"
  | "provider"
  | "support";

type ChatMessage = {
  id: string;
  sender: MessageSender;
  text: string;
  time: string;
  read: boolean;
};

type LocalizedText = {
  English: string;
  Dari: string;
  Pashto: string;
};

type Conversation = {
  id: string;

  name: LocalizedText;
  initials: string;
  role: LocalizedText;

  lastMessage: LocalizedText;
  time: LocalizedText;

  unreadCount: number;
  online: boolean;
  verified: boolean;

  type: ConversationType;

  bookingService?: LocalizedText;

  bookingStatus?:
    | BookingConversationStatus;

  messages: Array<{
    id: string;
    sender: MessageSender;
    text: LocalizedText;
    time: LocalizedText;
    read: boolean;
  }>;
};

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "conversation-1",

    name: {
      English: "Ahmad Wali",
      Dari: "احمد ولی",
      Pashto: "احمد ولي",
    },

    initials: "AW",

    role: {
      English:
        "Professional electrician",
      Dari: "برق‌کار حرفه‌ای",
      Pashto:
        "مسلکي برېښناکار",
    },

    lastMessage: {
      English:
        "Yes, I will arrive at your location at 3:00 pm.",
      Dari:
        "بله، ساعت سه بعد از ظهر در محل شما حاضر می‌شوم.",
      Pashto:
        "هو، زه به د ماسپښین په درې بجو ستاسو ځای ته ورسېږم.",
    },

    time: {
      English: "10:42",
      Dari: "۱۰:۴۲",
      Pashto: "۱۰:۴۲",
    },

    unreadCount: 2,
    online: true,
    verified: true,
    type: "booking",

    bookingService: {
      English:
        "Electrical wiring repair",
      Dari:
        "ترمیم سیم‌کشی برق",
      Pashto:
        "د برېښنا مزو ترمیم",
    },

    bookingStatus: "confirmed",

    messages: [
      {
        id: "message-1-1",
        sender: "customer",

        text: {
          English:
            "Hello. The electricity in two rooms is not working.",
          Dari:
            "سلام. برق دو اتاق خانه کار نمی‌کند.",
          Pashto:
            "سلام. د کور په دوو خونو کې برېښنا کار نه کوي.",
        },

        time: {
          English: "10:18",
          Dari: "۱۰:۱۸",
          Pashto: "۱۰:۱۸",
        },

        read: true,
      },
      {
        id: "message-1-2",
        sender: "provider",

        text: {
          English:
            "Hello. Is the main breaker still on?",
          Dari:
            "سلام. آیا کلید اصلی برق هنوز روشن است؟",
          Pashto:
            "سلام. آیا اصلي برېښنا سویچ لا هم فعال دی؟",
        },

        time: {
          English: "10:25",
          Dari: "۱۰:۲۵",
          Pashto: "۱۰:۲۵",
        },

        read: true,
      },
      {
        id: "message-1-3",
        sender: "customer",

        text: {
          English:
            "Yes. The other rooms have electricity.",
          Dari:
            "بله. اتاق‌های دیگر برق دارند.",
          Pashto:
            "هو. نورې خونې برېښنا لري.",
        },

        time: {
          English: "10:31",
          Dari: "۱۰:۳۱",
          Pashto: "۱۰:۳۱",
        },

        read: true,
      },
      {
        id: "message-1-4",
        sender: "provider",

        text: {
          English:
            "I can inspect it today.",
          Dari:
            "امروز می‌توانم آن را بررسی کنم.",
          Pashto:
            "زه یې نن کتلی شم.",
        },

        time: {
          English: "10:38",
          Dari: "۱۰:۳۸",
          Pashto: "۱۰:۳۸",
        },

        read: false,
      },
      {
        id: "message-1-5",
        sender: "provider",

        text: {
          English:
            "Yes, I will arrive at your location at 3:00 pm.",
          Dari:
            "بله، ساعت سه بعد از ظهر در محل شما حاضر می‌شوم.",
          Pashto:
            "هو، زه به د ماسپښین په درې بجو ستاسو ځای ته ورسېږم.",
        },

        time: {
          English: "10:42",
          Dari: "۱۰:۴۲",
          Pashto: "۱۰:۴۲",
        },

        read: false,
      },
    ],
  },

  {
    id: "conversation-2",

    name: {
      English: "Maryam Ahmadi",
      Dari: "مریم احمدی",
      Pashto: "مریم احمدي",
    },

    initials: "MA",

    role: {
      English:
        "Cleaning services",
      Dari: "خدمات نظافت",
      Pashto:
        "د پاک‌کارۍ خدمتونه",
    },

    lastMessage: {
      English:
        "Please send the number of rooms and approximate house size.",
      Dari:
        "لطفاً تعداد اتاق‌ها و مساحت تقریبی خانه را بفرستید.",
      Pashto:
        "مهرباني وکړئ د خونو شمېر او د کور اټکلي مساحت راولېږئ.",
    },

    time: {
      English: "9:15",
      Dari: "۹:۱۵",
      Pashto: "۹:۱۵",
    },

    unreadCount: 1,
    online: true,
    verified: true,
    type: "booking",

    bookingService: {
      English:
        "General home cleaning",
      Dari:
        "نظافت عمومی خانه",
      Pashto:
        "د کور عمومي پاک‌کاري",
    },

    bookingStatus: "pending",

    messages: [
      {
        id: "message-2-1",
        sender: "customer",

        text: {
          English:
            "Hello. I need a full home cleaning.",
          Dari:
            "سلام. برای خانه به نظافت کامل نیاز دارم.",
          Pashto:
            "سلام. زه د کور بشپړې پاک‌کارۍ ته اړتیا لرم.",
        },

        time: {
          English: "8:58",
          Dari: "۸:۵۸",
          Pashto: "۸:۵۸",
        },

        read: true,
      },
      {
        id: "message-2-2",
        sender: "provider",

        text: {
          English:
            "Please send the number of rooms and approximate house size.",
          Dari:
            "لطفاً تعداد اتاق‌ها و مساحت تقریبی خانه را بفرستید.",
          Pashto:
            "مهرباني وکړئ د خونو شمېر او د کور اټکلي مساحت راولېږئ.",
        },

        time: {
          English: "9:15",
          Dari: "۹:۱۵",
          Pashto: "۹:۱۵",
        },

        read: false,
      },
    ],
  },

  {
    id: "conversation-3",

    name: {
      English: "Mohammad Salim",
      Dari: "محمد سلیم",
      Pashto: "محمد سلیم",
    },

    initials: "MS",

    role: {
      English:
        "Plumber and water technician",
      Dari:
        "لوله‌کش و تخنیکر آب",
      Pashto:
        "نلدوان او د اوبو تخنیکر",
    },

    lastMessage: {
      English:
        "Thank you. I am glad the pipe problem was resolved.",
      Dari:
        "تشکر. خوشحال شدم که مشکل لوله برطرف شد.",
      Pashto:
        "مننه. خوښ شوم چې د پایپ ستونزه حل شوه.",
    },

    time: {
      English: "Yesterday",
      Dari: "دیروز",
      Pashto: "پرون",
    },

    unreadCount: 0,
    online: false,
    verified: true,
    type: "booking",

    bookingService: {
      English:
        "Pipe leak repair",
      Dari:
        "ترمیم نشت لوله",
      Pashto:
        "د پایپ لیک ترمیم",
    },

    bookingStatus: "completed",

    messages: [
      {
        id: "message-3-1",
        sender: "customer",

        text: {
          English:
            "The repaired pipe is working well now.",
          Dari:
            "لوله‌ای که ترمیم کردید حالا خوب کار می‌کند.",
          Pashto:
            "ترمیم شوی پایپ اوس ښه کار کوي.",
        },

        time: {
          English: "Yesterday",
          Dari: "دیروز",
          Pashto: "پرون",
        },

        read: true,
      },
      {
        id: "message-3-2",
        sender: "provider",

        text: {
          English:
            "Thank you. I am glad the pipe problem was resolved.",
          Dari:
            "تشکر. خوشحال شدم که مشکل لوله برطرف شد.",
          Pashto:
            "مننه. خوښ شوم چې د پایپ ستونزه حل شوه.",
        },

        time: {
          English: "Yesterday",
          Dari: "دیروز",
          Pashto: "پرون",
        },

        read: true,
      },
    ],
  },

  {
    id: "conversation-4",

    name: {
      English: "Khedmat Support",
      Dari: "پشتیبانی خدمت",
      Pashto: "د خدمت ملاتړ",
    },

    initials: "K",

    role: {
      English: "Support team",
      Dari: "تیم پشتیبانی",
      Pashto: "د ملاتړ ټیم",
    },

    lastMessage: {
      English:
        "Your request was received and is being reviewed.",
      Dari:
        "درخواست شما دریافت شد و در حال بررسی است.",
      Pashto:
        "ستاسو غوښتنه ترلاسه شوه او تر کتنې لاندې ده.",
    },

    time: {
      English: "Saturday",
      Dari: "شنبه",
      Pashto: "شنبه",
    },

    unreadCount: 0,
    online: false,
    verified: false,
    type: "support",

    messages: [
      {
        id: "message-4-1",
        sender: "customer",

        text: {
          English:
            "I need help updating my booking address.",
          Dari:
            "برای تغییر آدرس رزرو خود کمک نیاز دارم.",
          Pashto:
            "زه د خپل رزرف د پتې د بدلولو لپاره مرستې ته اړتیا لرم.",
        },

        time: {
          English: "Friday",
          Dari: "جمعه",
          Pashto: "جمعه",
        },

        read: true,
      },
      {
        id: "message-4-2",
        sender: "support",

        text: {
          English:
            "Your request was received and is being reviewed.",
          Dari:
            "درخواست شما دریافت شد و در حال بررسی است.",
          Pashto:
            "ستاسو غوښتنه ترلاسه شوه او تر کتنې لاندې ده.",
        },

        time: {
          English: "Saturday",
          Dari: "شنبه",
          Pashto: "شنبه",
        },

        read: true,
      },
    ],
  },
];

export default function MessagesScreen() {
  const { language } =
    useLanguage();

  const activeLanguage =
    normalizeLanguage(language);

  const isRtl =
    activeLanguage === "Dari" ||
    activeLanguage === "Pashto";

  const copy =
    getMessagesCopy(
      activeLanguage,
    );

  const [
    conversations,
    setConversations,
  ] = useState(
    INITIAL_CONVERSATIONS,
  );

  const [query, setQuery] =
    useState("");

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

  const selectedConversation =
    conversations.find(
      (conversation) =>
        conversation.id ===
        selectedConversationId,
    ) ?? null;

  const filteredConversations =
    useMemo(() => {
      const normalizedQuery =
        query
          .trim()
          .toLocaleLowerCase();

      if (!normalizedQuery) {
        return conversations;
      }

      return conversations.filter(
        (conversation) => {
          const searchableText = [
            conversation.name[
              activeLanguage
            ],

            conversation.role[
              activeLanguage
            ],

            conversation.lastMessage[
              activeLanguage
            ],

            conversation.bookingService?.[
              activeLanguage
            ],
          ]
            .filter(Boolean)
            .join(" ")
            .toLocaleLowerCase();

          return searchableText.includes(
            normalizedQuery,
          );
        },
      );
    }, [
      activeLanguage,
      conversations,
      query,
    ]);

  const unreadTotal =
    conversations.reduce(
      (total, conversation) =>
        total +
        conversation.unreadCount,
      0,
    );

  const openConversation = (
    conversationId: string,
  ) => {
    setConversations(
      (current) =>
        current.map(
          (conversation) => {
            if (
              conversation.id !==
              conversationId
            ) {
              return conversation;
            }

            return {
              ...conversation,

              unreadCount: 0,

              messages:
                conversation.messages.map(
                  (message) => ({
                    ...message,
                    read: true,
                  }),
                ),
            };
          },
        ),
    );

    setSelectedConversationId(
      conversationId,
    );

    setDraftMessage("");
  };

  const closeConversation = () => {
    setSelectedConversationId(
      null,
    );

    setDraftMessage("");
  };

  const sendMessage = () => {
    const cleanMessage =
      draftMessage.trim();

    if (
      !cleanMessage ||
      !selectedConversationId
    ) {
      return;
    }

    const localizedText: LocalizedText =
      {
        English: cleanMessage,
        Dari: cleanMessage,
        Pashto: cleanMessage,
      };

    const now =
      formatCurrentTime(
        activeLanguage,
      );

    const localizedTime: LocalizedText =
      {
        English: now,
        Dari: now,
        Pashto: now,
      };

    const newMessage = {
      id: `local-message-${Date.now()}`,
      sender:
        "customer" as const,
      text: localizedText,
      time: localizedTime,
      read: true,
    };

    setConversations(
      (current) =>
        current.map(
          (conversation) => {
            if (
              conversation.id !==
              selectedConversationId
            ) {
              return conversation;
            }

            return {
              ...conversation,

              lastMessage:
                localizedText,

              time: localizedTime,

              messages: [
                ...conversation.messages,
                newMessage,
              ],
            };
          },
        ),
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
      <ConversationScreen
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
        onChangeDraft={
          setDraftMessage
        }
        onBack={
          closeConversation
        }
        onSend={sendMessage}
        scrollRef={
          messagesScrollRef
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
        <View style={styles.header}>
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
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {copy.eyebrow}
              </Text>

              <Text
                style={[
                  styles.title,
                  directionStyle(
                    isRtl,
                  ),
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
                size={23}
                color={
                  KhedmatPalette
                    .blue500
                }
              />

              {unreadTotal > 0 ? (
                <View
                  style={
                    styles.headerUnreadBadge
                  }
                >
                  <Text
                    style={
                      styles.headerUnreadText
                    }
                  >
                    {formatDigits(
                      unreadTotal.toString(),
                      activeLanguage !==
                        "English",
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
        </View>

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
              KhedmatPalette
                .blue500
            }
          />

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={
              copy.searchPlaceholder
            }
            placeholderTextColor={
              KhedmatPalette
                .textMuted
            }
            selectionColor={
              KhedmatPalette
                .blue500
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
                  KhedmatPalette
                    .textMuted
                }
              />
            </Pressable>
          ) : null}
        </View>

        <View
          style={[
            styles.sectionHeader,
            {
              flexDirection: isRtl
                ? "row-reverse"
                : "row",
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              directionStyle(isRtl),
            ]}
          >
            {copy.recentConversations}
          </Text>

          <Text
            style={[
              styles.conversationCount,
              directionStyle(isRtl),
            ]}
          >
            {formatDigits(
              filteredConversations.length.toString(),
              activeLanguage !==
                "English",
            )}{" "}
            {copy.conversations}
          </Text>
        </View>

        <View
          style={
            styles.conversations
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
                    conversation.id,
                  )
                }
              />
            ),
          )}

          {filteredConversations.length ===
          0 ? (
            <EmptyMessages
              copy={copy}
              isRtl={isRtl}
              onClear={() =>
                setQuery("")
              }
            />
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type ConversationCardProps = {
  conversation: Conversation;
  language: LanguageName;
  isRtl: boolean;
  copy: ReturnType<
    typeof getMessagesCopy
  >;
  onPress: () => void;
};

function ConversationCard({
  conversation,
  language,
  isRtl,
  copy,
  onPress,
}: ConversationCardProps) {
  const bookingStatus =
    conversation.bookingStatus
      ? getBookingStatus(
          conversation.bookingStatus,
          language,
        )
      : null;

  const hasUnread =
    conversation.unreadCount >
    0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${copy.conversationWith} ${
        conversation.name[
          language
        ]
      }`}
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
          styles.conversationContent,
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
            style={[
              styles.avatar,

              conversation.type ===
                "support" &&
                styles.supportAvatar,
            ]}
          >
            {conversation.type ===
            "support" ? (
              <Ionicons
                name="headset-outline"
                size={24}
                color={
                  KhedmatPalette
                    .blue500
                }
              />
            ) : (
              <Text
                style={
                  styles.avatarInitials
                }
              >
                {conversation.initials}
              </Text>
            )}
          </View>

          {conversation.online ? (
            <View
              style={
                styles.onlineDot
              }
            />
          ) : null}

          {conversation.verified ? (
            <View
              style={
                styles.verifiedBadge
              }
            >
              <Ionicons
                name="checkmark"
                size={10}
                color={
                  KhedmatPalette.white
                }
              />
            </View>
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
            <View
              style={[
                styles.nameBlock,
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
                  styles.name,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {
                  conversation.name[
                    language
                  ]
                }
              </Text>

              <Text
                numberOfLines={1}
                style={[
                  styles.role,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {
                  conversation.role[
                    language
                  ]
                }
              </Text>
            </View>

            <View
              style={[
                styles.metaBlock,
                {
                  alignItems: isRtl
                    ? "flex-start"
                    : "flex-end",
                },
              ]}
            >
              <Text
                style={
                  styles.time
                }
              >
                {
                  conversation.time[
                    language
                  ]
                }
              </Text>

              {hasUnread ? (
                <View
                  style={
                    styles.unreadBadge
                  }
                >
                  <Text
                    style={
                      styles.unreadText
                    }
                  >
                    {formatDigits(
                      conversation.unreadCount.toString(),
                      language !==
                        "English",
                    )}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {conversation.bookingService ? (
            <View
              style={[
                styles.bookingContext,
                {
                  flexDirection: isRtl
                    ? "row-reverse"
                    : "row",
                },
              ]}
            >
              <Ionicons
                name="briefcase-outline"
                size={14}
                color={
                  KhedmatPalette
                    .blue500
                }
              />

              <Text
                numberOfLines={1}
                style={[
                  styles.bookingService,
                  directionStyle(
                    isRtl,
                  ),
                ]}
              >
                {
                  conversation
                    .bookingService[
                    language
                  ]
                }
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
                        color:
                          bookingStatus.color,
                      },
                      directionStyle(
                        isRtl,
                      ),
                    ]}
                  >
                    {
                      bookingStatus.label
                    }
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}

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
              conversation.lastMessage[
                language
              ]
            }
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

type ConversationScreenProps = {
  conversation: Conversation;
  language: LanguageName;
  isRtl: boolean;
  copy: ReturnType<
    typeof getMessagesCopy
  >;
  draftMessage: string;
  onChangeDraft: (
    value: string,
  ) => void;
  onBack: () => void;
  onSend: () => void;
  scrollRef:
    React.RefObject<ScrollView | null>;
};

function ConversationScreen({
  conversation,
  language,
  isRtl,
  copy,
  draftMessage,
  onChangeDraft,
  onBack,
  onSend,
  scrollRef,
}: ConversationScreenProps) {
  const bookingStatus =
    conversation.bookingStatus
      ? getBookingStatus(
          conversation.bookingStatus,
          language,
        )
      : null;

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <KeyboardAvoidingView
        style={
          styles.chatKeyboardView
        }
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
                KhedmatPalette
                  .navy900
              }
            />
          </Pressable>

          <View
            style={
              styles.chatAvatarWrapper
            }
          >
            <View
              style={[
                styles.chatAvatar,

                conversation.type ===
                  "support" &&
                  styles.supportAvatar,
              ]}
            >
              {conversation.type ===
              "support" ? (
                <Ionicons
                  name="headset-outline"
                  size={21}
                  color={
                    KhedmatPalette
                      .blue500
                  }
                />
              ) : (
                <Text
                  style={
                    styles.chatAvatarInitials
                  }
                >
                  {
                    conversation.initials
                  }
                </Text>
              )}
            </View>

            {conversation.online ? (
              <View
                style={
                  styles.chatOnlineDot
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
                styles.chatName,
                directionStyle(isRtl),
              ]}
            >
              {
                conversation.name[
                  language
                ]
              }
            </Text>

            <Text
              numberOfLines={1}
              style={[
                styles.chatPresence,
                directionStyle(isRtl),
              ]}
            >
              {conversation.online
                ? copy.online
                : conversation.role[
                    language
                  ]}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              copy.moreOptions
            }
            style={({ pressed }) => [
              styles.moreButton,
              pressed &&
                styles.pressed,
            ]}
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={22}
              color={
                KhedmatPalette
                  .navy700
              }
            />
          </Pressable>
        </View>

        {conversation.bookingService ? (
          <View
            style={
              styles.chatBookingBanner
            }
          >
            <View
              style={[
                styles.chatBookingRow,
                {
                  flexDirection: isRtl
                    ? "row-reverse"
                    : "row",
                },
              ]}
            >
              <View
                style={
                  styles.chatBookingIcon
                }
              >
                <Ionicons
                  name="briefcase-outline"
                  size={18}
                  color={
                    KhedmatPalette
                      .blue500
                  }
                />
              </View>

              <View
                style={[
                  styles.chatBookingCopy,
                  {
                    alignItems: isRtl
                      ? "flex-end"
                      : "flex-start",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chatBookingLabel,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {copy.booking}
                </Text>

                <Text
                  numberOfLines={1}
                  style={[
                    styles.chatBookingService,
                    directionStyle(
                      isRtl,
                    ),
                  ]}
                >
                  {
                    conversation
                      .bookingService[
                      language
                    ]
                  }
                </Text>
              </View>

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
                        color:
                          bookingStatus.color,
                      },
                      directionStyle(
                        isRtl,
                      ),
                    ]}
                  >
                    {
                      bookingStatus.label
                    }
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        ) : null}

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
                language={
                  language
                }
                isRtl={isRtl}
                copy={copy}
              />
            ),
          )}
        </ScrollView>

        <View
          style={[
            styles.composerContainer,
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
              copy.attach
            }
            style={({ pressed }) => [
              styles.attachButton,
              pressed &&
                styles.pressed,
            ]}
          >
            <Ionicons
              name="add"
              size={25}
              color={
                KhedmatPalette
                  .navy700
              }
            />
          </Pressable>

          <View
            style={[
              styles.composerInputBox,
              {
                flexDirection: isRtl
                  ? "row-reverse"
                  : "row",
              },
            ]}
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
                KhedmatPalette
                  .textMuted
              }
              selectionColor={
                KhedmatPalette
                  .blue500
              }
              multiline
              maxLength={1000}
              style={[
                styles.composerInput,
                directionStyle(
                  isRtl,
                ),
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
              name={
                isRtl
                  ? "send"
                  : "send"
              }
              size={20}
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
  message: Conversation["messages"][number];
  language: LanguageName;
  isRtl: boolean;
  copy: ReturnType<
    typeof getMessagesCopy
  >;
};

function MessageBubble({
  message,
  language,
  isRtl,
  copy,
}: MessageBubbleProps) {
  const isCustomer =
    message.sender === "customer";

  return (
    <View
      style={[
        styles.messageRow,

        isCustomer
          ? styles.customerMessageRow
          : styles.incomingMessageRow,
      ]}
    >
      <View
        style={[
          styles.messageBubble,

          isCustomer
            ? styles.customerMessageBubble
            : styles.incomingMessageBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,

            isCustomer
              ? styles.customerMessageText
              : styles.incomingMessageText,

            directionStyle(isRtl),
          ]}
        >
          {message.text[language]}
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
              styles.messageTime,

              isCustomer
                ? styles.customerMessageTime
                : styles.incomingMessageTime,
            ]}
          >
            {message.time[language]}
          </Text>

          {isCustomer ? (
            <Ionicons
              name={
                message.read
                  ? "checkmark-done"
                  : "checkmark"
              }
              size={15}
              color={
                message.read
                  ? KhedmatPalette
                      .blue200
                  : "rgba(255,255,255,0.65)"
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
  copy: ReturnType<
    typeof getMessagesCopy
  >;
  isRtl: boolean;
  onClear: () => void;
};

function EmptyMessages({
  copy,
  isRtl,
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
          name="chatbubble-ellipses-outline"
          size={34}
          color={
            KhedmatPalette
              .blue500
          }
        />
      </View>

      <Text
        style={[
          styles.emptyTitle,
          directionStyle(isRtl),
        ]}
      >
        {copy.noConversation}
      </Text>

      <Text
        style={[
          styles.emptySubtitle,
          directionStyle(isRtl),
        ]}
      >
        {copy.noConversationSubtitle}
      </Text>

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
          {copy.clearSearch}
        </Text>
      </Pressable>
    </View>
  );
}

function getBookingStatus(
  status: BookingConversationStatus,
  language: LanguageName,
) {
  const labels =
    getBookingStatusLabels(
      language,
    );

  if (status === "confirmed") {
    return {
      label: labels.confirmed,
      color:
        KhedmatPalette.blue500,
      backgroundColor:
        "#E1F2F7",
    };
  }

  if (status === "completed") {
    return {
      label: labels.completed,
      color:
        KhedmatPalette.success,
      backgroundColor:
        KhedmatPalette.successSoft,
    };
  }

  return {
    label: labels.pending,
    color: "#8A5A00",
    backgroundColor: "#FFF4D6",
  };
}

function getBookingStatusLabels(
  language: LanguageName,
) {
  if (language === "English") {
    return {
      confirmed: "Confirmed",
      completed: "Completed",
      pending: "Pending",
    };
  }

  if (language === "Pashto") {
    return {
      confirmed: "تایید شوی",
      completed: "بشپړ شوی",
      pending: "په تمه",
    };
  }

  return {
    confirmed: "تأییدشده",
    completed: "تکمیل‌شده",
    pending: "در انتظار",
  };
}

function formatCurrentTime(
  language: LanguageName,
): string {
  const now = new Date();

  const hours = now.getHours();
  const minutes = now
    .getMinutes()
    .toString()
    .padStart(2, "0");

  const value = `${hours}:${minutes}`;

  return language === "English"
    ? value
    : formatDigits(value, true);
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
      eyebrow: "گفتگوها",
      title: "پیام‌ها",

      subtitle:
        "با ارائه‌دهندگان و تیم پشتیبانی در ارتباط باشید.",

      searchPlaceholder:
        "جستجوی گفتگو یا پیام",

      clearSearch:
        "پاک کردن جستجو",

      recentConversations:
        "گفتگوهای اخیر",

      conversations: "گفتگو",

      conversationWith:
        "گفتگو با",

      noConversation:
        "گفتگویی پیدا نشد",

      noConversationSubtitle:
        "عبارت جستجو را تغییر دهید یا دوباره تلاش کنید.",

      back: "بازگشت",
      online: "آنلاین",
      moreOptions:
        "گزینه‌های بیشتر",
      booking: "رزرو",
      today: "امروز",

      messagePlaceholder:
        "پیام خود را بنویسید",

      attach:
        "افزودن فایل",
      send: "ارسال پیام",
      read: "خوانده شد",
      sent: "ارسال شد",
    };
  }

  if (language === "Pashto") {
    return {
      eyebrow: "خبرې اترې",
      title: "پیغامونه",

      subtitle:
        "له خدمت وړاندې کوونکو او د ملاتړ له ټیم سره اړیکه ونیسئ.",

      searchPlaceholder:
        "خبرې اترې یا پیغام ولټوئ",

      clearSearch:
        "لټون پاک کړئ",

      recentConversations:
        "وروستۍ خبرې اترې",

      conversations:
        "خبرې اترې",

      conversationWith:
        "خبرې له",

      noConversation:
        "کومه خبرې اترې ونه موندل شوه",

      noConversationSubtitle:
        "د لټون عبارت بدل کړئ او بیا هڅه وکړئ.",

      back: "بېرته",
      online: "آنلاین",
      moreOptions:
        "نور انتخابونه",
      booking: "رزرف",
      today: "نن",

      messagePlaceholder:
        "خپل پیغام ولیکئ",

      attach:
        "فایل ورزیات کړئ",
      send: "پیغام واستوئ",
      read: "لوستل شوی",
      sent: "استول شوی",
    };
  }

  return {
    eyebrow: "Conversations",
    title: "Messages",

    subtitle:
      "Stay connected with providers and the Khedmat support team.",

    searchPlaceholder:
      "Search conversations or messages",

    clearSearch: "Clear search",

    recentConversations:
      "Recent conversations",

    conversations:
      "conversations",

    conversationWith:
      "Conversation with",

    noConversation:
      "No conversation found",

    noConversationSubtitle:
      "Change your search and try again.",

    back: "Back",
    online: "Online",
    moreOptions: "More options",
    booking: "Booking",
    today: "Today",

    messagePlaceholder:
      "Write a message",

    attach: "Add attachment",
    send: "Send message",
    read: "Read",
    sent: "Sent",
  };
}

const styles =
  StyleSheet.create({
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

    header: {
      width: "100%",

      gap: Spacing.sm,
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
        KhedmatPalette
          .textPrimary,

      fontSize: 27,

      lineHeight: 34,
    },

    subtitle: {
      ...Typography.bodyStyle,

      width: "100%",

      maxWidth:
        Layout.readableTextMaxWidth,

      color:
        KhedmatPalette
          .textSecondary,
    },

    headerIcon: {
      width: 50,
      height: 50,

      flexShrink: 0,

      borderRadius: Radius.lg,

      alignItems: "center",

      justifyContent: "center",

      backgroundColor:
        KhedmatPalette.surface,

      borderWidth: 1,

      borderColor:
        KhedmatPalette.border,
    },

    headerUnreadBadge: {
      position: "absolute",

      top: -3,
      right: -3,

      minWidth: 20,
      height: 20,

      paddingHorizontal: 5,

      borderRadius: Radius.pill,

      alignItems: "center",

      justifyContent: "center",

      backgroundColor:
        KhedmatPalette.error,

      borderWidth: 2,

      borderColor:
        KhedmatPalette.blue050,
    },

    headerUnreadText: {
      color:
        KhedmatPalette.white,

      fontFamily: Fonts.bold,

      fontSize: 10,
    },

    searchBox: {
      width: "100%",

      minHeight:
        Layout.controlHeight,

      marginTop: Spacing.xxl,

      paddingHorizontal:
        Spacing.lg,

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
        KhedmatPalette
          .textPrimary,
    },

    sectionHeader: {
      width: "100%",

      marginTop:
        Spacing.section,

      alignItems: "center",

      justifyContent:
        "space-between",

      gap: Spacing.md,
    },

    sectionTitle: {
      ...Typography.sectionTitle,

      color:
        KhedmatPalette
          .textPrimary,

      fontSize: 21,

      lineHeight: 28,
    },

    conversationCount: {
      ...Typography.captionStyle,

      color:
        KhedmatPalette
          .textMuted,
    },

    conversations: {
      width: "100%",

      marginTop: Spacing.lg,

      gap: Spacing.md,
    },

    conversationCard: {
      width: "100%",

      borderRadius: Radius.xl,

      borderWidth: 1,

      borderColor:
        KhedmatPalette.border,

      backgroundColor:
        KhedmatPalette.surface,

      ...Shadows.small,
    },

    unreadConversationCard: {
      borderColor:
        KhedmatPalette.blue500,

      backgroundColor:
        "#F5FBFC",
    },

    conversationContent: {
      width: "100%",

      minHeight: 122,

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

      backgroundColor:
        KhedmatPalette.navy900,
    },

    supportAvatar: {
      backgroundColor:
        KhedmatPalette
          .surfaceSoft,

      borderWidth: 1,

      borderColor:
        KhedmatPalette.border,
    },

    avatarInitials: {
      color:
        KhedmatPalette.white,

      fontFamily: Fonts.bold,

      fontSize: 17,
    },

    onlineDot: {
      position: "absolute",

      right: 1,
      bottom: 1,

      width: 14,
      height: 14,

      borderRadius: Radius.pill,

      backgroundColor:
        KhedmatPalette.success,

      borderWidth: 2,

      borderColor:
        KhedmatPalette.surface,
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

      backgroundColor:
        KhedmatPalette.blue500,

      borderWidth: 2,

      borderColor:
        KhedmatPalette.surface,
    },

    conversationCopy: {
      flex: 1,

      gap: Spacing.sm,
    },

    nameRow: {
      width: "100%",

      alignItems: "flex-start",

      justifyContent:
        "space-between",

      gap: Spacing.md,
    },

    nameBlock: {
      flex: 1,

      gap: 2,
    },

    name: {
      ...Typography.sectionTitle,

      width: "100%",

      color:
        KhedmatPalette
          .textPrimary,

      fontSize: 18,

      lineHeight: 24,
    },

    role: {
      ...Typography.captionStyle,

      width: "100%",

      color:
        KhedmatPalette
          .textMuted,
    },

    metaBlock: {
      flexShrink: 0,

      gap: Spacing.xs,
    },

    time: {
      ...Typography.captionStyle,

      color:
        KhedmatPalette
          .textMuted,

      fontSize: 11,
    },

    unreadBadge: {
      minWidth: 23,
      height: 23,

      paddingHorizontal: 6,

      borderRadius: Radius.pill,

      alignItems: "center",

      justifyContent: "center",

      backgroundColor:
        KhedmatPalette.blue500,
    },

    unreadText: {
      color:
        KhedmatPalette.white,

      fontFamily: Fonts.bold,

      fontSize: 11,
    },

    bookingContext: {
      width: "100%",

      alignItems: "center",

      gap: Spacing.xs,
    },

    bookingService: {
      ...Typography.captionStyle,

      flex: 1,

      color:
        KhedmatPalette.blue500,

      fontFamily: Fonts.medium,
    },

    bookingStatusBadge: {
      flexShrink: 0,

      paddingHorizontal:
        Spacing.sm,

      paddingVertical: 4,

      borderRadius: Radius.pill,
    },

    bookingStatusText: {
      ...Typography.captionStyle,

      fontFamily: Fonts.medium,

      fontSize: 10,

      textAlign: "center",
    },

    lastMessage: {
      ...Typography.bodyStyle,

      width: "100%",

      color:
        KhedmatPalette
          .textSecondary,

      fontSize: 14,

      lineHeight: 21,
    },

    unreadLastMessage: {
      color:
        KhedmatPalette
          .textPrimary,

      fontFamily: Fonts.medium,
    },

    emptyState: {
      minHeight: 360,

      alignItems: "center",

      justifyContent: "center",

      gap: Spacing.md,

      paddingHorizontal:
        Spacing.xl,
    },

    emptyIconContainer: {
      width: 82,
      height: 82,

      borderRadius: Radius.pill,

      alignItems: "center",

      justifyContent: "center",

      backgroundColor:
        KhedmatPalette.surface,

      borderWidth: 1,

      borderColor:
        KhedmatPalette.border,
    },

    emptyTitle: {
      ...Typography.sectionTitle,

      color:
        KhedmatPalette
          .textPrimary,

      textAlign: "center",
    },

    emptySubtitle: {
      ...Typography.bodyStyle,

      maxWidth: 340,

      color:
        KhedmatPalette
          .textSecondary,

      textAlign: "center",
    },

    emptyAction: {
      minHeight: 44,

      paddingHorizontal:
        Spacing.lg,

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

    chatKeyboardView: {
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

      backgroundColor:
        KhedmatPalette.surface,

      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderBottomColor:
        KhedmatPalette.border,
    },

    backButton: {
      width: 42,
      height: 42,

      flexShrink: 0,

      borderRadius: Radius.pill,

      alignItems: "center",

      justifyContent: "center",

      backgroundColor:
        KhedmatPalette
          .surfaceSoft,
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

    chatAvatarInitials: {
      color:
        KhedmatPalette.white,

      fontFamily: Fonts.bold,

      fontSize: 14,
    },

    chatOnlineDot: {
      position: "absolute",

      right: 0,
      bottom: 0,

      width: 12,
      height: 12,

      borderRadius: Radius.pill,

      backgroundColor:
        KhedmatPalette.success,

      borderWidth: 2,

      borderColor:
        KhedmatPalette.surface,
    },

    chatHeaderCopy: {
      flex: 1,

      gap: 1,
    },

    chatName: {
      ...Typography.label,

      width: "100%",

      color:
        KhedmatPalette
          .textPrimary,

      fontSize: 16,
    },

    chatPresence: {
      ...Typography.captionStyle,

      width: "100%",

      color:
        KhedmatPalette
          .textMuted,

      fontSize: 11,
    },

    moreButton: {
      width: 42,
      height: 42,

      flexShrink: 0,

      borderRadius: Radius.pill,

      alignItems: "center",

      justifyContent: "center",
    },

    chatBookingBanner: {
      width: "100%",

      paddingHorizontal:
        Layout.screenPadding,

      paddingVertical: Spacing.sm,

      backgroundColor:
        KhedmatPalette.blue050,

      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderBottomColor:
        KhedmatPalette.border,
    },

    chatBookingRow: {
      width: "100%",

      alignItems: "center",

      gap: Spacing.md,

      padding: Spacing.md,

      borderRadius: Radius.lg,

      backgroundColor:
        KhedmatPalette.surface,

      borderWidth: 1,

      borderColor:
        KhedmatPalette.border,
    },

    chatBookingIcon: {
      width: 38,
      height: 38,

      flexShrink: 0,

      borderRadius: Radius.md,

      alignItems: "center",

      justifyContent: "center",

      backgroundColor:
        KhedmatPalette
          .surfaceSoft,
    },

    chatBookingCopy: {
      flex: 1,

      gap: 1,
    },

    chatBookingLabel: {
      ...Typography.captionStyle,

      width: "100%",

      color:
        KhedmatPalette
          .textMuted,

      fontSize: 10,
    },

    chatBookingService: {
      ...Typography.label,

      width: "100%",

      color:
        KhedmatPalette
          .textPrimary,

      fontSize: 13,
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
        KhedmatPalette
          .textMuted,

      fontSize: 11,
    },

    messageRow: {
      width: "100%",

      marginVertical: 2,
    },

    customerMessageRow: {
      alignItems: "flex-end",
    },

    incomingMessageRow: {
      alignItems: "flex-start",
    },

    messageBubble: {
      maxWidth: "82%",

      paddingHorizontal:
        Spacing.md,

      paddingTop: Spacing.md,

      paddingBottom: 7,

      borderRadius: Radius.lg,
    },

    customerMessageBubble: {
      backgroundColor:
        KhedmatPalette.navy900,

      borderBottomRightRadius: 5,
    },

    incomingMessageBubble: {
      backgroundColor:
        KhedmatPalette.surface,

      borderWidth: 1,

      borderColor:
        KhedmatPalette.border,

      borderBottomLeftRadius: 5,
    },

    messageText: {
      ...Typography.bodyStyle,

      fontSize: 15,

      lineHeight: 22,
    },

    customerMessageText: {
      color:
        KhedmatPalette.white,
    },

    incomingMessageText: {
      color:
        KhedmatPalette
          .textPrimary,
    },

    messageMeta: {
      marginTop: 5,

      alignItems: "center",

      justifyContent: "flex-end",

      gap: 4,
    },

    messageTime: {
      fontFamily: Fonts.regular,

      fontSize: 10,
    },

    customerMessageTime: {
      color:
        "rgba(255,255,255,0.68)",
    },

    incomingMessageTime: {
      color:
        KhedmatPalette
          .textMuted,
    },

    composerContainer: {
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

      backgroundColor:
        KhedmatPalette.surface,

      borderTopWidth:
        StyleSheet.hairlineWidth,

      borderTopColor:
        KhedmatPalette.border,
    },

    attachButton: {
      width: 44,
      height: 44,

      flexShrink: 0,

      borderRadius: Radius.pill,

      alignItems: "center",

      justifyContent: "center",

      backgroundColor:
        KhedmatPalette
          .surfaceSoft,
    },

    composerInputBox: {
      flex: 1,

      minHeight: 44,

      maxHeight: 120,

      paddingHorizontal:
        Spacing.md,

      alignItems: "center",

      borderRadius: Radius.xl,

      backgroundColor:
        KhedmatPalette
          .surfaceSoft,

      borderWidth: 1,

      borderColor:
        KhedmatPalette.border,
    },

    composerInput: {
      flex: 1,

      minHeight: 42,

      maxHeight: 108,

      paddingTop: 10,

      paddingBottom: 9,

      fontFamily: Fonts.regular,

      fontSize: 15,

      lineHeight: 21,

      color:
        KhedmatPalette
          .textPrimary,
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