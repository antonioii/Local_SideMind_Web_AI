import { optimizeContext } from "../ai/contextOptimizer";
import { getLanguageModelAvailability, sendPrompt } from "../ai/languageModelClient";
import { buildPrompt } from "../ai/promptBuilder";
import { fileToMarkdown } from "../files/fileToMarkdown";
import { imageToMarkdown } from "../files/imageToMarkdown";
import { terminateOcrWorker } from "../files/ocrProcessor";
import { loadPreferences, savePreferences } from "../storage/preferencesStore";
import type {
  FileContext,
  LanguageCode,
  MessageRecord,
  OptimizedContext,
  PageContextPayload,
  ThemeName
} from "../types";
import { renderMessages } from "../ui/chatRenderer";
import { getUiStrings, type UiStrings } from "../ui/i18n";
import { setEnvironmentStatus, setModelName, setModelStatus } from "../ui/statusBar";
import { applyTheme } from "../ui/themeManager";

let theme: ThemeName = "light";
let language: LanguageCode = "en";
let memory = "";
let pageContext: PageContextPayload | null = null;
let attachmentContexts: FileContext[] = [];
let conversationSummary = "";
let isBusy = false;
let trustState: "pending" | "denied" | "loaded" = "pending";
let ui = getUiStrings("en");
let latestModelStatus: "working" | "available" | "unavailable" | "not installed" | "error" =
  "unavailable";
let latestModelStatusDetails = "";
let messages: MessageRecord[] = [createMessage("assistant", ui.greeting)];

const themeSelect = document.querySelector<HTMLSelectElement>("#theme-select");
const languageSelect = document.querySelector<HTMLSelectElement>("#language-select");
const memoryToggle = document.querySelector<HTMLButtonElement>("#memory-toggle");
const memoryEditor = document.querySelector<HTMLElement>("#memory-editor");
const memoryInput = document.querySelector<HTMLTextAreaElement>("#memory-input");
const memoryCount = document.querySelector<HTMLElement>("#memory-count");
const memoryResume = document.querySelector<HTMLButtonElement>("#memory-resume");
const memorySave = document.querySelector<HTMLButtonElement>("#memory-save");
const memoryMinimize = document.querySelector<HTMLButtonElement>("#memory-minimize");
const trustButton = document.querySelector<HTMLButtonElement>("#trust-page");
const denyButton = document.querySelector<HTMLButtonElement>("#deny-page");
const notice = document.querySelector<HTMLElement>("#page-context-notice");
const attachmentInput = document.querySelector<HTMLInputElement>("#attachment-input");
const messageInput = document.querySelector<HTMLTextAreaElement>("#message-input");
const sendButton = document.querySelector<HTMLButtonElement>("#send-button");
const resetButton = document.querySelector<HTMLButtonElement>("#reset-button");
const copyButton = document.querySelector<HTMLButtonElement>("#copy-transcript");
const activityIndicator = document.querySelector<HTMLElement>("#activity-indicator");
const activityText = document.querySelector<HTMLElement>("#activity-text");
const interactionPanel = document.querySelector<HTMLElement>("#interaction-panel");
const trustGate = document.querySelector<HTMLElement>("#trust-prompt");
const trustGateSection = document.querySelector<HTMLElement>("#trust-gate");
const footerParagraphs = document.querySelectorAll<HTMLElement>(".app-footer p");
const themeLabel = document.querySelector<HTMLElement>(".header-controls .compact-field span");
const languageLabel = document.querySelector<HTMLElement>(".compact-field-small span");

void bootstrap();

async function bootstrap(): Promise<void> {
  const preferences = await loadPreferences();
  theme = preferences.theme;
  language = preferences.language;
  memory = preferences.memory;
  ui = getUiStrings(language);
  messages = [createMessage("assistant", ui.greeting)];
  renderMessages(messages);
  setModelName("Chrome Built-in AI");
  applyUiStrings();
  syncTrustUi();

  applyTheme(theme);
  syncThemeSelect();

  if (languageSelect) {
    languageSelect.value = language;
  }

  if (memoryInput) {
    memoryInput.value = memory;
    updateMemoryCount();
  }

  wireEvents();
  window.addEventListener("beforeunload", () => {
    void terminateOcrWorker();
  });
  setActivityState(false, ui.modelReady);

  const availability = await getLanguageModelAvailability();
  updateModelStatus(availability.status, availability.details);
}

function wireEvents(): void {
  themeSelect?.addEventListener("change", async () => {
    theme = (themeSelect.value as ThemeName) || "light";
    applyTheme(theme);
    await savePreferences({ theme });
  });

  languageSelect?.addEventListener("change", async () => {
    language = (languageSelect.value as LanguageCode) || "en";
    ui = getUiStrings(language);
    applyUiStrings();
    updateModelStatus(latestModelStatus, latestModelStatusDetails);
    await savePreferences({ language });
  });

  memoryToggle?.addEventListener("click", () => {
    memoryEditor?.classList.toggle("hidden");
  });

  memoryInput?.addEventListener("input", updateMemoryCount);

  memorySave?.addEventListener("click", async () => {
    memory = memoryInput?.value.slice(0, 572) ?? "";
    await savePreferences({ memory });
    memoryEditor?.classList.add("hidden");
  });

  memoryMinimize?.addEventListener("click", () => {
    memoryEditor?.classList.add("hidden");
  });

  memoryResume?.addEventListener("click", async () => {
    if (!memoryInput?.value.trim()) {
      return;
    }

    try {
      updateModelStatus("working", "condensing memory");
      const prompt = `Rewrite the following memory in concise English for an LLM context window. Keep it factual and under 572 characters.\n\n${memoryInput.value}`;
      const result = await sendPrompt(prompt, "en");
      memoryInput.value = result.trim().slice(0, 572);
      updateMemoryCount();
      updateModelStatus("available", "ready");
    } catch (error) {
      pushSystemMessage(error instanceof Error ? error.message : ui.memoryResumeFailed);
      updateModelStatus("error", "memory resume failed");
    }
  });

  trustButton?.addEventListener("click", () => void trustCurrentPage());
  denyButton?.addEventListener("click", () => {
    pageContext = null;
    trustState = "denied";
    showInteractionPanel();
    resetConversationWithGreeting(ui.greetingDenied);
    syncTrustUi();
    if (notice) {
      notice.textContent = "";
      notice.classList.add("hidden");
    }
  });

  attachmentInput?.addEventListener("change", () => void loadAttachments());
  sendButton?.addEventListener("click", () => void handleSend());
  resetButton?.addEventListener("click", () => resetSession());
  copyButton?.addEventListener("click", () => void copyTranscript());

  messageInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  });
}

async function trustCurrentPage(): Promise<void> {
  try {
    setActivityState(true, ui.loadingPage);
    pushSystemMessage(ui.loadingPage);
    const response = await chrome.runtime.sendMessage({
      type: "LOCAL_SIDEMIND_REQUEST_PAGE_CONTEXT"
    });
    if (!response?.ok) {
      throw new Error(response?.error || "Page context request failed.");
    }

    pageContext = response.payload as PageContextPayload;
    trustState = "loaded";
    showInteractionPanel();
    resetConversationWithGreeting(ui.greetingLoaded);
    syncTrustUi();
    if (notice) {
      notice.textContent = "";
      notice.classList.add("hidden");
    }
  } catch (error) {
    pageContext = null;
    showInteractionPanel();
    pushSystemMessage(error instanceof Error ? error.message : "Failed to load page context.");
  } finally {
    setActivityState(false, ui.modelReady);
  }
}

async function loadAttachments(): Promise<void> {
  const files = Array.from(attachmentInput?.files ?? []);
  if (files.length === 0) {
    return;
  }

  setActivityState(true, ui.loadingFile);

  for (const file of files) {
    try {
      let context: FileContext;
      if (file.type.startsWith("image/")) {
        pushSystemMessage(`${ui.processingImage}: ${file.name}`);
        context = await imageToMarkdown(file, language);
        pushSystemMessage(`${ui.imageReady}: ${file.name}`);
      } else {
        context = await fileToMarkdown(file);
      }

      attachmentContexts.push(context);
      pushSystemMessage(`${ui.attachedFile}: ${file.name}`);
    } catch (error) {
      pushSystemMessage(error instanceof Error ? error.message : `Failed to process ${file.name}`);
    }
  }

  if (attachmentInput) {
    attachmentInput.value = "";
  }

  setActivityState(false, ui.modelReady);
}

async function handleSend(): Promise<void> {
  const userMessage = messageInput?.value.trim() ?? "";
  if (!userMessage || isBusy) {
    return;
  }

  messages.push(createMessage("user", userMessage));
  renderMessages(messages);

  if (messageInput) {
    messageInput.value = "";
  }

  try {
    setActivityState(true, ui.loadingAnswer);
    updateModelStatus("working", "generating");
    const pageOptimization = pageContext
      ? optimizeContext("page", pageContext.text, userMessage, pageContext.title || "Page")
      : null;
    const attachmentOptimizations: OptimizedContext[] = attachmentContexts.map((item, index) =>
      optimizeContext(`attachment-${index + 1}`, item.markdown, userMessage, `Attachment ${index + 1}`)
    );

    const prompt = buildPrompt({
      language,
      memory,
      messages,
      pageContext,
      pageOptimization,
      attachmentContexts,
      attachmentOptimizations,
      userMessage,
      conversationSummary
    });

    const output = await sendPrompt(prompt, language);
    messages.push(createMessage("assistant", normalizeAssistantOutput(output)));
    conversationSummary = summarizeConversation();
    updateModelStatus("available", "ready");
  } catch (error) {
    messages.push(createMessage("system", error instanceof Error ? error.message : ui.promptFailed));
    updateModelStatus("error", "prompt failed");
  } finally {
    setActivityState(false, ui.modelReady);
  }

  renderMessages(messages);
}

async function copyTranscript(): Promise<void> {
  const content = [
    ui.transcriptPrefix,
    ...messages.map((message) => `${message.role}: ${message.text}`)
  ].join("\n\n");

  await navigator.clipboard.writeText(content);
  pushSystemMessage(ui.transcriptCopied);
}

function summarizeConversation(): string {
  const recent = messages
    .filter((message) => message.role !== "system")
    .slice(-4)
    .map((message) => `- ${message.role}: ${message.text.slice(0, 180)}`);
  return ["## Conversation summary", ...recent].join("\n");
}

function updateMemoryCount(): void {
  if (!memoryInput || !memoryCount) {
    return;
  }

  if (memoryInput.value.length > 572) {
    memoryInput.value = memoryInput.value.slice(0, 572);
  }
  memoryCount.textContent = `${memoryInput.value.length}/572`;
}

function syncThemeSelect(): void {
  if (themeSelect) {
    themeSelect.value = theme;
  }
}

function pushSystemMessage(text: string): void {
  messages.push(createMessage("system", text));
  renderMessages(messages);
}

function resetSession(): void {
  if (isBusy) {
    return;
  }

  pageContext = null;
  attachmentContexts = [];
  conversationSummary = "";
  const greeting =
    trustState === "loaded"
      ? ui.greetingLoaded
      : trustState === "denied"
        ? ui.greetingDenied
        : ui.greeting;
  messages = [createMessage("assistant", greeting)];

  if (attachmentInput) {
    attachmentInput.value = "";
  }
  if (messageInput) {
    messageInput.value = "";
  }
  if (notice) {
    notice.textContent = "";
    notice.classList.add("hidden");
  }

  setActivityState(false, ui.modelReady);
  pushSystemMessage(ui.sessionReset);
  renderMessages(messages);
}

function createMessage(role: MessageRecord["role"], text: string): MessageRecord {
  return {
    id: crypto.randomUUID(),
    role,
    text,
    createdAt: new Date().toISOString()
  };
}

function setActivityState(busy: boolean, text: string): void {
  isBusy = busy;
  if (activityIndicator) {
    activityIndicator.classList.toggle("is-busy", busy);
    activityIndicator.classList.toggle("is-idle", !busy);
  }
  if (activityText) {
    activityText.textContent = text;
  }
  if (sendButton) {
    sendButton.disabled = busy;
  }
}

function updateModelStatus(
  status: "working" | "available" | "unavailable" | "not installed" | "error",
  details = ""
): void {
  latestModelStatus = status;
  latestModelStatusDetails = details;
  setModelStatus(status, ui, details);
}

function applyUiStrings(): void {
  document.documentElement.lang = language;

  if (themeLabel) {
    themeLabel.textContent = ui.theme;
  }
  if (languageLabel) {
    languageLabel.textContent = ui.language;
  }
  if (memoryToggle) {
    memoryToggle.textContent = ui.memory;
  }
  if (memoryInput) {
    memoryInput.placeholder = ui.memoryPlaceholder;
  }
  if (memoryResume) {
    memoryResume.textContent = ui.resume;
  }
  if (memorySave) {
    memorySave.textContent = ui.save;
  }
  if (memoryMinimize) {
    memoryMinimize.textContent = ui.minimize;
  }
  if (trustGate) {
    trustGate.textContent = ui.trustPrompt;
  }
  if (trustButton) {
    trustButton.textContent = ui.trustAccept;
  }
  if (denyButton) {
    denyButton.textContent = ui.trustDeny;
  }
  if (resetButton) {
    resetButton.textContent = ui.reset;
  }
  if (copyButton) {
    copyButton.textContent = ui.copy;
  }
  if (sendButton) {
    sendButton.textContent = ui.send;
  }
  if (messageInput) {
    messageInput.placeholder = ui.messagePlaceholder;
  }
  const chatLog = document.querySelector<HTMLElement>("#chat-log");
  if (chatLog) {
    chatLog.dataset.copyLabel = ui.copy;
  }
  if (activityText) {
    activityText.textContent = isBusy ? activityText.textContent : ui.modelReady;
  }
  if (footerParagraphs[0]) {
    updateFooterBrand(footerParagraphs[0]);
  }
  if (footerParagraphs[1]) {
    footerParagraphs[1].textContent = ui.footerTip;
  }
  setEnvironmentStatus(ui.environmentStatus);
  updateThemeLabels();
  syncTrustUi();
}

function updateFooterBrand(footerBrand: HTMLElement): void {
  const copyrightText = `${ui.copyright} `;
  const firstNode = footerBrand.firstChild;

  if (firstNode?.nodeType === Node.TEXT_NODE) {
    firstNode.textContent = copyrightText;
    return;
  }

  footerBrand.insertBefore(document.createTextNode(copyrightText), footerBrand.firstChild);
}

function updateThemeLabels(): void {
  if (!themeSelect) {
    return;
  }

  const lightOption = themeSelect.querySelector<HTMLOptionElement>('option[value="light"]');
  const darkOption = themeSelect.querySelector<HTMLOptionElement>('option[value="dark"]');
  const darkSunOption = themeSelect.querySelector<HTMLOptionElement>('option[value="dark-sun"]');

  if (lightOption) {
    lightOption.textContent = ui.light;
  }
  if (darkOption) {
    darkOption.textContent = ui.dark;
  }
  if (darkSunOption) {
    darkSunOption.textContent = ui.darkSun;
  }
}

function syncTrustUi(): void {
  if (trustGateSection) {
    trustGateSection.classList.toggle("is-compact", trustState !== "pending");
  }
  if (trustButton) {
    trustButton.textContent = trustState === "pending" ? ui.trustAccept : ui.trustAcceptCompact;
  }
  if (denyButton) {
    denyButton.textContent = trustState === "pending" ? ui.trustDeny : ui.trustDenyCompact;
  }
}

function showInteractionPanel(): void {
  interactionPanel?.classList.remove("hidden");
}

function resetConversationWithGreeting(greeting: string): void {
  conversationSummary = "";
  messages = [createMessage("assistant", greeting)];
  renderMessages(messages);
}

function normalizeAssistantOutput(output: string): string {
  let text = output.trim();

  if (text.startsWith("{") && text.endsWith("}")) {
    text = text.slice(1, -1).trim();
  }

  const blocks = text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
  const unique: string[] = [];
  const seen = new Set<string>();

  for (const block of blocks) {
    const normalized = block.replace(/^\(|\)$/g, "").trim().toLowerCase();
    if (!seen.has(normalized)) {
      seen.add(normalized);
      unique.push(block.replace(/^\(|\)$/g, "").trim());
    }
  }

  return unique.join("\n\n");
}
