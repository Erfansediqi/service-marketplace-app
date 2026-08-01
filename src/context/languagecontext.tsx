import React, { createContext, ReactNode, useContext, useState } from "react";
import { Language, TranslationKeys, translations } from "../translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKeys) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "English",
  setLanguage: () => {},
  t: (key) => key,
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("English");

  const t = (key: TranslationKeys): string => {
    // Safely check if translations exist for the current language, fallback to English
    const currentLangDict = translations[language] || translations["English"];
    return currentLangDict[key] || translations["English"][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  return useContext(LanguageContext);
};
