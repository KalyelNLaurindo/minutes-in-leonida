/** Supported interface locales, ordered and detected without persisting a guess. */
export type Locale = "pt" | "en" | "es";

/** Match browser/device language preferences to the app's supported languages. */
export function detectBrowserLocale(preferredLanguages?: readonly string[]): Locale {
  const languages =
    preferredLanguages ??
    (typeof navigator === "undefined" ? [] : [...(navigator.languages ?? []), navigator.language]);

  for (const language of languages) {
    const baseLanguage = language.trim().toLowerCase().split(/[-_]/, 1)[0];
    if (baseLanguage === "pt" || baseLanguage === "en" || baseLanguage === "es") {
      return baseLanguage;
    }
  }

  return "pt";
}
