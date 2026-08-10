import dari from "./dari";
import en, { type TranslationKeys } from "./en";
import pashto from "./pashto";

const translations = {
  English: en,
  Dari: dari,
  Pashto: pashto,
} as const;

export type Language = keyof typeof translations;
export type { TranslationKeys };

  export { translations };
