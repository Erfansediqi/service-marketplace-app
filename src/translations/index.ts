import dari from "./dari";
import en from "./en";
import pashto from "./pashto";

export const translations = {
  English: en,
  Dari: dari,
  Pashto: pashto,
};

export type Language = "English" | "Dari" | "Pashto";
export type TranslationKeys = keyof typeof en;
