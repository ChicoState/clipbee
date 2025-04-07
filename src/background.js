import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebaseConfig.js";

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
      if (clipboardText !== clipboardHistory[0]) {
        clipboardHistory.unshift(clipboardText);
        console.log('Clipboard data changed:', clipboardText);
        //add firebase storage here i think
        addDoc(collection(db, "clipboardEntries"), {
          content: clipboardText,
          timestamp: serverTimestamp()
        })
        .then(docRef => {
          console.log("Document written with ID: ", docRef.id);
        })
        .catch(error => {
          console.error("Error adding document: ", error);
        });
      }
      //send to react history
      chrome.runtime.sendMessage({
        type: 'CLIPBOARD_HISTORY',
        data: clipboardHistory
      });
    }
    // handle clear history from react
    if (message.target === 'service-worker' && message.action === 'CLEAR_HISTORY') {
      clipboardHistory = [];
      chrome.runtime.sendMessage({ type: 'CLIPBOARD_HISTORY', data: clipboardHistory });
    }
    if (message.target === 'service-worker' && message.action === 'CLIPBOARD_HISTORY_REACT_LOAD') {
      chrome.runtime.sendMessage({ type: 'CLIPBOARD_HISTORY', data: clipboardHistory });
    }
    // Handle side panel open request
    if (message.target === 'service-worker' && message.action === 'OPEN_SIDEPANEL') {
      chrome.sidePanel.open({ windowId: message.windowId });
    }
    if (message.target === 'service-worker' && message.action === 'OPEN_POPUP') {
      chrome.action.openPopup();
    }
  });
}

// Set up side panel behavior when extension is installed
chrome.runtime.onInstalled.addListener(async () => {
  // Do not open side panel on action click - use popup instead
  await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
  startClipboardMonitoring();
});

// Start monitoring on startup
chrome.runtime.onStartup.addListener(startClipboardMonitoring);
