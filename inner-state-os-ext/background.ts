// When user clicks the extension icon, send message to content script to toggle recording
chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id) {
    chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_ORB" })
  }
})
