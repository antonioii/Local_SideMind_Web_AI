# Local SideMind Web AI

Local SideMind is a privacy-first Chrome side panel assistant powered by Chrome built-in AI when available. It can chat with the current page context and local files, including text files, Markdown, JSON, CSV, HTML, PDFs, DOCX files, and images through local OCR.

## Why this exists

Google has been building on-device AI capabilities into Chromium/Chrome. One example is Gemini Nano, a local language model that can run inside Chrome. Compatible browsers can answer language-model prompts locally instead of sending every prompt to an external AI service.

This capability is still developer-oriented. Depending on your Chrome version and platform, you may need a supported Chrome build, experimental flags, or origin-trial access before `LanguageModel` is available to extensions. Local SideMind wraps that lower-level browser interface in a practical Chrome side panel.

Official references:

- [Chrome built-in AI overview](https://developer.chrome.com/docs/ai/built-in)
- [Get started with built-in AI](https://developer.chrome.com/docs/ai/get-started)
- [Prompt API for extensions](https://developer.chrome.com/docs/extensions/ai/prompt-api)

## Features

- Chrome Manifest V3 extension with a side panel UI.
- Uses `window.LanguageModel` when Chrome exposes the built-in AI.
- Trust gate before loading current-page text into the model context.
- Prompt-injection guard for untrusted page content.
- Local file ingestion for text, Markdown, JSON, CSV, HTML, PDF, and DOCX (they all are converted to markdown and loaded in the current session).
- Local OCR for PNG, JPG, JPEG, and WEBP images using packaged Tesseract assets.
- Multilingual UI and response preference support: English, Portuguese, Spanish, Japanese, French, and German.
- Session reset, transcript copy, and short persistent memory.

## Requirements

- Node.js 18 or newer.
- npm.
- A Chromium-based browser that supports extension side panels.
- Chrome built-in AI / Prompt interface availability for model responses.

If the model status shows unavailable or not installed, the extension can load, but it cannot generate answers until the browser exposes the `LanguageModel` interface.

## Enable Chrome built-in AI

Chrome's Prompt interface uses Gemini Nano in the browser. The browser-facing interface is built into Chrome, while the model is downloaded separately and managed by Chrome when this local AI feature is used on a supported device.

For local development, enable the experimental flags documented by Chrome:

1. Open Chrome and go to `chrome://flags/#optimization-guide-on-device-model`.
2. Set **Enables Optimization Guide On Device Model** to **Enabled**.
3. Go to `chrome://flags/#prompt-api-for-gemini-nano`.
4. Set **Prompt API for Gemini Nano** to **Enabled** or **Enabled multilingual**, if available.
5. If your Chrome build exposes `chrome://flags/#prompt-api-for-gemini-nano-multimodal-input`, enable it as well.
6. Relaunch Chrome when prompted.

Some Chrome versions also expose an **AI models** or **Gemini Nano** setting under Chrome settings, often in the **System** section. If that option appears in your browser, turn it on and relaunch Chrome.

After setup, open the extension and check the model status. The first run may take time while Chrome downloads or prepares the local model.

## Build

```bash
npm install
npm run build
```

The build output is written to `dist/`.

## Load the extension locally

1. Build the project with `npm run build`.
2. Open `chrome://extensions`.
3. Enable Developer mode.
4. Click Load unpacked.
5. Select the generated `dist/` folder.
6. Click the Local SideMind toolbar icon to open the side panel.

## Development checks

```bash
npm run typecheck
npm run build
```

## Privacy notes

Local SideMind is designed around local processing. Page context is loaded only after the user chooses to trust the page, and local file/OCR extraction runs inside the extension. Model behavior still depends on Chrome's built-in AI implementation and browser availability.

The extension stores only user preferences and the short memory field in `chrome.storage.local`. Attachments, page context, and the active conversation are session-only.

## Chrome permissions

The extension requests side panel, active tab, storage, scripting, and tab permissions. It also declares broad host access so it can inject the content script into the active tab and extract page text after the user explicitly approves loading page context.

This broad permission model is convenient for local development, but it should be reviewed before Chrome Web Store submission. The current UI asks for trust before reading page content, and the prompt builder marks page text as untrusted context.

OCR worker and language assets are declared as web-accessible resources so the extension can load packaged Tesseract files at runtime. These files are not credentials or user data.

## Repository contents

- `src/` - TypeScript source code.
- `static/` - Manifest, HTML, and CSS copied into the extension build.
- `assets/` - Extension icons and OCR language data.
- `build.mjs` - esbuild-based extension build script.
- `dist/` - Generated build output, intentionally ignored by Git.

## Yet to be done

Before publishing to the Google Chrome Web Store, the extension manifest should be reviewed to reduce or harden broad permissions such as `<all_urls>`, `tabs`, and `scripting`.

Possible follow-up work:

- Revoke broad host access if the side panel flow can work with narrower permissions.
- Replace `<all_urls>` with a smaller permission model or optional host permissions.
- Add an extra security layer around script injection and page-context extraction.
- Review whether OCR web-accessible resources can be further restricted.
- Decide whether production builds should disable source maps to reduce package size.

## License

MIT
