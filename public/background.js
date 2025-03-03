let lastClipboardText = '';
let clipboardHistory = [];

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
  // Listen for messages
  chrome.runtime.onMessage.addListener((message) => {
    // handle clipboard data from offscreen document
    if (message.target === 'service-worker' && message.action === 'CLIPBOARD_DATA') {
      const clipboardText = message.data;
      if (clipboardText !== lastClipboardText) {
        lastClipboardText = clipboardText;
        clipboardHistory.push(clipboardText);
        console.log('Clipboard data changed:', clipboardText);
        //add firebase storage here i think
      }
      //send to react current
      chrome.runtime.sendMessage({ 
        type: 'CLIPBOARD_CURRENT', 
        data: clipboardText 
      });
      //send to react history
      chrome.runtime.sendMessage({ 
        type: 'CLIPBOARD_HISTORY', 
        data: clipboardHistory 
      });
    }
    // handle clear history from react
    if (message.target === 'service-worker' && message.action === 'CLEAR_HISTORY') {
      clipboardHistory = [];
      lastClipboardText = '';
      chrome.runtime.sendMessage({ type: 'CLIPBOARD_HISTORY', data: clipboardHistory });
    }
  });
}

//start monitoring on startup and install
chrome.runtime.onStartup.addListener(startClipboardMonitoring);
chrome.runtime.onInstalled.addListener(startClipboardMonitoring);
