import type { PageContextPayload } from "../types";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "LOCAL_SIDEMIND_EXTRACT_PAGE") {
    return;
  }

  try {
    const payload: PageContextPayload = {
      title: document.title,
      url: location.href,
      text: sanitizeText(document.body?.innerText ?? ""),
      headings: Array.from(document.querySelectorAll("h1, h2, h3"))
        .map((node) => node.textContent?.trim() ?? "")
        .filter(Boolean)
        .slice(0, 20),
      links: Array.from(document.querySelectorAll("a[href]"))
        .map((node) => (node as HTMLAnchorElement).href)
        .filter(Boolean)
        .slice(0, 20)
    };

    sendResponse({ ok: true, payload });
  } catch (error) {
    sendResponse({
      ok: false,
      error: error instanceof Error ? error.message : "page extraction failed"
    });
  }
});

function sanitizeText(value: string): string {
  return value
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}
