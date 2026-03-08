chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "START_TAB_CAPTURE") {
    chrome.tabCapture.capture({ audio: true, video: false }, (stream) => {
      if (chrome.runtime.lastError || !stream) {
        sendResponse({ error: chrome.runtime.lastError?.message || "capture failed" })
        return
      }
      // Stream can't be passed directly across contexts
      // Pass stream ID back — content script reconstructs via MediaStream
      sendResponse({ streamId: (stream as any).id })
    })
    return true // keep message channel open for async response
  }
})
