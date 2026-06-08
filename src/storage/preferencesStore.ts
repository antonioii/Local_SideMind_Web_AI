import type { LanguageCode, StoredPreferences, ThemeName } from "../types";

const DEFAULT_MEMORY = "You are a local LLM assistant running inside a chrome extension";

const DEFAULT_PREFERENCES: StoredPreferences = {
  theme: "light",
  language: "en",
  memory: DEFAULT_MEMORY
};

export async function loadPreferences(): Promise<StoredPreferences> {
  const stored = (await chrome.storage.local.get(
    DEFAULT_PREFERENCES as unknown as Record<string, string>
  )) as Partial<StoredPreferences>;
  return {
    theme: sanitizeTheme(stored.theme),
    language: sanitizeLanguage(stored.language),
    memory:
      typeof stored.memory === "string" && stored.memory.trim()
        ? stored.memory.slice(0, 572)
        : DEFAULT_MEMORY
  };
}

export async function savePreferences(preferences: Partial<StoredPreferences>): Promise<void> {
  await chrome.storage.local.set(preferences);
}

function sanitizeTheme(theme: unknown): ThemeName {
  return theme === "dark" || theme === "dark-sun" ? theme : "light";
}

export { DEFAULT_MEMORY };

function sanitizeLanguage(language: unknown): LanguageCode {
  return language === "pt-BR" ||
    language === "es" ||
    language === "ja" ||
    language === "fr" ||
    language === "de"
    ? language
    : "en";
}
