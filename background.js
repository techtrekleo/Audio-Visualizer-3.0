// This script runs in the background and handles the extension's action.

// When the user clicks on the extension action icon.
chrome.action.onClicked.addListener((tab) => {
  // Define the URL of the page to open.
  const visualizerUrl = chrome.runtime.getURL('index.html');

  // Query for tabs with that URL.
  chrome.tabs.query({ url: visualizerUrl }, (tabs) => {
    if (tabs.length > 0) {
      // If a tab is already open, focus it and its window.
      chrome.tabs.update(tabs[0].id, { active: true });
      chrome.windows.update(tabs[0].windowId, { focused: true });
    } else {
      // Otherwise, create a new tab.
      chrome.tabs.create({ url: visualizerUrl });
    }
  });
});
