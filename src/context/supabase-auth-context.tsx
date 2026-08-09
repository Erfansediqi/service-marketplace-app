import type { Provider, Session, User } from "@supabase/supabase-js";
import {
  type PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import * as AuthSession from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";

import { supabase } from "../lib/supabase";

export type SupportedLanguage = "English" | "Dari" | "Pashto";

export type VerificationChannel = "whatsapp" | "sms";

type SendPhoneOtpInput = {
  phone: string;
  fullName: string;
  preferredLanguage: SupportedLanguage;
  channel: VerificationChannel;
};

type VerifyPhoneOtpInput = {
  phone: string;
  token: string;
};

type SupabaseAuthContextValue = {
  session: Session | null;
  user: User | null;
  isHydrated: boolean;
  isSendingOtp: boolean;
  isVerifyingOtp: boolean;
  isSocialSigningIn: boolean;

  sendPhoneOtp: (input: SendPhoneOtpInput) => Promise<void>;

  verifyPhoneOtp: (input: VerifyPhoneOtpInput) => Promise<Session>;

  signInWithSocialProvider: (
    provider: Extract<Provider, "google" | "apple">,
  ) => Promise<Session>;

  signOut: () => Promise<void>;
};

const SupabaseAuthContext = createContext<SupabaseAuthContextValue | null>(
  null,
);

function normalizePhoneNumber(value: string): string {
  const trimmedValue = value.trim();
  const digits = trimmedValue.replace(/\D/g, "");

  if (!digits) {
    throw new Error("A valid phone number is required.");
  }

  return trimmedValue.startsWith("+") ? `+${digits}` : digits;
}

function normalizeFullName(value: string): string {
  const normalizedValue = value.trim().replace(/\s+/g, " ");

  if (normalizedValue.length < 2) {
    throw new Error("A valid full name is required.");
  }

  return normalizedValue;
}

WebBrowser.maybeCompleteAuthSession();

const socialAuthRedirectUri =
  AuthSession.makeRedirectUri({
    scheme: "servicemarketplaceapp",
    path: "auth/callback",
  });

async function createSessionFromRedirectUrl(
  url: string,
): Promise<Session> {
  const {
    params,
    errorCode,
  } = QueryParams.getQueryParams(url);

  if (errorCode) {
    throw new Error(errorCode);
  }

  const accessToken =
    typeof params.access_token === "string"
      ? params.access_token
      : "";

  const refreshToken =
    typeof params.refresh_token === "string"
      ? params.refresh_token
      : "";

  if (!accessToken || !refreshToken) {
    throw new Error(
      "The social sign-in completed without a valid Supabase session.",
    );
  }

  const { data, error } =
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

  if (error) {
    throw error;
  }

  if (!data.session) {
    throw new Error(
      "Supabase did not return a session after social sign-in.",
    );
  }

  return data.session;
}

export function SupabaseAuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);

  const [isHydrated, setIsHydrated] = useState(false);

  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const [isSocialSigningIn, setIsSocialSigningIn] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const hydrateAuthentication = async (): Promise<void> => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (isMounted) {
          setSession(data.session);
        }
      } catch (error) {
        console.error("Failed to restore the Supabase session:", error);

        if (isMounted) {
          setSession(null);
        }
      } finally {
        if (isMounted) {
          setIsHydrated(true);
        }
      }
    };

    void hydrateAuthentication();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) {
        return;
      }

      setSession(nextSession);
      setIsHydrated(true);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const sendPhoneOtp = useCallback(
    async ({
      phone,
      fullName,
      preferredLanguage,
      channel,
    }: SendPhoneOtpInput): Promise<void> => {
      const normalizedPhone = normalizePhoneNumber(phone);

      const normalizedFullName = normalizeFullName(fullName);

      setIsSendingOtp(true);

      try {
        const { error } = await supabase.auth.signInWithOtp({
          phone: normalizedPhone,
          options: {
            shouldCreateUser: true,
            channel,
            data: {
              full_name: normalizedFullName,
              phone: normalizedPhone,
              role: "customer",
              preferred_language: preferredLanguage,
              verification_channel: channel,
            },
          },
        });

        if (error) {
          throw error;
        }
      } finally {
        setIsSendingOtp(false);
      }
    },
    [],
  );

  const verifyPhoneOtp = useCallback(
    async ({ phone, token }: VerifyPhoneOtpInput): Promise<Session> => {
      const normalizedPhone = normalizePhoneNumber(phone);

      const normalizedToken = token.replace(/\D/g, "");

      if (normalizedToken.length !== 6) {
        throw new Error("The verification code must contain six digits.");
      }

      setIsVerifyingOtp(true);

      try {
        const { data, error } = await supabase.auth.verifyOtp({
          phone: normalizedPhone,
          token: normalizedToken,
          type: "sms",
        });

        if (error) {
          throw error;
        }

        if (!data.session) {
          throw new Error(
            "Supabase verified the code but did not return an authenticated session.",
          );
        }

        setSession(data.session);

        return data.session;
      } finally {
        setIsVerifyingOtp(false);
      }
    },
    [],
  );

  const signInWithSocialProvider = useCallback(
    async (
      provider: Extract<Provider, "google" | "apple">,
    ): Promise<Session> => {
      setIsSocialSigningIn(true);

      try {
        const { data, error } =
          await supabase.auth.signInWithOAuth({
            provider,
            options: {
              redirectTo: socialAuthRedirectUri,
              skipBrowserRedirect: true,
            },
          });

        if (error) {
          throw error;
        }

        if (!data.url) {
          throw new Error(
            "Supabase did not return a social sign-in URL.",
          );
        }

        const result =
          await WebBrowser.openAuthSessionAsync(
            data.url,
            socialAuthRedirectUri,
          );

        if (result.type !== "success") {
          throw new Error(
            "Social sign-in was cancelled.",
          );
        }

        const nextSession =
          await createSessionFromRedirectUrl(
            result.url,
          );

        setSession(nextSession);

        return nextSession;
      } finally {
        setIsSocialSigningIn(false);
      }
    },
    [],
  );

  const signOut = useCallback(async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    setSession(null);
  }, []);

  const value = useMemo<SupabaseAuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isHydrated,
      isSendingOtp,
      isVerifyingOtp,
      isSocialSigningIn,
      sendPhoneOtp,
      verifyPhoneOtp,
      signInWithSocialProvider,
      signOut,
    }),
    [
      isHydrated,
      isSendingOtp,
      isVerifyingOtp,
      isSocialSigningIn,
      sendPhoneOtp,
      session,
      signInWithSocialProvider,
      signOut,
      verifyPhoneOtp,
    ],
  );

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}

export function useSupabaseAuth(): SupabaseAuthContextValue {
  const context = useContext(SupabaseAuthContext);

  if (!context) {
    throw new Error(
      "useSupabaseAuth must be used inside SupabaseAuthProvider.",
    );
  }

  return context;
}
