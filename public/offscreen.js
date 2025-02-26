let pollingInterval;

function checkClipboard() {
  //creates a textarea and pastes the clipboard content
  const textarea = document.createElement('textarea');
  document.body.appendChild(textarea);
  textarea.focus();
  //need to fix this. Especially if we want image support
  document.execCommand('paste');
  console.log(textarea.value);
  const clipboardText = textarea.value;
  document.body.removeChild(textarea);
  //notify service worker of clipboard data
  chrome.runtime.sendMessage({
    target: 'service-worker',
    action: 'CLIPBOARD_DATA',
    data: clipboardText
  });
}

//listen for messages from service worker to start monitoring
chrome.runtime.onMessage.addListener((message) => {
  if (message.target === 'offscreen') {
    if (message.action === 'START_MONITORING') {
      if (pollingInterval) clearInterval(pollingInterval);
      pollingInterval = setInterval(checkClipboard, 1000);
      checkClipboard();
    }
  }
});