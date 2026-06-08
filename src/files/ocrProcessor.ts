import type { LanguageCode } from "../types";

type TesseractModule = typeof import("tesseract.js");
type TesseractWorker = Awaited<ReturnType<TesseractModule["createWorker"]>>;

let modulePromise: Promise<TesseractModule> | null = null;
let workerPromise: Promise<TesseractWorker> | null = null;
let activeLanguageKey = "";

export interface OcrResult {
  text: string;
  confidence: number;
  languages: string[];
}

export async function recognizeImage(
  file: File,
  language: LanguageCode,
  onProgress?: (status: string) => void
): Promise<OcrResult> {
  const languages = mapLanguageToOcrSet(language);
  const worker = await getWorker(languages, onProgress);

  onProgress?.("Running OCR...");
  const result = await worker.recognize(file);

  return {
    text: cleanOcrText(result.data.text),
    confidence: Number.isFinite(result.data.confidence) ? result.data.confidence : 0,
    languages
  };
}

export async function terminateOcrWorker(): Promise<void> {
  if (!workerPromise) {
    return;
  }

  const worker = await workerPromise;
  await worker.terminate();
  workerPromise = null;
  activeLanguageKey = "";
}

async function getWorker(
  languages: string[],
  onProgress?: (status: string) => void
): Promise<TesseractWorker> {
  const languageKey = languages.join("+");

  if (!workerPromise) {
    workerPromise = createWorker(languages, onProgress);
    activeLanguageKey = languageKey;
    return workerPromise;
  }

  const worker = await workerPromise;
  if (activeLanguageKey !== languageKey) {
    onProgress?.(`Switching OCR language: ${languageKey}`);
    await worker.reinitialize(languageKey);
    activeLanguageKey = languageKey;
  }

  return worker;
}

async function createWorker(
  languages: string[],
  onProgress?: (status: string) => void
): Promise<TesseractWorker> {
  const createWorker = await loadCreateWorker();
  const languageKey = languages.join("+");

  onProgress?.(`Loading OCR language: ${languageKey}`);
  return createWorker(languageKey, 1, {
    workerPath: chrome.runtime.getURL("ocr/worker.min.js"),
    corePath: chrome.runtime.getURL("ocr/core"),
    langPath: chrome.runtime.getURL("ocr/lang"),
    workerBlobURL: false,
    cacheMethod: "none",
    logger: (message) => {
      if (message.status && typeof message.progress === "number") {
        const percent = Math.round(message.progress * 100);
        onProgress?.(`${message.status} ${percent}%`);
      }
    }
  });
}

function loadTesseractModule(): Promise<TesseractModule> {
  if (!modulePromise) {
    modulePromise = import("tesseract.js");
  }
  return modulePromise;
}

async function loadCreateWorker(): Promise<TesseractModule["createWorker"]> {
  const module = await loadTesseractModule();
  const candidate =
    module.createWorker ||
    (module as unknown as { default?: { createWorker?: TesseractModule["createWorker"] } }).default
      ?.createWorker;

  if (typeof candidate !== "function") {
    throw new Error("Tesseract createWorker is not available in this build.");
  }

  return candidate;
}

function mapLanguageToOcrSet(language: LanguageCode): string[] {
  switch (language) {
    case "pt-BR":
      return ["por", "eng"];
    case "es":
      return ["spa", "eng"];
    case "fr":
      return ["fra", "eng"];
    case "de":
      return ["deu", "eng"];
    case "ja":
      return ["jpn", "eng"];
    case "en":
    default:
      return ["eng"];
  }
}

function cleanOcrText(value: string): string {
  return value.replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim();
}
