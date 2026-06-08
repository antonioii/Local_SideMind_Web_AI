chrome.runtime.onInstalled.addListener(async () => {
  await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

chrome.runtime.onStartup.addListener(async () => {
  await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "LOCAL_SIDEMIND_REQUEST_PAGE_CONTEXT") {
    return;
  }

  void handlePageContextRequest(sendResponse);
  return true;
});

async function handlePageContextRequest(
  sendResponse: (response?: unknown) => void
): Promise<void> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab?.id) {
      sendResponse({ ok: false, error: "No active tab available." });
      return;
    }

    const response = await requestPageContext(tab.id);

    sendResponse(response);
  } catch (error) {
    sendResponse({
      ok: false,
      error: error instanceof Error ? error.message : "Context request failed."
    });
  }
}

async function requestPageContext(tabId: number): Promise<unknown> {
  try {
    return await chrome.tabs.sendMessage(tabId, {
      type: "LOCAL_SIDEMIND_EXTRACT_PAGE"
    });
  } catch {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["content.js"]
    });

    return chrome.tabs.sendMessage(tabId, {
      type: "LOCAL_SIDEMIND_EXTRACT_PAGE"
    });
  }
}
