import type { MessageRecord } from "../types";

export function renderMessages(messages: MessageRecord[]): void {
  const host = document.querySelector<HTMLElement>("#chat-log");
  if (!host) {
    return;
  }

  host.innerHTML = "";
  for (const message of messages) {
    const container = document.createElement("article");
    container.className = `message ${message.role}`;

    const header = document.createElement("header");
    const role = document.createElement("strong");
    role.textContent = message.role;
    const stamp = document.createElement("span");
    stamp.textContent = new Date(message.createdAt).toLocaleTimeString();
    header.append(role, stamp);

    const body = document.createElement("div");
    body.className = "message-body";
    appendFormattedContent(body, message.text, host.dataset.copyLabel || "Copy");

    container.append(header, body);
    host.append(container);
  }

  host.scrollTop = host.scrollHeight;
}

function appendFormattedContent(host: HTMLElement, text: string, copyLabel: string): void {
  const segments = text.split(/```([\w-]*)\n([\s\S]*?)```/g);

  if (segments.length === 1) {
    const pre = document.createElement("pre");
    pre.textContent = text;
    host.append(pre);
    return;
  }

  for (let index = 0; index < segments.length; index += 1) {
    if (index % 3 === 0) {
      const plainText = segments[index]?.trim();
      if (!plainText) {
        continue;
      }
      const pre = document.createElement("pre");
      pre.textContent = plainText;
      host.append(pre);
      continue;
    }

    const language = segments[index];
    const code = segments[index + 1] ?? "";
    const box = document.createElement("section");
    box.className = "copybox";

    const toolbar = document.createElement("div");
    toolbar.className = "copybox-toolbar";

    const languageTag = document.createElement("span");
    languageTag.textContent = language || "text";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "copybox-button";
    button.textContent = copyLabel;
    button.addEventListener("click", async () => {
      await navigator.clipboard.writeText(code.trimEnd());
    });

    toolbar.append(languageTag, button);

    const pre = document.createElement("pre");
    pre.textContent = code.trimEnd();

    box.append(toolbar, pre);
    host.append(box);
    index += 1;
  }
}
