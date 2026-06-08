export type ThemeName = "dark" | "light" | "dark-sun";

export type LanguageCode = "en" | "pt-BR" | "es" | "ja" | "fr" | "de";

export type ModelStatus = "working" | "available" | "unavailable" | "not installed" | "error";

export type ChatRole = "assistant" | "user" | "system";

export interface MessageRecord {
  id: string;
  role: ChatRole;
  text: string;
  createdAt: string;
}

export interface StoredPreferences {
  theme: ThemeName;
  language: LanguageCode;
  memory: string;
}

export interface PageContextPayload {
  title: string;
  url: string;
  text: string;
  headings: string[];
  links: string[];
}

export interface ContextChunk {
  id: string;
  heading: string;
  source: string;
  text: string;
  score: number;
}

export interface OptimizedContext {
  outline: string;
  summary: string;
  chunks: ContextChunk[];
}

export interface FileContext {
  markdown: string;
  metadata: Record<string, string | number | boolean>;
}
