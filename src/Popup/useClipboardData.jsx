import { useEffect, useState } from 'react';

export const useClipboardData = () => {
  const [clipboardHistory, setClipboardHistory] = useState([]);
  const [clipboardPage, setClipboardPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [folders, setFolders] = useState(["Default", "Work"]);
  const [activeFolder, setActiveFolder] = useState("Default");

  useEffect(() => {
    chrome.runtime.sendMessage({ action: 'GET_FOLDERS' }, (response) => {
      if (!chrome.runtime.lastError) {
        setFolders(response.folders);
        setActiveFolder(response.activeFolder);
      }
    });

    const messageListener = (message) => {
      if (message.type === 'CLIPBOARD_HISTORY') setClipboardHistory(message.data);
      if (message.type === 'FOLDER_UPDATE') {
        setFolders(message.folders);
        setActiveFolder(message.activeFolder);
      };
    };
    chrome.runtime.onMessage.addListener(messageListener);
    return () => chrome.runtime.onMessage.removeListener(messageListener);
  }, []);

  const getFilteredSortedHistory = () => {
    const itemsWithIndex = clipboardHistory.map((item, index) => ({ item, index }));
    const items = itemsWithIndex.slice(1);
    const filteredWithIndex = items.filter(item =>
      item && item.item.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return sortOrder === 'newest' ? filteredWithIndex : filteredWithIndex.reverse();
  };

  const getHistoryItems = () => {
    if (clipboardHistory.length <= 1) return [];
    return clipboardHistory.slice(1);
  };

  return {
    clipboardHistory,
    clipboardPage,
    setClipboardPage,
    searchQuery,
    setSearchQuery,
    sortOrder,
    setSortOrder,
    folders,
    activeFolder,
    setActiveFolder,
    setFolders,
    setClipboardHistory,
    getFilteredSortedHistory,
    getHistoryItems,
  };
};
