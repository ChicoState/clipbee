let lastClipboardText = '';
const POLLING_INTERVAL = 1000; //1 second

async function createOffscreenDocument() {
  if (await chrome.offscreen.hasDocument()) return;
  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['CLIPBOARD'],
    justification: 'Read clipboard content',
  });
}

async function startClipboardMonitoring() {
  await createOffscreenDocument();
  // Send message to offscreen document to start monitoring
  chrome.runtime.sendMessage({ target: 'offscreen', action: 'START_MONITORING' });
  // Listen for messages from offscreen document
  chrome.runtime.onMessage.addListener((message) => {
    if (message.target === 'service-worker' && message.action === 'CLIPBOARD_DATA') {
      const clipboardText = message.data;
      if (clipboardText !== lastClipboardText) {
        lastClipboardText = clipboardText;
        //send to react
        chrome.runtime.sendMessage({ 
          type: 'CLIPBOARD_CHANGE', 
          data: clipboardText 
        });
        //add firebase storage here i think
      }
    }
  });
}

//start monitoring on startup and install
chrome.runtime.onStartup.addListener(startClipboardMonitoring);
chrome.runtime.onInstalled.addListener(startClipboardMonitoring);
