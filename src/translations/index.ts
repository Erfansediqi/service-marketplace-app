import dari from "./dari";
import en from "./en";
import pashto from "./pashto";

const translations = {
  English: en,
  Dari: dari,
  Pashto: pashto,
} as const;

// This dynamically extracts your language names and translation keys from en.ts
export type Language = keyof typeof translations;
export type TranslationKeys = keyof typeof en;

export { translations };
