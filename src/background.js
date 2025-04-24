import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebaseConfig.js";
//import { MessageCircleOff } from "lucide-react";
let clipboardHistory = {
  Default: [],
};

let activeFolder = "Default";

async function createOffscreenDocument() {
  if (await chrome.offscreen.hasDocument()) return;
  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['CLIPBOARD'],
    justification: 'Read clipboard content',
  });
}


function addClipboardData(clipboardText) {
  //folder integration
  if (!clipboardHistory[activeFolder]) {
    clipboardHistory[activeFolder] = [];
  }
  if (clipboardHistory[activeFolder].length === 0 || clipboardText !== clipboardHistory[activeFolder][0]) {
    clipboardHistory[activeFolder].unshift(clipboardText);
    console.log(`[${activeFolder}] Clipboard data changed: `, clipboardText);
  }
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
  chrome.runtime.onMessage.addListener((message) => {
    // handle clipboard data from offscreen document
    if (message.target === 'service-worker' && message.action === 'CLIPBOARD_DATA') {
      addClipboardData(message.data);
    }
    // handle clear history from react
    if (message.target === 'service-worker' && message.action === 'CLEAR_HISTORY') {
      clipboardHistory[activeFolder] = [];
      chrome.runtime.sendMessage({ type: 'CLIPBOARD_HISTORY', data: clipboardHistory[activeFolder] });
    }
    if (message.target === 'service-worker' && message.action === 'REMOVE_SINGLE_ITEM') {
      const index = clipboardHistory[activeFolder].indexOf(message.item);
      clipboardHistory[activeFolder].splice(index, 1);
      chrome.runtime.sendMessage({ type: 'CLIPBOARD_HISTORY', data: clipboardHistory[activeFolder] });
    }

    if (message.target === 'service-worker' && message.action === 'CLIPBOARD_HISTORY_REACT_LOAD') {
      chrome.runtime.sendMessage({ type: 'CLIPBOARD_HISTORY', data: clipboardHistory[activeFolder] });
    }
    //set the active Folder
    if (message.action === 'SET_ACTIVE_FOLDER') {
      activeFolder = message.folder;
      console.log(`Active folder set to: ${activeFolder}`);
      chrome.runtime.sendMessage({type:'CLIPBOARD_HISTORY',data: clipboardHistory[activeFolder] || [] }); 
    }
    // // Add a new folder
    if (message.action === 'ADD_FOLDER') {
      const folderName = message.folderName;
      if (!clipboardHistory[folderName]) {
        clipboardHistory[folderName] = [];
        console.log(`Folder created: ${folderName}`);
      }
      chrome.runtime.sendMessage({ type: 'FOLDER_UPDATE', folders: Object.keys(clipboardHistory)});
      createAllContextMenus();
    }
    // Get folders
    if (message.action === 'GET_FOLDERS') {
      const folderNames = Object.keys(clipboardHistory);
      chrome.runtime.sendMessage({ type: 'FOLDER_UPDATE', folders: folderNames, activeFolder:activeFolder});
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

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log("Message received in background:", message);
  
   if (message.target === 'service-worker') { 
    //Moved GET_FOLDERS to here for the sendResponse()
    if (message.action === 'GET_FOLDERS') {
      const folderNames = Object.keys(clipboardHistory);
      chrome.runtime.sendMessage({ type: 'FOLDER_UPDATE', folders: folderNames });
      sendResponse({
        success: true,
        folders: folderNames,
        //Tracking folders
        activeFolder: activeFolder
      });


      return true;
    }
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
    if (message.action === 'OPEN_SIDEPANEL') {
      try {
        // Re-register side panel path and enable it
        await chrome.sidePanel.setOptions({
          path: "sidepanel.html", 
          enabled: true
        });
        //await chrome.sidePanel.open({ windowId: message.windowId });
        console.log("Side panel opened");
      } catch (error) {
        console.error("Failed to open side panel:", error);
      }
    }
  }
});

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

chrome.contextMenus.onClicked.addListener((info, tab) => {
    activeFolder = info.menuItemId;
    console.log(info.selectionText);
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