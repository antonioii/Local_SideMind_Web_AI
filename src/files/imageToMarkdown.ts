import { recognizeImage } from "./ocrProcessor";
import type { FileContext, LanguageCode } from "../types";

export async function imageToMarkdown(
  file: File,
  language: LanguageCode,
  onStatus?: (status: string) => void
): Promise<FileContext> {
  const dimensions = await getImageDimensions(file);
  const sizeKb = Math.max(1, Math.round(file.size / 1024));
  const canRunOcr = supportsOcr(file);

  if (!canRunOcr) {
    return {
      markdown: [
        `## Attached image: ${file.name}`,
        `- Type: ${file.type || "unknown"}`,
        `- Size: ${sizeKb} KB`,
        `- Dimensions: ${dimensions.width}x${dimensions.height}`,
        "- OCR: unsupported image format for this build"
      ].join("\n"),
      metadata: {
        name: file.name,
        type: file.type || "unknown",
        size: file.size,
        width: dimensions.width,
        height: dimensions.height,
        ocr: false
      }
    };
  }

  onStatus?.(`Preparing OCR for ${file.name}`);
  const ocr = await recognizeImage(file, language, onStatus);
  const detectedText = ocr.text || "[No text detected]";

  return {
    markdown: [
      `## Attached image: ${file.name}`,
      `- Type: ${file.type || "unknown"}`,
      `- Size: ${sizeKb} KB`,
      `- Dimensions: ${dimensions.width}x${dimensions.height}`,
      `- OCR languages: ${ocr.languages.join(", ")}`,
      `- OCR confidence: ${ocr.confidence.toFixed(2)}`,
      "",
      "### OCR Text",
      detectedText
    ].join("\n"),
    metadata: {
      name: file.name,
      type: file.type || "unknown",
      size: file.size,
      width: dimensions.width,
      height: dimensions.height,
      ocr: true,
      ocrConfidence: Number(ocr.confidence.toFixed(2)),
      ocrLanguages: ocr.languages.join(",")
    }
  };
}

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(image.src);
    };
    image.onerror = () => resolve({ width: 0, height: 0 });
    image.src = URL.createObjectURL(file);
  });
}

function supportsOcr(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    file.type === "image/png" ||
    file.type === "image/jpeg" ||
    file.type === "image/webp" ||
    name.endsWith(".png") ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".webp")
  );
}
