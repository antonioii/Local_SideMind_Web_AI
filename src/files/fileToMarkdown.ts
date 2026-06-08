import mammoth from "mammoth/mammoth.browser";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import TurndownService from "turndown";
import type { FileContext } from "../types";

pdfjs.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL("pdf.worker.mjs");

const turndown = new TurndownService();

export async function fileToMarkdown(file: File): Promise<FileContext> {
  const lowerName = file.name.toLowerCase();

  if (isTextFile(lowerName, file.type)) {
    const content = await file.text();
    return wrapTextFile(file, content);
  }

  if (lowerName.endsWith(".html") || file.type === "text/html") {
    const content = await file.text();
    return {
      markdown: wrapFile(file, turndown.turndown(content)),
      metadata: { name: file.name, type: file.type || "text/html", size: file.size }
    };
  }

  if (lowerName.endsWith(".pdf") || file.type === "application/pdf") {
    return pdfToMarkdown(file);
  }

  if (lowerName.endsWith(".docx") || file.type.includes("wordprocessingml")) {
    return docxToMarkdown(file);
  }

  throw new Error(`Unsupported file type: ${file.name}`);
}

function isTextFile(name: string, mimeType: string): boolean {
  return (
    name.endsWith(".txt") ||
    name.endsWith(".md") ||
    name.endsWith(".json") ||
    name.endsWith(".csv") ||
    name.endsWith(".js") ||
    name.endsWith(".ts") ||
    name.endsWith(".py") ||
    name.endsWith(".css") ||
    mimeType.startsWith("text/")
  );
}

function wrapTextFile(file: File, content: string): FileContext {
  return {
    markdown: wrapFile(file, content),
    metadata: { name: file.name, type: file.type || "text/plain", size: file.size }
  };
}

function wrapFile(file: File, content: string): string {
  return [
    "# File",
    `Filename: ${file.name}`,
    `MIME Type: ${file.type || "unknown"}`,
    `Size: ${file.size} bytes`,
    "",
    content.trim()
  ].join("\n");
}

async function pdfToMarkdown(file: File): Promise<FileContext> {
  const buffer = await file.arrayBuffer();
  const document = await pdfjs.getDocument({ data: buffer }).promise;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    pages.push(`## Page ${pageNumber}\n${text}`);
  }

  return {
    markdown: wrapFile(file, pages.join("\n\n")),
    metadata: {
      name: file.name,
      type: file.type || "application/pdf",
      size: file.size,
      pages: document.numPages
    }
  };
}

async function docxToMarkdown(file: File): Promise<FileContext> {
  const buffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer: buffer });

  return {
    markdown: wrapFile(file, turndown.turndown(result.value)),
    metadata: {
      name: file.name,
      type: file.type || "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      size: file.size
    }
  };
}
