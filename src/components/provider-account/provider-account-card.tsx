import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
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
import type { ProviderProfile } from "../../data/providers";

export type ProviderAccountCardProps = {
  provider: ProviderProfile;
  isActive: boolean;
  isDefault: boolean;
  isRtl: boolean;
  activeLabel: string;
  defaultLabel: string;
  setDefaultLabel: string;
  openLabel: string;
  renameLabel: string;
  disabled: boolean;
  onPress: () => void;
  onSetDefault: () => void;
  onRename: () => void;
};

export function ProviderAccountCard({
  provider,
  isActive,
  isDefault,
  isRtl,
  activeLabel,
  defaultLabel,
  setDefaultLabel,
  openLabel,
  renameLabel,
  disabled,
  onPress,
  onSetDefault,
  onRename,
}: ProviderAccountCardProps) {
  const [menuIsOpen, setMenuIsOpen] =
    useState(false);

  const closeMenu = (): void => {
    setMenuIsOpen(false);
  };

  const handleOpen = (): void => {
    closeMenu();
    onPress();
  };

  const handleRename = (): void => {
    closeMenu();
    onRename();
  };

  const handleSetDefault =
    (): void => {
      closeMenu();
      onSetDefault();
    };

  const accessibilitySummary = [
    provider.name,
    provider.profession,
    `${provider.rating.toFixed(1)} rating`,
    `${provider.reviewCount} reviews`,
    `${provider.services.length} services`,
    provider.verified
      ? "verified"
      : null,
    openLabel,
  ]
    .filter(Boolean)
    .join(". ");

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          accessibilitySummary
        }
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.accountCard,
          isActive &&
            styles.activeAccountCard,
          pressed &&
            styles.pressed,
          disabled &&
            styles.disabled,
        ]}
      >
        <View
          style={[
            styles.topRow,
            isRtl &&
              styles.rowReverse,
          ]}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {provider.initials}
            </Text>
          </View>

          <View
            style={styles.headingContent}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.providerName,
                directionStyle(isRtl),
              ]}
            >
              {provider.name}
            </Text>

            <Text
              numberOfLines={1}
              style={[
                styles.profession,
                directionStyle(isRtl),
              ]}
            >
              {provider.profession}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              renameLabel
            }
            disabled={disabled}
            hitSlop={8}
            onPress={(event) => {
              event.stopPropagation();
              setMenuIsOpen(true);
            }}
            style={({ pressed }) => [
              styles.menuButton,
              pressed &&
                styles.pressed,
              disabled &&
                styles.disabled,
            ]}
          >
            <Ionicons
              name="ellipsis-vertical"
              size={20}
              color={
                KhedmatPalette.navy700
              }
            />
          </Pressable>
        </View>

        <View
          style={[
            styles.statsRow,
            isRtl &&
              styles.rowReverse,
          ]}
        >
          <MetadataItem
            icon="star"
            value={`${provider.rating.toFixed(
              1,
            )} (${provider.reviewCount})`}
            isRtl={isRtl}
            accent
          />

          <MetadataDivider />

          <MetadataItem
            icon="construct-outline"
            value={provider.services.length.toString()}
            isRtl={isRtl}
          />

          {provider.verified ? (
            <>
              <MetadataDivider />

              <MetadataItem
                icon="shield-checkmark"
                value=""
                isRtl={isRtl}
                verified
              />
            </>
          ) : null}
        </View>

        <View
          style={[
            styles.locationRow,
            isRtl &&
              styles.rowReverse,
          ]}
        >
          <Ionicons
            name="location-outline"
            size={16}
            color={
              KhedmatPalette.textMuted
            }
          />

          <Text
            numberOfLines={1}
            style={[
              styles.locationText,
              directionStyle(isRtl),
            ]}
          >
            {provider.locationLabel}
          </Text>
        </View>

        <View
          style={styles.cardDivider}
        />

        <View
          style={[
            styles.footerRow,
            isRtl &&
              styles.rowReverse,
          ]}
        >
          <View
            style={[
              styles.badgesRow,
              isRtl &&
                styles.rowReverse,
            ]}
          >
            {isDefault ? (
              <StatusBadge
                icon="star"
                label={defaultLabel}
                tone="default"
                isRtl={isRtl}
              />
            ) : null}

            {isActive ? (
              <StatusBadge
                icon="time-outline"
                label={activeLabel}
                tone="active"
                isRtl={isRtl}
              />
            ) : null}
          </View>

          <View
            style={[
              styles.openHint,
              isRtl &&
                styles.rowReverse,
            ]}
          >
            <Text
              style={[
                styles.openHintText,
                directionStyle(isRtl),
              ]}
            >
              {openLabel}
            </Text>

            <Ionicons
              name={
                isRtl
                  ? "chevron-back"
                  : "chevron-forward"
              }
              size={18}
              color={
                KhedmatPalette.navy700
              }
            />
          </View>
        </View>
      </Pressable>

      <Modal
        animationType="fade"
        transparent
        visible={menuIsOpen}
        onRequestClose={closeMenu}
      >
        <View style={styles.menuBackdrop}>
          <Pressable
            style={
              StyleSheet.absoluteFill
            }
            onPress={closeMenu}
          />

          <View
            style={styles.menuSheet}
          >
            <View
              style={[
                styles.menuHeader,
                isRtl &&
                  styles.rowReverse,
              ]}
            >
              <View style={styles.menuAvatar}>
                <Text
                  style={
                    styles.menuAvatarText
                  }
                >
                  {provider.initials}
                </Text>
              </View>

              <View
                style={styles.menuHeading}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.menuProviderName,
                    directionStyle(isRtl),
                  ]}
                >
                  {provider.name}
                </Text>

                <Text
                  numberOfLines={1}
                  style={[
                    styles.menuProfession,
                    directionStyle(isRtl),
                  ]}
                >
                  {provider.profession}
                </Text>
              </View>

              {isDefault ? (
                <View
                  style={
                    styles.menuDefaultBadge
                  }
                >
                  <Ionicons
                    name="star"
                    size={14}
                    color={
                      KhedmatPalette.warning
                    }
                  />
                </View>
              ) : null}
            </View>

            <View
              style={styles.menuDivider}
            />

            <MenuAction
              icon="enter-outline"
              label={openLabel}
              isRtl={isRtl}
              onPress={handleOpen}
            />

            <MenuAction
              icon="create-outline"
              label={renameLabel}
              isRtl={isRtl}
              onPress={handleRename}
            />

            {!isDefault ? (
              <MenuAction
                icon="star-outline"
                label={setDefaultLabel}
                isRtl={isRtl}
                onPress={
                  handleSetDefault
                }
              />
            ) : null}
          </View>
        </View>
      </Modal>
    </>
  );
}

type MetadataItemProps = {
  icon:
    | "star"
    | "construct-outline"
    | "shield-checkmark";
  value: string;
  isRtl: boolean;
  accent?: boolean;
  verified?: boolean;
};

function MetadataItem({
  icon,
  value,
  isRtl,
  accent = false,
  verified = false,
}: MetadataItemProps) {
  const iconColor = verified
    ? KhedmatPalette.success
    : accent
      ? KhedmatPalette.warning
      : KhedmatPalette.textMuted;

  return (
    <View
      style={[
        styles.metadataItem,
        isRtl &&
          styles.rowReverse,
      ]}
    >
      <Ionicons
        name={icon}
        size={16}
        color={iconColor}
      />

      {value ? (
        <Text
          style={[
            styles.metadataText,
            directionStyle(isRtl),
          ]}
        >
          {value}
        </Text>
      ) : null}
    </View>
  );
}

function MetadataDivider() {
  return (
    <View
      style={styles.metadataDivider}
    />
  );
}

type StatusBadgeProps = {
  icon: "star" | "time-outline";
  label: string;
  tone: "default" | "active";
  isRtl: boolean;
};

function StatusBadge({
  icon,
  label,
  tone,
  isRtl,
}: StatusBadgeProps) {
  const isDefaultTone =
    tone === "default";

  return (
    <View
      style={[
        styles.statusBadge,
        isDefaultTone
          ? styles.defaultBadge
          : styles.activeBadge,
        isRtl &&
          styles.rowReverse,
      ]}
    >
      <Ionicons
        name={icon}
        size={13}
        color={
          isDefaultTone
            ? KhedmatPalette.warning
            : KhedmatPalette.success
        }
      />

      <Text
        numberOfLines={1}
        style={[
          styles.statusBadgeText,
          isDefaultTone
            ? styles.defaultBadgeText
            : styles.activeBadgeText,
          directionStyle(isRtl),
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

type MenuActionProps = {
  icon:
    | "enter-outline"
    | "create-outline"
    | "star-outline";
  label: string;
  isRtl: boolean;
  onPress: () => void;
};

function MenuAction({
  icon,
  label,
  isRtl,
  onPress,
}: MenuActionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuAction,
        isRtl &&
          styles.rowReverse,
        pressed &&
          styles.menuActionPressed,
      ]}
    >
      <View
        style={styles.menuActionIcon}
      >
        <Ionicons
          name={icon}
          size={20}
          color={
            KhedmatPalette.navy700
          }
        />
      </View>

      <Text
        style={[
          styles.menuActionLabel,
          directionStyle(isRtl),
        ]}
      >
        {label}
      </Text>

      <Ionicons
        name={
          isRtl
            ? "chevron-back"
            : "chevron-forward"
        }
        size={18}
        color={
          KhedmatPalette.textMuted
        }
      />
    </Pressable>
  );
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

const styles = StyleSheet.create({
  accountCard: {
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

  activeAccountCard: {
    borderColor:
      KhedmatPalette.blue500,
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },

  rowReverse: {
    flexDirection: "row-reverse",
  },

  avatar: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.pill,
    backgroundColor:
      KhedmatPalette.navy900,
  },

  avatarText: {
    fontFamily: Fonts.bold,
    fontSize: 17,
    color:
      KhedmatPalette.white,
  },

  headingContent: {
    flex: 1,
    minWidth: 0,
  },

  providerName: {
    ...Typography.label,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
  },

  profession: {
    ...Typography.captionStyle,
    width: "100%",
    marginTop: Spacing.xs,
    color:
      KhedmatPalette.textSecondary,
  },

  menuButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.pill,
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },

  metadataItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },

  metadataText: {
    ...Typography.captionStyle,
    color:
      KhedmatPalette.textSecondary,
  },

  metadataDivider: {
    width: 1,
    height: 16,
    backgroundColor:
      KhedmatPalette.border,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },

  locationText: {
    ...Typography.captionStyle,
    flex: 1,
    color:
      KhedmatPalette.textMuted,
  },

  cardDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.lg,
    backgroundColor:
      KhedmatPalette.border,
  },

  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
  },

  badgesRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },

  statusBadge: {
    maxWidth: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.pill,
  },

  defaultBadge: {
    backgroundColor:
      KhedmatPalette.warningSoft,
  },

  activeBadge: {
    backgroundColor:
      KhedmatPalette.successSoft,
  },

  statusBadgeText: {
    ...Typography.captionSmall,
    flexShrink: 1,
  },

  defaultBadgeText: {
    color:
      KhedmatPalette.warning,
  },

  activeBadgeText: {
    color:
      KhedmatPalette.success,
  },

  openHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },

  openHintText: {
    ...Typography.captionStyle,
    color:
      KhedmatPalette.navy700,
  },

  menuBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal:
      Layout.screenPadding,
    paddingBottom: Spacing.xl,
    backgroundColor:
      "rgba(0, 27, 72, 0.45)",
  },

  menuSheet: {
    width: "100%",
    maxWidth:
      Layout.contentMaxWidth,
    alignSelf: "center",
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    backgroundColor:
      KhedmatPalette.surface,
    ...Shadows.medium,
  },

  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },

  menuAvatar: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.pill,
    backgroundColor:
      KhedmatPalette.navy900,
  },

  menuAvatarText: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color:
      KhedmatPalette.white,
  },

  menuHeading: {
    flex: 1,
    minWidth: 0,
  },

  menuProviderName: {
    ...Typography.label,
    width: "100%",
    color:
      KhedmatPalette.textPrimary,
  },

  menuProfession: {
    ...Typography.captionStyle,
    width: "100%",
    marginTop: Spacing.xs,
    color:
      KhedmatPalette.textMuted,
  },

  menuDefaultBadge: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.pill,
    backgroundColor:
      KhedmatPalette.warningSoft,
  },

  menuDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.md,
    backgroundColor:
      KhedmatPalette.border,
  },

  menuAction: {
    minHeight:
      Layout.minimumTouchTarget,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.lg,
  },

  menuActionPressed: {
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },

  menuActionIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.pill,
    backgroundColor:
      KhedmatPalette.surfaceSoft,
  },

  menuActionLabel: {
    ...Typography.label,
    flex: 1,
    color:
      KhedmatPalette.textPrimary,
  },

  pressed: {
    opacity: 0.72,
  },

  disabled: {
    opacity: 0.55,
  },
});
