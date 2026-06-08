import type { ModelStatus } from "../types";
import type { UiStrings } from "./i18n";

export function setEnvironmentStatus(text: string): void {
  const node = document.querySelector<HTMLElement>("#environment-status");
  if (node) {
    node.textContent = text;
  }
}

export function setModelName(text: string): void {
  const node = document.querySelector<HTMLElement>("#model-name");
  if (node) {
    node.textContent = text;
  }
}

export function setModelStatus(status: ModelStatus, strings: UiStrings, details = ""): void {
  const node = document.querySelector<HTMLElement>("#llm-status");
  const dot = document.querySelector<HTMLElement>("#llm-dot");

  const presentation = mapStatus(status, strings, details);

  if (node) {
    node.textContent = presentation.label;
  }

  if (dot) {
    dot.className = `status-dot ${presentation.className}`;
  }
}

function mapStatus(
  status: ModelStatus,
  strings: UiStrings,
  details: string
): { label: string; className: string } {
  if (status === "working") {
    return { label: strings.modelReady, className: "is-success" };
  }

  if (status === "available") {
    return { label: strings.modelReady, className: "is-success" };
  }

  if (status === "not installed") {
    return { label: strings.modelNotInstalled, className: "is-warning" };
  }

  if (status === "error") {
    return { label: strings.modelUnavailable, className: "is-danger" };
  }

  if (/install/i.test(details)) {
    return { label: strings.modelNotInstalled, className: "is-warning" };
  }

  return { label: strings.modelUnavailable, className: "is-danger" };
}
