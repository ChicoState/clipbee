let pollingInterval;
const POLLINGINTERVAL = 1000;

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

function copyToLocalClipboard(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

//listen for messages from service worker to start monitoring
chrome.runtime.onMessage.addListener((message) => {
  if (message.target === 'offscreen' && message.action === 'START_MONITORING') {
    if (pollingInterval) clearInterval(pollingInterval);
    pollingInterval = setInterval(checkClipboard, POLLINGINTERVAL);
    checkClipboard();
  }
  if (message.target === 'offscreen' && message.action === 'CONTEXT_MENU_ITEM_TO_CLIPBOARD') {
    copyToLocalClipboard(message.data);
  }
  if (message.target === 'offscreen' && message.action === 'COPY_TO_CLIPBOARD') {
    console.log("Copying favorite to clipboard:", message.data);
    copyToLocalClipboard(message.data);
  }
});
