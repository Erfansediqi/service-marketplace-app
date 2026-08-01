import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import {
    useLocalSearchParams,
    useRouter,
} from "expo-router";
import { useState } from "react";
import {
    Alert,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { GlassButton } from "../components/glass/glass-button";
import { GlassIconButton } from "../components/glass/glass-icon-button";
import { GlassInput } from "../components/glass/glass-input";
import { GlassSurface } from "../components/glass/glass-surface";
import { AppScreen } from "../components/layout/app-screen";
import {
    Colors,
    Layout,
    Radius,
    Shadows,
    Spacing,
    Typography,
} from "../constants/theme";

type UploadType =
  | "profile-photo"
  | "identity-front"
  | "identity-back";

type UploadedImages = {
  profilePhoto: string | null;
  identityFront: string | null;
  identityBack: string | null;
};

export default function ProviderVerificationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [identityNumber, setIdentityNumber] = useState("");
  const [images, setImages] = useState<UploadedImages>({
    profilePhoto: null,
    identityFront: null,
    identityBack: null,
  });

  const [acceptedDeclaration, setAcceptedDeclaration] =
    useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const identityNumberError =
    submitted && identityNumber.trim().length < 5
      ? "لطفاً شمارهٔ معتبر تذکره را وارد کنید."
      : undefined;

  const profilePhotoError =
    submitted && !images.profilePhoto
      ? "لطفاً یک عکس واضح از چهرهٔ خود اضافه کنید."
      : undefined;

  const identityFrontError =
    submitted && !images.identityFront
      ? "لطفاً تصویر روی تذکره را اضافه کنید."
      : undefined;

  const declarationError =
    submitted && !acceptedDeclaration
      ? "برای ارسال درخواست باید این تأیید را بپذیرید."
      : undefined;

  const formIsValid =
    identityNumber.trim().length >= 5 &&
    Boolean(images.profilePhoto) &&
    Boolean(images.identityFront) &&
    acceptedDeclaration;

  const requestMediaPermission = async () => {
    const result =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!result.granted) {
      Alert.alert(
        "اجازهٔ دسترسی لازم است",
        "برای انتخاب تصویر، اجازهٔ دسترسی به عکس‌ها را فعال کنید.",
      );

      return false;
    }

    return true;
  };

  const selectImage = async (type: UploadType) => {
    const permissionGranted = await requestMediaPermission();

    if (!permissionGranted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect:
        type === "profile-photo"
          ? [1, 1]
          : [4, 3],
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]?.uri) {
      return;
    }

    const imageUri = result.assets[0].uri;

    setImages((current) => {
      if (type === "profile-photo") {
        return {
          ...current,
          profilePhoto: imageUri,
        };
      }

      if (type === "identity-front") {
        return {
          ...current,
          identityFront: imageUri,
        };
      }

      return {
        ...current,
        identityBack: imageUri,
      };
    });

    if (submitted) {
      setSubmitted(false);
    }
  };

  const removeImage = (type: UploadType) => {
    setImages((current) => {
      if (type === "profile-photo") {
        return {
          ...current,
          profilePhoto: null,
        };
      }

      if (type === "identity-front") {
        return {
          ...current,
          identityFront: null,
        };
      }

      return {
        ...current,
        identityBack: null,
      };
    });
  };

  const handleSubmit = async () => {
    setSubmitted(true);

    if (!formIsValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      const providerApplication = {
        ...params,
        identityNumber: identityNumber.trim(),
        profilePhoto: images.profilePhoto,
        identityFront: images.identityFront,
        identityBack: images.identityBack,
        declarationAccepted: acceptedDeclaration,
        status: "pending-review" as const,
      };

      console.log(
        "Provider application:",
        providerApplication,
      );

      /*
       * Later:
       * 1. Upload images to secure cloud storage.
       * 2. Save the provider application in the backend.
       * 3. Encrypt or restrict access to identity documents.
       * 4. Return a real application ID.
       */

      router.replace("/provider-submitted");
    } catch (error) {
      console.error(
        "Provider application submission failed:",
        error,
      );

      Alert.alert(
        "ارسال ناموفق بود",
        "در حال حاضر ارسال درخواست ممکن نیست. لطفاً دوباره تلاش کنید.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppScreen
      scrollable
      keyboardAware
      contentStyle={styles.screenContent}
      footer={
        <View style={styles.footer}>
          <GlassButton
            label="ارسال درخواست بررسی"
            icon="shield-checkmark-outline"
            iconPosition="left"
            loading={isSubmitting}
            onPress={handleSubmit}
          />

          <Text style={styles.helperText}>
            اطلاعات هویتی شما فقط برای بررسی حساب استفاده
            می‌شود و به مشتریان نمایش داده نخواهد شد.
          </Text>
        </View>
      }
    >
      <View style={styles.topBar}>
        <GlassIconButton
          icon="chevron-back"
          accessibilityLabel="بازگشت"
          onPress={() => router.back()}
        />

        <Text style={styles.stepText}>
          مرحله ۶ از ۶
        </Text>
      </View>

      <View style={styles.header}>
        <GlassSurface
          variant="prominent"
          radius={Radius.xxl}
          style={styles.headerIcon}
          contentStyle={styles.headerIconContent}
        >
          <Ionicons
            name="shield-checkmark-outline"
            size={34}
            color={Colors.primary}
          />
        </GlassSurface>

        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>
            تأیید هویت
          </Text>

          <Text style={styles.title}>
            حساب حرفه‌ای خود را تأیید کنید
          </Text>

          <Text style={styles.subtitle}>
            برای حفظ امنیت مشتریان و ارائه‌دهندگان، تصویر
            چهره و اطلاعات تذکرهٔ شما بررسی می‌شود.
          </Text>
        </View>
      </View>

      <View style={styles.form}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              عکس پروفایل
            </Text>

            <Text style={styles.sectionSubtitle}>
              یک عکس واضح، تازه و روبه‌رو از چهرهٔ خود
              انتخاب کنید.
            </Text>
          </View>

          <ImageUploadCard
            title="عکس واضح چهره"
            subtitle="صورت شما باید کاملاً مشخص و بدون عینک تیره باشد."
            icon="person-outline"
            imageUri={images.profilePhoto}
            circularPreview
            onSelect={() =>
              selectImage("profile-photo")
            }
            onRemove={() =>
              removeImage("profile-photo")
            }
          />

          {profilePhotoError ? (
            <Text style={styles.errorText}>
              {profilePhotoError}
            </Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              اطلاعات تذکره
            </Text>

            <Text style={styles.sectionSubtitle}>
              شماره و تصاویر تذکره باید واضح و خوانا باشند.
            </Text>
          </View>

          <GlassInput
            label="شمارهٔ تذکره"
            placeholder="شمارهٔ تذکره را وارد کنید"
            value={identityNumber}
            onChangeText={(value) => {
              setIdentityNumber(value);

              if (submitted) {
                setSubmitted(false);
              }
            }}
            keyboardType="default"
            returnKeyType="done"
            error={identityNumberError}
          />

          <ImageUploadCard
            title="روی تذکره"
            subtitle="تصویر کامل بخش اصلی تذکره را اضافه کنید."
            icon="card-outline"
            imageUri={images.identityFront}
            onSelect={() =>
              selectImage("identity-front")
            }
            onRemove={() =>
              removeImage("identity-front")
            }
          />

          {identityFrontError ? (
            <Text style={styles.errorText}>
              {identityFrontError}
            </Text>
          ) : null}

          <ImageUploadCard
            title="پشت تذکره"
            subtitle="در صورت وجود، تصویر پشت یا صفحهٔ دوم را اضافه کنید."
            icon="documents-outline"
            imageUri={images.identityBack}
            optional
            onSelect={() =>
              selectImage("identity-back")
            }
            onRemove={() =>
              removeImage("identity-back")
            }
          />
        </View>

        <View style={styles.securityNotice}>
          <GlassSurface
            variant="regular"
            radius={Radius.xl}
            style={styles.securitySurface}
            contentStyle={styles.securityContent}
          >
            <View style={styles.securityIcon}>
              <Ionicons
                name="lock-closed-outline"
                size={23}
                color={Colors.success}
              />
            </View>

            <View style={styles.securityCopy}>
              <Text style={styles.securityTitle}>
                اطلاعات شما محرمانه است
              </Text>

              <Text style={styles.securitySubtitle}>
                اسناد هویتی در پروفایل عمومی نمایش داده
                نمی‌شوند و فقط تیم بررسی به آن‌ها دسترسی
                خواهد داشت.
              </Text>
            </View>
          </GlassSurface>
        </View>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{
            checked: acceptedDeclaration,
          }}
          onPress={() => {
            setAcceptedDeclaration(
              (current) => !current,
            );

            if (submitted) {
              setSubmitted(false);
            }
          }}
          style={({ pressed }) => [
            styles.declarationPressable,
            pressed && styles.declarationPressed,
          ]}
        >
          <GlassSurface
            variant={
              acceptedDeclaration
                ? "prominent"
                : "regular"
            }
            radius={Radius.xl}
            style={[
              styles.declarationSurface,
              acceptedDeclaration &&
                styles.declarationSurfaceSelected,
            ]}
            contentStyle={styles.declarationContent}
          >
            <View
              style={[
                styles.checkbox,
                acceptedDeclaration &&
                  styles.checkboxSelected,
              ]}
            >
              {acceptedDeclaration ? (
                <Ionicons
                  name="checkmark"
                  size={17}
                  color={Colors.white}
                />
              ) : null}
            </View>

            <Text style={styles.declarationText}>
              تأیید می‌کنم که اطلاعات و تصاویر ارائه‌شده
              صحیح، متعلق به خودم و قابل بررسی هستند.
            </Text>
          </GlassSurface>
        </Pressable>

        {declarationError ? (
          <Text style={styles.errorText}>
            {declarationError}
          </Text>
        ) : null}
      </View>
    </AppScreen>
  );
}

type ImageUploadCardProps = {
  title: string;
  subtitle: string;
  icon:
    | "person-outline"
    | "card-outline"
    | "documents-outline";
  imageUri: string | null;
  optional?: boolean;
  circularPreview?: boolean;
  onSelect: () => void;
  onRemove: () => void;
};

function ImageUploadCard({
  title,
  subtitle,
  icon,
  imageUri,
  optional = false,
  circularPreview = false,
  onSelect,
  onRemove,
}: ImageUploadCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onSelect}
      style={({ pressed }) => [
        styles.uploadPressable,
        pressed && styles.uploadPressed,
      ]}
    >
      <GlassSurface
        variant={imageUri ? "prominent" : "regular"}
        radius={Radius.xl}
        style={[
          styles.uploadSurface,
          imageUri && styles.uploadSurfaceComplete,
          imageUri && Shadows.small,
        ]}
        contentStyle={styles.uploadContent}
      >
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={[
              styles.previewImage,
              circularPreview &&
                styles.circularPreview,
            ]}
          />
        ) : (
          <View style={styles.uploadIcon}>
            <Ionicons
              name={icon}
              size={25}
              color={Colors.primary}
            />
          </View>
        )}

        <View style={styles.uploadCopy}>
          <View style={styles.uploadTitleRow}>
            <Text style={styles.uploadTitle}>
              {title}
            </Text>

            {optional ? (
              <Text style={styles.optionalLabel}>
                اختیاری
              </Text>
            ) : null}
          </View>

          <Text style={styles.uploadSubtitle}>
            {imageUri
              ? "تصویر با موفقیت انتخاب شد."
              : subtitle}
          </Text>

          <Text style={styles.uploadAction}>
            {imageUri
              ? "تغییر تصویر"
              : "انتخاب تصویر"}
          </Text>
        </View>

        {imageUri ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="حذف تصویر"
            hitSlop={8}
            onPress={(event) => {
              event.stopPropagation();
              onRemove();
            }}
            style={styles.removeButton}
          >
            <Ionicons
              name="close"
              size={18}
              color={Colors.error}
            />
          </Pressable>
        ) : (
          <Ionicons
            name="add-circle-outline"
            size={24}
            color={Colors.textTertiary}
          />
        )}
      </GlassSurface>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.screen,
  },

  topBar: {
    minHeight: Layout.minimumTouchTarget,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  stepText: {
    ...Typography.captionStyle,
    color: Colors.textTertiary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  header: {
    marginTop: Spacing.xl,
    alignItems: "flex-end",
    gap: Spacing.xl,
  },

  headerIcon: {
    width: 72,
    height: 72,
    alignSelf: "flex-end",
    backgroundColor: "rgba(76, 141, 255, 0.10)",
    borderColor: "rgba(100, 158, 255, 0.28)",
  },

  headerIconContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  headerCopy: {
    width: "100%",
    alignItems: "flex-end",
    gap: Spacing.sm,
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
    ...Typography.bodyLarge,
    width: "100%",
    maxWidth: 450,
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 24,
  },

  form: {
    width: "100%",
    marginTop: Spacing.xxl,
    gap: Spacing.xxl,
  },

  section: {
    width: "100%",
    gap: Spacing.md,
  },

  sectionHeader: {
    width: "100%",
    alignItems: "flex-end",
    gap: Spacing.xs,
  },

  sectionTitle: {
    ...Typography.sectionTitle,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 20,
    lineHeight: 27,
  },

  sectionSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textTertiary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  uploadPressable: {
    width: "100%",
    borderRadius: Radius.xl,
  },

  uploadPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.994 }],
  },

  uploadSurface: {
    width: "100%",
  },

  uploadSurfaceComplete: {
    borderColor: "rgba(48, 183, 106, 0.50)",
    backgroundColor: "rgba(48, 183, 106, 0.07)",
  },

  uploadContent: {
    minHeight: 106,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
  },

  uploadIcon: {
    width: 54,
    height: 54,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primarySoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(76, 141, 255, 0.24)",
  },

  previewImage: {
    width: 64,
    height: 54,
    flexShrink: 0,
    borderRadius: Radius.md,
    backgroundColor: Colors.backgroundSoft,
  },

  circularPreview: {
    width: 58,
    height: 58,
    borderRadius: Radius.pill,
  },

  uploadCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: Spacing.xs,
  },

  uploadTitleRow: {
    width: "100%",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.sm,
  },

  uploadTitle: {
    ...Typography.label,
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
    fontSize: 17,
    lineHeight: 23,
  },

  optionalLabel: {
    ...Typography.captionStyle,
    color: Colors.textTertiary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  uploadSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 19,
  },

  uploadAction: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.primary,
    textAlign: "right",
    writingDirection: "rtl",
    fontWeight: "600",
  },

  removeButton: {
    width: 34,
    height: 34,
    flexShrink: 0,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(225, 90, 90, 0.10)",
  },

  errorText: {
    ...Typography.captionStyle,
    color: Colors.error,
    textAlign: "right",
    writingDirection: "rtl",
  },

  securityNotice: {
    width: "100%",
  },

  securitySurface: {
    width: "100%",
    borderColor: "rgba(48, 183, 106, 0.30)",
    backgroundColor: "rgba(48, 183, 106, 0.06)",
  },

  securityContent: {
    minHeight: 104,
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: Spacing.md,
    padding: Spacing.lg,
  },

  securityIcon: {
    width: 46,
    height: 46,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(48, 183, 106, 0.12)",
  },

  securityCopy: {
    flex: 1,
    alignItems: "flex-end",
    gap: Spacing.xs,
  },

  securityTitle: {
    ...Typography.label,
    width: "100%",
    color: Colors.textPrimary,
    textAlign: "right",
    writingDirection: "rtl",
  },

  securitySubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 19,
  },

  declarationPressable: {
    width: "100%",
    borderRadius: Radius.xl,
  },

  declarationPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.994 }],
  },

  declarationSurface: {
    width: "100%",
  },

  declarationSurfaceSelected: {
    borderColor: "rgba(76, 141, 255, 0.52)",
    backgroundColor: "rgba(76, 141, 255, 0.09)",
  },

  declarationContent: {
    minHeight: 92,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
  },

  checkbox: {
    width: 28,
    height: 28,
    flexShrink: 0,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.glass,
  },

  checkboxSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },

  declarationText: {
    ...Typography.bodyStyle,
    flex: 1,
    color: Colors.textSecondary,
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 22,
  },

  footer: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.sm,
  },

  helperText: {
    ...Typography.captionStyle,
    maxWidth: 360,
    color: Colors.textTertiary,
    textAlign: "center",
    writingDirection: "rtl",
  },
});