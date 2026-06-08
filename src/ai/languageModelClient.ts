import type { LanguageCode, ModelStatus } from "../types";

declare global {
  interface Window {
    LanguageModel?: {
      availability?: () => Promise<unknown>;
      create?: (options?: Record<string, unknown>) => Promise<LanguageModelSession>;
    };
  }
}

interface LanguageModelSession {
  prompt?: (value: string) => Promise<string>;
  promptStreaming?: (value: string) => AsyncIterable<string>;
  destroy?: () => void;
}

export interface AvailabilityResult {
  status: ModelStatus;
  details: string;
}

export async function getLanguageModelAvailability(): Promise<AvailabilityResult> {
  if (!window.LanguageModel) {
    return { status: "unavailable", details: "API missing" };
  }

  try {
    const availability = await window.LanguageModel.availability?.();
    const normalized = String(availability ?? "available");

    if (/download|install/i.test(normalized)) {
      return { status: "not installed", details: normalized };
    }

    if (/unavailable|no/i.test(normalized)) {
      return { status: "unavailable", details: normalized };
    }

    return { status: "available", details: normalized };
  } catch (error) {
    return {
      status: "error",
      details: error instanceof Error ? error.message : "availability failed"
    };
  }
}

export async function sendPrompt(prompt: string, language: LanguageCode): Promise<string> {
  if (!window.LanguageModel?.create) {
    throw new Error("LanguageModel API is not available in this Chrome build.");
  }

  const session = await window.LanguageModel.create({
    expectedInputs: [{ type: "text" }],
    outputLanguage: language
  });

  try {
    if (session.prompt) {
      return await session.prompt(prompt);
    }

    if (session.promptStreaming) {
      let output = "";
      for await (const part of session.promptStreaming(prompt)) {
        output += part;
      }
      return output;
    }

    throw new Error("Prompt method is not supported by this LanguageModel session.");
  } finally {
    session.destroy?.();
  }
}
