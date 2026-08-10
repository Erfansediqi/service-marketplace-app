import React, {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { StorageService } from "../services/storage";
import {
  type Language,
  type TranslationKeys,
  translations,
} from "../translations";

const LANGUAGE_STORAGE_KEY = "@khedmat_selected_language";

type TextDirection = "ltr" | "rtl";
type RowDirection = "row" | "row-reverse";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKeys) => string;
  isRTL: boolean;
  textDirection: TextDirection;
  rowDirection: RowDirection;
  isHydrated: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

function isSupportedLanguage(value: unknown): value is Language {
  return (
    value === "English" ||
    value === "Dari" ||
    value === "Pashto"
  );
}

export function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [language, setLanguageState] =
    useState<Language>("English");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const hydrateLanguage = async () => {
      try {
        const storedLanguage =
          await StorageService.get<unknown>(
            LANGUAGE_STORAGE_KEY,
          );

        if (
          isMounted &&
          isSupportedLanguage(storedLanguage)
        ) {
          setLanguageState(storedLanguage);
        }
      } catch (error) {
        console.error(
          "Failed to hydrate the selected language:",
          error,
        );
      } finally {
        if (isMounted) {
          setIsHydrated(true);
        }
      }
    };

    void hydrateLanguage();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const persistLanguage = async () => {
      try {
        await StorageService.save(
          LANGUAGE_STORAGE_KEY,
          language,
        );
      } catch (error) {
        console.error(
          "Failed to persist the selected language:",
          error,
        );
      }
    };

    void persistLanguage();
  }, [isHydrated, language]);

  const setLanguage = useCallback(
    (nextLanguage: Language) => {
      setLanguageState(nextLanguage);
    },
    [],
  );

  const t = useCallback(
    (key: TranslationKeys): string => {
      return translations[language][key];
    },
    [language],
  );

  const isRTL =
    language === "Dari" || language === "Pashto";

  const value = useMemo<LanguageContextType>(
    () => ({
      language,
      setLanguage,
      t,
      isRTL,
      textDirection: isRTL ? "rtl" : "ltr",
      rowDirection: isRTL ? "row-reverse" : "row",
      isHydrated,
    }),
    [
      isHydrated,
      isRTL,
      language,
      setLanguage,
      t,
    ],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used within a LanguageProvider.",
    );
  }

  return context;
}