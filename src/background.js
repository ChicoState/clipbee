import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebaseConfig.js";

//create clipboardHistory object
let clipboardHistory = {
  Default: [],
  Work: [],
};
let activeFolder = "Default";

//function to create offscreen document that can read clipboard
async function createOffscreenDocument() {
  if (await chrome.offscreen.hasDocument()) return;
  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['CLIPBOARD'],
    justification: 'Read clipboard content',
  });
}


function addClipboardData(clipboardText) {
  // adds clipboard Data to firebase
  //folder integration
  if (!clipboardHistory[activeFolder]) {
    clipboardHistory[activeFolder] = [];
  }
  if (clipboardHistory[activeFolder].length === 0 || clipboardText !== clipboardHistory[activeFolder][0]) {
    clipboardHistory[activeFolder].unshift(clipboardText);
    console.log(`[${activeFolder}] Clipboard data changed: `, clipboardText);
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
    data: clipboardHistory[activeFolder]
  });
}

async function startClipboardMonitoring() {
  await createOffscreenDocument();
  // Send message to offscreen document to start monitoring
  chrome.runtime.sendMessage({ target: 'offscreen', action: 'START_MONITORING' });
  // Listen for messages
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // handle clipboard data from offscreen document
    if (message.target === 'service-worker' && message.action === 'CLIPBOARD_DATA') {
      addClipboardData(message.data);
    }
    // handle clear history from react
    if (message.target === 'service-worker' && message.action === 'CLEAR_HISTORY') {
      clipboardHistory[activeFolder] = [];
      chrome.runtime.sendMessage({ type: 'CLIPBOARD_HISTORY', data: clipboardHistory[activeFolder] });
    }
    //remove single item from clipboard history
    if (message.target === 'service-worker' && message.action === 'REMOVE_SINGLE_ITEM') {
      console.log(message.data);
      clipboardHistory[activeFolder].splice(message.data.index, 1);
      chrome.runtime.sendMessage({ type: 'CLIPBOARD_HISTORY', data: clipboardHistory[activeFolder] });
    }
    //remove multiple items from clipboard history
    if (message.target === 'service-worker' && message.action === 'REMOVE_MULTIPLE_ITEMS') {
      const items = message.data;
      const indexesToRemove = items.map(item => item.index);
      const newClipboardHistory = [];
      for (let i = 0; i < clipboardHistory[activeFolder].length; i++) {
        if (!indexesToRemove.includes(i)) {
          newClipboardHistory.push(clipboardHistory[activeFolder][i]);
        }
      }
      clipboardHistory[activeFolder] = newClipboardHistory;
      chrome.runtime.sendMessage({ type: 'CLIPBOARD_HISTORY', data: clipboardHistory[activeFolder] });
    }
    // load clipboard history in react 
    if (message.target === 'service-worker' && message.action === 'CLIPBOARD_HISTORY_REACT_LOAD') {
      chrome.runtime.sendMessage({ type: 'CLIPBOARD_HISTORY', data: clipboardHistory[activeFolder] });
    }
    //set the active Folder
    if (message.action === 'SET_ACTIVE_FOLDER') {
      activeFolder = message.folder;
      console.log(`Active folder set to: ${activeFolder}`);
      chrome.runtime.sendMessage({ type: 'CLIPBOARD_HISTORY', data: clipboardHistory[activeFolder] });
    }
    // Add a new folder
    if (message.action === 'ADD_FOLDER') {
      const folderName = message.folderName;
      //add the folder
      if (!clipboardHistory[folderName]) {
        clipboardHistory[folderName] = [];
        console.log(`Folder created: ${folderName}`);
      }
      const folderNames = Object.keys(clipboardHistory);
      //trigger folder update
      chrome.runtime.sendMessage({ type: 'FOLDER_UPDATE', folders: folderNames, activeFolder: folderName });
      chrome.runtime.sendMessage({ type: 'CLIPBOARD_HISTORY', data: clipboardHistory[folderName] });
      createAllContextMenus();
    }
    // Get folders
    if (message.action === 'GET_FOLDERS') {
      const folderNames = Object.keys(clipboardHistory);
      chrome.runtime.sendMessage({ type: 'FOLDER_UPDATE', folders: folderNames, activeFolder: activeFolder });
      chrome.runtime.sendMessage({ type: 'CLIPBOARD_HISTORY', data: clipboardHistory[activeFolder] });
    }
    // Handle side panel open request
    if (message.target === 'service-worker' && message.action === 'OPEN_SIDEPANEL') {
      chrome.sidePanel.open({ windowId: message.windowId });
    }
    // Handle popup open request
    if (message.target === 'service-worker' && message.action === 'OPEN_POPUP') {
      chrome.action.openPopup();
    }

  });
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log("Message received in background:", message);
  if (message.action === 'CLOSE_SIDEPANEL') {
    try {
      // Disable side panel for the current window
      await chrome.sidePanel.setOptions({
        path: "sidepanel.html",
        enabled: false
      });
      console.log("Side panel closed");
    } catch (error) {
      console.error("Failed to close side panel:", error);
    }
  }
  if (message.action === 'OPEN_WINDOW') {
    try {
      await chrome.windows.create({
        url: chrome.runtime.getURL("sidepanel.html"),
        type: "popup",
        width: 400,
        height: 600,
        focused: true
      });
      console.log("Detached window opened");
    } catch (error) {
      console.error("Failed to open detached window:", error);
    }
  }
}
);

function createAllContextMenus() {
  chrome.contextMenus.removeAll();
  console.log(Object.keys(clipboardHistory));
  for (const key of Object.keys(clipboardHistory)) {
    chrome.contextMenus.create({
      id: key,
      title: `Add to Folder: ${key}`,
      contexts: ["all"]
    });
  }
}

// Set up side panel behavior when extension is installed
chrome.runtime.onInstalled.addListener(async () => {
  // Do not open side panel on action click - use popup instead
  await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
  createAllContextMenus();
  startClipboardMonitoring();
});

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener((info) => {
  activeFolder = info.menuItemId;
  addClipboardData(info.selectionText);
  chrome.runtime.sendMessage({
    target: 'offscreen',
    action: 'CONTEXT_MENU_ITEM_TO_CLIPBOARD',
    data: info.selectionText
  });
}
);

// Start monitoring on startup
chrome.runtime.onStartup.addListener(startClipboardMonitoring);