import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ComponentProps, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSupabaseAuth } from "../context/supabase-auth-context";
import { ProviderAccountRepository } from "../repositories/provider-account-repository";
import { ProviderVerificationRepository } from "../repositories/provider-verification-repository";
import {
  createLocalProviderProfile,
  type ProviderRegistrationData,
} from "../services/provider-profile-factory";
import { addLocalProvider } from "../services/provider-storage";
import { ProviderVerificationStorage } from "../services/provider-verification-storage";

import {
  Fonts,
  KhedmatPalette,
  Layout,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "../constants/theme";
import { useLanguage } from "../context/languagecontext";

type IconName = ComponentProps<typeof Ionicons>["name"];

type LanguageName = "English" | "Dari" | "Pashto";

type UploadType = "profile-photo" | "identity-front" | "identity-back";

type UploadedImages = {
  profilePhoto: string | null;
  identityFront: string | null;
  identityBack: string | null;
};

type VerificationCopy = ReturnType<typeof getVerificationCopy>;

type UploadCardProps = {
  title: string;
  subtitle: string;
  icon: IconName;
  imageUri: string | null;
  isRtl: boolean;
  optional?: boolean;
  circularPreview?: boolean;
  completeText: string;
  selectText: string;
  changeText: string;
  removeLabel: string;
  onSelect: () => void;
  onRemove: () => void;
};

const CURRENT_STEP = 6;
const TOTAL_STEPS = 6;
const MINIMUM_IDENTITY_LENGTH = 5;

const ERROR = "#B3261E";
const ERROR_SOFT = "#FCE8E6";
const SUCCESS = "#268A57";
const SUCCESS_SOFT = "#E8F6EE";
const WARNING = "#8A5A00";
const WARNING_SOFT = "#FFF4D6";

export default function ProviderVerificationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const { user } = useSupabaseAuth();

  const { language } = useLanguage();

  const activeLanguage = normalizeLanguage(language);

  const isRtl = activeLanguage === "Dari" || activeLanguage === "Pashto";

  const localizedDigits = activeLanguage !== "English";

  const copy = getVerificationCopy(activeLanguage);

  const [identityNumber, setIdentityNumber] = useState("");

  const [images, setImages] = useState<UploadedImages>({
    profilePhoto: null,
    identityFront: null,
    identityBack: null,
  });

  const [acceptedDeclaration, setAcceptedDeclaration] = useState(false);

  const [submitted, setSubmitted] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmedIdentityNumber = identityNumber.trim();

  const identityNumberError =
    submitted && trimmedIdentityNumber.length < MINIMUM_IDENTITY_LENGTH
      ? copy.identityNumberError
      : undefined;

  const profilePhotoError =
    submitted && !images.profilePhoto ? copy.profilePhotoError : undefined;

  const identityFrontError =
    submitted && !images.identityFront ? copy.identityFrontError : undefined;

  const declarationError =
    submitted && !acceptedDeclaration ? copy.declarationError : undefined;

  const formIsValid =
    trimmedIdentityNumber.length >= MINIMUM_IDENTITY_LENGTH &&
    Boolean(images.profilePhoto) &&
    Boolean(images.identityFront) &&
    acceptedDeclaration;

  const completedRequiredItems = [
    trimmedIdentityNumber.length >= MINIMUM_IDENTITY_LENGTH,
    Boolean(images.profilePhoto),
    Boolean(images.identityFront),
    acceptedDeclaration,
  ].filter(Boolean).length;

  const completionPercentage = Math.round((completedRequiredItems / 4) * 100);

  const requestMediaPermission = async () => {
    const result = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!result.granted) {
      Alert.alert(copy.permissionTitle, copy.permissionMessage);

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
      aspect: type === "profile-photo" ? [1, 1] : [4, 3],
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
  function getParam(value: string | string[] | undefined): string {
    return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
  }

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

    if (submitted) {
      setSubmitted(false);
    }
  };

  const handleIdentityChange = (value: string) => {
    setIdentityNumber(value);

    if (submitted) {
      setSubmitted(false);
    }
  };

  const toggleDeclaration = () => {
    setAcceptedDeclaration((current) => !current);

    if (submitted) {
      setSubmitted(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitted(true);

    if (!formIsValid || isSubmitting) {
      return;
    }

    if (!user) {
      Alert.alert(
        copy.submissionFailedTitle,
        "You must be signed in before submitting a provider account.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const registration: ProviderRegistrationData = {
        category: getParam(params.category),
        services: getParam(params.services),
        experience: getParam(params.experience),

        businessName: getParam(params.businessName),
        description: getParam(params.description),

        province: getParam(params.province),
        provinceName: getParam(params.provinceName),

        district: getParam(params.district),
        districtName: getParam(params.districtName),

        radius: getParam(params.radius),
        serviceModes: getParam(params.serviceModes),

        workingDays: getParam(params.workingDays),
        startTime: getParam(params.startTime),
        endTime: getParam(params.endTime),

        urgentRequests: getParam(params.urgentRequests),
        availableToday: getParam(params.availableToday),
      };

      /*
       * Build the existing local ProviderProfile first so the current provider
       * workspace can keep using the same UI/data shape while Supabase becomes
       * the authoritative backend.
       */
      const localProviderDraft = createLocalProviderProfile(registration);

      const serviceModes = registration.serviceModes
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const remoteDraft = await ProviderAccountRepository.createProviderDraft({
        ownerUserId: user.id,

        businessName: localProviderDraft.name,
        profession: localProviderDraft.profession,
        description: localProviderDraft.description,

        categoryId: localProviderDraft.categoryId,

        provinceId: localProviderDraft.provinceId,
        provinceName: localProviderDraft.provinceName,

        districtId: localProviderDraft.districtId,
        districtName: localProviderDraft.districtName,

        locationLabel: localProviderDraft.locationLabel,

        latitude: localProviderDraft.latitude,
        longitude: localProviderDraft.longitude,

        availableToday: localProviderDraft.availableToday,
        acceptsUrgentRequests: localProviderDraft.acceptsUrgentRequests,
        instantBooking: localProviderDraft.instantBooking,

        yearsExperience: localProviderDraft.yearsExperience,

        serviceRadiusKm: localProviderDraft.serviceRadiusKm,
        workingDays: localProviderDraft.workingDays,

        startTime: localProviderDraft.startTime,
        endTime: localProviderDraft.endTime,

        serviceModes,

        services: localProviderDraft.services.map((service) => ({
          serviceId: service.id,
          estimatedPrice: service.estimatedPrice,
        })),
      });

      /*
       * Upload verification evidence before moving the provider account to
       * `pending`. These objects live in the private provider-verification bucket
       * and are accessible only through Storage RLS.
       */
      const uploadedVerification =
        await ProviderVerificationStorage.uploadVerificationImages({
          ownerUserId: user.id,
          providerId: remoteDraft.provider.id,
          profilePhotoUri: images.profilePhoto!,
          identityFrontUri: images.identityFront!,
          identityBackUri: images.identityBack,
        });

      const uploadedPaths = [
        uploadedVerification.profilePhoto.path,
        uploadedVerification.identityFront.path,
        uploadedVerification.identityBack?.path,
      ].filter((path): path is string => Boolean(path));

      try {
        await ProviderVerificationRepository.saveSubmission({
          providerId: remoteDraft.provider.id,
          ownerUserId: user.id,
          identityNumber: trimmedIdentityNumber,
          profilePhotoPath: uploadedVerification.profilePhoto.path,
          identityFrontPath: uploadedVerification.identityFront.path,
          identityBackPath: uploadedVerification.identityBack?.path ?? null,
          declarationAcceptedAt: new Date().toISOString(),
        });
      } catch (error) {
        /*
         * If metadata persistence fails, remove the freshly uploaded private
         * files so the user does not leave orphaned identity documents behind.
         */
        try {
          await ProviderVerificationStorage.removeFiles(uploadedPaths);
        } catch (cleanupError) {
          console.warn(
            "Could not clean up verification uploads after metadata failure:",
            cleanupError,
          );
        }

        throw error;
      }

      /*
       * Only submit the provider for review after both the provider/service data
       * and private verification evidence have been persisted successfully.
       */
      const submittedProvider =
        await ProviderAccountRepository.submitProviderAccount(
          remoteDraft.provider.id,
        );

      /*
       * Keep a local mirror temporarily because the existing provider workspace
       * still reads ProviderProfile from AsyncStorage. The Supabase UUID becomes
       * the shared provider ID across local UI state and the remote database.
       */
      const provider = {
        ...localProviderDraft,
        id: submittedProvider.id,
        verified: submittedProvider.verification_status === "verified",
      };

      await addLocalProvider(provider);

      /*
       * Sensitive verification data is intentionally never copied into
       * AsyncStorage. The local mirror contains only marketplace-facing provider
       * data; identity metadata and evidence remain in private Supabase storage.
       */
      router.replace({
        pathname: "/provider-submitted",
        params: {
          providerId: submittedProvider.id,
        },
      } as never);
    } catch (error) {
      console.error("Provider application submission failed:", error);

      Alert.alert(
        copy.submissionFailedTitle,
        error instanceof Error && error.message
          ? error.message
          : copy.submissionFailedMessage,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View
            style={[
              styles.topBar,
              {
                flexDirection: isRtl ? "row-reverse" : "row",
              },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.back}
              hitSlop={8}
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name={isRtl ? "chevron-forward" : "chevron-back"}
                size={24}
                color={KhedmatPalette.navy900}
              />
            </Pressable>

            <View style={styles.stepBadge}>
              <Text style={[styles.stepText, directionStyle(isRtl)]}>
                {copy.step(
                  formatDigits(CURRENT_STEP.toString(), localizedDigits),
                  formatDigits(TOTAL_STEPS.toString(), localizedDigits),
                )}
              </Text>
            </View>
          </View>

          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons
                name="shield-checkmark-outline"
                size={32}
                color={KhedmatPalette.white}
              />
            </View>

            <View
              style={[
                styles.headerCopy,
                {
                  alignItems: isRtl ? "flex-end" : "flex-start",
                },
              ]}
            >
              <Text style={[styles.eyebrow, directionStyle(isRtl)]}>
                {copy.eyebrow}
              </Text>

              <Text style={[styles.title, directionStyle(isRtl)]}>
                {copy.title}
              </Text>

              <Text style={[styles.subtitle, directionStyle(isRtl)]}>
                {copy.subtitle}
              </Text>
            </View>
          </View>

          <View style={styles.progressCard}>
            <View
              style={[
                styles.progressTopRow,
                {
                  flexDirection: isRtl ? "row-reverse" : "row",
                },
              ]}
            >
              <View
                style={[
                  styles.progressIcon,
                  completionPercentage === 100 && styles.progressIconComplete,
                ]}
              >
                <Ionicons
                  name={
                    completionPercentage === 100
                      ? "checkmark"
                      : "document-text-outline"
                  }
                  size={21}
                  color={
                    completionPercentage === 100
                      ? KhedmatPalette.white
                      : KhedmatPalette.blue500
                  }
                />
              </View>

              <View
                style={[
                  styles.progressCopy,
                  {
                    alignItems: isRtl ? "flex-end" : "flex-start",
                  },
                ]}
              >
                <Text style={[styles.progressTitle, directionStyle(isRtl)]}>
                  {copy.verificationProgress}
                </Text>

                <Text style={[styles.progressSubtitle, directionStyle(isRtl)]}>
                  {copy.completedItems(
                    formatDigits(
                      completedRequiredItems.toString(),
                      localizedDigits,
                    ),
                    formatDigits("4", localizedDigits),
                  )}
                </Text>
              </View>

              <Text style={styles.progressPercentage}>
                {formatDigits(completionPercentage.toString(), localizedDigits)}
                %
              </Text>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${completionPercentage}%`,
                  },
                  completionPercentage === 100 && styles.progressFillComplete,
                ]}
              />
            </View>
          </View>

          <View style={styles.form}>
            <View style={styles.section}>
              <View
                style={[
                  styles.sectionHeader,
                  {
                    alignItems: isRtl ? "flex-end" : "flex-start",
                  },
                ]}
              >
                <View
                  style={[
                    styles.sectionTitleRow,
                    {
                      flexDirection: isRtl ? "row-reverse" : "row",
                    },
                  ]}
                >
                  <Text style={[styles.sectionTitle, directionStyle(isRtl)]}>
                    {copy.profilePhoto}
                  </Text>

                  <Text style={[styles.requiredLabel, directionStyle(isRtl)]}>
                    {copy.required}
                  </Text>
                </View>

                <Text style={[styles.sectionSubtitle, directionStyle(isRtl)]}>
                  {copy.profilePhotoSubtitle}
                </Text>
              </View>

              <UploadCard
                title={copy.clearFacePhoto}
                subtitle={copy.clearFacePhotoSubtitle}
                icon="person-outline"
                imageUri={images.profilePhoto}
                isRtl={isRtl}
                circularPreview
                completeText={copy.imageSelected}
                selectText={copy.selectImage}
                changeText={copy.changeImage}
                removeLabel={copy.removeImage}
                onSelect={() => selectImage("profile-photo")}
                onRemove={() => removeImage("profile-photo")}
              />

              {profilePhotoError ? (
                <ErrorText text={profilePhotoError} isRtl={isRtl} />
              ) : null}
            </View>

            <View style={styles.section}>
              <View
                style={[
                  styles.sectionHeader,
                  {
                    alignItems: isRtl ? "flex-end" : "flex-start",
                  },
                ]}
              >
                <View
                  style={[
                    styles.sectionTitleRow,
                    {
                      flexDirection: isRtl ? "row-reverse" : "row",
                    },
                  ]}
                >
                  <Text style={[styles.sectionTitle, directionStyle(isRtl)]}>
                    {copy.identityInformation}
                  </Text>

                  <Text style={[styles.requiredLabel, directionStyle(isRtl)]}>
                    {copy.required}
                  </Text>
                </View>

                <Text style={[styles.sectionSubtitle, directionStyle(isRtl)]}>
                  {copy.identityInformationSubtitle}
                </Text>
              </View>

              <View style={styles.field}>
                <Text style={[styles.fieldLabel, directionStyle(isRtl)]}>
                  {copy.identityNumber}
                </Text>

                <View
                  style={[
                    styles.inputContainer,
                    {
                      flexDirection: isRtl ? "row-reverse" : "row",
                    },
                    identityNumberError && styles.controlError,
                  ]}
                >
                  <View
                    style={[
                      styles.inputIcon,
                      trimmedIdentityNumber.length >= MINIMUM_IDENTITY_LENGTH &&
                        styles.inputIconComplete,
                    ]}
                  >
                    <Ionicons
                      name="card-outline"
                      size={20}
                      color={
                        trimmedIdentityNumber.length >= MINIMUM_IDENTITY_LENGTH
                          ? KhedmatPalette.white
                          : KhedmatPalette.blue500
                      }
                    />
                  </View>

                  <TextInput
                    value={identityNumber}
                    onChangeText={handleIdentityChange}
                    placeholder={copy.identityNumberPlaceholder}
                    placeholderTextColor={KhedmatPalette.textMuted}
                    selectionColor={KhedmatPalette.blue500}
                    keyboardType="default"
                    returnKeyType="done"
                    autoCorrect={false}
                    maxLength={80}
                    style={[styles.textInput, directionStyle(isRtl)]}
                  />

                  {trimmedIdentityNumber.length >= MINIMUM_IDENTITY_LENGTH ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={SUCCESS}
                    />
                  ) : null}
                </View>

                {identityNumberError ? (
                  <ErrorText text={identityNumberError} isRtl={isRtl} />
                ) : (
                  <Text style={[styles.fieldHint, directionStyle(isRtl)]}>
                    {copy.identityNumberHint}
                  </Text>
                )}
              </View>

              <UploadCard
                title={copy.identityFront}
                subtitle={copy.identityFrontSubtitle}
                icon="card-outline"
                imageUri={images.identityFront}
                isRtl={isRtl}
                completeText={copy.imageSelected}
                selectText={copy.selectImage}
                changeText={copy.changeImage}
                removeLabel={copy.removeImage}
                onSelect={() => selectImage("identity-front")}
                onRemove={() => removeImage("identity-front")}
              />

              {identityFrontError ? (
                <ErrorText text={identityFrontError} isRtl={isRtl} />
              ) : null}

              <UploadCard
                title={copy.identityBack}
                subtitle={copy.identityBackSubtitle}
                icon="documents-outline"
                imageUri={images.identityBack}
                isRtl={isRtl}
                optional
                completeText={copy.imageSelected}
                selectText={copy.selectImage}
                changeText={copy.changeImage}
                removeLabel={copy.removeImage}
                onSelect={() => selectImage("identity-back")}
                onRemove={() => removeImage("identity-back")}
              />
            </View>

            <View
              style={[
                styles.securityCard,
                {
                  flexDirection: isRtl ? "row-reverse" : "row",
                },
              ]}
            >
              <View style={styles.securityIcon}>
                <Ionicons
                  name="lock-closed-outline"
                  size={22}
                  color={SUCCESS}
                />
              </View>

              <View
                style={[
                  styles.securityCopy,
                  {
                    alignItems: isRtl ? "flex-end" : "flex-start",
                  },
                ]}
              >
                <Text style={[styles.securityTitle, directionStyle(isRtl)]}>
                  {copy.informationConfidential}
                </Text>

                <Text style={[styles.securitySubtitle, directionStyle(isRtl)]}>
                  {copy.informationConfidentialSubtitle}
                </Text>
              </View>
            </View>

            <Pressable
              accessibilityRole="checkbox"
              accessibilityLabel={copy.declaration}
              accessibilityState={{
                checked: acceptedDeclaration,
              }}
              onPress={toggleDeclaration}
              style={({ pressed }) => [
                styles.declarationCard,
                acceptedDeclaration && styles.declarationCardSelected,
                declarationError && styles.declarationCardError,
                pressed && styles.declarationPressed,
              ]}
            >
              <View
                style={[
                  styles.declarationContent,
                  {
                    flexDirection: isRtl ? "row-reverse" : "row",
                  },
                ]}
              >
                <View
                  style={[
                    styles.checkbox,
                    acceptedDeclaration && styles.checkboxSelected,
                  ]}
                >
                  {acceptedDeclaration ? (
                    <Ionicons
                      name="checkmark"
                      size={17}
                      color={KhedmatPalette.white}
                    />
                  ) : null}
                </View>

                <View
                  style={[
                    styles.declarationCopy,
                    {
                      alignItems: isRtl ? "flex-end" : "flex-start",
                    },
                  ]}
                >
                  <Text
                    style={[styles.declarationTitle, directionStyle(isRtl)]}
                  >
                    {copy.declarationTitle}
                  </Text>

                  <Text style={[styles.declarationText, directionStyle(isRtl)]}>
                    {copy.declaration}
                  </Text>
                </View>
              </View>
            </Pressable>

            {declarationError ? (
              <ErrorText text={declarationError} isRtl={isRtl} />
            ) : null}

            <View
              style={[
                styles.reviewNotice,
                {
                  flexDirection: isRtl ? "row-reverse" : "row",
                },
              ]}
            >
              <View style={styles.reviewNoticeIcon}>
                <Ionicons name="time-outline" size={22} color={WARNING} />
              </View>

              <View
                style={[
                  styles.reviewNoticeCopy,
                  {
                    alignItems: isRtl ? "flex-end" : "flex-start",
                  },
                ]}
              >
                <Text style={[styles.reviewNoticeTitle, directionStyle(isRtl)]}>
                  {copy.reviewTimeTitle}
                </Text>

                <Text style={[styles.reviewNoticeText, directionStyle(isRtl)]}>
                  {copy.reviewTimeText}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.submit}
              accessibilityState={{
                busy: isSubmitting,
              }}
              disabled={isSubmitting}
              onPress={handleSubmit}
              style={({ pressed }) => [
                styles.primaryButton,
                isSubmitting && styles.primaryButtonDisabled,
                pressed && !isSubmitting && styles.primaryButtonPressed,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={KhedmatPalette.white} />
              ) : (
                <View
                  style={[
                    styles.primaryButtonContent,
                    {
                      flexDirection: isRtl ? "row-reverse" : "row",
                    },
                  ]}
                >
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={20}
                    color={KhedmatPalette.white}
                  />

                  <Text
                    style={[styles.primaryButtonText, directionStyle(isRtl)]}
                  >
                    {copy.submit}
                  </Text>
                </View>
              )}
            </Pressable>

            <View
              style={[
                styles.footerHintRow,
                {
                  flexDirection: isRtl ? "row-reverse" : "row",
                },
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={14}
                color={KhedmatPalette.textMuted}
              />

              <Text style={[styles.helperText, directionStyle(isRtl)]}>
                {copy.helperText}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function UploadCard({
  title,
  subtitle,
  icon,
  imageUri,
  isRtl,
  optional = false,
  circularPreview = false,
  completeText,
  selectText,
  changeText,
  removeLabel,
  onSelect,
  onRemove,
}: UploadCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onSelect}
      style={({ pressed }) => [
        styles.uploadCard,
        imageUri && styles.uploadCardComplete,
        pressed && styles.uploadCardPressed,
      ]}
    >
      <View
        style={[
          styles.uploadContent,
          {
            flexDirection: isRtl ? "row-reverse" : "row",
          },
        ]}
      >
        {imageUri ? (
          <Image
            source={{
              uri: imageUri,
            }}
            style={[
              styles.previewImage,
              circularPreview && styles.circularPreview,
            ]}
          />
        ) : (
          <View style={styles.uploadIcon}>
            <Ionicons name={icon} size={24} color={KhedmatPalette.blue500} />
          </View>
        )}

        <View
          style={[
            styles.uploadCopy,
            {
              alignItems: isRtl ? "flex-end" : "flex-start",
            },
          ]}
        >
          <View
            style={[
              styles.uploadTitleRow,
              {
                flexDirection: isRtl ? "row-reverse" : "row",
              },
            ]}
          >
            <Text style={[styles.uploadTitle, directionStyle(isRtl)]}>
              {title}
            </Text>

            {optional ? (
              <View style={styles.optionalBadge}>
                <Text style={[styles.optionalLabel, directionStyle(isRtl)]}>
                  {isRtl ? "اختیاری" : "Optional"}
                </Text>
              </View>
            ) : null}
          </View>

          <Text
            style={[
              styles.uploadSubtitle,
              imageUri && styles.uploadSubtitleComplete,
              directionStyle(isRtl),
            ]}
          >
            {imageUri ? completeText : subtitle}
          </Text>

          <Text style={[styles.uploadAction, directionStyle(isRtl)]}>
            {imageUri ? changeText : selectText}
          </Text>
        </View>

        {imageUri ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={removeLabel}
            hitSlop={8}
            onPress={(event) => {
              event.stopPropagation();
              onRemove();
            }}
            style={({ pressed }) => [
              styles.removeButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="trash-outline" size={18} color={ERROR} />
          </Pressable>
        ) : (
          <View style={styles.addButton}>
            <Ionicons name="add" size={20} color={KhedmatPalette.blue500} />
          </View>
        )}
      </View>
    </Pressable>
  );
}

type ErrorTextProps = {
  text: string;
  isRtl: boolean;
};

function ErrorText({ text, isRtl }: ErrorTextProps) {
  return (
    <View
      style={[
        styles.errorRow,
        {
          flexDirection: isRtl ? "row-reverse" : "row",
        },
      ]}
    >
      <Ionicons name="alert-circle-outline" size={15} color={ERROR} />

      <Text style={[styles.errorText, directionStyle(isRtl)]}>{text}</Text>
    </View>
  );
}

function normalizeLanguage(language: string): LanguageName {
  if (language === "Dari") {
    return "Dari";
  }

  if (language === "Pashto") {
    return "Pashto";
  }

  return "English";
}

function directionStyle(isRtl: boolean) {
  return {
    textAlign: isRtl ? ("right" as const) : ("left" as const),
    writingDirection: isRtl ? ("rtl" as const) : ("ltr" as const),
  };
}

function formatDigits(value: string, localized: boolean): string {
  if (!localized) {
    return value;
  }

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

  return value.replace(/\d/g, (digit) => digits[digit] ?? digit);
}

function getVerificationCopy(language: LanguageName) {
  if (language === "Dari") {
    return {
      back: "بازگشت",
      step: (current: string, total: string) => `مرحله ${current} از ${total}`,
      eyebrow: "تأیید هویت",
      title: "حساب حرفه‌ای خود را تأیید کنید",
      subtitle:
        "برای حفظ امنیت مشتریان و ارائه‌دهندگان، تصویر چهره و معلومات تذکرهٔ شما بررسی می‌شود.",
      verificationProgress: "پیشرفت تأیید",
      completedItems: (completed: string, total: string) =>
        `${completed} از ${total} مورد ضروری تکمیل شده`,
      profilePhoto: "عکس پروفایل",
      profilePhotoSubtitle:
        "یک عکس واضح، تازه و روبه‌رو از چهرهٔ خود انتخاب کنید.",
      required: "ضروری",
      clearFacePhoto: "عکس واضح چهره",
      clearFacePhotoSubtitle:
        "صورت شما باید کاملاً مشخص و بدون عینک تیره باشد.",
      identityInformation: "معلومات تذکره",
      identityInformationSubtitle:
        "شماره و تصاویر تذکره باید واضح و خوانا باشند.",
      identityNumber: "شمارهٔ تذکره",
      identityNumberPlaceholder: "شمارهٔ تذکره را وارد کنید",
      identityNumberHint: "شماره را دقیقاً مطابق سند هویتی وارد کنید.",
      identityFront: "روی تذکره",
      identityFrontSubtitle: "تصویر کامل بخش اصلی تذکره را اضافه کنید.",
      identityBack: "پشت تذکره",
      identityBackSubtitle:
        "در صورت وجود، تصویر پشت یا صفحهٔ دوم را اضافه کنید.",
      imageSelected: "تصویر با موفقیت انتخاب شد.",
      selectImage: "انتخاب تصویر",
      changeImage: "تغییر تصویر",
      removeImage: "حذف تصویر",
      informationConfidential: "معلومات شما محرمانه است",
      informationConfidentialSubtitle:
        "اسناد هویتی در پروفایل عمومی نمایش داده نمی‌شوند و فقط تیم بررسی به آن‌ها دسترسی خواهد داشت.",
      declarationTitle: "تأیید صحت معلومات",
      declaration:
        "تأیید می‌کنم که معلومات و تصاویر ارائه‌شده صحیح، متعلق به خودم و قابل بررسی هستند.",
      reviewTimeTitle: "بررسی حساب پس از ارسال",
      reviewTimeText:
        "درخواست شما برای بررسی ارسال می‌شود. پس از تصمیم تیم بررسی، وضعیت حساب در برنامه به‌روزرسانی خواهد شد.",
      submit: "ارسال درخواست بررسی",
      helperText:
        "معلومات هویتی شما فقط برای بررسی حساب استفاده می‌شود و به مشتریان نمایش داده نخواهد شد.",
      identityNumberError: "لطفاً شمارهٔ معتبر تذکره را وارد کنید.",
      profilePhotoError: "لطفاً یک عکس واضح از چهرهٔ خود اضافه کنید.",
      identityFrontError: "لطفاً تصویر روی تذکره را اضافه کنید.",
      declarationError: "برای ارسال درخواست باید این تأیید را بپذیرید.",
      permissionTitle: "اجازهٔ دسترسی لازم است",
      permissionMessage:
        "برای انتخاب تصویر، اجازهٔ دسترسی به عکس‌ها را فعال کنید.",
      submissionFailedTitle: "ارسال ناموفق بود",
      submissionFailedMessage:
        "در حال حاضر ارسال درخواست ممکن نیست. لطفاً دوباره تلاش کنید.",
    };
  }

  if (language === "Pashto") {
    return {
      back: "بېرته",
      step: (current: string, total: string) => `مرحله ${current} له ${total}`,
      eyebrow: "د هویت تایید",
      title: "خپل مسلکي حساب تایید کړئ",
      subtitle:
        "د پیرودونکو او خدمت وړاندې کوونکو د امنیت لپاره ستاسو د مخ عکس او د تذکرې معلومات کتل کېږي.",
      verificationProgress: "د تایید پرمختګ",
      completedItems: (completed: string, total: string) =>
        `${completed} له ${total} اړینو مواردو بشپړ شوي`,
      profilePhoto: "د پروفایل عکس",
      profilePhotoSubtitle: "د خپل مخ یو روښانه، نوی او مخامخ عکس وټاکئ.",
      required: "اړین",
      clearFacePhoto: "د مخ روښانه عکس",
      clearFacePhotoSubtitle:
        "ستاسو مخ باید بشپړ څرګند او له تورو عینکو پرته وي.",
      identityInformation: "د تذکرې معلومات",
      identityInformationSubtitle:
        "د تذکرې شمېره او عکسونه باید روښانه او لوستونکي وي.",
      identityNumber: "د تذکرې شمېره",
      identityNumberPlaceholder: "د تذکرې شمېره ولیکئ",
      identityNumberHint: "شمېره کټ مټ د هویت له سند سره سم ولیکئ.",
      identityFront: "د تذکرې مخ",
      identityFrontSubtitle: "د تذکرې د اصلي برخې بشپړ عکس ورزیات کړئ.",
      identityBack: "د تذکرې شا",
      identityBackSubtitle: "که موجود وي، د شا یا دوهمې پاڼې عکس ورزیات کړئ.",
      imageSelected: "عکس په بریالیتوب وټاکل شو.",
      selectImage: "عکس وټاکئ",
      changeImage: "عکس بدل کړئ",
      removeImage: "عکس لرې کړئ",
      informationConfidential: "ستاسو معلومات محرم دي",
      informationConfidentialSubtitle:
        "د هویت اسناد په عامه پروفایل کې نه ښکاري او یوازې د ارزونې ټیم ورته لاسرسی لري.",
      declarationTitle: "د معلوماتو د سموالي تایید",
      declaration:
        "تاییدوم چې ورکړل شوي معلومات او عکسونه سم، زما خپل او د ارزونې وړ دي.",
      reviewTimeTitle: "له لېږلو وروسته د حساب ارزونه",
      reviewTimeText:
        "ستاسو غوښتنلیک به ارزونې ته ولېږل شي. د ارزونې د ټیم له پرېکړې وروسته به د حساب حالت په اپلېکېشن کې تازه شي.",
      submit: "د ارزونې غوښتنلیک ولېږئ",
      helperText:
        "ستاسو د هویت معلومات یوازې د حساب د ارزونې لپاره کارول کېږي او پیرودونکو ته نه ښودل کېږي.",
      identityNumberError: "مهرباني وکړئ د تذکرې معتبره شمېره ولیکئ.",
      profilePhotoError: "مهرباني وکړئ د خپل مخ روښانه عکس ورزیات کړئ.",
      identityFrontError: "مهرباني وکړئ د تذکرې د مخ عکس ورزیات کړئ.",
      declarationError: "د غوښتنلیک د لېږلو لپاره باید دا تایید ومنئ.",
      permissionTitle: "د لاسرسي اجازه اړینه ده",
      permissionMessage: "د عکس د ټاکلو لپاره د عکسونو لاسرسی فعال کړئ.",
      submissionFailedTitle: "لېږل بریالي نه شول",
      submissionFailedMessage:
        "اوس مهال غوښتنلیک نه شي لېږل کېدای. مهرباني وکړئ بیا هڅه وکړئ.",
    };
  }

  return {
    back: "Back",
    step: (current: string, total: string) => `Step ${current} of ${total}`,
    eyebrow: "Identity verification",
    title: "Verify your professional account",
    subtitle:
      "To protect customers and providers, we review your face photo and identity-document information.",
    verificationProgress: "Verification progress",
    completedItems: (completed: string, total: string) =>
      `${completed} of ${total} required items completed`,
    profilePhoto: "Profile photo",
    profilePhotoSubtitle:
      "Choose a clear, recent, front-facing photo of yourself.",
    required: "Required",
    clearFacePhoto: "Clear face photo",
    clearFacePhotoSubtitle:
      "Your face must be fully visible and without dark glasses.",
    identityInformation: "Identity information",
    identityInformationSubtitle:
      "Your identity number and document images must be clear and readable.",
    identityNumber: "Identity-document number",
    identityNumberPlaceholder: "Enter your identity-document number",
    identityNumberHint:
      "Enter the number exactly as it appears on your identity document.",
    identityFront: "Front of identity document",
    identityFrontSubtitle:
      "Add a complete image of the main side of your identity document.",
    identityBack: "Back of identity document",
    identityBackSubtitle: "If applicable, add the back side or second page.",
    imageSelected: "Image selected successfully.",
    selectImage: "Select image",
    changeImage: "Change image",
    removeImage: "Remove image",
    informationConfidential: "Your information is confidential",
    informationConfidentialSubtitle:
      "Identity documents are not displayed on your public profile and are accessible only to the review team.",
    declarationTitle: "Information declaration",
    declaration:
      "I confirm that the information and images submitted are accurate, belong to me and may be reviewed.",
    reviewTimeTitle: "Account review after submission",
    reviewTimeText:
      "Your application will be submitted for review. The account status will be updated in the app after the review team makes a decision.",
    submit: "Submit for review",
    helperText:
      "Your identity information is used only for account review and will not be shown to customers.",
    identityNumberError: "Please enter a valid identity-document number.",
    profilePhotoError: "Please add a clear photo of your face.",
    identityFrontError: "Please add the front image of your identity document.",
    declarationError: "You must accept this declaration before submitting.",
    permissionTitle: "Photo access required",
    permissionMessage: "Enable photo-library access to select an image.",
    submissionFailedTitle: "Submission failed",
    submissionFailedMessage:
      "The application cannot be submitted right now. Please try again.",
  };
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: KhedmatPalette.blue050,
  },
  root: {
    flex: 1,
  },
  scrollContent: {
    width: "100%",
    maxWidth: Layout.contentMaxWidth,
    alignSelf: "center",
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: 170,
  },
  topBar: {
    width: "100%",
    minHeight: Layout.minimumTouchTarget,
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    backgroundColor: KhedmatPalette.surface,
  },
  stepBadge: {
    minHeight: 34,
    paddingHorizontal: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.pill,
    backgroundColor: KhedmatPalette.surfaceSoft,
  },
  stepText: {
    ...Typography.captionStyle,
    color: KhedmatPalette.blue500,
    fontFamily: Fonts.medium,
  },
  header: {
    width: "100%",
    marginTop: Spacing.xl,
    gap: Spacing.lg,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: Radius.xl,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.navy900,
    ...Shadows.small,
  },
  headerCopy: {
    width: "100%",
    gap: Spacing.sm,
  },
  eyebrow: {
    ...Typography.captionStyle,
    width: "100%",
    color: KhedmatPalette.blue500,
    fontFamily: Fonts.medium,
  },
  title: {
    ...Typography.screenTitle,
    width: "100%",
    maxWidth: 470,
    color: KhedmatPalette.textPrimary,
    fontSize: 27,
    lineHeight: 35,
  },
  subtitle: {
    ...Typography.bodyLarge,
    width: "100%",
    maxWidth: 470,
    color: KhedmatPalette.textSecondary,
    lineHeight: 25,
  },
  progressCard: {
    width: "100%",
    marginTop: Spacing.xxl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: KhedmatPalette.blue200,
    borderRadius: Radius.xl,
    backgroundColor: "#F4FBFC",
  },
  progressTopRow: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.md,
  },
  progressIcon: {
    width: 44,
    height: 44,
    flexShrink: 0,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.surface,
  },
  progressIconComplete: {
    backgroundColor: SUCCESS,
  },
  progressCopy: {
    flex: 1,
    gap: 2,
  },
  progressTitle: {
    ...Typography.label,
    width: "100%",
    color: KhedmatPalette.textPrimary,
    fontSize: 16,
  },
  progressSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: KhedmatPalette.textSecondary,
  },
  progressPercentage: {
    color: KhedmatPalette.navy900,
    fontFamily: Fonts.bold,
    fontSize: 17,
  },
  progressTrack: {
    width: "100%",
    height: 8,
    marginTop: Spacing.md,
    overflow: "hidden",
    borderRadius: Radius.pill,
    backgroundColor: KhedmatPalette.border,
  },
  progressFill: {
    height: "100%",
    borderRadius: Radius.pill,
    backgroundColor: KhedmatPalette.blue500,
  },
  progressFillComplete: {
    backgroundColor: SUCCESS,
  },
  form: {
    width: "100%",
    marginTop: Spacing.section,
    gap: Spacing.section,
  },
  section: {
    width: "100%",
    gap: Spacing.md,
  },
  sectionHeader: {
    width: "100%",
    gap: Spacing.xs,
  },
  sectionTitleRow: {
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  sectionTitle: {
    ...Typography.sectionTitle,
    flex: 1,
    color: KhedmatPalette.textPrimary,
    fontSize: 20,
    lineHeight: 27,
  },
  sectionSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: KhedmatPalette.textMuted,
    lineHeight: 18,
  },
  requiredLabel: {
    ...Typography.captionStyle,
    color: KhedmatPalette.blue500,
    fontFamily: Fonts.medium,
    fontSize: 10,
  },
  field: {
    width: "100%",
    gap: Spacing.sm,
  },
  fieldLabel: {
    ...Typography.label,
    width: "100%",
    color: KhedmatPalette.textPrimary,
    fontSize: 15,
  },
  inputContainer: {
    width: "100%",
    minHeight: Layout.controlHeight,
    paddingHorizontal: Spacing.md,
    alignItems: "center",
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    borderRadius: Radius.lg,
    backgroundColor: KhedmatPalette.surface,
    ...Shadows.small,
  },
  inputIcon: {
    width: 38,
    height: 38,
    flexShrink: 0,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.surfaceSoft,
  },
  inputIconComplete: {
    backgroundColor: KhedmatPalette.blue500,
  },
  textInput: {
    flex: 1,
    minHeight: Layout.controlHeight,
    paddingVertical: 0,
    color: KhedmatPalette.textPrimary,
    fontFamily: Fonts.regular,
    fontSize: Typography.body,
  },
  fieldHint: {
    ...Typography.captionStyle,
    width: "100%",
    color: KhedmatPalette.textMuted,
    lineHeight: 18,
  },
  controlError: {
    borderColor: ERROR,
    backgroundColor: "#FFF9F8",
  },
  uploadCard: {
    width: "100%",
    minHeight: 112,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor: KhedmatPalette.surface,
    ...Shadows.small,
  },
  uploadCardComplete: {
    borderColor: "#A9D9BD",
    backgroundColor: "#F5FCF8",
  },
  uploadCardPressed: {
    opacity: 0.88,
    transform: [
      {
        scale: 0.993,
      },
    ],
  },
  uploadContent: {
    width: "100%",
    minHeight: 112,
    padding: Spacing.lg,
    alignItems: "center",
    gap: Spacing.md,
  },
  uploadIcon: {
    width: 58,
    height: 58,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.surfaceSoft,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    borderStyle: "dashed",
  },
  previewImage: {
    width: 68,
    height: 56,
    flexShrink: 0,
    borderRadius: Radius.md,
    backgroundColor: KhedmatPalette.surfaceSoft,
  },
  circularPreview: {
    width: 64,
    height: 64,
    borderRadius: Radius.pill,
  },
  uploadCopy: {
    flex: 1,
    gap: 3,
  },
  uploadTitleRow: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.sm,
  },
  uploadTitle: {
    ...Typography.label,
    flexShrink: 1,
    color: KhedmatPalette.textPrimary,
    fontSize: 16,
  },
  optionalBadge: {
    flexShrink: 0,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    backgroundColor: KhedmatPalette.surfaceSoft,
  },
  optionalLabel: {
    ...Typography.captionStyle,
    color: KhedmatPalette.textMuted,
    fontSize: 9,
  },
  uploadSubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: KhedmatPalette.textSecondary,
    lineHeight: 18,
  },
  uploadSubtitleComplete: {
    color: SUCCESS,
    fontFamily: Fonts.medium,
  },
  uploadAction: {
    ...Typography.captionStyle,
    width: "100%",
    color: KhedmatPalette.blue500,
    fontFamily: Fonts.medium,
    marginTop: 2,
  },
  addButton: {
    width: 34,
    height: 34,
    flexShrink: 0,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.surfaceSoft,
  },
  removeButton: {
    width: 36,
    height: 36,
    flexShrink: 0,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ERROR_SOFT,
  },
  errorRow: {
    width: "100%",
    alignItems: "center",
    gap: 5,
  },
  errorText: {
    ...Typography.captionStyle,
    flex: 1,
    color: ERROR,
    lineHeight: 18,
  },
  securityCard: {
    width: "100%",
    minHeight: 108,
    padding: Spacing.lg,
    alignItems: "flex-start",
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: "#A9D9BD",
    borderRadius: Radius.xl,
    backgroundColor: "#F5FCF8",
  },
  securityIcon: {
    width: 46,
    height: 46,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SUCCESS_SOFT,
  },
  securityCopy: {
    flex: 1,
    gap: 3,
  },
  securityTitle: {
    ...Typography.label,
    width: "100%",
    color: KhedmatPalette.textPrimary,
    fontSize: 15,
  },
  securitySubtitle: {
    ...Typography.captionStyle,
    width: "100%",
    color: KhedmatPalette.textSecondary,
    lineHeight: 19,
  },
  declarationCard: {
    width: "100%",
    minHeight: 112,
    borderWidth: 1,
    borderColor: KhedmatPalette.border,
    borderRadius: Radius.xl,
    backgroundColor: KhedmatPalette.surface,
    ...Shadows.small,
  },
  declarationCardSelected: {
    borderColor: KhedmatPalette.blue500,
    backgroundColor: "#F4FBFC",
  },
  declarationCardError: {
    borderColor: ERROR,
    backgroundColor: "#FFF9F8",
  },
  declarationPressed: {
    opacity: 0.86,
    transform: [
      {
        scale: 0.993,
      },
    ],
  },
  declarationContent: {
    width: "100%",
    minHeight: 112,
    padding: Spacing.lg,
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  checkbox: {
    width: 28,
    height: 28,
    flexShrink: 0,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    borderColor: KhedmatPalette.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: KhedmatPalette.surface,
  },
  checkboxSelected: {
    borderColor: KhedmatPalette.blue500,
    backgroundColor: KhedmatPalette.blue500,
  },
  declarationCopy: {
    flex: 1,
    gap: 4,
  },
  declarationTitle: {
    ...Typography.label,
    width: "100%",
    color: KhedmatPalette.textPrimary,
    fontSize: 15,
  },
  declarationText: {
    ...Typography.bodyStyle,
    width: "100%",
    color: KhedmatPalette.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
  reviewNotice: {
    width: "100%",
    minHeight: 106,
    padding: Spacing.lg,
    alignItems: "flex-start",
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: "#E5C875",
    borderRadius: Radius.xl,
    backgroundColor: "#FFFDF6",
  },
  reviewNoticeIcon: {
    width: 46,
    height: 46,
    flexShrink: 0,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WARNING_SOFT,
  },
  reviewNoticeCopy: {
    flex: 1,
    gap: 3,
  },
  reviewNoticeTitle: {
    ...Typography.label,
    width: "100%",
    color: KhedmatPalette.textPrimary,
    fontSize: 15,
  },
  reviewNoticeText: {
    ...Typography.captionStyle,
    width: "100%",
    color: KhedmatPalette.textSecondary,
    lineHeight: 19,
  },
  footer: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: KhedmatPalette.border,
    backgroundColor: KhedmatPalette.surface,
  },
  footerContent: {
    width: "100%",
    maxWidth: Layout.contentMaxWidth,
    alignSelf: "center",
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  primaryButton: {
    width: "100%",
    minHeight: Layout.controlHeight,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.lg,
    backgroundColor: KhedmatPalette.navy900,
    ...Shadows.small,
  },
  primaryButtonDisabled: {
    opacity: 0.72,
  },
  primaryButtonPressed: {
    opacity: 0.84,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },
  primaryButtonContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  primaryButtonText: {
    ...Typography.label,
    color: KhedmatPalette.white,
    fontFamily: Fonts.medium,
    fontSize: 16,
  },
  footerHintRow: {
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  helperText: {
    ...Typography.captionStyle,
    flexShrink: 1,
    color: KhedmatPalette.textMuted,
    textAlign: "center",
  },
  pressed: {
    opacity: 0.76,
    transform: [
      {
        scale: 0.97,
      },
    ],
  },
});
