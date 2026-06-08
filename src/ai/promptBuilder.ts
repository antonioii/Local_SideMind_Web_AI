import type {
  FileContext,
  LanguageCode,
  MessageRecord,
  OptimizedContext,
  PageContextPayload
} from "../types";
import { wrapUntrustedPageContext } from "../safety/promptInjectionGuard";

export function buildPrompt(input: {
  language: LanguageCode;
  memory: string;
  messages: MessageRecord[];
  pageContext: PageContextPayload | null;
  pageOptimization: OptimizedContext | null;
  attachmentContexts: FileContext[];
  attachmentOptimizations: OptimizedContext[];
  userMessage: string;
  conversationSummary: string;
}): string {
  const recentMessages = input.messages
    .filter((message) => message.role !== "system")
    .slice(-6, -1)
    .map((message) => `${message.role}: ${message.text}`)
    .join("\n");
  const attachmentOutline = input.attachmentOptimizations
    .map((item, index) => `Attachment ${index + 1} outline:\n${item.outline}`)
    .join("\n\n");
  const attachmentChunks = input.attachmentOptimizations
    .flatMap((item) => item.chunks.slice(0, 2).map((chunk) => chunk.text))
    .join("\n\n");
  const attachmentNames = input.attachmentContexts
    .map((item, index) => {
      const name = String(item.metadata.name || `attachment-${index + 1}`);
      return `- ${name}`;
    })
    .join("\n");
  const attachmentBodies = input.attachmentContexts
    .map((item, index) => {
      const name = String(item.metadata.name || `attachment-${index + 1}`);
      const body = item.markdown.length <= 6000 ? item.markdown : item.markdown.slice(0, 6000);
      return `Attachment ${index + 1}: ${name}\n${body}`;
    })
    .join("\n\n");

  return [
    buildLanguageInstruction(input.language),
    "You are Local SideMind, a privacy-first local browser assistant.",
    "Never claim to have executed actions, clicked elements, or inspected images unless the app explicitly provides that evidence.",
    "Answer the latest user question once. Do not repeat greetings, do not echo previous messages, and do not invent page access you do not have.",
    "If the user asks for plain text, a snippet, a code block, or a copybox, provide it directly. Use fenced code blocks when the user explicitly asks for a copyable block.",
    "If attachments are present and the user asks about them, answer from the attachment contents directly instead of only describing metadata.",
    input.memory ? `User memory:\n${input.memory}` : "",
    input.conversationSummary ? `Conversation summary:\n${input.conversationSummary}` : "",
    input.pageContext
      ? "Page context status: loaded and available."
      : "Page context status: unavailable. This does not prevent you from analyzing attachments.",
    input.pageOptimization ? `Page outline:\n${input.pageOptimization.outline}` : "",
    input.pageOptimization
      ? `Relevant page chunks:\n${input.pageOptimization.chunks.map((chunk) => chunk.text).join("\n\n")}`
      : "",
    wrapUntrustedPageContext(input.pageContext),
    attachmentNames ? `Attachments loaded:\n${attachmentNames}` : "",
    attachmentOutline,
    attachmentChunks,
    attachmentBodies,
    recentMessages ? `Recent conversation:\n${recentMessages}` : "",
    `User question:\n${input.userMessage}`
  ]
    .filter(Boolean)
    .join("\n\n");
}

function buildLanguageInstruction(language: LanguageCode): string {
  switch (language) {
    case "pt-BR":
      return "Preferred response language: Brazilian Portuguese.";
    case "es":
      return "Preferred response language: Spanish.";
    case "ja":
      return "Preferred response language: Japanese.";
    case "fr":
      return "Preferred response language: French.";
    case "de":
      return "Preferred response language: German.";
    case "en":
    default:
      return "Preferred response language: English.";
  }
}
